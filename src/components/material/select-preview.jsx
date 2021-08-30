//@flow
import React from "react";
import type { List as IList } from "immutable"
import SelectFile from "./select-file.jsx";

export default function SelectPreviewFile(props: {
    classes: any,
    xmlFiles: IList<Map<string, mixed>>,
    previewHash: string | null,
    previewXmlFile: Map<string, mixed> | null,
    setPreviewHash: (hash: string | null) => void,
}) {
    const { classes } = props;
    const selectedFile = props.previewXmlFile ? props.previewXmlFile : props.xmlFiles.first();
    if (!selectedFile) {
        return null;
    }
    const selectedDocument = selectedFile.get("doc");
    if (!(selectedDocument instanceof Document)) {
        return null;
    }
    return <SelectFile
        title="Fichier sélectionné"
        emptyProposition={true}
        xmlFiles={props.xmlFiles}
        selectedFile={selectedFile}
        onChange={xmlFile => {
            if (xmlFile) {
                const hash = xmlFile.get("hash") ? String(xmlFile.get("hash")) : String(Math.random());
                props.setPreviewHash(hash);
            }
        }}
    />;
}