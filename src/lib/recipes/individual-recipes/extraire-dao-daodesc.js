//@flow
import { xpathFilter } from "../../xml.js";
import { each } from "../utils.js";

export default () => (doc: Document): Document => {
    const daodescs = xpathFilter(doc, "//daogrp/daodesc");

    each(daodescs, (daodesc) => {
        const daogrp = daodesc.parentNode;
        const daolocs = xpathFilter(doc, daodesc, "./daoloc");
        each(daolocs, (daoloc) => {
            const daodesc = daoloc.parentNode;
            daodesc.removeChild(daoloc);
            daogrp.appendChild(daoloc);
        });
    });

    return doc;
};
