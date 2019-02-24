//@flow

import React, { Suspense, lazy } from "react";
import MenuBar from "./menu-bar.jsx";
import { List } from "immutable";
import { Route, Switch, Redirect } from "react-router-dom";
import LoadingComponent from "./material/loading-component.jsx";
import AppStepper from "./material/stepper.jsx";
import type { AddXmlFileData } from "../types.js";
import Grid from "./material/grid.jsx";
import PaperSheet from "./material/paper-sheet.jsx";

type RouteProps = {
    location: {
        pathName: string,
    },
    history: any,
    match: any,
};
export type Props = {
    xmlFiles: List,
    corrections: Map,
    addXmlFile: (info: AddXmlFileData) => void,
    removeXmlFile: (hash: string) => void,
} & RouteProps;
const UploadFiles = lazy(() => import("./upload-files.jsx"));

const AsyncUploadFiles = function AsyncUploadFiles(props) {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <UploadFiles {...props} />
        </Suspense>
    );
};
const getUploadFilesProps = (props: Props) => {
    const { xmlFiles, corrections, addXmlFile, removeXmlFile } = props;
    return { xmlFiles, corrections, addXmlFile, removeXmlFile };
};

const stepByPathName = {
    "/upload": 0,
    "/traitements": 1,
    "/resultat": 2,
};
const getActiveStepByRoute = (pathName: string): number => {
    return typeof stepByPathName[pathName] !== "undefined" ? stepByPathName[pathName] : 0;
};

export default function App(props: Props) {
    const hasXmlFiles = props.xmlFiles.size > 0;
    return (
        <>
            <MenuBar />
            <Grid>
                <PaperSheet xs={12}>
                    <AppStepper activeStep={getActiveStepByRoute(props.location.pathName)} />
                </PaperSheet>
            </Grid>
            <Switch>
                <Route exact path="/" render={() => (!hasXmlFiles ? <Redirect to="/upload" /> : <div>...</div>)} />
                <Route
                    path="/upload"
                    render={routeProps => <AsyncUploadFiles {...getUploadFilesProps(props)} {...routeProps} />}
                />
            </Switch>
        </>
    );
}
