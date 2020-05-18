//@flow
import { xpathFilter } from "../../xml.js";
import { each, getAttributesMap } from "../utils.js";
/**
 * Ligeo
 * Corriger les attributs level, ajouter les altrender
 */
export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//c");
    each(elems, (elem) => {
        if (!elem.hasAttributes()) {
            elem.setAttribute("altrender", "ligeo-branche-standardisadg");
            elem.setAttribute("level", "file");
        } else if (elem.hasAttribute("level") && !elem.hasAttribute("altrender")) {
            const attrs = getAttributesMap(elem);
            if (attrs.level === "file") {
                elem.setAttribute("altrender", "ligeo-article-standardisadg");
                elem.setAttribute("level", "item");
            } else if (attrs.level === "recordgrp") {
                elem.setAttribute("altrender", "ligeo-simple-standardisadg");
                elem.setAttribute("level", "file");
            } else if (attrs.level === "series") {
                elem.setAttribute("altrender", "ligeo-branche-iconographieisadg");
                elem.setAttribute("level", "file");
            } else if (attrs.level === "subseries") {
                elem.setAttribute("altrender", "ligeo-simple-iconographieisadg");
                elem.setAttribute("level", "file");
            } else if (attrs.level === "item") {
                elem.setAttribute("altrender", "ligeo-article-iconographieisadg");
                elem.setAttribute("level", "item");
            }
        }
    });
    return doc;
};
