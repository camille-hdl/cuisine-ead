//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

/**
 * Ajouter <accessrestrict type="incommunicable" id="ligeo-223">Document numérisé</accessrestrict>
 * sur les <c> sans enfants
 */
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//c");
    each(elems, (elem) => {
        const childrenC = xpathFilter(doc, elem, "c");
        if (childrenC.length > 0) return;

        const accessrestrict = xpathFilter(doc, elem, 'accessrestrict[@type="incommunicable"][@id="ligeo-223"]');
        if (accessrestrict.length <= 0) {
            const accessrestrict = doc.createElement("accessrestrict");
            accessrestrict.setAttribute("type", "incommunicable");
            accessrestrict.setAttribute("id", "ligeo-223");
            accessrestrict.textContent = "Document numérisé";
            elem.appendChild(accessrestrict);
        }
    });
    return doc;
};
