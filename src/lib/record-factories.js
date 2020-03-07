//@flow
import { Record, Map, List } from "immutable";
import type { RecordFactory } from "immutable";
import type { AddXmlFileData, RecipeInPipeline, InputJSONData } from "../types.js";

export const makeXmlFileRecord: RecordFactory<AddXmlFileData> = Record({
    encoding: "utf-8",
    doc: new Document(),
    filename: "",
    string: "",
    hash: "",
});

export const makeRecipeInPipelineRecord: RecordFactory<RecipeInPipeline> = Record({
    key: "",
    args: Map({}),
});
export const makeInputJSONRecord: RecordFactory<InputJSONData> = Record({
    pipeline: List(),
    outputPipeline: List(),
    version: "",
});
