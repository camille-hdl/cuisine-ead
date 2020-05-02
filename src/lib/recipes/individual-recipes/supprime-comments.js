//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//comment()");
    each(elems, (comment) => comment.remove());

    return doc;
};
