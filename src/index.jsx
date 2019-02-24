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

export const getInitialState = () => {
    return {
        xmlFiles: [],
        corrections: [],
        pipeline: [],
    };
};

ReactDOM.render(
    <BrowserRouter>
        <AppContainer store={createStore(App, fromJS(getInitialState()), composeEnhancers(applyMiddleware(thunk)))} />
    </BrowserRouter>,
    document.getElementById("app-container")
);
