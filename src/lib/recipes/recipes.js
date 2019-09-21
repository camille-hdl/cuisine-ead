//@flow
/**
 * This file contains functions to transform or extract information from xml-ead `Document`s
 */
import {
    forEach,
    forEachObjIndexed,
    filter,
    last,
    take,
    trim,
    map as Rmap,
    equals,
    find,
    partition,
    curry,
    pipe,
} from "ramda";
/**
 * Functions were written using lodashes `each`,
 * in which the arguments are inverted relative to `ramda.forEach`
 * this deals with it
 */
const each = (list: Array<any> | { [key: string]: any }, fn) => {
    if (Array.isArray(list)) {
        return forEach(fn, list);
    } else {
        return forEachObjIndexed(fn, list);
    }
};
const map = (list: Array<any>, fn): Array<any> => {
    return Rmap(fn, list);
};
import capitalize from "capitalize";
import { replaceMSChars } from "../ms-chars.js";
import { List, Map } from "immutable";
import { xpathFilter } from "../xml.js";
import { getRange, replaceRange, trySetInnerHTML, getTagAndAttributes } from "../utils.js";

export type Recipe = (doc: any) => any;

/**
 * Contains a single property: `corrections: Map`
 */
export type ExecuteState = Map<string, Map<string, any>>;

export const supprimerLb = () => (doc: Document): Document => {
    const lbs = xpathFilter(doc, "//lb");
    each(lbs, lb => lb.remove());
    return doc;
};

export const supprimerLabelsVides = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//*[@label=""]');
    each(elems, elem => elem.removeAttribute("label"));
    return doc;
};

/**
 * Reformat unitids, ranges (and some single unitids)
 * `3 P 290/1-/2` => `3 P 290 /1 à /2`
 * `3 P 290/1` => `3 P 290 /1`
 */
export const remplacePlageSeparator = () => (doc: Document): Document => {
    // first c level != piece and file
    let elems = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]/did/unitid|//archdesc/did/unitid');
    each(elems, elem => {
        const oldUnitid = trim(elem.innerHTML);
        const range = getRange(oldUnitid);
        if (range) {
            elem.innerHTML = replaceRange(oldUnitid, range, true, " à ");
        } else {
            elem.innerHTML = trim(elem.innerHTML).replace(/([^ /]+)(\/)/m, (match, prev, sep) => {
                return [prev, " ", sep].join("");
            });
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

export const remplaceExtensionSeparator = () => (doc: Document): Document => {
    // d'abord les c level != piece et file

    const elems = filter(c => {
        const temp = trim(c.innerHTML).split(" ");
        const tempArticle = last(temp) ? last(temp).split("-") : [];
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

export const supprimeComments = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//comment()");
    each(elems, comment => comment.remove());

    return doc;
};

export const supprimeControlAccess = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    each(elems, controlaccess => controlaccess.remove());

    return doc;
};

export const ajouterScopecontentAudience = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//scopecontent");
    each(elems, elem => {
        if (!elem.hasAttribute("audience")) {
            elem.setAttribute("audience", "external");
        }
    });

    return doc;
};

export const geognameSourceGeo = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//geogname");
    each(elems, elem => {
        if (!elem.hasAttribute("source")) {
            elem.setAttribute("source", "geogname");
        }
    });

    return doc;
};

export const extentUnit = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//extent[@type="nombre elements"]');
    each(elems, elem => {
        elem.removeAttribute("type");
        elem.setAttribute("unit", "feuille");
    });
    return doc;
};

export const dimensionsTypeUnit = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//dimensions");
    each(elems, elem => {
        if (!elem.hasAttribute("type") && !elem.hasAttribute("unit")) {
            elem.setAttribute("type", "hauteur_x_largeur");
            elem.setAttribute("unit", "cm");
        }
    });
    return doc;
};

export const corpnameToSubjectW = () => (doc: Document): Document => {
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

export const ajouterSubjectSourceW = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//subject");
    each(elems, elem => {
        if (!elem.hasAttribute("source")) {
            elem.setAttribute("source", "thesaurus_w");
        }
    });
    return doc;
};

