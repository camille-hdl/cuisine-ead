/* eslint-disable */
const fs = require("fs");
const { test, expect } = require("./support/test");
const { fixturePath, gotoApp } = require("./support/app");

async function installFakeWebMcp(page) {
    await page.addInitScript(() => {
        const tools = new Map();
        const modelContext = {
            async registerTool(tool, options) {
                tools.set(tool.name, tool);
                if (options && options.signal) {
                    options.signal.addEventListener("abort", () => {
                        tools.delete(tool.name);
                    });
                }
            },
            async getTools() {
                return Array.from(tools.values()).map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                    annotations: tool.annotations || {},
                    title: tool.title || "",
                }));
            },
            async executeTool(tool, input) {
                const name = typeof tool === "string" ? tool : tool && tool.name;
                const registered = tools.get(name);
                if (!registered) {
                    throw new Error("Unknown tool: " + name);
                }
                const result = await registered.execute(input || {}, { signal: new AbortController().signal });
                return typeof result === "string" ? result : JSON.stringify(result);
            },
        };
        Object.defineProperty(document, "modelContext", {
            configurable: true,
            enumerable: true,
            get() {
                return modelContext;
            },
        });
        window.__WEBMCP_TEST__ = modelContext;
    });
}

async function waitForTools(page) {
    await page.waitForFunction(async () => {
        if (!window.__WEBMCP_TEST__ || typeof window.__WEBMCP_TEST__.getTools !== "function") {
            return false;
        }
        const tools = await window.__WEBMCP_TEST__.getTools();
        return tools.some((tool) => tool.name === "add_ead_content");
    });
}

async function executeTool(page, name, input) {
    return page.evaluate(
        async ({ name, input }) => {
            return window.__WEBMCP_TEST__.executeTool(name, input);
        },
        { name, input }
    );
}

test.describe("WebMCP autonomous XML path", () => {
    test("agent can add XML strings, select recipes, run, and download without the file picker", async ({ page }) => {
        await installFakeWebMcp(page);
        await gotoApp(page);
        await waitForTools(page);

        const tools = await page.evaluate(async () => window.__WEBMCP_TEST__.getTools());
        const names = tools.map((tool) => tool.name);
        expect(names).toContain("add_ead_content");
        expect(names).toContain("add_ead_contents");
        expect(names.indexOf("add_ead_content")).toBeLessThan(names.indexOf("add_files_via_picker"));

        const xml = fs.readFileSync(fixturePath("example-ead.xml"), "utf8");
        const secondXml = `<?xml version="1.0" encoding="UTF-8"?><ead><eadheader><eadid>SECOND</eadid><filedesc><titlestmt><titleproper>Second IR</titleproper></titlestmt></filedesc></eadheader><archdesc level="fonds"><did><unittitle>Second</unittitle></did></archdesc></ead>`;

        const added = JSON.parse(
            await executeTool(page, "add_ead_contents", {
                files: [
                    { name: "saint-exupery.xml", content: xml },
                    { name: "second.xml", content: secondXml },
                ],
            })
        );
        expect(added.ok).toBe(true);
        expect(added.added).toHaveLength(2);

        await expect(page.locator("[data-cy=file-list]")).toBeVisible();
        await expect(page.locator("[data-cy=file-list-text]").first()).toContainText("Fonds Saint-Exupery (1911-1944)");
        await expect(page.locator("[data-cy=next-step-link]")).toBeVisible();

        const selected = JSON.parse(
            await executeTool(page, "select_recipes", {
                recipeIds: ["supprimer_lb", "pretty_print"],
                mode: "set",
            })
        );
        expect(selected.ok).toBe(true);
        expect(selected.selectedRecipeIds).toEqual(["supprimer_lb", "pretty_print"]);

        const run = JSON.parse(await executeTool(page, "run_selected_recipes", {}));
        expect(run.ok).toBe(true);
        await expect(page).toHaveURL(/\/recettes/);
        await expect(page.locator("[data-cy=preview-warning]")).toBeVisible();

        const summary = JSON.parse(await executeTool(page, "get_diff_summary", {}));
        expect(summary.ok).toBe(true);
        expect(summary.filename).toEqual("saint-exupery.xml");
        expect(summary.originalChars).toBeGreaterThan(0);

        const download = JSON.parse(await executeTool(page, "download_results", {}));
        expect(download.ok).toBe(true);
        await page.waitForFunction(
            () => window.__E2E_OUTPUT_READY && window.__E2E_OUTPUT && window.__E2E_OUTPUT.length > 0,
            { timeout: 30_000 }
        );
        const output = await page.evaluate(() => window.__E2E_OUTPUT);
        expect(output.length).toBeGreaterThanOrEqual(1);
        expect(output[0].str).toContain("ead");
    });

    test("agent can discover and set recipe parameters like the UI form", async ({ page }) => {
        await installFakeWebMcp(page);
        await gotoApp(page);
        await waitForTools(page);

        const xml = fs.readFileSync(fixturePath("example-ead.xml"), "utf8");
        const added = JSON.parse(
            await executeTool(page, "add_ead_content", { name: "saint-exupery.xml", content: xml })
        );
        expect(added.ok).toBe(true);

        const listed = JSON.parse(await executeTool(page, "list_recipes", {}));
        const geog = listed.recipes.find((recipe) => recipe.id === "geogname_set_source");
        expect(geog.hasParams).toBe(true);
        expect(geog.params.map((param) => param.name)).toEqual(["source"]);

        const schema = JSON.parse(await executeTool(page, "get_recipe_params", { recipeId: "geogname_set_source" }));
        expect(schema.params[0].label).toMatch(/attribut/i);

        const selected = JSON.parse(
            await executeTool(page, "select_recipes", {
                recipeIds: ["geogname_set_source"],
                mode: "set",
                params: { geogname_set_source: { source: "GEOTEST" } },
            })
        );
        expect(selected.ok).toBe(true);
        expect(selected.selectedRecipeParams.geogname_set_source.source).toEqual("GEOTEST");

        await executeTool(page, "go_to_step", { step: "recipes" });
        await expect(page).toHaveURL(/\/recettes/);
        await expect(page.locator("#recipe-geogname_set_source")).toBeChecked();
        await expect(page.getByText("Valeur de l'attribut")).toBeVisible();
        await expect(
            page.locator("#recipe-geogname_set_source").locator("xpath=ancestor::li[1]").locator("input[type=text]")
        ).toHaveValue("GEOTEST");

        const run = JSON.parse(await executeTool(page, "run_selected_recipes", {}));
        expect(run.ok).toBe(true);
        expect(run.selectedRecipeParams.geogname_set_source.source).toEqual("GEOTEST");
    });
});
