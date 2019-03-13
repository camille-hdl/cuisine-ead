# Cuisine EAD 🍲
[![Build Status](https://travis-ci.org/camille-hdl/cuisine-ead.svg?branch=master)](https://travis-ci.org/camille-hdl/cuisine-ead) 


## Development

* `npm install`
* `npm run build` production build
* `npm run watch` to start the development build loop
* `npm run serve` to start a local server, then browse to [http://127.0.0.1:5000](http://127.0.0.1:5000)
* `npm run cypress:run` to run integration tests
* `npm test` starts the dev server, waits for it to respond, then starts integration tests

## Notes

* Sample files used in integration tests are from https://francearchives.fr/fr/open_data and https://www.siv.archives-nationales.culture.gouv.fr/siv/.
* On the `netlify` branch, `cypress` is removed from the devDependencies because of cypress-io/cypress#3419 (takes forever to unzip on netlify). This means `package.lock` isn't the same on each branch.


[@camille_hdl](https://twitter.com/camille_hdl)


[LICENSE](LICENSE)