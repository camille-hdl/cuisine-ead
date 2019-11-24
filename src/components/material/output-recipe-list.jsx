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
    availableRecipes: Array<{ key: string, label: string }>,
    outputPipeline: ImmutableList<Map<string, mixed>>,
    classes: any,
    setOutputPipeline: (outputPipeline: ImmutableList<Map<string, mixed>>) => void,
};

/**
 * List of available output recipes
 */
class OutputRecipeList extends React.PureComponent<Props> {
    isChecked = recipeKey => {
        return this.props.outputPipeline.map(r => r.get("key")).includes(recipeKey);
    };
    handleToggle = recipe => () => {
        this.props.setOutputPipeline(
            this.isChecked(recipe.key)
                ? this.props.outputPipeline.filter(r => r.get("key") !== recipe.key)
                : this.props.outputPipeline.push(Map(recipe))
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
                                <ListItem key={recipe.key} button={true} onClick={this.handleToggle(recipe)}>
                                    <ListItemText data-cy={"output-recipe-key"} primary={recipe.label} />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            onChange={this.handleToggle(recipe)}
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

export default withStyles(styles)(OutputRecipeList);
