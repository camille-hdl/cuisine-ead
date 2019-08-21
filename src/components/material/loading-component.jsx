//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
    progress: {
        margin: theme.spacing.unit * 2,
    },
});

function LoadingComponent(props: { classes: { [className: string]: string } }) {
    const { classes } = props;
    return (
        <div>
            <CircularProgress className={classes.progress} />
        </div>
    );
}

export default withStyles(styles)(LoadingComponent);