export const corrigerSubjectContexteHisto = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//subject[@source="contexte-historique"]');
    each(elems, elem => {
        elem.setAttribute("source", "periode_thesaurus_w");
    });
    return doc;
};

export const corrigerMatSpecDonnees = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//materialspec[@type="données mathématiques"]');
    each(elems, elem => {
        elem.setAttribute("type", "echelle");
    });
    return doc;
};

export const replaceUnitDateNd = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//unitdate[@normal="0"]');
    each(elems, elem => elem.setAttribute("normal", "s.d."));

    return doc;
};

export const viderUnitDateNormal = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//unitdate");
    each(elems, elem => {
        if (elem.hasAttribute("normal")) {
            elem.removeAttribute("normal");
        }
    });

    return doc;
};

const capitalizeRE = /( |^|.|;)([A-Z\-']+)( |,|;|.|$)/gm;
export const capitalizePersname = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//persname");
    each(elems, elem => {
        elem.innerHTML = elem.innerHTML.replace(capitalizeRE, (matched, p1, nom, p3) => {
            return [p1, capitalize(nom), p3].join("");
        });
    });

    return doc;
};

const whitespaceRE = /(\t|\n *|\r *| {2,})/gm;
export const supprimeWhitespace = () => (doc: Document): Document => {
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

export const remplacerCharWindows = () => (doc: Document): Document => {
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
            // eslint-disable-next-line no-unused-vars
            for (let attr of elem.attributes) {
                elem.setAttribute(attr.name, replaceMSChars(attr.value));
            }
        }
    });

    return doc;
};

export const nettoyerAttrType = () => (doc: Document): Document => {
    const elems = xpathFilter(
        doc,
        '//odd[@type="commentaire"]|//relatedmaterial[@type="sources-internes"]|//relatedmaterial[@type="sources-externes"]'
    );
    each(elems, elem => elem.removeAttribute("type"));
    return doc;
};

export const nettoyerAttrTypeTitre = () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//*[@type="titre"]');
    each(elems, elem => elem.removeAttribute("type"));
    return doc;
};

/**
 * Supprimer les unitid[type=cote-de-consultation], enlever les attr type de unitid[type=cote-future]
 */
export const nettoyerCoteConsultation = () => (doc: Document): Document => {
    const cotesConsults = xpathFilter(doc, '//unitid[@type="cote-de-consultation"]');
    each(cotesConsults, unitid => unitid.remove());

    const cotesFutures = xpathFilter(doc, '//unitid[@type="cote-future"]');
    each(cotesFutures, unitid => unitid.removeAttribute("type"));
    return doc;
};

/**
 * Remove certain `<emph>` tags in unittitles, but keep the content
 */
