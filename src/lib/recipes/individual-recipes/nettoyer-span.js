//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

/**
 * Remove `<span>` tags but keep their content
 */
export default () => (doc: Document): Document => {
    const spans = xpathFilter(doc, "//span");
    each(spans, (element) => {
        if (element.childNodes) {
            element.replaceWith(...element.childNodes);
        } else {
            element.remove();
        }
    });
    return doc;
};
