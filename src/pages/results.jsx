//@flow
/**
 * View on which the user downloads
 * the files after having applied the pipeline of recipes
 */

import React, { forwardRef } from "react";
import Paper from "@material-ui/core/Paper";
import PaperSheet from "../components/material/paper-sheet.jsx";
import { Set } from "immutable";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";
import OutlinedButton from "../components/material/outlined-button.jsx";
import AppStepper from "../components/material/stepper.jsx";
import ErrorCatcher from "../components/error-catcher.jsx";
import FileSaver from "file-saver";
import { map } from "ramda";
import IconButton from "@material-ui/core/IconButton";
import Switch from "@material-ui/core/Switch";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Icon from "@material-ui/core/Icon";
import { withStyles } from "@material-ui/core/styles";
import extractCA from "../lib/recipes/extract-ca.js";
import { xpathFilter } from "../lib/xml.js";
import { escapeCell, cleanOutputEncoding, genNewFilename } from "../lib/utils.js";
import { each } from "../lib/recipes/utils.js";
import type { Props } from "./app.jsx";
import type { XmlFileRecord } from "../types.js";
import JSZip from "jszip";
import { trackGoal } from "../lib/fathom.js";
import SelectFile from "../components/material/select-file.jsx";
import insertIntoDocument from "../lib/recipes/insert-into-document.js";

const PreviousStepLink = forwardRef(function PreviousStepLink(props, ref) {
    return <RouterLink to="/recettes" {...props} data-cy="prev-step-link" ref={ref} />;
});

const styles = (theme) => ({
    downloadBlock: {
        ...theme.mixins.gutters(),
        textAlign: "center",
        height: "250px",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
});

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
    trackGoal("DUGNE754");
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
            if (typeof window.Cypress !== "undefined" && typeof window.__CYPRESS_OUTPUT === "undefined") {
                window.__CYPRESS_OUTPUT = [];
            }
            outputFiles.forEach((outputFile) => {
                if (typeof window.Cypress !== "undefined") {
                    window.__CYPRESS_OUTPUT_READY = true;
                    window.__CYPRESS_OUTPUT.push(outputFile);
                    window.__CYPRESS_CORRECTIONS = props.corrections.toJS();
                }
                zip.file(outputFile.filename, outputFile.str);
            });
            zip.file("recette.cuisine-ead.json", getFullRecipe(props));
            zip.generateAsync({ type: "blob" }).then((blob) => {
                FileSaver.saveAs(blob, "EAD cuisiné.zip");
            });
        });
    }
    trackGoal("DUGNE754");
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
    if (typeof window.Cypress !== "undefined") {
        window.__CYPRESS_OUTPUT_CA = str;
    }
    FileSaver.saveAs(new Blob([str], { type: "text/plain;charset=utf-8+bom" }), "controlaccess.csv");
    trackGoal("XFHTRH2Y");
};

/**
 * Attempts to combine all files into `rootXmlFile`.
 * If an archref[href] in `rootXmlFile` matches another file, the content of this file is inserted in its place in `rootXmlFile`.
 */
