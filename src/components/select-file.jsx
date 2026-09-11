//@flow
import React from "react";
import type { List as IList } from "immutable";
import { map, head } from "ramda";
import { xpathFilter } from "../lib/xml.js";
import type { XmlFileRecord } from "../types.js";

/**
 * Retourne le texte de la balise "titleproper"
 */
export function getTitleProper(doc: Document): string {
    const tags = xpathFilter(doc, "//titleproper");
    return tags.length > 0 && head(tags) ? head(tags).textContent : "";
}

/**
 * Retourne le texte de la balise "eadid"
 */
export function getEADID(doc: Document): string {
    const eadids = xpathFilter(doc, "//eadid");
    return eadids.length > 0 && head(eadids) ? head(eadids).textContent : "";
}

export default function SelectFile(props: {
    title: string,
    xmlFiles: IList<XmlFileRecord>,
    selectedFile: XmlFileRecord | null,
    emptyProposition?: boolean,
    onChange: (selectedXmlFile: XmlFileRecord | null) => void,
}) {
    const { title, onChange, selectedFile, emptyProposition } = props;
    const selectedHash = selectedFile && selectedFile.get("hash") ? String(selectedFile.get("hash")) : "";
    return (
        <label className="select-file">
            <span className="select-file-label">{title}</span>
            <select
                value={selectedHash}
                onChange={(ev) => {
                    const hash = ev.target.value;
                    if (!hash) {
                        onChange(null);
                        return;
                    }
                    const file = props.xmlFiles.find((xmlFile) => String(xmlFile.get("hash")) === hash);
                    onChange(file || null);
                }}
            >
                {emptyProposition ? <option value="">{""}</option> : null}
                {map((xmlFile) => {
                    const hash = xmlFile.get("hash") ? String(xmlFile.get("hash")) : String(Math.random());
                    const doc = xmlFile.get("doc");
                    const filename =
                        typeof xmlFile.get("filename") === "string" ? xmlFile.get("filename") : "no-filename";
                    const label = doc instanceof Document ? getTitleProper(doc) || filename : filename;
                    return (
                        <option key={hash} value={hash}>
                            {label}
                        </option>
                    );
                }, props.xmlFiles.toArray())}
            </select>
        </label>
    );
}
