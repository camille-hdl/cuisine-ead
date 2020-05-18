//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const physDescs = xpathFilter(doc, "//archdesc/did/physdesc");
    each(physDescs, (element) => element.remove());
    return doc;
};
