import { List, Map } from "immutable";
import {
    ADD_XML_FILE,
    SET_OUTPUT_PIPELINE,
    SET_PIPELINE,
    TOGGLE_PREVIEW,
    UPDATE_CORRECTIONS,
} from "../../src/actions.js";
import { createHandlers, MAX_XML_CHARS, stepFromPath } from "../../src/lib/webmcp/handlers.js";
import { createToolDefinitions } from "../../src/lib/webmcp/tools.js";
import { getModelContext, isWebMcpAvailable } from "../../src/lib/webmcp/detect.js";
import { isEadXmlString, rootElementLocalNameFromXmlString } from "../../src/lib/webmcp/ead-document.js";
import { createNavigationMirror, createPathnameTracker, pathnameFromTarget } from "../../src/lib/webmcp/pathname.js";
import { openWebmcpFilePicker, setWebmcpFilePicker } from "../../src/lib/webmcp/file-picker.js";
import { toolErr, toolOk, wrapExecute } from "../../src/lib/webmcp/result.js";

const parse = (value) => JSON.parse(value);

const MINIMAL_EAD = `<?xml version="1.0" encoding="UTF-8"?>
<ead>
  <eadheader>
    <eadid>TEST_IR</eadid>
    <filedesc><titlestmt><titleproper>IR de test</titleproper></titlestmt></filedesc>
  </eadheader>
  <archdesc level="fonds">
    <did><unittitle>Fonds test</unittitle></did>
    <dsc><c id="c1"><did><unittitle>Fiche</unittitle></did></c></dsc>
  </archdesc>
</ead>`;

const OTHER_EAD = `<?xml version="1.0" encoding="UTF-8"?>
<ead>
  <eadheader>
    <eadid>OTHER_IR</eadid>
    <filedesc><titlestmt><titleproper>Autre IR</titleproper></titlestmt></filedesc>
  </eadheader>
  <archdesc level="fonds">
    <did><unittitle>Autre fonds</unittitle></did>
  </archdesc>
</ead>`;

function createTestDeps(overrides) {
    let pathname = "/";
    let state = Map({
        xmlFiles: List(),
        pipeline: List(),
        outputPipeline: List(),
        corrections: Map(),
        previewEnabled: false,
        previewHash: null,
    });
    const dispatched = [];
    const downloads = [];
    const pickerCalls = [];

    const deps = {
        getState: () => state,
        dispatch: (action) => {
            dispatched.push(action);
            if (action.type === ADD_XML_FILE) {
                const isDuplicate = state
                    .get("xmlFiles")
                    .map((xmlFile) => xmlFile.get("hash"))
                    .includes(action.data.hash);
                if (!isDuplicate) {
                    state = state.update("xmlFiles", (xmlFiles) => xmlFiles.push(Map(action.data)));
                }
            } else if (action.type === SET_PIPELINE) {
                state = state.set("pipeline", action.data);
            } else if (action.type === SET_OUTPUT_PIPELINE) {
                state = state.set("outputPipeline", action.data);
            } else if (action.type === TOGGLE_PREVIEW) {
                state = state.set("previewEnabled", action.data);
            } else if (action.type === UPDATE_CORRECTIONS) {
                const rows = action.data || [];
                let corrections = state.get("corrections");
                rows.forEach((row) => {
                    if (!row || row.length < 3) return;
                    const tag = String(row[0]);
                    const term = String(row[2]);
                    if (!corrections.has(tag)) {
                        corrections = corrections.set(tag, Map());
                    }
                    corrections = corrections.setIn([tag, term], List([row[1]]));
                });
                state = state.set("corrections", corrections);
            }
        },
        navigate: (to) => {
            pathname = to;
        },
        getPathname: () => pathname,
        parseXml: async (name, content) => {
            if (String(content).indexOf("<not-xml") !== -1 || String(content).indexOf("INVALID_XML") !== -1) {
                throw new Error("XML invalide : test");
            }
            return {
                filename: name,
                encoding: "utf-8",
                doc: { tag: "fake-doc" },
                string: content,
                hash: "h:" + String(content).length + ":" + String(content).slice(0, 48),
                nbC: (String(content).match(/<c[\s>]/g) || []).length,
            };
        },
        processFile: (xmlFile) => {
            return String(xmlFile.get("string") || "").replace("Fiche", "Fiche-traitee");
        },
        downloadResults: () => {
            downloads.push(true);
        },
        openFilePicker: () => {
            pickerCalls.push(true);
            return {
                opened: true,
                method: "dropzone",
                warning: "geste utilisateur",
            };
        },
        ...overrides,
    };

    return { deps, getState: () => state, dispatched, downloads, pickerCalls, getPathname: () => pathname };
}

