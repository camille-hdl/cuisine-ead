//@flow
import React from "react";
import type { Props } from "./recipe-args.jsx";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: "100%",
    },
});

type State = {
    tempValue: string,
};

class EcraserPublisherArgs extends React.Component<Props & { classes: any }, State> {
    updateTO: any;
    constructor(props: Props & { classes: any }) {
        super(props);
        this.state = {
            tempValue: props.args.get("publisher"),
        };
        this.updateTO = null;
    }
    componentWillUnmount() {
        if (this.updateTO) clearTimeout(this.updateTO);
    }
    render() {
        const { classes } = this.props;
        return (
            <TextField
                label="Publisher"
                value={this.state.tempValue}
                className={classes.textField}
                onChange={ev => {
                    const value = ev.target.value;
                    this.setState({ tempValue: value });
                    if (this.updateTO) clearTimeout(this.updateTO);
                    this.updateTO = setTimeout(() => {
                        this.props.setArgs(this.props.args.set("publisher", value));
                    }, 250);
                }}
                margin="normal"
            />
        );
    }
}

export default withStyles(styles)(EcraserPublisherArgs);
