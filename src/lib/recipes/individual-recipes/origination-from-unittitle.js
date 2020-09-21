//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { last } from "ramda";
/**
 * Set origination from unittitle
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const expectedTitle = args.get("titre") ?? "";
    const expectedValues = ("" + expectedTitle).split("|").map((s) => s.toLocaleLowerCase("fr"));
    const unittitles = xpathFilter(doc, "//unittitle");
    each(unittitles, (elem) => {
        const content = ("" + elem.textContent).trim();
        if (expectedValues.includes(content.toLocaleLowerCase("fr"))) {
            const did = elem.parentNode;
            const origination = last(xpathFilter(doc, did, "./origination")) ?? doc.createElement("origination");
            origination.appendChild(doc.createTextNode(content));
            if (origination.parentNode !== did) {
                did.appendChild(origination);
            }
        }
    });
    return doc;
};
