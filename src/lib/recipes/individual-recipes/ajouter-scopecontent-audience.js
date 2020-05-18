//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//scopecontent");
    each(elems, (elem) => {
        if (!elem.hasAttribute("audience")) {
            elem.setAttribute("audience", "external");
        }
    });

    return doc;
};
