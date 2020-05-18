//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

/**
 * Supprimer tous les éléments avec audience=internal
 */
export default () => (doc: Document): Document => {
    const internals = xpathFilter(doc, '//*[@audience="internal"]');
    each(internals, (element) => element.remove());
    return doc;
};
