//@flow
/**
 * View on which the user downloads
 * the files after having applied the pipeline of recipes
 */

import React from "react";
import { Set } from "immutable";
import { Link as RouterLink } from "react-router-dom";
import Steps from "../components/steps.jsx";
import ErrorCatcher from "../components/error-catcher.jsx";
import FileSaver from "file-saver";
import { map } from "ramda";
import extractCA from "../lib/recipes/extract-ca.js";
import { xpathFilter } from "../lib/xml.js";
import { escapeCell, cleanOutputEncoding, genNewFilename } from "../lib/utils.js";
import { each } from "../lib/recipes/utils.js";
import type { Props } from "./app.jsx";
import type { XmlFileRecord } from "../types.js";
import JSZip from "jszip";
import SelectFile from "../components/select-file.jsx";
import insertIntoDocument from "../lib/recipes/insert-into-document.js";
import { trackGoal } from "../lib/fathom.js";

const isTuple = (input: mixed): boolean %checks => {
    return (
        Array.isArray(input) &&
        typeof input[0] === "string" &&
        typeof input[1] === "string" &&
        typeof input[2] === "string"
    );
};

/**
 * Byte order mark
 * https://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
 */
const BOM = "\ufeff";
const getFullRecipe = (props: Props): string => {
    return JSON.stringify(props.fullRecipe.toJS());
};
/**
 * Downloads the resulting files in separate files, one for each input file.
 */
export const downloadResults = (props: Props) => {
    props.xmlFiles.forEach((xmlFile) => {
        // telecharger
        const output = props.pipelineFn(xmlFile);
        const serializer = new XMLSerializer();
        const encoding = xmlFile.get("encoding");
        const filename = xmlFile.get("filename");
        let str = cleanOutputEncoding(
            props.outputPipelineFn(serializer.serializeToString(output)),
            typeof encoding === "string" ? encoding : ""
        );
        FileSaver.saveAs(
            new Blob([str], { type: "application/xml;charset=utf-8" }),
            typeof filename === "string" ? genNewFilename(filename) : genNewFilename("default_filename.xml")
        );
    });
    trackGoal("DTHSLHSJ");
};

/**
 * Download everything in a single zip archive
 */
export const downloadResultsZip = (props: Props) => {
    const zip = new JSZip();
    const promises = props.xmlFiles.map((xmlFile) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const output = props.pipelineFn(xmlFile);
                const serializer = new XMLSerializer();
                const encoding = xmlFile.get("encoding");
                const filename = xmlFile.get("filename");
                const str = cleanOutputEncoding(
                    props.outputPipelineFn(serializer.serializeToString(output)),
                    typeof encoding === "string" ? encoding : ""
                );
                resolve({
                    doc: output,
                    filename:
                        typeof filename === "string"
                            ? genNewFilename(filename)
                            : genNewFilename("default_filename.xml"),
                    str: str,
                });
            }, 0);
        });
    });
    if (promises.size > 0) {
        Promise.all(promises.toArray()).then((outputFiles) => {
            if (typeof window.__E2E__ !== "undefined" && typeof window.__E2E_OUTPUT === "undefined") {
                window.__E2E_OUTPUT = [];
            }
            outputFiles.forEach((outputFile) => {
                if (typeof window.__E2E__ !== "undefined") {
                    window.__E2E_OUTPUT_READY = true;
                    window.__E2E_OUTPUT.push(outputFile);
                    window.__E2E_CORRECTIONS = props.corrections.toJS();
                }
                zip.file(outputFile.filename, outputFile.str);
            });
            zip.file("recette.cuisine-ead.json", getFullRecipe(props));
            zip.generateAsync({ type: "blob" }).then((blob) => {
                FileSaver.saveAs(blob, "EAD cuisiné.zip");
            });
        });
    }
    trackGoal("DTHSLHSJ");
};
/**
 * Export controlaccess tags and their content in a csv file.
 * We use `Immutable.Set` for performance.
 */
export const downloadControlAccesses = (props: Props) => {
    const controlaccesses = props.xmlFiles.reduce((acc: Set<any>, xmlFile: XmlFileRecord): Set<any> => {
        return acc.concat(extractCA(props.pipelineFn(xmlFile)).toSet());
    }, Set([]));
    const str =
        BOM +
        [
            ["controlaccess", "valeur", "attribut"].join(";"),
            ...map((ligne) => {
                if (isTuple(ligne)) {
                    return [escapeCell(ligne[0]), escapeCell(ligne[1]), escapeCell(ligne[2])].join(";");
                }
                return ["", "", ""].join(";");
            }, controlaccesses.toJS()),
        ].join("\n");
    if (typeof window.__E2E__ !== "undefined") {
        window.__E2E_OUTPUT_CA = str;
    }
    FileSaver.saveAs(new Blob([str], { type: "text/plain;charset=utf-8+bom" }), "controlaccess.csv");
    trackGoal("DTHSLHSJ");
};

/**
 * Attempts to combine all files into `rootXmlFile`.
 * If an archref[href] in `rootXmlFile` matches another file, the content of this file is inserted in its place in `rootXmlFile`.
 */
