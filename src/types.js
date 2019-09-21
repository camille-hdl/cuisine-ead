//@flow
import type { List, Map, RecordOf } from "immutable";
export type EncodingString = string;

/**
 * Describes a File to be processed.
 */
export type AddXmlFileData = {
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
};

export type InitialStateProps = {
    /**
     * Version of the app.
     * Can be use to validate restored state.
     */
    version: string,
    /**
     * List of Files to be processed
     */
    xmlFiles: List<Map<string, mixed>>,
    /**
     * List of recipes (and their settings) to apply to `Document`s
     */
    pipeline: List<Map<string, mixed>>,
    /**
     * List of recipes to apply to xml strings (applied after `pipeline`)
     */
    outputPipeline: List<Map<string, mixed>>,
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
};

export type ComputedStateProps = InitialStateProps & {
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
    pipelineFn: (doc: Map<string, mixed>) => Document,
};

export type StateRecord = RecordOf<InitialStateProps>;
