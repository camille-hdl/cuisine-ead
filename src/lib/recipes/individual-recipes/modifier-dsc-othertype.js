//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const dscs = xpathFilter(doc, '//dsc[@type="othertype"]');
    each(dscs, (element) => element.removeAttribute("type"));
    return doc;
};
