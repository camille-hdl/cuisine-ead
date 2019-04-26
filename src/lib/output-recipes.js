//@flow
/**
 * Functions applied *after* xml documents have been serialized to strings
 */

import format from "./xml-formatter.js";
import { partialRight, find, propEq } from "ramda";
const NEWLINE = "\n";
const blankLinesRE = new RegExp(/(^[ \t]*(\n|(\r\n)))/, "gm");

export const getEadBody = (xmlString: string): [string, string] => {
    const tag = "<ead";
    const tagPos = xmlString.indexOf(tag);
    if (tagPos === -1) return ["", xmlString];
    const xmlHeader = xmlString.substring(0, tagPos);
    const eadBody = xmlString.substring(tagPos);
    return [xmlHeader.trim(), eadBody.trim()];
};

type Recipe = {
    key: string,
    label: string,
    fn: (str: string) => string,
};

/**
 * pretty-prints the document:
 * * 2 spaces
 * * inline tags are kept on a single line if possible
 */
export const prettyPrintXML = (xmlStr: string): string => {
    const [xmlHeader, eadBody] = getEadBody(xmlStr);
    return [
        xmlHeader,
        format(eadBody, {
            stripComments: false,
            indentation: "  ",
            newLine: NEWLINE,
            collapseContent: true,
        }),
    ].join(NEWLINE);
};

/**
 * ... removes blank lines
 */
export const removeBlankLines = (xmlStr: string): string => xmlStr.replace(blankLinesRE, "");

export const availableOutputRecipes: Array<Recipe> = [
    {
        key: "pretty_print",
        label: "Ré-indenter (lent)",
        fn: prettyPrintXML,
    },
    {
        key: "remove_blank_lines",
        label: "Supprimer les lignes vides",
        fn: removeBlankLines,
    },
];
export const getRecipes = () => availableOutputRecipes;

const _findRecipe = partialRight(find, [getRecipes()]);
export const findRecipe = (key: string): Recipe | void => _findRecipe(propEq("key", key));

/**
 * Returns the function `xmlString => xmlString` corresponding to the given key.
 */
export default (key: string): ((xmlStr: string) => string) => {
    const recipe = findRecipe(key);
    if (recipe) {
        return recipe.fn;
    }
    throw new Error("Unknown output recipe: " + key);
};
