//@flow
/**
 * Main component of the app.
 * Handles routing and views
 */
import React, { Suspense, lazy } from "react";
import MenuBar from "./material/menu-bar.jsx";
import { List, Map } from "immutable";
import { Route, Switch, Redirect } from "react-router-dom";
import LoadingComponent from "./material/loading-component.jsx";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import type { AddXmlFileData } from "../types.js";
import StartPage from "./start-page.jsx";
import ErrorCatcher from "./error-catcher.jsx";

const muiTheme = createMuiTheme({
    typography: { useNextVariants: true },
});

/**
 * react-router Route
 */
type RouteProps = {
    location: {
        pathname: string,
    },
    history: any,
    match: any,
};

/**
 * Props provided by the container src/containers/app.jsx
 */
export type Props = {
    /**
     * Version of the app.
     * Can be use to validate restored state.
     */
    version: string,
    /**
     * List of Files to be processed
     */
    xmlFiles: List,
    /**
     * List of recipes (and their settings) to apply to `Document`s
     */
    pipeline: List,
    /**
     * List of recipes to apply to xml strings (applied after `pipeline`)
     */
    outputPipeline: List,
    /**
     * Map of corrections to apply to the files
     * see src/lib/corrections-parser.js
     */
    corrections: Map,
    /**
     * File currectly being previewed.
     */
    previewXmlFile: Map | null,
    /**
     * String reprensentation of the file being previewed
     */
    previewXmlString: string | null,
    previewEnabled: boolean,
    /**
     * Object representation of the pipeline, outputPipeline and version.
     * Can be exported to JSON
     */
    fullRecipe: Map,
    /**
     * Approximate number of available corrections (to be displayed)
     */
    correctionsNb: number,
    /**
     * Function that maps `Document`s to processed `Document`s,
     * given the current recipes and settings
     */
    pipelineFn: (doc: any) => any,
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
    setPipeline: (p: List) => void,
    /**
     * Updates the recipes to apply to xml strings
     */
    setOutputPipeline: (p: List) => void,
    /**
     * Defines which file is being previewed
     */
    setPreviewHash: (h: string) => void,
    togglePreview: (p: boolean) => void,
    /**
     * Updates the corrections map
     */
    updateCorrections: (corrections: Array<string>) => void,
} & RouteProps;

const UploadFiles = lazy(() => import("./upload-files.jsx"));
/**
 * View on which the user can drag & drop files
 * to be processed
 */
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
/**
 * View on which the user chooses which recipes they want
 * to apply
 */
const AsyncSelectRecipes = props => {
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
const AsyncResults = props => {
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
    render() {
        const hasXmlFiles = this.props.xmlFiles.size > 0;
        const hasPipeline = this.props.pipeline.size > 0;
        return (
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                <MenuBar version={this.props.version} />
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={routeProps => <StartPage hasXmlFiles={hasXmlFiles} {...routeProps} />}
                    />
                    <Route path="/upload" render={routeProps => <AsyncUploadFiles {...this.props} {...routeProps} />} />
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
                                    <AsyncResults {...this.props} {...routeProps} />
                                ) : (
                                    <Redirect to="/recettes" />
                                )
                            ) : (
                                <Redirect to="/upload" />
                            )
                        }
                    />
                </Switch>
            </MuiThemeProvider>
        );
    }
}
