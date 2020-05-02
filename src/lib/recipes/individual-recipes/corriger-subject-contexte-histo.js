//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, '//subject[@source="contexte-historique"]');
    each(elems, (elem) => {
        elem.setAttribute("source", "periode_thesaurus_w");
    });
    return doc;
};
