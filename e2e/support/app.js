const path = require("path");
const { expect } = require("@playwright/test");

const FIXTURES = path.join(__dirname, "..", "fixtures");

async function unregisterServiceWorkers(page) {
    await page.evaluate(async () => {
        if (!navigator.serviceWorker) return;
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
    });
}

async function gotoApp(page) {
    await page.goto("/");
    await unregisterServiceWorkers(page);
    await expect(page.locator("h1")).toContainText("Cuisine EAD");
}

async function loadRecipeHooks(page) {
    await page.addInitScript(() => {
        window.__E2E__ = true;
    });
    await page.goto("/");
    await unregisterServiceWorkers(page);
    await page.waitForFunction(() => window.__E2E_immutable && window.__E2E_recipes && window.__E2E_xpathFilter);
}

function fixturePath(...parts) {
    return path.join(FIXTURES, ...parts);
}

module.exports = { gotoApp, loadRecipeHooks, fixturePath, FIXTURES };
