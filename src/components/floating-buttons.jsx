//@flow
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import Icon from "@material-ui/core/Icon";
import type { Props } from "./app.jsx";
import { downloadResultsZip, downloadControlAccesses } from "./results.jsx";

const useStyles = makeStyles(theme => ({
    root: {
        position: "fixed",
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        "& > *": {
            margin: theme.spacing(1),
        },
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
}));

/**
 * Download is allowed if there is at least 1 input xml file
 * and 1 recipe or outputrecipe
 */
const canDownloadZip = (props: Props) => {
    if (props.xmlFiles.size <= 0) return false;
    if (props.pipeline.size + props.outputPipeline.size <= 0) return false;
    return true;
};

/**
 * CA Download is allowed if there is at least 1 input xml file
 */
const canDownloadCAs = (props: Props) => {
    if (props.xmlFiles.size <= 0) return false;
    return true;
};

export default function FloatingButtons(props: Props) {
    const classes = useStyles();
    const downloadZip = canDownloadZip(props);
    const downloadCAs = canDownloadCAs(props);
    if (!downloadCAs && !downloadZip) return null;
    return (
        <div className={classes.root}>
            {downloadZip ? (
                <Fab
                    color="primary"
                    title="Télécharger les fichiers modifiés"
                    onClick={() => downloadResultsZip(props)}
                    data-cy="download-results"
                >
                    <Icon>get_app</Icon>
                </Fab>
            ) : null}
            {downloadCAs ? (
                <Fab
                    variant="extended"
                    title="Télécharger les controlaccess"
                    onClick={() => downloadControlAccesses(props)}
                    data-cy="download-ca"
                >
                    <Icon className={classes.extendedIcon}>get_app</Icon>
                    Controlaccess
                </Fab>
            ) : null}
        </div>
    );
}
