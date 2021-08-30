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
export function getTitleProper (doc: Document): string {
    const tags = xpathFilter(doc, "//titleproper");
    return tags.length > 0 && head(tags) ? head(tags).textContent : "";
};

function SelectFile(props: {
    classes: any,
    title: string,
    xmlFiles: IList<Map<string, mixed>>,
    selectedFile: Map<string, mixed> | null,
    emptyProposition?: boolean,
    onChange: (selectedXmlFile: Map<string, mixed> | null) => void,
}) {
    const { classes, title, onChange, xmlFiles, selectedFile, emptyProposition } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    return (
        <div className={classes.root}>
            <List component="nav">
                <ListItem
                    button
                    aria-haspopup="true"
                    aria-controls="file-select"
                    aria-label={title}
                    onClick={ev => setAnchorEl(ev.currentTarget)}
                >
                    <ListItemText
                        primary={title}
                        secondary={selectedFile ? getTitleProper(selectedFile.get("doc")) || selectedFile.get("filename") : ""}
                    />
                </ListItem>
            </List>
            <Menu
                id="file-select"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null);
                }}
            >
                {emptyProposition ? (
                    <MenuItem
                        key="empty"
                        disabled={false}
                        selected={!selectedFile}
                        onClick={ev => {
                            onChange(null);
                            setAnchorEl(null);
                        }}
                        >
                            {""}
                        </MenuItem>
                ) : null}
                {map(xmlFile => {
                    const hash = xmlFile.get("hash") ? String(xmlFile.get("hash")) : String(Math.random());
                    const doc = xmlFile.get("doc");
                    const filename =
                        typeof xmlFile.get("filename") === "string" ? xmlFile.get("filename") : "no-filename";
                    return (
                        <MenuItem
                            key={hash}
                            disabled={false}
                            selected={xmlFile === selectedFile}
                            onClick={ev => {
                                onChange(xmlFile);
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

export default withStyles(styles)(SelectFile);
