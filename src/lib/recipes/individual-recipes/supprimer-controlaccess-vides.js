//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { filter } from "ramda";
export default () => (doc: Document): Document => {
    const controlaccesses = filter((el) => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//controlaccess"));
    each(controlaccesses, (element) => element.remove());
    return doc;
};
