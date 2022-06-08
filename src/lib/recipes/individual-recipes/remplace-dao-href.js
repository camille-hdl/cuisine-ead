//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
import { head } from "ramda";

export default (args: Map<string, any>) => (doc: Document): Document => {
    const remplacements = args.get("remplacements") ?? [];
    if (!remplacements || remplacements.length <= 0) {
        return doc;
    }
    const remplacer = (text: string): string => {
        if (!text) return text;
        // appliquer chaque rechercher remplacer
        return remplacements.reduce((acc, remplacement) => {
            const { rechercher, remplacer } = remplacement;
            const re = new RegExp(rechercher, "gm");
            return acc.replace(re, remplacer);
        }, text);
    }
    const daos = xpathFilter(doc, "//daoloc[@href]|//dao[@href]");
    each(daos, (dao) => {
        const newHref = remplacer(dao.getAttribute("href"));
        dao.setAttribute("href", newHref);
    });
    return doc;
};
