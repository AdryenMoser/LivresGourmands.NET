# LivresGourmands.net

## Description du projet

livresgourmands.net est une plateforme de commerce électronique spécialisée dans la vente de livres de cuisine, adaptée à différents niveaux : débutants, amateurs et chefs.

Le site permet notamment la recherche et la consultation d’ouvrages, la gestion d’un panier, la création de listes de cadeaux, la publication d’avis et de commentaires ainsi que le paiement en ligne sécurisé.

## Objectifs de l’étape 01

Cette première étape du projet est consacrée à l’analyse et à la modélisation du système.

Les objectifs sont :

- créer et organiser le dépôt GitHub du projet;
- analyser le cahier des charges et identifier les principaux acteurs et fonctionnalités;
- réaliser le diagramme de cas d’utilisation;
- réaliser une première ébauche du diagramme de classes;
- intégrer les principales règles de gestion définies dans le cahier des charges;
- préparer les documents nécessaires à la remise de l’étape 01.

## Répartition des rôles et responsabilités

### Wallace do Nascimento Coura

- Réalisation du diagramme de cas d’utilisation;
- Organisation du dépôt GitHub;
- Création et mise à jour du fichier README;
- Participation à l’analyse du cahier des charges;
- Participation à la révision et à la validation finale.

### Adryen Moser

- Réalisation de la première ébauche du diagramme de classes;
- Vérification des relations et des cardinalités;
- Vérification de l’intégration des règles de gestion dans le modèle;
- Participation à l’analyse du cahier des charges;
- Participation à la révision et à la validation finale.

## Membres de l’équipe

- Wallace do Nascimento Coura
- Adryen Moser

## Date

15 septembre 2026

## Étape 02 — API, base de données, authentification et PWA

Ce dépôt implémente l’étape 02 : schéma MySQL, API REST Express, authentification JWT + bcrypt, règles de gestion, et une PWA (manifeste, service worker, catalogue utilisable) servie par le même serveur.

Aucune donnée bancaire n’est stockée. Le paiement est une simulation : seule une référence de prestataire est conservée.

## Corrections apportées

La grille de l’étape 02 signalait l’absence du diagramme entité-association, du rapport Word, du dictionnaire de données, de bcrypt et des verbes PUT et DELETE. Ces éléments sont maintenant dans le dépôt.

- **Diagramme entité-association** — `docs/diagramme-er.png`.
- **Rapport Word** — `docs/rapport.docx`, avec le dictionnaire de données et le diagramme. La même matière est dans `docs/rapport.md` et `docs/schema.md`.
- **bcrypt** — les mots de passe sont hashés à l’inscription (`src/services/authService.js`) et à la modification du profil (`src/services/userService.js`), avec un coût de 10. Le fichier `sql/seed.sql` contient déjà les empreintes des comptes de démonstration. Le mot de passe en clair n’est pas stocké.
- **PUT et DELETE** — les routes sont dans `src/routes/api.js`. La collection Postman `postman/livres-gourmands.postman_collection.json` a un dossier « PUT et DELETE » : ouvrages, catégories, quantité et lignes du panier, statut d’une commande, validation d’un commentaire et suspension d’un compte.
- **Totaux** — les montants du panier et des commandes restent en euros. Ils ne sont plus convertis deux fois en centimes.

## Étape finale — conception visuelle et intégration

La PWA de l’étape 02 reste servie par `npm start`. L’intégration demandée pour l’étape finale est une application React, dans `frontend/`, branchée sur la même API.

La charte appliquée est celle du dossier Chloé Bonnevaux : encre `#17102c`, or `#c69c6d`, accent `#d7db2f`, Raleway et Open Sans. Les liens courants sont assombris pour rester lisibles. Le dossier de conception est `docs/conception/dossier-conception.pdf`. Les wireframes bureau et mobile sont `docs/conception/wireframes.html`.

```bash
npm start          # API et PWA de l’étape 02 — http://127.0.0.1:4721
npm run client     # React + Bootstrap — http://127.0.0.1:4722
```

Lancer l’API avant le client. Le client proxifie `/api` vers le port 4721. Le panier d’un visiteur reste dans `localStorage`. Un client connecté le synchronise avec l’API. L’atelier (`/admin`) est réservé à l’éditeur, au gestionnaire et à l’administrateur.

Il n’y a pas de fichier Figma ni Adobe XD, ni de vidéo : ces outils ne sont pas dans l’environnement. Le mot de passe oublié n’envoie pas de courriel.

## Maquette Figma :
www.figma.com/design/PuhK1y0VMapg4sketmsE21/Livres-Gourmands-simple2

## Prototype Figma (XD pas disponible)
https://www.figma.com/proto/PuhK1y0VMapg4sketmsE21/Livres-Gourmands-simple2?node-id=0-1&t=Ugxs4RkgI5Pf48h5-1
https://www.figma.com/proto/


## Prérequis

- Node.js 20 ou plus récent
- MySQL ou MariaDB

Compte local de développement (ces valeurs sont aussi les défauts du serveur si `.env` est absent) :

```sql
CREATE DATABASE IF NOT EXISTS livresgourmands CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'livres'@'localhost' IDENTIFIED BY 'livres_dev';
GRANT ALL PRIVILEGES ON livresgourmands.* TO 'livres'@'localhost';
FLUSH PRIVILEGES;
```

Le mot de passe `livres_dev` et le secret JWT de secours ne conviennent qu’en local. En production, définir `JWT_SECRET` et un mot de passe de base distincts.

## Installation et exécution

