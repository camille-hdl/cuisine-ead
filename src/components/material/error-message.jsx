//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

const styles = {
    card: {
        minWidth: 275,
    },
    title: {
        fontSize: 14,
    },
};

function ErrorMessage(props: { classes: any, message: ?string }) {
    const { classes, message } = props;
    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography className={classes.title} color="error" gutterBottom>
                    Erreur
                </Typography>
                <Typography variant="h5" component="h2">
                    {message ? message : "Une erreur s'est produite. Veuillez recommencer le traitement la page"}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default withStyles(styles)(ErrorMessage);
