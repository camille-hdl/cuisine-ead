/* eslint-disable */

const corrections = `controlaccess;valeur corrigée;valeur originale
cypressca;CYPRESS1;originalvalue
cypressca=>cypressca[source=CYPRESS];CYPRESS2;originalvalue`;

describe('Smoke test', function () {
    before(() => {
        if (window.navigator && navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }
    });
    it("Should let you add files", function () {
        cy.on('uncaught:exception', (err, runnable) => {
            /**
             * DO NOT REMOVE
             * otherwise cypress crashes with electron
             */
            return false
        });
        cy.visit('/');
        cy.get("h1").should("contain", "Cuisine EAD");

        cy.get("[data-cy=start-button").click();
        cy.url().should("contain", "/upload");
        
        cy.get("[data-cy=next-step-link]").should("not.be.visible");
        const dt = new DataTransfer();
        const dropEvent = {
            dataTransfer: dt,
        };
        cy.fixture('example-ead.xml', 'base64').then((file) => {
            const blob = Cypress.Blob.base64StringToBlob(file, '');
            const testFile = new File([blob], 'example-ead.xml', { type: "application/xml", lastModified: new Date() });
            dropEvent.dataTransfer.items.add(testFile);
        });
        cy.fixture('example-correction.csv', 'base64').then((file) => {
            const blob = Cypress.Blob.base64StringToBlob(file, '');
            const testFile = new File([blob], 'example-correction.csv', { type: "text/csv", lastModified: new Date() });
            /**
             * FIXME: Papaparse ne fonctionne pas correctement avec cypress
             */
            testFile.__CYPRESS = corrections;
            dropEvent.dataTransfer.items.add(testFile);
        });
        cy.get('[data-cy=dropzone]').trigger('drop', dropEvent);
        /**
         * The file should have been added
         */
        cy.get("[data-cy=file-list]").should("exist");
        cy.get("[data-cy=file-list-text]").first().contains("Fonds Saint-Exupery (1911-1944)");
        cy.get("body").contains("1 correction de controlaccess");
        
        cy.get("[data-cy=next-step-link]").should("be.visible");
    });
    it("Should let you download controlaccess", function() {
        cy.get("[data-cy=download-ca]").click();
        cy.window().its("__CYPRESS_OUTPUT_CA").should("contain", "originalvalue");
    });
    it("Should not let you go to the results without recipes", function () {
        cy.get("[data-cy=next-step-link]").click();
        cy.get("[data-cy=next-step-link]").should("not.be.visible");
        cy.get("[data-cy=download-results]").should("not.be.visible");
    });
    it("Should let you add all recipes", function() {
        cy.url().should("contain", "/recettes");
        cy.get("[data-cy=prev-step-link]").should("be.visible");
        cy.get("[data-cy=recipe-key]").first().parent().parent().find("input[type=checkbox]").should("not.be.checked");
        cy.get("[data-cy=recipe-key]").first().click();
        cy.get("[data-cy=recipe-key]").first().parent().parent().find("input[type=checkbox]").should("be.checked");
        cy.window().then(win => {
            win.__CYPRESS_addAllRecipes();
        })
        cy.get("[data-cy=recipe-key]").each(($el, index, $list) => {
            cy.wrap($el).parent().parent().find("input[type=checkbox]").should("be.checked");
        });
        cy.get("[data-recipe-key=supprimer_controlaccess]").click();
        cy.get("[data-recipe-key=supprimer_controlaccess]").parent().parent().find("input[type=checkbox]").should("not.be.checked");
    });
    it("Should let you preview changes", function () {
        cy.get("[data-cy=toggle-preview]").click();
        cy.get("[data-cy=preview-warning]").should("be.visible");
        cy.get("[data-cy=preview-warning]").parent().find("table");
        cy.get("[data-cy=preview-exit]").click();
        cy.get("[data-cy=preview-warning]").should("not.be.visible");
    });
    it("Should let you download the result", function () {
        cy.get("[data-cy=download-results]").should("be.visible");
        cy.get("[data-cy=download-results]").click();
        cy.window().its("__CYPRESS_OUTPUT_READY").should("exist");
        cy.window().its("__CYPRESS_OUTPUT").should("have.length", 1);
        cy.window().then(win => {
            const result = win.__CYPRESS_OUTPUT[0];
            expect(result.str).to.contain("CYPRESS1");
        });
    });
    it("Should let you go the the results page", function () {
        cy.get("[data-cy=next-step-link]").should("be.visible");
        cy.get("[data-cy=next-step-link]").click();
        cy.url().should("contain", "/resultats");
        cy.get("[data-cy=download-link]").contains("Fichiers séparés");
        cy.get("[data-cy=download-link]").parent().find("button");
    });
});