//@flow
import React from "react";
import { NavLink as RouterLink } from "react-router-dom";
import Link from "@material-ui/core/Link";
import OutlinedButton from "./outlined-button.jsx";

const UploadLink = props => <RouterLink to="/upload" {...props} />;


export default function StartButton(props) {
    const { hasXmlFiles } = props;
    return (
        <div>
            <OutlinedButton>
                <Link component={UploadLink}>{hasXmlFiles ? "Fichiers" : "Démarrer"}</Link>
            </OutlinedButton>
        </div>
    );
}
