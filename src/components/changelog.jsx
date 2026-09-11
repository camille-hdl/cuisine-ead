//@flow
import React from "react";

export default function Changelog() {
    return (
        <aside className="extras" aria-label="Aide et nouveautés">
            <details>
                <summary>Nouveautés</summary>
                <ul>
                    <li>{"Nouveau traitement : déplacer des balises dans did"}</li>
                </ul>
            </details>
            <details>
                <summary>Exemple de CSV de correction controlaccess</summary>
                <p className="hint">
                    {`Sur Windows, les fichiers CSV sont parfois mal reconnus. Essayez de renommer le fichier en « .txt ».`}
                </p>
                <div className="csv-example">
                    <pre>{`controlaccess,valeur corrigée,valeur originale
persname,"Osterman, John",john osterman
subject=>geogname,"Marseille, France",marseille
subject=>occupation[role=nouveau rôle][data-custom=attribut custom],Le Nouveau Terme,Ancien terme
"geogname[@role=""bâtiment""]=>persname[role=nouveau rôle]",le maire,Mairie
geogname,,toulon`}</pre>
                    <table>
                        <caption className="visually-hidden">Lecture ligne par ligne de l&apos;exemple CSV</caption>
                        <thead>
                            <tr>
                                <th>Ligne</th>
                                <th>controlaccess</th>
                                <th>Valeur corrigée</th>
                                <th>Valeur originale</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2</td>
                                <td>persname</td>
                                <td>{'"Osterman, John"'}</td>
                                <td>john osterman</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>{"subject=>geogname"}</td>
                                <td>{'"Marseille, France"'}</td>
                                <td>marseille</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>{"subject=>occupation[role=nouveau rôle][data-custom=attribut custom]"}</td>
                                <td>Le Nouveau Terme</td>
                                <td>Ancien terme</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>{'"geogname[@role=""bâtiment""]=>persname[role=nouveau rôle]"'}</td>
                                <td>le maire</td>
                                <td>Mairie</td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>geogname</td>
                                <td />
                                <td>toulon</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>Explications :</p>
                    <ol>
                        <li>{"La première ligne est ignorée"}</li>
                        <li>{"Exemple simple : remplacement de valeur d'une balise"}</li>
                        <li>{"Remplacement d'une balise par une autre"}</li>
                        <li>{"Remplacement d'une balise par une autre, modification de la valeur, ajout d'attributs"}</li>
                        <li>
                            {
                                "Remplacement d'une balise avec condition xpath, modification de la balise, ajout d'attributs, modification de la valeur"
                            }
                        </li>
                        <li>{"Le terme geogname « toulon » est supprimé"}</li>
                    </ol>
                </div>
            </details>
        </aside>
    );
}
