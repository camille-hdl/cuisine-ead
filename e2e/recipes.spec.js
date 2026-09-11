/* eslint-disable */
const { test, expect, savePageCoverage } = require("./support/test");
const { loadRecipeHooks, fixturePath } = require("./support/app");
const fs = require("fs");

test.describe.configure({ mode: "serial" });

test.describe("Recipe unit test", () => {
    /** @type {import("@playwright/test").Page} */
    let page;
    let xmlString = "";

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        xmlString = fs.readFileSync(fixturePath("example-ffas.xml"), "utf8");
        await loadRecipeHooks(page);
    });

    test.afterAll(async () => {
        if (page) {
            await savePageCoverage(page, "recipes-shared");
            await page.close();
        }
    });

    /**
     * Runs `fn` in the browser against a fresh Document parsed from the fixture.
     * `fn` must be self-contained (Playwright serializes it); use window.__E2E_*.
     */
    function run(fn) {
        return page.evaluate(fn, xmlString);
    }

    test("supprimerCId", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = xpathFilter(doc, "//c[@id]").length;
            doc = window.__E2E_recipes.supprimer_c_id()(doc);
            return { before, after: xpathFilter(doc, "//c[@id]").length };
        });
        expect(result.before).toBeGreaterThan(0);
        expect(result.after).toBe(0);
    });

    test("geognameSetSource", async () => {
        const result = await run((xml) => {
            const value = "CYPRESS";
            const xpathExpr = '//controlaccess/geogname[@source="' + value + '"]';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr).length;
            doc = window.__E2E_recipes.geogname_set_source(IMap({ source: value }))(doc);
            return { before, after: xpathFilter(doc, xpathExpr).length };
        });
        expect(result.before).toBe(0);
        expect(result.after).toBeGreaterThan(0);
    });

    test("remplacePlageSeparatorStrict", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = {
                fonds: xpathFilter(doc, '//unitid[@data-cy="range-fonds"]')[0].textContent.trim(),
                souslevel: xpathFilter(doc, '//unitid[@data-cy="range-souslevel"]')[0].textContent.trim(),
                branche: xpathFilter(doc, '//c[@data-cy="c-branche"]/did/unitid')[0].textContent.trim(),
            };
            doc = window.__E2E_recipes.remplace_plage_separator_strict()(doc);
            return {
                before,
                after: {
                    fonds: xpathFilter(doc, '//unitid[@data-cy="range-fonds"]')[0].textContent.trim(),
                    souslevel: xpathFilter(doc, '//unitid[@data-cy="range-souslevel"]')[0].textContent.trim(),
                    branche: xpathFilter(doc, '//c[@data-cy="c-branche"]/did/unitid')[0].textContent.trim(),
                },
            };
        });
        expect(result.before.fonds).toBe("8 U 1-256");
        expect(result.before.souslevel).toBe("8 U 1-12");
        expect(result.before.branche).toBe("8 U 1-17");
        expect(result.after.fonds).toBe("8 U 1 à 256");
        expect(result.after.souslevel).toBe("8 U 1 à 12");
        expect(result.after.branche).toBe("8 U 1 à 17");
    });

    test("ajouterPersnameSource", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//controlaccess/persname[@role="notaire"][@source="CYPRESS"]';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr).length;
            doc = window.__E2E_recipes.ajouter_persname_source(IMap({ role: "notaire", source: "CYPRESS" }))(doc);
            return { before, after: xpathFilter(doc, xpathExpr).length };
        });
        expect(result.before).toBe(0);
        expect(result.after).toBeGreaterThan(0);
    });

    test("ajouterAltRenderForce", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const beforeBranche = xpathFilter(doc, '//c[@data-cy="c-branche"]')[0].hasAttribute("altrender");
            const beforeArticle = xpathFilter(doc, '//c[@data-cy="c-article"]')[0].hasAttribute("altrender");
            doc = window.__E2E_recipes.ajouter_altrender_force()(doc);
            return {
                beforeBranche,
                beforeArticle,
                afterBranche: xpathFilter(doc, '//c[@data-cy="c-branche"]')[0].getAttribute("altrender"),
                afterArticle: xpathFilter(doc, '//c[@data-cy="c-article"]')[0].getAttribute("altrender"),
            };
        });
        expect(result.beforeBranche).toBe(false);
        expect(result.beforeArticle).toBe(false);
        expect(result.afterBranche).toBe("ligeo-branche-standardisadg");
        expect(result.afterArticle).toBe("ligeo-article-standardisadg");
    });

    test("ajouterTypologieArticle", async () => {
        const result = await run((xml) => {
            const value = "CYPRESS";
            const xpathExpr = '//c/controlaccess/genreform[@source="typologie"]';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr).length;
            doc = window.__E2E_recipes.ajouter_typologie_article(IMap({ valeur: value }))(doc);
            return { before, after: xpathFilter(doc, xpathExpr).length };
        });
        expect(result.before).toBe(0);
        expect(result.after).toBeGreaterThan(0);
    });

    test("ajouterAccessrestrictLigeo", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//c/accessrestrict[@type="incommunicable"][@id="ligeo-223"]';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = xpathFilter(doc, xpathExpr).length;
            doc = window.__E2E_recipes.ajouter_accessrestrict_ligeo()(doc);
            const matchesAfter = xpathFilter(doc, xpathExpr);
            return { before, after: matchesAfter.length, text: matchesAfter[0] && matchesAfter[0].textContent };
        });
        expect(result.before).toBe(0);
        expect(result.after).toBeGreaterThan(0);
        expect(result.text).toBe("Document numérisé");
    });

    test("transformeDaogrp - default", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//daogrp[@data-cy="daogrp-default"]';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr).length;
            doc = window.__E2E_recipes.transforme_daogrp_ligeo(IMap({ prefix: "Serie_U" }))(doc);
            const matchesAfter = xpathFilter(doc, xpathExpr);
            const elem = matchesAfter[0];
            return {
                before,
                after: matchesAfter.length,
                type: elem.getAttribute("type"),
                dossier: xpathFilter(doc, elem, 'daoloc[@role="dossier"]')[0].getAttribute("href"),
                prefixe: xpathFilter(doc, elem, 'daoloc[@role="prefixe"]')[0].getAttribute("href"),
                exception: xpathFilter(doc, elem, 'daoloc[@role="exception"]')[0].getAttribute("href"),
                extension: xpathFilter(doc, elem, 'daoloc[@role="extension"]')[0].getAttribute("href"),
            };
        });
        expect(result.before).toBe(1);
        expect(result.after).toBe(1);
        expect(result.type).toBe("link");
        expect(result.dossier).toBe("/Serie_U/8U/FRAD007_8U1/");
        expect(result.prefixe).toBe("FRAD007_8U1_");
        expect(result.exception).toBe("0000");
        expect(result.extension).toBe("jpg");
    });

    test("transformeDaogrp - series", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//daogrp[@data-cy="daogrp-series"]';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr).length;
            doc = window.__E2E_recipes.transforme_daogrp_ligeo(IMap({ prefix: null }))(doc);
            const matchesAfter = xpathFilter(doc, xpathExpr);
            const elem = matchesAfter[0];
            return {
                before,
                after: matchesAfter.length,
                type: elem.getAttribute("type"),
                dossier: xpathFilter(doc, elem, 'daoloc[@role="dossier"]')[0].getAttribute("href"),
                prefixe: xpathFilter(doc, elem, 'daoloc[@role="prefixe"]')[0].getAttribute("href"),
                premier: xpathFilter(doc, elem, 'daoloc[@role="premier"]')[0].getAttribute("href"),
                dernier: xpathFilter(doc, elem, 'daoloc[@role="dernier"]')[0].getAttribute("href"),
                exception: xpathFilter(doc, elem, 'daoloc[@role="exception"]')[0].getAttribute("href"),
                extension: xpathFilter(doc, elem, 'daoloc[@role="extension"]')[0].getAttribute("href"),
            };
        });
        expect(result.before).toBe(1);
        expect(result.after).toBe(1);
        expect(result.type).toBe("link");
        expect(result.dossier).toBe("/Serie_W/2246W/FRAD007_2246W425/");
        expect(result.prefixe).toBe("FRAD007_2246W425_");
        expect(result.premier).toBe("0003");
        expect(result.dernier).toBe("0003");
        expect(result.exception).toBe("0000");
        expect(result.extension).toBe("jpg");
    });

    test("nettoyerOtherfindaidList", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const textNodes = (d) =>
                xpathFilter(d, "//otherfindaid/text()").filter((node) => node.data.trim() !== "");
            const before = {
                lists: xpathFilter(doc, "//otherfindaid/list").length,
                child: xpathFilter(doc, '//archref[@data-cy="otherfindaid-child"]').length,
                texts: textNodes(doc).length,
            };
            doc = window.__E2E_recipes.nettoyer_otherfindaid_list()(doc);
            const afterTexts = textNodes(doc);
            return {
                before,
                after: {
                    lists: xpathFilter(doc, "//otherfindaid/list").length,
                    child: xpathFilter(doc, '//archref[@data-cy="otherfindaid-child"]').length,
                    texts: afterTexts.length,
                    first: afterTexts[0] && afterTexts[0].data,
                },
            };
        });
        expect(result.before.lists).toBe(2);
        expect(result.before.child).toBe(1);
        expect(result.before.texts).toBe(0);
        expect(result.after.lists).toBe(0);
        expect(result.after.child).toBe(1);
        expect(result.after.texts).toBe(2);
        expect(result.after.first).toBe("A");
    });

    test("originationFromUnittitle", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//did[@data-cy="test-origination"]/origination';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr).length;
            doc = window.__E2E_recipes.origination_from_unittitle(IMap({ titre: "Bonautrenom EMILE Henri." }))(doc);
            const after = xpathFilter(doc, xpathExpr);
            return { before, after: after.length, text: after[0] && after[0].textContent };
        });
        expect(result.before).toBe(0);
        expect(result.after).toBe(1);
        expect(result.text).toBe("Bonautrenom Emile Henri.");
    });

    test("originationFromUnittitle - existing origination", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//did[@data-cy="test-origination-2"]/origination';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr);
            const beforeChildren = before[0].childNodes.length;
            doc = window.__E2E_recipes.origination_from_unittitle(IMap({ titre: "Chnom Albert Jean François." }))(doc);
            const after = xpathFilter(doc, xpathExpr);
            return {
                beforeCount: before.length,
                beforeChildren,
                afterCount: after.length,
                afterChildren: after[0].childNodes.length,
                secondText: after[0].childNodes[1] && after[0].childNodes[1].textContent,
            };
        });
        expect(result.beforeCount).toBe(1);
        expect(result.beforeChildren).toBe(1);
        expect(result.afterCount).toBe(1);
        expect(result.afterChildren).toBe(2);
        expect(result.secondText).toBe("Chnom Albert Jean François.");
    });

    test("genreformFromUnittitle", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = {
                parent: xpathFilter(doc, '//c[@data-cy="test-genreform"]/controlaccess/genreform').length,
                child: xpathFilter(doc, '//c[@data-cy="test-genreform"]/c/controlaccess/genreform').length,
                control: xpathFilter(doc, '//c[@data-cy="c-branche"]/controlaccess/genreform').length,
            };
            doc = window.__E2E_recipes.genreform_from_unittitle(
                IMap({ titre: "Tables décennales|Etat civil", type: "Type de document" })
            )(doc);
            const after = xpathFilter(doc, '//c[@data-cy="test-genreform"]/controlaccess/genreform');
            return {
                before,
                afterParent: after.length,
                text: after[0] && after[0].textContent,
                type: after[0] && after[0].getAttribute("type"),
                afterChild: xpathFilter(doc, '//c[@data-cy="test-genreform"]/c/controlaccess/genreform').length,
                afterControl: xpathFilter(doc, '//c[@data-cy="c-branche"]/controlaccess/genreform').length,
            };
        });
        expect(result.before.parent).toBe(0);
        expect(result.before.child).toBe(0);
        expect(result.before.control).toBe(0);
        expect(result.afterParent).toBe(1);
        expect(result.text).toBe("Tables décennales");
        expect(result.type).toBe("Type de document");
        expect(result.afterChild).toBe(0);
        expect(result.afterControl).toBe(0);
    });

    test("genreformFromUnittitleMulti", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//c[@data-cy="test-type-actes"]/controlaccess/genreform';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const before = xpathFilter(doc, xpathExpr).length;
            const titres = "Baptêmes|Naissances|mariages|sépultures|Décès|Publications de mariages";
            doc = window.__E2E_recipes.index_from_unittitle_multi(
                IMap({ titres: titres, type: "Type d'acte", separateurs: ",|et", index: "genreform" })
            )(doc);
            const after = xpathFilter(doc, xpathExpr);
            return {
                before,
                after: after.length,
                texts: after.map((el) => el.textContent),
                type: after[0] && after[0].getAttribute("type"),
            };
        });
        expect(result.before).toBe(0);
        expect(result.after).toBe(3);
        expect(result.texts[0]).toBe("Naissances");
        expect(result.texts[1]).toBe("Mariages");
        expect(result.texts[2]).toBe("Décès");
        expect(result.type).toBe("Type d'acte");
    });

    test("copierTitleproperDansUnititle", async () => {
        const result = await run((xml) => {
            const xpathExpr = "/ead/archdesc/did/unittitle";
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = xpathFilter(doc, xpathExpr)[0].textContent;
            doc = window.__E2E_recipes.copier_titleproper_dans_unittitle()(doc);
            return { before, after: xpathFilter(doc, xpathExpr)[0].textContent };
        });
        expect(result.before).toBe(
            "Répertoires de notaires en provenance du tribunal de première instance de Commune."
        );
        expect(result.after).toBe("XX");
    });

    test("sortirScopecontentDid", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = xpathFilter(doc, "//did/scopecontent").length;
            doc = window.__E2E_recipes.sortir_scopecontent_did()(doc);
            const scopecontent = xpathFilter(doc, "//archdesc/scopecontent")[0];
            const archdesc = xpathFilter(doc, "//archdesc")[0];
            const did = xpathFilter(doc, "//archdesc/did")[0];
            return {
                before,
                after: xpathFilter(doc, "//did/scopecontent").length,
                parentIsArchdesc: scopecontent.parentNode === archdesc,
                nextSiblingIsScopecontent: did.nextSibling === scopecontent,
            };
        });
        expect(result.before).toBe(1);
        expect(result.after).toBe(0);
        expect(result.parentIsArchdesc).toBe(true);
        expect(result.nextSiblingIsScopecontent).toBe(true);
    });

    test("idFromUnittitle", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = xpathFilter(doc, "//c[not(@id)]").length;
            doc = window.__E2E_recipes.id_from_unittitle()(doc);
            return {
                before,
                after: xpathFilter(doc, "//c[not(@id)]").length,
                child0: xpathFilter(doc, '//c[@id="ctestchild-0"]').length,
                child1: xpathFilter(doc, '//c[@id="ctestchild-1"]').length,
                child2: xpathFilter(doc, '//c[@id="ctestchild-2"]').length,
                parent0: xpathFilter(doc, '//c[@id="ctestparentid-0"]').length,
            };
        });
        expect(result.before).toBe(3);
        expect(result.after).toBe(0);
        expect(result.child0).toBe(1);
        expect(result.child1).toBe(1);
        expect(result.child2).toBe(0);
        expect(result.parent0).toBe(1);
    });

    test("extraire_dao_daodesc", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = xpathFilter(doc, "//daogrp/daodesc/daoloc").length;
            doc = window.__E2E_recipes.extraire_dao_daodesc()(doc);
            return {
                before,
                after: xpathFilter(doc, "//daogrp/daodesc/daoloc").length,
                placed: xpathFilter(doc, '//daogrp[@id="test-daogrp-daodesc"]/daoloc').length,
                description: xpathFilter(doc, '//daogrp[@id="test-daogrp-daodesc"]/daodesc/p').length,
            };
        });
        expect(result.before).toBe(2);
        expect(result.after).toBe(0);
        expect(result.placed).toBe(2);
        expect(result.description).toBe(1);
    });

    test("remplace_dao_href", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const test1 = xpathFilter(doc, '//*[@id="test-replace"]')[0];
            const test2 = xpathFilter(doc, '//*[@id="test-replace-2"]')[0];
            const before = {
                href1: test1.getAttribute("href"),
                href2: test2.getAttribute("href"),
            };
            doc = window.__E2E_recipes.remplace_dao_href(
                window.__E2E_immutable.Map({
                    remplacements: [
                        { rechercher: "G:\\\\Archives\\\\FONDS NUMERISES\\\\19Fi\\\\", remplacer: "19Fo_consultation/" },
                        { rechercher: "[0-9]", remplacer: "🪐" },
                    ],
                })
            )(doc);
            return {
                before,
                after: {
                    href1: test1.getAttribute("href"),
                    href2: test2.getAttribute("href"),
                },
            };
        });
        expect(result.before.href1).toBe("G:\\Archives\\FONDS NUMERISES\\19Fi\\FRAC0000_19Fi001.jpg");
        expect(result.before.href2).toBe("G:\\Archives\\FONDS NUMERISES\\19Fi\\FRAC0000_19Fi101.jpg");
        expect(result.after.href1).toBe("🪐🪐Fo_consultation/FRAC🪐🪐🪐🪐_🪐🪐Fi🪐🪐🪐.jpg");
        expect(result.after.href2).toBe("🪐🪐Fo_consultation/FRAC🪐🪐🪐🪐_🪐🪐Fi🪐🪐🪐.jpg");
    });

    test("separer_controlaccess_lb", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = {
                children: xpathFilter(doc, '//*[@id="test-split-lb"]/*').length,
                nameNodes: xpathFilter(doc, '//*[@id="test-split-lb"]/name')[0].childNodes.length,
            };
            doc = window.__E2E_recipes.separer_controlaccess_lb()(doc);
            const names = xpathFilter(doc, '//*[@id="test-split-lb"]/name');
            return {
                before,
                afterChildren: xpathFilter(doc, '//*[@id="test-split-lb"]/*').length,
                nameCount: names.length,
                role0: names[0].getAttribute("role"),
                role1: names[1].getAttribute("role"),
            };
        });
        expect(result.before.children).toBe(4);
        expect(result.before.nameNodes).toBe(3);
        expect(result.afterChildren).toBe(7);
        expect(result.nameCount).toBe(2);
        expect(result.role0).toBe("test");
        expect(result.role1).toBe("test");
    });

    test("separer_controlaccess_separator", async () => {
        const result = await run((xml) => {
            const xpathExpr = '//*[@id="cypress-test-ca-separator"]/persname';
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = xpathFilter(doc, xpathExpr);
            doc = window.__E2E_recipes.separer_controlaccess_separator(
                window.__E2E_immutable.Map({ separator: ";;;" })
            )(doc);
            const after = xpathFilter(doc, xpathExpr);
            return {
                beforeCount: before.length,
                beforeText: before[0].textContent,
                beforeRole: before[0].getAttribute("role"),
                afterCount: after.length,
                texts: after.map((el) => el.textContent),
                roles: after.map((el) => el.getAttribute("role")),
            };
        });
        expect(result.beforeCount).toBe(1);
        expect(result.beforeText).toBe("Top, Jean Frédéric ;;; Pog, Auguste");
        expect(result.beforeRole).toBe("notaire");
        expect(result.afterCount).toBe(2);
        expect(result.texts[0]).toBe("Top, Jean Frédéric");
        expect(result.texts[1]).toBe("Pog, Auguste");
        expect(result.roles[0]).toBe("notaire");
        expect(result.roles[1]).toBe("notaire");
    });

    test("deplacer_genreform_physdesc", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const before = {
                genreformInPhysdesc: xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc/genreform')
                    .length,
                physdesc: xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc').length,
                ca: xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/controlaccess/*').length,
            };
            doc = window.__E2E_recipes.deplacer_genreform_physdesc()(doc);
            return {
                before,
                physdesc: xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc').length,
                genreform: xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc/genreform').length,
                ca: xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/controlaccess/*').length,
                role: xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc/genreform[@role="test"]')
                    .length,
                source: xpathFilter(
                    doc,
                    '//c[@id="test-genreform-physdesc"]/did/physdesc/genreform[@source="genreform"]'
                ).length,
            };
        });
        expect(result.before.genreformInPhysdesc).toBe(0);
        expect(result.before.physdesc).toBe(0);
        expect(result.before.ca).toBe(3);
        expect(result.physdesc).toBe(1);
        expect(result.genreform).toBe(2);
        expect(result.ca).toBe(1);
        expect(result.role).toBe(1);
        expect(result.source).toBe(2);
    });

    test("deplacer_unitdate_unittitle", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const snapshot = (id) => {
                const fiche = xpathFilter(doc, '//c[@id="' + id + '"]')[0];
                return {
                    inTitle: xpathFilter(doc, fiche, "did/unittitle/unitdate").length,
                    inDid: xpathFilter(doc, fiche, "did/unitdate").length,
                    dates: xpathFilter(doc, fiche, "did/unitdate").map((el) => ({
                        normal: el.getAttribute("normal"),
                        type: el.getAttribute("type"),
                        hasType: el.hasAttribute("type"),
                        text: el.textContent,
                    })),
                    title: xpathFilter(doc, fiche, "did/unittitle")[0]
                        ? xpathFilter(doc, fiche, "did/unittitle")[0].textContent
                        : null,
                };
            };
            const before = {
                c1: snapshot("test-unitdate-1"),
                c2: snapshot("test-unitdate-2"),
                c3: snapshot("test-unitdate-3"),
            };
            doc = window.__E2E_recipes.deplacer_unitdate_unittitle()(doc);
            return {
                before,
                after: {
                    c1: snapshot("test-unitdate-1"),
                    c2: snapshot("test-unitdate-2"),
                    c3: snapshot("test-unitdate-3"),
                },
            };
        });
        expect(result.before.c1.inTitle).toBe(1);
        expect(result.before.c1.inDid).toBe(0);
        expect(result.before.c2.inTitle).toBe(1);
        expect(result.before.c2.inDid).toBe(1);
        expect(result.before.c3.inTitle).toBe(1);
        expect(result.before.c3.inDid).toBe(1);

        expect(result.after.c1.inTitle).toBe(0);
        expect(result.after.c1.inDid).toBe(1);
        expect(result.after.c1.dates[0].normal).toBe("1900");
        expect(result.after.c1.dates[0].text).toBe("Année 1900");
        expect(result.after.c1.title).toBe("test-unitdate-1 Année 1900");

        expect(result.after.c2.inTitle).toBe(0);
        expect(result.after.c2.inDid).toBe(2);
        expect(result.after.c2.dates[0].normal).toBe("2000");
        expect(result.after.c2.dates[0].hasType).toBe(false);
        expect(result.after.c2.dates[1].normal).toBe("2000");
        expect(result.after.c2.dates[1].hasType).toBe(true);
        expect(result.after.c2.dates[1].type).toBe("test");
        expect(result.after.c2.dates[1].text).toBe("Année 2000");
        expect(result.after.c2.title).toBe("test-unitdate-2 Année 2000");

        expect(result.after.c3.inTitle).toBe(0);
        expect(result.after.c3.inDid).toBe(1);
        expect(result.after.c3.dates[0].normal).toBe("3000");
        expect(result.after.c3.dates[0].type).toBe("test");
        expect(result.after.c3.dates[0].text).toBe("Année 3000");
        expect(result.after.c3.title).toBe("test-unitdate-3 Année 3000");
    });

    test("deplacer_dans_did", async () => {
        const result = await run((xml) => {
            const parser = new window.DOMParser();
            let doc = parser.parseFromString(xml, "application/xml");
            const xpathFilter = window.__E2E_xpathFilter;
            const IMap = window.__E2E_immutable.Map;
            const snap = () => {
                const archdesc = xpathFilter(doc, "//archdesc")[0];
                const ficheC1 = xpathFilter(doc, '//c[@id="test-deplacer-dans-did-1"]')[0];
                const ficheC2 = xpathFilter(doc, '//c[@id="test-deplacer-dans-did-2"]')[0];
                return {
                    arch: {
                        physdescInDid: xpathFilter(doc, archdesc, "did/physdesc").length,
                        extent: xpathFilter(doc, archdesc, "did/physdesc/extent").length,
                        extentText:
                            xpathFilter(doc, archdesc, "did/physdesc/extent")[0] &&
                            xpathFilter(doc, archdesc, "did/physdesc/extent")[0].textContent,
                        physdesc: xpathFilter(doc, archdesc, "physdesc").length,
                    },
                    c1: {
                        physdescInDid: xpathFilter(doc, ficheC1, "did/physdesc").length,
                        physlocInDid: xpathFilter(doc, ficheC1, "did/physloc").length,
                        physdesc: xpathFilter(doc, ficheC1, "physdesc").length,
                    },
                    c2: {
                        did: xpathFilter(doc, ficheC2, "did").length,
                        physloc: xpathFilter(doc, ficheC2, "physloc").length,
                        physdesc: xpathFilter(doc, ficheC2, "physdesc").length,
                        physdescInDid: xpathFilter(doc, ficheC2, "did/physdesc").length,
                        physlocInDid: xpathFilter(doc, ficheC2, "did/physloc").length,
                    },
                };
            };
            const before = snap();
            doc = window.__E2E_recipes.deplacer_dans_did(IMap({ balises: "physdesc|physloc" }))(doc);
            return { before, after: snap() };
        });
        expect(result.before.arch.physdescInDid).toBe(0);
        expect(result.before.arch.extent).toBe(0);
        expect(result.before.arch.physdesc).toBe(1);
        expect(result.before.c1.physdescInDid).toBe(0);
        expect(result.before.c1.physlocInDid).toBe(1);
        expect(result.before.c1.physdesc).toBe(1);
        expect(result.before.c2.did).toBe(0);
        expect(result.before.c2.physloc).toBe(1);
        expect(result.before.c2.physdesc).toBe(1);

        expect(result.after.arch.physdescInDid).toBe(1);
        expect(result.after.arch.extent).toBe(1);
        expect(result.after.arch.extentText).toBe("TEST");
        expect(result.after.arch.physdesc).toBe(0);
        expect(result.after.c1.physdescInDid).toBe(1);
        expect(result.after.c1.physlocInDid).toBe(1);
        expect(result.after.c1.physdesc).toBe(0);
        expect(result.after.c2.did).toBe(1);
        expect(result.after.c2.physdescInDid).toBe(1);
        expect(result.after.c2.physlocInDid).toBe(1);
        expect(result.after.c2.physloc).toBe(0);
        expect(result.after.c2.physdesc).toBe(0);
    });
});
