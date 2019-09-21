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
import Icon from "@material-ui/core/Icon";
import { List as ImmutableList, Map } from "immutable";
import { map, head } from "ramda";
import { xpathFilter } from "../../lib/xml.js";

const styles = theme => ({
    root: {
        flexGrow: 1,
        margin: "auto",
        maxWidth: 720,
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
    },
});

type Props = {
    xmlFiles: ImmutableList<Map<string, mixed>>,
    classes: any,
    onRemove: (file: Map<string, mixed>) => void,
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
                <div className={classes.paper}>
                    <List dense={false}>
                        {map(xmlFile => {
                            const hash = xmlFile.get("hash") ? String(xmlFile.get("hash")) : String(Math.random());
                            const doc = xmlFile.get("doc");
                            const filename = xmlFile.get("filename") ? String(xmlFile.get("filename")) : "no-filename";
                            const encoding = xmlFile.get("encoding")
                                ? String(xmlFile.get("encoding"))
                                : "encodage introuvable";
                            return (
                                <ListItem key={hash}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <Icon>book</Icon>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        data-cy="file-list-text"
                                        primary={doc instanceof Document ? getTitleProper(doc) || filename : filename}
                                        secondary={`${filename} - ${encoding}`}
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
                            );
                        }, this.props.xmlFiles.toArray())}
                    </List>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(FileList);
