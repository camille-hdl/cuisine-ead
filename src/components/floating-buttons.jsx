//@flow
import React from "react";
import { useLocation } from "react-router-dom";
import type { Props } from "../pages/app.jsx";
import { downloadResultsZip, downloadControlAccesses } from "../pages/results.jsx";

/**
 * Download is allowed if there is at least 1 input xml file
 * and 1 recipe or outputrecipe
 */
const canDownloadZip = (props: Props) => {
    if (props.xmlFiles.size <= 0) return false;
    if (props.pipeline.size + props.outputPipeline.size <= 0) return false;
    return true;
};

/**
 * CA Download is allowed if there is at least 1 input xml file
 */
const canDownloadCAs = (props: Props) => {
    if (props.xmlFiles.size <= 0) return false;
    return true;
};

export default function FloatingButtons(props: Props) {
    const location = useLocation();
    const downloadZip = canDownloadZip(props);
    const downloadCAs = canDownloadCAs(props);
    if (location.pathname === "/resultats") return null;
    if (!downloadCAs && !downloadZip) return null;
    return (
        <div className="quick-actions">
            {downloadZip ? (
                <button
                    type="button"
                    className="btn btn-primary"
                    title="Télécharger les fichiers modifiés"
                    onClick={() => downloadResultsZip(props)}
                    data-cy="download-results"
                >
                    Télécharger les fichiers
                </button>
            ) : null}
            {downloadCAs ? (
                <button
                    type="button"
                    className="btn"
                    title="Télécharger les controlaccess"
                    onClick={() => downloadControlAccesses(props)}
                    data-cy="download-ca"
                >
                    Controlaccess
                </button>
            ) : null}
        </div>
    );
}
