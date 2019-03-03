//@flow
import { createSelector } from "reselect";
import { Map, List } from "immutable";
import getRecipeFn from "../lib/recipes.js";
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
export const correctionsSelector = state => state.get("corrections");

/**
 * If preview is enabled, we return the selected file, or the first one if none is selected.
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
 * Returns the first few hundred lines of the previewed `xmlFile`
 */
export const previewXmlFileSliceSelector = createSelector(
    previewXmlFileSelector,
    (previewXmlFile: Map | null): Map | null => {
        return previewXmlFile ? previewXmlFile.update("string", getFirstThousandLines) : null;
    }
);

/**
 * Returns a new `Document` for a given `xmlFile`.
 */
const createNewDoc = (xmlFile: Map): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlFile.get("string"), "application/xml");
};

/**
 * Returns the state required by stateful recipes, such as controlaccess corrections.
 */
export const pipelineStateSelector = createSelector(
    correctionsSelector,
    (corrections: Map): Map => {
        return Map({
            corrections,
        });
    }
);

/**
 * Returns a memoized function that applies the selected recipes to a `xmlFile` objet.
 * `xmlFile.hash` is used as the cache key.
 * Since the function is re-created when relevant state changes, the cache
 * will be cleared whenever needed.
 * The function will create a new `Document` every time it's called
 * because the DOM API mutates it.
 */
export const pipelineFnSelector = createSelector(
    pipelineSelector,
    pipelineStateSelector,
    (pipeline: List, executeState: Map): ((doc: Document) => Document) => {
        if (pipeline.size <= 0) return null;
        const recipesFns = pipeline.map(r => getRecipeFn(r.get("key"), executeState)).toArray();
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
    (xmlFile: Map, pipelineFn: (doc: Document) => Document): string | null => {
        if (!xmlFile || !pipelineFn) return null;
        const newDoc = pipelineFn(xmlFile);
        const serializer = new XMLSerializer();
        return getFirstThousandLines(serializer.serializeToString(newDoc));
    }
);
