//@flow
import {
    forEach,
    filter,
    last,
    head,
    take,
    trim,
    map as Rmap,
    unnest,
    equals,
    find,
    partition,
    partialRight,
    propEq,
    curry,
    pipe,
} from "ramda";
/**
 * Functions were written using lodashes `each`,
 * this deals with it
 */
const each = (list, fn) => {
    return forEach(fn, list);
};
const map = (list, fn) => {
    return Rmap(fn, list);
};
import capitalize from "capitalize";
import type { Controlaccess } from "../types.js";
import { replaceMSChars } from "./ms-chars.js";
import type { List, Map } from "immutable";
import { xpathFilter } from "./xml.js";
import { getRange, replaceRange, trySetInnerHTML } from "./utils.js";

export type Recipe = (doc: any) => any;

/**
 * Contains a single property: `corrections: Map`
 */
type ExecuteState = Map;

export const supprimerLb = () => (doc: any): any => {
    const lbs = xpathFilter(doc, "//lb");
    each(lbs, lb => lb.remove());
    return doc;
};

export const supprimerLabelsVides = () => (doc: any): any => {
    const elems = xpathFilter(doc, '//*[@label=""]');
    each(elems, elem => elem.removeAttribute("label"));
    return doc;
};

/**
 * Reformat unitids, ranges (and some single unitids)
 * `3 P 290/1-/2` => `3 P 290 /1 à /2`
 * `3 P 290/1` => `3 P 290 /1`
 */
export const remplacePlageSeparator = () => (doc: any): any => {
    // first c level != piece and file
    let elems = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]/did/unitid|//archdesc/did/unitid');
    each(elems, elem => {
        const oldUnitid = trim(elem.innerHTML);
        const range = getRange(oldUnitid);
        if (range) {
            elem.innerHTML = replaceRange(oldUnitid, range, true, " à ");
        }
    });

    /**
     * Then, piece & level
     * We separates ranges from single unitids
     */
    const [ranges, singles] = partition(c => {
        // on veut trouver une plage
        const unitid = trim(c.innerHTML);
        const range = getRange(unitid);
        if (!range) return false;
        if (range.length > 1 && !isNaN(range[0]) && !isNaN(range[1])) {
            if (range[0] < range[1]) {
                // on teste si le même unitid avec l'extension -1 ou +1 existe
                const testUnitIdBefore = replaceRange(unitid, [range[0], range[1] - 1]);
                const testUnitIdAfter = replaceRange(unitid, [range[0], range[1] + 1]);
                if (!unitidExistsInDoc(doc, testUnitIdBefore) && !unitidExistsInDoc(doc, testUnitIdAfter)) {
                    // on est sur une plage
                    return true;
                }
            }
        }
        return false;
    }, xpathFilter(doc, '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid'));
    each(ranges, elem => {
        const oldUnitid = trim(elem.innerHTML);
        const range = getRange(oldUnitid);
        if (range) {
            elem.innerHTML = replaceRange(oldUnitid, range, true, " à ");
        }
    });
    /**
     * We still have to add padding to the singles
     */
    each(singles, elem => {
        elem.innerHTML = trim(elem.innerHTML).replace(/([^ /]+)(\/)/m, (match, prev, sep) => {
            return [prev, " ", sep].join("");
        });
    });
    return doc;
};

