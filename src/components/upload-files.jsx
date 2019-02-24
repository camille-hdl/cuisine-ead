//@flow
import React from "react";
import Dropzone from "react-dropzone";
import { concat, groupBy, partialRight, includes, forEach } from "ramda";
import { readXml } from "../lib/xml.js";
type Props = {
    onDrop: (files: Array<any>) => void,
    onRejected: (files: Array<any>) => void,
};

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
 * Trie les fichiers en fonction de leur type
 */
const getType = (file: { type: string }) => (isXml(file.type) ? "xml" : isCsv(file.type) ? "csv" : "other");
const acceptedTypes = concat(xmlTypes, csvTypes);

export default class UploadFiles extends React.PureComponent<Props> {
    render() {
        console.log(this.props);
        return (
            <div>
                <Dropzone
                    className={"dropzone"}
                    accept={acceptedTypes}
                    onDrop={(accepted: Array<any>) => {
                        const { xml, csv, other } = groupBy(getType, accepted);
                        forEach(file => {
                            readXml(file, ({ doc, encoding, string, hash }) => {
                                console.log("??");
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
                    <div style={{ height: "100px" }}>{"Ajouter des fichiers xml ou csv"}</div>
                </Dropzone>
                <hr />
                {`${this.props.xmlFiles.size} files`}
            </div>
        );
    }
}
