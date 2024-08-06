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
    it("nettoyerOtherfindaidList", function () {
        const xpathExpr = '//otherfindaid/list';
        const xpathExpr2 = '//archref[@data-cy="otherfindaid-child"]';
        const xpathExpr3 = '//otherfindaid/text()';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        const matchesBefore2 = xpathFilter(doc, xpathExpr2);
        const matchesBefore3 = xpathFilter(doc, xpathExpr3).filter(node => {
            return node.data.trim() !== "";
        });
        expect(matchesBefore.length).to.be.equal(2);
        expect(matchesBefore2.length).to.be.equal(1);
        expect(matchesBefore3.length).to.be.equal(0);

        doc = recipes.nettoyer_otherfindaid_list()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        const matchesAfter2 = xpathFilter(doc, xpathExpr2);
        const matchesAfter3 = xpathFilter(doc, xpathExpr3).filter(node => {
            return node.data.trim() !== "";
        });
        expect(matchesAfter.length).to.be.equal(0);
        expect(matchesAfter2.length).to.be.equal(1);
        expect(matchesAfter3.length).to.be.equal(2);
        expect(matchesAfter3[0].data).to.be.equal("A");
    });
    it("originationFromUnittitle", function () {
        const xpathExpr = '//did[@data-cy="test-origination"]/origination';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);

        doc = recipes.origination_from_unittitle(IMap({ titre: "Bonautrenom EMILE Henri." }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(1);
        expect(matchesAfter[0].textContent).to.be.equal("Bonautrenom Emile Henri.");
    });
    it("originationFromUnittitle - existing origination", function () {
        const xpathExpr = '//did[@data-cy="test-origination-2"]/origination';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(1);
        expect(matchesBefore[0].childNodes.length).to.be.equal(1);

        doc = recipes.origination_from_unittitle(IMap({ titre: "Chnom Albert Jean François." }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(1);
        expect(matchesAfter[0].childNodes.length).to.be.equal(2);
        expect(matchesAfter[0].childNodes[1].textContent).to.be.equal("Chnom Albert Jean François.");
    });
    it("genreformFromUnittitle", function () {
        const xpathExpr = '//c[@data-cy="test-genreform"]/controlaccess/genreform';
        const xpathExpr2 = '//c[@data-cy="test-genreform"]/c/controlaccess/genreform';
        const xpathExprControl = '//c[@data-cy="c-branche"]/controlaccess/genreform';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);
        const matchesBefore2 = xpathFilter(doc, xpathExpr2);
        expect(matchesBefore2.length).to.be.equal(0);
        const controlBefore = xpathFilter(doc, xpathExprControl);
        expect(controlBefore.length).to.be.equal(0);

        doc = recipes.genreform_from_unittitle(IMap({ titre: "Tables décennales|Etat civil", type: "Type de document" }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(1);
        expect(matchesAfter[0].textContent).to.be.equal("Tables décennales");
        expect(matchesAfter[0].getAttribute("type")).to.be.equal("Type de document");
        const matchesAfter2 = xpathFilter(doc, xpathExpr2);
        expect(matchesAfter2.length).to.be.equal(0);
        const controlAfter = xpathFilter(doc, xpathExprControl);
        expect(controlAfter.length).to.be.equal(0);
    });

    it("genreformFromUnittitleMulti", function () {
        const xpathExpr = '//c[@data-cy="test-type-actes"]/controlaccess/genreform';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);

        const titres = "Baptêmes|Naissances|mariages|sépultures|Décès|Publications de mariages";
        doc = recipes.index_from_unittitle_multi(IMap({ titres: titres, type: "Type d'acte", separateurs: ",|et", index: "genreform" }))(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(3);
        expect(matchesAfter[0].textContent).to.be.equal("Naissances");
        expect(matchesAfter[1].textContent).to.be.equal("Mariages");
        expect(matchesAfter[2].textContent).to.be.equal("Décès");
        expect(matchesAfter[0].getAttribute("type")).to.be.equal("Type d'acte");
    });
    it("copierTitleproperDansUnititle", function () {
        const xpathExpr = '/ead/archdesc/did/unittitle';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore[0].textContent).to.be.equal("Répertoires de notaires en provenance du tribunal de première instance de Commune.");

        doc = recipes.copier_titleproper_dans_unittitle()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesBefore[0].textContent).to.be.equal("XX");
    });
    it("sortirScopecontentDid", function () {
        const xpathExpr = '//did/scopecontent';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(1);

        doc = recipes.sortir_scopecontent_did()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(0);
        const scopecontent = xpathFilter(doc, '//archdesc/scopecontent')[0];
        const archdesc = xpathFilter(doc, '//archdesc')[0];
        const did = xpathFilter(doc, '//archdesc/did')[0];
        expect(scopecontent.parentNode).to.be.equal(archdesc);
        expect(did.nextSibling).to.be.equal(scopecontent);
    });
    it("idFromUnittitle", function () {
        const xpathExpr = '//c[not(@id)]';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(3);

        doc = recipes.id_from_unittitle()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(0);
        expect(xpathFilter(doc, '//c[@id="ctestchild-0"]').length).to.be.equal(1);
        expect(xpathFilter(doc, '//c[@id="ctestchild-1"]').length).to.be.equal(1);
        expect(xpathFilter(doc, '//c[@id="ctestchild-2"]').length).to.be.equal(0);
        expect(xpathFilter(doc, '//c[@id="ctestparentid-0"]').length).to.be.equal(1);
    });
    it("extraire_dao_daodesc", function () {
        const xpathExpr = '//daogrp/daodesc/daoloc';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(2);

        doc = recipes.extraire_dao_daodesc()(doc);

        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(0);
        const matchesDaolocBienPlaces = xpathFilter(doc, '//daogrp[@id="test-daogrp-daodesc"]/daoloc');
        expect(matchesDaolocBienPlaces.length).to.be.equal(2);
        const matchesDescription = xpathFilter(doc, '//daogrp[@id="test-daogrp-daodesc"]/daodesc/p');
        expect(matchesDescription.length).to.be.equal(1);
    });
    it("remplace_dao_href", function () {
        const xpathTest1 = '//*[@id="test-replace"]';
        const xpathTest2 = '//*[@id="test-replace-2"]';
        const test1 = xpathFilter(doc, xpathTest1)[0];
        const test2 = xpathFilter(doc, xpathTest2)[0];
        expect(test1.getAttribute("href")).to.be.equal("G:\\Archives\\FONDS NUMERISES\\19Fi\\FRAC0000_19Fi001.jpg");
        expect(test2.getAttribute("href")).to.be.equal("G:\\Archives\\FONDS NUMERISES\\19Fi\\FRAC0000_19Fi101.jpg");

        doc = recipes.remplace_dao_href(IMap({
            remplacements: [
                { rechercher: "G:\\\\Archives\\\\FONDS NUMERISES\\\\19Fi\\\\", remplacer: "19Fo_consultation/" },
                { rechercher: "[0-9]", remplacer: "🪐" },
            ],
        }))(doc);

        expect(test1.getAttribute("href")).to.be.equal("🪐🪐Fo_consultation/FRAC🪐🪐🪐🪐_🪐🪐Fi🪐🪐🪐.jpg");
        expect(test2.getAttribute("href")).to.be.equal("🪐🪐Fo_consultation/FRAC🪐🪐🪐🪐_🪐🪐Fi🪐🪐🪐.jpg");
        
    });
    it("separer_controlaccess_lb", function () {
        const xpathExpr = '//*[@id="test-split-lb"]/*';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(4);
        expect(xpathFilter(doc, '//*[@id="test-split-lb"]/name')[0].childNodes.length).to.be.equal(3);

        doc = recipes.separer_controlaccess_lb()(doc);
        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(7);
        expect(xpathFilter(doc, '//*[@id="test-split-lb"]/name').length).to.be.equal(2);
        expect(xpathFilter(doc, '//*[@id="test-split-lb"]/name')[0].getAttribute("role")).to.be.equal("test");
        expect(xpathFilter(doc, '//*[@id="test-split-lb"]/name')[1].getAttribute("role")).to.be.equal("test");
    });
    it("separer_controlaccess_separator", function () {
        const xpathExpr = '//*[@id="cypress-test-ca-separator"]/persname';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(1);
        expect(matchesBefore[0].textContent).to.be.equal("Top, Jean Frédéric ;;; Pog, Auguste");
        expect(matchesBefore[0].getAttribute("role")).to.be.equal("notaire");

        doc = recipes.separer_controlaccess_separator(immutable.Map({ separator: ";;;"}))(doc);
        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(2);
        expect(matchesAfter[0].textContent).to.be.equal("Top, Jean Frédéric");
        expect(matchesAfter[1].textContent).to.be.equal("Pog, Auguste");
        expect(matchesAfter[0].getAttribute("role")).to.be.equal("notaire");
        expect(matchesAfter[1].getAttribute("role")).to.be.equal("notaire");
    });
    it("deplacer_genreform_physdesc", function () {
        const xpathExpr = '//c[@id="test-genreform-physdesc"]/did/physdesc/genreform';
        const matchesBefore = xpathFilter(doc, xpathExpr);
        expect(matchesBefore.length).to.be.equal(0);
        expect(xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc').length).to.be.equal(0);
        expect(xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/controlaccess/*').length).to.be.equal(3);

        doc = recipes.deplacer_genreform_physdesc()(doc);
        expect(xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc').length).to.be.equal(1);
        const matchesAfter = xpathFilter(doc, xpathExpr);
        expect(matchesAfter.length).to.be.equal(2);
        expect(xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/controlaccess/*').length).to.be.equal(1);
        expect(xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc/genreform[@role="test"]').length).to.be.equal(1);
        expect(xpathFilter(doc, '//c[@id="test-genreform-physdesc"]/did/physdesc/genreform[@source="genreform"]').length).to.be.equal(2);
    });
    it("deplacer_unitdate_unittitle", function () {
        const ficheC1 = xpathFilter(doc, '//c[@id="test-unitdate-1"]')[0];
        expect(xpathFilter(doc, ficheC1, 'did/unittitle/unitdate').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC1, 'did/unitdate').length).to.be.equal(0);

        const ficheC2 = xpathFilter(doc, '//c[@id="test-unitdate-2"]')[0];
        expect(xpathFilter(doc, ficheC2, 'did/unittitle/unitdate').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC2, 'did/unitdate').length).to.be.equal(1);

        const ficheC3 = xpathFilter(doc, '//c[@id="test-unitdate-3"]')[0];
        expect(xpathFilter(doc, ficheC3, 'did/unittitle/unitdate').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC3, 'did/unitdate').length).to.be.equal(1);

        doc = recipes.deplacer_unitdate_unittitle()(doc);

        expect(xpathFilter(doc, ficheC1, 'did/unittitle/unitdate').length).to.be.equal(0);
        expect(xpathFilter(doc, ficheC1, 'did/unitdate').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC1, 'did/unitdate')[0].getAttribute("normal")).to.be.equal("1900");
        expect(xpathFilter(doc, ficheC1, 'did/unitdate')[0].textContent).to.be.equal("Année 1900");
        expect(xpathFilter(doc, ficheC1, 'did/unittitle')[0].textContent).to.be.equal("test-unitdate-1 Année 1900");

        expect(xpathFilter(doc, ficheC2, 'did/unittitle/unitdate').length).to.be.equal(0);
        expect(xpathFilter(doc, ficheC2, 'did/unitdate').length).to.be.equal(2);
        expect(xpathFilter(doc, ficheC2, 'did/unitdate')[0].getAttribute("normal")).to.be.equal("2000");
        expect(xpathFilter(doc, ficheC2, 'did/unitdate')[0].hasAttribute("type")).to.be.false;
        expect(xpathFilter(doc, ficheC2, 'did/unitdate')[1].getAttribute("normal")).to.be.equal("2000");
        expect(xpathFilter(doc, ficheC2, 'did/unitdate')[1].hasAttribute("type")).to.be.true;
        expect(xpathFilter(doc, ficheC2, 'did/unitdate')[1].getAttribute("type")).to.be.equal("test");
        expect(xpathFilter(doc, ficheC2, 'did/unitdate')[1].textContent).to.be.equal("Année 2000");
        expect(xpathFilter(doc, ficheC2, 'did/unittitle')[0].textContent).to.be.equal("test-unitdate-2 Année 2000");

        expect(xpathFilter(doc, ficheC3, 'did/unittitle/unitdate').length).to.be.equal(0);
        expect(xpathFilter(doc, ficheC3, 'did/unitdate').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC3, 'did/unitdate')[0].getAttribute("normal")).to.be.equal("3000");
        expect(xpathFilter(doc, ficheC3, 'did/unitdate')[0].getAttribute("type")).to.be.equal("test");
        expect(xpathFilter(doc, ficheC3, 'did/unitdate')[0].textContent).to.be.equal("Année 3000");
        expect(xpathFilter(doc, ficheC3, 'did/unittitle')[0].textContent).to.be.equal("test-unitdate-3 Année 3000");
    });
    it("deplacer_dans_did", function () {
        const archdesc = xpathFilter(doc, '//archdesc')[0];
        expect(xpathFilter(doc, archdesc, 'did/physdesc').length).to.be.equal(0);
        expect(xpathFilter(doc, archdesc, 'did/physdesc/extent').length).to.be.equal(0);
        expect(xpathFilter(doc, archdesc, 'physdesc').length).to.be.equal(1);

        const ficheC1 = xpathFilter(doc, '//c[@id="test-deplacer-dans-did-1"]')[0];
        expect(xpathFilter(doc, ficheC1, 'did/physdesc').length).to.be.equal(0);
        expect(xpathFilter(doc, ficheC1, 'did/physloc').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC1, 'physdesc').length).to.be.equal(1);

        const ficheC2 = xpathFilter(doc, '//c[@id="test-deplacer-dans-did-2"]')[0];
        expect(xpathFilter(doc, ficheC2, 'did').length).to.be.equal(0);
        expect(xpathFilter(doc, ficheC2, 'physloc').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC2, 'physdesc').length).to.be.equal(1);

        doc = recipes.deplacer_dans_did(IMap({balises: "physdesc|physloc"}))(doc);

        expect(xpathFilter(doc, archdesc, 'did/physdesc').length).to.be.equal(1);
        expect(xpathFilter(doc, archdesc, 'did/physdesc/extent').length).to.be.equal(1);
        expect(xpathFilter(doc, archdesc, 'did/physdesc/extent')[0].textContent).to.be.equal("TEST");
        expect(xpathFilter(doc, archdesc, 'physdesc').length).to.be.equal(0);

        expect(xpathFilter(doc, ficheC1, 'did/physdesc').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC1, 'did/physloc').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC1, 'physdesc').length).to.be.equal(0);

        expect(xpathFilter(doc, ficheC2, 'did').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC2, 'did/physdesc').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC2, 'did/physloc').length).to.be.equal(1);
        expect(xpathFilter(doc, ficheC2, 'physloc').length).to.be.equal(0);
        expect(xpathFilter(doc, ficheC2, 'physdesc').length).to.be.equal(0);
    });
});
