//@flow
/**
 * Redux action creators
 */

import type { Map, List } from "immutable";
import type { AddXmlFileData } from "./types.js";
export const ADD_XML_FILE = "ADD_XML_FILE";
export const REMOVE_XML_FILE = "REMOVE_XML_FILE";
export const UPDATE_CORRECTIONS = "UPDATE_CORRECTIONS";
export const SET_PIPELINE = "SET_PIPELINE";
export const SET_PREVIEW_HASH = "SET_PREVIEW_HASH";
export const TOGGLE_PREVIEW = "TOGGLE_PREVIEW";
export const SET_OUTPUT_PIPELINE = "SET_OUTPUT_PIPELINE";

export const addXmlFile = (data: AddXmlFileData) => {
    return { type: ADD_XML_FILE, data: data };
};
export const removeXmlFile = (data: string) => {
    return { type: REMOVE_XML_FILE, data: data };
};

export const updateCorrections = (data: Array<string>) => {
    return { type: UPDATE_CORRECTIONS, data: data };
};

export const setPipeline = (data: List<any>) => {
    return { type: SET_PIPELINE, data: data };
};

export const setOutputPipeline = (data: List<any>) => {
    return { type: SET_OUTPUT_PIPELINE, data: data };
};

export const setPreviewHash = (data: string) => {
    return { type: SET_PREVIEW_HASH, data: data };
};

export const togglePreview = (data: boolean) => {
    return { type: TOGGLE_PREVIEW, data: data };
};