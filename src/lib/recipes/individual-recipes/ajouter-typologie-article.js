//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { head } from "ramda";

/**
 * Ajouter un controlaccess genreform[source=typologie]
 * sur les fiches C niveau article (sans enfants)
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const genreformValue = args.has("valeur") ? args.get("valeur") : null;
    if (!genreformValue) return doc;
    const elems = xpathFilter(doc, "//c");
    each(elems, (elem) => {
        const childrenC = xpathFilter(doc, elem, "c");
        if (childrenC.length > 0) return;

        const controlaccesses = xpathFilter(doc, elem, "controlaccess");
        const shouldCreateControlaccess = controlaccesses.length <= 0;
        const controlaccess = shouldCreateControlaccess ? doc.createElement("controlaccess") : head(controlaccesses);
        const genreform = doc.createElement("genreform");
        genreform.setAttribute("source", "typologie");
        genreform.textContent = genreformValue;
        controlaccess.appendChild(genreform);
        if (shouldCreateControlaccess) {
            elem.appendChild(controlaccess);
        }
    });
    return doc;
};
