//@flow
import { Map, fromJS } from "immutable";
import { ADD_XML_FILE } from "../actions.js";
import type { AddXmlFileData } from "../types.js";

const handleAddXmlFile = (state: Map, data: AddXmlFileData): Map => {
    const isDuplicate = state
        .get("xmlFiles")
        .map(f => f.get("hash"))
        .includes(data.hash);
    return isDuplicate ? state : state.update("xmlFiles", xmlFiles => xmlFiles.push(Map(data)));
};

export default function App(state: Map, action: { type: string, data: AddXmlFileData | any }) {
    switch (action.type) {
        case ADD_XML_FILE:
            return handleAddXmlFile(state, action.data);
    }
    return state;
}
