//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { last } from "ramda";

const SEPARATOR = "|";
/**
 * Move some tags to <did> within <c>, <archdesc>, <archdescgrp>.
 * <did> is created if it doesn't exist.
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const tags = args.get("balises") ?? "";
    const tagNames = ("" + tags).split(SEPARATOR).map((s) => s.trim());
    if (tagNames.length <= 0) return doc;

    const balises = xpathFilter(doc, "//archdesc|//archdescgrp|//c");
    each(balises, (elem: Element) => {
        const hasDid = xpathFilter(doc, elem, "did").length > 0;
        let shouldHaveDid = false;
        const did = last(xpathFilter(doc, elem, "did")) ?? doc.createElement("did");
        each(tagNames, (tagName) => {
            each(xpathFilter(doc, elem, `${tagName}`), (tag) => {
                did.appendChild(tag);
                shouldHaveDid = true;
            });
        });
        if (!hasDid && shouldHaveDid) {
            elem.appendChild(did);
        }
    });
    return doc;
};
