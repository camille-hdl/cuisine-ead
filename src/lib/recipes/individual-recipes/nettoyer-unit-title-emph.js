//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
/**
 * Remove certain `<emph>` tags in unittitles, but keep the content
 */
export default () => (doc: Document): Document => {
    const emphs = xpathFilter(doc, '//unittitle/emph[@render="italic"]|//unittitle/emph[@render="super"]');
    each(emphs, (element) => {
        if (element.childNodes) {
            element.replaceWith(...element.childNodes);
        } else {
            element.remove();
        }
    });
    return doc;
};
