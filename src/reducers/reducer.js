//@flow
import { Map, fromJS } from "immutable";
import { ADD_XML_FILE, UPDATE_CORRECTIONS, REMOVE_XML_FILE, SET_PIPELINE, SET_PREVIEW_HASH } from "../actions.js";
import type { AddXmlFileData } from "../types.js";

const addXmlFileReducer = (state: Map, data: AddXmlFileData): Map => {
    const isDuplicate = state
        .get("xmlFiles")
        .map(f => f.get("hash"))
        .includes(data.hash);
    return isDuplicate ? state : state.update("xmlFiles", xmlFiles => xmlFiles.push(Map(data)));
};

const removeXmlFileReducer = (state: Map, data: string): Map => {
    return state.update("xmlFiles", xmlFiles => xmlFiles.filter(f => f.get("hash") !== data));
};

const updateCorrectionsReducer = (state: Map, data: Map): Map => {
    return state;
};

const setPipelineReducer = (state: Map, data: List): Map => {
    return state.set("pipeline", data);
};

type Reducer = (state: Map, data: any) => Map;
const reducersMap: { [actionType: string]: Reducer } = {
    [ADD_XML_FILE]: addXmlFileReducer,
    [UPDATE_CORRECTIONS]: updateCorrectionsReducer,
    [REMOVE_XML_FILE]: removeXmlFileReducer,
    [SET_PIPELINE]: setPipelineReducer,
    [SET_PREVIEW_HASH]: (state: Map, data: string) => state.set("previewHash", data),
};
export default function App(state: Map, action: { type: string, data: AddXmlFileData | any }) {
    return typeof reducersMap[action.type] === "function" ? reducersMap[action.type](state, action.data) : state;
}
