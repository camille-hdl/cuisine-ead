//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//unitdate");
    each(elems, (elem) => {
        if (elem.hasAttribute("normal")) {
            elem.removeAttribute("normal");
        }
    });

    return doc;
};
