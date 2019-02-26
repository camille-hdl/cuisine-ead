//@flow
import React from "react";
import PaperSheet from "./material/paper-sheet.jsx";
import type { List, Map } from "immutable";
import Grid from "./material/grid.jsx";
import { getRecipes } from "../lib/recipes.js";
import RecipeList from "./material/recipe-list.jsx";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import ResponsiveDrawer from "./material/resp-drawer.jsx";
import ReactDiffViewer from "react-diff-viewer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import OutlinedButton from "./material/outlined-button.jsx";
import Typography from "@material-ui/core/Typography";
import { splitEvery, map, addIndex } from "ramda";
import useMedia from "react-use/lib/useMedia";
import ErrorCatcher from "./error-catcher.jsx";
import AppStepper from "./material/stepper.jsx";
import SelectPreviewFile from "./material/select-preview.jsx";
const indexedMap = addIndex(map);

const availableRecipes = getRecipes();
type Props = {
    pipeline: List,
    previewXmlFile: Map | null,
    previewXmlString: string | null,
    xmlFiles: List,
    previewEnabled: boolean,
    togglePreview: (p: boolean) => void,
    pipelineFn: (doc: any) => any,
    setPipeline: (p: List) => void,
    setPreviewHash: (h: string) => void,
};
const PreviousStepLink = props => <RouterLink to="/upload" {...props} />;
const NextStepLink = props => <RouterLink to="/resultats" {...props} />;
export default function SelectRecipes(props: Props) {
    const isWide = useMedia("(min-width: 920px");
    const backLink = (
        <OutlinedButton>
            <Link component={PreviousStepLink}>{"← fichiers"}</Link>
        </OutlinedButton>
    );
    const nextLink = (
        <OutlinedButton>
            <Link component={NextStepLink}>{"résultats →"}</Link>
        </OutlinedButton>
    );
    if (props.previewEnabled) {
        return (
            <ResponsiveDrawer
                drawer={
                    <>
                        <div>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={props.previewEnabled}
                                        onChange={() => {
                                            props.togglePreview(!props.previewEnabled);
                                        }}
                                        value="Prévisualisation"
                                    />
                                }
                                label="Prévisualisation (lent)"
                            />
                        </div>
                        <div>
                            <SelectPreviewFile {...props} />
                        </div>
                        <RecipeList {...props} availableRecipes={availableRecipes} />
                    </>
                }
            >
                {props.previewXmlFile && props.pipeline.size > 0 ? (
                    props.previewEnabled ? (
                        <>
                            <Typography variant="subtitle1">
                                <strong>
                                    {
                                        "La prévisualisation ne montre que les 1000 premières lignes pour des raisons de performance"
                                    }
                                </strong>
                            </Typography>
                            <ReactDiffViewer
                                splitView={isWide}
                                oldValue={props.previewXmlFile.get("string")}
                                newValue={props.previewXmlString}
                            />
                        </>
                    ) : null
                ) : (
                    <strong>{"Vous devez ajouter un fichier et des recettes"}</strong>
                )}
            </ResponsiveDrawer>
        );
    }
    const recipesSplit = splitEvery(5, availableRecipes);
    return (
        <Grid container spacing={24}>
            <PaperSheet xs={12}>
                <ErrorCatcher>
                    <AppStepper activeStep={1} />
                </ErrorCatcher>
                <Grid container spacing={24}>
                    <PaperSheet xs={6}>{backLink}</PaperSheet>
                    <PaperSheet xs={6}>{nextLink}</PaperSheet>
                </Grid>
            </PaperSheet>
            <PaperSheet xs={6} />
            <Grid item xs={6} />
            <Grid item xs={12}>
                <Grid container spacing={24}>
                    {indexedMap((chunk, i: number) => {
                        return (
                            <PaperSheet xs={12} sm={6} key={i}>
                                <RecipeList {...props} availableRecipes={chunk} />
                            </PaperSheet>
                        );
                    }, recipesSplit)}
                </Grid>
            </Grid>
            <PaperSheet xs={12}>
                <div>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={props.previewEnabled}
                                onChange={() => {
                                    props.togglePreview(!props.previewEnabled);
                                }}
                                value="Prévisualisation"
                            />
                        }
                        label="Prévisualisation (lent)"
                    />
                </div>
            </PaperSheet>
        </Grid>
    );
}
