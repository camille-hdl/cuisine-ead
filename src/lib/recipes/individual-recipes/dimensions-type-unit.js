//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//dimensions");
    each(elems, (elem) => {
        if (!elem.hasAttribute("type") && !elem.hasAttribute("unit")) {
            elem.setAttribute("type", "hauteur_x_largeur");
            elem.setAttribute("unit", "cm");
        }
    });
    return doc;
};
