//@flow
import React, { useState } from "react";
import PaperSheet from "./material/paper-sheet.jsx";
import type { List, Map } from "immutable";
import Grid from "./material/grid.jsx";
import { getRecipes } from "../lib/recipes.js";
import RecipeList from "./material/recipe-list.jsx";
import { Link as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import ReactDiffViewer from "react-diff-viewer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

const availableRecipes = getRecipes();
type Props = {
    pipeline: List,
    previewXmlFile: Map | null,
    previewXmlString: string | null,
    xmlFiles: List,
    pipelineFn: (doc: any) => any,
    setPipeline: (p: List) => void,
    setPreviewHash: (h: string) => void,
};
const PreviousStepLink = props => <RouterLink to="/upload" {...props} />;
export default function SelectRecipes(props: Props) {
    const [hasPreview, setPreview] = useState(false);
    return (
        <Grid container spacing={24}>
            <PaperSheet xs={6}>
                <Typography>
                    <Link component={PreviousStepLink}>Fichiers</Link>
                </Typography>
            </PaperSheet>
            <Grid item xs={6} />
            <PaperSheet xs={12} sm={6}>
                <RecipeList {...props} availableRecipes={availableRecipes} />
            </PaperSheet>
            <PaperSheet xs={12}>
                <div>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={hasPreview}
                                onChange={() => {
                                    setPreview(!hasPreview);
                                }}
                                value="Prévisualisation"
                            />
                        }
                        label="Prévisualisation (lent)"
                    />
                </div>
                {props.previewXmlFile && props.pipeline.size > 0 ? (
                    hasPreview ? (
                        <ReactDiffViewer
                            splitView={false}
                            oldValue={props.previewXmlFile.get("string")}
                            newValue={props.previewXmlString}
                        />
                    ) : null
                ) : null}
            </PaperSheet>
        </Grid>
    );
}
