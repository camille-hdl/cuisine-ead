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
import { readXml } from "../lib/xml.js";
import { openFile } from "../lib/utils.js";
import type { AddXmlFileData } from "../types.js";
import Papa from "papaparse";
import PaperSheet from "./material/paper-sheet.jsx";
import { List, Map, fromJS } from "immutable";
import FileList from "./material/file-list.jsx";
import BigIcon from "./material/big-icon.jsx";
import Grid from "./material/grid.jsx";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";
import OutlinedButton from "./material/outlined-button.jsx";
import AppStepper from "./material/stepper.jsx";
import ErrorCatcher from "./error-catcher.jsx";

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
 * See src/components/app.jsx
 */
type Props = {
    xmlFiles: List,
    corrections: Map,
    pipeline: List,
    outputPipeline: List,
    correctionsNb: number,
    setPipeline: (pipeline: List) => void,
    setOutputPipeline: (pipeline: List) => void,
    addXmlFile: (info: AddXmlFileData) => void,
    removeXmlFile: (hash: string) => void,
    updateCorrections: (corrections: Array<string>) => void,
};

const NextStepLink = props => <RouterLink to="/recettes" {...props} data-cy="next-step-link" />;

export default class UploadFiles extends React.PureComponent<Props> {
    /**
     * If the user provides a JSON file, we use it as a preset of recipes
     */
    importJson = (inputJson: { version: string | Array<string>, pipeline: Array<any>, outputPipeline: Array<any> }) => {
        console.log("import", inputJson);
        if (inputJson.pipeline && inputJson.pipeline.length > 0) {
            const inputRecipes = fromJS(inputJson.pipeline);
            /**
             * Don't add duplicates
             */
            const recipesKeys = this.props.pipeline.map(p => p.get("key"));
            const usableRecipes = inputRecipes.filter(ir => !recipesKeys.includes(ir.get("key")));
            this.props.setPipeline(this.props.pipeline.concat(usableRecipes));
        }
        if (inputJson.outputPipeline && inputJson.outputPipeline.length > 0) {
            const inputRecipes = fromJS(inputJson.outputPipeline);
            /**
             * Don't add duplicates
             */
            const recipesKeys = this.props.outputPipeline.map(p => p.get("key"));
            const usableRecipes = inputRecipes.filter(ir => !recipesKeys.includes(ir.get("key")));
            this.props.setOutputPipeline(this.props.outputPipeline.concat(usableRecipes));
        }
    };
    render() {
        return (
            <div>
                <Grid container>
                    <PaperSheet xs={12}>
                        <ErrorCatcher>
                            <AppStepper activeStep={0}>
                                <OutlinedButton
                                    linkComponent={NextStepLink}
                                    style={{ visibility: this.props.xmlFiles.size > 0 ? "visible" : "hidden" }}
                                >
                                    {"Recettes →"}
                                </OutlinedButton>
                            </AppStepper>
                        </ErrorCatcher>
                    </PaperSheet>
                </Grid>
                <ErrorCatcher>
                    <div data-cy="file-uploader">
                        <Dropzone
                            className={"dropzone"}
                            accept={acceptedTypes}
                            onDrop={(accepted: Array<any>, rejected: Array<any>) => {
                                const { xml, csv, json, other } = groupBy(getType, accepted);
                                if (xml) {
                                    forEach(file => {
                                        readXml(file, ({ doc, encoding, string, hash }) => {
                                            this.props.addXmlFile({
                                                filename: file.name,
                                                doc: doc,
                                                encoding: encoding,
                                                string: string,
                                                hash: hash,
                                            });
                                        });
                                    }, xml);
                                }
                                if (csv) {
                                    /**
                                     * CSV files are controlaccess corrections
                                     */
                                    forEach(file => {
                                        Papa.parse(file, {
                                            complete: results => {
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
                            {({ getRootProps, getInputProps }) => (
                                <div data-cy="dropzone" {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <Grid container>
                                        <PaperSheet xs={12}>
                                            <Typography variant="h3" align="center" style={{ opacity: 0.5 }}>
                                                {"Déposer des fichiers"}
                                            </Typography>
                                            <Typography variant="h4" align="center" style={{ opacity: 0.5 }}>
                                                {"xml-ead ou csv (corrections)"}
                                            </Typography>
                                            {this.props.xmlFiles.size > 0 ? (
                                                <PaperSheet xs={12} data-cy="file-list">
                                                    <FileList
                                                        xmlFiles={this.props.xmlFiles}
                                                        onRemove={xmlFile => {
                                                            this.props.removeXmlFile(xmlFile.get("hash"));
                                                        }}
                                                    />
                                                </PaperSheet>
                                            ) : (
                                                <BigIcon icon={"arrow_downward"} />
                                            )}
                                        </PaperSheet>
                                        {this.props.correctionsNb > 0 ? (
                                            <PaperSheet xs={12}>
                                                <Typography variant="h5" align="center" style={{ opacity: 0.5 }}>
                                                    {`${this.props.correctionsNb} correction${
                                                        this.props.correctionsNb > 1 ? "s" : ""
                                                    } de controlaccess`}
                                                </Typography>
                                            </PaperSheet>
                                        ) : null}
                                    </Grid>
                                </div>
                            )}
                        </Dropzone>
                    </div>
                </ErrorCatcher>
            </div>
        );
    }
}
