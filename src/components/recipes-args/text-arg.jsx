//@flow
import React from "react";
import type { Props } from "./recipe-args.jsx";
import DelayedTextField from "./delayed-text-field.jsx";
export default class TextArg extends React.PureComponent<Props & { argName: string, label: string }> {
    render() {
        const { argName, label } = this.props;
        return (
            <DelayedTextField
                label={label}
                value={String(this.props.args ? this.props.args.get(argName) : "")}
                onChange={value => {
                    this.props.setArgs(this.props.args.set(argName, value));
                }}
            />
        );
    }
}