//@flow
/**
 * Parameter schema for recipes that show a form in the UI when selected.
 * Labels match src/components/recipes-args/recipe-args.jsx.
 * Defaults come from recipes-lib `defaultArgs` (same as checking the recipe).
 */

import { Map } from "immutable";
import { getDefaultArgs } from "../recipes/recipes-lib.js";

export type RecipeParamSpec = {|
    name: string,
    type: "string" | "array",
    required: boolean,
    label: string,
    description?: string,
    defaultValue: mixed,
    items?: {|
        type: "object",
        properties: { [string]: {| type: string, label: string |} },
    |},
|};

const stringParam = (
    name: string,
    label: string,
    extra?: {| required?: boolean, description?: string, defaultValue?: mixed |}
): RecipeParamSpec => ({
    name,
    type: "string",
    required: extra && extra.required === false ? false : true,
    label,
    description: extra && extra.description ? extra.description : undefined,
    defaultValue: extra && typeof extra.defaultValue !== "undefined" ? extra.defaultValue : "",
});

/**
 * Specs aligned on the human form fields. `required: true` means an empty
 * value makes the recipe a no-op (the UI still lets you run; WebMCP asks
 * the agent to fill it). Explicitly optional fields match the UI copy
 * ("laisser vide") or a non-empty default.
 */
const PARAM_SPECS: { [string]: Array<RecipeParamSpec> } = {
    origination_from_unittitle: [
        stringParam("titre", "Titres à ajouter en origination.", {
            description: "Séparateur : |",
        }),
    ],
    genreform_from_unittitle: [
        stringParam("titre", "Titres à ajouter en genreform.", { description: "Séparateur unittitle : |" }),
        stringParam("type", "Attribut 'type' à ajouter sur les genreform.", { required: false }),
    ],
    index_from_unittitle_multi: [
        stringParam("titres", "Titres à ajouter en index.", { description: "Séparateur unittitle : |" }),
        stringParam("index", "Index controlaccess (par ex: 'genreform')."),
        stringParam("type", "Attribut 'type' à ajouter sur les index.", { required: false }),
        stringParam("separateurs", "Séparateurs pour diviser le titre en plusieurs index (séparés par '|')", {
            required: false,
            defaultValue: ",|et",
        }),
    ],
    ecraser_publisher: [stringParam("publisher", "Publisher")],
    ecraser_repository: [stringParam("repository", "Repository")],
    ecraser_creation: [stringParam("creation", "Creation")],
    ecraser_origination: [stringParam("origination", "Origination (xml)", { description: "Peut contenir du XML" })],
    ecraser_date: [stringParam("date", "Date (année)", { description: "Année (valeur aussi utilisée dans normal)" })],
    geogname_set_source: [stringParam("source", "Valeur de l'attribut")],
    ajouter_persname_source: [
        stringParam("role", "Attribut 'role' recherché", {
            required: false,
            description: "Si vide, tous les persname reçoivent la source",
        }),
        stringParam("source", "Valeur de l'attribut 'source'"),
    ],
    ajouter_typologie_article: [stringParam("valeur", "Contenu du controlaccess genreform")],
    transforme_daogrp_ligeo: [
        stringParam("prefix", "Préfixe à ajouter au dossier. Laisser vide si inutile.", { required: false }),
    ],
    remplace_dao_href: [
        {
            name: "remplacements",
            type: "array",
            required: true,
            label: "Paires rechercher / remplacer dans les href des <dao> et <daoloc>",
            description:
                "Tableau de { rechercher, remplacer }. rechercher est une expression régulière ; doubler les antislash.",
            defaultValue: [],
            items: {
                type: "object",
                properties: {
                    rechercher: { type: "string", label: "Rechercher" },
                    remplacer: { type: "string", label: "Remplacer par" },
                },
            },
        },
    ],
    separer_controlaccess_separator: [
        stringParam("separator", "Texte à utiliser comme séparateur", { required: false, defaultValue: "/" }),
    ],
    deplacer_dans_did: [
        stringParam("balises", "Balises à déplacer.", {
            required: false,
            defaultValue: "physdesc|physloc",
            description: "Séparateur pour plusieurs balises : |",
        }),
    ],
};

export const getParamSpecs = (recipeId: string): Array<RecipeParamSpec> => {
    const specs = PARAM_SPECS[recipeId];
    if (!specs) return [];
    const defaults = getDefaultArgs(recipeId);
    return specs.map((spec) => ({
        ...spec,
        defaultValue: Object.prototype.hasOwnProperty.call(defaults, spec.name)
            ? defaults[spec.name]
            : spec.defaultValue,
    }));
};

export const recipeHasParams = (recipeId: string): boolean => getParamSpecs(recipeId).length > 0;

export const argsToPlain = (args: mixed): { [string]: mixed } => {
    if (!args) return {};
    if (typeof args === "object" && args && typeof args.toJS === "function") {
        return args.toJS();
    }
    if (args && typeof args === "object" && !Array.isArray(args)) {
        return (args: any);
    }
    return {};
};

const isBlankString = (value: mixed): boolean => {
    return typeof value !== "string" || value.trim() === "";
};

