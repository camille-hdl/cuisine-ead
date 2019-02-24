//@flow

import type { Map, List } from "immutable";
import type { AddXmlFileData } from "../types.js";
export const ADD_XML_FILE = "ADD_XML_FILE";

export const addXmlFile = (data: AddXmlFileData) => {
    console.log("action created");
    return { type: ADD_XML_FILE, data: data };
};
