//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//materialspec[@type="données mathématiques"]');
    each(elems, (elem) => {
        elem.setAttribute("type", "echelle");
    });
    return doc;
};
