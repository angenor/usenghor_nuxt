# Plan d'implémentation - Liste des projets

> **Route**: `/admin/projets/liste`
> **Permission**: `projects.view`
> **Service SQL**: `10_project`
> **Tables**: `projects`, `project_countries`, `project_category_links`, `project_partners`, `project_media_library`

---

## Fonctionnalités

### 1. Liste des projets

- **Tableau paginé**
  - Colonnes : Image, Titre, Catégories, Département, Statut, Dates, Budget, Actions
  - Miniature de l'image de couverture
  - Badges de catégories
  - Badge de statut coloré (planned, ongoing, completed, suspended)
  - Indicateur de publication

- **Filtres**
  - Par statut (planned, ongoing, completed, suspended)
  - Par statut de publication (draft, published, archived)
  - Par catégorie
  - Par département
  - Par pays concerné
  - Par partenaire
  - Par période (dates de début/fin)
  - Recherche textuelle

- **Actions en masse**
  - Publier / Dépublier
  - Changer le statut
  - Supprimer

### 2. Création d'un projet

- **Formulaire**

#### Informations générales
- Titre*
- Slug* (auto-généré)
- Résumé
- Description détaillée (éditeur riche)
- Image de couverture (upload)
- Album photos (select ou création)

#### Classification
- Catégories (multi-select)
- Département porteur (select)
- Chef de projet / Responsable (select utilisateur)

#### Dates et budget
- Date de début
- Date de fin prévue
- Budget
- Devise (EUR par défaut)

#### Portée géographique
- Pays concernés (multi-select)
- Bénéficiaires (texte libre)

#### Partenaires
- Liste des partenaires (multi-select)
- Rôle de chaque partenaire (texte)

#### Publication
- Statut du projet (planned, ongoing, completed, suspended)
- Statut de publication (draft, published, archived)

### 3. Modification d'un projet

- Même formulaire que la création
- Historique des modifications

### 4. Suppression

- Confirmation requise
- Vérifier les dépendances (événements liés, actualités liées)

### 5. Gestion des albums

- Associer des albums existants
- Créer un nouvel album depuis le projet
- Ajouter des médias après des événements

---

## Endpoints FastAPI

### Liste des projets

```
GET /api/admin/projects
```
**Paramètres**:
- `page`, `limit`
- `status`: planned | ongoing | completed | suspended
- `publication_status`: draft | published | archived
- `category_id`: UUID
- `department_id`: UUID
- `country_id`: UUID
- `partner_id`: UUID
- `date_from`, `date_to`
- `search`
- `sort_by`, `sort_order`

### Détail d'un projet

```
GET /api/admin/projects/{id}
```
**Réponse**: Projet complet avec catégories, pays, partenaires, albums

### Création

```
POST /api/admin/projects
```
**Body**:
```json
{
  "title": "Projet de développement agricole",
  "slug": "projet-developpement-agricole",
  "summary": "Résumé du projet...",
  "description": "<p>Description détaillée...</p>",
  "cover_image_external_id": "uuid",
  "album_external_id": "uuid",
  "department_external_id": "uuid",
  "manager_external_id": "uuid",
  "start_date": "2025-01-01",
  "end_date": "2027-12-31",
  "budget": 500000.00,
  "currency": "EUR",
  "beneficiaries": "Agriculteurs de la région...",
  "status": "ongoing",
  "publication_status": "published",
  "category_ids": ["uuid1", "uuid2"],
  "country_ids": ["uuid1", "uuid2"],
  "partners": [
    { "partner_id": "uuid", "partner_role": "Financement" },
    { "partner_id": "uuid", "partner_role": "Expertise technique" }
  ]
}
```
**Permission**: `projects.create` (si existant) ou permission admin

### Modification

```
PUT /api/admin/projects/{id}
```

### Suppression

```
DELETE /api/admin/projects/{id}
```

### Gestion des catégories

```
PUT /api/admin/projects/{id}/categories
```
**Body**: `{ "category_ids": ["uuid1", "uuid2"] }`

### Gestion des pays

```
PUT /api/admin/projects/{id}/countries
```
**Body**: `{ "country_ids": ["uuid1", "uuid2"] }`

### Gestion des partenaires

```
GET /api/admin/projects/{id}/partners
PUT /api/admin/projects/{id}/partners
```
**Body PUT**:
```json
{
  "partners": [
    { "partner_id": "uuid", "partner_role": "Financement" }
  ]
}
```

### Gestion des albums

```
GET /api/admin/projects/{id}/albums
POST /api/admin/projects/{id}/albums
DELETE /api/admin/projects/{id}/albums/{album_id}
```

### Changement de statut

```
POST /api/admin/projects/{id}/status
```
**Body**: `{ "status": "completed" }`

### Statistiques (optionnel)

```
GET /api/admin/projects/statistics
```
**Réponse**:
```json
{
  "total": 45,
  "by_status": {
    "planned": 10,
    "ongoing": 20,
    "completed": 12,
    "suspended": 3
  },
  "total_budget": 15000000
}
```

---

## Endpoints de référence

```
GET /api/admin/project-categories
GET /api/admin/departments
GET /api/admin/users (chefs de projet)
GET /api/admin/countries
GET /api/admin/partners
GET /api/admin/albums
```

---

## Notes d'implémentation

- Le slug est unique et auto-généré
- Le budget est optionnel et peut être confidentiel
- Les pays concernés peuvent être affichés sur une carte
- Les partenaires avec leur rôle permettent d'afficher leur contribution
- Les projets terminés restent consultables mais peuvent être archivés
- Prévoir des liens vers les événements et actualités liés au projet
