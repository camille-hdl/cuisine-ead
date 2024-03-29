//@flow
/**
 * Main component of the app.
 * Handles routing and views
 */
import React, { Suspense, lazy } from "react";
import MenuBar from "../components/material/menu-bar.jsx";
import { List } from "immutable";
import { Route, Routes, Navigate } from "react-router-dom";
import LoadingComponent from "../components/material/loading-component.jsx";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import type { AddXmlFileData, ComputedStateProps, RecipeInPipelineRecord } from "../types.js";
import ErrorCatcher from "../components/error-catcher.jsx";
import FloatingButtons from "../components/floating-buttons.jsx";
import { Workbox } from "workbox-window";
import UploadFiles from "./upload-files.jsx";

const muiTheme = createMuiTheme({
    typography: {},
});

/**
 * react-router Route
 */
type RouteProps = {|
    location: {
        pathname: string,
    },
    history: any,
    match: any,
|};

/**
 * Props provided by the container src/containers/app.jsx
 */
export type Props = {
    ...ComputedStateProps,
    ...RouteProps,
    /**
     * Function that maps xml strings to processed xml strings,
     * givent the current settings
     */
    outputPipelineFn: (xmlStr: string) => string,
    addXmlFile: (info: AddXmlFileData) => void,
    removeXmlFile: (hash: string) => void,
    /**
     * Updates the recipes to apply to `Document`s
     */
    setPipeline: (p: List<RecipeInPipelineRecord>) => void,
    /**
     * Updates the recipes to apply to xml strings
     */
    setOutputPipeline: (p: List<RecipeInPipelineRecord>) => void,
    /**
     * Defines which file is being previewed
     */
    setPreviewHash: (h: string) => void,
    togglePreview: (p: boolean) => void,
    /**
     * Updates the corrections map
     */
    updateCorrections: (corrections: Array<string>) => void,
    /**
     * Indicates to the user that he should refresh the page
     */
    setNewVersionAvailable: (toggle: boolean) => void,
};

const SelectRecipes = lazy(() => import("./select-recipes.jsx"));
/**
 * View on which the user chooses which recipes they want
 * to apply
 */
const AsyncSelectRecipes = (props) => {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <ErrorCatcher>
                <SelectRecipes {...props} />
            </ErrorCatcher>
        </Suspense>
    );
};
const Results = lazy(() => import("./results.jsx"));
/**
 * View on which the user can download processed files
 */
const AsyncResults = (props) => {
    return (
        <Suspense fallback={<LoadingComponent />}>
            <ErrorCatcher>
                <Results {...props} />
            </ErrorCatcher>
        </Suspense>
    );
};

/**
 * Main component.
 * Handles react-router and displays the current view
 */
export default class App extends React.PureComponent<Props> {
    componentDidMount() {
        if (navigator && navigator.serviceWorker) {
            /**
             * Vérifier qu'une nouvelle version n'est pas disponible
             */
            const wb = new Workbox("/js/esm/sw.js", { scope: "/" });
            wb.addEventListener("activated", (event) => {
                if (event.isUpdate) {
                    this.props.setNewVersionAvailable(true);
                }
            });
            wb.register();
        }
    }
    render() {
        const hasXmlFiles = this.props.xmlFiles.size > 0;
        return (
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                <MenuBar version={this.props.version} newVersionAvailable={this.props.newVersionAvailable} />
                <Routes>
                    <Route path="/" element={<UploadFiles {...this.props} />}></Route>
                    <Route path="/upload" element={<UploadFiles {...this.props} />}></Route>
                    <Route
                        path="/recettes"
                        element={
                            hasXmlFiles ? <AsyncSelectRecipes {...this.props} /> : <Navigate to="/" />
                        }
                    />
                    <Route
                        path="/resultats"
                        element={hasXmlFiles ? <AsyncResults {...this.props} /> : <Navigate to="/" />}
                    />
                </Routes>
                <FloatingButtons {...this.props} />
            </MuiThemeProvider>
        );
    }
}
