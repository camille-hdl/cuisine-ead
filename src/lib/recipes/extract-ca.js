//@flow
import { filter } from "ramda";
import { map } from "./utils.js";
import { List } from "immutable";
import { xpathFilter } from "../xml.js";
/**
 * Extracts controlaccess children with their attributes
 * we use Immutable.js data structures for performance.
 * Each element in the final List is a List with 3 elements:
 * `[tagName, content, attribute:value]`.
 * If a tag has N attributes, it will output N elements in the final List.
 */
export default (doc: Document): List<List<string>> => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    return List(
        map(
            filter((elem) => elem.innerHTML.trim && elem.innerHTML.trim() !== "", elems),
            (elem) => {
                let attrs = List([]);
                if (elem.hasAttributes()) {
                    const a = elem.attributes;
                    for (let i = 0, l = a.length; i < l; i++) {
                        attrs = attrs.push([a[i].name, a[i].value].join(":"));
                    }
                }
                if (attrs.size <= 0) {
                    return List([List([elem.tagName, elem.innerHTML.trim(), ""])]);
                } else {
                    return attrs.map((attr) => List([elem.tagName, elem.innerHTML.trim(), attr]));
                }
            }
        )
    ).flatten(true);
};
