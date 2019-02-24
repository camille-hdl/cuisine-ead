//@flow
import React from "react";
import { concat, groupBy, partialRight, includes, forEach } from "ramda";
import PaperSheet from "./material/paper-sheet.jsx";
import type { List, Map } from "immutable";
import Grid from "./material/grid.jsx";

type Props = {
    xmlFiles: List,
    corrections: Map,
    addXmlFile: (info: AddXmlFileData) => void,
    removeXmlFile: (hash: string) => void,
};
export default class SelectRecipes extends React.PureComponent<Props> {
    render() {
        return (
            <Grid>
                <PaperSheet xs={12} sm={6}>
                    
                </PaperSheet>
                <PaperSheet xs={12} sm={6}>
                    
                </PaperSheet>
            </Grid>
        );
    }
}
