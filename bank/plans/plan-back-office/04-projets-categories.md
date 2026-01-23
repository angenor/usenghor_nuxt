# Plan d'implémentation - Catégories de projets

> **Route**: `/admin/projets/categories`
> **Permission**: `projects.view`
> **Service SQL**: `10_project`
> **Table**: `project_categories`

---

## Fonctionnalités

### 1. Liste des catégories

- **Tableau simple**
  - Colonnes : Nom, Slug, Icône, Nombre de projets, Actions
  - Tri par nom ou par nombre de projets
  - Recherche textuelle

### 2. Création d'une catégorie

- **Formulaire simple**
  - Nom* (ex: "Développement durable", "Éducation", "Santé")
  - Slug* (auto-généré)
  - Icône (sélecteur d'icône Lucide)
  - Description (optionnel)

### 3. Modification d'une catégorie

- Modification du nom, icône, description
- Le slug ne devrait pas être modifié

### 4. Suppression d'une catégorie

- Confirmation requise
- Affiche le nombre de projets utilisant cette catégorie
- Dissociation automatique des projets

### 5. Réordonnement

- Drag & drop pour définir l'ordre d'affichage

---

## Endpoints FastAPI

### Liste des catégories

```
GET /api/admin/project-categories
```
**Paramètres**:
- `search` (optionnel)
- `sort_by`: name | project_count
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Développement durable",
      "slug": "developpement-durable",
      "icon": "leaf",
      "description": "Projets liés au développement durable",
      "project_count": 12
    }
  ],
  "total": 8
}
```

### Détail d'une catégorie

```
GET /api/admin/project-categories/{id}
```

### Création

```
POST /api/admin/project-categories
```
**Body**:
```json
{
  "name": "Innovation",
  "slug": "innovation",
  "icon": "lightbulb",
  "description": "Projets innovants"
}
```

### Modification

```
PUT /api/admin/project-categories/{id}
```

### Suppression

```
DELETE /api/admin/project-categories/{id}
```

### Vérification avant suppression

```
GET /api/admin/project-categories/{id}/usage
```
**Réponse**:
```json
{
  "project_count": 5,
  "can_delete": true,
  "projects_sample": [
    { "id": "uuid", "title": "Projet exemple" }
  ]
}
```

### Réordonnement

```
PUT /api/admin/project-categories/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2", "uuid3"] }`

---

## Notes d'implémentation

- Les catégories sont utilisées pour le filtrage sur le site public
- Un projet peut appartenir à plusieurs catégories
- Prévoir des catégories prédéfinies lors de l'initialisation
- Les icônes proviennent de Lucide Icons
- L'ordre d'affichage impacte la navigation publique
