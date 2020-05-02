//@flow
import { xpathFilter } from "../../xml.js";
import { each, getAttributesMap } from "../utils.js";

/**
 * Add `level=file` attribute on `c` tags satisfying:
 * * no `c` children
 * * no existing `level` attribute
 */
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//c");
    each(elems, (elem) => {
        const childrenC = xpathFilter(doc, elem, "c");
        if (childrenC.length > 0) return;
        const attrs = getAttributesMap(elem);
        if (!attrs.level) {
            elem.setAttribute("level", "file");
        }
    });
    return doc;
};
