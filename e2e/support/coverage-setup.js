const fs = require("fs");
const path = require("path");

module.exports = async function globalSetup() {
    const dir = path.join(process.cwd(), "playwright-coverage");
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(path.join(dir, "partials"), { recursive: true });
};
