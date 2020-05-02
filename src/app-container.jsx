//@flow
import * as actions from "./actions.js";
import { connect } from "react-redux";
import App from "./pages/app.jsx";
import { withRouter } from "react-router-dom";
import {
    previewXmlFileSliceSelector,
    pipelineFnSelector,
    previewXmlStringSelector,
    outputPipelineFnSelector,
    fullRecipeSelector,
    correctionsNbSelector,
} from "./selectors.js";
import type { StateRecord, ComputedStateProps } from "./types.js";

export const mapStateToProps = (state: StateRecord): ComputedStateProps => {
    /**
     * see src/pages/app.jsx for details
     * on each property
     */
    return {
        version: state.get("version"),
        xmlFiles: state.get("xmlFiles"),
        pipeline: state.get("pipeline"),
        previewHash: state.get("previewHash"),
        pipelineFn: pipelineFnSelector(state),
        outputPipeline: state.get("outputPipeline"),
        outputPipelineFn: outputPipelineFnSelector(state),
        corrections: state.get("corrections"),
        previewXmlFile: previewXmlFileSliceSelector(state),
        previewXmlString: previewXmlStringSelector(state),
        previewEnabled: state.get("previewEnabled"),
        fullRecipe: fullRecipeSelector(state),
        correctionsNb: correctionsNbSelector(state),
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
    connect<_, _, ComputedStateProps, _, _, _>(mapStateToProps, mapDispatchToProps)(App)
);
