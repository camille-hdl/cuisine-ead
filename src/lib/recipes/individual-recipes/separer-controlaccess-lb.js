//@flow
import { xpathFilter, getControlaccessTagNames } from "../../xml.js";
import { each } from "../utils.js";
import { filter, map } from "ramda";

const accepted = getControlaccessTagNames();

export default () => (doc: Document): Document => {
    const controlaccesses = filter((el) => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount > 0;
    }, xpathFilter(doc, "//controlaccess"));
    each(controlaccesses, (caContainer) => {
        const children = filter(child => {
            return accepted.includes(child.tagName.toLowerCase()) && child.childNodes.length > 0;
        }, [...caContainer.children]);
        // split each children into multiple controlaccess if contains <lb /> tag
        each(children, (child) => {
            const childNodesGroups = [];
            let childNodeGroup = [];
            let doReplace = false;
            each([...child.childNodes], (subChild) => {
                if (subChild?.nodeType !== "text" && subChild?.tagName === "lb") {
                    doReplace = true;
                    if (childNodeGroup.length > 0) {
                        childNodesGroups.push(childNodeGroup);
                        childNodeGroup = [];
                    }
                } else {
                    childNodeGroup.push(subChild);
                }
            });
            if (childNodeGroup.length > 0) {
                childNodesGroups.push(childNodeGroup);
            }
            if (doReplace) {
                const newElements = map((childNodes) => {
                    const newElement = doc.createElement(child.tagName);
                    each(childNodes, (node) => {
                        newElement.appendChild(node);
                    });
                    // copy original attributes
                    each(child.attributes, (attr) => {
                        newElement.setAttribute(attr.name, attr.value);
                    });
                    return newElement;
                }, childNodesGroups);
                child.replaceWith(...newElements);
            }
        });
    });
    return doc;
};
