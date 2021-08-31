/* eslint-disable */
/**
 * Set in `before`
 */
 let xmlStringRoot = "";
 let xmlStringChild = "";
 let win = null;
 let xpathFilter = null;
 let recipes = null;
 let insertIntoDocument = null;
 let IMap, List, fromJS, immutable;
 /**
  * Reset in `beforeEach`
  */
 let docRoot = null;
 let docChild = null;
 
 describe("Merging documents into one", function () {
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
         cy.fixture("merge/root.xml", "utf-8").then((xml) => {
            xmlStringRoot = xml;
         });
         cy.fixture("merge/child.xml", "utf-8").then((xml) => {
            xmlStringChild = xml;
         });
         cy.window().its('Cypress').should('be.an', 'object');
         cy.window().its('__cypress_immutable').should('exist');
 
         cy.window().then((w) => {
             win = w;
             xpathFilter = win.__cypress_xpathFilter;
             recipes = win.__cypress_recipes;
             immutable = win.__cypress_immutable;
             insertIntoDocument = win.__cypress_insertIntoDocument;
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
         docRoot = parser.parseFromString(xmlStringRoot, "application/xml");
         docChild = parser.parseFromString(xmlStringChild, "application/xml");
         const anchor = xpathFilter(docRoot, "//archref")[0];
         insertIntoDocument(docRoot, docChild, anchor);
     });
     it("Should have been inserted in the right node", function () {
        const insertedC = xpathFilter(docRoot, '//c[@id="doc_1"]/c');
        expect(insertedC.length).to.equal(3);
     });
     it("Should have removed the anchor element", function () {
        const matchesAfter = xpathFilter(docRoot, "//archref");
        expect(matchesAfter.length).to.equal(0);
     });
     it("Should have inserted a new node with archdesc metadata", function () {
        const insertedRoot = xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]');
        expect(insertedRoot.length).to.equal(1);
        const insertedCA = xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/controlaccess');
        expect(insertedCA.length).to.equal(1);
        const insertedPersname = xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/controlaccess/persname');
        expect(insertedPersname.length).to.equal(1);
        const insertedUnitid = xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/did/unitid');
        expect(insertedUnitid.length).to.equal(1);
     });
     it("Should have prefixed inserted IDs", function () {
        const insertedC = xpathFilter(docRoot, '//c[@id="CHILD_XML-root"]/c');
        expect(insertedC[0].getAttribute("id")).to.equal("CHILD_XML-doc_1");
     });
 });
 