//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { filter } from "ramda";
export default () => (doc: Document): Document => {
    const heads = filter((el) => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//head"));
    each(heads, (element) => element.remove());
    return doc;
};
