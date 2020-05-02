//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//geogname");
    each(elems, (elem) => {
        if (!elem.hasAttribute("source")) {
            elem.setAttribute("source", "geogname");
        }
    });

    return doc;
};
