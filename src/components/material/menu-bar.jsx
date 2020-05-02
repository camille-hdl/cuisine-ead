//@flow
import React, { forwardRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
const styles = {
    root: {
        flexGrow: 1,
    },
    title: {
        fontFamily: "Caveat, Cursive",
        textDecoration: "none",
        flexGrow: 1,
    },
    newVersion: {
        color: "white",
    },
};
const LinkToIndex = forwardRef(function LinkToIndex(props, ref) {
    return <RouterLink {...props} to="/" ref={ref} />;
});
function MenuBar(props: { classes: any, version: string, newVersionAvailable: boolean }) {
    const { classes, version, newVersionAvailable } = props;
    return (
        <div className={classes.root}>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography component={LinkToIndex} variant="h6" color="inherit" className={classes.title}>
                        {"Cuisine EAD 🍲"}
                    </Typography>
                    {newVersionAvailable ? (
                        <Button
                            variant="outlined"
                            className={classes.newVersion}
                            color="secondary"
                            title="Recharger la page"
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            {"Nouvelle version disponible 🍭"}
                        </Button>
                    ) : null}
                    <Typography variant="body1" color="inherit">
                        <Link
                            href={"https://github.com/camille-hdl/cuisine-ead/issues"}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="inherit"
                        >
                            Demander une fonctionnalité ou signaler un bug
                        </Link>
                        {` - v${version}`}
                    </Typography>
                </Toolbar>
            </AppBar>
        </div>
    );
}
export default withStyles(styles)(MenuBar);