const mergeIntoOneFile = (rootXmlFile: XmlFileRecord, removeArchref: boolean, props: Props) => {
    const otherFiles = props.xmlFiles.filter((file) => file !== rootXmlFile);
    const findOtherfileByFilename = (candidate: string): XmlFileRecord | null => {
        return otherFiles.find((file) => {
            return file.get("filename").toLocaleLowerCase() === candidate.toLocaleLowerCase();
        });
    };
    const rootDoc = props.pipelineFn(rootXmlFile).cloneNode(true);
    const archrefs = xpathFilter(rootDoc, "//archref[@href]");
    each(archrefs, (archref) => {
        const href = archref.getAttribute("href");
        const targetFile = findOtherfileByFilename(href);
        if (targetFile) {
            console.log("Correspondance trouvée pour", href);
            const targetDoc = props.pipelineFn(targetFile).cloneNode(true);
            insertIntoDocument(rootDoc, targetDoc, archref);
            if (removeArchref) {
                archref.remove();
            }
        } else {
            console.log("Pas de correspondance pour", href);
        }
    });
    const serializer = new XMLSerializer();
    const encoding = rootXmlFile.get("encoding");
    const filename = `fusion_${rootXmlFile.get("filename")}`;
    let str = cleanOutputEncoding(
        props.outputPipelineFn(serializer.serializeToString(rootDoc)),
        typeof encoding === "string" ? encoding : ""
    );
    FileSaver.saveAs(
        new Blob([str], { type: "application/xml;charset=utf-8" }),
        typeof filename === "string" ? filename : genNewFilename("default_filename.xml")
    );
};
type State = {
    removeArchrefWhenMerging: boolean,
    mergeRootHash: string,
};
export default class Results extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            removeArchrefWhenMerging: false,
            mergeRootHash: "",
        };
    }
    download = () => downloadResults(this.props);
    downloadZip = () => downloadResultsZip(this.props);
    downloadControlAccess = () => downloadControlAccesses(this.props);
    mergeXmlsIntoOneFile = (rootXmlFile: XmlFileRecord) => {
        return mergeIntoOneFile(rootXmlFile, this.state.removeArchrefWhenMerging, this.props);
    };
    /**
     * Exports the full recipe as JSON
     */
    downloadFullRecipe = () => {
        FileSaver.saveAs(
            new Blob([getFullRecipe(this.props)], { type: "application/json;charset=utf-8" }),
            "recette.cuisine-ead.json"
        );
    };
    render() {
        const { pipeline } = this.props;
        const selectedMergeFile = this.state.mergeRootHash
            ? this.props.xmlFiles.find((file) => String(file.get("hash")) === this.state.mergeRootHash) || null
            : null;
        return (
            <div className="page">
                <ErrorCatcher>
                    <Steps activeStep={2} canNavigate={true}>
                        <RouterLink to="/recettes" data-cy="prev-step-link" className="btn">
                            {"← Recettes"}
                        </RouterLink>
                    </Steps>
                </ErrorCatcher>
                <h1>Récupérer les fichiers</h1>
                <p className="lede">Téléchargez le résultat, une archive, ou seulement l’indexation.</p>
                {pipeline.size <= 0 ? (
                    <p className="notice notice-warning" role="status">
                        {
                            "Aucune recette n’est sélectionnée : les fichiers seront téléchargés sans être modifiés."
                        }
                    </p>
                ) : null}
                <div className="download-list">
                    <article className="download-option">
                        <h2 data-cy="download-link">{"Fichiers séparés"}</h2>
                        <p>Un fichier XML par fichier d’origine. Le navigateur peut demander l’autorisation.</p>
                        <button type="button" className="btn btn-primary" onClick={this.download}>
                            Télécharger
                        </button>
                    </article>
                    <article className="download-option">
                        <h2 data-cy="download-zip-link">{"Archive zip"}</h2>
                        <p>Tous les XML plus la recette JSON, dans une seule archive.</p>
                        <button type="button" className="btn" onClick={this.downloadZip}>
                            Télécharger le zip
                        </button>
                    </article>
                    <article className="download-option">
                        <h2 data-cy="download-csv-link">{"Controlaccess en CSV"}</h2>
                        <p>Exporter l’indexation pour la relire ou la corriger ailleurs.</p>
                        <button type="button" className="btn" onClick={this.downloadControlAccess}>
                            Télécharger le CSV
                        </button>
                    </article>
                    <article className="download-option">
                        <h2 data-cy="download-json-link">{"Recette"}</h2>
                        <p>Garder les recettes choisies pour les réutiliser plus tard (fichier JSON).</p>
                        <button type="button" className="btn" onClick={this.downloadFullRecipe}>
                            Télécharger la recette
                        </button>
                    </article>
                    {this.props.xmlFiles.size > 1 ? (
                        <article className="download-option">
                            <h2 data-cy="download-merged-file">{"Fusionner en un seul fichier"}</h2>
                            <p>
                                Choisir le fichier principal : les autres y seront insérés lorsqu’un{" "}
                                <code>archref</code> pointe vers leur nom.
                            </p>
                            <SelectFile
                                title="Fichier principal"
                                emptyProposition={true}
                                xmlFiles={this.props.xmlFiles}
                                selectedFile={selectedMergeFile}
                                onChange={(file) => {
                                    this.setState({
                                        mergeRootHash: file && file.get("hash") ? String(file.get("hash")) : "",
                                    });
                                }}
                            />
                            <label className="preview-toggle">
                                <input
                                    type="checkbox"
                                    onChange={(ev) => {
                                        this.setState({ removeArchrefWhenMerging: ev.target.checked });
                                    }}
                                    checked={this.state.removeArchrefWhenMerging}
                                />
                                Supprimer les archrefs des IRs insérés
                            </label>
                            <button
                                type="button"
                                className="btn"
                                disabled={!selectedMergeFile}
                                onClick={() => {
                                    if (selectedMergeFile) {
                                        this.mergeXmlsIntoOneFile(selectedMergeFile);
                                    }
                                }}
                            >
                                Fusionner
                            </button>
                        </article>
                    ) : null}
                </div>
            </div>
        );
    }
}
