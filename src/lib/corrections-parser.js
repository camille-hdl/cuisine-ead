//@flow
import { Map, fromJS } from "immutable";
type Line = [string, string, string];
import { forEach, concat, filter, map, head, last } from "ramda";
const compact = filter(val => !!val);
const SEPARATOR = "/";
const CA_SEPARATOR = "=>";

/**
 * Checks if the line is valid : has enough columns
 */
const checkLine = (line: any): boolean => {
    if (typeof line.length === "undefined") return false;
    if (line.length < 3) return false;
    if (typeof line[0].split !== "function") return false;
    if (typeof line[1].split !== "function") return false;
    if (typeof line[2].split !== "function") return false;
    return true;
};

/**
 * Find corrections for controlaccess tags
 * Returns a Map such as:
 * ```js
 * {
 *  "persname" => { // original controlaccess
 *      "Toulon" => [ // term to be replaced
 *              ["Toulon", "geogname"], // new term and controlaccess tag
 *              ["Var", "geogname"] // another new term and controlaccess tag
 *      ]
 *  }
 * }
 * ```
 */
export default function updateCorrections(data: Array<Line>, initialCorrections: Map): Map {
    const newMap = {};
    forEach(line => {
        // verifier la ligne
        if (!checkLine(line)) return;
        const cas = line[0].split(CA_SEPARATOR);
        const originalCA = head(cas);
        const destinationCA = last(cas);
        const replacements = line[1].split(SEPARATOR);
        const term = line[2];
        if (originalCA && replacements && term) {
            if (typeof newMap[originalCA] === "undefined") {
                newMap[originalCA] = {};
            }
            if (typeof newMap[originalCA][term] === "undefined") {
                newMap[originalCA][term] = [];
            }
            newMap[originalCA][term] = concat(
                newMap[originalCA][term],
                map(str => [str ? str.trim() : str, destinationCA], compact(replacements))
            );
        }
    }, data);
    return initialCorrections.mergeDeep(fromJS(newMap));
}
