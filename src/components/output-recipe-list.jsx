//@flow
import React from "react";
import { List as ImmutableList, Map } from "immutable";
import { map } from "ramda";

type Props = {
    availableRecipes: Array<{ key: string, label: string }>,
    outputPipeline: ImmutableList<Map<string, mixed>>,
    setOutputPipeline: (outputPipeline: ImmutableList<Map<string, mixed>>) => void,
};

/**
 * List of available output recipes
 */
export default class OutputRecipeList extends React.PureComponent<Props> {
    isChecked = (recipeKey) => {
        return this.props.outputPipeline.map((r) => r.get("key")).includes(recipeKey);
    };
    handleToggle = (recipe) => () => {
        this.props.setOutputPipeline(
            this.isChecked(recipe.key)
                ? this.props.outputPipeline.filter((r) => r.get("key") !== recipe.key)
                : this.props.outputPipeline.push(Map(recipe))
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
                                    id={`output-recipe-${recipe.key}`}
                                    type="checkbox"
                                    onChange={this.handleToggle(recipe)}
                                    checked={this.isChecked(recipe.key)}
                                />
                                <label htmlFor={`output-recipe-${recipe.key}`}>
                                    <span className="recipe-label" data-cy={"output-recipe-key"}>
                                        {recipe.label}
                                    </span>
                                </label>
                            </div>
                        </li>
                    ),
                    availableRecipes
                )}
            </ul>
        );
    }
}
