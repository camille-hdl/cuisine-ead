/**
 //@flow
 * Top-level API for the recipes
 */
import { find, partialRight, propEq } from "ramda";
import type { Recipe, ExecuteState } from "./types.js";
import type { RecipeInPipelineRecord } from "../../types.js";
import { Map, List, fromJS } from "immutable";
import { xpathFilter } from "../xml.js";
import supprimerLb from "./individual-recipes/supprimer-lb.js";
import supprimerLabelsVides from "./individual-recipes/supprimer-labels-vides.js";
import remplacePlageSeparator from "./individual-recipes/remplace-plage-separator.js";
import remplaceExtensionSeparator from "./individual-recipes/remplace-extension-separator.js";
import supprimeComments from "./individual-recipes/supprime-comments.js";
import replaceUnitDateNd from "./individual-recipes/replace-unit-date-nd.js";
import viderUnitDateNormal from "./individual-recipes/vider-unit-date-normal.js";
import nettoyerAttrType from "./individual-recipes/nettoyer-attr-type.js";
import nettoyerAttrTypeTitre from "./individual-recipes/nettoyer-attr-type-titre.js";
import ajouterAltRender from "./individual-recipes/ajouter-alt-render.js";
import corrigerAccessRestrictLigeo from "./individual-recipes/corriger-access-restrict-ligeo.js";
import capitalizePersname from "./individual-recipes/capitalize-persname.js";
import supprimeWhitespace from "./individual-recipes/supprime-whitespace.js";
import remplacerCharWindows from "./individual-recipes/remplacer-char-windows.js";
import supprimeControlAccess from "./individual-recipes/supprime-controlaccess.js";
import nettoyerCoteConsultation from "./individual-recipes/nettoyer-cote-consultation.js";
import nettoyerUnitTitleEmph from "./individual-recipes/nettoyer-unit-title-emph.js";
import nettoyerAddressline from "./individual-recipes/nettoyer-addressline.js";
import nettoyerSpan from "./individual-recipes/nettoyer-span.js";
import supprimerInternal from "./individual-recipes/supprimer-internal.js";
import ajouterScopecontentAudience from "./individual-recipes/ajouter-scopecontent-audience.js";
import completerDidVides from "./individual-recipes/completer-did-vide.js";
import dedoublonnerIndexation from "./individual-recipes/dedoublonner-indexation.js";
import supprimerControlaccessVides from "./individual-recipes/supprimer-controlaccess-vides.js";
import supprimerHeadVides from "./individual-recipes/supprimer-head-vides.js";
import ajouterLevelFileForce from "./individual-recipes/ajouter-level-file-force.js";
import ajouterLevelFile from "./individual-recipes/ajouter-level-file.js";
import geognameSourceGeo from "./individual-recipes/geogname-source-geo.js";
import extentUnit from "./individual-recipes/extent-unit.js";
import dimensionsTypeUnit from "./individual-recipes/dimensions-type-unit.js";
import corpnameToSubjectW from "./individual-recipes/corpname-to-subject-W.js";
import ajouterSubjectSourceW from "./individual-recipes/ajouter-subject-source-W.js";
import corrigerSubjectContexteHisto from "./individual-recipes/corriger-subject-contexte-histo.js";
import corrigerMatSpecDonnees from "./individual-recipes/corriger-mat-spec-donnees.js";
import corrigerGenreformPhysdesc from "./individual-recipes/corriger-genreform-physdesc.js";
import traitementsLigeo from "./individual-recipes/traitements-ligeo.js";
import supprimerMnesysInternal from "./individual-recipes/supprimer-mnesys-internal.js";
import supprimerAccessRestrictFormate from "./individual-recipes/supprimer-access-restrict-formate.js";
import fixOriginationName from "./individual-recipes/fix-origination-name.js";
import ecraserPublisher from "./individual-recipes/ecraser-publisher.js";
import ecraserRepository from "./individual-recipes/ecraser-repository.js";
import ecraserCreation from "./individual-recipes/ecraser-creation.js";
import ecraserOrigination from "./individual-recipes/ecraser-origination.js";
import ecraserDate from "./individual-recipes/ecraser-date.js";
import modifierDscOthertype from "./individual-recipes/modifier-dsc-othertype.js";
import supprimerGenreformTypir from "./individual-recipes/supprimer-genreform-typir.js";
import supprimerPhysDidArchdesc from "./individual-recipes/supprimer-phys-did-archdesc.js";
import supprimerLangusage from "./individual-recipes/supprimer-langusage.js";
import reordonnerOriginalsLoc from "./individual-recipes/reordonner-originals-loc.js";
import correctionControlAccess from "./individual-recipes/correction-control-access.js";
import supprimerCId from "./individual-recipes/supprimer-c-id.js";
import geognameSetSource from "./individual-recipes/geogname-set-source.js";
import remplacePlageSeparatorStrict from "./individual-recipes/remplace-plage-separator-strict.js";
import ajouterPersnameSource from "./individual-recipes/ajouter-persname-source.js";
import ajouterAltRenderForce from "./individual-recipes/ajouter-alt-render-force.js";
import ajouterTypologieArticle from "./individual-recipes/ajouter-typologie-article.js";
import ajouterAccessRestrictLigeo from "./individual-recipes/ajouter-accessrestrict-ligeo.js";
import transformeDaogrpLigeo from "./individual-recipes/transforme-daogrp-ligeo.js";
import nettoyerOtherfindaidList from "./individual-recipes/nettoyer-otherfindaid-list.js";
import originationFromUnittitle from "./individual-recipes/origination-from-unittitle.js";
import genreformFromUnittitle from "./individual-recipes/genreform-from-unittitle.js";
import genreformFromUnittitleMulti from "./individual-recipes/genreform-from-unittitle-multi.js";
import copierTitleproperDansUnittitle from "./individual-recipes/copier-titleproper-dans-unittitle.js";
import sortirScopeContentDid from "./individual-recipes/sortir-scopecontent-did.js";
import idFromUnittitle from "./individual-recipes/id-from-unittitle.js";
import extraireDaoFromDaodesc from "./individual-recipes/extraire-dao-daodesc.js";
import remplaceDaoHref from "./individual-recipes/remplace-dao-href.js";
import separerControlaccessLb from "./individual-recipes/separer-controlaccess-lb.js";
import separerControlaccessSeparator from "./individual-recipes/separer-controlaccess-separator.js";
import deplacerGenreformPhysdesc from "./individual-recipes/deplacer-genreform-physdesc.js";
import insertIntoDocument from "./insert-into-document.js";
import deplacerUnitdateUnittitle from "./individual-recipes/deplacer-unitdate-unittitle.js";
import deplacerDansDid from "./individual-recipes/deplacer-dans-did.js";

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
        { key: "nettoyer_span", fn: nettoyerSpan },
        { key: "supprimer_internal", fn: supprimerInternal },
        { key: "ajouter_scopecontent_audience", fn: ajouterScopecontentAudience },
        { key: "completer_did_vides", fn: completerDidVides },
        { key: "dedoublonner_indexation", fn: dedoublonnerIndexation },
        { key: "supprimer_ca_vides", fn: supprimerControlaccessVides },
        { key: "supprimer_head_vides", fn: supprimerHeadVides },
        { key: "ajouter_level_file_force", fn: ajouterLevelFileForce },
        { key: "ajouter_level_file", fn: ajouterLevelFile },
        { key: "geog_source_geog", fn: geognameSourceGeo },
        { key: "extent_unit", fn: extentUnit },
        { key: "dimensions_type_unit", fn: dimensionsTypeUnit },
        { key: "corpname_to_subject", fn: corpnameToSubjectW },
        { key: "subject_ajouter_sourceW", fn: ajouterSubjectSourceW },
        { key: "corriger_source_contexte", fn: corrigerSubjectContexteHisto },
        { key: "corriger_mat_spec_donnees", fn: corrigerMatSpecDonnees },
        { key: "corriger_deplacer_genreform", fn: corrigerGenreformPhysdesc },
        { key: "deplacer_genreform_physdesc", fn: deplacerGenreformPhysdesc },
        { key: "pack_ligeo", fn: traitementsLigeo },
        { key: "suppr_mnesys_internal", fn: supprimerMnesysInternal },
        { key: "suppr_accessrestrict_formate", fn: supprimerAccessRestrictFormate },
        { key: "remplacer_ori_name_corpname", fn: fixOriginationName },
        { key: "ecraser_publisher", fn: ecraserPublisher },
        { key: "ecraser_repository", fn: ecraserRepository },
        { key: "ecraser_creation", fn: ecraserCreation },
        { key: "ecraser_origination", fn: ecraserOrigination },
        { key: "ecraser_date", fn: ecraserDate },
        { key: "modifier_dsc_type", fn: modifierDscOthertype },
        { key: "supprimer_genreform_typir", fn: supprimerGenreformTypir },
        { key: "supprimer_physdesc_archdesc", fn: supprimerPhysDidArchdesc },
        { key: "supprimer_langusage", fn: supprimerLangusage },
        { key: "reorg_c_originalsloc", fn: reordonnerOriginalsLoc },
        { key: "supprimer_c_id", fn: supprimerCId },
        { key: "geogname_set_source", fn: geognameSetSource },
        { key: "remplace_plage_separator_strict", fn: remplacePlageSeparatorStrict },
        { key: "ajouter_persname_source", fn: ajouterPersnameSource },
        { key: "ajouter_altrender_force", fn: ajouterAltRenderForce },
        { key: "ajouter_typologie_article", fn: ajouterTypologieArticle },
        { key: "ajouter_accessrestrict_ligeo", fn: ajouterAccessRestrictLigeo },
        { key: "transforme_daogrp_ligeo", fn: transformeDaogrpLigeo },
        { key: "nettoyer_otherfindaid_list", fn: nettoyerOtherfindaidList },
        { key: "origination_from_unittitle", fn: originationFromUnittitle },
        { key: "genreform_from_unittitle", fn: genreformFromUnittitle },
        { key: "index_from_unittitle_multi", fn: genreformFromUnittitleMulti },
        { key: "copier_titleproper_dans_unittitle", fn: copierTitleproperDansUnittitle },
        { key: "sortir_scopecontent_did", fn: sortirScopeContentDid },
        { key: "id_from_unittitle", fn: idFromUnittitle },
        { key: "extraire_dao_daodesc", fn: extraireDaoFromDaodesc },
        { key: "remplace_dao_href", fn: remplaceDaoHref },
        { key: "separer_controlaccess_lb", fn: separerControlaccessLb },
        { key: "separer_controlaccess_separator", fn: separerControlaccessSeparator },
        { key: "deplacer_unitdate_unittitle", fn: deplacerUnitdateUnittitle },
        { key: "deplacer_dans_did", fn: deplacerDansDid },
    ];
};

/**
 * Used for testing purposes.
 * cypress is used for unit testing recipes,
 * as they depend on browser APIs
 */
window.__cypress_xpathFilter = xpathFilter;
window.__cypress_recipes = {};
window.__cypress_immutable = { Map, List, fromJS };
window.__cypress_insertIntoDocument = insertIntoDocument;
getRecipes().forEach((recipe) => {
    window.__cypress_recipes[recipe.key] = recipe.fn;
});

/**
 * Returns an array of 'stateful' recipes : functions that take a DOM `Document` and the app state
 * as arguments, and return the modified `Document`.
 * * Each element in the array is an object `{ key: string, fn: (state: ExecuteState, doc: Document) => Document }` where `fn` is `curry`ed
 * * The `state` Map contains a property `corrections: Map`.
 */
export const getStatefulRecipes = () => {
    return [{ key: "correction_controlaccess", fn: correctionControlAccess }];
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
export default (recipe: RecipeInPipelineRecord, state: ExecuteState): ((doc: Document) => Document) => {
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
