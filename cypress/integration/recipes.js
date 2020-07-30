/* eslint-disable */
/**
 * Set in `before`
 */
let xmlString = "";
let win = null;
let xpathFilter = null;
let recipes = null;
let IMap, List, fromJS, immutable;
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
        cy.window().its('Cypress').should('be.an', 'object');
        cy.window().its('__cypress_immutable').should('exist');

        cy.window().then((w) => {
            win = w;
            xpathFilter = win.__cypress_xpathFilter;
            recipes = win.__cypress_recipes;
            immutable = win.__cypress_immutable;
            IMap = immutable.Map;
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

        doc = recipes.geogname_set_source(IMap({source: value}))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.greaterThan(0);
    });
    it("remplacePlageSeparatorStrict", function () {
        const value = "CYPRESS";
        const xpathExpr = '//unitid[@data-cy="range-fonds"]';
        const xpathExpr2 = '//unitid[@data-cy="range-souslevel"]';
        const xpathExpr3 = '//c[@data-cy="c-branche"]/did/unitid';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        const matchesBefore2 = xpathFilter(doc, xpathExpr2);
        const matchesBefore3 = xpathFilter(doc, xpathExpr3);
        expect(matchesBefore[0].textContent.trim()).to.be.equal("8 U 1-256");
        expect(matchesBefore2[0].textContent.trim()).to.be.equal("8 U 1-12");
        expect(matchesBefore3[0].textContent.trim()).to.be.equal("8 U 1-17");

        doc = recipes.remplace_plage_separator_strict()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        const matchesAfter2 = xpathFilter(doc, xpathExpr2);
        const matchesAfter3 = xpathFilter(doc, xpathExpr3);
        expect(matchesAfter[0].textContent.trim()).to.be.equal("8 U 1 à 256");
        expect(matchesAfter2[0].textContent.trim()).to.be.equal("8 U 1 à 12");
        expect(matchesAfter3[0].textContent.trim()).to.be.equal("8 U 1 à 17");
    });
    it("ajouterPersnameSource", function () {
        const value = "CYPRESS";
        const xpathExpr = '//controlaccess/persname[@role="notaire"][@source="CYPRESS"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);

        doc = recipes.ajouter_persname_source(IMap({ role: "notaire", source: "CYPRESS" }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.greaterThan(0);
    });
    it("ajouterAltRenderForce", function () {
        const value = "CYPRESS";
        const xpathExpr = '//c[@data-cy="c-branche"]';
        const xpathExpr2 = '//c[@data-cy="c-article"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        const matchesBefore2 = xpathFilter(doc, xpathExpr2);
        expect(matchesBefore[0].hasAttribute("altrender")).to.be.false;
        expect(matchesBefore2[0].hasAttribute("altrender")).to.be.false;

        doc = recipes.ajouter_altrender_force()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        const matchesAfter2 = xpathFilter(doc, xpathExpr2);
        expect(matchesAfter[0].getAttribute("altrender")).to.be.equal("ligeo-branche-standardisadg");
        expect(matchesAfter2[0].getAttribute("altrender")).to.be.equal("ligeo-article-standardisadg");
    });
    it("ajouterTypologieArticle", function () {
        const value = "CYPRESS";
        const xpathExpr = '//c/controlaccess/genreform[@source="typologie"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);

        doc = recipes.ajouter_typologie_article(IMap({ valeur: value }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.greaterThan(0);
    });
    it("ajouterAccessrestrictLigeo", function () {
        const xpathExpr = '//c/accessrestrict[@type="incommunicable"][@id="ligeo-223"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);

        doc = recipes.ajouter_accessrestrict_ligeo()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.greaterThan(0);
        expect(matchesAfter[0].textContent).to.equal("Document numérisé");
    });
    it("transformeDaogrp - default", function () {
        const xpathExpr = '//daogrp[@data-cy="daogrp-default"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(1);

        doc = recipes.transforme_daogrp_ligeo(IMap({ prefix: "Serie_U" }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(1);
        expect(matchesAfter[0].getAttribute("type")).to.be.equal("link");
        const elem = matchesAfter[0];
        expect(xpathFilter(doc, elem, 'daoloc[@role="dossier"]')[0].getAttribute("href")).to.be.equal("/Serie_U/8U/FRAD007_8U1/");
        expect(xpathFilter(doc, elem, 'daoloc[@role="prefixe"]')[0].getAttribute("href")).to.be.equal("FRAD007_8U1_");
        expect(xpathFilter(doc, elem, 'daoloc[@role="exception"]')[0].getAttribute("href")).to.be.equal("0000");
        expect(xpathFilter(doc, elem, 'daoloc[@role="extension"]')[0].getAttribute("href")).to.be.equal("jpg");
    });
    it("transformeDaogrp - series", function () {
        const xpathExpr = '//daogrp[@data-cy="daogrp-series"]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(1);

        doc = recipes.transforme_daogrp_ligeo(IMap({ prefix: null }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(1);
        expect(matchesAfter[0].getAttribute("type")).to.be.equal("link");
        const elem = matchesAfter[0];
        expect(xpathFilter(doc, elem, 'daoloc[@role="dossier"]')[0].getAttribute("href")).to.be.equal("/Serie_W/2246W/FRAD007_2246W425/");
        expect(xpathFilter(doc, elem, 'daoloc[@role="prefixe"]')[0].getAttribute("href")).to.be.equal("FRAD007_2246W425_");
        expect(xpathFilter(doc, elem, 'daoloc[@role="premier"]')[0].getAttribute("href")).to.be.equal("0003");
        expect(xpathFilter(doc, elem, 'daoloc[@role="dernier"]')[0].getAttribute("href")).to.be.equal("0003");
        expect(xpathFilter(doc, elem, 'daoloc[@role="exception"]')[0].getAttribute("href")).to.be.equal("0000");
        expect(xpathFilter(doc, elem, 'daoloc[@role="extension"]')[0].getAttribute("href")).to.be.equal("jpg");
    });
});
