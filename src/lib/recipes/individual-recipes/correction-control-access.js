//@flow
import { xpathFilter } from "../../xml.js";
import { getTagAndAttributes } from "../../utils.js";
import { each } from "../utils.js";
import { curry } from "ramda";
import { Map } from "immutable";
import type { ExecuteState } from "../types.js";
/**
 * Corriger les controlacces à partir des corrections fournies par csv
 * This function is curryable
 */
export default curry<ExecuteState, Document, Document>((state: ExecuteState, doc: Document): Document => {
    if (!Map.isMap(state.get("corrections")) || typeof state.get("corrections") === "undefined") {
        return doc;
    }
    const corrections = state.get("corrections");
    if (corrections) {
        corrections.forEach((correction: Map<string, any>, controlaccess: string) => {
            if (!controlaccess || controlaccess.trim() === "") return;
            const occurrences = xpathFilter(doc, `//${controlaccess}`);
            each(occurrences, (occurrence) => {
                const terme = occurrence.innerHTML.trim();
                if (terme === "") return;
                if (correction.has(terme)) {
                    // get the original attributes
                    const attrs = {};
                    if (occurrence.hasAttributes()) {
                        // eslint-disable-next-line no-unused-vars
                        for (let attr of occurrence.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                    }
                    const parent = occurrence.parentNode;
                    if (!parent) return;
                    // remove the original controlaccess
                    occurrence.remove();
                    const correctionsTerme = correction.get(terme);
                    // if we have replacements, use them
                    if (correctionsTerme && correctionsTerme.size > 0) {
                        correctionsTerme.forEach((nouveauTerme) => {
                            const nouveauControlAccess = nouveauTerme.last();
                            const { tag, attributes } = getTagAndAttributes(nouveauControlAccess);
                            const el = doc.createElement(tag);
                            el.innerHTML = nouveauTerme.first();
                            // set the old attributes back
                            each(attrs, (attrValue, attrName) => el.setAttribute(attrName, attrValue));
                            // add new attributes
                            each(attributes, (nouvelAttr) => el.setAttribute(nouvelAttr[0], nouvelAttr[1]));
                            parent.appendChild(el);
                        });
                    }
                }
            });
        });
    }
    return doc;
});
