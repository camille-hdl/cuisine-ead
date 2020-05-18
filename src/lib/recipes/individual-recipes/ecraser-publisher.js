//@flow
import { xpathFilter } from "../../xml.js";
import { trySetInnerHTML } from "../../utils.js";
import { last } from "ramda";
/**
 * if there is no publisher tag, it will be created in publicationstmt
 * Expects arg `publisher` (string)
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const newPublisher = args.get("publisher");
    if (typeof newPublisher === "undefined") return doc;
    const publisher = last(xpathFilter(doc, "//publisher"));
    if (publisher) {
        trySetInnerHTML(publisher, newPublisher);
        return doc;
    }
    // creer un publisher
    const publicationstmt = last(xpathFilter(doc, "//publicationstmt"));
    if (publicationstmt) {
        const publisher = doc.createElement("publisher");
        trySetInnerHTML(publisher, newPublisher);
        publicationstmt.appendChild(publisher);
    }
    return doc;
};
