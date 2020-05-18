//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const elems = xpathFilter(
        doc,
        '//odd[@type="commentaire"]|//relatedmaterial[@type="sources-internes"]|//relatedmaterial[@type="sources-externes"]'
    );
    each(elems, (elem) => elem.removeAttribute("type"));
    return doc;
};
