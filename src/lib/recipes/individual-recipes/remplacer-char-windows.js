//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { replaceMSChars } from "../../ms-chars.js";
export default () => (doc: Document): Document => {
    const textElems = xpathFilter(doc, "//text()");
    // textes
    each(textElems, (elem) => {
        if (elem.textContent && elem.textContent.trim() !== "") {
            elem.textContent = replaceMSChars(elem.textContent);
        }
    });
    // attributs
    const elems = xpathFilter(doc, "//*");
    each(elems, (elem) => {
        if (elem.hasAttributes()) {
            // eslint-disable-next-line no-unused-vars
            for (let attr of elem.attributes) {
                elem.setAttribute(attr.name, replaceMSChars(attr.value));
            }
        }
    });

    return doc;
};
