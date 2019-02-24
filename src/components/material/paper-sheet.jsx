//@flow
import React from "react";
import type { ReactInstance, Children } from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
    root: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 2,
    },
});

function PaperSheet(props: { classes: any, header?: ReactInstance | string, children?: Children }) {
    const { classes, header, children, ...rest } = props;

    return (
        <Grid item {...rest}>
            <Paper className={classes.root} elevation={1}>
                {header ? (
                    <Typography variant="h5" component="h3">
                        {header}
                    </Typography>
                ) : null}
                {children}
            </Paper>
        </Grid>
    );
}

export default withStyles(styles)(PaperSheet);
