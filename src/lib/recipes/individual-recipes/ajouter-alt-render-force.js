//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
/**
 * Ligeo
 * Ajouter les valeurs altrender ligeo-{branche|article}-standardisadg même s'il n'y a pas de level,
 * en se basant sur la présence de fiches <c> enfants
 */
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//c");
    const altrenderBranche = "ligeo-branche-standardisadg";
    const altrenderArticle = "ligeo-article-standardisadg";
    each(elems, (elem) => {
        const childrenC = xpathFilter(doc, elem, "c");
        if (childrenC.length > 0) {
            elem.setAttribute("altrender", altrenderBranche);
        } else {
            elem.setAttribute("altrender", altrenderArticle);
        }
    });
    return doc;
};
