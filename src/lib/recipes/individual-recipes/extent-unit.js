//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//extent[@type="nombre elements"]');
    each(elems, (elem) => {
        elem.removeAttribute("type");
        elem.setAttribute("unit", "feuille");
    });
    return doc;
};