export const nettoyerUnitTitleEmph = () => (doc: Document): Document => {
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

/**
 * Remove `<span>` tags but keep their content
 */
export const nettoyerSpan = () => (doc: Document): Document => {
    const spans = xpathFilter(doc, "//span");
    each(spans, element => {
        if (element.childNodes) {
            element.replaceWith(...element.childNodes);
        } else {
            element.remove();
        }
    });
    return doc;
};

/**
 * Remove `<address>` tags
 */
export const nettoyerAddressline = () => (doc: Document): Document => {
    const adresses = xpathFilter(doc, "//address");
    each(adresses, element => {
        element.remove();
    });
    return doc;
};

/**
 * Supprimer tous les éléments avec audience=internal
 */
export const supprimerInternal = () => (doc: Document): Document => {
    const internals = xpathFilter(doc, '//*[@audience="internal"]');
    each(internals, element => element.remove());
    return doc;
};

export const completerDidVides = () => (doc: Document): Document => {
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

export const supprimerControlaccessVides = () => (doc: Document): Document => {
    const controlaccesses = filter(el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//controlaccess"));
    each(controlaccesses, element => element.remove());
    return doc;
};

export const supprimerHeadVides = () => (doc: Document): Document => {
    const heads = filter(el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//head"));
    each(heads, element => element.remove());
    return doc;
};

export const modifierDscOthertype = () => (doc: Document): Document => {
    const dscs = xpathFilter(doc, '//dsc[@type="othertype"]');
    each(dscs, element => element.removeAttribute("type"));
    return doc;
};

export const supprimerGenreformTypir = () => (doc: Document): Document => {
    const genreforms = xpathFilter(doc, '//archdesc/controlaccess/genreform[@type="typir"]');
    each(genreforms, element => element.remove());
    return doc;
};

export const supprimerPhysDidArchdesc = () => (doc: Document): Document => {
    const physDescs = xpathFilter(doc, "//archdesc/did/physdesc");
    each(physDescs, element => element.remove());
    return doc;
};

export const supprimerLangusage = () => (doc: Document): Document => {
    const langusages = xpathFilter(doc, "//eadheader/profiledesc/langusage");
    each(langusages, element => element.remove());
    return doc;
};

/**
 * Changes `origination/name` to `origination/corpname`
 */
export const fixOriginationName = () => (doc: Document): Document => {
    const names = xpathFilter(doc, "//origination/name");
    each(names, name => {
        const corpname = doc.createElement("corpname");
        if (name.childNodes) {
            each(name.childNodes, c => corpname.appendChild(c));
        }
        if (name.hasAttributes()) {
            for (let attr of name.attributes) {
                corpname.setAttribute(attr.name, attr.value);
            }
        }
        name.replaceWith(corpname);
    });
    return doc;
};

export const getAttributesMap = (element: window.Element): { [key: string]: string } => {
    const attrs = {};
    if (element.hasAttributes()) {
        // eslint-disable-next-line no-unused-vars
        for (let attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
    }
    return attrs;
};

export const ajouterLevelFile = () => (doc: Document): Document => {
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
export const dedoublonnerIndexation = () => (doc: Document): Document => {
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
export const _OLD_ajouterAltRender = () => (doc: Document): Document => {
    const niveauHaut = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]');
    each(niveauHaut, elem => elem.setAttribute("altrender", "ligeo-branche-standardisadg"));

    const niveauBas = xpathFilter(doc, '//c[@level="file"]|//c[@level="piece"]');
    each(niveauBas, elem => elem.setAttribute("altrender", "ligeo-article-standardisadg"));
    return doc;
};

/**
 * Corriger les attributs level, ajouter les altrender
 */
export const ajouterAltRender = () => (doc: Document): Document => {
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
export const corrigerGenreformPhysdesc = () => (doc: Document): Document => {
    const MATRICE = "matrice cadastrale";
    const ETAT_SECTIONS = "état de sections";
    const TABLEAU_ASSEM = "tableau d'assemblage";
    const PLAN_MIN = "plan-minute de conservation";
    const LISTE = "liste";
    const ICO = "iconographie";
    const NOMENCL = "nomenclature des propriétaires";

    const CAs = xpathFilter(doc, "//controlaccess");
    each(CAs, elem => {
        const genreforms = xpathFilter(doc, elem, "genreform");
        const existingPhysdesc = last(xpathFilter(doc, elem, "parent::c/did/physdesc"));
        const newPhysdesc = !existingPhysdesc;
        const physdesc = existingPhysdesc ? existingPhysdesc : doc.createElement("physdesc");
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
        if (genreformMap[LISTE] && genreformMap[LISTE].length) {
            each(genreformMap[LISTE], el => {
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
                each(genreformMap[TABLEAU_ASSEM], el => {
                    el.setAttribute("source", "genreform");
                    el.setAttribute("type", "genre");
                    physdesc.appendChild(el);
                });
            }
            if (genreformMap[PLAN_MIN] && genreformMap[PLAN_MIN].length) {
                each(genreformMap[PLAN_MIN], el => {
                    el.setAttribute("source", "genreform");
                    el.setAttribute("type", "genre");
                    physdesc.appendChild(el);
                });
            }
            each(genreformMap[ICO], el => {
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

export const corrigerAccessRestrictLigeo = () => (doc: Document): Document => {
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
export const ecraserPublisher = (args: Map<string, any>) => (doc: Document): Document => {
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
export const ecraserRepository = (args: Map<string, any>) => (doc: Document): Document => {
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
export const ecraserCreation = (args: Map<string, any>) => (doc: Document): Document => {
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
export const ecraserOrigination = (args: Map<string, any>) => (doc: Document): Document => {
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
export const ecraserDate = (args: Map<string, any>) => (doc: Document): Document => {
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
export const unitidExistsInDoc = (doc: any, unitid: string): boolean => {
    let nsResolver = doc.createNSResolver(
        doc.ownerDocument == null ? doc.documentElement : doc.ownerDocument.documentElement
    );
    let xpathResult = doc.evaluate(
        '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid',
        doc,
        nsResolver,
        window.XPathResult.ANY_TYPE,
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
export const correctionControlAccess = curry<ExecuteState, Document, Document>(
    (state: ExecuteState, doc: Document): Document => {
        if (!Map.isMap(state.get("corrections")) || typeof state.get("corrections") === "undefined") {
            return doc;
        }
        const corrections = state.get("corrections");
        if (corrections) {
            corrections.forEach((correction: Map<string, any>, controlaccess: string) => {
                if (!controlaccess || controlaccess.trim() === "") return;
                const occurrences = xpathFilter(doc, `//${controlaccess}`);
                each(occurrences, occurrence => {
                    const terme = occurrence.innerHTML.trim();
                    if (terme === "") return;
                    if (correction.has(terme)) {
                        // get the original attributes
                        const attrs = {};
                        if (occurrence.hasAttributes()) {
                            // eslint-disable-next-line no-unused-vars
                            for (let attr of occurrence.attributes) {
                                attrs[attr.name] = attr.value;
                            }
                        }
                        const parent = occurrence.parentNode;
                        if (!parent) return;
                        // remove the original controlaccess
                        occurrence.remove();
                        const correctionsTerme = correction.get(terme);
                        // if we have replacements, use them
                        if (correctionsTerme && correctionsTerme.size > 0) {
                            correctionsTerme.forEach(nouveauTerme => {
                                const nouveauControlAccess = nouveauTerme.last();
                                const { tag, attributes } = getTagAndAttributes(nouveauControlAccess);
                                const el = doc.createElement(tag);
                                el.innerHTML = nouveauTerme.first();
                                // set the old attributes back
                                each(attrs, (attrValue, attrName) => el.setAttribute(attrName, attrValue));
                                // add new attributes
                                each(attributes, nouvelAttr => el.setAttribute(nouvelAttr[0], nouvelAttr[1]));
                                parent.appendChild(el);
                            });
                        }
                    }
                });
            });
        }
        return doc;
    }
);

/**
 * Extracts controlaccess children with their attributes
 * we use Immutable.js data structures for performance.
 * Each element in the final List is a List with 3 elements:
 * `[tagName, content, attribute:value]`.
 * If a tag has N attributes, it will output N elements in the final List.
 */
export const extractCA = (doc: Document): List<List<string>> => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    return List(
        map(filter(elem => elem.innerHTML.trim && elem.innerHTML.trim() !== "", elems), elem => {
            let attrs = List([]);
            if (elem.hasAttributes()) {
                const a = elem.attributes;
                for (let i = 0, l = a.length; i < l; i++) {
                    attrs = attrs.push([a[i].name, a[i].value].join(":"));
                }
            }
            if (attrs.size <= 0) {
                return List([List([elem.tagName, elem.innerHTML.trim(), ""])]);
            } else {
                return attrs.map(attr => List([elem.tagName, elem.innerHTML.trim(), attr]));
            }
        })
    ).flatten(true);
};
