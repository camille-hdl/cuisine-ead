//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";
export default () => (doc: Document): Document => {
    const genreforms = xpathFilter(doc, '//archdesc/controlaccess/genreform[@type="typir"]');
    each(genreforms, (element) => element.remove());
    return doc;
};
