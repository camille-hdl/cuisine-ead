//@flow
import { List } from "immutable";
import {
    ADD_XML_FILE,
    UPDATE_CORRECTIONS,
    REMOVE_XML_FILE,
    SET_PIPELINE,
    SET_PREVIEW_HASH,
    TOGGLE_PREVIEW,
    SET_OUTPUT_PIPELINE,
    SET_NEW_VERSION_AVAILABLE,
} from "../actions.js";
import type { AddXmlFileData, StateRecord, RecipeInPipelineRecord } from "../types.js";
import updateCorrections from "../lib/corrections-parser.js";
import { makeXmlFileRecord } from "../lib/record-factories.js";

const addXmlFileReducer = (state: StateRecord, data: AddXmlFileData): StateRecord => {
    const xmlFiles = state.get("xmlFiles");
    const isDuplicate = xmlFiles.map((f) => f.get("hash")).includes(data.hash);
    return isDuplicate ? state : state.update("xmlFiles", (xmlFiles) => xmlFiles.push(makeXmlFileRecord(data)));
};

const removeXmlFileReducer = (state: StateRecord, data: string): StateRecord => {
    return state.update("xmlFiles", (xmlFiles) => xmlFiles.filter((f) => f.get("hash") !== data));
};
type Line = [string, string, string];
const updateCorrectionsReducer = (state: StateRecord, data: Array<Line>): StateRecord => {
    return state.set("corrections", updateCorrections(data, state.get("corrections")));
};

/**
 * changes the settings of `pipeline` (functions applied to `Documents`)
 */
const setPipelineReducer = (state: StateRecord, data: List<RecipeInPipelineRecord>): StateRecord => {
    return state.set("pipeline", data);
};

/**
 * Changes the settings of `oututPipeline` (functions applied to xml strings)
 */
const setOutputPipelinereducer = (state: StateRecord, data: List<RecipeInPipelineRecord>): StateRecord => {
    return state.set("outputPipeline", data);
};

type Reducer = (state: StateRecord, data: any) => StateRecord;
const reducersMap: { [actionType: string]: Reducer } = {
    [ADD_XML_FILE]: addXmlFileReducer,
    [UPDATE_CORRECTIONS]: updateCorrectionsReducer,
    [REMOVE_XML_FILE]: removeXmlFileReducer,
    [SET_PIPELINE]: setPipelineReducer,
    [SET_OUTPUT_PIPELINE]: setOutputPipelinereducer,
    [SET_PREVIEW_HASH]: (state: StateRecord, data: string) => state.set("previewHash", data),
    [TOGGLE_PREVIEW]: (state: StateRecord, data: boolean) => state.set("previewEnabled", data),
    [SET_NEW_VERSION_AVAILABLE]: (state: StateRecord, data: boolean) => state.set("newVersionAvailable", data),
};
export default function App(state: StateRecord, action: { type: string, data: AddXmlFileData | any }) {
    return typeof reducersMap[action.type] === "function" ? reducersMap[action.type](state, action.data) : state;
}
