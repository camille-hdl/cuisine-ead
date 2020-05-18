//@flow
import { xpathFilter } from "../../xml.js";
import { each, unitidExistsInDoc } from "../utils.js";
import { trim, last, filter, take } from "ramda";
export default () => (doc: Document): Document => {
    // d'abord les c level != piece et file

    const elems = filter((c) => {
        const temp = trim(c.innerHTML).split(" ");
        const tempArticle = last(temp) ? last(temp).split("-") : [];
        if (tempArticle.length > 1 && !isNaN(tempArticle[0]) && !isNaN(tempArticle[1])) {
            if (+tempArticle[0] < +tempArticle[1]) {
                // on teste si le même unitid avec l'extension -1 existe
                let testUnitId = take(temp.length - 1, temp).join(" ");
                testUnitId = [testUnitId, [tempArticle[0], +tempArticle[1] - 1].join("-")].join(" ");
                if (unitidExistsInDoc(doc, testUnitId)) {
                    // on est sur une extension
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }, xpathFilter(doc, '//c[@level="file"]/did/unitid|//c[@level="piece"]/did/unitid'));
    each(elems, (elem) => {
        elem.innerHTML = "" + elem.innerHTML.replace("-", "/");
    });

    return doc;
};
