//@flow
import * as actions from "../actions.js";
import { connect } from "react-redux";
import App from "../components/app.jsx";
import type { Map, List } from "immutable";
import { withRouter } from "react-router-dom";
import { previewXmlFileSelector, pipelineFnSelector, previewXmlStringSelector } from "./selectors.js";

export const mapStateToProps = (state: Map) => {
    return {
        xmlFiles: state.get("xmlFiles"),
        pipeline: state.get("pipeline"),
        pipelineFn: pipelineFnSelector(state),
        corrections: state.get("corrections"),
        previewXmlFile: previewXmlFileSelector(state),
        previewXmlString: previewXmlStringSelector(state),
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
