//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//did/scopecontent');
    each(elems, (elem) => {
        elem.parentNode.insertAdjacentElement("afterend", elem);
    });
    return doc;
};
