//@flow
import { createSelector } from "reselect";
import { Map, List } from "immutable";
import getRecipeFn from "../lib/recipes/index.js";
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

const isList = (maybeList: mixed): boolean %checks => {
    return List.isList(maybeList);
};

export const previewHashSelector = (state: Map<string, mixed>): string | null =>
    state.get("previewHash") ? String(state.get("previewHash")) : null;
export const xmlFilesSelector = (state: Map<string, mixed>): List<Map<string, mixed>> => {
    const xmlFiles = state.get("xmlFiles");
    if (xmlFiles && isList(xmlFiles)) {
        return xmlFiles;
    }
    return List();
};
export const pipelineSelector = (state: Map<string, mixed>): List<Map<string, mixed>> => state.get("pipeline");
export const outputPipelineSelector = (state: Map<string, mixed>): List<Map<string, mixed>> =>
    state.get("outputPipeline");
export const previewEnabledSelector = (state: Map<string, mixed>): boolean => state.get("previewEnabled");
export const correctionsSelector = (state: Map<string, mixed>): Map<string, mixed> => state.get("corrections");
export const versionSelector = (state: Map<string, mixed>): string => state.get("version");

/**
 * If preview is enabled, we return the selected file, or the first one if none is selected.
 */
export const previewXmlFileSelector = createSelector<
    Map<string, mixed>,
    void,
    string | null,
    List,
    boolean,
    Map<string, mixed> | null
>(
    previewHashSelector,
    xmlFilesSelector,
    previewEnabledSelector,
    (previewHash: string | null, xmlFiles: List, previewEnabled: boolean): Map<string, mixed> | null => {
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
export const previewXmlFileSliceSelector = createSelector<
    Map<string, mixed>,
    void,
    Map<string, mixed> | null,
    Map<string, mixed> | null
>(
    previewXmlFileSelector,
    (previewXmlFile: Map<string, mixed> | null): Map<string, mixed> | null => {
        return previewXmlFile ? previewXmlFile.update("string", getFirstThousandLines) : null;
    }
);

/**
 * Returns a new `Document` for a given `xmlFile`.
 */
const createNewDoc = (xmlFile: Map<string, mixed>): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlFile.get("string"), "application/xml");
};

/**
 * Returns the state required by stateful recipes, such as controlaccess corrections.
 */
export const pipelineStateSelector = createSelector<Map<string, mixed>, void, Map<string, mixed>, Map<string, mixed>>(
    correctionsSelector,
    (corrections: Map<string, mixed>): Map<string, mixed> => {
        return Map<string, mixed>({
            corrections,
        });
    }
);

type PipelineFn = (xmlFile: Map<string, mixed>) => Document;
/**
 * Returns a memoized function that applies the selected recipes to a `xmlFile` objet.
 * `xmlFile.hash` is used as the cache key.
 * Since the function is re-created when relevant state changes, the cache
 * will be cleared whenever needed.
 * The function will create a new `Document` every time it's called
 * because the DOM API mutates it.
 */
export const pipelineFnSelector = createSelector<Map<string, mixed>, void, List, Map<string, mixed>, PipelineFn | null>(
    pipelineSelector,
    pipelineStateSelector,
    (pipeline: List, executeState: Map<string, mixed>): PipelineFn | null => {
        if (pipeline.size <= 0) return null;
        const recipesFns = pipeline.map<string, mixed>(r => getRecipeFn(r, executeState)).toArray();
        const fn = pipe(...recipesFns);
        return memoizeWith(xmlFile => xmlFile.get("hash"), xmlFile => fn(createNewDoc(xmlFile)));
    }
);

type OutputPipelineFn = (xmlString: string) => string;
/**
 * Returns a function that applies the selected output recipes (`xmlString => xmlString`) to an xmlString
 * *after* `pipelineFn` has been applied.
 */
export const outputPipelineFnSelector = createSelector<Map<string, mixed>, void, List, OutputPipelineFn>(
    outputPipelineSelector,
    (outputPipeline: List): OutputPipelineFn | null => {
        if (outputPipeline.size <= 0) return (str: string) => str;
        const recipesFns = outputPipeline.map<string, mixed>(r => getOutputRecipeFn(r.get("key"))).toArray();
        const fn = pipe(...recipesFns);
        return fn;
    }
);

/**
 * Returns a string representation of the selected xml file
 * after having applied the pipeline to it.
 */
export const previewXmlStringSelector = createSelector<
    Map<string, mixed>,
    void,
    Map<string, mixed> | null,
    PipelineFn | null,
    OutputPipelineFn,
    string | null
>(
    previewXmlFileSelector,
    pipelineFnSelector,
    outputPipelineFnSelector,
    (
        xmlFile: Map<string, mixed>,
        pipelineFn: ((doc: Document) => Document) | null,
        outputPipelineFn: (str: string) => string
    ): string | null => {
        if (!xmlFile || !pipelineFn) return null;
        const newDoc = pipelineFn(xmlFile);
        const serializer = new XMLSerializer();
        return getFirstThousandLines(outputPipelineFn(serializer.serializeToString(newDoc)));
    }
);

/**
 * Returns a Map<string, mixed> containing all the necessary components for this particular recipe.
 * This objet can be exported to JSON, to be re-used later as input.
 */
export const fullRecipeSelector = createSelector<Map<string, mixed>, void, string, List, List, Map<string, mixed>>(
    versionSelector,
    pipelineSelector,
    outputPipelineSelector,
    (version: string, pipeline: List, outputPipeline: List): Map<string, mixed> => {
        return Map<string, mixed>({
            version: version,
            pipeline: pipeline,
            outputPipeline: outputPipeline,
        });
    }
);

/**
 * Returns the total number of corrections to be performed
 */
export const correctionsNbSelector = createSelector<Map<string, mixed>, void, Map<string, mixed>, number>(
    correctionsSelector,
    corrections =>
        corrections.reduce((sum, terms) => {
            return sum + terms.size;
        }, 0)
);
