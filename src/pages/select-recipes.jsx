//@flow
/**
 * View on which the user picks which operation to add to the pipeline and
 * preview the changes on a file
 */

import React, { forwardRef } from "react";
import PaperSheet from "../components/material/paper-sheet.jsx";
import { List, Map } from "immutable";
import Grid from "../components/material/grid.jsx";
import { getRecipes, getStatefulRecipes } from "../lib/recipes/index.js";
import { getRecipes as getOutputRecipes } from "../lib/output-recipes.js";
import RecipeList from "../components/material/recipe-list.jsx";
import OutputRecipeList from "../components/material/output-recipe-list.jsx";
import { Link as RouterLink } from "react-router-dom";
import ResponsiveDrawer from "../components/material/resp-drawer.jsx";
import ReactDiffViewer from "react-diff-viewer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Switch from "@material-ui/core/Switch";
import OutlinedButton from "../components/material/outlined-button.jsx";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import { uniq, sortBy, equals, ascend, map, filter } from "ramda";
import useMedia from "react-use/lib/useMedia";
import ErrorCatcher from "../components/error-catcher.jsx";
import AppStepper from "../components/material/stepper.jsx";
import SelectPreviewFile from "../components/material/select-preview.jsx";
import { getCategory, getDefaultArgs } from "../lib/recipes/recipes-lib.js";
import { makeRecipeInPipelineRecord } from "../lib/record-factories.js";

const availableRecipes = getRecipes();
const availaleStatefulRecipes = getStatefulRecipes();
//TODO: fix flow
//$FlowFixMe
const categories = sortBy(ascend)(uniq(map((r) => getCategory(r.key), availableRecipes)));
/**
 * Partition recipes by category
 * for presentation
 */
const recipesByCategories = map((c) => {
    return {
        category: c,
        //$FlowFixMe
        recipes: sortBy(ascend)(filter((r) => equals(c, getCategory(r.key)), availableRecipes)),
    };
}, categories);
const availableOutputRecipes = getOutputRecipes();

/**
 * See src/components/app.jsx
 */
type Props = {
    pipeline: List<Map<string, mixed>>,
    outputPipeline: List<Map<string, mixed>>,
    previewXmlFile: Map<string, mixed> | null,
    previewXmlString: string | null,
    xmlFiles: List<Map<string, mixed>>,
    previewEnabled: boolean,
    corrections: Map<string, mixed>,
    correctionsNb: number,
    togglePreview: (p: boolean) => void,
    pipelineFn: (doc: any) => any,
    outputPipelineFn: (doc: any) => any,
    setPipeline: (p: List<mixed>) => void,
    setOutputPipeline: (p: List<mixed>) => void,
    setPreviewHash: (h: string) => void,
};
const PreviousStepLink = forwardRef(function PreviousStepLink(props, ref) {
    return <RouterLink to="/upload" {...props} data-cy="prev-step-link" ref={ref} />;
});
const NextStepLink = forwardRef(function NextStepLink(props, ref) {
    return <RouterLink to="/resultats" {...props} data-cy="next-step-link" ref={ref} />;
});

export default function SelectRecipes(props: Props) {
    const isWide = useMedia("(min-width: 920px");
    const backLink = <OutlinedButton linkComponent={PreviousStepLink}>{"← fichiers"}</OutlinedButton>;
    const nextLink = (
        <OutlinedButton
            linkComponent={NextStepLink}
        >
            {"résultats →"}
        </OutlinedButton>
    );
    if (typeof window.Cypress !== "undefined") {
        window.__CYPRESS_addAllRecipes = () => {
            props.setPipeline(
                props.pipeline.concat(
                    List(
                        availableRecipes.map((recipe) => {
                            return makeRecipeInPipelineRecord({
                                key: recipe.key,
                                args: Map(getDefaultArgs(recipe.key)),
                            });
                        })
                    ),
                    List(
                        availaleStatefulRecipes.map((recipe) => {
                            return makeRecipeInPipelineRecord({
                                key: recipe.key,
                                args: Map(getDefaultArgs(recipe.key)),
                            });
                        })
                    )
                )
            );
        };
    }
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
                        <Divider />
                        <Typography variant="h6">{`${props.correctionsNb} corrections de controlaccess disponibles`}</Typography>
                        <RecipeList {...props} availableRecipes={availaleStatefulRecipes} />
                        <Divider />
                        <Typography variant="h6">{"Assaisonnements"}</Typography>
                        <OutputRecipeList {...props} availableRecipes={availableOutputRecipes} />
                    </>
                }
            >
                {props.previewXmlFile && props.pipeline.size > 0 ? (
                    props.previewEnabled ? (
                        <>
                            <Typography variant="body1" data-cy="preview-warning">
                                <strong>
                                    {
                                        "La comparaison ne montre que les ~600 premières lignes pour éviter de bloquer votre navigateur 🐌, ce qui peut provoquer des bizarreries"
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
    return (
        <Grid container>
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
                <Grid container>
                    {map((r) => {
                        return (
                            <PaperSheet xs={12} sm={6} key={r.category}>
                                <Typography variant="h6">{r.category}</Typography>
                                <RecipeList {...props} availableRecipes={r.recipes} />
                            </PaperSheet>
                        );
                    }, recipesByCategories)}
                    <PaperSheet xs={12} sm={6} key={"stateful-recipes"}>
                        <Typography variant="h6">{`${props.correctionsNb} corrections de controlaccess disponibles`}</Typography>
                        <RecipeList {...props} availableRecipes={availaleStatefulRecipes} />
                    </PaperSheet>
                    <PaperSheet xs={12} sm={6} key={"output-recipes"}>
                        <Typography variant="h6">{"Assaisonnements"}</Typography>
                        <OutputRecipeList {...props} availableRecipes={availableOutputRecipes} />
                    </PaperSheet>
                </Grid>
            </Grid>
        </Grid>
    );
}
