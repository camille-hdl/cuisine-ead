//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { last } from "ramda";
/**
 * Set origination from unittitle
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const expectedTitle = args.get("expectedTitle") ?? "";
    const expectedValues = ("" + expectedTitle).split("|").map((s) => s.toLocaleLowerCase("fr"));
    const unittitles = xpathFilter(doc, "//unittitle");
    each(unittitles, (elem) => {
        const content = ("" + elem.textContent).trim();
        if (expectedValues.includes(content.toLocaleLowerCase("fr"))) {
            const node = doc.createTextNode(content);
            const did = elem.parentNode;
            const origination = last(xpathFilter(doc, did, "origination")) ?? doc.createElement("origination");
            origination.appendChild(node);
            if (origination.parentNode !== did) {
                did.appendChild(origination);
            }
        }
    });
    return doc;
};
