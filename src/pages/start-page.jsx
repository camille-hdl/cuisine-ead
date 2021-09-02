//@flow
/**
 * Homepage, start button and help text
 */

import React, { useState, forwardRef } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import OutlinedButton from "../components/material/outlined-button.jsx";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Icon from "@material-ui/core/Icon";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

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
const UploadLink = forwardRef(function UploadLink(props, ref) {
    return <RouterLink to="/upload" {...props} ref={ref} />;
});

function StartPage(props: { hasXmlFiles: boolean, classes: any }) {
    const [changelogExpanded, toggleChangelog] = useState(false);
    const [csvExampleExpanded, toggleCsvExampleExpanded] = useState(false);
    const { hasXmlFiles, classes } = props;
    return (
        <Grid container className={classes.root}>
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
                <Typography variant="body1" className={classes.description}>
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
                                <li>{"Sur la page des résultats : fusionner les fichiers en un seul, à partir des archref"}</li>
                                <li>{"Nouveau traitement : copier le titleproper dans le unittitle du archdesc"}</li>
                                <li>{"Nouveau traitement : forcer level=file sur les derniers niveaux"}</li>
                                <li>
                                    {
                                        "Des boutons en bas à droite permettent de télécharger les controlaccess sans avoir de recette"
                                    }
                                </li>
                            </ul>
                        </Typography>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>
            <Grid item xs={12}>
                <ExpansionPanel
                    expanded={csvExampleExpanded}
                    onChange={() => toggleCsvExampleExpanded(!csvExampleExpanded)}
                >
                    <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
                        <Typography className={classes.changelogHeading}>
                            Exemple de csv de correction controlaccess
                        </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography className={classes.changelog}>
                                    {`⚠️ Sur Windows, les fichiers csv sont parfois mal reconnus. Essayez de renommer le fichier en ".txt".`}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} className={classes.changelog}>
                                <pre>{`controlaccess,valeur corrigée,valeur originale
persname,"Osterman, John",john osterman
subject=>geogname,"Marseille, France",marseille
subject=>occupation[role=nouveau rôle][data-custom=attribut custom],Le Nouveau Terme,Ancien terme
"geogname[@role=""bâtiment""]=>persname[role=nouveau rôle]",le maire,Mairie
geogname,,toulon`}</pre>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>1</TableCell>
                                            <TableCell>controlaccess</TableCell>
                                            <TableCell>Valeur corrigée</TableCell>
                                            <TableCell>Valeur originale</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>2</TableCell>
                                            <TableCell>persname</TableCell>
                                            <TableCell>{'"Osterman, John"'}</TableCell>
                                            <TableCell>john osterman</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>3</TableCell>
                                            <TableCell>{"subject=>geogname"}</TableCell>
                                            <TableCell>{'"Marseille, France"'}</TableCell>
                                            <TableCell>marseille</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>4</TableCell>
                                            <TableCell>
                                                {"subject=>occupation[role=nouveau rôle][data-custom=attribut custom]"}
                                            </TableCell>
                                            <TableCell>Le Nouveau Terme</TableCell>
                                            <TableCell>Ancien terme</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>5</TableCell>
                                            <TableCell>
                                                {'"geogname[@role=""bâtiment""]=>persname[role=nouveau rôle]"'}
                                            </TableCell>
                                            <TableCell>le maire</TableCell>
                                            <TableCell>Mairie</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>6</TableCell>
                                            <TableCell>geogname</TableCell>
                                            <td />
                                            <TableCell>toulon</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography className={classes.changelog}>
                                    Explications:
                                    <br />
                                    <ol>
                                        <li>{"La première ligne est ignorée"}</li>
                                        <li>{"Exemple simple : remplacement de valeur d'une balise"}</li>
                                        <li>{"Remplacement d'une balise par une autre"}</li>
                                        <li>
                                            {
                                                "Remplacement d'une balise par une autre, modification de la valeur, ajout d'attributs"
                                            }
                                        </li>
                                        <li>
                                            {
                                                "Remplacement d'une balise avec condition xpath, modification de la balise, ajout d'attributs, modification de la valeur"
                                            }
                                        </li>
                                        <li>{"Le terme geogname 'toulon' est supprimé"}</li>
                                    </ol>
                                </Typography>
                            </Grid>
                        </Grid>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>
        </Grid>
    );
}
export default withStyles(styles)(StartPage);
