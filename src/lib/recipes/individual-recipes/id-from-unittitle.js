//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { head, map } from "ramda";

const MAX_CHARS = 150;

/**
 * Générer un id, à partir du unittile s'il existe
 */
export default () => (doc: Document): Document => {
    const withoutId = xpathFilter(doc, "//c[not(@id) or @id=\"\"]");
    /**
     * On est susceptibles de générer beaucoup d'ids à partir d'une même chaine,
     * donc on utilise countersById pour stocker le dernier `counter` associé à une chaine
     * pour éviter de boucler inutilement
     */
    const countersById = {};
    each(withoutId, (c) => {
        const unittitle = head(xpathFilter(doc, c, "did/unittitle"));
        const suggestedId = `c${unittitle && unittitle.textContent ? safeID(unittitle.textContent.trim()) : parentIDs(c, doc)}`
        const idRoot = suggestedId.slice(0, MAX_CHARS);
        let counter = countersById[suggestedId] ?? 0;
        let candidateId = `${idRoot}-${counter}`;
        while(xpathFilter(doc, `//*[@id="${candidateId}"]`).length > 0) {
            counter++;
            candidateId = `${suggestedId}-${counter}`;
        }
        counter++;
        countersById[suggestedId] = counter;
        c.setAttribute("id", candidateId);
    });
    return doc;
};

const rejectedCharsRE = /[^a-zA-Z0-9\-_]/gm;
function safeID(input: string): string {
    return input.replace(rejectedCharsRE, "_").toLowerCase();
}

function parentIDs(element: Element, doc: Document): string {
    const parents = xpathFilter(doc, element, "ancestor::c[@id]");
    const ids = map((parent) => {
        return parent.getAttribute("id").trim();
    }, parents);
    return ids.join("-").toLowerCase();
}