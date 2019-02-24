//@flow

import React, { Suspense, lazy } from "react";
import MenuBar from "./menu-bar.jsx";
import { List } from "immutable";
import { Route, Switch } from "react-router-dom";
import ContainedButtons from "./contained-buttons.jsx";
import Loading from "./loading-component.jsx";
type Props = {
    files: List,
};
const UploadFiles = lazy(() => import("./upload-files.jsx"));

const AsyncUploadFiles = function AsyncUploadFiles(props) {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <UploadFiles {...props} />
        </Suspense>
    );
};

export default function App(props: Props) {
    return (
        <>
            <MenuBar />
            <Switch>
                <Route path="/upload" render={routeProps => <AsyncUploadFiles {...props} {...routeProps} />} />
                <Route path="/" component={ContainedButtons} />
            </Switch>
        </>
    );
}
