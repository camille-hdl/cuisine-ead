//@flow
import { xpathFilter } from "../../xml.js";
import { each, unitidExistsInDoc } from "../utils.js";
import { getRange, replaceRange } from "../../utils.js";
import { trim, partition } from "ramda";
/**
 * Reformat unitids, ranges (and some single unitids)
 * `3 P 290/1-/2` => `3 P 290 /1 à /2`
 * `3 P 290/1` => `3 P 290 /1`
 */
export default () => (doc: Document): Document => {
    // first c level != piece and file
    let elems = xpathFilter(doc, '//c[@level!="file"][@level!="piece"]/did/unitid|//archdesc/did/unitid');
    each(elems, (elem) => {
        const oldUnitid = trim(elem.innerHTML);
        const range = getRange(oldUnitid);
        if (range) {
            elem.innerHTML = replaceRange(oldUnitid, range, true, " à ");
        } else {
            elem.innerHTML = trim(elem.innerHTML).replace(/([^ /]+)(\/)/m, (match, prev, sep) => {
                return [prev, " ", sep].join("");
            });
        }
    });

    /**
     * Then, piece & level
     * We separates ranges from single unitids
     */
    const [ranges, singles] = partition((c) => {
        // on veut trouver une plage
        const unitid = trim(c.innerHTML);
        const range = getRange(unitid);
        if (!range) return false;
        if (range.length > 1 && !isNaN(range[0]) && !isNaN(range[1])) {
            if (range[0] < range[1]) {
                // on teste si le même unitid avec l'extension -1 ou +1 existe
                const testUnitIdBefore = replaceRange(unitid, [range[0], range[1] - 1]);
                const testUnitIdAfter = replaceRange(unitid, [range[0], range[1] + 1]);
                if (!unitidExistsInDoc(doc, testUnitIdBefore) && !unitidExistsInDoc(doc, testUnitIdAfter)) {
                    // on est sur une plage
                    return true;
                }
            }
        }
        return false;
    }, xpathFilter(doc, '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid'));
    each(ranges, (elem) => {
        const oldUnitid = trim(elem.innerHTML);
        const range = getRange(oldUnitid);
        if (range) {
            elem.innerHTML = replaceRange(oldUnitid, range, true, " à ");
        }
    });
    /**
     * We still have to add padding to the singles
     */
    each(singles, (elem) => {
        elem.innerHTML = trim(elem.innerHTML).replace(/([^ /]+)(\/)/m, (match, prev, sep) => {
            return [prev, " ", sep].join("");
        });
    });
    return doc;
};
