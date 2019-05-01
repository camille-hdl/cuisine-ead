//@flow
import React from "react";
import Paper from "@material-ui/core/Paper";
import PaperSheet from "./material/paper-sheet.jsx";
import type { List, Map } from "immutable";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";
import OutlinedButton from "./material/outlined-button.jsx";
import AppStepper from "./material/stepper.jsx";
import ErrorCatcher from "./error-catcher.jsx";
import FileSaver from "file-saver";
import { map, uniq } from "ramda";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import { withStyles } from "@material-ui/core/styles";
import { extractCA } from "../lib/recipes.js";
import { escapeCell, cleanOutputEncoding, genNewFilename } from "../lib/utils.js";
import type { Props } from "./app.jsx";
import JSZip from "jszip";

const PreviousStepLink = props => <RouterLink to="/recettes" {...props} data-cy="prev-step-link" />;

const styles = theme => ({
    downloadBlock: {
        ...theme.mixins.gutters(),
        textAlign: "center",
        height: "250px",
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
});

/**
 * Download the files after having applied the pipeline to it
 */
class Results extends React.PureComponent<Props & { classes: any }> {
    /**
     * Save the xmlFiles after having applied the pipeline to them
     * in the browser
     */
    download = () => {
        this.props.xmlFiles.forEach(xmlFile => {
            // telecharger
            const output = this.props.pipelineFn(xmlFile);
            const serializer = new XMLSerializer();
            let str = cleanOutputEncoding(
                this.props.outputPipelineFn(serializer.serializeToString(output)),
                xmlFile.get("encoding")
            );
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
        const promises = this.props.xmlFiles.map(xmlFile => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const output = this.props.pipelineFn(xmlFile);
                    const serializer = new XMLSerializer();
                    const str = cleanOutputEncoding(
                        this.props.outputPipelineFn(serializer.serializeToString(output)),
                        xmlFile.get("encoding")
                    );
                    resolve({ filename: genNewFilename(xmlFile.get("filename")), str: str });
                }, 0);
            });
        });
        if (promises.size > 0) {
            Promise.all(promises.toArray()).then(outputFiles => {
                outputFiles.forEach(outputFile => {
                    zip.file(outputFile.filename, outputFile.str);
                });
                zip.file("recette.cuisine-ead.json", this.getFullRecipe());
                zip.generateAsync({ type: "blob" }).then(blob => {
                    FileSaver.saveAs(blob, "EAD cuisiné.zip");
                });
            });
        }
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
    getFullRecipe = (): string => {
        return JSON.stringify(this.props.fullRecipe.toJS());
    };
    /**
     * Exports the full recipe as JSON
     */
    downloadFullRecipe = () => {
        FileSaver.saveAs(
            new Blob([this.getFullRecipe()], { type: "application/json;charset=utf-8" }),
            "recette.cuisine-ead.json"
        );
    };
    render() {
        const { classes } = this.props;
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
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Results);
