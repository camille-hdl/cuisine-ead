//@flow
import React, { useState } from "react";
import { NavLink as RouterLink } from "react-router-dom";
import OutlinedButton from "./material/outlined-button.jsx";
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
                                <li>{"Corrections controlaccess par csv : il est possible d'ajouter des attributs"}</li>
                                <li>{"Nouvelle catégorie de traitements : 'Personnaliser'"}</li>
                                <li>{`Lors de la dernière étape, il est possible d'exporter les réglages en JSON. 
                                Cela permet de les réutiliser en déposant le fichier JSON en même temps que les fichiers XML ou CSV.`}</li>
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
                        <Typography className={classes.changelog}>
                            <pre>{`controlaccess,valeur corrigée,valeur originale
persname,"Osterman, John",john osterman
subject=>geogname,"Marseille, France",marseille
subject=>occupation[role=nouveau rôle][data-custom=attribut custom],Le Nouveau Terme,Ancien terme
"geogname[@role=""bâtiment""]=>persname[role=nouveau rôle]",le maire,Mairie
geogname,,toulon`}</pre>
                            <table>
                                <thead>
                                    <tr>
                                        <th>1</th>
                                        <th>controlaccess</th>
                                        <th>Valeur corrigée</th>
                                        <th>Valeur originale</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>2</td>
                                        <td>persname</td>
                                        <td>{'"Osterman, John"'}</td>
                                        <td>john osterman</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>{"subject=>geogname"}</td>
                                        <td>{'"Marseille, France"'}</td>
                                        <td>marseille</td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td>{"subject=>occupation[role=nouveau rôle][data-custom=attribut custom]"}</td>
                                        <td>Le Nouveau Terme</td>
                                        <td>Ancien terme</td>
                                    </tr>
                                    <tr>
                                        <td>5</td>
                                        <td>{'"geogname[@role=""bâtiment""]=>persname[role=nouveau rôle]"'}</td>
                                        <td>le maire</td>
                                        <td>Mairie</td>
                                    </tr>
                                    <tr>
                                        <td>6</td>
                                        <td>geogname</td>
                                        <td />
                                        <td>toulon</td>
                                    </tr>
                                </tbody>
                            </table>
                            <hr />
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
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Grid>
        </Grid>
    );
}
export default withStyles(styles)(StartPage);
