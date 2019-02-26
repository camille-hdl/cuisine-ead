//@flow

import React, { Suspense, lazy } from "react";
import MenuBar from "./material/menu-bar.jsx";
import { List } from "immutable";
import { Route, Switch, Redirect } from "react-router-dom";
import LoadingComponent from "./material/loading-component.jsx";
import type { AddXmlFileData } from "../types.js";
import Grid from "./material/grid.jsx";
import PaperSheet from "./material/paper-sheet.jsx";
import StartButton from "./material/start-button.jsx";
import ErrorCatcher from "./error-catcher.jsx";

type RouteProps = {
    location: {
        pathname: string,
    },
    history: any,
    match: any,
};
export type Props = {
    xmlFiles: List,
    pipeline: List,
    corrections: Map,
    previewXmlFile: Map | null,
    previewXmlString: string | null,
    previewEnabled: boolean,
    pipelineFn: (doc: any) => any,
    addXmlFile: (info: AddXmlFileData) => void,
    removeXmlFile: (hash: string) => void,
    setPipeline: (p: List) => void,
    setPreviewHash: (h: string) => void,
    togglePreview: (p: boolean) => void,
} & RouteProps;

const UploadFiles = lazy(() => import("./upload-files.jsx"));
const AsyncUploadFiles = function AsyncUploadFiles(props) {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <ErrorCatcher>
                <UploadFiles {...props} />
            </ErrorCatcher>
        </Suspense>
    );
};
const SelectRecipes = lazy(() => import("./select-recipes.jsx"));
const AsyncSelectRecipes = props => {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <ErrorCatcher>
                <SelectRecipes {...props} />
            </ErrorCatcher>
        </Suspense>
    );
};
const Resultats = lazy(() => import("./resultats.jsx"));
const AsyncResultats = props => {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <ErrorCatcher>
                <Resultats {...props} />
            </ErrorCatcher>
        </Suspense>
    );
};

const getUploadFilesProps = (props: Props) => {
    const { xmlFiles, corrections, addXmlFile, removeXmlFile } = props;
    return { xmlFiles, corrections, addXmlFile, removeXmlFile };
};

export default class App extends React.PureComponent<Props> {
    render() {
        const hasXmlFiles = this.props.xmlFiles.size > 0;
        const hasPipeline = this.props.pipeline.size > 0;
        return (
            <>
                <MenuBar />
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={routeProps => <StartButton hasXmlFiles={hasXmlFiles} {...routeProps} />}
                    />
                    <Route
                        path="/upload"
                        render={routeProps => <AsyncUploadFiles {...getUploadFilesProps(this.props)} {...routeProps} />}
                    />
                    <Route
                        path="/recettes"
                        render={routeProps =>
                            hasXmlFiles ? <AsyncSelectRecipes {...this.props} {...routeProps} /> : <Redirect to="/" />
                        }
                    />
                    <Route
                        path="/resultats"
                        render={routeProps =>
                            hasXmlFiles ? (
                                hasPipeline ? (
                                    <AsyncResultats {...this.props} {...routeProps} />
                                ) : (
                                    <Redirect to="/recettes" />
                                )
                            ) : (
                                <Redirect to="/upload" />
                            )
                        }
                    />
                </Switch>
            </>
        );
    }
}
