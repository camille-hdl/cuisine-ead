//@flow
import { last, take, forEach } from "ramda";

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
