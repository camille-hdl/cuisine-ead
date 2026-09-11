const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = async function globalTeardown() {
    const root = path.join(process.cwd(), "playwright-coverage");
    const partials = path.join(root, "partials");
    if (!fs.existsSync(partials)) return;
    const files = fs.readdirSync(partials).filter((name) => name.endsWith(".json"));
    if (files.length === 0) return;
    const outFile = path.join(root, "coverage-final.json");
    execFileSync("npx", ["nyc", "merge", partials, outFile], {
        stdio: "inherit",
        cwd: process.cwd(),
    });
};