export const remplaceExtensionSeparator = () => (doc: any): any => {
    // d'abord les c level != piece et file

    const elems = filter(c => {
        const temp = trim(c.innerHTML).split(" ");
        const tempArticle = last(temp).split("-");
        if (tempArticle.length > 1 && !isNaN(tempArticle[0]) && !isNaN(tempArticle[1])) {
            if (+tempArticle[0] < +tempArticle[1]) {
                // on teste si le même unitid avec l'extension -1 existe
                let testUnitId = take(temp.length - 1, temp).join(" ");
                testUnitId = [testUnitId, [tempArticle[0], +tempArticle[1] - 1].join("-")].join(" ");
                if (unitidExistsInDoc(doc, testUnitId)) {
                    // on est sur une extension
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }, xpathFilter(doc, '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid'));
    each(elems, elem => {
        elem.innerHTML = "" + elem.innerHTML.replace("-", "/");
    });

    return doc;
};

export const supprimeComments = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//comment()");
    each(elems, comment => comment.remove());

    return doc;
};

export const supprimeControlAccess = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    each(elems, controlaccess => controlaccess.remove());

    return doc;
};

export const ajouterScopecontentAudience = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//scopecontent");
    each(elems, elem => {
        if (!elem.hasAttribute("audience")) {
            elem.setAttribute("audience", "external");
        }
    });

    return doc;
};

export const geognameSourceGeo = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//geogname");
    each(elems, elem => {
        if (!elem.hasAttribute("source")) {
            elem.setAttribute("source", "geogname");
        }
    });

    return doc;
};

export const extentUnit = () => (doc: any): any => {
    const elems = xpathFilter(doc, '//extent[@type="nombre elements"]');
    each(elems, elem => {
        elem.removeAttribute("type");
        elem.setAttribute("unit", "feuille");
    });
    return doc;
};

export const dimensionsTypeUnit = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//dimensions");
    each(elems, elem => {
        if (!elem.hasAttribute("type") && !elem.hasAttribute("unit")) {
            elem.setAttribute("type", "hauteur_x_largeur");
            elem.setAttribute("unit", "cm");
        }
    });
    return doc;
};

export const corpnameToSubjectW = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//corpname");
    each(elems, elem => {
        if (!elem.hasAttributes()) {
            const subj = doc.createElement("subject");
            subj.setAttribute("source", "periode_thesaurus_w");
            if (elem.childNodes) {
                each(elem.childNodes, c => subj.appendChild(c));
            }
            elem.replaceWith(subj);
        }
    });
    return doc;
};

export const ajouterSubjectSourceW = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//subject");
    each(elems, elem => {
        if (!elem.hasAttribute("source")) {
            elem.setAttribute("source", "thesaurus_w");
        }
    });
    return doc;
};

export const corrigerSubjectContexteHisto = () => (doc: any): any => {
    const elems = xpathFilter(doc, '//subject[@source="contexte-historique"]');
    each(elems, elem => {
        elem.setAttribute("source", "periode_thesaurus_w");
    });
    return doc;
};

export const corrigerMatSpecDonnees = () => (doc: any): any => {
    const elems = xpathFilter(doc, '//materialspec[@type="données mathématiques"]');
    each(elems, elem => {
        elem.setAttribute("type", "echelle");
    });
    return doc;
};

export const replaceUnitDateNd = () => (doc: any): any => {
    const elems = xpathFilter(doc, '//unitdate[@normal="0"]');
    each(elems, elem => elem.setAttribute("normal", "s.d."));

    return doc;
};

export const viderUnitDateNormal = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//unitdate");
    each(elems, elem => {
        if (elem.hasAttribute("normal")) {
            elem.removeAttribute("normal");
        }
    });

    return doc;
};

const capitalizeRE = /( |^|.|;)([A-Z\-']+)( |,|;|.|$)/gm;
export const capitalizePersname = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//persname");
    each(elems, elem => {
        elem.innerHTML = elem.innerHTML.replace(capitalizeRE, (matched, p1, nom, p3) => {
            return [p1, capitalize(nom), p3].join("");
        });
    });

    return doc;
};

const whitespaceRE = /(\t|\n *|\r *| {2,})/gm;
export const supprimeWhitespace = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//text()");
    each(elems, elem => {
        if (elem.textContent && elem.textContent.trim() !== "") {
            // il faut potentiellement faire l'operation plusieurs fois
            // car un remplacement peut créer un nouveau double espace par exemple
            do {
                elem.textContent = elem.textContent.replace(whitespaceRE, " ");
            } while (whitespaceRE.test(elem.textContent));
        }
    });

    return doc;
};

