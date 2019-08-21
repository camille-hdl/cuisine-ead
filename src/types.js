//@flow

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
