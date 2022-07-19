//@flow

import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
const styles = {
    title: {
        fontFamily: "Caveat, Cursive",
        flexGrow: 1,
    },
};

function Title(props: { classes: any }) {
    const { classes } = props;
    return (
        <Typography variant="h1" align="center" className={classes.title} color={"primary"}>
            {"Cuisine EAD 🍲"}
        </Typography>
    );
}
export default withStyles(styles)(Title);
