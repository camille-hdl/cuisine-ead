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
const getTitleProper = (doc: Document): string => {
    const tags = xpathFilter(doc, "//titleproper");
    return tags.length > 0 && head(tags) ? head(tags).textContent : "";
};

function SelectPreviewFile(props: {
    classes: any,
    xmlFiles: IList<Map<string, mixed>>,
    previewHash: string | null,
    previewXmlFile: Map<string, mixed> | null,
    setPreviewHash: (hash: string | null) => void,
}) {
    const { classes } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const selectedFile = props.previewXmlFile ? props.previewXmlFile : props.xmlFiles.first();
    if (!selectedFile) {
        return null;
    }
    const selectedDocument = selectedFile.get("doc");
    if (!(selectedDocument instanceof Document)) {
        return null;
    }
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
                        secondary={getTitleProper(selectedDocument) || selectedFile.get("filename")}
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
                {map(xmlFile => {
                    const hash = xmlFile.get("hash") ? String(xmlFile.get("hash")) : String(Math.random());
                    const doc = xmlFile.get("doc");
                    const filename =
                        typeof xmlFile.get("filename") === "string" ? xmlFile.get("filename") : "no-filename";
                    return (
                        <MenuItem
                            key={hash}
                            disabled={false}
                            selected={xmlFile.get("hash") === props.previewHash}
                            onClick={ev => {
                                props.setPreviewHash(hash);
                                setAnchorEl(null);
                            }}
                        >
                            {doc instanceof Document ? getTitleProper(doc) || filename : filename}
                        </MenuItem>
                    );
                }, props.xmlFiles.toArray())}
            </Menu>
        </div>
    );
}

export default withStyles(styles)(SelectPreviewFile);
