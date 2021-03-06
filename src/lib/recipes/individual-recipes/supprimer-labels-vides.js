//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//*[@label=""]');
    each(elems, (elem) => elem.removeAttribute("label"));
    return doc;
};
