//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
/**
 * Changes `origination/name` to `origination/corpname`
 */
export default () => (doc: Document): Document => {
    const names = xpathFilter(doc, "//origination/name");
    each(names, (name) => {
        const corpname = doc.createElement("corpname");
        if (name.childNodes) {
            each(name.childNodes, (c) => corpname.appendChild(c));
        }
        if (name.hasAttributes()) {
            for (let attr of name.attributes) {
                corpname.setAttribute(attr.name, attr.value);
            }
        }
        name.replaceWith(corpname);
    });
    return doc;
};
