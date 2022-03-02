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
    each(withoutId, (c) => {
        const unittitle = head(xpathFilter(doc, c, "did/unittitle"));
        let suggestedId = `c${unittitle && unittitle.textContent ? safeID(unittitle.textContent.trim()) : parentIDs(c, doc)}`
        let counter = 0;
        let candidateId = `${suggestedId.slice(0, MAX_CHARS)}-${counter}`;
        while(xpathFilter(doc, `//*[@id="${candidateId}"]`).length > 0) {
            counter++;
            candidateId = `${suggestedId}-${counter}`;
        }
        c.setAttribute("id", candidateId);
    });
    return doc;
};

const rejectedCharsRE = /[^a-zA-Z0-9\-_]/gm;
function safeID(input: string): string {
    return input.replace(rejectedCharsRE, "_");
}

function parentIDs(element: Element, doc: Document): string {
    const parents = xpathFilter(doc, element, "ancestor::c[@id]");
    const ids = map((parent) => {
        return parent.getAttribute("id").trim();
    }, parents);
    return ids.join("-");
}