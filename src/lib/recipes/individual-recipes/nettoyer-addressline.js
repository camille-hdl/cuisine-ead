//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

/**
 * Remove `<address>` tags
 */
export default () => (doc: Document): Document => {
    const adresses = xpathFilter(doc, "//address");
    each(adresses, (element) => {
        element.remove();
    });
    return doc;
};
