//@flow
import { find, equals } from "ramda";
type RecipeInfo = {
    label: string,
    category: string,
    complement?: string,
    defaultArgs?: any,
};

/**
 * This lets the UI know which recipes are available,
 * and in which Category they belong.
 * Also, if the recipe requires arguments, we can provide default values
 */
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
            label: "Remplacer '-' par ' à ' dans les unitid",
            complement: "Transforme '1 P 100/1-3' en '1 P 100 /1 à /3' ou '1 P 2/1' en '1 P 2 /1'",
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
        "id_from_unittitle",
        {
            label: "Générer des ids de fiches <c> manquants",
            complement: "L'id est généré à partir du unittitle s'il existe, sinon à partir des ids des parents et d'un incrément",
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
        "origination_from_unittitle",
        {
            label: "Définir origination à partir de la valeur unittitle",
            category: "Spécifique",
            complement: "Séparateur: |",
            defaultArgs: { titre: "" },
        },
    ],
    [
        "genreform_from_unittitle",
        {
            label: "Définir genreform à partir de la valeur unittitle",
            category: "Spécifique",
            complement: "Séparateur unittitle: |",
            defaultArgs: { titre: "", type: "" },
        },
    ],
    [
        "index_from_unittitle_multi",
        {
            label: "Définir plusieurs index controlaccess à partir des valeurs unittitle",
            category: "Spécifique",
            complement: "Séparateur unittitle: |",
            defaultArgs: { titres: "", index: "", type: "", separateurs: ",|et" },
        },
    ],
    [
        "vider_unitdate_normal",
        {
            label: "Vider l'attribut 'normal' des unitdate",
            category: "Suppressions",
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
        "nettoyer_type_titre",
        {
            label: "Nettoyer les attributs 'type=titre'",
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
        "corriger_accessrestrict_ligeo",
        {
            label: "Corriger les accessrestrict 'modalite-access' ligeo",
            category: "Spécifique",
        },
    ],
    [
        "remplacer_ori_name_corpname",
        {
            label: "Remplacer origination>name par origination>corpname",
            category: "Spécifique",
        },
    ],
    [
        "reorg_c_originalsloc",
        {
            label: "Réordonner le contenu de <c>: did, originalsloc, scopecontent, ...",
            category: "Spécifique",
        },
    ],
    [
        "pack_ligeo",
        {
            label: "Tous les traitements spécifiques ligéo",
            complement: "altrender, genreform, accessrestrict",
            category: "Packs",
        },
    ],
    [
        "suppr_mnesys_internal",
        {
            label: "Supprimer les notes mnesysinternal",
            category: "Spécifique",
        },
    ],
    [
        "suppr_accessrestrict_formate",
        {
            label: "Supprimer les accessrestrict type=formate",
            category: "Spécifique",
        },
    ],
    [
        "geog_source_geog",
        {
            label: "Ajouter source='geogname' sur les geognames sans source",
            category: "Corrections",
        },
    ],
    [
        "extent_unit",
        {
            label: "Remplacer extent type par unit",
            complement: "Remplace l'attribut type='nombre elements' par unit='feuille'",
            category: "Corrections",
        },
    ],
    [
        "dimensions_type_unit",
        {
            label: "Ajouter type et unit sur dimensions",
            complement: "Ajouter type='hauteur_x_largeur' unit='cm' sur dimensions",
            category: "Corrections",
        },
    ],
    [
        "corpname_to_subject",
        {
            label: "Remplacer corpname sans attr. par subject",
            complement: "Remplace les corpname sans attributs par subject source='periode_thesaurus_w'",
            category: "Corrections",
        },
    ],
    [
        "subject_ajouter_sourceW",
        {
            label: "Ajouter source='thesaurus_w' aux subjects sans source",
            category: "Corrections",
        },
    ],
    [
        "corriger_source_contexte",
        {
            label: "Remplacer subject source='contexte-historique' par 'periode_thesaurus_w'",
            category: "Corrections",
        },
    ],
    [
        "corriger_mat_spec_donnees",
        {
            label: "Remplacer materialspec type='données mathématiques' par 'echelle'",
            category: "Corrections",
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
        "nettoyer_emph_unittitle",
        {
            label: "Nettoyer emph italic et super dans les unittitle",
            category: "Suppressions",
        },
    ],
    [
        "nettoyer_addressline",
        {
            label: "Nettoyer address",
            category: "Suppressions",
        },
    ],
    [
        "nettoyer_span",
        {
            label: "Nettoyer les spans (conserver le contenu)",
            category: "Suppressions",
        },
    ],
    [
        "nettoyer_otherfindaid_list",
        {
            label: "Enlever les otherfindaid>list>item mais conserver leur contenu",
            category: "Suppressions",
        },
    ],
    [
        "corriger_deplacer_genreform",
        {
            label: "Déplacer certains genreform dans physdesc",
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
        "ajouter_scopecontent_audience",
        {
            label: "Ajouter audience=external sur les scopecontent",
            category: "Corrections",
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
        "supprimer_head_vides",
        {
            label: "Supprimer les head vides",
            category: "Suppressions",
        },
    ],
    [
        "ajouter_level_file_force",
        {
            label: "Ajouter level=file sur les C de dernier niveau",
            complement: "Même si elles ont déjà un level",
            category: "Corrections",
        },
    ],
    [
        "ajouter_level_file",
        {
            label: "Ajouter level=file sur les C de dernier niveau qui n'ont pas de level",
            category: "Corrections",
        },
    ],
    [
        "ecraser_publisher",
        {
            label: "Ecraser publisher. Sera créé s'il n'existe pas.",
            category: "Personnaliser",
            defaultArgs: { publisher: "" },
        },
    ],
    [
        "ecraser_repository",
        {
            label: "Ecraser repository. Sera créé s'il n'existe pas.",
            category: "Personnaliser",
            defaultArgs: { repository: "" },
        },
    ],
    [
        "ecraser_creation",
        {
            label: "Ecraser creation. Sera créé s'il n'existe pas.",
            category: "Personnaliser",
            defaultArgs: { creation: "" },
        },
    ],
    [
        "ecraser_origination",
        {
            label: "Ecraser origination. Sera créé s'il n'existe pas.",
            complement: "Peut contenir du xml",
            category: "Personnaliser",
            defaultArgs: { origination: "" },
        },
    ],
    [
        "ecraser_date",
        {
            label: "Ecraser date. Sera créé s'il n'existe pas.",
            complement: "Année (valeur aussi utilisé dans normal)",
            category: "Personnaliser",
            defaultArgs: { date: "" },
        },
    ],
    [
        "modifier_dsc_type",
        {
            label: "Enlever type=othertype de dsc",
            category: "Corrections",
        },
    ],
    [
        "supprimer_genreform_typir",
        {
            label: "Supprimer genreform type=typir",
            category: "Spécifique",
        },
    ],
    [
        "supprimer_physdesc_archdesc",
        {
            label: "Supprimer physdesc du archdesc/did",
            category: "Suppressions",
        },
    ],
    [
        "supprimer_langusage",
        {
            label: "Supprimer langusage dans eadheader",
            category: "Suppressions",
        },
    ],
    [
        "supprimer_c_id",
        {
            label: "Supprimer l'attribut ID des balises <c>",
            category: "Suppressions",
        },
    ],
    [
        "geogname_set_source",
        {
            label: "Définir un attribut source sur les geogname",
            category: "Corrections",
            defaultArgs: { source: "" },
        },
    ],
    [
        "remplace_plage_separator_strict",
        {
            label: "Remplacer '-' par ' à ' dans les unitid",
            complement: "Ne rajoute pas de '/' dans les articles",
            category: "Spécifique",
        },
    ],
    [
        "ajouter_persname_source",
        {
            label: "Définir un attribut source sur les persname",
            complement: "Préciser le role recherché pour les persnames",
            category: "Spécifique",
            defaultArgs: { role: "", source: "" },
        },
    ],
    [
        "ajouter_altrender_force",
        {
            label: "Ajouter les valeurs altrender Ligéo même s'il n'y a pas de level",
            category: "Spécifique",
        },
    ],
    [
        "ajouter_typologie_article",
        {
            label: "Ajouter un controlaccess genreform[source=typologie]",
            complement: "sur les fiches C articles",
            category: "Corrections",
            defaultArgs: { valeur: "" },
        },
    ],
    [
        "ajouter_accessrestrict_ligeo",
        {
            label: "Ajouter accessrestrict[type=incommunicable] Ligéo",
            complement: "sur les fiches C articles",
            category: "Spécifique",
        },
    ],
    [
        "transforme_daogrp_ligeo",
        {
            label: "Convertir les daogrp first/last au format Ligéo (link)",
            complement: "S'il est fourni, le préfixe est ajouté au dossier",
            category: "Spécifique",
            defaultArgs: { prefix: "" },
        },
    ],
    [
        "copier_titleproper_dans_unittitle",
        {
            label: "Copier le titleproper dans le unittitle du archdesc",
            category: "Corrections",
        },
    ],
    [
        "sortir_scopecontent_did",
        {
            label: "Sortir scopecontent du did et le placer juste après",
            category: "Corrections",
        },
    ],
    [
        "extraire_dao_daodesc",
        {
            label: "Extraire les <daoloc> de <daodesc>",
            category: "Spécifique",
        },
    ],
    [
        "remplace_dao_href",
        {
            label: "Rechercher/remplacer dans les href des <daoloc> et <dao>",
            complement: "La chaine recherchée utilise les expressions régulières",
            category: "Corrections",
            defaultArgs: { remplacements: [] },
        },
    ],
    [
        "separer_controlaccess_lb",
        {
            label: "Si un controlaccess contient plusieurs lb, le transformer en plusieurs controlaccess",
            category: "Corrections",
        },
    ],
];

/**
 * Get information about a recipe
 */
export const getInfo = (key: string): RecipeInfo | null | void => {
    const tuple = find((tuple) => equals(tuple[0], key), availables);
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
 * Returns the initial arguments used by the recipe
 */
export const getDefaultArgs = (key: string): { [argName: string]: any } => {
    const info = getInfo(key);
    return info && info.defaultArgs ? info.defaultArgs : {};
};

/**
 * Returns an additional information for the recipe, if it exists
 */
export const getComplement = (key: string): string | null => {
    const info = getInfo(key);
    return info && info.complement ? info.complement : null;
};