export const remplacerCharWindows = () => (doc: any): any => {
    const textElems = xpathFilter(doc, "//text()");
    // textes
    each(textElems, elem => {
        if (elem.textContent && elem.textContent.trim() !== "") {
            elem.textContent = replaceMSChars(elem.textContent);
        }
    });
    // attributs
    const elems = xpathFilter(doc, "//*");
    each(elems, elem => {
        if (elem.hasAttributes()) {
            for (let attr of elem.attributes) {
                elem.setAttribute(attr.name, replaceMSChars(attr.value));
            }
        }
    });

    return doc;
};

export const nettoyerAttrType = () => (doc: any): any => {
    const elems = xpathFilter(
        doc,
        '//odd[@type="commentaire"]|//relatedmaterial[@type="sources-internes"]|//relatedmaterial[@type="sources-externes"]'
    );
    each(elems, elem => elem.removeAttribute("type"));
    return doc;
};

export const nettoyerAttrTypeTitre = () => (doc: any): any => {
    const elems = xpathFilter(doc, '//*[@type="titre"]');
    each(elems, elem => elem.removeAttribute("type"));
    return doc;
};

/**
 * Supprimer les unitid[type=cote-de-consultation], enlever les attr type de unitid[type=cote-future]
 */
export const nettoyerCoteConsultation = () => (doc: any): any => {
    const cotesConsults = xpathFilter(doc, '//unitid[@type="cote-de-consultation"]');
    each(cotesConsults, unitid => unitid.remove());

    const cotesFutures = xpathFilter(doc, '//unitid[@type="cote-future"]');
    each(cotesFutures, unitid => unitid.removeAttribute("type"));
    return doc;
};

export const nettoyerUnitTitleEmph = () => (doc: any): any => {
    const emphs = xpathFilter(doc, '//unittitle/emph[@render="italic"]|//unittitle/emph[@render="super"]');
    each(emphs, element => {
        if (element.childNodes) {
            element.replaceWith(...element.childNodes);
        } else {
            element.remove();
        }
    });
    return doc;
};
export const nettoyerAddressline = () => (doc: any): any => {
    const adresses = xpathFilter(doc, "//address");
    each(adresses, element => {
        element.remove();
    });
    return doc;
};

/**
 * Supprimer tous les éléments avec audience=internal
 */
export const supprimerInternal = () => (doc: any): any => {
    const internals = xpathFilter(doc, '//*[@audience="internal"]');
    each(internals, element => element.remove());
    return doc;
};

