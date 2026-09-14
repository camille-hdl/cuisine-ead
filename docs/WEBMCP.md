# WebMCP (agents dans le navigateur)

Cuisine EAD expose des **outils de page** pour qu’un agent (Chrome / WebMCP) dépose des XML-EAD, choisisse des recettes et récupère le résultat **sans scraper le DOM**.

L’API `document.modelContext` est expérimentale. Si elle est absente, l’application se comporte comme avant (aucun outil, pas d’erreur).

## Chemin autonome (à privilégier)

L’agent a déjà le XML dans son contexte. **Aucun sélecteur de fichiers humain.**

1. `get_app_state` — s’orienter
2. **`add_ead_content`** `{ name, content }` ou **`add_ead_contents`** `{ files: [{ name, content }, ...] }`
3. `list_recipes` puis `select_recipes` `{ recipeIds, mode: "set"|"add"|"remove" }`
4. `run_selected_recipes` — ouvre la comparaison (étape _diff_)
5. `get_diff_summary` — stats + court extrait
6. `download_results` — même zip que le bouton de l’UI

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
