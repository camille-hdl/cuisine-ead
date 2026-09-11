# Cuisine EAD 🍲
![Build](https://github.com/camille-hdl/cuisine-ead/actions/workflows/ci.yaml/badge.svg) [![Test Coverage](https://api.codeclimate.com/v1/badges/b74ad07c067f9b18fd5d/test_coverage)](https://codeclimate.com/github/camille-hdl/cuisine-ead/test_coverage)

A tool for batch editing xml-ead files in the browser.

## What? Why? How?

[blog post](https://camillehdl.dev/cuisine-ead/)

## Development

* `npm install`
* `npm run build` production build
* `npm run watch` to start the development build loop
* `npm run serve` to start a local server, then browse to [http://127.0.0.1:5000](http://127.0.0.1:5000)
* `npx playwright install chromium` (once, after `npm install`) to download the e2e browser
* `npm run e2e` to run Playwright end-to-end tests (starts `serve` if needed; requires a prior `npm run build` or `npm run build:dev`)
* `npm run e2e:ui` for the Playwright UI runner
* `npm test` runs Jest, a dev build, then the Playwright suite

## Publier une version

Voir [docs/RELEASE.md](docs/RELEASE.md) : land sur `master`, bumper `package.json` + `src/sw.js`, puis PR **master → netlify**.

## Notes

Sample files used in integration tests are from https://francearchives.fr/fr/open_data and https://www.siv.archives-nationales.culture.gouv.fr/siv/.


[@camille_hdl](https://twitter.com/camille_hdl)

[LICENSE](LICENSE)
