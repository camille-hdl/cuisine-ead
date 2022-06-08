//@flow
import React from "react";
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

type Props = {
    value: ?string,
    classes: any,
    label: string,
    onChange: (value: string) => void,
};

class DelayedTextField extends React.Component<Props, State> {
    updateTO: any;
    constructor(props: Props) {
        super(props);
        this.state = {
            tempValue: String(props.value ?? ""),
        };
        this.updateTO = null;
    }
    componentWillUnmount() {
        if (this.updateTO) clearTimeout(this.updateTO);
    }
    render() {
        const { classes, label } = this.props;
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
                        this.props.onChange(value);
                    }, 250);
                }}
                margin="normal"
            />
        );
    }
}

export default withStyles(styles)(DelayedTextField);
