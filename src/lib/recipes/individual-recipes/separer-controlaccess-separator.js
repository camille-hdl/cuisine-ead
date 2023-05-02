//@flow
import { xpathFilter, getControlaccessElements, copyAttributes } from "../../xml.js";
import { each } from "../utils.js";
import { trimWhitespaceAndNewlines } from "../../utils.js";
import { filter, map } from "ramda";
import type { Map } from "immutable";

/**
 * ```
 * fn({separator: "/"})(doc);
 * ```
 * ```
 * <controlaccess>
 *    <genreform type='val'>Photographs / Paintings</genreform>
 * </controlaccess>
 * ```
 * becomes
 * ```
 * <controlaccess>
 *   <genreform type='val'>Photographs</genreform>
 *  <genreform type='val'>Paintings</genreform>    
 * </controlaccess>
 * ```
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const separator = args.get("separator");
    if (typeof separator === "undefined") return doc;
    const controlaccessElements = getControlaccessElements(doc);
    each(controlaccessElements, (originalElement) => {
        if (originalElement?.textContent?.includes(separator)) {
            const individualValues = originalElement.textContent.split(separator).filter((text) => text.trim().length > 0);
            const newElements = map((text) => {
                const newElement = doc.createElement(originalElement.tagName);
                newElement.textContent = trimWhitespaceAndNewlines(text);
                copyAttributes(originalElement, newElement);
                return newElement;
            }, individualValues);
            if (newElements.length > 0) {
                originalElement.replaceWith(...newElements);
            }
        }
    });
    return doc;
};
