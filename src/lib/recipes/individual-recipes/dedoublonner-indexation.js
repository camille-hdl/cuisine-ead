//@flow
import { xpathFilter } from "../../xml.js";
import { each, getAttributesMap } from "../utils.js";
import { equals, find } from "ramda";

/**
 * Si une indexation est présente sur un parent ou au niveau du document, la supprimer
 */
export default () => (doc: Document): Document => {
    const controlaccesses = xpathFilter(doc, "//c/controlaccess");
    each(controlaccesses, (controlaccess) => {
        if (!controlaccess.children || !controlaccess.parentNode) return;
        // on cherche dans les parents et dans le archdesc
        const parentIndices = xpathFilter(
            doc,
            controlaccess.parentNode,
            "ancestor::c/controlaccess/*|//archdesc/controlaccess/*"
        );
        const trashBin = [];
        each(controlaccess.children, (index) => {
            if (!index) return;
            const existant = find((parentIndex) => {
                if (parentIndex.nodeName !== index.nodeName) return false;
                if (parentIndex.innerHTML !== index.innerHTML) return false;
                /**
                 * Flow lib doesn't have hasAttributes...
                 */
                //$FlowFixMe
                if (parentIndex.hasAttributes() !== index.hasAttributes()) return false;
                //$FlowFixMe
                if (!parentIndex.hasAttributes() && !index.hasAttributes()) return true;
                return equals(getAttributesMap(parentIndex), getAttributesMap(index));
            }, parentIndices);
            if (existant) {
                // on les note quelque part pour suppression
                // si on supprime de suite, ça cause des problèmes dans la boucle each
                trashBin.push(index);
            }
        });
        each(trashBin, (index) => index.remove());
    });
    return doc;
};
