//@flow
import React from "react";

type State = {
    tempValue: string,
};

type Props = {
    value: ?string,
    label: string,
    onChange: (value: string) => void,
};

let fieldSeq = 0;

export default class DelayedTextField extends React.Component<Props, State> {
    updateTO: any;
    fieldId: string;
    constructor(props: Props) {
        super(props);
        this.state = {
            tempValue: String(props.value ?? ""),
        };
        this.updateTO = null;
        fieldSeq += 1;
        this.fieldId = `arg-field-${fieldSeq}`;
    }
    componentWillUnmount() {
        if (this.updateTO) clearTimeout(this.updateTO);
    }
    render() {
        const { label } = this.props;
        const id = this.fieldId;
        return (
            <label className="field" htmlFor={id}>
                <span className="field-label">{label}</span>
                <input
                    id={id}
                    type="text"
                    value={this.state.tempValue}
                    onChange={(ev) => {
                        const value = ev.target.value;
                        this.setState({ tempValue: value });
                        if (this.updateTO) clearTimeout(this.updateTO);
                        this.updateTO = setTimeout(() => {
                            this.props.onChange(value);
                        }, 250);
                    }}
                />
            </label>
        );
    }
}
