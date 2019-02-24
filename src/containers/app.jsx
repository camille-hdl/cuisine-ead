//@flow
import * as actions from "../actions.js";
import { connect } from "react-redux";
import App from "../components/app.jsx";
import type { Map, List } from "immutable";
import { withRouter } from "react-router-dom";

export const mapStateToProps = (state: Map) => {
    return {
        xmlFiles: state.get("xmlFiles"),
        csvFiles: state.get("csvFiles"),
    };
};

export const mapDispatchToProps = (dispatch: any) => {
    const dispatchers = {};
    for (let actionName in actions) {
        dispatchers[actionName] = (...args) => dispatch(actions[actionName](...args));
    }
    return dispatchers;
};

export const AppContainer = withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(App)
);
