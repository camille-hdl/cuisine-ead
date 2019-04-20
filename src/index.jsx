//@flow
import React from "react";
import ReactDOM from "react-dom";

import { AppContainer } from "./containers/app.jsx";

import App from "./reducers/reducer.js";
import thunk from "redux-thunk";
import { fromJS } from "immutable";
import { createStore, applyMiddleware, compose } from "redux";
import { BrowserRouter } from "react-router-dom";
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
import { version } from "../package.json";

export const getInitialState = () => {
    return {
        version: version,
        xmlFiles: [],
        corrections: {},
        pipeline: [],
        outputPipeline: [],
        previewHash: null,
        previewEnabled: false,
    };
};

ReactDOM.render(
    <BrowserRouter>
        <AppContainer store={createStore(App, fromJS(getInitialState()), composeEnhancers(applyMiddleware(thunk)))} />
    </BrowserRouter>,
    document.getElementById("app-container")
);
