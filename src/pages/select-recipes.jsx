//@flow
/**
 * View on which the user picks which operation to add to the pipeline and
 * preview the changes on a file
 */

import React from "react";
import { List, Map } from "immutable";
import { getRecipes, getStatefulRecipes } from "../lib/recipes/index.js";
import { getRecipes as getOutputRecipes } from "../lib/output-recipes.js";
import RecipeList from "../components/recipe-list.jsx";
import OutputRecipeList from "../components/output-recipe-list.jsx";
import { Link as RouterLink } from "react-router-dom";
import PreviewLayout from "../components/preview-layout.jsx";
import ReactDiffViewer from "react-diff-viewer-continued";
import { uniq, sortBy, equals, ascend, map, filter } from "ramda";
import useMedia from "react-use/lib/useMedia";
import ErrorCatcher from "../components/error-catcher.jsx";
import Steps from "../components/steps.jsx";
import SelectPreviewFile from "../components/select-preview.jsx";
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

const diffStyles = {
    variables: {
        light: {
            diffViewerBackground: "#fff9f2",
            diffViewerColor: "#262a33",
            addedBackground: "#e6f2ea",
            addedColor: "#262a33",
            removedBackground: "#f6e6ea",
            removedColor: "#262a33",
            wordAddedBackground: "#cfe6d6",
            wordRemovedBackground: "#ecc9d1",
            addedGutterBackground: "#d7eadc",
            removedGutterBackground: "#f0d4d8",
            gutterBackground: "#f7e7d8",
            gutterBackgroundDark: "#f2dfce",
            highlightBackground: "#efdcca",
            highlightGutterBackground: "#efdcca",
            codeFoldGutterBackground: "#f2dfce",
            codeFoldBackground: "#f7e7d8",
            emptyLineBackground: "#fff9f2",
            gutterColor: "#6b6259",
            addedGutterColor: "#00733a",
            removedGutterColor: "#990f3d",
            codeFoldContentColor: "#4a4f59",
            diffViewerTitleBackground: "#f7e7d8",
            diffViewerTitleColor: "#262a33",
            diffViewerTitleBorderColor: "#b8afa5",
        },
    },
};

/**
 * See src/pages/app.jsx
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

export default function SelectRecipes(props: Props) {
    const isWide = useMedia("(min-width: 920px)");
    const backLink = (
        <RouterLink to="/" data-cy="prev-step-link" className="btn">
            {"← Fichiers"}
        </RouterLink>
    );
    const nextLink = (
        <RouterLink to="/resultats" data-cy="next-step-link" className="btn btn-primary">
            {"Résultats →"}
        </RouterLink>
    );
    if (typeof window.__E2E__ !== "undefined") {
        window.__E2E_addAllRecipes = () => {
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
            <div className="page page--preview">
                <PreviewLayout
                    drawer={
                        <>
                            <button
                                type="button"
                                className="btn"
                                data-cy="preview-exit"
                                onClick={() => {
                                    props.togglePreview(!props.previewEnabled);
                                }}
                                aria-label="Sortir de la comparaison"
                            >
                                Fermer la comparaison
                            </button>
                            <SelectPreviewFile {...props} />
                            <section className="recipe-group" aria-label="Recettes">
                                <RecipeList {...props} availableRecipes={availableRecipes} />
                            </section>
                            <section className="recipe-group" aria-label="Corrections">
                                <h2>{`${props.correctionsNb} corrections de controlaccess disponibles`}</h2>
                                <RecipeList {...props} availableRecipes={availaleStatefulRecipes} />
                            </section>
                            <section className="recipe-group" aria-label="Assaisonnements">
                                <h2>Assaisonnements</h2>
                                <OutputRecipeList {...props} availableRecipes={availableOutputRecipes} />
                            </section>
                        </>
                    }
                >
                    {props.previewXmlFile && props.pipeline.size > 0 ? (
                        <>
                            <p className="notice notice-info" data-cy="preview-warning">
                                <strong>
                                    {
                                        "La comparaison ne montre que les ~600 premières lignes pour éviter de bloquer votre navigateur, ce qui peut provoquer des bizarreries."
                                    }
                                </strong>
                            </p>
                            <div className="diff-chrome">
                                <ReactDiffViewer
                                    splitView={isWide}
                                    oldValue={props.previewXmlFile.get("string")}
                                    newValue={props.previewXmlString}
                                    styles={diffStyles}
                                />
                            </div>
                        </>
                    ) : (
                        <p className="notice notice-warning" role="status">
                            {"Choisissez au moins une recette pour comparer avant et après."}
                        </p>
                    )}
                </PreviewLayout>
            </div>
        );
    }
    return (
        <div className="page">
            <ErrorCatcher>
                <Steps activeStep={1} canNavigate={true}>
                    {backLink}
                    {nextLink}
                </Steps>
            </ErrorCatcher>
            <h1>Choisir les recettes</h1>
            <p className="lede">Cochez ce que vous voulez appliquer. Vous pourrez comparer le résultat ensuite.</p>
            <label className="preview-toggle">
                <input
                    type="checkbox"
                    data-cy="toggle-preview"
                    checked={props.previewEnabled}
                    onChange={() => {
                        props.togglePreview(!props.previewEnabled);
                    }}
                />
                Comparaison avant → après
            </label>
            <div className="recipe-grid">
                {map((r) => {
                    return (
                        <section className="recipe-group" key={r.category}>
                            <h2>{r.category}</h2>
                            <RecipeList {...props} availableRecipes={r.recipes} />
                        </section>
                    );
                }, recipesByCategories)}
                <section className="recipe-group" key={"stateful-recipes"}>
                    <h2>{`${props.correctionsNb} corrections de controlaccess disponibles`}</h2>
                    <RecipeList {...props} availableRecipes={availaleStatefulRecipes} />
                </section>
                <section className="recipe-group" key={"output-recipes"}>
                    <h2>Assaisonnements</h2>
                    <OutputRecipeList {...props} availableRecipes={availableOutputRecipes} />
                </section>
            </div>
        </div>
    );
}
