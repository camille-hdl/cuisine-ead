//@flow
import { createSelector } from "reselect";
import { Map, List } from "immutable";
import { findRecipe } from "../lib/recipes.js";
import { pipe, memoizeWith, identity } from "ramda";

export const previewHashSelector = state => state.get("previewHash");
export const xmlFilesSelector = state => state.get("xmlFiles");
export const pipelineSelector = state => state.get("pipeline");

export const previewXmlFileSelector = createSelector(
    previewHashSelector,
    xmlFilesSelector,
    (previewHash: string | null, xmlFiles: List): Map | null => {
        if (xmlFiles.size <= 0) return null;
        if (previewHash) {
            const previewFile = xmlFiles.find(f => f.get("hash") === previewHash);
            return previewFile ? previewFile : xmlFiles.first();
        }
        return xmlFiles.first();
    }
);

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
        return memoizeWith(xmlFile => xmlFile.get("hash"), xmlFile => fn(xmlFile.get("doc")));
    }
);

export const previewXmlStringSelector = createSelector(
    previewXmlFileSelector,
    pipelineFnSelector,
    (xmlFile: Map, pipelineFn: (doc: any) => any): string | null => {
        if (!xmlFile || !pipelineFn) return null;
        const newDoc = pipelineFn(xmlFile);
        const serializer = new XMLSerializer();
        return serializer.serializeToString(newDoc);
    }
);
