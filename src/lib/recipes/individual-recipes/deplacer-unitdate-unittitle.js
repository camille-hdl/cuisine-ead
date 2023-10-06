//@flow
import { xpathFilter } from "../../xml.js";
import { each, getAttributesMap } from "../utils.js";
import { last, head } from "ramda";

/**
 * Si on trouve un unitdate dans le unittitle,
 * on le déplace dans le did en laissant juste la valeur texte dans le unittitle,
 * S'il y a déjà un unitdate avec exactement la même valeur dans le did, on ne rajoute pas un doublon.
 */
export default () => (doc: Document): Document => {
    const unitdatesDansTitle = xpathFilter(doc, "//c/did/unittitle/unitdate");
    console.log("unitdatesDansTitle", unitdatesDansTitle.length);
    each(unitdatesDansTitle, (elem) => {
        const attributesMap = getAttributesMap(elem);
        const textContent = (""+elem?.textContent).trim();
        const did = head(xpathFilter(doc, elem, "ancestor::c/did"));
        console.log(elem, attributesMap, textContent);
        /**
         * Pour qu'on considère que 2 unitdates sont identiques, ils doivent avoir la même valeur texte, la même valeur normalisée
         * et le même type (s'il y en a un).
         */
        const existingDidUnitdate = xpathFilter(doc, did, "unitdate").find((didUnitdate) => {
            const didUnitdateAttributesMap = getAttributesMap(didUnitdate);
            return (
                didUnitdateAttributesMap?.type === attributesMap?.type &&
                didUnitdateAttributesMap?.normal === attributesMap?.normal &&
                (""+didUnitdate?.textContent).trim() === textContent
            );
        });
        console.log("existing = ", existingDidUnitdate);
        if (!existingDidUnitdate) {
            // ajouter le unitdate au did
            if (!did) {
                console.log("Pas de did pour créer le unitdate.");
            } else {
                const newElem = elem.cloneNode(true);
                did.appendChild(newElem);
                console.log("append dans did", newElem);
            }
        }
        // remplacer elem dans son parent par textContent
        const parent = elem.parentNode;
        if (!parent) {
            console.log("Pas de parent pour remplacer le unitdate.");
            return;
        }
        const textNode = doc.createTextNode(textContent);
        parent.replaceChild(textNode, elem);
        console.log("replace", elem, "by", textNode, "in", parent);
    });
    return doc;
};
