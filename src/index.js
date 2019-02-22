//@flow
import React from "react";
import ReactDOM from "react-dom";

import App from "./app.jsx";

ReactDOM.render(
    React.createElement(App, {
        myProp: "Hello world !",
    }),
    document.getElementById("app-container")
);
