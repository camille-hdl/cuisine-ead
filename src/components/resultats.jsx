//@flow
import React from "react";
import PaperSheet from "./material/paper-sheet.jsx";
import type { List, Map } from "immutable";
import Grid from "./material/grid.jsx";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";
import OutlinedButton from "./material/outlined-button.jsx";
import AppStepper from "./material/stepper.jsx";
import ErrorCatcher from "./error-catcher.jsx";
import FileSaver from "file-saver";
import { map, uniq } from "ramda";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import { extractCA } from "../lib/recipes.js";
import { escapeCell, cleanOutputEncoding, genNewFilename } from "../lib/utils.js";
import type { Props } from "./app.jsx";
import JSZip from "jszip";

const PreviousStepLink = props => <RouterLink to="/recettes" {...props} data-cy="prev-step-link" />;

/**
 * Download the files after having applied the pipeline to it
 */
export default class Resultats extends React.PureComponent<Props> {
    /**
     * Save the xmlFiles after having applied the pipeline to them
     * in the browser
     */
    download = () => {
        this.props.xmlFiles.forEach(xmlFile => {
            // telecharger
            const output = this.props.pipelineFn(xmlFile);
            const serializer = new XMLSerializer();
            let str = cleanOutputEncoding(serializer.serializeToString(output), xmlFile.get("encoding"));
            FileSaver.saveAs(
                new Blob([str], { type: "application/xml;charset=utf-8" }),
                genNewFilename(xmlFile.get("filename"))
            );
        });
    };
    /**
     * Download everything in a single zip archive
     */
    downloadZip = () => {
        const zip = new JSZip();
        this.props.xmlFiles.forEach(xmlFile => {
            const output = this.props.pipelineFn(xmlFile);
            const serializer = new XMLSerializer();
            const str = cleanOutputEncoding(serializer.serializeToString(output), xmlFile.get("encoding"));
            zip.file(genNewFilename(xmlFile.get("filename")), str);
        });
        zip.generateAsync({ type: "blob" }).then(blob => {
            FileSaver.saveAs(blob, "EAD cuisiné.zip");
        });
    };
    /**
     * Export controlaccess tags and their content in a csv file
     */
    downloadControlAccess = () => {
        const controlaccesses = this.props.xmlFiles.reduce((acc: Array<any>, xmlFile: Map): Array<any> => {
            const output = this.props.pipelineFn(xmlFile);
            return [...acc, ...extractCA(output)];
        }, []);
        FileSaver.saveAs(
            new Blob(
                [
                    [
                        ["controlaccess", "valeur", "attribut"].join(";"),
                        ...map(ligne => {
                            return [escapeCell(ligne[0]), escapeCell(ligne[1]), escapeCell(ligne[2])].join(";");
                        }, uniq(controlaccesses)),
                    ].join("\n"),
                ],
                { type: "text/plain;charset=utf-8" }
            ),
            "controlaccess.csv"
        );
    };
    render() {
        return (
            <div>
                <Grid container spacing={24}>
                    <PaperSheet xs={12}>
                        <ErrorCatcher>
                            <AppStepper activeStep={2}>
                                <OutlinedButton linkComponent={PreviousStepLink}>{"← Recettes"}</OutlinedButton>
                            </AppStepper>
                        </ErrorCatcher>
                    </PaperSheet>
                    <PaperSheet xs={12} md={4} style={{ textAlign: "center" }}>
                        <Typography
                            onClick={this.download}
                            style={{ cursor: "pointer" }}
                            variant="h5"
                            data-cy="download-link"
                        >
                            {"↓ Fichiers séparés 📄📄📄"}
                        </Typography>
                        <IconButton onClick={this.download}>
                            <Icon>get_app</Icon>
                        </IconButton>
                        <Typography variant="body1">
                            {
                                "Votre navigateur vous demandera peut-être la permission de télécharger plusieurs fichiers."
                            }
                            <br />
                            {
                                "Si vous êtes sur iOS, vous ne pourrez peut-être pas télécharger plusieurs fichiers à la fois."
                            }
                        </Typography>
                    </PaperSheet>
                    <PaperSheet xs={12} md={4} style={{ textAlign: "center" }}>
                        <Typography
                            onClick={this.downloadZip}
                            style={{ cursor: "pointer" }}
                            variant="h5"
                            data-cy="download-zip-link"
                        >
                            {"↓ Archive zip 🎁"}
                        </Typography>
                        <IconButton onClick={this.downloadZip}>
                            <Icon>get_app</Icon>
                        </IconButton>
                    </PaperSheet>
                    <PaperSheet xs={12} md={4} style={{ textAlign: "center" }}>
                        <Typography
                            onClick={this.downloadControlAccess}
                            style={{ cursor: "pointer" }}
                            variant="h5"
                            data-cy="download-csv-link"
                        >
                            {"↓ Controlaccess en .csv 📊"}
                        </Typography>
                        <IconButton onClick={this.downloadControlAccess}>
                            <Icon>get_app</Icon>
                        </IconButton>
                    </PaperSheet>
                </Grid>
            </div>
        );
    }
}
