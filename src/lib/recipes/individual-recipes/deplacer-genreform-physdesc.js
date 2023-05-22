//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { last } from "ramda";

/**
 * Ligeo
 * Déplacer tous les //controlaccess/genreform dans physdesc.
 * C'est une version moins spécifique de ./corriger-genreform-physdesc.js
 */
export default () => (doc: Document): Document => {
    const CAs = xpathFilter(doc, "//controlaccess");
    each(CAs, (elem) => {
        const genreforms = xpathFilter(doc, elem, "genreform");
        if (genreforms.length <= 0) return;
        const existingPhysdesc = last(xpathFilter(doc, elem, "(parent::c/did/physdesc)|(parent::archdesc/did/physdesc)"));
        const newPhysdesc = !existingPhysdesc;
        const physdesc = existingPhysdesc ? existingPhysdesc : doc.createElement("physdesc");
        each(genreforms, (el) => {
            if (!el.hasAttribute("source")) {
                el.setAttribute("source", "genreform");
            }
            if (!el.hasAttribute("type")) {
                el.setAttribute("type", "genre");
            }
            physdesc.appendChild(el);
        });
        if (newPhysdesc && physdesc.hasChildNodes()) {
            const did = last(xpathFilter(doc, elem, "(parent::c/did)|(parent::archdesc/did)"));
            if (!did) {
                console.log("Pas de did pour créer le physdesc.");
                return;
            }
            did.appendChild(physdesc);
        }
    });
    return doc;
};
