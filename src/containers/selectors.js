//@flow
import { createSelector } from "reselect";
import { Map, List } from "immutable";
import { findRecipe } from "../lib/recipes.js";
import { pipe, compose, memoizeWith, take, split, identity, join } from "ramda";

/**
 * Returns only the first few lines of the file,
 * because rendering the diff is slow and freezes the browser
 */
const getFirstThousandLines = memoizeWith(
    identity,
    compose(
        join("\n"),
        take(600),
        split("\n")
    )
);

export const previewHashSelector = state => state.get("previewHash");
export const xmlFilesSelector = state => state.get("xmlFiles");
export const pipelineSelector = state => state.get("pipeline");
export const previewEnabledSelector = state => state.get("previewEnabled");

/**
 * If preview is enabled, we return the selected file, or the first one by default.
 */
export const previewXmlFileSelector = createSelector(
    previewHashSelector,
    xmlFilesSelector,
    previewEnabledSelector,
    (previewHash: string | null, xmlFiles: List, previewEnabled: boolean): Map | null => {
        if (!previewEnabled) return null;
        if (xmlFiles.size <= 0) return null;
        if (previewHash) {
            const previewFile = xmlFiles.find(f => f.get("hash") === previewHash);
            return previewFile ? previewFile : xmlFiles.first();
        }
        return xmlFiles.first();
    }
);

/**
 * Retourne le xmlFile pour preview, avec seulement les N premières lignes de son fichier
 */
export const previewXmlFileSliceSelector = createSelector(
    previewXmlFileSelector,
    (previewXmlFile: Map | null): Map | null => {
        return previewXmlFile ? previewXmlFile.update("string", getFirstThousandLines) : null;
    }
);

const createNewDoc = (xmlFile: Map): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlFile.get("string"), "application/xml");
};

/**
 * Returns a memoized function that applies the selected recipes to a `xmlFile` objet.
 * `xmlFile.hash` is used as the cache key.
 * Since the function is re-created for every recipe combination, the cache
 * will be cleared whenever needed.
 */
export const pipelineFnSelector = createSelector(
    pipelineSelector,
    (pipeline: List) => {
        if (pipeline.size <= 0) return null;
        const recipesFns = pipeline.map(r => findRecipe(r.get("key")).fn).toArray();
        const fn = pipe(...recipesFns);
        return memoizeWith(xmlFile => xmlFile.get("hash"), xmlFile => fn(createNewDoc(xmlFile)));
    }
);

/**
 * Returns a string representation of the selected xml file
 * after having applied the pipeline to it.
 */
export const previewXmlStringSelector = createSelector(
    previewXmlFileSelector,
    pipelineFnSelector,
    (xmlFile: Map, pipelineFn: (doc: any) => any): string | null => {
        if (!xmlFile || !pipelineFn) return null;
        const newDoc = pipelineFn(xmlFile);
        const serializer = new XMLSerializer();
        return getFirstThousandLines(serializer.serializeToString(newDoc));
    }
);
