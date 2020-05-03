//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//c[@id]");
    each(elems, (elem) => elem.removeAttribute("id"));
    return doc;
};
