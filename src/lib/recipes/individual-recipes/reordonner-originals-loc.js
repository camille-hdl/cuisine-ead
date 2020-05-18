//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

/**
 * Ligeo
 * Reorder children of `<c>` tags like so:
 *
 * 1. `<did>`
 * 2. `<originalsloc>`
 * 3. `<scopecontent>`
 * 4. ...rest
 */
export default () => (doc: Document): Document => {
    const components = xpathFilter(doc, "//c");
    const getChildType = (child: HTMLElement): string => {
        if (child.tagName) {
            if (child.tagName === "did") return "did";
            if (child.tagName === "originalsloc") return "originalsloc";
            if (child.tagName === "scopecontent") return "scopecontent";
        }
        return "rest";
    };
    const addListToElem = (elem: HTMLElement, childList: Array<HTMLElement>): HTMLElement => {
        if (childList.length > 0) {
            elem.append(...childList);
        }
        return elem;
    };
    each(components, (elem) => {
        if (elem.children) {
            const childrenByType = {
                did: [],
                originalsloc: [],
                scopecontent: [],
                rest: [],
            };
            each(elem.children, (child) => {
                if (child) {
                    childrenByType[getChildType(child)].push(child);
                }
            });
            elem = addListToElem(elem, childrenByType.did);
            elem = addListToElem(elem, childrenByType.originalsloc);
            elem = addListToElem(elem, childrenByType.scopecontent);
            elem = addListToElem(elem, childrenByType.rest);
        }
    });
    return doc;
};
