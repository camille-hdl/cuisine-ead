//@flow
import xxhash from "xxhash-wasm";
const jschardet = window && window.jschardet ? window.jschardet : null;
if (!jschardet) throw "jschardet missing";
import type { EncodingString } from "../types.js";
type Hasher = {
    h64: (input: string) => string,
    h32: (input: string) => string,
};
let wasmInstance = null;
/**
 * Returns the WASM instance, after having created it if necessary.
 * We only need to create the WASM instance once
 */
const getWASMInstance = (callback: (instance: Hasher) => void) => {
    if (wasmInstance) {
        callback(wasmInstance);
    } else {
        xxhash().then(instance => {
            wasmInstance = instance;
            callback(wasmInstance);
        });
    }
};
/**
 * Returns a TextDecoder for the detected charset.
 * If we get `windows-1255` as an input, we assume an error in jschardet
 * and pretends it's `windows-1252` instead.
 * We do the same for ISO-8859-7 which is another common false positive.
 * If no decoder is available, it defaults to `iso-8859-1`
 */
export const getDecoder = (encoding: string): TextDecoder => {
    let actualEncoding = encoding;
    if (actualEncoding === "windows-1255") {
        actualEncoding = "windows-1252";
    }
    if (actualEncoding === "ISO-8859-7") {
        actualEncoding = "ISO-8859-1";
    }
    try {
        //$FlowFixMe
        const decoder = new TextDecoder(actualEncoding);
        return decoder;
    } catch (e) {
        console.log("Encodage non-disponible, fallback iso-8859-1");
        console.log(actualEncoding);
        return new TextDecoder("iso-8859-1");
    }
};
type DocData = {
    encoding: EncodingString,
    doc: Document,
    string: string,
    hash: string,
};
/**
 * Given a text `File`, it
 * * detects it's charset with jschardet
 * * decodes it to utf-8 if necessary
 * * parses it to a DOM document
 * * creates a unique hash from it's content (using xxhash)
 * * calls `loadCallback` with `{ doc: Document, encoding: string, string: string, hash: string}` as it's first argument
 */
export const readXml = (file: File, loadCallback: (doc: DocData) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
        if (!(reader.result instanceof ArrayBuffer)) return;
        const parser = new DOMParser();
        const buffer = new Uint8Array(reader.result);
        let str = "";
        for (let i = 0; i < buffer.length; ++i) {
            str += String.fromCharCode(buffer[i]);
        }
        //FIXME: jschardet is very slow
        const info = jschardet.detect(str);
        const decoder = getDecoder(info.encoding);
        const xmlString = normalizeXmlString(decoder.decode(buffer));
        getWASMInstance(hasher => {
            loadCallback({
                /**
                 * non-standard Document.evaluate & Document.createNSREsolver
                 * make flow unhappy
                 */
                //$FlowFixMe
                doc: parser.parseFromString(xmlString, "application/xml"),
                encoding: info.encoding,
                string: xmlString,
                hash: hasher.h64(xmlString),
            });
        });
    };
    reader.readAsArrayBuffer(file);
};

type XpathFilterArgs = { query: string, contextNode: ?Element | Document };
type XpathFilterInput = Array<Element | string>;
/**
 * deals with "polymorphism" of `xpathFilter`
 * `xpathFilter(doc, query)` or `xpathFilter(doc, node, query)`
 */
const extractXpathFilterArgs = (doc: Document, args: XpathFilterInput): XpathFilterArgs => {
    let query = "";
    let contextNode = doc;
    if (args[0] instanceof Element && typeof args[1] === "string") {
        contextNode = args[0];
        query = args[1];
    } else if (typeof args[0] === "string") {
        query = args[0];
    }
    return { query, contextNode };
};

/**
 * Wrapper around `Document.evaluate`. Returns an array without `null` values.
 * `xpathFilter(doc, query)` or `xpathFilter(doc, node, query)`
 */
export const xpathFilter = (doc: Document, ...args: XpathFilterInput): Array<Element> => {
    const { query, contextNode } = extractXpathFilterArgs(doc, args);
    const node =
        doc.ownerDocument && doc.ownerDocument.documentElement
            ? doc.ownerDocument.documentElement
            : doc.documentElement;
    if (!node) {
        console.log("invalid document", doc);
        return [];
    }
    /**
     * Document.evaluate & createNSResolver are non-standard
     */
    //$FlowFixMe
    let nsResolver = doc.createNSResolver(node);
    //$FlowFixMe
    let xpathResult = doc.evaluate(query, contextNode, nsResolver, window.XPathResult.ANY_TYPE, null);
    let c;
    let elems = [];
    do {
        c = xpathResult.iterateNext();
        if (c) {
            elems.push(c);
        }
    } while (c !== null);
    return elems;
};

const crlfRE = /\r\n/g;
/**
 * Replaces CRLF (old windows) with LF.
 */
export const normalizeXmlString = (str: string): string => {
    return str.replace(crlfRE, "\n");
};
