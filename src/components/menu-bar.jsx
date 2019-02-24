//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
const styles = {
    root: {
        flexGrow: 1,
    },
};
function MenuBar() {
    return (
        <AppBar position="static" color="default">
            <Toolbar>
                <Typography variant="h6" color="inherit">
                    {"EAD Cuisine 🍲"}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
export default withStyles(styles)(MenuBar);
