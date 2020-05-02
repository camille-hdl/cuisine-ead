//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//corpname");
    each(elems, (elem) => {
        if (!elem.hasAttributes()) {
            const subj = doc.createElement("subject");
            subj.setAttribute("source", "periode_thesaurus_w");
            if (elem.childNodes) {
                each(elem.childNodes, (c) => subj.appendChild(c));
            }
            elem.replaceWith(subj);
        }
    });
    return doc;
};
