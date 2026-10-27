# Glassfluid, thème pour Redmine 7

Thème moderne pour Redmine 7 : panneaux en verre dépoli, police Inter, icônes Lucide, mode clair et sombre.

## Fonctionnalités

- Mise en page en panneaux translucides (menu, en-tête, contenu, barre latérale) sur un fond coloré flou.
- **Mode sombre** : il suit le réglage du système, et un bouton (soleil / lune) dans la barre du haut permet de le forcer. Le choix est mémorisé dans le navigateur.
- Jeu d'icônes **Lucide** à la place des icônes de Redmine (116 icônes). Les icônes non couvertes gardent leur version d'origine.
- Police **Inter**, embarquée dans le thème : aucun appel vers Google Fonts.
- Tableaux, formulaires, onglets, menus contextuels, boîtes de dialogue et messages restylés.
- Barre du haut et barre latérale qui restent visibles au défilement, affichage adapté au mobile.
- Compatible avec le plugin [redmine_kanban](https://github.com/TaikPaf/redmine_kanban), qui reprend les couleurs du thème.

## Installation

Le dossier du thème **doit s'appeler `glassfluid`** :

```bash
cd /chemin/vers/redmine/themes
git clone https://github.com/TaikPaf/redmine_theme.git glassfluid
```

Redémarrez Redmine, puis choisissez **Glassfluid** dans *Administration → Configuration → Affichage → Thème*.

## Icônes

`images/icons.svg` est généré à partir de Lucide. Pour le régénérer après avoir modifié `src/icon-map.json` (nom d'icône Redmine → nom d'icône Lucide) :

```bash
npm pack lucide-static && tar -xzf lucide-static-*.tgz
node src/build-icons.mjs package/icons
```

## Licences

- Thème : GPL v2 ou ultérieure, comme Redmine.
- Police Inter : SIL Open Font License 1.1 (`fonts/LICENSE-Inter.txt`).
- Icônes Lucide : licence ISC (`images/LICENSE-Lucide.txt`).
