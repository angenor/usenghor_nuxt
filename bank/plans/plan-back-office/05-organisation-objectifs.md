# Plan d'implémentation - Objectifs et Réalisations

> **Route**: `/admin/organisation/objectifs`
> **Permission**: `organization.view`
> **Service SQL**: `04_organization`
> **Tables**: `service_objectives`, `service_achievements`, `service_projects`

---

## Fonctionnalités

### 1. Navigation par service

- **Sélecteur hiérarchique**
  - Département > Service
  - Affiche le service sélectionné

### 2. Gestion des objectifs

- **Liste des objectifs du service**
  - Affichage ordonné
  - Titre + Description
  - Actions : Modifier, Supprimer, Réordonner

- **Ajout d'un objectif**
  - Titre*
  - Description
  - Ordre d'affichage

### 3. Gestion des réalisations

- **Liste des réalisations du service**
  - Affichage en timeline ou cartes
  - Image de couverture optionnelle
  - Date de réalisation
  - Actions : Modifier, Supprimer

- **Ajout d'une réalisation**
  - Titre*
  - Description
  - Type (catégorie libre)
  - Image de couverture (upload)
  - Date de réalisation

### 4. Gestion des projets internes du service

- **Liste des projets du service**
  - Différent des projets institutionnels (module PROJECT)
  - Projets internes, opérationnels
  - Affichage : Titre, Statut, Progression, Dates

- **Ajout d'un projet interne**
  - Titre*
  - Description
  - Image de couverture
  - Progression (0-100%)
  - Statut (planned, ongoing, completed, suspended)
  - Date de début
  - Date de fin prévue

### 5. Vue consolidée

- Affichage combiné objectifs + réalisations + projets
- Tableau de bord du service

---

## Endpoints FastAPI

### Objectifs d'un service

```
GET /api/admin/services/{service_id}/objectives
```

### Création d'un objectif

```
POST /api/admin/services/{service_id}/objectives
```
**Body**:
```json
{
  "title": "Améliorer la satisfaction des étudiants",
  "description": "Objectif détaillé...",
  "display_order": 1
}
```

### Modification d'un objectif

```
PUT /api/admin/service-objectives/{id}
```

### Suppression d'un objectif

```
DELETE /api/admin/service-objectives/{id}
```

### Réordonnement des objectifs

```
PUT /api/admin/services/{service_id}/objectives/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2"] }`

---

### Réalisations d'un service

```
GET /api/admin/services/{service_id}/achievements
```

### Création d'une réalisation

```
POST /api/admin/services/{service_id}/achievements
```
**Body**:
```json
{
  "title": "Mise en place du nouveau système d'inscription",
  "description": "Description de la réalisation...",
  "type": "Innovation",
  "cover_image_external_id": "uuid",
  "achievement_date": "2024-09-01"
}
```

### Modification d'une réalisation

```
PUT /api/admin/service-achievements/{id}
```

### Suppression d'une réalisation

```
DELETE /api/admin/service-achievements/{id}
```

---

### Projets internes d'un service

```
GET /api/admin/services/{service_id}/projects
```

### Création d'un projet interne

```
POST /api/admin/services/{service_id}/projects
```
**Body**:
```json
{
  "title": "Digitalisation des processus",
  "description": "Description du projet...",
  "cover_image_external_id": "uuid",
  "progress": 45,
  "status": "ongoing",
  "start_date": "2024-01-01",
  "expected_end_date": "2025-06-30"
}
```

### Modification d'un projet interne

```
PUT /api/admin/service-projects/{id}
```

### Suppression d'un projet interne

```
DELETE /api/admin/service-projects/{id}
```

### Mise à jour de la progression

```
POST /api/admin/service-projects/{id}/progress
```
**Body**: `{ "progress": 60 }`

---

### Vue consolidée d'un service

```
GET /api/admin/services/{service_id}/overview
```
**Réponse**:
```json
{
  "service": { ... },
  "objectives_count": 5,
  "achievements_count": 12,
  "projects": {
    "total": 3,
    "ongoing": 2,
    "completed": 1
  }
}
```

---

## Notes d'implémentation

- Les objectifs sont des déclarations d'intention (qualitatifs)
- Les réalisations sont des accomplissements passés (avec date)
- Les projets internes ont un suivi de progression
- Cette page permet une gestion centralisée par service
- Les données sont visibles sur les pages de présentation du site public
- Le type de réalisation est libre (pas d'enum) pour plus de flexibilité
