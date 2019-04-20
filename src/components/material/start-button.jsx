//@flow
import React, { useState } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import OutlinedButton from "./outlined-button.jsx";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Icon from "@material-ui/core/Icon";

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
        margin: "auto",
        textAlign: "left",
    },
    changelogHeading: {
        flexBasis: "33.33%",
        flexShrink: 0,
    },
    changelog: {
        textAlign: "left",
    },
};
const UploadLink = props => <RouterLink to="/upload" {...props} />;

/**
 * homepage and start button
 */
function StartButton(props: { hasXmlFiles: boolean, classes: any }) {
    const [changelogExpanded, toggleChangelog] = useState(false);
    const { hasXmlFiles, classes } = props;
    return (
        <Grid container spacing={24} className={classes.root}>
            <Grid item xs={12}>
                <Typography variant="h1" className={classes.title} color={"primary"}>
                    {"Cuisine EAD 🍲"}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <OutlinedButton data-cy={"start-button"} linkComponent={UploadLink}>
                    {hasXmlFiles ? "Fichiers" : "Démarrer →"}
                </OutlinedButton>
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
            <Grid item xs={12}>
                <ExpansionPanel expanded={changelogExpanded} onChange={() => toggleChangelog(!changelogExpanded)}>
                    <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
                        <Typography className={classes.changelogHeading}>Nouveautés</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Typography className={classes.changelog}>
                            <ul>
                                <li>
                                    {`Traitements en sortie ("assaisonnements") : suppression des lignes vides,
                                    indentation automatique (lent)`}
                                </li>
                                <li>Recettes regroupées par catégories</li>
                                <li>{`Lorsqu'un fichier est déposé, les sauts de ligne CRLF sont convertis en LF 
                                pour améliorer la comparaison`}</li>
                            </ul>
                        </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>
        </Grid>
    );
}
export default withStyles(styles)(StartButton);
