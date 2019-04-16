//@flow
import { createSelector } from "reselect";
import { Map, List } from "immutable";
import getRecipeFn from "../lib/recipes.js";
import getOutputRecipeFn from "../lib/output-recipes.js";
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

export const previewHashSelector = (state: Map): string | null => state.get("previewHash");
export const xmlFilesSelector = (state: Map): List<Map> => state.get("xmlFiles");
export const pipelineSelector = (state: Map): List => state.get("pipeline");
export const outputPipelineSelector = (state: Map): List => state.get("outputPipeline");
export const previewEnabledSelector = (state: Map): boolean => state.get("previewEnabled");
export const correctionsSelector = (state: Map): Map => state.get("corrections");

/**
 * If preview is enabled, we return the selected file, or the first one if none is selected.
 */
export const previewXmlFileSelector = createSelector<Map, void, string | null, List, boolean, Map | null>(
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
export const previewXmlFileSliceSelector = createSelector<Map, void, Map | null, Map | null>(
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
export const pipelineStateSelector = createSelector<Map, void, Map, Map>(
    correctionsSelector,
    (corrections: Map): Map => {
        return Map({
            corrections,
        });
    }
);

type PipelineFn = (xmlFile: Map) => Document;
/**
 * Returns a memoized function that applies the selected recipes to a `xmlFile` objet.
 * `xmlFile.hash` is used as the cache key.
 * Since the function is re-created when relevant state changes, the cache
 * will be cleared whenever needed.
 * The function will create a new `Document` every time it's called
 * because the DOM API mutates it.
 */
export const pipelineFnSelector = createSelector<Map, void, List, Map, PipelineFn | null>(
    pipelineSelector,
    pipelineStateSelector,
    (pipeline: List, executeState: Map): PipelineFn | null => {
        if (pipeline.size <= 0) return null;
        const recipesFns = pipeline.map(r => getRecipeFn(r.get("key"), executeState)).toArray();
        const fn = pipe(...recipesFns);
        return memoizeWith(xmlFile => xmlFile.get("hash"), xmlFile => fn(createNewDoc(xmlFile)));
    }
);

type OutputPipelineFn = (xmlString: string) => string;
/**
 * Returns a function that applies the selected output recipes (`xmlString => xmlString`) to an xmlString
 * *after* `pipelineFn` has been applied.
 */
export const outputPipelineFnSelector = createSelector<Map, void, List, OutputPipelineFn>(
    outputPipelineSelector,
    (outputPipeline: List): OutputPipelineFn | null => {
        if (outputPipeline.size <= 0) return (str: string) => str;
        const recipesFns = outputPipeline.map(r => getOutputRecipeFn(r.get("key"))).toArray();
        console.log(recipesFns);
        const fn = pipe(...recipesFns);
        return fn;
    }
);

/**
 * Returns a string representation of the selected xml file
 * after having applied the pipeline to it.
 */
export const previewXmlStringSelector = createSelector<
    Map,
    void,
    Map | null,
    PipelineFn | null,
    OutputPipelineFn,
    string | null
>(
    previewXmlFileSelector,
    pipelineFnSelector,
    outputPipelineFnSelector,
    (
        xmlFile: Map,
        pipelineFn: ((doc: Document) => Document) | null,
        outputPipelineFn: (str: string) => string
    ): string | null => {
        if (!xmlFile || !pipelineFn) return null;
        const newDoc = pipelineFn(xmlFile);
        const serializer = new XMLSerializer();
        return getFirstThousandLines(outputPipelineFn(serializer.serializeToString(newDoc)));
    }
);
