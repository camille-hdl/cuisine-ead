//@flow
// import { each, concat, last, head, take, trim, filter, capitalize, map, flatten, isEqual, find } from "lodash";
import {
    forEach,
    filter,
    last,
    head,
    take,
    trim,
    map as Rmap,
    flatten,
    equals,
    find,
    partialRight,
    propEq,
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

export type Recipe = (doc: any) => any;

type ExecuteState = {
    eadFiles: List,
    corrections: Map,
    recipes: List,
};

export const supprimerLb = (doc: any): any => {
    const messages = [];
    const lbs = xpathFilter(doc, "//lb");
    messages.push(["enlever", lbs.length, "lbs"].join(" "));
    each(lbs, lb => lb.remove());
    return doc;
};

export const supprimerLabelsVides = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(doc, '//*[@label=""]');
    messages.push(["enlever", elems.length, "labels vides"].join(" "));
    each(elems, elem => elem.removeAttribute("label"));
    return doc;
};

export const remplacePlageSeparator = (doc: any): any => {
    // d'abord les c level != piece et file
    const messages = [];
    let elems = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]/did/unitid|//archdesc/did/unitid');
    messages.push(["Remplacer '-' par ' à ' dans", elems.length, "unitid de level haut"].join(" "));
    each(elems, elem => {
        elem.innerHTML = "" + elem.innerHTML.replace("-", " à ");
    });

    // ensuite, on gère les piece et level.
    // si on trouve une cote avec un dernier element 1-2, on teste si le unitid 1-1 existe
    // s'il n'existe pas, on est sur une plage
    elems = filter(xpathFilter(doc, '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid'), c => {
        const temp = trim(c.innerHTML).split(" ");
        const tempArticle = last(temp).split("-");
        if (tempArticle.length > 1 && !isNaN(tempArticle[0]) && !isNaN(tempArticle[1])) {
            if (+tempArticle[0] < +tempArticle[1]) {
                // on teste si le même unitid avec l'extension -1 existe
                let testUnitId = take(temp.length - 1, temp).join(" ");
                testUnitId = [testUnitId, [tempArticle[0], +tempArticle[1] - 1].join("-")].join(" ");
                if (!unitidExistsInDoc(doc, testUnitId)) {
                    // on est sur une plage
                    return true;
                }
            }
        }
        return false;
    });
    messages.push(["Remplacer '-' par ' à ' dans", elems.length, "unitid de level bas"].join(" "));
    each(elems, elem => {
        elem.innerHTML = "" + elem.innerHTML.replace("-", " à ");
    });
    return doc;
};

export const remplaceExtensionSeparator = (doc: any): any => {
    // d'abord les c level != piece et file

    const messages = [];
    const elems = filter(xpathFilter(doc, '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid'), c => {
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
    });
    messages.push(["Remplacer '-' par '/' dans", elems.length, "unitid de level bas"].join(" "));
    each(elems, elem => {
        elem.innerHTML = "" + elem.innerHTML.replace("-", "/");
    });

    return doc;
};

export const supprimeComments = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(doc, "//comment()");
    messages.push(["Supprimer", elems.length, "commentaires"].join(" "));
    each(elems, comment => comment.remove());

    return doc;
};

export const supprimeControlAccess = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(doc, "//controlaccess/*");
    messages.push(["Supprimer", elems.length, "controlaccess"].join(" "));
    each(elems, controlaccess => controlaccess.remove());

    return doc;
};

export const replaceUnitDateNd = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(doc, '//unitdate[@normal="0"]');
    messages.push(["Remplacer", elems.length, "unitdate normal='0'"].join(" "));
    each(elems, elem => elem.setAttribute("normal", "s.d."));

    return doc;
};

const capitalizeRE = /( |^|.|;)([A-Z\-']+)( |,|;|.|$)/gm;
export const capitalizePersname = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(doc, "//persname");
    messages.push(["Capitalizer", elems.length, "persnames"].join(" "));
    each(elems, elem => {
        elem.innerHTML = elem.innerHTML.replace(capitalizeRE, (matched, p1, nom, p3) => {
            return [p1, capitalize(nom), p3].join("");
        });
    });

    return doc;
};

const whitespaceRE = /(\t|\n *|\r *| {2,})/gm;
export const supprimeWhitespace = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(doc, "//text()");
    let nbReplacements = 0;
    each(elems, elem => {
        if (elem.textContent && elem.textContent.trim() !== "") {
            nbReplacements++;
            // il faut potentiellement faire l'operation plusieurs fois
            // car un remplacement peut créer un nouveau double espace par exemple
            do {
                elem.textContent = elem.textContent.replace(whitespaceRE, " ");
            } while (whitespaceRE.test(elem.textContent));
        }
    });
    messages.push(`Remplacer ${nbReplacements} tabulations, doubles espaces et sauts de lignes.`);

    return doc;
};

