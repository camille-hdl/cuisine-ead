//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
const whitespaceRE = /(\t|\n *|\r *| {2,})/gm;
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//text()");
    each(elems, (elem) => {
        if (elem.textContent && elem.textContent.trim() !== "") {
            // il faut potentiellement faire l'operation plusieurs fois
            // car un remplacement peut créer un nouveau double espace par exemple
            do {
                elem.textContent = elem.textContent.replace(whitespaceRE, " ");
            } while (whitespaceRE.test(elem.textContent));
        }
    });

    return doc;
};
