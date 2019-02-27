//@flow
import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import type { List as IList } from "immutable";
import { map, head } from "ramda";
import { xpathFilter } from "../../lib/xml.js";

const styles = theme => ({
    root: {
        width: "100%",
        backgroundColor: theme.palette.background.paper,
    },
});

/**
 * Retourne le texte de la balise "titleproper"
 */
const getTitleProper = (doc: any): string => {
    const tags = xpathFilter(doc, "//titleproper");
    return tags.length > 0 && head(tags) ? head(tags).textContent : "";
};

function SelectPreviewFile(props: { classes: any, xmlFiles: IList, previewHash: string | null }) {
    const { classes } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    return (
        <div className={classes.root}>
            <List component="nav">
                <ListItem
                    button
                    aria-haspopup="true"
                    aria-controls="preview-select"
                    aria-label="Fichier sélectionné"
                    onClick={ev => setAnchorEl(ev.currentTarget)}
                >
                    <ListItemText
                        primary={"Fichier sélectionné"}
                        secondary={
                            props.previewXmlFile
                                ? getTitleProper(props.previewXmlFile.get("doc")) ||
                                  props.previewXmlFile.get("filename")
                                : getTitleProper(props.xmlFiles.first().get("doc")) ||
                                  props.xmlFiles.first().get("filename")
                        }
                    />
                </ListItem>
            </List>
            <Menu
                id="preview-select"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                }}
            >
                {map(
                    xmlFile => (
                        <MenuItem
                            key={xmlFile.get("hash")}
                            disabled={false}
                            selected={xmlFile.get("hash") === props.previewHash}
                            onClick={ev => {
                                props.setPreviewHash(xmlFile.get("hash"));
                                setAnchorEl(null);
                            }}
                        >
                            {getTitleProper(xmlFile.get("doc")) || xmlFile.get("filename")}
                        </MenuItem>
                    ),
                    props.xmlFiles.toArray()
                )}
            </Menu>
        </div>
    );
}

export default withStyles(styles)(SelectPreviewFile);
