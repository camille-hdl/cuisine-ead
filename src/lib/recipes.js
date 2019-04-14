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
    partialRight,
    propEq,
    curry,
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

/**
 * Contains a single property: `corrections: Map`
 */
type ExecuteState = Map;

export const supprimerLb = (doc: any): any => {
    const lbs = xpathFilter(doc, "//lb");
    each(lbs, lb => lb.remove());
    return doc;
};

export const supprimerLabelsVides = (doc: any): any => {
    const elems = xpathFilter(doc, '//*[@label=""]');
    each(elems, elem => elem.removeAttribute("label"));
    return doc;
};

export const remplacePlageSeparator = (doc: any): any => {
    // d'abord les c level != piece et file
    let elems = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]/did/unitid|//archdesc/did/unitid');
    each(elems, elem => {
        elem.innerHTML = "" + elem.innerHTML.replace("-", " à ");
    });

    // ensuite, on gère les piece et level.
    // si on trouve une cote avec un dernier element 1-2, on teste si le unitid 1-1 existe
    // s'il n'existe pas, on est sur une plage
    elems = filter(c => {
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
    }, xpathFilter(doc, '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid'));
    each(elems, elem => {
        elem.innerHTML = "" + elem.innerHTML.replace("-", " à ");
    });
    return doc;
};

export const remplaceExtensionSeparator = (doc: any): any => {
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

export const supprimeComments = (doc: any): any => {
    const elems = xpathFilter(doc, "//comment()");
    each(elems, comment => comment.remove());

    return doc;
};

export const supprimeControlAccess = (doc: any): any => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    each(elems, controlaccess => controlaccess.remove());

    return doc;
};

export const replaceUnitDateNd = (doc: any): any => {
    const elems = xpathFilter(doc, '//unitdate[@normal="0"]');
    each(elems, elem => elem.setAttribute("normal", "s.d."));

    return doc;
};

const capitalizeRE = /( |^|.|;)([A-Z\-']+)( |,|;|.|$)/gm;
export const capitalizePersname = (doc: any): any => {
    const elems = xpathFilter(doc, "//persname");
    each(elems, elem => {
        elem.innerHTML = elem.innerHTML.replace(capitalizeRE, (matched, p1, nom, p3) => {
            return [p1, capitalize(nom), p3].join("");
        });
    });

    return doc;
};

const whitespaceRE = /(\t|\n *|\r *| {2,})/gm;
export const supprimeWhitespace = (doc: any): any => {
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

export const remplacerCharWindows = (doc: any): any => {
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

export const nettoyerAttrType = (doc: any): any => {
    const elems = xpathFilter(
        doc,
        '//odd[@type="commentaire"]|//relatedmaterial[@type="sources-internes"]|//relatedmaterial[@type="sources-externes"]'
    );
    each(elems, elem => elem.removeAttribute("type"));
    return doc;
};

export const ajouterAltRender = (doc: any): any => {
    const niveauHaut = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]');
    each(niveauHaut, elem => elem.setAttribute("altrender", "ligeo-branche-standardisadg"));

    const niveauBas = xpathFilter(doc, '//c[@level="file"]|//c[@level="piece"]');
    each(niveauBas, elem => elem.setAttribute("altrender", "ligeo-article-standardisadg"));
    return doc;
};

/**
 * Supprimer les unitid[type=cote-de-consultation], enlever les attr type de unitid[type=cote-future]
 */
export const nettoyerCoteConsultation = (doc: any): any => {
    const cotesConsults = xpathFilter(doc, '//unitid[@type="cote-de-consultation"]');
    each(cotesConsults, unitid => unitid.remove());

    const cotesFutures = xpathFilter(doc, '//unitid[@type="cote-future"]');
    each(cotesFutures, unitid => unitid.removeAttribute("type"));
    return doc;
};

/**
 * Supprimer tous les éléments avec audience=internal
 */
export const supprimerInternal = (doc: any): any => {
    const internals = xpathFilter(doc, '//*[@audience="internal"]');
    each(internals, element => element.remove());
    return doc;
};

export const completerDidVides = (doc: any): any => {
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

export const supprimerControlaccessVides = (doc: any): any => {
    const controlaccesses = filter(el => {
        return typeof el.childElementCount !== "undefined" && el.childElementCount <= 0;
    }, xpathFilter(doc, "//controlaccess"));
    each(controlaccesses, element => element.remove());
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
export const dedoublonnerIndexation = (doc: any): any => {
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
 * Returns an array of 'simple' recipes : functions that take a single DOM `Document` as argument and returns
 * the modified `Document`.
 * Each element in the array is an object `{ key: string, fn: (doc: Document) => Document }`
 */
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
 * Given a `recipeKey`, this will return the corresponding function `(doc: Document) => document`
 * to apply a modification on a DOM `Document`.
 * If the function needs the application state to work, it will be provided automatically.
 */
export default (recipeKey: string, state: ExecuteState): ((doc: any) => any) => {
    if (findRecipe(recipeKey)) {
        return findRecipe(recipeKey).fn;
    }
    if (findStatefulRecipe(recipeKey)) {
        return findStatefulRecipe(recipeKey).fn(state);
    }
    throw new Error("Unknown recipe: " + recipeKey);
};
