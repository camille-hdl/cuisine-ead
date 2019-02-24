//@flow

import type { Map, List } from "immutable";
import type { AddXmlFileData } from "../types.js";
export const ADD_XML_FILE = "ADD_XML_FILE";
export const REMOVE_XML_FILE = "REMOVE_XML_FILE";
export const UPDATE_CORRECTIONS = "UPDATE_CORRECTIONS";

export const addXmlFile = (data: AddXmlFileData) => {
    return { type: ADD_XML_FILE, data: data };
};
export const removeXmlFile = (data: string) => {
    return { type: REMOVE_XML_FILE, data: data };
};

export const addCsvFile = (data: Map) => {
    return { type: UPDATE_CORRECTIONS, data: data };
};
