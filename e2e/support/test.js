const { test: base, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const COVERAGE_DIR = path.join(process.cwd(), "playwright-coverage", "partials");

/**
 * Injects window.__E2E__ so the app exposes test hooks (same role as
 * window.Cypress in the old suite) and dumps istanbul coverage when the
 * page was built with babel-plugin-istanbul (`npm run build:dev`).
 */
const test = base.extend({
    page: async ({ page }, use, testInfo) => {
        await page.addInitScript(() => {
            window.__E2E__ = true;
        });
        await use(page);
        await savePageCoverage(page, testInfo.testId);
    },
});

async function savePageCoverage(page, suffix) {
    try {
        const coverage = await page.evaluate(() => window.__coverage__ || null);
        if (!coverage) return;
        fs.mkdirSync(COVERAGE_DIR, { recursive: true });
        const safeName = String(suffix).replace(/[^a-zA-Z0-9_-]/g, "_");
        fs.writeFileSync(path.join(COVERAGE_DIR, `${safeName}.json`), JSON.stringify(coverage));
    } catch (_err) {
        // page may already be closed
    }
}

module.exports = { test, expect, savePageCoverage };
