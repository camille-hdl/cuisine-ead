//@flow
import { createSelector } from "reselect";
import { Map, List } from "immutable";
import getRecipeFn from "../lib/recipes/index.js";
import getOutputRecipeFn from "../lib/output-recipes.js";
import { pipe, compose, memoizeWith, take, split, identity, join } from "ramda";
import type { StateRecord, XmlFileRecord, RecipeInPipelineRecord } from "../types.js";
import type { ExecuteState } from "../lib/recipes/recipes.js";
/**
 * Returns only the first few lines of the file,
 * because rendering the diff is slow and freezes the browser
 */
const getFirstThousandLines = memoizeWith(identity, compose(join("\n"), take(600), split("\n")));

const isList = (maybeList: mixed): boolean %checks => {
    return List.isList(maybeList);
};

export const previewHashSelector = (state: StateRecord): string | null =>
    state.get("previewHash") ? String(state.get("previewHash")) : null;

export const xmlFilesSelector = (state: StateRecord): List<XmlFileRecord> => {
    const xmlFiles = state.get("xmlFiles");
    if (xmlFiles && isList(xmlFiles)) {
        return xmlFiles;
    }
    return List();
};

export const pipelineSelector = (state: StateRecord): List<RecipeInPipelineRecord> => state.get("pipeline");
export const outputPipelineSelector = (state: StateRecord): List<RecipeInPipelineRecord> => state.get("outputPipeline");
export const previewEnabledSelector = (state: StateRecord): boolean => state.get("previewEnabled");

type CorrectionsMap = Map<string, mixed>;
export const correctionsSelector = (state: StateRecord): CorrectionsMap => state.get("corrections");
export const versionSelector = (state: StateRecord): string => state.get("version");

/**
 * If preview is enabled, we return the selected file, or the first one if none is selected.
 */
export const previewXmlFileSelector = createSelector<
    Map<string, mixed>,
    void,
    string | null,
    List<XmlFileRecord>,
    boolean,
    XmlFileRecord | null
>(
    previewHashSelector,
    xmlFilesSelector,
    previewEnabledSelector,
    (previewHash: string | null, xmlFiles: List<XmlFileRecord>, previewEnabled: boolean): XmlFileRecord | null => {
        if (!previewEnabled) return null;
        if (xmlFiles.size <= 0) return null;
        if (previewHash) {
            const previewFile = xmlFiles.find((f) => f.get("hash") === previewHash);
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
>(previewXmlFileSelector, (previewXmlFile: Map<string, mixed> | null): Map<string, mixed> | null => {
    return previewXmlFile ? previewXmlFile.update("string", getFirstThousandLines) : null;
});

/**
 * Returns a new `Document` for a given `xmlFile`.
 */
const createNewDoc = (xmlFile: XmlFileRecord): Document => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlFile.get("string"), "application/xml");
};

/**
 * Returns the state required by stateful recipes, such as controlaccess corrections.
 */
export const pipelineStateSelector = createSelector<StateRecord, void, Map<string, mixed>, ExecuteState>(
    correctionsSelector,
    (corrections: Map<string, mixed>): ExecuteState => {
        return Map<string, Map<string, any>>({
            corrections,
        });
    }
);

type PipelineFn = (xmlFile: XmlFileRecord) => Document;
/**
 * Returns a memoized function that applies the selected recipes to a `xmlFile` objet.
 * `xmlFile.hash` is used as the cache key.
 * Since the function is re-created when relevant state changes, the cache
 * will be cleared whenever needed.
 * The function will create a new `Document` every time it's called
 * because the DOM API mutates it.
 */
export const pipelineFnSelector = createSelector<
    StateRecord,
    void,
    List<RecipeInPipelineRecord>,
    ExecuteState,
    PipelineFn | null
>(
    pipelineSelector,
    pipelineStateSelector,
    (pipeline: List<RecipeInPipelineRecord>, executeState: ExecuteState): PipelineFn | null => {
        if (pipeline.size <= 0)
            return memoizeWith(
                (xmlFile) => xmlFile.get("hash"),
                (xmlFile) => createNewDoc(xmlFile)
            );
        const recipesFns = pipeline
            .map<(doc: Document) => Document>((r) => getRecipeFn(r, executeState))
            .toArray();
        const fn = pipe(...recipesFns);
        return memoizeWith(
            (xmlFile) => xmlFile.get("hash"),
            (xmlFile) => fn(createNewDoc(xmlFile))
        );
    }
);

type OutputPipelineFn = (xmlString: string) => string;
/**
 * Returns a function that applies the selected output recipes (`xmlString => xmlString`) to an xmlString
 * *after* `pipelineFn` has been applied.
 */
export const outputPipelineFnSelector = createSelector<
    StateRecord,
    void,
    List<RecipeInPipelineRecord>,
    OutputPipelineFn
>(outputPipelineSelector, (outputPipeline: List<RecipeInPipelineRecord>): OutputPipelineFn => {
    if (outputPipeline.size <= 0) return (str: string) => str;
    const recipesFns = outputPipeline
        .map<(str: string) => string>((r) => getOutputRecipeFn(r.get("key")))
        .toArray();
    const fn = pipe(...recipesFns);
    return fn;
});

/**
 * Returns a string representation of the selected xml file
 * after having applied the pipeline to it.
 */
export const previewXmlStringSelector = createSelector<
    Map<string, mixed>,
    void,
    XmlFileRecord | null,
    PipelineFn | null,
    OutputPipelineFn,
    string | null
>(
    previewXmlFileSelector,
    pipelineFnSelector,
    outputPipelineFnSelector,
    (
        xmlFile: XmlFileRecord,
        pipelineFn: PipelineFn | null,
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
export const fullRecipeSelector = createSelector<
    StateRecord,
    void,
    string,
    List<RecipeInPipelineRecord>,
    List<RecipeInPipelineRecord>,
    Map<string, mixed>
>(
    versionSelector,
    pipelineSelector,
    outputPipelineSelector,
    (
        version: string,
        pipeline: List<RecipeInPipelineRecord>,
        outputPipeline: List<RecipeInPipelineRecord>
    ): Map<string, mixed> => {
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
export const correctionsNbSelector = createSelector<StateRecord, void, Map<string, mixed>, number>(
    correctionsSelector,
    (corrections) =>
        corrections.reduce((sum, terms) => {
            return sum + terms.size;
        }, 0)
);
