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
import { take, last, map, uniq } from "ramda";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import { extractCA } from "../lib/recipes.js";

import type { Props } from "./app.jsx";

const cleanOutputEncoding = (xmlStr: string, encoding: string): string => {
    let str = xmlStr.replace('encoding="' + encoding + '"', "");
    str = str.replace('encoding="' + encoding.toLowerCase() + '"', "");
    str = str.replace('encoding="iso-8859-1"', "");
    str = str.replace('encoding="ISO-8859-1"', "");
    str = str.replace('encoding="windows-1252"', "");
    str = str.replace('encoding="Windows-1252"', "");
    return str;
};
const genNewFilename = (oldFilename: string): string => {
    const temp = oldFilename.split(".");
    const extension = last(temp);
    const debut = take(temp.length - 1, temp);
    return [[debut.join("."), "_resu"].join(""), extension].join(".");
};
const PreviousStepLink = props => <RouterLink to="/recettes" {...props} data-cy="prev-step-link" />;

const escapeRE = /(^|[^"])"([^"]|$)/gim;
const escapeCell = (input: string): string => {
    return '"' + input.replace(escapeRE, '""') + '"';
};

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
                    <PaperSheet xs={12} style={{ textAlign: "center" }}>
                        <Typography
                            onClick={this.download}
                            style={{ cursor: "pointer" }}
                            variant="h3"
                            data-cy="download-link"
                        >
                            {"Télécharger 🎁"}
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
                    <PaperSheet xs={12} style={{ textAlign: "center" }}>
                        <Typography
                            onClick={this.downloadControlAccess}
                            style={{ cursor: "pointer" }}
                            variant="h5"
                            data-cy="download-csv-link"
                        >
                            {"Exporter les controlaccess en .csv"}
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
