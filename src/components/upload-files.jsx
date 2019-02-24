//@flow
import React from "react";
import Dropzone from "react-dropzone";
import { concat, groupBy, partialRight, includes, forEach } from "ramda";
import { readXml } from "../lib/xml.js";
import PaperSheet from "./material/paper-sheet.jsx";
import type { List, Map } from "immutable";
import FileList from "./material/file-list.jsx";
import BigIcon from "./material/big-icon.jsx";
import Grid from "./material/grid.jsx";
import Typography from "@material-ui/core/Typography";

const xmlTypes = ["application/xml", "text/xml"];
const csvTypes = [
    "text/plain",
    "text/csv",
    "application/csv",
    "text/x-csv",
    "text/tab-separated-values",
    "text/comma-separated-values",
];
const isXml = partialRight(includes, [xmlTypes]);
const isCsv = partialRight(includes, [csvTypes]);
/**
 * Returns "csv" or "xml" depending on the file's mime type
 */
const getType = (file: { type: string }) => (isXml(file.type) ? "xml" : isCsv(file.type) ? "csv" : "other");
const acceptedTypes = concat(xmlTypes, csvTypes);

type Props = {
    xmlFiles: List,
    corrections: Map,
    addXmlFile: (info: AddXmlFileData) => void,
    removeXmlFile: (hash: string) => void,
};
export default class UploadFiles extends React.PureComponent<Props> {
    render() {
        return (
            <div>
                <Dropzone
                    className={"dropzone"}
                    accept={acceptedTypes}
                    onDrop={(accepted: Array<any>) => {
                        const { xml, csv, other } = groupBy(getType, accepted);
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
                    }}
                >
                    <Grid>
                        <PaperSheet xs={12}>
                            <BigIcon icon={"arrow_downward"} />
                            <Typography variant="body1" align={"center"} style={{ opacity: 0.5 }}>
                                {"Déposer des fichiers"}
                            </Typography>
                        </PaperSheet>
                        {this.props.xmlFiles.size > 0 ? (
                            <PaperSheet xs={6}>
                                <FileList
                                    xmlFiles={this.props.xmlFiles}
                                    onRemove={xmlFile => {
                                        this.props.removeXmlFile(xmlFile.get("hash"));
                                    }}
                                />
                            </PaperSheet>
                        ) : null}
                    </Grid>
                </Dropzone>
            </div>
        );
    }
}
