//@flow
import type { AddXmlFileData } from "../../types.js";
import { readXmlFromString, countC } from "../xml.js";
import { isEadDocument, nonEadError } from "./ead-document.js";

const countCSafe = (doc: Document): number => {
    try {
        return countC(doc);
    } catch (e) {
        return doc.getElementsByTagName("c").length;
    }
};

/**
 * Turn an in-memory XML string into the same `AddXmlFileData` the dropzone uses.
 */
export const xmlStringToFileData = async (filename: string, content: string): Promise<AddXmlFileData> => {
    const parsed = await readXmlFromString(content);
    if (!isEadDocument(parsed.doc)) {
        throw new Error(nonEadError(parsed.doc));
    }
    return {
        filename,
        encoding: parsed.encoding,
        doc: parsed.doc,
        string: parsed.string,
        hash: parsed.hash,
        nbC: countCSafe(parsed.doc),
    };
};
