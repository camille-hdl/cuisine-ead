//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//unitdate[@normal="0"]');
    each(elems, (elem) => elem.setAttribute("normal", "s.d."));

    return doc;
};
