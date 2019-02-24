//@flow
import xxhash from "xxhash-wasm";
import { head, last } from "ramda";
const jschardet = window && window.jschardet ? window.jschardet : null;
if (!jschardet) throw "jschardet missing";

let wasmInstance = null;
/**
 * We only need to create the WASM instance once
 */
const getWASMInstance = (callback: (instance: any) => void) => {
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
 * If no decoder is available, it defaults to `iso-8859-1`
 */
export const getDecoder = (encoding: string) => {
    let actualEncoding = encoding;
    if (actualEncoding === "windows-1255") {
        actualEncoding = "windows-1252";
    }
    try {
        const decoder = new TextDecoder(actualEncoding);
        return decoder;
    } catch (e) {
        console.log("Encodage non-disponible, fallback iso-8859-1");
        console.log(actualEncoding);
        return new TextDecoder("iso-8859-1");
    }
};

/**
 * Given a text `File`, it
 * * detects it's charset with jschardet
 * * decodes it to utf-8 if necessary
 * * parses it to a DOM document
 * * creates a unique hash from it's content (using xxhash)
 * * calls `loadCallback` with `{ doc: DOMDocument, encoding: string, string: string, hash: string}` as it's first argument
 */
export const readXml = (file: any, loadCallback: (doc: any) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
        const parser = new DOMParser();
        const buffer = new Uint8Array(reader.result);
        let str = "";
        for (let i = 0; i < buffer.length; ++i) {
            str += String.fromCharCode(buffer[i]);
        }
        //FIXME: jschardet is very slow
        const info = jschardet.detect(str);
        const decoder = getDecoder(info.encoding);
        const xmlString = decoder.decode(buffer);
        getWASMInstance(hasher => {
            loadCallback({
                doc: parser.parseFromString(xmlString, "application/xml"),
                encoding: info.encoding,
                string: xmlString,
                hash: hasher.h64(xmlString),
            });
        });
    };
    reader.readAsArrayBuffer(file);
};

/**
 * `xpathFilter(doc, query)` ou `xpathFilter(doc, node, query)`
 */
export const xpathFilter = (doc: any, ...args: [string] | [Element, string]): Array<any> => {
    const query = args.length === 1 ? head(args) : last(args);
    const contextNode = args.length > 1 ? head(args) : doc;
    let nsResolver = doc.createNSResolver(
        doc.ownerDocument == null ? doc.documentElement : doc.ownerDocument.documentElement
    );
    let xpathResult = doc.evaluate(query, contextNode, nsResolver, XPathResult.ANY_TYPE, null);
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
