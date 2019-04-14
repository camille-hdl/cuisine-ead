//@flow
import { find, equals } from "ramda";
type RecipeInfo = {
    label: string,
    category: string,
    complement?: string,
};

const availables: Array<[string, RecipeInfo]> = [
    [
        "supprimer_lb",
        {
            label: "Supprimer les <lb>",
            category: "Suppressions",
        },
    ],
    [
        "supprimer_label_vide",
        {
            label: "Supprimer les labels vides",
            category: "Suppressions",
        },
    ],
    [
        "remplacer_sep_plage",
        {
            label: "Remplacer '-' par ' à ' dans les unitid plages de cotes",
            category: "Spécifique",
        },
    ],
    [
        "remplacer_sep_ext",
        {
            label: "Remplacer '-' par '/' dans les unitid (extension)",
            category: "Spécifique",
        },
    ],
    [
        "supprimer_commentaire",
        {
            label: "Supprimer les commentaires",
            category: "Suppressions",
        },
    ],
    [
        "remplacer_date_0",
        {
            label: "Remplacer unitdate normal='0' par 's.d.'",
            category: "Spécifique",
        },
    ],
    [
        "nettoyer_type",
        {
            label: "Nettoyer les attributs 'type'",
            complement: "odd type='commentaire', relatedmaterial type='sources-internes' ou 'sources-externes'",
            category: "Suppressions",
        },
    ],
    [
        "ajouter_altrender",
        {
            label: "Ajouter les attributs 'altrender' ligeo",
            complement:
                "'ligeo-branche-standardisadg' si c sans level, 'ligeo-article-standardisadg' si c level='file' ou 'piece'",
            category: "Spécifique",
        },
    ],
    [
        "capitalize_persname",
        {
            label: "Capitaliser les noms de famille persname",
            category: "Corrections",
        },
    ],
    [
        "correction_controlaccess",
        {
            label: "Corriger les controlaccess (avec csv)",
            category: "Corrections",
        },
    ],
    [
        "supprimer_whitespace",
        {
            label: "Supprimer les tabulations et sauts de ligne dans les textes",
            category: "Corrections",
        },
    ],
    [
        "remplacer_windows",
        {
            label: "Remplacer les caractères spéciaux windows (oe, -, ', ...)",
            category: "Corrections",
        },
    ],
    [
        "supprimer_controlaccess",
        {
            label: "Supprimer l'indexation dans les controlaccess",
            category: "Suppressions",
        },
    ],
    [
        "nettoyer_cotes_consultation",
        {
            label: "Nettoyer les unitid type 'cote-de-consultation' et 'cote-future'",
            category: "Spécifique",
        },
    ],
    [
        "supprimer_internal",
        {
            label: "Supprimer les éléments audience='internal'",
            category: "Suppressions",
        },
    ],
    [
        "dedoublonner_indexation",
        {
            label: "Dédoublonner l'indexation par branche",
            category: "Corrections",
        },
    ],
    [
        "completer_did_vides",
        {
            label: "Compléter les did vides",
            category: "Corrections",
        },
    ],
    [
        "supprimer_ca_vides",
        {
            label: "Supprimer les controlaccess vides",
            category: "Suppressions",
        },
    ],
    [
        "ajouter_level_file",
        {
            label: "Ajouter level=file sur les C de dernier niveau qui n'ont pas de level",
            category: "Corrections",
        },
    ],
];

/**
 * Get information about a recipe
 */
export const getInfo = (key: string): RecipeInfo | null | void => {
    const tuple = find(tuple => equals(tuple[0], key), availables);
    return tuple ? tuple[1] : null;
};

/**
 * If there is a label for the recipe, we return it.
 * Otherwise we return the key.
 */
export const getLabel = (key: string): string => {
    const info = getInfo(key);
    return info ? info.label : key;
};

/**
 * Returns the category for the recipe
 */
export const getCategory = (key: string): string | null => {
    const info = getInfo(key);
    return info ? info.category : null;
};

/**
 * Returns an additional information for the recipe, if it exists
 */
export const getComplement = (key: string): string | null => {
    const info = getInfo(key);
    return info && info.complement ? info.complement : null;
};
