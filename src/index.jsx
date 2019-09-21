//@flow
import React from "react";
import ReactDOM from "react-dom";

import { AppContainer } from "./containers/app.jsx";

import App from "./reducers/reducer.js";
import thunk from "redux-thunk";
import { Record, List, Map } from "immutable";
import { createStore, applyMiddleware, compose } from "redux";
import { BrowserRouter } from "react-router-dom";
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
import { version } from "../package.json";
import type { StateRecord, InitialStateProps } from "./types.js";
import type { RecordFactory } from "immutable";

/**
 * See src/components/app.jsx for details on each store property
 */
export const getInitialState = (): InitialStateProps => {
    return {
        version: version,
        xmlFiles: List(),
        corrections: Map<string, mixed>(),
        pipeline: List(),
        outputPipeline: List(),
        previewHash: null,
        previewEnabled: false,
    };
};

const stateCreator: RecordFactory<InitialStateProps> = Record({
    version: version,
    xmlFiles: List(),
    corrections: Map<string, mixed>(),
    pipeline: List(),
    outputPipeline: List(),
    previewHash: null,
    previewEnabled: false,
});
const containerElement = document.getElementById("app-container");
if (containerElement) {
    const state: StateRecord = stateCreator(getInitialState());
    ReactDOM.render(
        <BrowserRouter>
            <AppContainer store={createStore(App, state, composeEnhancers(applyMiddleware(thunk)))} />
        </BrowserRouter>,
        containerElement
    );
}
