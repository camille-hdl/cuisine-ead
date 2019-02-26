//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";


const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    }
});

function Outlined(props) {
    const { classes, children, ...rest } = props;
    return (
        <Button variant="outlined" color="primary" className={classes.button} {...rest}>
            {children}
        </Button>
    );
}

export default withStyles(styles)(Outlined);