```bash
npm install
cp .env.example .env   # facultatif : les défauts locaux suffisent
npm run db:setup       # recrée le schéma et les données de démonstration
npm start              # http://127.0.0.1:4721
npm test               # parcours API (base livresgourmands_test)
npm run db:expire-paniers
```

La PWA et l’API partagent le port `4721`.

## Comptes de démonstration

| Courriel | Mot de passe | Rôle |
| --- | --- | --- |
| camille.client@livresgourmands.test | Camille123! | client |
| louis.editeur@livresgourmands.test | Editeur123! | editeur |
| sara.gestion@livresgourmands.test | Gestion123! | gestionnaire |
| noemie.admin@livresgourmands.test | Admin123! | administrateur |

Liste de cadeaux publique : code `TABLE-HIVER`.

## Règles de gestion couvertes

- RG1 — la recherche et la fiche publiques ne renvoient que les ouvrages dont le stock est supérieur à 0. L’atelier peut demander `inclureRupture=1`.
- RG2 — un panier sans activité depuis 72 heures (réglable) est vidé à la lecture et par `npm run db:expire-paniers`.
- RG3 — un avis n’est accepté que si le client a une commande payée (ou plus avancée) contenant l’ouvrage. Un seul avis par client et par ouvrage.
- RG4 — un commentaire est créé `en_attente`. Un éditeur le valide ou le rejette. Seuls les commentaires `valide` sont publics.
- RG5 — un administrateur peut suspendre un compte (`actif: false`). Un compte suspendu ne peut plus se connecter.
- RG6 — aucun numéro de carte, CVV ou IBAN. Un champ bancaire dans le corps de la requête est refusé. Le stock est décrémenté dans une transaction au moment où le paiement simulé réussit.

## Endpoints

Authentification : `Authorization: Bearer <jwt>`.

| Méthode | Chemin | Accès |
| --- | --- | --- |
| POST | `/api/auth/register` | public, crée un client |
| POST | `/api/auth/login` | public, renvoie un JWT |
| POST | `/api/auth/logout` | JWT, jeton sans état (le client l’oublie) |
| GET | `/api/users/me` | JWT |
| GET | `/api/users` | administrateur |
| PUT | `/api/users/:id` | propriétaire ou administrateur |
| GET | `/api/categories` | public |
| POST, PUT, DELETE | `/api/categories` | éditeur, gestionnaire, administrateur |
| GET | `/api/ouvrages` | public, filtres `texte`, `categorie`, `populariteMin` |
| GET | `/api/ouvrages/:id` | public, avis et commentaires validés |
| POST, PUT, DELETE | `/api/ouvrages` | éditeur, gestionnaire, administrateur |
| GET, DELETE | `/api/panier` | client |
| POST | `/api/panier/items` | client |
| PUT, DELETE | `/api/panier/items/:id` | client |
| POST | `/api/commandes` | client, depuis le panier |
| GET | `/api/commandes` | client (les siennes) ou gestionnaire / administrateur (toutes) |
| GET | `/api/commandes/:id` | propriétaire ou gestion |
| POST | `/api/commandes/:id/annuler` | propriétaire ou gestion |
| POST | `/api/commandes/:id/paiement` | nouvelle tentative |
| PUT | `/api/commandes/:id/status` | gestionnaire, administrateur |
| POST | `/api/listes` | client |
| GET | `/api/listes` | client, les siennes |
| GET | `/api/listes/:code` | public (ami) |
| POST | `/api/listes/:idOuCode/acheter` | client ou invité |
| POST | `/api/ouvrages/:id/avis` | client, si achat |
| POST | `/api/ouvrages/:id/commentaires` | client |
| GET | `/api/commentaires` | éditeur, administrateur |
| PUT | `/api/commentaires/:id/valider` | éditeur, administrateur |
| POST | `/api/paiements/:reference/simuler` | détenteur de la référence |
| GET | `/api/paiements/:reference` | suivi |
| GET | `/api/paiements/me` | client |
| GET | `/api/paiements` | gestionnaire, administrateur |
| GET | `/api/ventes` | gestionnaire, administrateur |

### Exemples

```bash
curl -s http://127.0.0.1:4721/api/ouvrages?texte=bouillon

curl -s -X POST http://127.0.0.1:4721/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"camille.client@livresgourmands.test","motDePasse":"Camille123!"}'

curl -s http://127.0.0.1:4721/api/panier \
  -H "Authorization: Bearer $TOKEN"

curl -s -X POST http://127.0.0.1:4721/api/panier/items \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"ouvrageId":1,"quantite":1}'
```

La collection Postman est dans `postman/livres-gourmands.postman_collection.json`.

## Documents

- `sql/schema.sql` — DDL réexécutable
- `sql/seed.sql` — données de démonstration, mots de passe déjà hashés avec bcrypt
- `docs/diagramme-er.png` — diagramme entité-association
- `docs/rapport.docx` — rapport Word, avec le dictionnaire de données et le diagramme
- `docs/schema.md` — même dictionnaire, en Markdown
- `docs/rapport.md` — version Markdown du rapport

Les verbes PUT et DELETE sont dans `src/routes/api.js` et dans le dossier « PUT et DELETE » de la collection Postman.

```bash
curl -s -X PUT http://127.0.0.1:4721/api/panier/items/1 \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"quantite":2}'

curl -s -X DELETE http://127.0.0.1:4721/api/panier/items/1 \
  -H "Authorization: Bearer $TOKEN"
```

## PWA

`public/manifest.webmanifest` et `public/sw.js` rendent l’application installable. Le service worker met en cache la coquille (HTML, CSS, JS, icônes) et retombe sur `offline.html` sans réseau. Les appels `/api/` ne sont pas mis en cache : le stock doit rester celui du serveur.
