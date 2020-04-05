//@flow
import { last, head, tail, take, forEach, trim, startsWith } from "ramda";

/**
 * Remove the old `encoding` attribute on the `xml` tag of the output.
 * We can't do it from the `Document` API because it doesn't have access to it.
 * We output utf-8, so we don't need to keep it.
 * We have to handle uppercase and lowercase variations as well as possible.
 */
export const cleanOutputEncoding = (xmlStr: string, encoding: string): string => {
    let str = xmlStr.replace('encoding="' + encoding + '"', "");
    str = str.replace("encoding='" + encoding + "'", "");
    str = str.replace("encoding='" + encoding.toLowerCase() + "'", "");
    str = str.replace('encoding="' + encoding.toLowerCase() + '"', "");
    forEach(
        (commonEncoding) => {
            str = str.replace("encoding='" + commonEncoding + "'", "");
            str = str.replace('encoding="' + commonEncoding + '"', "");
            str = str.replace("encoding='" + commonEncoding.toLowerCase() + "'", "");
            str = str.replace('encoding="' + commonEncoding.toLowerCase() + '"', "");
        },
        ["ISO-8859-1", "Windows-1252", "UTF-8", "UTF8", "ISO-8859-7"]
    );
    return str;
};

/**
 * appends "_resu" to the old filename
 */
export const genNewFilename = (oldFilename: string): string => {
    const temp = oldFilename.split(".");
    const extension = last(temp);
    const debut = take(temp.length - 1, temp);
    return [[debut.join("."), "_resu"].join(""), extension].join(".");
};

const escapeRE = /(^|[^"])(")([^"]|$)/gim;
const escapeReplacer = (match, p1, p2, p3): string => [p1, '""', p3].join("");
/**
 * Encapsulates strings in `""` and escapes double-quotes
 */
export const escapeCell = (input: mixed): string => {
    if (typeof input !== "string") {
        input = String(input);
    }
    return '"' + input.replace(escapeRE, escapeReplacer) + '"';
};

/**
 * Simple Promise wrapper around the FileReader API
 */
export const openFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject();
            }
        };
        reader.readAsText(file);
    });
};

const rangeRE = /[ /]([0-9]+)-\/?([0-9]+)$/m;
/**
 * Takes a string (cote) and returns an array `[start, end]`
 *
 * * `3 P 290/1-/3` => `[1, 3]`
 * * `3 P 290 1-3` => `[1, 3]``
 * * `3 P 1` => `null`
 */
export const getRange = (str: string): [number, number] | null => {
    const temp = trim(str).match(rangeRE);
    if (!temp) return null;
    if (temp.length <= 1) return null;
    if (typeof temp[1] === "undefined" || typeof temp[2] === "undefined") return null;
    const debut = temp[1];
    const fin = temp[2];
    if (isNaN(debut) || isNaN(fin)) return null;
    return [+debut, +fin];
};

const rangeRepRE = /([ /]+?[0-9]+)-(\/?[0-9]+)$/m;
/**
 * Change articles in a range.
 * `replaceRange('3 P 290/1-/100', [2, 200]) // '3 P 290/2-/200'`
 */
export const replaceRange = (
    str: string,
    newRange: [number, number],
    addPadding: boolean = false,
    newSeparator: string = "-"
): string => {
    /**
     * Adds `/` or ` ` prefix if necessary
     */
    const pref = addPadding
        ? (oldStr: string, pos: string): string => {
              const padding = addPadding && pos === "start" ? " " : "";
              return startsWith(" /", oldStr)
                  ? " /"
                  : startsWith("/", oldStr)
                  ? padding + "/"
                  : padding + (addPadding ? "/" : "");
          }
        : // eslint-disable-next-line no-unused-vars
          (oldStr: string, _ignored?: any): string => {
              return startsWith(" /", oldStr)
                  ? " /"
                  : startsWith("/", oldStr)
                  ? "/"
                  : startsWith(" ", oldStr)
                  ? " "
                  : "";
          };
    return trim(str).replace(rangeRepRE, (match: string, start: string, end: string) => {
        const newStart = [pref(start, "start"), newRange[0]].join("");
        const newEnd = [pref(end, "end"), newRange[1]].join("");
        return [newStart, newEnd].join(newSeparator);
    });
};

/**
 * Sets the innerHTML property of an elemen within a try catch block
 */
export const trySetInnerHTML = (elem: Element, str: string): Element => {
    try {
        elem.innerHTML = str;
    } catch (e) {
        console.log("xml invalide", elem, str, e);
    }
    return elem;
};

/**
 * Regular expression to match attributes in xpath-style syntax
 */
const attrsRE = /\[([^[\]]+)=([^[\]]+)/gm;
/**
 * Given a string `subject[role=role1][data-thing=thing1]`, returns an object:
 * `{ tag: "subject", attributes: [ ["role", "role1"], ["data-thing", "thing1"] ] }`
 */
export const getTagAndAttributes = (str: string): { tag: string, attributes: Array<[string, string]> } => {
    const tag = head(str.split("[")) || "";
    const attributes = [];
    if (str.split("[").length > 1) {
        // has attributes
        const attrString = ["", ...tail(str.split("["))].join("[");
        let res = null;
        while ((res = attrsRE.exec(attrString)) !== null) {
            if (res && res.length >= 3) {
                attributes.push([res[1], res[2]]);
            }
        }
    }
    return { tag, attributes };
};