export const remplacerCharWindows = (doc: any): any => {
    const messages = [];
    const textElems = xpathFilter(doc, "//text()");
    let nbReplacements = 0;
    // textes
    each(textElems, elem => {
        if (elem.textContent && elem.textContent.trim() !== "") {
            nbReplacements++;
            elem.textContent = replaceMSChars(elem.textContent);
        }
    });
    // attributs
    const elems = xpathFilter(doc, "//*");
    each(elems, elem => {
        if (elem.hasAttributes()) {
            nbReplacements++;
            for (let attr of elem.attributes) {
                elem.setAttribute(attr.name, replaceMSChars(attr.value));
            }
        }
    });
    messages.push(`Remplacer les caractères windows dans ${nbReplacements} éléments.`);

    return doc;
};

export const nettoyerAttrType = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(
        doc,
        '//odd[@type="commentaire"]|//relatedmaterial[@type="sources-internes"]|//relatedmaterial[@type="sources-externes"]'
    );
    messages.push(["nettoyer", elems.length, "attributs 'type'"].join(" "));
    each(elems, elem => elem.removeAttribute("type"));
    return doc;
};

export const ajouterAltRender = (doc: any): any => {
    const messages = [];
    const niveauHaut = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]');
    each(niveauHaut, elem => elem.setAttribute("altrender", "ligeo-branche-standardisadg"));
    messages.push(["ajouter", niveauHaut.length, "altrender 'ligeo-branche-standardisadg'"].join(" "));

    const niveauBas = xpathFilter(doc, '//c[@level="file"]|//c[@level="piece"]');
    each(niveauBas, elem => elem.setAttribute("altrender", "ligeo-article-standardisadg"));
    messages.push(["ajouter", niveauBas.length, "altrender 'ligeo-article-standardisadg'"].join(" "));
    return doc;
};

/**
 * Supprimer les unitid[type=cote-de-consultation], enlever les attr type de unitid[type=cote-future]
 */
export const nettoyerCoteConsultation = (doc: any): any => {
    const messages = [];
    const cotesConsults = xpathFilter(doc, '//unitid[@type="cote-de-consultation"]');
    each(cotesConsults, unitid => unitid.remove());
    messages.push(["supprimer", cotesConsults.length, "unitid[type=cote-de-consultation]"].join(" "));

    const cotesFutures = xpathFilter(doc, '//unitid[@type="cote-future"]');
    each(cotesFutures, unitid => unitid.removeAttribute("type"));
    messages.push(["enlever", cotesFutures.length, "attributs type=cote-future"].join(" "));
    return doc;
};

/**
 * Supprimer tous les éléments avec audience=internal
 */
export const supprimerInternal = (doc: any): any => {
    const messages = [];
    const internals = xpathFilter(doc, '//*[@audience="internal"]');
    each(internals, element => element.remove());
    messages.push(["enlever", internals.length, "éléments audience=internal"].join(" "));
    return doc;
};

export const completerDidVides = (doc: any): any => {
    const messages = [];
    const dids = filter(xpathFilter(doc, "//did"), el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    });
    each(dids, element => {
        // créer un unitid avec le cumul des unitid enfants c directs
        const unitId = doc.createElement("unitid");
        unitId.innerHTML = map(
            xpathFilter(doc, element.parentNode, "c/did/unitid/text()"),
            text => text.textContent
        ).join(" ; ");
        element.appendChild(unitId);
    });
    messages.push(["compléter", dids.length, "dids vides"].join(" "));
    return doc;
};

export const supprimerControlaccessVides = (doc: any): any => {
    const messages = [];
    const controlaccesses = filter(xpathFilter(doc, "//controlaccess"), el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    });
    each(controlaccesses, element => element.remove());
    messages.push(["supprimer", controlaccesses.length, "controlaccess vides"].join(" "));
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

