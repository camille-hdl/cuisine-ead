//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import type { Map } from "immutable";

export default (args: Map<string, any>) => (doc: Document): Document => {
    const sourceValue = args.get("source");
    if (typeof sourceValue === "undefined") return doc;
    const elems = xpathFilter(doc, "//controlaccess/geogname");
    each(elems, (elem) => {
        elem.setAttribute("source", sourceValue);
    });
    return doc;
};
