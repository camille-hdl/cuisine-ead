# WebMCP (agents dans le navigateur)

Cuisine EAD expose des **outils de page** pour qu’un agent (Chrome / WebMCP) dépose des XML-EAD, choisisse des recettes et récupère le résultat **sans scraper le DOM**.

L’API `document.modelContext` est expérimentale. Si elle est absente, l’application se comporte comme avant (aucun outil, pas d’erreur).

En production (`https://cuisine-ead.camillehdl.dev/`), WebMCP est activé via l’en-tête HTTP `Origin-Trial` défini dans `public/_headers`.

## Chemin autonome (à privilégier)

L’agent a déjà le XML dans son contexte. **Aucun sélecteur de fichiers humain.**

1. `get_app_state` — s’orienter
2. **`add_ead_content`** `{ name, content }` ou **`add_ead_contents`** `{ files: [{ name, content }, ...] }`
3. `list_recipes` — notez `hasParams` / `params` (schéma du formulaire UI)
4. `select_recipes` `{ recipeIds, mode: "set"|"add"|"remove", params? }`
5. Si besoin : `get_recipe_params` `{ recipeId }` puis **`set_recipe_params`** `{ recipeId, params: { ... } }`
6. `run_selected_recipes` — refuse si un paramètre requis est encore vide
7. `get_diff_summary` — stats + court extrait
8. `download_results` — même zip que le bouton de l’UI

`add_ead_content` / `add_ead_contents` n’acceptent que des documents dont la racine est `<ead>`. Un HTML ou un XML quelconque est refusé et n’est **jamais** étiqueté `xml-ead`.

Après `go_to_step`, `get_app_state` reflète tout de suite la nouvelle étape (le pathname WebMCP ne dépend pas du re-render React Router).

### Paramètres de recettes

Quand une recette est cochée dans l’UI, un formulaire apparaît (publisher, source, remplacements, etc.). WebMCP expose les **mêmes champs** que Redux `pipeline[].args` :

| Outil               | Rôle                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `list_recipes`      | `hasParams`, `params[]` (name, type, required, label, description, defaultValue, currentValue) |
| `get_recipe_params` | Détail pour une recette, ou toutes les recettes paramétrables si `recipeId` est omis           |
| `set_recipe_params` | `{ recipeId, params }` — sélectionne la recette si besoin, fusionne les valeurs                |
| `select_recipes`    | `params` optionnel : `{ [recipeId]: { champ: valeur } }` en une fois                           |

Exemples :

```json
{ "recipeId": "ecraser_publisher", "params": { "publisher": "Archives départementales" } }
```

```json
{
    "recipeIds": ["geogname_set_source", "supprimer_lb"],
    "mode": "set",
    "params": { "geogname_set_source": { "source": "GEO" } }
}
```

```json
{
    "recipeId": "remplace_dao_href",
    "params": { "remplacements": [{ "rechercher": "old/", "remplacer": "new/" }] }
}
```

`select_recipes` en `mode: "set"` **conserve** les `pipeline[].args` déjà renseignés pour les recettes qui restent sélectionnées. Seules les recettes retirées perdent leurs params ; les nouvelles reçoivent les valeurs par défaut, sauf si `params` est passé dans le même appel.

Les champs `required: true` sont ceux dont la valeur vide rend la recette inopérante (l’UI laisse lancer quand même). `run_selected_recipes` les exige pour l’agent. `prefix` (transforme_daogrp_ligeo), `separator` (défaut `/`), `balises` (défaut `physdesc|physloc`) restent optionnels.

Optionnel : `add_csv_content` pour un CSV de corrections controlaccess (recette `correction_controlaccess`).

`add_files_via_picker` n’est qu’un **repli** : il ouvre la dropzone. Le navigateur bloque souvent l’ouverture sans geste utilisateur ; l’humain doit alors cliquer sur « Parcourir les fichiers ».

## Vérifier avec Chrome

1. Chrome récent avec WebMCP (flag / [origin trial](https://developer.chrome.com/docs/ai/webmcp), voir la doc Chrome « AI in Chrome → WebMCP »).
2. Installer l’extension **Model Context Tool Inspector** (Chrome). Elle liste les outils de la page, permet de les exécuter à la main et d’inspecter schémas / réponses.
3. Ouvrir Cuisine EAD, confirmer que les outils ci-dessus apparaissent.
4. Dans l’inspecteur, coller un XML-EAD dans `add_ead_content` (`name` + `content`), puis enchaîner select → run → download. La liste de fichiers de l’UI doit se mettre à jour **sans** passer par la dropzone.

Les outils appellent les **mêmes actions Redux** que l’interface (ajout XML, pipeline, aperçu, zip).

## Plafonds

Les chaînes XML trop longues sont refusées (l’agent est invité à utiliser le sélecteur). Les extraits de diff sont tronqués ; `get_diff_summary` et `list_loaded_files` portent `untrustedContentHint` (contenu utilisateur).

## Développement

Sans WebMCP, `npm test` (Jest + Playwright) reste le filet : les handlers sont testés unitairement, et `e2e/webmcp.spec.js` injecte un `document.modelContext` factice pour le parcours XML → recettes → zip.
