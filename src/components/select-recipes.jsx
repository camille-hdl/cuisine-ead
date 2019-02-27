//@flow
import React from "react";
import PaperSheet from "./material/paper-sheet.jsx";
import type { List, Map } from "immutable";
import Grid from "./material/grid.jsx";
import { getRecipes } from "../lib/recipes.js";
import RecipeList from "./material/recipe-list.jsx";
import { Link as RouterLink } from "react-router-dom";
import ResponsiveDrawer from "./material/resp-drawer.jsx";
import ReactDiffViewer from "react-diff-viewer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
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
const PreviousStepLink = props => <RouterLink to="/upload" {...props} data-cy="prev-step-link" />;
const NextStepLink = props => <RouterLink to="/resultats" {...props} data-cy="next-step-link" />;

/**
 * Pick which operation to add to the pipeline and preview the changes on a file
 */
export default function SelectRecipes(props: Props) {
    const isWide = useMedia("(min-width: 920px");
    const backLink = <OutlinedButton linkComponent={PreviousStepLink}>{"← fichiers"}</OutlinedButton>;
    const nextLink = (
        <OutlinedButton
            linkComponent={NextStepLink}
            style={{ visibility: props.pipeline.size > 0 ? "visible" : "hidden" }}
        >
            {"résultats →"}
        </OutlinedButton>
    );
    if (props.previewEnabled) {
        return (
            <ResponsiveDrawer
                drawer={
                    <>
                        <div>
                            <IconButton
                                data-cy="preview-exit"
                                onClick={() => {
                                    props.togglePreview(!props.previewEnabled);
                                }}
                                aria-label="Sortir de la comparaison"
                            >
                                <Icon>clear</Icon>
                            </IconButton>
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
                            <Typography variant="subtitle1" data-cy="preview-warning">
                                <strong>
                                    {
                                        "La comparaison ne montre que les ~600 premières lignes pour éviter de bloquer votre navigateur 🐌"
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
                    <Typography variant="h5">{"⚠️ Vous devez choisir des recettes"}</Typography>
                )}
            </ResponsiveDrawer>
        );
    }
    const recipesSplit = splitEvery(5, availableRecipes);
    return (
        <Grid container spacing={24}>
            <PaperSheet xs={12}>
                <ErrorCatcher>
                    <AppStepper activeStep={1}>
                        {backLink}
                        {nextLink}
                    </AppStepper>
                </ErrorCatcher>
            </PaperSheet>
            <Grid idem xs={12}>
                <div style={{ margin: "20px" }}>
                    <FormControlLabel
                        control={
                            <Switch
                                data-cy="toggle-preview"
                                checked={props.previewEnabled}
                                onChange={() => {
                                    props.togglePreview(!props.previewEnabled);
                                }}
                                value="Comparaison avant → après"
                            />
                        }
                        label="Comparaison avant → après 👀"
                    />
                </div>
            </Grid>
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
        </Grid>
    );
}
