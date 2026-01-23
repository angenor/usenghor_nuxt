# Plan d'implémentation - Appels à projets

> **Route**: `/admin/projets/appels`
> **Permission**: `projects.view`
> **Service SQL**: `10_project`
> **Table**: `project_calls`

---

## Fonctionnalités

### 1. Liste des appels à projets

- **Tableau paginé**
  - Colonnes : Titre, Projet parent, Type, Statut, Date limite, Actions
  - Badge de statut coloré (upcoming, ongoing, closed)
  - Badge de type

- **Filtres**
  - Par projet parent
  - Par type (application, scholarship, project, recruitment, training)
  - Par statut (upcoming, ongoing, closed)
  - Par période (date limite)
  - Recherche textuelle

### 2. Création d'un appel à projets

- **Formulaire**
  - Projet parent* (select)
  - Titre*
  - Description (éditeur riche)
  - Type (select)
  - Conditions de participation (éditeur riche)
  - Statut (upcoming, ongoing, closed)
  - Date limite de soumission

### 3. Modification d'un appel

- Même formulaire que la création
- Possibilité de rouvrir un appel fermé

### 4. Suppression

- Confirmation requise

### 5. Changement de statut

- Interface rapide pour passer de upcoming → ongoing → closed
- Mise à jour automatique basée sur les dates (optionnel)

---

## Endpoints FastAPI

### Liste des appels à projets

```
GET /api/admin/project-calls
```
**Paramètres**:
- `page`, `limit`
- `project_id`: UUID
- `type`: application | scholarship | project | recruitment | training
- `status`: upcoming | ongoing | closed
- `deadline_from`, `deadline_to`
- `search`
- `sort_by`, `sort_order`

### Détail d'un appel

```
GET /api/admin/project-calls/{id}
```

### Création

```
POST /api/admin/project-calls
```
**Body**:
```json
{
  "project_id": "uuid",
  "title": "Appel à participation - Programme de recherche",
  "description": "<p>Description détaillée...</p>",
  "type": "project",
  "conditions": "<p>Conditions de participation...</p>",
  "status": "upcoming",
  "deadline": "2025-06-30T23:59:59Z"
}
```

### Modification

```
PUT /api/admin/project-calls/{id}
```

### Suppression

```
DELETE /api/admin/project-calls/{id}
```

### Changement de statut

```
POST /api/admin/project-calls/{id}/status
```
**Body**: `{ "status": "ongoing" }`

### Appels d'un projet

```
GET /api/admin/projects/{project_id}/calls
```
**Réponse**: Liste des appels liés à ce projet

---

## Endpoints de référence

```
GET /api/admin/projects (pour le select projet parent)
```

---

## Notes d'implémentation

- Les appels à projets sont liés à un projet institutionnel
- Ils permettent de recruter des participants, chercheurs, etc.
- Le statut peut être mis à jour automatiquement par un cron job
- Différent des appels à candidatures pour les formations (module 08_application)
- Les types d'appels sont les mêmes que ceux du module APPLICATION
- Prévoir une notification aux administrateurs avant la date limite
