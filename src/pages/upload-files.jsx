//@flow
/**
 * View on which the user can add files via drag & drop or explorer
 *
 * * xml-ead files to process
 * * csv files for corrections
 * * json files to use recipe presets
 */

import React from "react";
import Dropzone from "react-dropzone";
import {
    concat,
    groupBy,
    partialRight,
    reduce,
    mergeDeepWith,
    uniqBy,
    prop,
    head,
    includes,
    forEach,
    tail,
    map,
} from "ramda";
import { readXml, countC } from "../lib/xml.js";
import { openFile } from "../lib/utils.js";
import type { InputJSONData, InputJSONRaw } from "../types.js";
import Papa from "papaparse";
import { List, Map } from "immutable";
import FileList from "../components/file-list.jsx";
import { Link as RouterLink } from "react-router-dom";
import ErrorCatcher from "../components/error-catcher.jsx";
import Changelog from "../components/changelog.jsx";
import Steps from "../components/steps.jsx";
import { makeInputJSONRecord, makeRecipeInPipelineRecord } from "../lib/record-factories.js";
import { setWebmcpFilePicker } from "../lib/webmcp/file-picker.js";

const makeInputJSONData = (input: InputJSONRaw): InputJSONData => {
    const output = {
        version: input.version,
        pipeline: List(),
        outputPipeline: List(),
    };
    if (input.pipeline) {
        output.pipeline = List(input.pipeline.map(makeRecipeInPipelineRecord)).map((rec) => {
            if (rec.has("args")) {
                if (!Map.isMap(rec.get("args"))) {
                    return rec.set("args", Map(rec.get("args")));
                }
                return rec;
            }
            return rec.set("args", Map());
        });
    }
    if (input.outputPipeline) {
        output.outputPipeline = List(input.outputPipeline.map(makeRecipeInPipelineRecord));
    }
    return output;
};

/**
 * mime-types for xml files (assuming xml-EAD)
 */
const xmlTypes = ["application/xml", "text/xml"];
/**
 * mime-types for CSV files,
 * assuming the format is compatible with corrections
 */
const csvTypes = [
    "text/plain",
    "text/csv",
    "application/csv",
    "text/x-csv",
    "text/tab-separated-values",
    "text/comma-separated-values",
];
const jsonTypes = ["application/json"];
const isXml = partialRight(includes, [xmlTypes]);
const isCsv = partialRight(includes, [csvTypes]);
const isJson = partialRight(includes, [jsonTypes]);
/**
 * Returns "csv", "xml" or "json" depending on the file's mime type
 */
const getType = (file: { type: string }) =>
    isXml(file.type) ? "xml" : isCsv(file.type) ? "csv" : isJson(file.type) ? "json" : "other";
const concatAll = reduce(concat, []);
const acceptedTypes = concatAll([xmlTypes, csvTypes, jsonTypes]);

const mergeDeepAll = reduce(
    mergeDeepWith((a, b) => {
        return uniqBy(prop("key"), concat(a, b));
    }),
    {}
);

/**
 * See src/pages/app.jsx
 */
import type { Props } from "./app.jsx";

