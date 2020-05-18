//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

/**
 * Add `level=file` attribute on `c` tags satisfying:
 * * no `c` children
 */
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//c");
    each(elems, (elem) => {
        const childrenC = xpathFilter(doc, elem, "c");
        if (childrenC.length > 0) return;
        elem.setAttribute("level", "file");
    });
    return doc;
};
