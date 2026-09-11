/* eslint-disable */
const { test, expect, savePageCoverage } = require("./support/test");
const { loadRecipeHooks, fixturePath } = require("./support/app");
const fs = require("fs");

test.describe.configure({ mode: "serial" });

test.describe("Merging documents into one", () => {
    /** @type {import("@playwright/test").Page} */
    let page;
    let xmlStringRoot = "";
    let xmlStringChild = "";

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        xmlStringRoot = fs.readFileSync(fixturePath("merge", "root.xml"), "utf8");
        xmlStringChild = fs.readFileSync(fixturePath("merge", "child.xml"), "utf8");
        await loadRecipeHooks(page);
    });

    test.afterAll(async () => {
        if (page) {
            await savePageCoverage(page, "merge-shared");
            await page.close();
        }
    });

    async function mergeDocs() {
        return page.evaluate(
            ({ xmlStringRoot, xmlStringChild }) => {
                const parser = new window.DOMParser();
                const docRoot = parser.parseFromString(xmlStringRoot, "application/xml");
                const docChild = parser.parseFromString(xmlStringChild, "application/xml");
                const xpathFilter = window.__E2E_xpathFilter;
                const insertIntoDocument = window.__E2E_insertIntoDocument;
                const anchor = xpathFilter(docRoot, "//archref")[0];
                insertIntoDocument(docRoot, docChild, anchor);
                return {
                    insertedC: xpathFilter(docRoot, '//c[@id="doc_1"]/c').length,
                    insertedRoot: xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]').length,
                    insertedCA: xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/controlaccess').length,
                    insertedPersname: xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/controlaccess/persname').length,
                    insertedUnitid: xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/did/unitid').length,
                    prefixedId: xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/c')[0].getAttribute("id"),
                };
            },
            { xmlStringRoot, xmlStringChild }
        );
    }

    test("Should have been inserted in the right node", async () => {
        const result = await mergeDocs();
        expect(result.insertedC).toBe(3);
    });

    test("Should have inserted a new node with archdesc metadata", async () => {
        const result = await mergeDocs();
        expect(result.insertedRoot).toBe(1);
        expect(result.insertedCA).toBe(1);
        expect(result.insertedPersname).toBe(1);
        expect(result.insertedUnitid).toBe(1);
    });

    test("Should have prefixed inserted IDs", async () => {
        const result = await mergeDocs();
        expect(result.prefixedId).toBe("CHILD_XML-doc_1");
    });
});
