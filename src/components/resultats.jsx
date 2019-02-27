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
import { take, last } from "ramda";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

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
const PreviousStepLink = props => <RouterLink to="/recettes" {...props} />;

/**
 * Download the files after having applied the pipeline to it
 */
export default class Resultats extends React.PureComponent<Props> {
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
                        <Typography onClick={this.download} variant="h3">
                            {"Télécharger 🎁"}
                        </Typography>
                        <IconButton onClick={this.download}>
                            <Icon>get_app</Icon>
                        </IconButton>
                        <Typography variant="body1">
                            {
                                "Votre navigateur vous demandera peut-être la permission de télécharger plusieurs fichiers."
                            }
                        </Typography>
                    </PaperSheet>
                </Grid>
            </div>
        );
    }
}
