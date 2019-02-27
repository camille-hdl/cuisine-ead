//@flow
import React from "react";
import { NavLink as RouterLink } from "react-router-dom";
import OutlinedButton from "./outlined-button.jsx";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import PaperSheet from "./paper-sheet.jsx";
import Paper from "@material-ui/core/Paper";

const styles = {
    root: {
        textAlign: "center",
        marginTop: 50,
    },
    title: {
        fontFamily: "Caveat, Cursive",
        flexGrow: 1,
    },
    description: {
        flexGrow: 1,
        maxWidth: 300,
        margin: "auto"
    },
};
const UploadLink = props => <RouterLink to="/upload" {...props} />;

/**
 * homepage and start button
 */
function StartButton(props: { hasXmlFiles: boolean, classes: any }) {
    const { hasXmlFiles, classes } = props;
    return (
        <Grid container spacing={24} className={classes.root}>
            <Grid item xs={12}>
                <Typography variant="h1" className={classes.title} color={"primary"}>
                    {"Cuisine EAD 🍲"}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <OutlinedButton linkComponent={UploadLink}>{hasXmlFiles ? "Fichiers" : "Démarrer →"}</OutlinedButton>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1" className={classes.description}>
                    <ol>
                        <li>Déposer des fichiers XML</li>
                        <li>Choisir des traitements à effectuer</li>
                        <li>Télécharger les fichiers modifiés</li>
                    </ol>
                    <br />
                    <ul>
                        <li>Complètement offline</li>
                        <li>Comparaison avant → après</li>
                    </ul>
                </Typography>
            </Grid>
        </Grid>
    );
}
export default withStyles(styles)(StartButton);
