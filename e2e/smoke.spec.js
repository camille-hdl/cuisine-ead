/* eslint-disable */
const { test, expect } = require("./support/test");
const { gotoApp, fixturePath } = require("./support/app");

test.describe.configure({ mode: "serial" });

test("Smoke test: upload, recipes, results", async ({ page }) => {
    await gotoApp(page);

    await test.step("Should let you add files", async () => {
        await expect(page.locator("[data-cy=next-step-link]")).toBeHidden();

        await page.locator('[data-cy=dropzone] input[type=file]').setInputFiles([
            fixturePath("example-ead.xml"),
            fixturePath("example-correction.csv"),
        ]);

        await expect(page.locator("[data-cy=file-list]")).toBeVisible();
        await expect(page.locator("[data-cy=file-list-text]").first()).toContainText(
            "Fonds Saint-Exupery (1911-1944)"
        );
        await expect(page.locator("body")).toContainText("1 correction de controlaccess");
        await expect(page.locator("[data-cy=next-step-link]")).toBeVisible();
    });

    await test.step("Should let you download controlaccess", async () => {
        await page.locator("[data-cy=download-ca]").click();
        await page.waitForFunction(() => typeof window.__E2E_OUTPUT_CA === "string");
        const ca = await page.evaluate(() => window.__E2E_OUTPUT_CA);
        expect(ca).toContain("originalvalue");
    });

    await test.step("Should not let you download the results without recipes", async () => {
        await page.locator("[data-cy=next-step-link]").click();
        await expect(page.locator("[data-cy=download-results]")).toBeHidden();
    });

    await test.step("Should let you add all recipes", async () => {
        await expect(page).toHaveURL(/\/recettes/);
        await expect(page.locator("[data-cy=prev-step-link]")).toBeVisible();

        const firstKey = page.locator("[data-cy=recipe-key]").first();
        const firstRow = firstKey.locator("xpath=ancestor::li[1]");
        await expect(firstRow.locator('input[type=checkbox]')).not.toBeChecked();
        await firstKey.click();
        await expect(firstRow.locator('input[type=checkbox]')).toBeChecked();

        await page.waitForFunction(() => typeof window.__E2E_addAllRecipes === "function");
        await page.evaluate(() => window.__E2E_addAllRecipes());

        const keys = page.locator("[data-cy=recipe-key]");
        const count = await keys.count();
        for (let i = 0; i < count; i++) {
            const row = keys.nth(i).locator("xpath=ancestor::li[1]");
            await expect(row.locator('input[type=checkbox]')).toBeChecked();
        }

        const removeCa = page.locator("[data-recipe-key=supprimer_controlaccess]");
        await removeCa.click();
        await expect(removeCa.locator("xpath=ancestor::li[1]").locator('input[type=checkbox]')).not.toBeChecked();
    });

    await test.step("Should let you preview changes", async () => {
        await page.locator("[data-cy=toggle-preview]").click();
        await expect(page.locator("[data-cy=preview-warning]")).toBeVisible();
        await expect(page.locator("[data-cy=preview-warning]").locator("xpath=..").locator("table")).toBeVisible();
        await page.locator("[data-cy=preview-exit]").click();
        await expect(page.locator("[data-cy=preview-warning]")).toBeHidden();
    });

    await test.step("Should let you download the result", async () => {
        await expect(page.locator("[data-cy=download-results]")).toBeVisible();
        await page.locator("[data-cy=download-results]").click();
        await page.waitForFunction(() => window.__E2E_OUTPUT_READY && window.__E2E_OUTPUT && window.__E2E_OUTPUT.length > 0, {
            timeout: 30_000,
        });
        const output = await page.evaluate(() => window.__E2E_OUTPUT);
        expect(output).toHaveLength(1);
        expect(output[0].str).toContain("CYPRESS1");
    });

    await test.step("Should let you go to the results page", async () => {
        await expect(page.locator("[data-cy=next-step-link]")).toBeVisible();
        await page.locator("[data-cy=next-step-link]").click();
        await expect(page).toHaveURL(/\/resultats/);
        await expect(page.locator("[data-cy=download-link]")).toContainText("Fichiers séparés");
        await expect(page.locator("[data-cy=download-link]").locator("xpath=..").locator("button")).toBeVisible();
    });
});
