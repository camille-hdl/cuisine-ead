//@flow
import * as actions from "../actions.js";
import { connect } from "react-redux";
import App from "../components/app.jsx";
import type { Map, List } from "immutable";
import { withRouter } from "react-router-dom";
import { version } from "../../package.json";
import {
    previewXmlFileSliceSelector,
    pipelineFnSelector,
    previewXmlStringSelector,
    outputPipelineFnSelector,
} from "./selectors.js";

export const mapStateToProps = (state: Map) => {
    return {
        version: version,
        xmlFiles: state.get("xmlFiles"),
        pipeline: state.get("pipeline"),
        pipelineFn: pipelineFnSelector(state),
        outputPipeline: state.get("outputPipeline"),
        outputPipelineFn: outputPipelineFnSelector(state),
        corrections: state.get("corrections"),
        previewXmlFile: previewXmlFileSliceSelector(state),
        previewXmlString: previewXmlStringSelector(state),
        previewEnabled: state.get("previewEnabled"),
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