describe("WebMCP detect", () => {
    const originalDocument = global.document;

    afterEach(() => {
        global.document = originalDocument;
    });

    test("is a silent no-op when modelContext is missing", () => {
        global.document = undefined;
        expect(getModelContext()).toBeNull();
        expect(isWebMcpAvailable()).toBe(false);
    });

    test("detects document.modelContext.registerTool", () => {
        global.document = {
            modelContext: {
                registerTool: async () => {},
            },
        };
        expect(isWebMcpAvailable()).toBe(true);
        expect(getModelContext()).not.toBeNull();
    });
});

describe("WebMCP tool surface", () => {
    test("documents add_ead_content as the primary autonomous path", () => {
        const tools = createToolDefinitions(createHandlers(createTestDeps({}).deps));
        const names = tools.map((tool) => tool.name);
        expect(names).toEqual(
            expect.arrayContaining([
                "get_app_state",
                "add_ead_content",
                "add_ead_contents",
                "add_csv_content",
                "list_recipes",
                "list_loaded_files",
                "select_recipes",
                "set_recipe_params",
                "get_recipe_params",
                "run_selected_recipes",
                "get_diff_summary",
                "go_to_step",
                "download_results",
                "add_files_via_picker",
            ])
        );
        const addXml = tools.find((tool) => tool.name === "add_ead_content");
        const picker = tools.find((tool) => tool.name === "add_files_via_picker");
        const diff = tools.find((tool) => tool.name === "get_diff_summary");
        const download = tools.find((tool) => tool.name === "download_results");
        expect(addXml.description).toMatch(/Chemin principal/);
        expect(addXml.description).toMatch(/sélecteur/);
        expect(picker.description).toMatch(/Repli/);
        expect(names.indexOf("add_ead_content")).toBeLessThan(names.indexOf("add_files_via_picker"));
        expect(addXml.annotations.readOnlyHint).toBe(false);
        expect(diff.annotations.readOnlyHint).toBe(true);
        expect(diff.annotations.untrustedContentHint).toBe(true);
        expect(download.annotations.consequentialHint).toBe(true);
    });
});

