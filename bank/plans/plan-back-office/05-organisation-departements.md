# Plan d'implémentation - Départements

> **Route**: `/admin/organisation/departements`
> **Permission**: `organization.view`
> **Service SQL**: `04_organization`
> **Table**: `departments`

---

## Fonctionnalités

### 1. Liste des départements

- **Tableau ou vue en cartes**
  - Colonnes : Icône, Nom, Code, Responsable, Services, Statut, Actions
  - Image de couverture en miniature
  - Compteur de services rattachés
  - Indicateur actif/inactif

- **Filtres**
  - Par statut (actif/inactif)
  - Recherche textuelle

- **Tri**
  - Par ordre d'affichage (drag & drop)
  - Par nom, code

### 2. Création d'un département

- **Formulaire**
  - Code* (unique, ex: "DEP-MGT", "DEP-ENV")
  - Nom*
  - Description (éditeur riche)
  - Mission (éditeur riche)
  - Icône (sélecteur Lucide)
  - Image de couverture (upload)
  - Responsable (select utilisateur)
  - Ordre d'affichage
  - Actif (checkbox)

### 3. Modification d'un département

- Même formulaire que la création
- Accès rapide aux services du département

### 4. Suppression / Désactivation

- Désactivation recommandée plutôt que suppression
- Si suppression : vérifier les dépendances (services, formations, projets)

### 5. Gestion de l'ordre

- Réordonnement par drag & drop
- L'ordre impacte l'affichage sur le site public

### 6. Vue des services

- Lien vers la liste des services filtrée par département

---

## Endpoints FastAPI

### Liste des départements

```
GET /api/admin/departments
```
**Paramètres**:
- `page`, `limit` (optionnel, souvent peu de départements)
- `active`: true | false
- `search`
- `sort_by`: display_order | name | code
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "code": "DEP-MGT",
      "name": "Département Management",
      "description": "...",
      "mission": "...",
      "icon_external_id": "uuid",
      "cover_image_external_id": "uuid",
      "head": {
        "id": "uuid",
        "name": "Dr. Jean Dupont"
      },
      "services_count": 5,
      "display_order": 1,
      "active": true
    }
  ],
  "total": 8
}
```

### Détail d'un département

```
GET /api/admin/departments/{id}
```

### Création

```
POST /api/admin/departments
```
**Body**:
```json
{
  "code": "DEP-ENV",
  "name": "Département Environnement",
  "description": "<p>Description...</p>",
  "mission": "<p>Mission du département...</p>",
  "icon_external_id": "uuid",
  "cover_image_external_id": "uuid",
  "head_external_id": "uuid",
  "display_order": 3,
  "active": true
}
```

### Modification

```
PUT /api/admin/departments/{id}
```

### Suppression

```
DELETE /api/admin/departments/{id}
```
**Note**: Échec si des services ou autres entités sont rattachés

### Activation / Désactivation

```
POST /api/admin/departments/{id}/toggle-active
```
**Body**: `{ "active": false }`

### Réordonnement

```
PUT /api/admin/departments/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2", "uuid3"] }`

### Services d'un département

```
GET /api/admin/departments/{id}/services
```

### Statistiques (optionnel)

```
GET /api/admin/departments/{id}/stats
```
**Réponse**:
```json
{
  "services_count": 5,
  "programs_count": 3,
  "projects_count": 8,
  "staff_count": 25
}
```

---

## Endpoints de référence

```
GET /api/admin/users?role=department_head (responsables potentiels)
GET /api/admin/media (pour les icônes et images)
```

---

## Notes d'implémentation

- Le code département doit être unique et stable (utilisé dans les URLs/références)
- Les départements sont rarement supprimés, préférer la désactivation
- Le responsable doit être un utilisateur avec les droits appropriés
- L'ordre d'affichage impacte la navigation publique
- Les icônes et images sont optionnelles mais recommandées pour le site public
