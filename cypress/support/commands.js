/* eslint-disable */

Cypress.Commands.add('upload_file', (fileName, selector, contentType) => {
    cy.get(selector).then(subject => {
        cy.fixture(fileName, 'base64').then((content) => {
            const el = subject[0];
            const blob = b64toBlob(content, contentType);
            const testFile = new File([blob], fileName, { type: contentType || "", lastModified: new Date() });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(testFile);
        });
    });
});
Cypress.Commands.add(
    "attach_file",
    {
      prevSubject: "element"
    },
    ($input, dataTransfer) => {
      $input[0].files = dataTransfer.files;
      return $input;
    }
);
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    blob.lastModifiedDate = new Date();
    return blob;
}