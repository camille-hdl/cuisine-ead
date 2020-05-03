//@flow
import { xpathFilter } from "../../xml.js";
import { trySetInnerHTML } from "../../utils.js";
import { last } from "ramda";
import type { Map } from "immutable";
/**
 * if there is no origination tag, it will be created in archdesc/did
 * Expects arg `origination` (string, can contain xml).
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const newOrigination = args.get("origination");
    if (typeof newOrigination === "undefined") return doc;
    const origination = last(xpathFilter(doc, "//origination"));
    if (origination) {
        trySetInnerHTML(origination, newOrigination);
        return doc;
    }
    // creer un origination
    const did = last(xpathFilter(doc, "//archdesc/did"));
    if (did) {
        const origination = doc.createElement("origination");
        trySetInnerHTML(origination, newOrigination);
        did.appendChild(origination);
    }
    return doc;
};
