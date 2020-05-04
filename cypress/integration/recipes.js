/* eslint-disable */
/**
 * Set in `before`
 */
let xmlString = "";
let win = null;
let xpathFilter = null;
let recipes = null;
let Map, List, fromJS, immutable;
/**
 * Reset in `beforeEach`
 */
let doc = null;

describe("Recipe unit test", function () {
    before(() => {
        if (window.navigator && navigator.serviceWorker) {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                registrations.forEach((registration) => {
                    registration.unregister();
                });
            });
        }
        cy.visit("/");
        cy.wait(1000);
        cy.fixture("example-ffas.xml", "utf-8").then((xml) => {
            xmlString = xml;
        });
        cy.window().then((w) => {
            win = w;
            xpathFilter = win.__cypress_xpathFilter;
            recipes = win.__cypress_recipes;
            immutable = win.__cypress_immutable;
            Map = immutable.Map;
            List = immutable.List;
            fromJS = immutable.fromJS;
            if (win.navigator && win.navigator.serviceWorker) {
              win.navigator.serviceWorker.getRegistrations().then((registrations) => {
                  registrations.forEach((registration) => {
                      registration.unregister();
                  });
              });
          }
        });
    });
    beforeEach(() => {
        const parser = new win.DOMParser();
        doc = parser.parseFromString(xmlString, "application/xml");
    });
    it("supprimerCId", function () {
        const matchesBefore = xpathFilter(doc, "//c[@id]");
        expect(matchesBefore.length).to.be.greaterThan(0);

        doc = recipes.supprimer_c_id()(doc);

        const matchesAfter = xpathFilter(doc, "//c[@id]");
        expect(matchesAfter.length).to.equal(0);
    });
    it("geognameSetSource", function () {
        const value = "CYPRESS";
        const xpathExpr = "//controlaccess/geogname[@source=\""+value+"\"]";
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.equal(0);

        doc = recipes.geogname_set_source(Map({source: value}))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.greaterThan(0);
    });
    it("remplacePlageSeparatorStrict", function () {
        const value = "CYPRESS";
        const xpathExpr = '//unitid[@data-cy="range-fonds"]';
        const xpathExpr2 = '//unitid[@data-cy="range-souslevel"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        const matchesBefore2 = xpathFilter(doc, xpathExpr2);
        expect(matchesBefore[0].textContent.trim()).to.be.equal("8 U 1-256");
        expect(matchesBefore2[0].textContent.trim()).to.be.equal("8 U 1-12");

        doc = recipes.remplace_plage_separator_strict()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        const matchesAfter2 = xpathFilter(doc, xpathExpr2);
        expect(matchesAfter[0].textContent.trim()).to.be.equal("8 U 1 à 256");
        expect(matchesAfter2[0].textContent.trim()).to.be.equal("8 U 1 à 12");
    });
    it("ajouterPersnameSource", function () {
        const value = "CYPRESS";
        const xpathExpr = '//controlaccess/persname[@role="notaire"][@source="CYPRESS"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);

        doc = recipes.ajouter_persname_source(Map({ role: "notaire", source: "CYPRESS" }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.greaterThan(0);
    });
});