const mergeIntoOneFile = (rootXmlFile: XmlFileRecord, removeArchref: boolean, props: Props) => {
    const otherFiles = props.xmlFiles.filter(file => file !== rootXmlFile);
    const findOtherfileByFilename = (candidate: string): XmlFileRecord | null => {
        return otherFiles.find(file => {
            return file.get("filename").toLocaleLowerCase() === candidate.toLocaleLowerCase();
        });
    };
    const rootDoc = props.pipelineFn(rootXmlFile).cloneNode(true);
    const archrefs = xpathFilter(rootDoc, "//archref[@href]");
    each(archrefs, archref => {
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
    removeArchrefWhenMerging: boolean
};
class Results extends React.Component<Props & { classes: any }, State> {
    constructor(props: Props & { classes: any }) {
        super(props);
        this.state = {
            removeArchrefWhenMerging: false,
        };
    }
    download = () => downloadResults(this.props);
    downloadZip = () => downloadResultsZip(this.props);
    downloadControlAccess = () => downloadControlAccesses(this.props);
    mergeXmlsIntoOneFile = (rootXmlFile: XmlFileRecord) => {
        return mergeIntoOneFile(
            rootXmlFile,
            this.state.removeArchrefWhenMerging,
            this.props
        );
    }
    /**
     * Returns a json representation of the pipeline + outputPipeline
     * so that the user can re-use it as a preset
     */

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
        const { classes, pipeline } = this.props;
        return (
            <div>
                <Grid container>
                    <PaperSheet xs={12}>
                        <ErrorCatcher>
                            <AppStepper activeStep={2}>
                                <OutlinedButton linkComponent={PreviousStepLink}>{"← Recettes"}</OutlinedButton>
                            </AppStepper>
                        </ErrorCatcher>
                    </PaperSheet>
                    { pipeline.size <= 0 ? (
                        <Grid item xs={12} md={12}>
                            <Paper className={classes.downloadBlock}>
                                <Typography variant="body1">
                                    {
                                        "⚠️ Vous n'avez sélectionné aucune recette, les fichiers seront donc téléchargés sans être modifiés."
                                    }
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : null}
                    <Grid item xs={12} md={3}>
                        <Paper className={classes.downloadBlock}>
                            <Typography
                                onClick={this.download}
                                style={{ cursor: "pointer" }}
                                variant="h5"
                                data-cy="download-link"
                            >
                                {"Fichiers séparés 📄📄📄"}
                            </Typography>
                            <IconButton onClick={this.download}>
                                <Icon>get_app</Icon>
                            </IconButton>
                            <Typography variant="body1">
                                {
                                    "Votre navigateur vous demandera peut-être la permission de télécharger plusieurs fichiers."
                                }
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper className={classes.downloadBlock}>
                            <Typography
                                onClick={this.downloadZip}
                                style={{ cursor: "pointer" }}
                                variant="h5"
                                data-cy="download-zip-link"
                            >
                                {"Archive zip 🎁"}
                            </Typography>
                            <IconButton onClick={this.downloadZip}>
                                <Icon>get_app</Icon>
                            </IconButton>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper className={classes.downloadBlock}>
                            <Typography
                                onClick={this.downloadControlAccess}
                                style={{ cursor: "pointer" }}
                                variant="h5"
                                data-cy="download-csv-link"
                            >
                                {"Controlaccess en .csv 📊"}
                            </Typography>
                            <IconButton onClick={this.downloadControlAccess}>
                                <Icon>get_app</Icon>
                            </IconButton>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Paper className={classes.downloadBlock}>
                            <Typography
                                onClick={this.downloadFullRecipe}
                                style={{ cursor: "pointer" }}
                                variant="h5"
                                data-cy="download-json-link"
                            >
                                {"Recette 💌"}
                            </Typography>
                            <IconButton onClick={this.downloadFullRecipe}>
                                <Icon>get_app</Icon>
                            </IconButton>
                        </Paper>
                    </Grid>
                    {this.props.xmlFiles.size > 1 ? (
                        <Grid item xs={12} md={3}>
                            <Paper className={classes.downloadBlock}>
                                <Typography
                                    variant="h5"
                                    data-cy="download-merged-file"
                                >
                                    {"Fusionner en un seul fichier 🌮"}
                                </Typography>
                                <SelectFile
                                    title="Sélectionner le fichier principal, dans lequel les autres seront inclus"
                                    emptyProposition={true}
                                    xmlFiles={this.props.xmlFiles}
                                    selectedFile={null}
                                    onChange={file => {
                                        if (file) {
                                            this.mergeXmlsIntoOneFile(file);
                                        }
                                    }}
                                />
                                <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            onChange={(ev) => {
                                                this.setState({ removeArchrefWhenMerging: ev.target.checked });
                                            }}
                                            checked={this.state.removeArchrefWhenMerging}
                                        />
                                    }
                                    label="Supprimer les archrefs des IRs insérés"
                                />
                                </FormGroup>
                            </Paper>
                        </Grid>
                    ) : null}
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Results);
