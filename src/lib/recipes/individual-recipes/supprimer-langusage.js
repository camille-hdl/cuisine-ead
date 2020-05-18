//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const langusages = xpathFilter(doc, "//eadheader/profiledesc/langusage");
    each(langusages, (element) => element.remove());
    return doc;
};