const remplacementsAreEmpty = (value: mixed): boolean => {
    if (!Array.isArray(value) || value.length === 0) return true;
    return value.every((item) => {
        if (!item || typeof item !== "object") return true;
        const rechercher = item.rechercher;
        return typeof rechercher !== "string" || rechercher.trim() === "";
    });
};

export const isParamEmpty = (spec: RecipeParamSpec, value: mixed): boolean => {
    if (spec.type === "array") {
        return remplacementsAreEmpty(value);
    }
    return isBlankString(value);
};

export type MissingParam = {|
    recipeId: string,
    param: string,
    label: string,
|};

export const findMissingRequiredParams = (pipeline: any): Array<MissingParam> => {
    const missing = [];
    if (!pipeline || typeof pipeline.forEach !== "function") return missing;
    pipeline.forEach((recipe) => {
        const recipeId = String(recipe.get("key") || "");
        const current = argsToPlain(recipe.get("args"));
        getParamSpecs(recipeId).forEach((spec) => {
            if (!spec.required) return;
            const value = Object.prototype.hasOwnProperty.call(current, spec.name)
                ? current[spec.name]
                : spec.defaultValue;
            if (isParamEmpty(spec, value)) {
                missing.push({ recipeId, param: spec.name, label: spec.label });
            }
        });
    });
    return missing;
};

const validateRemplacements = (
    value: mixed
): { ok: true, value: Array<{ rechercher: string, remplacer: string }> } | { ok: false, error: string } => {
    if (!Array.isArray(value)) {
        return { ok: false, error: "remplacements doit être un tableau de { rechercher, remplacer }." };
    }
    const cleaned = [];
    for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            return { ok: false, error: `remplacements[${i}] doit être un objet { rechercher, remplacer }.` };
        }
        const extra = Object.keys(item).filter((key) => key !== "rechercher" && key !== "remplacer");
        if (extra.length > 0) {
            return { ok: false, error: `remplacements[${i}] : clés inconnues (${extra.join(", ")}).` };
        }
        if (typeof item.rechercher !== "undefined" && typeof item.rechercher !== "string") {
            return { ok: false, error: `remplacements[${i}].rechercher doit être une chaîne.` };
        }
        if (typeof item.remplacer !== "undefined" && typeof item.remplacer !== "string") {
            return { ok: false, error: `remplacements[${i}].remplacer doit être une chaîne.` };
        }
        cleaned.push({
            rechercher: typeof item.rechercher === "string" ? item.rechercher : "",
            remplacer: typeof item.remplacer === "string" ? item.remplacer : "",
        });
    }
    return { ok: true, value: cleaned };
};

/**
 * Merge agent-provided params onto current args (defaults already applied).
 * Rejects unknown keys and wrong types — same fields as the UI form.
 */
export const mergeRecipeParams = (
    recipeId: string,
    currentArgs: mixed,
    incoming: mixed
): { ok: true, args: any } | { ok: false, error: string, extra?: { [string]: mixed } } => {
    const specs = getParamSpecs(recipeId);
    if (specs.length === 0) {
        return {
            ok: false,
            error: `La recette ${recipeId} n'a pas de paramètres (pas de formulaire dans l'UI).`,
        };
    }
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
        return { ok: false, error: "params doit être un objet { nomParamètre: valeur }." };
    }
    const specByName: { [string]: RecipeParamSpec } = {};
    specs.forEach((spec) => {
        specByName[spec.name] = spec;
    });
    const unknown = Object.keys(incoming).filter((key) => !specByName[key]);
    if (unknown.length > 0) {
        return {
            ok: false,
            error: `Paramètres inconnus pour ${recipeId} : ${unknown.join(", ")}.`,
            extra: { unknownParams: unknown, allowedParams: specs.map((spec) => spec.name) },
        };
    }
    const current = argsToPlain(currentArgs);
    const next = { ...current };
    const incomingObj: { [string]: mixed } = (incoming: any);
    for (let i = 0; i < Object.keys(incomingObj).length; i++) {
        const name = Object.keys(incomingObj)[i];
        const spec = specByName[name];
        const value = incomingObj[name];
        if (spec.type === "string") {
            if (typeof value !== "string") {
                return { ok: false, error: `Le paramètre ${name} de ${recipeId} doit être une chaîne.` };
            }
            next[name] = value;
        } else if (spec.type === "array") {
            const checked = validateRemplacements(value);
            if (!checked.ok) {
                return { ok: false, error: checked.error };
            }
            next[name] = checked.value;
        }
    }
    return { ok: true, args: Map(next) };
};

export const describeParamsForAgent = (recipeId: string, currentArgs: mixed) => {
    const specs = getParamSpecs(recipeId);
    const current = argsToPlain(currentArgs);
    return specs.map((spec) => ({
        name: spec.name,
        type: spec.type,
        required: spec.required,
        label: spec.label,
        description: spec.description,
        defaultValue: spec.defaultValue,
        items: spec.items,
        currentValue: Object.prototype.hasOwnProperty.call(current, spec.name) ? current[spec.name] : spec.defaultValue,
    }));
};
