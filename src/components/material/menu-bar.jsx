//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
const styles = {
    root: {
        flexGrow: 1,
    },
    title: {
        fontFamily: "Caveat, Cursive",
        textDecoration: "none",
        flexGrow: 1,
    },
};
const LinkToIndex = props => <RouterLink {...props} to="/" />;
function MenuBar(props: { classes: any }) {
    const { classes } = props;
    return (
        <div className={classes.root}>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography component={LinkToIndex} variant="h6" color="inherit" className={classes.title}>
                        {"Cuisine EAD 🍲"}
                    </Typography>
                    <Typography variant="body1" color="inherit">
                        <Link href={"https://github.com/camille-hdl/ead-tinker"} target="_blank" color="inherit">
                            Github
                        </Link>
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    );
}
export default withStyles(styles)(MenuBar);
