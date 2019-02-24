//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Icon from "@material-ui/core/Icon";
import { List as ImmutableList, Map } from "immutable";
import { map, head } from "ramda";
import { xpathFilter } from "../../lib/xml.js";

const styles = theme => ({
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    demo: {
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
    xmlFiles: ImmutableList,
    classes: any,
    onRemove: (file: Map) => void,
};

/**
 * Retourne le texte de la balise "titleproper"
 */
const getTitleProper = (doc: any): string => {
    const tags = xpathFilter(doc, "//titleproper");
    return tags.length > 0 && head(tags) ? head(tags).textContent : "";
};

/**
 * Liste des fichiers xml ajoutés
 */
class FileList extends React.PureComponent<Props> {
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Typography variant="h6" className={classes.title}>
                    Fichiers
                </Typography>
                <div className={classes.demo}>
                    <List dense={false}>
                        {map(
                            xmlFile => (
                                <ListItem key={xmlFile.get("hash")}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <Icon>book</Icon>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={getTitleProper(xmlFile.get("doc")) || xmlFile.get("filename")}
                                        secondary={`${xmlFile.get("filename")} - ${xmlFile.get("encoding")}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            aria-label="Delete"
                                            onClick={ev => {
                                                ev.stopPropagation();
                                                this.props.onRemove(xmlFile);
                                            }}
                                        >
                                            <Icon>delete</Icon>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ),
                            this.props.xmlFiles.toArray()
                        )}
                    </List>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(FileList);
