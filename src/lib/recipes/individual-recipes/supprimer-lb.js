//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const lbs = xpathFilter(doc, "//lb");
    each(lbs, (lb) => lb.remove());
    return doc;
};
