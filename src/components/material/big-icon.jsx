//@flow
import React from "react";
import Icon from "@material-ui/core/Icon";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
    root: {
        height: "150px",
        width: "150px",
        opacity: 0.5,
        margin: `auto`,
        padding: `${theme.spacing(4)}px 0 ${theme.spacing(2)}px`,
    },
});

function BigIcon(props: { icon: string, classes: any, children: ?any }) {
    return (
        <div className={props.classes.root}>
            <Typography variant="h1" align="center">
                <Icon>{props.icon}</Icon>
            </Typography>
        </div>
    );
}

export default withStyles(styles)(BigIcon);