describe("add_ead_content — primary XML-in-context path", () => {
    test("adds a single XML string via the same addXmlFile action as the UI", async () => {
        const { deps, dispatched, getState } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(
            await handlers.add_ead_content({
                name: "inventaire.xml",
                content: MINIMAL_EAD,
            })
        );
        expect(result.ok).toBe(true);
        expect(result.added).toHaveLength(1);
        expect(result.added[0].name).toEqual("inventaire.xml");
        expect(result.added[0].type).toEqual("xml-ead");
        expect(result.fileCount).toBe(1);
        expect(result.next).toEqual(["list_recipes", "select_recipes", "run_selected_recipes"]);
        expect(dispatched[0].type).toEqual(ADD_XML_FILE);
        expect(dispatched[0].data.filename).toEqual("inventaire.xml");
        expect(dispatched[0].data.string).toEqual(MINIMAL_EAD);
        expect(getState().get("xmlFiles").size).toBe(1);
    });

    test("adds several EAD files in one batch", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(
            await handlers.add_ead_contents({
                files: [
                    { name: "a.xml", content: MINIMAL_EAD },
                    { name: "b.xml", content: OTHER_EAD },
                ],
            })
        );
        expect(result.ok).toBe(true);
        expect(result.added).toHaveLength(2);
        expect(result.fileCount).toBe(2);
        const listed = parse(handlers.list_loaded_files());
        expect(listed.files.map((file) => file.name)).toEqual(["a.xml", "b.xml"]);
        expect(listed.files[0].id).toBeTruthy();
        expect(listed.files[0]).not.toHaveProperty("string");
        expect(listed.files[0]).not.toHaveProperty("content");
    });

    test("skips duplicate content", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        await handlers.add_ead_content({ name: "a.xml", content: MINIMAL_EAD });
        const result = parse(await handlers.add_ead_content({ name: "copy.xml", content: MINIMAL_EAD }));
        expect(result.ok).toBe(true);
        expect(result.added).toHaveLength(0);
        expect(result.skipped).toHaveLength(1);
        expect(result.skipped[0].reason).toMatch(/doublon/);
        expect(parse(handlers.list_loaded_files()).files).toHaveLength(1);
    });

    test("rejects missing content", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(await handlers.add_ead_content({ name: "a.xml" }));
        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/content XML manquant/);
    });

    test("rejects oversized XML and points to the picker as fallback", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(
            await handlers.add_ead_content({
                name: "huge.xml",
                content: "<ead>" + "x".repeat(MAX_XML_CHARS) + "</ead>",
            })
        );
        expect(result.ok).toBe(false);
        expect(result.error).toMatch(/add_files_via_picker/);
    });

    test("reports invalid XML without adding a file", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(
            await handlers.add_ead_content({
                name: "bad.xml",
                content: "INVALID_XML <not-xml",
            })
        );
        expect(result.ok).toBe(false);
        expect(result.failed[0].name).toEqual("bad.xml");
        expect(parse(handlers.list_loaded_files()).files).toHaveLength(0);
    });

    test("rejects non-EAD XML and does not label it xml-ead", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(
            await handlers.add_ead_content({
                name: "page.html",
                content: "<html><body>hello</body></html>",
            })
        );
        expect(result.ok).toBe(false);
        expect(JSON.stringify(result)).not.toMatch(/xml-ead/);
        expect(result.failed[0].error).toMatch(/pas un XML-EAD/);
        expect(result.failed[0].error).toMatch(/html/i);
        expect(parse(handlers.list_loaded_files()).files).toHaveLength(0);
    });

    test("accepts namespaced EAD root", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(
            await handlers.add_ead_content({
                name: "ns.xml",
                content: `<ead:ead xmlns:ead="urn:isbn:1-931666-22-9"><ead:eadheader><ead:eadid>NS</ead:eadid></ead:eadheader></ead:ead>`,
            })
        );
        expect(result.ok).toBe(true);
        expect(result.added[0].type).toEqual("xml-ead");
    });
});

