//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(doc, "//controlaccess/*");
    each(elems, (controlaccess) => controlaccess.remove());

    return doc;
};
