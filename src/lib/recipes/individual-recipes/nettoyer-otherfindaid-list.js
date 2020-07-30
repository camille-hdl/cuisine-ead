//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
/**
 * Remove `//otherfindaid/list/item` tags but keep their content
 */
export default () => (doc: Document): Document => {
    const items = xpathFilter(doc, "//otherfindaid/list/item");
    keepChildrenAndRemove(items);
    const lists = xpathFilter(doc, "//otherfindaid/list");
    keepChildrenAndRemove(lists);
    return doc;
};

function keepChildrenAndRemove(items: Array<Element>) {
    each(items, (element) => {
        if (element.childNodes) {
            element.replaceWith(...element.childNodes);
        } else {
            element.remove();
        }
    });
}
