//@flow
/**
 * Component implementing `componentDidCatch`
 */

import React from "react";
import ErrorMessage from "./material/error-message.jsx";

type Props = {
    children?: any,
    message?: any,
};
type State = {
    hasError: boolean,
};
export default class ErrorCatcher extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
        };
    }
    componentDidCatch() {
        this.setState({ hasError: true });
    }
    render() {
        if (this.state.hasError) {
            return <ErrorMessage message={this.props.message} />;
        }
        return this.props.children ? this.props.children : null;
    }
}
