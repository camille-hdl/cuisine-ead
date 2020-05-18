//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
/**
 * Ligeo
 */
export default () => (doc: Document): Document => {
    const accessRestrics = xpathFilter(doc, '//accessrestrict[@type="modalites-acces"]');
    each(accessRestrics, (elem) => {
        elem.setAttribute("type", "delai");
        elem.setAttribute("id", "ligeo-2");
    });
    return doc;
};
