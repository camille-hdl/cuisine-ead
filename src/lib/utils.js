//@flow
import { last, take, forEach, trim, startsWith } from "ramda";

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
        commonEncoding => {
            str = str.replace("encoding='" + commonEncoding + "'", "");
            str = str.replace('encoding="' + commonEncoding + '"', "");
            str = str.replace("encoding='" + commonEncoding.toLowerCase() + "'", "");
            str = str.replace('encoding="' + commonEncoding.toLowerCase() + '"', "");
        },
        ["ISO-8859-1", "Windows-1252", "UTF-8", "UTF8"]
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
export const escapeCell = (input: string): string => {
    return '"' + input.replace(escapeRE, escapeReplacer) + '"';
};

/**
 * Simple Promise wrapper around the FileReader API
 */
export const openFile = (file: File): Promise => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
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
    const pref = (oldStr: string): string => {
        return startsWith(" /", oldStr) ? " /" : startsWith("/", oldStr) ? "/" : startsWith(" ", oldStr) ? " " : "";
    };
    return trim(str).replace(rangeRepRE, (match: string, start: string, end: string) => {
        const shouldAddPadding = addPadding && !startsWith(" ", start);
        const newStart = [shouldAddPadding ? " " : "", pref(start), newRange[0]].join("");
        const newEnd = [pref(end), newRange[1]].join("");
        return [newStart, newEnd].join(newSeparator);
    });
};
