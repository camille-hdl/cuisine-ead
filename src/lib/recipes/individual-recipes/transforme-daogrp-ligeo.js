//@flow
import { xpathFilter } from "../../xml.js";
import { each, getAttributesMap } from "../utils.js";
import type { Map } from "immutable";
import { head, last, init, map, take } from "ramda";

const DIRECTORY_SEPARATOR = "/";
const FILENAME_SEPARATOR = "_";
/**
 * Convertir les daogrp avec image:first et image:last au format ligeo
 * (daogrp type=link)
 * S'il est fourni, `prefix` est ajouté au dossier
 */
export default (args: Map<string, any>) => (doc: Document): Document => {
    const prefix = args.has("prefix") ? args.get("prefix") : null;

    const elems = xpathFilter(doc, "//daogrp");
    each(elems, (elem) => {
        const attributes = getAttributesMap(elem);
        if (attributes.type === "link") {
            return;
        }
        const { first, last } = getFirstLast(doc, elem);
        if (!first || !last) {
            return;
        }

        const attributesFirst = getAttributesMap(first);
        const attributesLast = getAttributesMap(last);
        if (!attributesFirst.href || !attributesLast.href) {
            return;
        }

        const firstHref = normalizeHref(attributesFirst.href);
        const lastHref = normalizeHref(attributesLast.href);
        const pathComponents = firstHref.split(DIRECTORY_SEPARATOR);
        const lastPathComponents = lastHref.split(DIRECTORY_SEPARATOR);
        const daolocComponents =
            attributes.role === "series"
                ? getComponentsForSeries(pathComponents, lastPathComponents, prefix)
                : getComponentsDefault(pathComponents, lastPathComponents, prefix);
        first.remove();
        last.remove();
        elem.append(...createDaolocs(doc, daolocComponents));
        if (attributes.role) {
            elem.removeAttribute("role");
        }
        elem.setAttribute("type", "link");
    });
    return doc;
};

function getFirstLast(doc: Document, elem: Element): { first: Element | null, last: Element | null } {
    const daoFirst = xpathFilter(doc, elem, `daoloc[@role="image:first"]`);
    const daoLast = xpathFilter(doc, elem, `daoloc[@role="image:last"]`);
    return {
        first: daoFirst.length > 0 ? head(daoFirst) : null,
        last: daoLast.length > 0 ? head(daoLast) : null,
    };
}

function normalizeHref(href: string): string {
    href = href.replace(/\\/g, DIRECTORY_SEPARATOR);
    if (href.charAt(0) === DIRECTORY_SEPARATOR) {
        href = href.substring(1);
    }
    return href;
}
type DaolocComponents = {
    dossier: string,
    prefixe: string,
    premier?: string,
    dernier?: string,
    exception: string,
    extension: string,
};

function getComponentsForSeries(
    firstPathComponents: Array<string>,
    lastPathComponents: Array<string>,
    prefix?: string | null
): DaolocComponents {
    const directoryComponents = init(firstPathComponents);
    const dossier =
        DIRECTORY_SEPARATOR +
        (prefix ? [prefix, ...directoryComponents] : directoryComponents).join(DIRECTORY_SEPARATOR) +
        DIRECTORY_SEPARATOR;
    const prefixe = (last(directoryComponents) ?? "") + FILENAME_SEPARATOR;
    const premier = last(firstPathComponents) ?? "";
    const dernier = last(lastPathComponents) ?? "";
    const exception = map(() => "0", Array.from({ length: premier.length })).join("");
    const extension = "jpg";
    return { dossier, prefixe, premier, dernier, exception, extension };
}

function getComponentsDefault(
    firstPathComponents: Array<string>,
    lastPathComponents: Array<string>,
    prefix?: string | null
): DaolocComponents {
    if (firstPathComponents.length <= 0 || lastPathComponents.length <= 0) {
        throw new Error("Empty daloc href");
    }
    const directoryComponents = init(firstPathComponents);
    const dossier =
        DIRECTORY_SEPARATOR +
        (prefix ? [prefix, ...directoryComponents] : directoryComponents).join(DIRECTORY_SEPARATOR) +
        DIRECTORY_SEPARATOR;
    const firstFilename = last(firstPathComponents) ?? "";
    const firstFilenameParts = firstFilename.split(FILENAME_SEPARATOR);
    const prefixe = take(2, firstFilenameParts).join(FILENAME_SEPARATOR) + FILENAME_SEPARATOR;
    const premier = firstFilenameParts[2];
    const exception = map(() => "0", Array.from({ length: premier.length })).join("");
    const endOfFilename = last(firstFilenameParts) ?? "";
    const extension = last(endOfFilename.split(".")) ?? "jpg";
    return { dossier, prefixe, exception, extension };
}

function createDaolocs(doc: Document, components: DaolocComponents): Array<Element> {
    const roles = ["dossier", "prefixe"];
    if (typeof components.premier !== "undefined") {
        roles.push("premier");
    }
    if (typeof components.dernier !== "undefined") {
        roles.push("dernier");
    }
    roles.push("exception", "extension");
    return map((role) => {
        const daoloc = doc.createElement("daoloc");
        daoloc.setAttribute("role", role);
        daoloc.setAttribute("href", components[role]);
        return daoloc;
    }, roles);
}
