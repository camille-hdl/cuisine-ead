# Publier une version

La branche déployée est **netlify**. `master` est l’historique de développement : un merge dans `master` ne publie pas le site.

## 1. Land le travail sur `master`

Faire le correctif ou la fonctionnalité sur une branche, ouvrir une PR vers **master**, puis merger cette PR.

## 2. Bumper la version (sur `master`)

Mettre à jour **les deux** fichiers, comme dans [ce commit](https://github.com/camille-hdl/cuisine-ead/commit/4a0775d282afa455515afa27b3d5ba6f76895134) :

- `package.json` : `"version": "X.Y.Z"`
- `src/sw.js` : `var VERSION = "vX.Y.Z";` (préfixe `v` obligatoire)

## 3. Commit sur `master`

```
vX.Y.Z Short description
```

Exemple : `v1.5.2 Déplacer des balises dans did`

## 4. PR `master` → `netlify`

Ouvrir une PR **master → netlify** (pas l’inverse). Titre :

```
vX.Y.Z - Short description
```

Exemple : [PR #861](https://github.com/camille-hdl/cuisine-ead/pull/861) — `v1.5.2 - Déplacer des balises dans did`

Netlify ne crée un **deploy preview** que pour les PR dont la base est **netlify**. Une PR vers `master` n’en ouvre pas.

## 5. Publier

Vérifier le preview, puis merger la PR dans **netlify** (merge classique, pas squash). C’est ce merge qui publie le site.
