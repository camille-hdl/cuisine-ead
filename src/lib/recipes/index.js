//@flow
/**
 * Top-level API for the recipes
 */
import { find, partialRight, propEq } from "ramda";
import * as r from "./recipes.js";
import type { Recipe, ExecuteState } from "./recipes.js";
import type { Map } from "immutable";

/**
 * Returns an array of 'simple' recipes creators : functions that create functions that take a single DOM `Document` as argument and returns
 * the modified `Document`.
 * The first function is called with the `args` object of the recipe.
 * Each element in the array is an object `{ key: string, fn: (args: any) => (doc: Document) => Document }`
 */
export const getRecipes = () => {
    return [
        { key: "supprimer_lb", fn: r.supprimerLb },
        { key: "supprimer_label_vide", fn: r.supprimerLabelsVides },
        { key: "remplacer_sep_plage", fn: r.remplacePlageSeparator },
        { key: "remplacer_sep_ext", fn: r.remplaceExtensionSeparator },
        { key: "supprimer_commentaire", fn: r.supprimeComments },
        { key: "remplacer_date_0", fn: r.replaceUnitDateNd },
        { key: "vider_unitdate_normal", fn: r.viderUnitDateNormal },
        { key: "nettoyer_type", fn: r.nettoyerAttrType },
        { key: "nettoyer_type_titre", fn: r.nettoyerAttrTypeTitre },
        { key: "ajouter_altrender", fn: r.ajouterAltRender },
        { key: "corriger_accessrestrict_ligeo", fn: r.corrigerAccessRestrictLigeo },
        { key: "capitalize_persname", fn: r.capitalizePersname },
        { key: "supprimer_whitespace", fn: r.supprimeWhitespace },
        { key: "remplacer_windows", fn: r.remplacerCharWindows },
        { key: "supprimer_controlaccess", fn: r.supprimeControlAccess },
        { key: "nettoyer_cotes_consultation", fn: r.nettoyerCoteConsultation },
        { key: "nettoyer_emph_unittitle", fn: r.nettoyerUnitTitleEmph },
        { key: "nettoyer_addressline", fn: r.nettoyerAddressline },
        { key: "nettoyer_span", fn: r.nettoyerSpan },
        { key: "supprimer_internal", fn: r.supprimerInternal },
        { key: "ajouter_scopecontent_audience", fn: r.ajouterScopecontentAudience },
        { key: "completer_did_vides", fn: r.completerDidVides },
        { key: "dedoublonner_indexation", fn: r.dedoublonnerIndexation },
        { key: "supprimer_ca_vides", fn: r.supprimerControlaccessVides },
        { key: "supprimer_head_vides", fn: r.supprimerHeadVides },
        { key: "ajouter_level_file", fn: r.ajouterLevelFile },
        { key: "geog_source_geog", fn: r.geognameSourceGeo },
        { key: "extent_unit", fn: r.extentUnit },
        { key: "dimensions_type_unit", fn: r.dimensionsTypeUnit },
        { key: "corpname_to_subject", fn: r.corpnameToSubjectW },
        { key: "subject_ajouter_sourceW", fn: r.ajouterSubjectSourceW },
        { key: "corriger_source_contexte", fn: r.corrigerSubjectContexteHisto },
        { key: "corriger_mat_spec_donnees", fn: r.corrigerMatSpecDonnees },
        { key: "corriger_deplacer_genreform", fn: r.corrigerGenreformPhysdesc },
        { key: "pack_ligeo", fn: r.traitementsLigeo },
        { key: "remplacer_ori_name_corpname", fn: r.fixOriginationName },
        { key: "ecraser_publisher", fn: r.ecraserPublisher },
        { key: "ecraser_repository", fn: r.ecraserRepository },
        { key: "ecraser_creation", fn: r.ecraserCreation },
        { key: "ecraser_origination", fn: r.ecraserOrigination },
        { key: "ecraser_date", fn: r.ecraserDate },
        { key: "modifier_dsc_type", fn: r.modifierDscOthertype },
        { key: "supprimer_genreform_typir", fn: r.supprimerGenreformTypir },
        { key: "supprimer_physdesc_archdesc", fn: r.supprimerPhysDidArchdesc },
        { key: "supprimer_langusage", fn: r.supprimerLangusage },
        { key: "reorg_c_originalsloc", fn: r.reordonnerOriginalsLoc },
    ];
};

/**
 * Returns an array of 'stateful' recipes : functions that take a DOM `Document` and the app state
 * as arguments, and return the modified `Document`.
 * * Each element in the array is an object `{ key: string, fn: (state: ExecuteState, doc: Document) => Document }` where `fn` is `curry`ed
 * * The `state` Map contains a property `corrections: Map`.
 */
export const getStatefulRecipes = () => {
    return [{ key: "correction_controlaccess", fn: r.correctionControlAccess }];
};

const _findRecipe = partialRight(find, [getRecipes()]);
export const findRecipe = (key: string): { key: string, fn: Recipe } | typeof undefined =>
    _findRecipe(propEq("key", key));

const _findStatefulRecipe = partialRight(find, [getStatefulRecipes()]);
export const findStatefulRecipe = (key: string): { key: string, fn: Recipe } | typeof undefined =>
    _findStatefulRecipe(propEq("key", key));

/**
 * Given a `recipe` (`Map<{key: string, args: any}>`), this will return the corresponding function `(doc: Document) => document`
 * to apply a modification on a DOM `Document`.
 * If the function needs the application state to work, it will be provided automatically.
 */
export default (recipe: Map<string, any>, state: ExecuteState): ((doc: Document) => Document) => {
    const recipeKey = recipe.get("key");
    const recipeArgs = recipe.get("args");
    if (typeof recipeKey !== "string") {
        throw new Error("recipeKey should be a string");
    }
    const foundRecipe = findRecipe(recipeKey);
    if (foundRecipe) {
        return foundRecipe.fn(recipeArgs);
    }
    const statefulRecipe = findStatefulRecipe(recipeKey);
    if (statefulRecipe) {
        return statefulRecipe.fn(state);
    }
    throw new Error("Unknown recipe: " + recipeKey);
};
