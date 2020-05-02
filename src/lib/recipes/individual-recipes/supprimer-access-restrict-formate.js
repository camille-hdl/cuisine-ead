//@flow
import { xpathFilter } from "../../xml.js";
import { each, nodeIsEmpty } from "../utils.js";
/**
 * Mnesys
 * Remove empty accessrestrict[type=formate]
 */
export default () => (doc: Document): Document => {
    const accRestricts = xpathFilter(doc, '//accessrestrict[@type="formate"]');
    each(accRestricts, (accRestrict) => {
        if (nodeIsEmpty(accRestrict)) {
            accRestrict.remove();
        }
    });
    return doc;
};