describe("CSV, recipes, navigation, download", () => {
    test("add_csv_content loads controlaccess corrections", async () => {
        const { deps, dispatched } = createTestDeps();
        const handlers = createHandlers(deps);
        const csv = "controlaccess;valeur corrigée;valeur originale\npersname;Dupont;dupont\n";
        const result = parse(await handlers.add_csv_content({ name: "corr.csv", content: csv }));
        expect(result.ok).toBe(true);
        expect(result.rowCount).toBe(1);
        expect(result.hint).toMatch(/correction_controlaccess/);
        expect(dispatched[0].type).toEqual(UPDATE_CORRECTIONS);
    });

    test("happy path: XML strings → select recipes → run → diff → download (no picker)", async () => {
        const { deps, downloads, pickerCalls, getPathname } = createTestDeps();
        const handlers = createHandlers(deps);

        const added = parse(
            await handlers.add_ead_contents({
                files: [{ name: "inventaire.xml", content: MINIMAL_EAD }],
            })
        );
        expect(added.ok).toBe(true);

        const recipes = parse(handlers.list_recipes());
        expect(recipes.recipes.length).toBeGreaterThan(10);
        expect(recipes.recipes.find((recipe) => recipe.id === "supprimer_lb")).toBeTruthy();
        expect(recipes.recipes.find((recipe) => recipe.id === "pretty_print")).toBeTruthy();

        const selected = parse(
            await handlers.select_recipes({
                recipeIds: ["supprimer_lb", "pretty_print"],
                mode: "set",
            })
        );
        expect(selected.ok).toBe(true);
        expect(selected.selectedRecipeIds).toEqual(["supprimer_lb", "pretty_print"]);

        const listed = parse(handlers.list_recipes());
        expect(listed.recipes.find((recipe) => recipe.id === "supprimer_lb").selected).toBe(true);
        expect(listed.recipes.find((recipe) => recipe.id === "ajouter_level_file").selected).toBe(false);

        const run = parse(await handlers.run_selected_recipes());
        expect(run.ok).toBe(true);
        expect(run.step).toEqual("diff");
        expect(getPathname()).toEqual("/recettes");

        const appState = parse(handlers.get_app_state());
        expect(appState.step).toEqual("diff");
        expect(appState.fileCount).toBe(1);
        expect(appState.selectedRecipeIds).toEqual(["supprimer_lb", "pretty_print"]);

        const diff = parse(handlers.get_diff_summary({}));
        expect(diff.ok).toBe(true);
        expect(diff.excerptOriginal).toMatch(/Fiche/);
        expect(diff.excerptProcessed).toMatch(/Fiche-traitee/);
        expect(diff.recipesApplied).toEqual(["supprimer_lb", "pretty_print"]);

        const download = parse(await handlers.download_results());
        expect(download.ok).toBe(true);
        expect(downloads).toHaveLength(1);
        expect(pickerCalls).toHaveLength(0);
    });

    test("select_recipes add/remove and unknown ids", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        parse(await handlers.select_recipes({ recipeIds: ["supprimer_lb"], mode: "add" }));
        parse(await handlers.select_recipes({ recipeIds: ["supprimer_commentaire"], mode: "add" }));
        let selected = parse(handlers.get_app_state()).selectedRecipeIds;
        expect(selected).toEqual(["supprimer_lb", "supprimer_commentaire"]);
        parse(await handlers.select_recipes({ recipeIds: ["supprimer_lb"], mode: "remove" }));
        selected = parse(handlers.get_app_state()).selectedRecipeIds;
        expect(selected).toEqual(["supprimer_commentaire"]);
        const unknown = parse(await handlers.select_recipes({ recipeIds: ["not_a_recipe"], mode: "set" }));
        expect(unknown.ok).toBe(false);
        expect(unknown.unknownRecipeIds).toEqual(["not_a_recipe"]);
    });

    test("list_recipes and get_recipe_params expose the UI form schema", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const listed = parse(handlers.list_recipes());
        const publisher = listed.recipes.find((recipe) => recipe.id === "ecraser_publisher");
        const plain = listed.recipes.find((recipe) => recipe.id === "supprimer_lb");
        expect(publisher.hasParams).toBe(true);
        expect(publisher.params).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "publisher",
                    type: "string",
                    required: true,
                    label: "Publisher",
                    currentValue: "",
                }),
            ])
        );
        expect(plain.hasParams).toBe(false);

        const one = parse(handlers.get_recipe_params({ recipeId: "ajouter_persname_source" }));
        expect(one.ok).toBe(true);
        expect(one.params.map((param) => param.name)).toEqual(["role", "source"]);
        expect(one.params.find((param) => param.name === "source").required).toBe(true);
        expect(one.params.find((param) => param.name === "role").required).toBe(false);

        const dao = parse(handlers.get_recipe_params({ recipeId: "remplace_dao_href" }));
        expect(dao.params[0].type).toEqual("array");
        expect(dao.params[0].items.properties.rechercher).toBeTruthy();

        const all = parse(handlers.get_recipe_params({}));
        expect(all.recipes.length).toBeGreaterThan(5);
        expect(all.recipes.every((recipe) => recipe.params.length > 0)).toBe(true);
    });

    test("set_recipe_params writes the same pipeline args as the UI form", async () => {
        const { deps, getState } = createTestDeps();
        const handlers = createHandlers(deps);
        const noId = parse(await handlers.set_recipe_params({ params: { publisher: "AD" } }));
        expect(noId.ok).toBe(false);

        const noForm = parse(await handlers.set_recipe_params({ recipeId: "supprimer_lb", params: { foo: "x" } }));
        expect(noForm.ok).toBe(false);

        const emptyStillMissing = parse(
            await handlers.set_recipe_params({ recipeId: "ecraser_publisher", params: {} })
        );
        expect(emptyStillMissing.ok).toBe(true);
        expect(emptyStillMissing.missingRequiredParams[0].param).toEqual("publisher");

        const unknownKey = parse(
            await handlers.set_recipe_params({
                recipeId: "ecraser_publisher",
                params: { publisher: "AD", extra: "nope" },
            })
        );
        expect(unknownKey.ok).toBe(false);
        expect(unknownKey.unknownParams).toEqual(["extra"]);

        const wrongType = parse(
            await handlers.set_recipe_params({
                recipeId: "geogname_set_source",
                params: { source: 12 },
            })
        );
        expect(wrongType.ok).toBe(false);

        const set = parse(
            await handlers.set_recipe_params({
                recipeId: "ecraser_publisher",
                params: { publisher: "Archives départementales" },
            })
        );
        expect(set.ok).toBe(true);
        expect(set.selected).toBe(true);
        expect(set.params.find((param) => param.name === "publisher").currentValue).toEqual("Archives départementales");
        const stored = getState().get("pipeline").first();
        expect(stored.get("key")).toEqual("ecraser_publisher");
        expect(stored.get("args").get("publisher")).toEqual("Archives départementales");
    });

    test("select_recipes params + run_selected_recipes require filled form fields", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        await handlers.add_ead_content({ name: "a.xml", content: MINIMAL_EAD });

        const selectedEmpty = parse(await handlers.select_recipes({ recipeIds: ["ecraser_publisher"], mode: "set" }));
        expect(selectedEmpty.ok).toBe(true);
        expect(selectedEmpty.missingRequiredParams[0].param).toEqual("publisher");

        const blocked = parse(await handlers.run_selected_recipes());
        expect(blocked.ok).toBe(false);
        expect(blocked.missingRequiredParams[0].recipeId).toEqual("ecraser_publisher");

        const withParams = parse(
            await handlers.select_recipes({
                recipeIds: ["geogname_set_source", "transforme_daogrp_ligeo"],
                mode: "set",
                params: { geogname_set_source: { source: "GEO" } },
            })
        );
        expect(withParams.ok).toBe(true);
        expect(withParams.selectedRecipeParams.geogname_set_source.source).toEqual("GEO");
        expect(withParams.missingRequiredParams).toBeUndefined();

        const run = parse(await handlers.run_selected_recipes());
        expect(run.ok).toBe(true);
        expect(run.selectedRecipeParams.geogname_set_source.source).toEqual("GEO");
    });

    test("remplace_dao_href accepts search/replace pairs like the UI", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        const bad = parse(
            await handlers.set_recipe_params({
                recipeId: "remplace_dao_href",
                params: { remplacements: "not-an-array" },
            })
        );
        expect(bad.ok).toBe(false);
        const ok = parse(
            await handlers.set_recipe_params({
                recipeId: "remplace_dao_href",
                params: { remplacements: [{ rechercher: "old/", remplacer: "new/" }] },
            })
        );
        expect(ok.ok).toBe(true);
        expect(ok.params[0].currentValue).toEqual([{ rechercher: "old/", remplacer: "new/" }]);
    });

    test("select_recipes mode set preserves existing params for recipes that stay selected", async () => {
        const { deps, getState } = createTestDeps();
        const handlers = createHandlers(deps);
        await handlers.add_ead_content({ name: "a.xml", content: MINIMAL_EAD });
        parse(
            await handlers.set_recipe_params({
                recipeId: "ecraser_publisher",
                params: { publisher: "Archives du Test" },
            })
        );

        const reset = parse(
            await handlers.select_recipes({
                recipeIds: ["ecraser_publisher", "remplace_dao_href", "supprimer_lb"],
                mode: "set",
            })
        );
        expect(reset.ok).toBe(true);
        expect(reset.selectedRecipeIds).toEqual(["ecraser_publisher", "remplace_dao_href", "supprimer_lb"]);
        expect(reset.selectedRecipeParams.ecraser_publisher.publisher).toEqual("Archives du Test");
        expect(reset.selectedRecipeParams.remplace_dao_href.remplacements).toEqual([]);

        const pipeline = getState().get("pipeline");
        expect(pipeline.get(0).get("args").get("publisher")).toEqual("Archives du Test");
        expect(pipeline.get(1).get("args").get("remplacements")).toEqual([]);

        parse(
            await handlers.set_recipe_params({
                recipeId: "remplace_dao_href",
                params: { remplacements: [{ rechercher: "old/", remplacer: "new/" }] },
            })
        );
        const again = parse(
            await handlers.select_recipes({
                recipeIds: ["ecraser_publisher", "remplace_dao_href", "supprimer_lb"],
                mode: "set",
            })
        );
        expect(again.selectedRecipeParams.ecraser_publisher.publisher).toEqual("Archives du Test");
        expect(again.selectedRecipeParams.remplace_dao_href.remplacements).toEqual([
            { rechercher: "old/", remplacer: "new/" },
        ]);

        const dropped = parse(
            await handlers.select_recipes({
                recipeIds: ["supprimer_lb"],
                mode: "set",
            })
        );
        expect(dropped.selectedRecipeParams.ecraser_publisher).toBeUndefined();
        expect(dropped.selectedRecipeIds).toEqual(["supprimer_lb"]);
    });

    test("go_to_step only when valid", async () => {
        const { deps, getPathname } = createTestDeps();
        const handlers = createHandlers(deps);
        const blocked = parse(await handlers.go_to_step({ step: "recipes" }));
        expect(blocked.ok).toBe(false);
        expect(blocked.error).toMatch(/add_ead_content/);
        await handlers.add_ead_content({ name: "a.xml", content: MINIMAL_EAD });
        const moved = parse(await handlers.go_to_step({ step: "results" }));
        expect(moved.ok).toBe(true);
        expect(getPathname()).toEqual("/resultats");
        const stateAfter = parse(handlers.get_app_state());
        expect(stateAfter.step).toEqual("results");
        expect(stateAfter.path).toEqual("/resultats");
        const bogus = parse(await handlers.go_to_step({ step: "cuisine" }));
        expect(bogus.ok).toBe(false);
    });

    test("get_app_state after go_to_step sees the new step even if the router pathname is still stale", async () => {
        let routerPath = "/";
        const { deps } = createTestDeps({
            navigate: () => {
                /* React Router has not re-rendered yet */
            },
            getPathname: () => routerPath,
        });
        const handlers = createHandlers(deps);
        await handlers.add_ead_content({ name: "a.xml", content: MINIMAL_EAD });
        expect(parse(handlers.get_app_state()).step).toEqual("upload");

        const moved = parse(await handlers.go_to_step({ step: "recipes" }));
        expect(moved.ok).toBe(true);
        expect(moved.step).toEqual("recipes");
        expect(moved.path).toEqual("/recettes");
        expect(routerPath).toEqual("/");

        const appState = parse(handlers.get_app_state());
        expect(appState.step).toEqual("recipes");
        expect(appState.path).toEqual("/recettes");

        routerPath = "/recettes";
        expect(parse(handlers.get_app_state()).step).toEqual("recipes");

        routerPath = "/resultats";
        expect(parse(handlers.get_app_state()).step).toEqual("results");
        expect(parse(handlers.get_app_state()).path).toEqual("/resultats");
    });

    test("run_selected_recipes requires files and recipes", async () => {
        const { deps } = createTestDeps();
        const handlers = createHandlers(deps);
        expect(parse(await handlers.run_selected_recipes()).ok).toBe(false);
        await handlers.add_ead_content({ name: "a.xml", content: MINIMAL_EAD });
        expect(parse(await handlers.run_selected_recipes()).error).toMatch(/Aucune recette/);
    });

    test("add_files_via_picker is a collaborative fallback", async () => {
        const { deps, pickerCalls } = createTestDeps();
        const handlers = createHandlers(deps);
        const result = parse(await handlers.add_files_via_picker());
        expect(result.ok).toBe(true);
        expect(result.opened).toBe(true);
        expect(result.hint).toMatch(/add_ead_content/);
        expect(pickerCalls).toHaveLength(1);
    });
});

