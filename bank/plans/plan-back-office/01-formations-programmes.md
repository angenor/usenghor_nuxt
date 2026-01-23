# Plan d'implémentation - Programmes de formation

> **Route**: `/admin/formations/programmes`
> **Permission**: `programs.view`
> **Service SQL**: `07_academic`
> **Tables**: `programs`, `program_campuses`, `program_partners`

---

## Fonctionnalités

### 1. Liste des programmes

- **Tableau paginé** des programmes
  - Colonnes : Code, Titre, Type, Département, Statut, Actions
  - Tri par colonne (code, titre, type, statut)
  - Pagination (20 éléments par page)

- **Filtres**
  - Par type (master, doctorate, university_diploma, certificate)
  - Par statut de publication (draft, published, archived)
  - Par département
  - Recherche textuelle (code, titre)

- **Actions en masse**
  - Publier / Dépublier plusieurs programmes
  - Supprimer plusieurs programmes (avec confirmation)

### 2. Création d'un programme

- **Formulaire** avec les champs :
  - Code* (unique, auto-généré suggéré)
  - Titre*
  - Sous-titre
  - Slug* (auto-généré depuis le titre)
  - Type* (select)
  - Description (éditeur riche)
  - Méthodes d'enseignement (éditeur riche)
  - Département (select, référence externe)
  - Coordinateur (select utilisateurs, référence externe)
  - Image de couverture (upload média)
  - Durée en mois
  - Crédits ECTS
  - Diplôme délivré
  - Prérequis (texte)
  - Ordre d'affichage
  - Statut de publication

- **Associations**
  - Campus où se déroule la formation (multi-select)
  - Partenaires de la formation (multi-select avec type de partenariat)

### 3. Modification d'un programme

- Même formulaire que la création
- Historique des modifications visible
- Bouton "Prévisualiser" sur le site public

### 4. Suppression d'un programme

- Confirmation requise
- Vérification des dépendances (candidatures liées)
- Soft delete recommandé (archivage)

### 5. Duplication d'un programme

- Copie de toutes les informations sauf le code/slug
- Permet de créer rapidement des variantes

---

## Endpoints FastAPI

### Liste des programmes

```
GET /api/admin/programs
```
**Paramètres**:
- `page` (default: 1)
- `limit` (default: 20)
- `type` (optionnel): master | doctorate | university_diploma | certificate
- `status` (optionnel): draft | published | archived
- `department_id` (optionnel): UUID
- `search` (optionnel): string
- `sort_by` (default: display_order)
- `sort_order` (default: asc)

**Réponse**:
```json
{
  "items": [...],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

### Détail d'un programme

```
GET /api/admin/programs/{id}
```
**Réponse**: Programme complet avec relations (campuses, partners)

### Création

```
POST /api/admin/programs
```
**Body**: Données du programme
**Permission**: `programs.create`

### Modification

```
PUT /api/admin/programs/{id}
```
**Body**: Données mises à jour
**Permission**: `programs.edit`

### Suppression

```
DELETE /api/admin/programs/{id}
```
**Permission**: `programs.delete`

### Duplication

```
POST /api/admin/programs/{id}/duplicate
```
**Permission**: `programs.create`

### Actions en masse

```
POST /api/admin/programs/bulk-action
```
**Body**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "action": "publish" | "unpublish" | "delete"
}
```
**Permission**: `programs.edit` ou `programs.delete`

### Gestion des campus d'un programme

```
GET /api/admin/programs/{id}/campuses
PUT /api/admin/programs/{id}/campuses
```
**Body PUT**: `{ "campus_ids": ["uuid1", "uuid2"] }`

### Gestion des partenaires d'un programme

```
GET /api/admin/programs/{id}/partners
PUT /api/admin/programs/{id}/partners
```
**Body PUT**:
```json
{
  "partners": [
    { "partner_id": "uuid", "partnership_type": "academic" }
  ]
}
```

---

## Endpoints de référence (pour les selects)

```
GET /api/admin/departments (liste des départements)
GET /api/admin/users?role=coordinator (liste des coordinateurs potentiels)
GET /api/admin/campuses (liste des campus)
GET /api/admin/partners (liste des partenaires)
```

---

## Notes d'implémentation

- Le slug doit être unique et généré automatiquement (slugify du titre)
- Validation côté serveur du code unique
- Les références externes (department, coordinator, etc.) sont validées via API
- Prévoir un état "brouillon" pour les modifications en cours
