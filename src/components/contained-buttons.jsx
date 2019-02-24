//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { NavLink as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";

const UploadLink = props => <RouterLink to="/upload" {...props} />;

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    input: {
        display: "none",
    },
});

function NavigationBar(props) {
    const { classes } = props;
    return (
        <div>
            <Button variant="contained" color="primary" className={classes.button}>
                <Link component={UploadLink}>Fichiers</Link>
            </Button>
        </div>
    );
}

export default withStyles(styles)(ContainedButtons);
