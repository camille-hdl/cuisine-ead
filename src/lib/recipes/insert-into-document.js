//@flow
import { head } from "ramda";
import { xpathFilter } from "../xml.js";
import { each } from "./utils.js";
import { getEADID } from "../../components/material/select-file.jsx";

/**
 * Replaces `anchor` by the content of `subDocument` in `rootDocument` in the parent `c` element
 */
 export default function insertIntoDocument(rootDocument: Document, subDocument: Document, anchor: Element) {
    const targetEADID = getEADID(subDocument);
    const targetArchdescChildren = xpathFilter(subDocument, "//archdesc/did|//archdesc/controlaccess");
    const targetDsc = head(xpathFilter(subDocument, "//dsc"));
    const rootC = rootDocument.createElement("c");
    rootC.setAttribute("id", `${targetEADID}-root`);
    each([...targetArchdescChildren], element => {
        if (element) {
            rootC.appendChild(element);
        }
    });
    each([...targetDsc.childNodes], element => {
        rootC.appendChild(element);
    });
    const elementsWithIDS = xpathFilter(rootDocument, rootC, `//*[@id]`);
    each(elementsWithIDS, element => {
        const currentID = element.getAttribute("id");
        element.setAttribute("id", `${targetEADID}-${currentID}`);
    });
    const insertionPoint = head(xpathFilter(rootDocument, anchor, "//ancestor::c"));
    insertionPoint.appendChild(rootC);
    anchor.remove();
}