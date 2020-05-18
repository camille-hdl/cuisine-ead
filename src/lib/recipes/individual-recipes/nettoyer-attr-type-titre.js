//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//*[@type="titre"]');
    each(elems, (elem) => elem.removeAttribute("type"));
    return doc;
};
