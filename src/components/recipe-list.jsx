//@flow
import React from "react";
import { List as ImmutableList, Map } from "immutable";
import { map } from "ramda";
import { getLabel, getComplement, getDefaultArgs } from "../lib/recipes/recipes-lib.js";
import RecipeArgs from "./recipes-args/recipe-args.jsx";
import { makeRecipeInPipelineRecord } from "../lib/record-factories.js";
import type { RecipeInPipelineRecord } from "../types.js";

type Props = {
    availableRecipes: Array<{ key: string }>,
    pipeline: ImmutableList<RecipeInPipelineRecord>,
    setPipeline: (pipeline: ImmutableList<RecipeInPipelineRecord>) => void,
};

/**
 * List of available recipes
 */
export default class RecipeList extends React.PureComponent<Props> {
    isChecked = (recipeKey) => {
        return this.props.pipeline.map((r) => r.get("key")).includes(recipeKey);
    };
    handleToggle = (recipe) => () => {
        this.props.setPipeline(
            this.isChecked(recipe)
                ? this.props.pipeline.filter((r) => r.get("key") !== recipe)
                : this.props.pipeline.push(
                      makeRecipeInPipelineRecord({
                          key: recipe,
                          args: Map(getDefaultArgs(recipe)),
                      })
                  )
        );
    };
    render() {
        const { availableRecipes } = this.props;
        return (
            <ul className="recipe-list">
                {map(
                    (recipe) => (
                        <li key={recipe.key}>
                            <div className="recipe-row">
                                <input
                                    id={`recipe-${recipe.key}`}
                                    type="checkbox"
                                    onChange={this.handleToggle(recipe.key)}
                                    checked={this.isChecked(recipe.key)}
                                />
                                <label htmlFor={`recipe-${recipe.key}`}>
                                    <span className="recipe-label" data-cy={"recipe-key"} data-recipe-key={recipe.key}>
                                        {getLabel(recipe.key)}
                                    </span>
                                    <span className="recipe-complement">{getComplement(recipe.key)}</span>
                                </label>
                            </div>
                            {this.isChecked(recipe.key) ? (
                                <RecipeArgs
                                    recipe={recipe.key}
                                    args={this.props.pipeline.find((r) => r.get("key") === recipe.key).get("args")}
                                    setArgs={(args: Map<string, mixed>) => {
                                        /**
                                         * Updates the arguments of the recipe in the pipeline
                                         */
                                        this.props.setPipeline(
                                            this.props.pipeline.update((pipeline) =>
                                                pipeline.map((r) => {
                                                    if (r.get("key") === recipe.key) return r.set("args", args);
                                                    return r;
                                                })
                                            )
                                        );
                                    }}
                                />
                            ) : null}
                        </li>
                    ),
                    availableRecipes
                )}
            </ul>
        );
    }
}
