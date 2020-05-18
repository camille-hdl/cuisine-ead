//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

/**
 * Supprimer les unitid[type=cote-de-consultation], enlever les attr type de unitid[type=cote-future]
 */
export default () => (doc: Document): Document => {
    const cotesConsults = xpathFilter(doc, '//unitid[@type="cote-de-consultation"]');
    each(cotesConsults, (unitid) => unitid.remove());

    const cotesFutures = xpathFilter(doc, '//unitid[@type="cote-future"]');
    each(cotesFutures, (unitid) => unitid.removeAttribute("type"));
    return doc;
};
