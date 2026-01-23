# Plan d'implémentation - Services

> **Route**: `/admin/organisation/services`
> **Permission**: `organization.view`
> **Service SQL**: `04_organization`
> **Tables**: `services`, `service_media_library`

---

## Fonctionnalités

### 1. Liste des services

- **Tableau paginé**
  - Colonnes : Nom, Département, Responsable, Contact, Statut, Actions
  - Regroupement par département (optionnel)
  - Indicateur actif/inactif

- **Filtres**
  - Par département
  - Par statut (actif/inactif)
  - Recherche textuelle

- **Vues**
  - Vue liste (tableau)
  - Vue par département (accordéon)

### 2. Création d'un service

- **Formulaire**
  - Département parent* (select)
  - Nom*
  - Description (éditeur riche)
  - Mission (éditeur riche)
  - Responsable (select utilisateur)
  - Email de contact
  - Téléphone
  - Album photos (select ou création)
  - Ordre d'affichage
  - Actif (checkbox)

### 3. Modification d'un service

- Même formulaire que la création
- Accès rapide aux objectifs et réalisations

### 4. Suppression / Désactivation

- Désactivation recommandée
- Vérifier les dépendances avant suppression

### 5. Gestion des albums

- Association d'albums photo pour la médiathèque du service

---

## Endpoints FastAPI

### Liste des services

```
GET /api/admin/services
```
**Paramètres**:
- `page`, `limit`
- `department_id`: UUID
- `active`: true | false
- `search`
- `sort_by`: display_order | name
- `sort_order`

### Liste groupée par département

```
GET /api/admin/services/by-department
```
**Réponse**:
```json
{
  "departments": [
    {
      "id": "uuid",
      "name": "Département Management",
      "services": [
        {
          "id": "uuid",
          "name": "Service des études",
          "head": { "id": "uuid", "name": "..." },
          "active": true
        }
      ]
    }
  ]
}
```

### Détail d'un service

```
GET /api/admin/services/{id}
```

### Création

```
POST /api/admin/services
```
**Body**:
```json
{
  "department_id": "uuid",
  "name": "Service de la scolarité",
  "description": "<p>Description...</p>",
  "mission": "<p>Mission...</p>",
  "head_external_id": "uuid",
  "album_external_id": "uuid",
  "email": "scolarite@usenghor.org",
  "phone": "+20 3 123 4567",
  "display_order": 1,
  "active": true
}
```

### Modification

```
PUT /api/admin/services/{id}
```

### Suppression

```
DELETE /api/admin/services/{id}
```

### Activation / Désactivation

```
POST /api/admin/services/{id}/toggle-active
```

### Réordonnement dans un département

```
PUT /api/admin/departments/{department_id}/services/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2"] }`

### Gestion de la médiathèque du service

```
GET /api/admin/services/{id}/media-library
POST /api/admin/services/{id}/media-library
DELETE /api/admin/services/{id}/media-library/{album_id}
```
**Body POST**: `{ "album_id": "uuid" }`

---

## Endpoints de référence

```
GET /api/admin/departments
GET /api/admin/users?role=service_head
GET /api/admin/albums
```

---

## Notes d'implémentation

- Un service appartient toujours à un département
- Le responsable peut être différent du responsable de département
- Les coordonnées (email, téléphone) sont affichées sur le site public
- Plusieurs albums peuvent être associés à un service
- L'ordre d'affichage est relatif au département parent
