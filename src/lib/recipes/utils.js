//@flow

import { forEach, forEachObjIndexed, map as Rmap, trim, filter } from "ramda";

/**
 * Functions were written using lodashes `each`,
 * in which the arguments are inverted relative to `ramda.forEach`
 * this deals with it
 */
export const each = (list: Array<any> | { [key: string]: any }, fn: (arg: any) => any) => {
    if (Array.isArray(list)) {
        return forEach(fn, list);
    } else {
        return forEachObjIndexed(fn, list);
    }
};
export const map = <T, R>(list: Array<T>, fn: (arg: T) => R): Array<R> => {
    return Rmap(fn, list);
};

/**
 * Détermine si un unitid de niveau bas existe dans le document
 */
export const unitidExistsInDoc = (doc: any, unitid: string): boolean => {
    let nsResolver = doc.createNSResolver(
        doc.ownerDocument == null ? doc.documentElement : doc.ownerDocument.documentElement
    );
    let xpathResult = doc.evaluate(
        '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid',
        doc,
        nsResolver,
        window.XPathResult.ANY_TYPE,
        null
    );
    let c;
    do {
        c = xpathResult.iterateNext();
        if (c) {
            if (trim(c.innerHTML) === unitid) return true;
        }
    } while (c !== null);
    return false;
};

export const getAttributesMap = (element: window.Element): { [key: string]: string } => {
    const attrs = {};
    if (element.hasAttributes()) {
        // eslint-disable-next-line no-unused-vars
        for (let attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
    }
    return attrs;
};

/**
 * Returns true if `n` doesn't have any childNodes OR
 * if it has only text nodes that contain nothing but whitespace characters.
 */
export const nodeIsEmpty = (n: Node): boolean => {
    if (!n.hasChildNodes()) return true;
    if (n.childNodes.length > 0) {
        const hasNonTextNode = filter((child) => child.nodeName !== "#text", n.childNodes).length > 0;
        if (hasNonTextNode) {
            return false;
        } else {
            if (("" + n.textContent).trim().replace("\n", "").replace("\r\n", "") === "") {
                return true;
            } else {
                return false;
            }
        }
    }
    return true;
};
