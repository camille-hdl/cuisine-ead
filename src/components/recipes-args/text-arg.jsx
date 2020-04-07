//@flow
import React from "react";
import type { Props } from "./recipe-args.jsx";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: "100%",
    },
});

type State = {
    tempValue: string,
};

class TextArg extends React.Component<Props & { classes: any, argName: string, label: string }, State> {
    updateTO: any;
    constructor(props: Props & { classes: any, argName: string, label: string }) {
        super(props);
        this.state = {
            tempValue: String(props.args ? props.args.get(props.argName) : ""),
        };
        this.updateTO = null;
    }
    componentWillUnmount() {
        if (this.updateTO) clearTimeout(this.updateTO);
    }
    render() {
        const { classes, argName, label } = this.props;
        return (
            <TextField
                label={label}
                value={this.state.tempValue}
                className={classes.textField}
                onChange={ev => {
                    const value = ev.target.value;
                    this.setState({ tempValue: value });
                    if (this.updateTO) clearTimeout(this.updateTO);
                    this.updateTO = setTimeout(() => {
                        this.props.setArgs(this.props.args.set(argName, value));
                    }, 250);
                }}
                margin="normal"
            />
        );
    }
}

export default withStyles(styles)(TextArg);
