//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { last } from "ramda";

/**
 * Ligeo
 * Rechercher les genreform dans controlaccess sans attributs,
 * mettre un attribut en fonction du contenu,
 * les déplacer dans physdesc si besoin
 */
export default () => (doc: Document): Document => {
    const MATRICE = "matrice cadastrale";
    const ETAT_SECTIONS = "état de sections";
    const TABLEAU_ASSEM = "tableau d'assemblage";
    const PLAN_MIN = "plan-minute de conservation";
    const LISTE = "liste";
    const ICO = "iconographie";
    const NOMENCL = "nomenclature des propriétaires";

    const CAs = xpathFilter(doc, "//controlaccess");
    each(CAs, (elem) => {
        const genreforms = xpathFilter(doc, elem, "genreform");
        const existingPhysdesc = last(xpathFilter(doc, elem, "parent::c/did/physdesc"));
        const newPhysdesc = !existingPhysdesc;
        const physdesc = existingPhysdesc ? existingPhysdesc : doc.createElement("physdesc");
        if (genreforms.length <= 0) return;
        // récupérer les genreforms par contenu
        const genreformMap = {};
        each(genreforms, (genreform) => {
            // on ignore les genreforms avec attributs
            if (genreform.hasAttributes()) return;
            const contenu = genreform.innerHTML;
            if (!genreformMap[contenu]) genreformMap[contenu] = [];
            genreformMap[contenu].push(genreform);
        });
        if (genreformMap[MATRICE] && genreformMap[MATRICE].length > 0) {
            each(genreformMap[MATRICE], (el) => {
                el.setAttribute("source", "genreform");
                el.setAttribute("type", "genre");
                physdesc.appendChild(el);
            });
        }
        if (genreformMap[ETAT_SECTIONS] && genreformMap[ETAT_SECTIONS].length > 0) {
            each(genreformMap[ETAT_SECTIONS], (el) => {
                el.setAttribute("source", "genreform");
                el.setAttribute("type", "genre");
                physdesc.appendChild(el);
            });
        }
        if (genreformMap[NOMENCL] && genreformMap[NOMENCL].length > 0) {
            each(genreformMap[NOMENCL], (el) => {
                el.setAttribute("source", "genreform");
                el.setAttribute("type", "genre");
                physdesc.appendChild(el);
            });
        }
        if (genreformMap[LISTE] && genreformMap[LISTE].length) {
            each(genreformMap[LISTE], (el) => {
                el.setAttribute("source", "genreform");
                el.setAttribute("type", "genre");
                physdesc.appendChild(el);
            });
        }
        /**
         * Si on a iconographie + un autre genreform
         */
        if (genreformMap[ICO] && genreformMap[ICO].length > 0) {
            if (genreformMap[TABLEAU_ASSEM] && genreformMap[TABLEAU_ASSEM].length) {
                each(genreformMap[TABLEAU_ASSEM], (el) => {
                    el.setAttribute("source", "genreform");
                    el.setAttribute("type", "genre");
                    physdesc.appendChild(el);
                });
            }
            if (genreformMap[PLAN_MIN] && genreformMap[PLAN_MIN].length) {
                each(genreformMap[PLAN_MIN], (el) => {
                    el.setAttribute("source", "genreform");
                    el.setAttribute("type", "genre");
                    physdesc.appendChild(el);
                });
            }
            each(genreformMap[ICO], (el) => {
                el.setAttribute("type", "nature");
                physdesc.appendChild(el);
            });
        }
        if (newPhysdesc && physdesc.hasChildNodes()) {
            const did = last(xpathFilter(doc, elem, "parent::c/did"));
            if (!did) {
                console.log("Pas de did pour créer le physdesc.");
                return;
            }
            did.appendChild(physdesc);
        }
    });
    return doc;
};
