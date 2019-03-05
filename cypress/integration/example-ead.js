/* eslint-disable */

/**
 * Add a file, add a few recipes, go to the last page
 */
describe('Happy path', function () {
   
    it("Add and modify a file", function () {
        
        cy.visit('/');
        cy.get("h1").should("contain", "Cuisine EAD");

        cy.get("[data-cy=start-button").click();
        cy.url().should("contain", "/upload");
        
        cy.get("[data-cy=next-step-link]").should("not.be.visible");
        const dropEvent = {
            dataTransfer: {
                files: [
                ],
            },
        };
        cy.fixture('example-ead.xml', 'base64').then((picture) => {
            return Cypress.Blob.base64StringToBlob(picture, '').then((blob) => {
                const testFile = new File([blob], 'example-ead.xml', { type: "application/xml", lastModified: new Date() });
                dropEvent.dataTransfer.files.push(testFile);
            });
        });
        cy.on('uncaught:exception', (err, runnable) => {
            return false
        });
        cy.get('[data-cy=file-uploader]').children().trigger('drop', dropEvent);
        cy.upload_file('example-ead.xml', '[data-cy=file-uploader] [type="file"]', "application/xml");
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