//@flow

/**
 * Data types used globally in the application
 * For RecordTypes, see the factories in lib/record-factories.js
 */
import type { List, Map, RecordOf } from "immutable";
export type EncodingString = string;

/**
 * Describes a File to be processed.
 */
export type AddXmlFileData = {|
    /**
     * Original character encoding of the file
     */
    encoding: EncodingString,
    /**
     * `Document`
     */
    doc: Document,
    /**
     * Original filename
     */
    filename: string,
    /**
     * Content of the file as plaintext
     */
    string: string,
    /**
     * hash created from the content of the file
     */
    hash: string,
|};

export type InitialStateProps = {|
    /**
     * Version of the app.
     * Can be use to validate restored state.
     */
    version: string,
    /**
     * List of Files to be processed
     */
    xmlFiles: List<XmlFileRecord>,
    /**
     * List of recipes (and their settings) to apply to `Document`s
     */
    pipeline: List<RecipeInPipelineRecord>,
    /**
     * List of recipes to apply to xml strings (applied after `pipeline`)
     */
    outputPipeline: List<RecipeInPipelineRecord>,
    /**
     * Map of corrections to apply to the files
     * see src/lib/corrections-parser.js
     */
    corrections: Map<string, Map<string, mixed>>,
    previewEnabled: boolean,
    /**
     * hash of the previed Document
     */
    previewHash: string | null,
|};

export type ComputedStateProps = {|
    ...InitialStateProps,
    /**
     * File currectly being previewed.
     */
    previewXmlFile: Map<string, mixed> | null,
    /**
     * String reprensentation of the file being previewed
     */
    previewXmlString: string | null,
    /**
     * Object representation of the pipeline, outputPipeline and version.
     * Can be exported to JSON
     */
    fullRecipe: Map<string, mixed>,
    /**
     * Approximate number of available corrections (to be displayed)
     */
    correctionsNb: number,
    /**
     * Function that maps `Document`s to processed `Document`s,
     * given the current recipes and settings
     */
    pipelineFn: (doc: XmlFileRecord) => Document,
    /**
     * Function that maps Document strings to processed Document strings,
     * given the current output recipes and settings
     */
    outputPipelineFn: (str: string) => string,
|};

export type RecipeInPipeline = {
    key: string,
    args: Map<string, any>,
};

export type StateRecord = RecordOf<InitialStateProps>;

/**
 * Representation of an XML file and metadata in the state
 */
export type XmlFileRecord = RecordOf<AddXmlFileData>;

/**
 * Representation of a recipe and its arguments in the state
 */
export type RecipeInPipelineRecord = RecordOf<RecipeInPipeline>;

/**
 * Recipe JSON file as it is uploaded
 */
export type InputJSONRaw = {
    pipeline: Array<RecipeInPipeline>,
    outputPipeline: Array<RecipeInPipeline>,
    version: string | Array<string>,
};
/**
 * Recipe JSON data after making sure the format is correct
 */
export type InputJSONData = {
    pipeline: List<RecipeInPipelineRecord>,
    outputPipeline: List<RecipeInPipelineRecord>,
    version: string | Array<string>,
};

/**
 * Record of InputJSONData,
 * to be safely merged into the state
 */
export type InputJSONRecord = RecordOf<InputJSONData>;
