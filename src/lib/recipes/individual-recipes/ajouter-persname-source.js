//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import type { Map } from "immutable";

export default (args: Map<string, any>) => (doc: Document): Document => {
    const role = args.has("role") && args.get("role") ? args.get("role") : null;
    const source = args.has("source") ? args.get("source") : null;
    if (!source) return doc;
    const elems = role
        ? xpathFilter(doc, `//controlaccess/persname[@role="${role}"]`)
        : xpathFilter(doc, "//controlaccess/persname");
    each(elems, (elem) => {
        elem.setAttribute("source", source);
    });
    return doc;
};
