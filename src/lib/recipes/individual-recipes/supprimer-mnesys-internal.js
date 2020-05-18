//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
/**
 * Mnesys
 * Remove note[type=mnesysinternal]
 */
export default () => (doc: Document): Document => {
    const notes = xpathFilter(doc, '//note[@type="mnesysinternal"]');
    each(notes, (note) => note.remove());
    return doc;
};