export const completerDidVides = () => (doc: any): any => {
    const dids = filter(el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//did"));
    each(dids, element => {
        // créer un unitid avec le cumul des unitid enfants c directs
        const unitId = doc.createElement("unitid");
        unitId.innerHTML = map(
            xpathFilter(doc, element.parentNode, "c/did/unitid/text()"),
            text => text.textContent
        ).join(" ; ");
        element.appendChild(unitId);
    });
    return doc;
};

export const supprimerControlaccessVides = () => (doc: any): any => {
    const controlaccesses = filter(el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//controlaccess"));
    each(controlaccesses, element => element.remove());
    return doc;
};

export const supprimerHeadVides = () => (doc: any): any => {
    const heads = filter(el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//head"));
    each(heads, element => element.remove());
    return doc;
};

export const modifierDscOthertype = () => (doc: any): any => {
    const dscs = xpathFilter(doc, '//dsc[@type="othertype"]');
    each(dscs, element => element.removeAttribute("type"));
    return doc;
};

export const supprimerGenreformTypir = () => (doc: any): any => {
    const genreforms = xpathFilter(doc, '//archdesc/controlaccess/genreform[@type="typir"]');
    each(genreforms, element => element.remove());
    return doc;
};

export const supprimerPhysDidArchdesc = () => (doc: any): any => {
    const physDescs = xpathFilter(doc, "//archdesc/did/physdesc");
    each(physDescs, element => element.remove());
    return doc;
};

export const supprimerLangusage = () => (doc: any): any => {
    const langusages = xpathFilter(doc, "//eadheader/profiledesc/langusage");
    each(langusages, element => element.remove());
    return doc;
};

const getAttributesMap = (element: Element): { [key: string]: string } => {
    const attrs = {};
    if (element.hasAttributes()) {
        for (let attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
    }
    return attrs;
};

export const ajouterLevelFile = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//c");
    each(elems, elem => {
        const childrenC = xpathFilter(doc, elem, "c");
        if (childrenC.length > 0) return;
        const attrs = getAttributesMap(elem);
        if (!attrs.level) {
            elem.setAttribute("level", "file");
        }
    });
    return doc;
};

/**
 * Si une indexation est présente sur un parent ou au niveau du document, la supprimer
 */
export const dedoublonnerIndexation = () => (doc: any): any => {
    const controlaccesses = xpathFilter(doc, "//c/controlaccess");
    each(controlaccesses, controlaccess => {
        if (!controlaccess.children || !controlaccess.parentNode) return;
        // on cherche dans les parents et dans le archdesc
        const parentIndices = xpathFilter(
            doc,
            controlaccess.parentNode,
            "ancestor::c/controlaccess/*|//archdesc/controlaccess/*"
        );
        const trashBin = [];
        each(controlaccess.children, index => {
            if (!index) return;
            const existant = find(parentIndex => {
                if (parentIndex.nodeName !== index.nodeName) return false;
                if (parentIndex.innerHTML !== index.innerHTML) return false;
                if (parentIndex.hasAttributes() !== index.hasAttributes()) return false;
                if (!parentIndex.hasAttributes() && !index.hasAttributes()) return true;
                return equals(getAttributesMap(parentIndex), getAttributesMap(index));
            }, parentIndices);
            if (existant) {
                // on les note quelque part pour suppression
                // si on supprime de suite, ça cause des problèmes dans la boucle each
                trashBin.push(index);
            }
        });
        each(trashBin, index => index.remove());
    });
    return doc;
};

/**
 * Ligeo
 */

/**
 * Ancienne fonction. à enlever ?
 */
export const _OLD_ajouterAltRender = () => (doc: any): any => {
    const niveauHaut = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]');
    each(niveauHaut, elem => elem.setAttribute("altrender", "ligeo-branche-standardisadg"));

    const niveauBas = xpathFilter(doc, '//c[@level="file"]|//c[@level="piece"]');
    each(niveauBas, elem => elem.setAttribute("altrender", "ligeo-article-standardisadg"));
    return doc;
};

/**
 * Corriger les attributs level, ajouter les altrender
 */
export const ajouterAltRender = () => (doc: any): any => {
    const elems = xpathFilter(doc, "//c");
    each(elems, elem => {
        if (!elem.hasAttributes()) {
            elem.setAttribute("altrender", "ligeo-branche-standardisadg");
            elem.setAttribute("level", "file");
        } else if (elem.hasAttribute("level") && !elem.hasAttribute("altrender")) {
            const attrs = getAttributesMap(elem);
            if (attrs.level === "file") {
                elem.setAttribute("altrender", "ligeo-article-standardisadg");
                elem.setAttribute("level", "item");
            } else if (attrs.level === "recordgrp") {
                elem.setAttribute("altrender", "ligeo-simple-standardisadg");
                elem.setAttribute("level", "file");
            } else if (attrs.level === "series") {
                elem.setAttribute("altrender", "ligeo-branche-iconographieisadg");
                elem.setAttribute("level", "file");
            } else if (attrs.level === "subseries") {
                elem.setAttribute("altrender", "ligeo-simple-iconographieisadg");
                elem.setAttribute("level", "file");
            } else if (attrs.level === "item") {
                elem.setAttribute("altrender", "ligeo-article-iconographieisadg");
                elem.setAttribute("level", "item");
            }
        }
    });
    return doc;
};

/**
 * Rechercher les genreform dans controlaccess sans attributs,
 * mettre un attribut en fonction du contenu,
 * les déplacer dans physdesc si besoin
 */
export const corrigerGenreformPhysdesc = () => (doc: any): any => {
    const MATRICE = "matrice cadastrale";
    const ETAT_SECTIONS = "état de sections";
    const TABLEAU_ASSEM = "tableau d'assemblage";
    const PLAN_MIN = "plan-minute de conservation";
    const ICO = "iconographie";
    const NOMENCL = "nomenclature des propriétaires";

    const CAs = xpathFilter(doc, "//controlaccess");
    each(CAs, elem => {
        const genreforms = xpathFilter(doc, elem, "genreform");
        let physdesc = last(xpathFilter(doc, elem, "parent::c/did/physdesc"));
        let newPhysdesc = false;
        if (!physdesc) {
            // si le physdesc n'existe pas, le créer
            physdesc = doc.createElement("physdesc");
            newPhysdesc = true;
        }
        if (genreforms.length <= 0) return;
        // récupérer les genreforms par contenu
        const genreformMap = {};
        each(genreforms, genreform => {
            // on ignore les genreforms avec attributs
            if (genreform.hasAttributes()) return;
            const contenu = genreform.innerHTML;
            if (!genreformMap[contenu]) genreformMap[contenu] = [];
            genreformMap[contenu].push(genreform);
        });
        if (genreformMap[MATRICE] && genreformMap[MATRICE].length > 0) {
            each(genreformMap[MATRICE], el => {
                el.setAttribute("source", "genreform");
                el.setAttribute("type", "genre");
                physdesc.appendChild(el);
            });
        }
        if (genreformMap[ETAT_SECTIONS] && genreformMap[ETAT_SECTIONS].length > 0) {
            each(genreformMap[ETAT_SECTIONS], el => {
                el.setAttribute("source", "genreform");
                el.setAttribute("type", "genre");
                physdesc.appendChild(el);
            });
        }
        if (genreformMap[NOMENCL] && genreformMap[NOMENCL].length > 0) {
            each(genreformMap[NOMENCL], el => {
                el.setAttribute("source", "genreform");
                el.setAttribute("type", "genre");
                physdesc.appendChild(el);
            });
        }
        /**
         * Si on a iconographie + un autre genreform
         */
        if (genreformMap[ICO] && genreformMap[ICO].length > 0) {
            let deplacerIco = false;
            if (genreformMap[TABLEAU_ASSEM] && genreformMap[TABLEAU_ASSEM].length) {
                deplacerIco = true;
                each(genreformMap[TABLEAU_ASSEM], el => {
                    el.setAttribute("source", "genreform");
                    el.setAttribute("type", "genre");
                    physdesc.appendChild(el);
                });
            }
            if (genreformMap[PLAN_MIN] && genreformMap[PLAN_MIN].length) {
                deplacerIco = true;
                each(genreformMap[PLAN_MIN], el => {
                    el.setAttribute("source", "genreform");
                    el.setAttribute("type", "genre");
                    physdesc.appendChild(el);
                });
            }
            if (deplacerIco) {
                each(genreformMap[ICO], el => {
                    el.setAttribute("type", "nature");
                    physdesc.appendChild(el);
                });
            }
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

export const corrigerAccessRestrictLigeo = () => (doc: any): any => {
    const accessRestrics = xpathFilter(doc, '//accessrestrict[@type="modalites-acces"]');
    each(accessRestrics, elem => {
        elem.setAttribute("type", "delai");
        elem.setAttribute("id", "ligeo-2");
    });
    return doc;
};

/**
 * if there is no publisher tag, it will be created in publicationstmt
 * Expects arg `publisher` (string)
 */
export const ecraserPublisher = (args: Map) => (doc: any): any => {
    const newPublisher = args.get("publisher");
    if (typeof newPublisher === "undefined") return doc;
    const publisher = last(xpathFilter(doc, "//publisher"));
    if (publisher) {
        trySetInnerHTML(publisher, newPublisher);
        return doc;
    }
    // creer un publisher
    const publicationstmt = last(xpathFilter(doc, "//publicationstmt"));
    if (publicationstmt) {
        const publisher = doc.createElement("publisher");
        trySetInnerHTML(publisher, newPublisher);
        publicationstmt.appendChild(publisher);
    }
    return doc;
};

/**
 * if there is no repository tag, it will be created in archdesc>did
 * Expects arg `repository` (string)
 */
export const ecraserRepository = (args: Map) => (doc: any): any => {
    const newRepository = args.get("repository");
    if (typeof newRepository === "undefined") return doc;
    const repository = last(xpathFilter(doc, "//repository"));
    if (repository) {
        trySetInnerHTML(repository, newRepository);
        return doc;
    }
    // creer un repository
    const did = last(xpathFilter(doc, "//archdesc/did"));
    if (did) {
        const repository = doc.createElement("repository");
        trySetInnerHTML(repository, newRepository);
        did.appendChild(repository);
    }
    return doc;
};
/**
 * if there is no creation tag, it will be created in profiledesc
 * Expects arg `creation` (string)
 */
export const ecraserCreation = (args: Map) => (doc: any): any => {
    const newCreation = args.get("creation");
    if (typeof newCreation === "undefined") return doc;
    const creation = last(xpathFilter(doc, "//creation"));
    if (creation) {
        trySetInnerHTML(creation, newCreation);
        return doc;
    }
    // creer un creation
    const profileDesc = last(xpathFilter(doc, "//profiledesc"));
    if (profileDesc) {
        const creation = doc.createElement("creation");
        trySetInnerHTML(creation, newCreation);
        profileDesc.appendChild(creation);
    }
    return doc;
};
/**
 * if there is no origination tag, it will be created in archdesc/did
 * Expects arg `origination` (string, can contain xml).
 */
export const ecraserOrigination = (args: Map) => (doc: any): any => {
    const newOrigination = args.get("origination");
    if (typeof newOrigination === "undefined") return doc;
    const origination = last(xpathFilter(doc, "//origination"));
    if (origination) {
        trySetInnerHTML(origination, newOrigination);
        return doc;
    }
    // creer un origination
    const did = last(xpathFilter(doc, "//archdesc/did"));
    if (did) {
        const origination = doc.createElement("origination");
        trySetInnerHTML(origination, newOrigination);
        did.appendChild(origination);
    }
    return doc;
};

/**
 * if there is no date tag, it will be created in publicationstmt
 * Expects arg `date` (string, year).
 */
export const ecraserDate = (args: Map) => (doc: any): any => {
    const newDate = args.get("date");
    if (typeof newDate === "undefined") return doc;
    const pubDate = last(xpathFilter(doc, "//publicationstmt/date"));
    if (pubDate) {
        trySetInnerHTML(pubDate, newDate);
        pubDate.setAttribute("normal", newDate);
        return doc;
    }
    // creer un pubDate
    const publicationstmt = last(xpathFilter(doc, "//publicationstmt"));
    if (publicationstmt) {
        const pubDate = doc.createElement("date");
        trySetInnerHTML(pubDate, newDate);
        pubDate.setAttribute("normal", newDate);
        publicationstmt.appendChild(pubDate);
    }
    return doc;
};

/**
 * Appliquer tous les traitements spécifiques à ligeo
 */
export const traitementsLigeo = () =>
    pipe<any, any, any, any>(
        ajouterAltRender(),
        corrigerAccessRestrictLigeo(),
        corrigerGenreformPhysdesc()
    );

/**
 * Détermine si un unitid de niveau bas existe dans le document
 */
const unitidExistsInDoc = (doc: any, unitid: string): boolean => {
    let nsResolver = doc.createNSResolver(
        doc.ownerDocument == null ? doc.documentElement : doc.ownerDocument.documentElement
    );
    let xpathResult = doc.evaluate(
        '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid',
        doc,
        nsResolver,
        XPathResult.ANY_TYPE,
        null
    );
    let c;
    do {
        c = xpathResult.iterateNext();
        if (c) {
            if (trim(c.innerHTML) === unitid) return true;
        }
    } while (c !== null);
    return false;
};

/**
 * Corriger les controlacces à partir des corrections fournies par csv
 * This function is curryable
 */
const correctionControlAccess = curry<ExecuteState, any>(
    (state: ExecuteState, doc: any): any => {
        state.get("corrections").forEach((correction: Map, controlaccess: string) => {
            if (!controlaccess || controlaccess.trim() === "") return;
            const occurrences = xpathFilter(doc, `//${controlaccess}`);
            each(occurrences, occurrence => {
                const terme = occurrence.innerHTML.trim();
                if (terme === "") return;
                if (correction.has(terme)) {
                    // get the original attributes
                    const attrs = {};
                    if (occurrence.hasAttributes()) {
                        for (let attr of occurrence.attributes) {
                            attrs[attr.name] = attr.value;
                        }
                    }
                    const parent = occurrence.parentNode;
                    if (!parent) return;
                    // remove the original controlaccess
                    occurrence.remove();

                    // if we have replacements, use them
                    if (correction.get(terme).size > 0) {
                        correction.get(terme).forEach(nouveauTerme => {
                            const nouveauControlAccess = nouveauTerme.last();
                            const el = doc.createElement(nouveauControlAccess);
                            el.innerHTML = nouveauTerme.first();
                            // put back the attributes
                            each(attrs, (attrValue, attrName) => el.setAttribute(attrName, attrValue));
                            parent.appendChild(el);
                        });
                    }
                }
            });
        });
        return doc;
    }
);

export const extractCA = (doc: any): Array<Controlaccess> => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    return unnest(
        map(filter(elem => elem.innerHTML.trim && elem.innerHTML.trim() !== "", elems), elem => {
            const attrs = [];
            if (elem.hasAttributes()) {
                const a = elem.attributes;
                for (let i = 0, l = a.length; i < l; i++) {
                    attrs.push([a[i].name, a[i].value].join(":"));
                }
            }
            if (attrs.length <= 0) {
                return [[elem.tagName, elem.innerHTML.trim(), ""]];
            } else {
                return map(attrs, attr => [elem.tagName, elem.innerHTML.trim(), attr]);
            }
        })
    );
};

/**
 * Returns an array of 'simple' recipes creators : functions that create functions that take a single DOM `Document` as argument and returns
 * the modified `Document`.
 * The first function is called with the `args` object of the recipe.
 * Each element in the array is an object `{ key: string, fn: (args: any) => (doc: Document) => Document }`
 */
export const getRecipes = () => {
    return [
        { key: "supprimer_lb", fn: supprimerLb },
        { key: "supprimer_label_vide", fn: supprimerLabelsVides },
        { key: "remplacer_sep_plage", fn: remplacePlageSeparator },
        { key: "remplacer_sep_ext", fn: remplaceExtensionSeparator },
        { key: "supprimer_commentaire", fn: supprimeComments },
        { key: "remplacer_date_0", fn: replaceUnitDateNd },
        { key: "vider_unitdate_normal", fn: viderUnitDateNormal },
        { key: "nettoyer_type", fn: nettoyerAttrType },
        { key: "nettoyer_type_titre", fn: nettoyerAttrTypeTitre },
        { key: "ajouter_altrender", fn: ajouterAltRender },
        { key: "corriger_accessrestrict_ligeo", fn: corrigerAccessRestrictLigeo },
        { key: "capitalize_persname", fn: capitalizePersname },
        { key: "supprimer_whitespace", fn: supprimeWhitespace },
        { key: "remplacer_windows", fn: remplacerCharWindows },
        { key: "supprimer_controlaccess", fn: supprimeControlAccess },
        { key: "nettoyer_cotes_consultation", fn: nettoyerCoteConsultation },
        { key: "nettoyer_emph_unittitle", fn: nettoyerUnitTitleEmph },
        { key: "nettoyer_addressline", fn: nettoyerAddressline },
        { key: "supprimer_internal", fn: supprimerInternal },
        { key: "ajouter_scopecontent_audience", fn: ajouterScopecontentAudience },
        { key: "completer_did_vides", fn: completerDidVides },
        { key: "dedoublonner_indexation", fn: dedoublonnerIndexation },
        { key: "supprimer_ca_vides", fn: supprimerControlaccessVides },
        { key: "supprimer_head_vides", fn: supprimerHeadVides },
        { key: "ajouter_level_file", fn: ajouterLevelFile },
        { key: "geog_source_geog", fn: geognameSourceGeo },
        { key: "extent_unit", fn: extentUnit },
        { key: "dimensions_type_unit", fn: dimensionsTypeUnit },
        { key: "corpname_to_subject", fn: corpnameToSubjectW },
        { key: "subject_ajouter_sourceW", fn: ajouterSubjectSourceW },
        { key: "corriger_source_contexte", fn: corrigerSubjectContexteHisto },
        { key: "corriger_mat_spec_donnees", fn: corrigerMatSpecDonnees },
        { key: "corriger_deplacer_genreform", fn: corrigerGenreformPhysdesc },
        { key: "pack_ligeo", fn: traitementsLigeo },
        { key: "ecraser_publisher", fn: ecraserPublisher },
        { key: "ecraser_repository", fn: ecraserRepository },
        { key: "ecraser_creation", fn: ecraserCreation },
        { key: "ecraser_origination", fn: ecraserOrigination },
        { key: "ecraser_date", fn: ecraserDate },
        { key: "modifier_dsc_type", fn: modifierDscOthertype },
        { key: "supprimer_genreform_typir", fn: supprimerGenreformTypir },
        { key: "supprimer_physdesc_archdesc", fn: supprimerPhysDidArchdesc },
        { key: "supprimer_langusage", fn: supprimerLangusage },
    ];
};

const _findRecipe = partialRight(find, [getRecipes()]);
export const findRecipe = (key: string): Recipe | undefined => _findRecipe(propEq("key", key));

/**
 * Returns an array of 'stateful' recipes : functions that take a DOM `Document` and the app state
 * as arguments, and return the modified `Document`.
 * * Each element in the array is an object `{ key: string, fn: (state: ExecuteState, doc: Document) => Document }` where `fn` is `curry`ed
 * * The `state` Map contains a property `corrections: Map`.
 */
export const getStatefulRecipes = () => {
    return [{ key: "correction_controlaccess", fn: correctionControlAccess }];
};

const _findStatefulRecipe = partialRight(find, [getStatefulRecipes()]);
export const findStatefulRecipe = (key: string): Recipe | undefined => _findStatefulRecipe(propEq("key", key));

/**
 * Given a `recipe` (`Map<{key: string, args: any}>`), this will return the corresponding function `(doc: Document) => document`
 * to apply a modification on a DOM `Document`.
 * If the function needs the application state to work, it will be provided automatically.
 */
export default (recipe: Map, state: ExecuteState): ((doc: any) => any) => {
    const recipeKey = recipe.get("key");
    const recipeArgs = recipe.get("args");
    if (findRecipe(recipeKey)) {
        return findRecipe(recipeKey).fn(recipeArgs);
    }
    if (findStatefulRecipe(recipeKey)) {
        return findStatefulRecipe(recipeKey).fn(state);
    }
    throw new Error("Unknown recipe: " + recipeKey);
};