export const ajouterLevelFile = (doc: any): any => {
    const messages = [];
    const elems = xpathFilter(doc, "//c");
    let nb = 0;
    each(elems, elem => {
        const childrenC = xpathFilter(doc, elem, "c");
        if (childrenC.length > 0) return;
        const attrs = getAttributesMap(elem);
        if (!attrs.level) {
            elem.setAttribute("level", "file");
            nb++;
        }
    });
    messages.push(["ajouter", nb, "attributs level=file"].join(" "));
    return doc;
};

/**
 * Si une indexation est présente sur un parent ou au niveau du document, la supprimer
 */
export const dedoublonnerIndexation = (doc: any): any => {
    const messages = [];
    const controlaccesses = xpathFilter(doc, "//c/controlaccess");
    let nbSupprime = 0;
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
                nbSupprime++;
                // on les note quelque part pour suppression
                // si on supprime de suite, ça cause des problèmes dans la boucle each
                trashBin.push(index);
            }
        });
        each(trashBin, index => index.remove());
    });
    messages.push(["Enlever", nbSupprime, "indexations en double"].join(" "));
    return doc;
};

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
 */
const correctionControlAccess = (doc: any, state: ExecuteState): any => {
    const messages = [];
    const corrections = state.corrections.toJS();
    let correctionsNb = 0;
    each(corrections, (correction, controlaccess: string) => {
        if (controlaccess.trim() === "") return;
        const occurrences = xpathFilter(doc, `//${controlaccess}`);
        each(occurrences, occurrence => {
            const terme = occurrence.innerHTML.trim();
            if (terme === "") return;
            if (typeof correction[terme] !== "undefined") {
                correctionsNb++;
                // recuperer les attributs,
                const attrs = {};
                if (occurrence.hasAttributes()) {
                    for (let attr of occurrence.attributes) {
                        attrs[attr.name] = attr.value;
                    }
                }
                const parent = occurrence.parentNode;
                if (!parent) return;
                // supprimer le controlaccess original
                occurrence.remove();

                // remplacer le terme, si on a des remplacements
                if (correction[terme].length > 0) {
                    each(correction[terme], nouveauTerme => {
                        const nouveauControlAccess = last(nouveauTerme);
                        const el = doc.createElement(nouveauControlAccess);
                        el.innerHTML = head(nouveauTerme);
                        each(attrs, (attrValue, attrName) => el.setAttribute(attrName, attrValue));
                        parent.appendChild(el);
                    });
                }
            }
        });
    });
    messages.push(`Corriger ${correctionsNb} occurrences de controlaccess`);
    return doc;
};

export const extractCA = (doc: any): Array<Controlaccess> => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    return flatten(
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

export const getRecipes = () => {
    return [
        { key: "supprimer_lb", fn: supprimerLb },
        { key: "supprimer_label_vide", fn: supprimerLabelsVides },
        { key: "remplacer_sep_plage", fn: remplacePlageSeparator },
        { key: "remplacer_sep_ext", fn: remplaceExtensionSeparator },
        { key: "supprimer_commentaire", fn: supprimeComments },
        { key: "remplacer_date_0", fn: replaceUnitDateNd },
        { key: "nettoyer_type", fn: nettoyerAttrType },
        { key: "ajouter_altrender", fn: ajouterAltRender },
        { key: "capitalize_persname", fn: capitalizePersname },
        { key: "correction_controlaccess", fn: correctionControlAccess },
        { key: "supprimer_whitespace", fn: supprimeWhitespace },
        { key: "remplacer_windows", fn: remplacerCharWindows },
        { key: "supprimer_controlaccess", fn: supprimeControlAccess },
        { key: "nettoyer_cotes_consultation", fn: nettoyerCoteConsultation },
        { key: "supprimer_internal", fn: supprimerInternal },
        { key: "completer_did_vides", fn: completerDidVides },
        { key: "dedoublonner_indexation", fn: dedoublonnerIndexation },
        { key: "supprimer_ca_vides", fn: supprimerControlaccessVides },
        { key: "ajouter_level_file", fn: ajouterLevelFile },
    ];
};

const _findRecipe = partialRight(find, [getRecipes()]);
export const findRecipe = (key: string): Recipe | undefined => _findRecipe(propEq("key", key));

// appliquer une modification
export default (initDoc: any, modif: string, state: ExecuteState) => {
    const recipe = findRecipe(modif);
    if (!recipe) {
        throw new Error("Unknown recipe: " + modif);
    }
    const doc = modif.fn.length > 1 ? modif.fn(initDoc, state) : modif.f(initDoc);
    return doc;
};
