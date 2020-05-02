//@flow
import { xpathFilter } from "../../xml.js";
import { trySetInnerHTML } from "../../utils.js";
import { last } from "ramda";
/**
 * if there is no repository tag, it will be created in archdesc>did
 * Expects arg `repository` (string)
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const newRepository = args.get("repository");
    if (typeof newRepository === "undefined") return doc;
    const repository = last(xpathFilter(doc, "//repository"));
    if (repository) {
        trySetInnerHTML(repository, newRepository);
        return doc;
    }
    // creer un repository
    const did = last(xpathFilter(doc, "//archdesc/did"));
    if (did) {
        const repository = doc.createElement("repository");
        trySetInnerHTML(repository, newRepository);
        did.appendChild(repository);
    }
    return doc;
};
