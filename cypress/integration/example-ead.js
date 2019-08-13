/* eslint-disable */

/**
 * Add a file, add a few recipes, go to the last page
 */
describe('Happy path', function () {
    beforeEach(() => {
        if (window.navigator && navigator.serviceWorker) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister();
            });
          });
        }
    });
    it("Add and modify a file", function () {
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
        const dropEvent = {
            dataTransfer: {
                files: [
                ],
                types:["Files"]
            },
        };
        cy.fixture('example-ead.xml', 'base64').then((picture) => {
            return Cypress.Blob.base64StringToBlob(picture, '').then((blob) => {
                const testFile = new File([blob], 'example-ead.xml', { type: "application/xml", lastModified: new Date() });
                dropEvent.dataTransfer.files.push(testFile);
            });
        });
        cy.get('[data-cy=dropzone]').trigger('drop', dropEvent);
        /**
         * The file should have been added
         */
        cy.get("[data-cy=file-list]").should("exist");
        cy.get("[data-cy=file-list-text]").first().contains("Fonds Saint-Exupery (1911-1944)");
        
        cy.get("[data-cy=next-step-link]").should("be.visible");
        cy.get("[data-cy=next-step-link]").click();
        cy.url().should("contain", "/recettes");

        cy.get("[data-cy=prev-step-link]").should("be.visible");
        cy.get("[data-cy=next-step-link]").should("not.be.visible");
        cy.get("[data-cy=recipe-key]").first().click();
        cy.get("[data-cy=recipe-key]").parent().parent().find("input[type=checkbox]").should("be.checked");
        cy.get("[data-cy=next-step-link]").should("be.visible");
        cy.get("[data-cy=recipe-key]").eq(2).click();
        cy.get("[data-cy=toggle-preview]").click();
        cy.get("[data-cy=preview-warning]").should("be.visible");
        cy.get("[data-cy=preview-warning]").parent().find("table");
        cy.get("[data-cy=preview-exit]").click();
        cy.get("[data-cy=preview-warning]").should("not.be.visible");
        cy.get("[data-cy=next-step-link]").click();


        cy.url().should("contain", "/resultats");
        cy.get("[data-cy=download-link]").contains("Fichiers séparés");
        cy.get("[data-cy=download-link]").parent().find("button");
    });

});