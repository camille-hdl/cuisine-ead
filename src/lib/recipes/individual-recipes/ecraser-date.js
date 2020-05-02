//@flow
import { xpathFilter } from "../../xml.js";
import { trySetInnerHTML } from "../../utils.js";
import { last } from "ramda";

/**
 * if there is no date tag, it will be created in publicationstmt
 * Expects arg `date` (string, year).
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const newDate = args.get("date");
    if (typeof newDate === "undefined") return doc;
    const pubDate = last(xpathFilter(doc, "//publicationstmt/date"));
    if (pubDate) {
        trySetInnerHTML(pubDate, newDate);
        pubDate.setAttribute("normal", newDate);
        return doc;
    }
    // creer un pubDate
    const publicationstmt = last(xpathFilter(doc, "//publicationstmt"));
    if (publicationstmt) {
        const pubDate = doc.createElement("date");
        trySetInnerHTML(pubDate, newDate);
        pubDate.setAttribute("normal", newDate);
        publicationstmt.appendChild(pubDate);
    }
    return doc;
};