describe("helpers", () => {
    test("isEadXmlString accepts EAD roots and rejects HTML", () => {
        expect(isEadXmlString(MINIMAL_EAD)).toBe(true);
        expect(isEadXmlString(`<?xml version="1.0"?><ead xmlns:xlink="http://www.w3.org/1999/xlink"></ead>`)).toBe(
            true
        );
        expect(isEadXmlString(`<ead:ead xmlns:ead="urn:isbn:1-931666-22-9"></ead:ead>`)).toBe(true);
        expect(isEadXmlString("<html><body>hello</body></html>")).toBe(false);
        expect(isEadXmlString("<inventory><item>x</item></inventory>")).toBe(false);
        expect(rootElementLocalNameFromXmlString("<html><body>hello</body></html>")).toEqual("html");
    });

    test("pathname tracker and navigation mirror", () => {
        expect(pathnameFromTarget("/recettes?x=1#y")).toEqual("/recettes");
        const tracker = createPathnameTracker("/");
        const wrapped = tracker.wrapNavigate(() => {});
        wrapped("/recettes");
        expect(tracker.getPathname()).toEqual("/recettes");
        tracker.syncFromLocation("/resultats");
        expect(tracker.getPathname()).toEqual("/resultats");

        let live = "/";
        const mirror = createNavigationMirror(
            () => live,
            () => {}
        );
        mirror.navigate("/recettes");
        expect(mirror.getPathname()).toEqual("/recettes");
        live = "/recettes";
        expect(mirror.getPathname()).toEqual("/recettes");
        live = "/resultats";
        expect(mirror.getPathname()).toEqual("/resultats");
    });

    test("stepFromPath maps preview to diff", () => {
        expect(stepFromPath("/", false)).toEqual("upload");
        expect(stepFromPath("/upload", false)).toEqual("upload");
        expect(stepFromPath("/recettes", false)).toEqual("recipes");
        expect(stepFromPath("/recettes", true)).toEqual("diff");
        expect(stepFromPath("/resultats", false)).toEqual("results");
    });

    test("toolOk / toolErr / wrapExecute", async () => {
        expect(parse(toolOk({ a: 1 }))).toEqual({ ok: true, a: 1 });
        expect(parse(toolErr("nope", { code: "X" }))).toEqual({ ok: false, error: "nope", code: "X" });
        const ok = wrapExecute(() => toolOk({ done: true }));
        expect(parse(await ok({}))).toEqual({ ok: true, done: true });
        const failing = wrapExecute(() => {
            throw new Error("boom");
        });
        expect(parse(await failing({}))).toEqual({ ok: false, error: "boom" });
    });

    test("file picker no-ops when nothing is registered", () => {
        setWebmcpFilePicker(null);
        const result = openWebmcpFilePicker();
        expect(result.opened).toBe(false);
        expect(result.warning).toMatch(/add_ead_content/);
        let called = false;
        setWebmcpFilePicker(() => {
            called = true;
        });
        expect(openWebmcpFilePicker().opened).toBe(true);
        expect(called).toBe(true);
        setWebmcpFilePicker(null);
    });
});