export default class UploadFiles extends React.PureComponent<Props> {
    /**
     * If the user provides a JSON file, we use it as a preset of recipes
     */
    importJson = (inputJson: InputJSONRaw) => {
        console.log("import", inputJson);
        const inputRecord = makeInputJSONRecord(makeInputJSONData(inputJson));
        if (inputRecord.get("pipeline") && inputRecord.get("pipeline").size > 0) {
            const inputRecipes = inputRecord.get("pipeline");
            if (List.isList(inputRecipes)) {
                /**
                 * Don't add duplicates
                 */
                const recipesKeys = this.props.pipeline.map((p) => p.get("key"));
                const usableRecipes = inputRecipes.filter((ir) => !recipesKeys.includes(ir.get("key")));
                this.props.setPipeline(this.props.pipeline.concat(usableRecipes));
            }
        }
        if (inputRecord.get("outputPipeline") && inputRecord.get("outputPipeline").size > 0) {
            const inputRecipes = inputRecord.get("outputPipeline");
            /**
             * Don't add duplicates
             */
            const recipesKeys = this.props.outputPipeline.map((p) => p.get("key"));
            const usableRecipes = inputRecipes.filter((ir) => !recipesKeys.includes(ir.get("key")));
            this.props.setOutputPipeline(this.props.outputPipeline.concat(usableRecipes));
        }
    };
    componentWillUnmount() {
        setWebmcpFilePicker(null);
    }
    render() {
        const pipelineLength = this.props.pipeline.size + this.props.outputPipeline.size;
        const hasFiles = this.props.xmlFiles.size > 0;
        const recipesLabel = `Choisir les recettes${pipelineLength > 0 ? ` (${pipelineLength})` : ""} →`;
        return (
            <div>
                <div className="page">
                    <ErrorCatcher>
                        <Steps activeStep={0} canNavigate={hasFiles}>
                            <RouterLink
                                to="/recettes"
                                data-cy="next-step-link"
                                className={`btn btn-primary${hasFiles ? "" : " is-invisible"}`}
                                tabIndex={hasFiles ? undefined : -1}
                                aria-hidden={hasFiles ? undefined : true}
                            >
                                {recipesLabel}
                            </RouterLink>
                        </Steps>
                    </ErrorCatcher>
                    <h1 className="wordmark-hero">{"Cuisine EAD 🍲"}</h1>
                    <p className="lede">
                        Traitez des fichiers XML-EAD dans le navigateur : déposez-les, choisissez des recettes, puis
                        récupérez le résultat.
                    </p>
                    <ErrorCatcher>
                        <div data-cy="file-uploader">
                            <Dropzone
                                accept={acceptedTypes}
                                onDrop={(accepted: Array<any>, rejected: Array<any>) => {
                                    const { xml, csv, json, other } = groupBy(getType, accepted);
                                    if (xml) {
                                        forEach((file) => {
                                            readXml(file, ({ doc, encoding, string, hash }) => {
                                                this.props.addXmlFile({
                                                    filename: file.name,
                                                    doc: doc,
                                                    encoding: encoding,
                                                    string: string,
                                                    hash: hash,
                                                    nbC: countC(doc),
                                                });
                                            });
                                        }, xml);
                                    }
                                    if (csv) {
                                        /**
                                         * CSV files are controlaccess corrections
                                         */
                                        forEach((file) => {
                                            Papa.parse(file, {
                                                complete: (results) => {
                                                    this.props.updateCorrections(tail(results.data));
                                                },
                                            });
                                        }, csv);
                                    }
                                    if (json) {
                                        /**
                                         * json files are "fullRecipe" files :
                                         * a list of recipes and outputRecipes to be applied to the xml files.
                                         * If multiple json files are provided, we merge them
                                         * TODO: check if the files are valid
                                         */
                                        const promises = map(openFile, json);
                                        Promise.all(promises).then((jsonStrings: Array<string>) => {
                                            const jsonObjects = map(JSON.parse, jsonStrings);
                                            const finalJson =
                                                jsonObjects.length > 1 ? mergeDeepAll(jsonObjects) : head(jsonObjects);
                                            this.importJson(finalJson);
                                        });
                                    }
                                    if (rejected) {
                                        console.log("rejected", rejected);
                                    }
                                    if (other) {
                                        console.log("ignored files", other);
                                    }
                                }}
                            >
                                {({ getRootProps, getInputProps, isDragActive, open }) => {
                                    setWebmcpFilePicker(open);
                                    return (
                                        <div
                                            data-cy="dropzone"
                                            {...getRootProps({
                                                className: `dropzone${isDragActive ? " is-active" : ""}`,
                                            })}
                                        >
                                            <input
                                                {...getInputProps({
                                                    "aria-label": "Ajouter des fichiers XML-EAD, CSV ou JSON",
                                                })}
                                            />
                                            <p className="dropzone-title">
                                                {isDragActive ? "Déposez maintenant" : "Déposez les fichiers ici"}
                                            </p>
                                            <p className="dropzone-hint">
                                                XML-EAD à traiter, CSV de corrections, ou JSON de recettes. Vous pouvez
                                                aussi parcourir vos dossiers.
                                            </p>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    open();
                                                }}
                                            >
                                                Parcourir les fichiers
                                            </button>
                                        </div>
                                    );
                                }}
                            </Dropzone>
                        </div>
                    </ErrorCatcher>
                    {hasFiles ? (
                        <section className="file-panel" data-cy="file-list" aria-label="Fichiers ajoutés">
                            <FileList
                                xmlFiles={this.props.xmlFiles}
                                onRemove={(xmlFile) => {
                                    this.props.removeXmlFile(xmlFile.get("hash"));
                                }}
                            />
                        </section>
                    ) : null}
                    {this.props.correctionsNb > 0 ? (
                        <p className="status-note" role="status">
                            {`${this.props.correctionsNb} correction${
                                this.props.correctionsNb > 1 ? "s" : ""
                            } de controlaccess`}
                        </p>
                    ) : null}
                </div>
                <Changelog />
            </div>
        );
    }
}
