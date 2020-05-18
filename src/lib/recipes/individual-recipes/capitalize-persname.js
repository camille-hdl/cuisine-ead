//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import capitalize from "capitalize";

const capitalizeRE = /( |^|.|;)([A-Z\-']+)( |,|;|.|$)/gm;
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//persname");
    each(elems, (elem) => {
        elem.innerHTML = elem.innerHTML.replace(capitalizeRE, (matched, p1, nom, p3) => {
            return [p1, capitalize(nom), p3].join("");
        });
    });

    return doc;
};
