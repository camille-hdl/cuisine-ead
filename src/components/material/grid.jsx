//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import type { ChildrenArray } from "react";

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
});

function FullWidthGrid(props: { children?: ChildrenArray<any>, classes: { [className: string]: string } }) {
    const { classes, children } = props;

    return (
        <div className={classes.root}>
            <Grid container>{children}</Grid>
        </div>
    );
}

export default withStyles(styles)(FullWidthGrid);
