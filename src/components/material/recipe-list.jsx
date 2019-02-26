//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
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
    title: {
        margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
    },
    margin: {
        margin: theme.spacing.unit * 2,
    },
    padding: {
        padding: `0 ${theme.spacing.unit * 2}px`,
    },
});

type Props = {
    availableRecipes: Array<{ key: string }>,
    pipeline: List,
    classes: any,
    setPipeline: (pipeline: List) => void,
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
                      Map({
                          key: recipe,
                          args: Map({}),
                      })
                  )
        );
    };
    render() {
        const { classes, availableRecipes } = this.props;
        const heading = (
            <Typography variant="h6" className={classes.title}>
                Recettes
            </Typography>
        );
        return (
            <div className={classes.root}>
                {heading}
                <div className={classes.list}>
                    <List dense={false}>
                        {map(
                            recipe => (
                                <ListItem key={recipe.key}>
                                    <ListItemText primary={recipe.key} />
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