//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { last, filter } from "ramda";
/**
 * Set genreform from unittitle, recursively
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const expectedTitle = args.get("titre") ?? "";
    const type = args.get("type") ?? "";
    const expectedValues = ("" + expectedTitle).split("|").map((s) => s.toLocaleLowerCase("fr"));
    const unittitles = xpathFilter(doc, "//unittitle");
    each(unittitles, (elem) => {
        const content = ("" + elem.textContent).trim();
        if (expectedValues.includes(content.toLocaleLowerCase("fr"))) {
            const addGenreform = (ficheC: Element) => {
                const genreform = doc.createElement("genreform");
                genreform.textContent = content;
                if (type !== "") {
                    genreform.setAttribute("type", type);
                }
                const controlaccess =
                    last(xpathFilter(doc, ficheC, "./controlaccess")) ?? doc.createElement("controlaccess");
                const alreadyHasGenreform =
                    filter((gf) => {
                        const textContentMatches = ("" + gf.textContent).trim() === content;
                        const attributeMatches =
                            type === "" || (gf.hasAttribute("type") && gf.getAttribute("type") === type);
                        return textContentMatches && attributeMatches;
                    }, xpathFilter(doc, controlaccess, "./genreform")).length > 0;
                if (!alreadyHasGenreform) {
                    controlaccess.appendChild(genreform);
                    if (controlaccess.parentNode !== ficheC) {
                        ficheC.appendChild(controlaccess);
                    }
                }
            };
            const ficheC = elem.parentNode.parentNode;
            addGenreform(ficheC);
            const children = xpathFilter(doc, ficheC, "c");
            each(children, addGenreform);
        }
    });
    return doc;
};
