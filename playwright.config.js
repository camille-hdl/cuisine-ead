// @ts-check
const { defineConfig, devices } = require("@playwright/test");

/**
 * Playwright replaces Cypress 5.1 for this repo:
 * - first-class file uploads (no Papaparse File workaround)
 * - Chromium in CI via `npx playwright install`
 * - built-in webServer (replaces start-server-and-test)
 * Recipe/merge specs still load the app once and call browser-only APIs
 * (DOMParser, XPath) that Jest's node environment cannot provide.
 */
module.exports = defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    timeout: 60_000,
    expect: {
        timeout: 15_000,
    },
    use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:5000",
        trace: "on-first-retry",
        viewport: { width: 1280, height: 720 },
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "npm run serve",
        url: "http://127.0.0.1:5000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
    globalSetup: require.resolve("./e2e/support/coverage-setup.js"),
    globalTeardown: require.resolve("./e2e/support/coverage-teardown.js"),
});
