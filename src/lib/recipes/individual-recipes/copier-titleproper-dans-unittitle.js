//@flow
import { xpathFilter } from "../../xml.js";
import { each, map } from "../utils.js";
import { filter, head } from "ramda";

/**
 * Si unititle n'existe pas, il sera créé
 */
export default (): ((doc: Document) => Document) => (doc: Document): Document => {
    const titleproper = head(xpathFilter(doc, "/ead/eadheader/filedesc/titlestmt/titleproper"));
    if (titleproper) {
        let unittitle = head(xpathFilter(doc, "/ead/archdesc/did/unittitle"));
        if (!unittitle) {
            const did = head(xpathFilter(doc, "/ead/archdesc/did"));
            unittitle = doc.createElement("unittitle");
            did.appendChild(unittitle);
        }
        unittitle.textContent = titleproper.textContent;
    }
    return doc;
};
