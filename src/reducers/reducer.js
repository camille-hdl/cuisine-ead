//@flow
import { Map, fromJS } from "immutable";
import {
    ADD_XML_FILE,
    UPDATE_CORRECTIONS,
    REMOVE_XML_FILE,
    SET_PIPELINE,
    SET_PREVIEW_HASH,
    TOGGLE_PREVIEW,
    SET_OUTPUT_PIPELINE,
} from "../actions.js";
import type { AddXmlFileData } from "../types.js";
import updateCorrections from "../lib/corrections-parser.js";

const addXmlFileReducer = (state: Map<string, mixed>, data: AddXmlFileData): Map<string, mixed> => {
    const isDuplicate = state
        .get("xmlFiles")
        .map(f => f.get("hash"))
        .includes(data.hash);
    return isDuplicate ? state : state.update("xmlFiles", xmlFiles => xmlFiles.push(Map(data)));
};

const removeXmlFileReducer = (state: Map<string, mixed>, data: string): Map<string, mixed> => {
    return state.update("xmlFiles", xmlFiles => xmlFiles.filter(f => f.get("hash") !== data));
};

const updateCorrectionsReducer = (state: Map<string, mixed>, data: Array<string>): Map<string, mixed> => {
    return state.set("corrections", updateCorrections(data, state.get("corrections")));
};

/**
 * changes the settings of `pipeline` (functions applied to `Documents`)
 */
const setPipelineReducer = (state: Map<string, mixed>, data: List): Map<string, mixed> => {
    return state.set("pipeline", data);
};

/**
 * Changes the settings of `oututPipeline` (functions applied to xml strings)
 */
const setOutputPipelinereducer = (state: Map<string, mixed>, data: List): Map<string, mixed> => {
    return state.set("outputPipeline", data);
};

type Reducer = (state: Map<string, mixed>, data: any) => Map;
const reducersMap: { [actionType: string]: Reducer } = {
    [ADD_XML_FILE]: addXmlFileReducer,
    [UPDATE_CORRECTIONS]: updateCorrectionsReducer,
    [REMOVE_XML_FILE]: removeXmlFileReducer,
    [SET_PIPELINE]: setPipelineReducer,
    [SET_OUTPUT_PIPELINE]: setOutputPipelinereducer,
    [SET_PREVIEW_HASH]: (state: Map<string, mixed>, data: string) => state.set("previewHash", data),
    [TOGGLE_PREVIEW]: (state: Map<string, mixed>, data: boolean) => state.set("previewEnabled", data),
};
export default function App(state: Map<string, mixed>, action: { type: string, data: AddXmlFileData | any }) {
    return typeof reducersMap[action.type] === "function" ? reducersMap[action.type](state, action.data) : state;
}
