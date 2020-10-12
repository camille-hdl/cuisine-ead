//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { last, filter } from "ramda";
import capitalize from "capitalize";
/**
 * Set a controlaccess index from unittitle, NOT recursive
 * multi-values based on a separator
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const expectedTitle = args.get("titres") ?? "";
    const titleSeparator = args.get("separateurs") ?? ",|et";
    const type = args.get("type") ?? "";
    const tag = args.get("index") ?? "";
    if (!tag) return doc;
    const expectedValues = ("" + expectedTitle).split("|").map((s) => s.toLocaleLowerCase("fr").trim());
    const separateurs = ("" + titleSeparator).split("|").map((s) => s.trim());
    const unittitles = xpathFilter(doc, "//unittitle");
    each(unittitles, (elem) => {
        const contents = ("" + elem.textContent)
            .trim()
            .replace(new RegExp(`(${separateurs.join(")|(")})`, "g"), "||")
            .split("||")
            .map((s) => s.trim());
        const addIndex = (ficheC: Element, content) => {
            const index = doc.createElement(tag);
            index.textContent = capitalize(content);
            if (type !== "") {
                index.setAttribute("type", type);
            }
            const controlaccess =
                last(xpathFilter(doc, ficheC, "./controlaccess")) ?? doc.createElement("controlaccess");
            const alreadyHasIndex =
                filter((gf) => {
                    const textContentMatches = ("" + gf.textContent).trim() === content;
                    const attributeMatches =
                        type === "" || (gf.hasAttribute("type") && gf.getAttribute("type") === type);
                    return textContentMatches && attributeMatches;
                }, xpathFilter(doc, controlaccess, `./${tag}`)).length > 0;
            if (!alreadyHasIndex) {
                controlaccess.appendChild(index);
                if (controlaccess.parentNode !== ficheC) {
                    ficheC.appendChild(controlaccess);
                }
            }
        };
        each(contents, (content) => {
            if (expectedValues.includes(content.toLocaleLowerCase("fr"))) {
                const ficheC = elem.parentNode.parentNode;
                addIndex(ficheC, content);
            }
        });
    });
    return doc;
};
