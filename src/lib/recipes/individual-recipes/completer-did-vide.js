//@flow
import { xpathFilter } from "../../xml.js";
import { each, map } from "../utils.js";
import { filter } from "ramda";

export default () => (doc: Document): Document => {
    const dids = filter((el) => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//did"));
    each(dids, (element) => {
        // créer un unitid avec le cumul des unitid enfants c directs
        const unitId = doc.createElement("unitid");
        unitId.innerHTML = map(
            xpathFilter(doc, element.parentNode, "c/did/unitid/text()"),
            (text) => text.textContent
        ).join(" ; ");
        element.appendChild(unitId);
    });
    return doc;
};
