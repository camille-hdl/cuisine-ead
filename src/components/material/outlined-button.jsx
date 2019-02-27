//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

const styles = theme => ({
    button: {
        margin: "auto",
    },
});

function Outlined(props: { classes: any, children?: any, linkComponent: any }) {
    const { classes, children, linkComponent, ...rest } = props;
    return (
        <Button component={linkComponent} variant="outlined" color="primary" className={classes.button} {...rest}>
            {children}
        </Button>
    );
}

export default withStyles(styles)(Outlined);
