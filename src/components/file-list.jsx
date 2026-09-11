//@flow
import React from "react";
import { List as ImmutableList, Map } from "immutable";
import { map, head, reduce } from "ramda";
import { xpathFilter } from "../lib/xml.js";

const sumC = reduce((acc, xmlFile) => acc + xmlFile.get("nbC"), 0);

type Props = {
    xmlFiles: ImmutableList<Map<string, mixed>>,
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
export default class FileList extends React.PureComponent<Props> {
    render() {
        const { xmlFiles } = this.props;
        const xmlFilesArray = xmlFiles.toArray();
        const totalNbC = sumC(xmlFilesArray);
        return (
            <div>
                {totalNbC > 0 ? (
                    <p className="file-panel-summary">{`${"" + totalNbC} fiche(s) C dans ${
                        xmlFilesArray.length
                    } fichier(s)`}</p>
                ) : null}
                <ul className="file-list">
                    {map((xmlFile) => {
                        const hash = xmlFile.get("hash") ? String(xmlFile.get("hash")) : String(Math.random());
                        const doc = xmlFile.get("doc");
                        const filename = xmlFile.get("filename") ? String(xmlFile.get("filename")) : "no-filename";
                        const encoding = xmlFile.get("encoding")
                            ? String(xmlFile.get("encoding"))
                            : "encodage introuvable";
                        const nbC = xmlFile.get("nbC") ? `${"" + xmlFile.get("nbC")} fiche(s) C` : "pas de fiche C";
                        const title = doc instanceof Document ? getTitleProper(doc) || filename : filename;
                        return (
                            <li key={hash}>
                                <div>
                                    <div className="file-list-title" data-cy="file-list-text">
                                        {title}
                                    </div>
                                    <div className="file-list-meta">{`${filename} — ${encoding} — ${nbC}`}</div>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-quiet"
                                    aria-label={`Retirer ${filename}`}
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        this.props.onRemove(xmlFile);
                                    }}
                                >
                                    Retirer
                                </button>
                            </li>
                        );
                    }, xmlFilesArray)}
                </ul>
            </div>
        );
    }
}
