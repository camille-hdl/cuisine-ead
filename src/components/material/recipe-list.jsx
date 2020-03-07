//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import { List as ImmutableList, Map } from "immutable";
import { map } from "ramda";
import Switch from "@material-ui/core/Switch";
import { getLabel, getComplement, getDefaultArgs } from "../../lib/recipes/recipes-lib.js";
import RecipeArgs from "../recipes-args/recipe-args.jsx";
import { makeRecipeInPipelineRecord } from "../../lib/record-factories.js";
import type { RecipeInPipelineRecord } from "../../types.js";

const styles = theme => ({
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    list: {
        backgroundColor: theme.palette.background.paper,
    },
    margin: {
        margin: theme.spacing(2),
    },
    padding: {
        padding: `0 ${theme.spacing(2)}px`,
    },
});

type Props = {
    availableRecipes: Array<{ key: string }>,
    pipeline: ImmutableList<RecipeInPipelineRecord>,
    classes: any,
    setPipeline: (pipeline: ImmutableList<RecipeInPipelineRecord>) => void,
};

/**
 * List of available recipes
 */
class RecipeList extends React.PureComponent<Props> {
    isChecked = recipeKey => {
        return this.props.pipeline.map(r => r.get("key")).includes(recipeKey);
    };
    handleToggle = recipe => () => {
        this.props.setPipeline(
            this.isChecked(recipe)
                ? this.props.pipeline.filter(r => r.get("key") !== recipe)
                : this.props.pipeline.push(
                      makeRecipeInPipelineRecord({
                          key: recipe,
                          args: Map(getDefaultArgs(recipe)),
                      })
                  )
        );
    };
    render() {
        const { classes, availableRecipes } = this.props;
        return (
            <div className={classes.root}>
                <div className={classes.list}>
                    <List dense={false}>
                        {map(
                            recipe => (
                                <ListItem key={recipe.key} button={true} onClick={this.handleToggle(recipe.key)}>
                                    <ListItemText
                                        data-cy={"recipe-key"}
                                        primary={getLabel(recipe.key)}
                                        secondary={
                                            <>
                                                {getComplement(recipe.key)}
                                                {this.isChecked(recipe.key) ? (
                                                    <RecipeArgs
                                                        recipe={recipe.key}
                                                        args={this.props.pipeline
                                                            .find(r => r.get("key") === recipe.key)
                                                            .get("args")}
                                                        setArgs={(args: Map<string, mixed>) => {
                                                            /**
                                                             * Updates the arguments of the recipe in the pipeline
                                                             */
                                                            this.props.setPipeline(
                                                                this.props.pipeline.update(pipeline =>
                                                                    pipeline.map(r => {
                                                                        if (r.get("key") === recipe.key)
                                                                            return r.set("args", args);
                                                                        return r;
                                                                    })
                                                                )
                                                            );
                                                        }}
                                                    />
                                                ) : null}
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            onChange={this.handleToggle(recipe.key)}
                                            checked={this.isChecked(recipe.key)}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ),
                            availableRecipes
                        )}
                    </List>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(RecipeList);
