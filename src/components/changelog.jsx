//@flow

 import React, { useState } from "react";
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
     changelogHeading: {
         flexBasis: "33.33%",
         flexShrink: 0,
     },
     changelog: {
         textAlign: "left",
     },
 };
 
 function Changelog(props: { classes: any }) {
     const [changelogExpanded, toggleChangelog] = useState(false);
     const [csvExampleExpanded, toggleCsvExampleExpanded] = useState(false);
     const { classes } = props;
     return (
         <Grid container className={classes.root}>
             <Grid item xs={12}>
                 <ExpansionPanel expanded={changelogExpanded} onChange={() => toggleChangelog(!changelogExpanded)}>
                     <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
                         <Typography className={classes.changelogHeading}>Nouveautés</Typography>
                     </ExpansionPanelSummary>
                     <ExpansionPanelDetails>
                         <Typography className={classes.changelog}>
                             <ul>
                                 <li>{"Nouveau traitement : rechercher/remplacer dans les dao* href"}</li>
                                 <li>{"Nouveau traitement : diviser les controlaccess entre chaque <lb />"}</li>
                                 <li>{"Nouveau traitement : sortir scopecontent du did et le placer juste après"}</li>
                                 <li>{"Sur la page des résultats : fusionner les fichiers en un seul, à partir des archref"}</li>
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
 export default withStyles(styles)(Changelog);
 