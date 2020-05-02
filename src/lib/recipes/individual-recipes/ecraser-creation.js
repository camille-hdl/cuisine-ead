//@flow
import { xpathFilter } from "../../xml.js";
import { trySetInnerHTML } from "../../utils.js";
import { last } from "ramda";
/**
 * if there is no creation tag, it will be created in profiledesc
 * Expects arg `creation` (string)
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const newCreation = args.get("creation");
    if (typeof newCreation === "undefined") return doc;
    const creation = last(xpathFilter(doc, "//creation"));
    if (creation) {
        trySetInnerHTML(creation, newCreation);
        return doc;
    }
    // creer un creation
    const profileDesc = last(xpathFilter(doc, "//profiledesc"));
    if (profileDesc) {
        const creation = doc.createElement("creation");
        trySetInnerHTML(creation, newCreation);
        profileDesc.appendChild(creation);
    }
    return doc;
};
