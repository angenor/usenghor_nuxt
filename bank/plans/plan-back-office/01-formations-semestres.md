# Plan d'implémentation - Semestres et Cours

> **Route**: `/admin/formations/semestres`
> **Permission**: `programs.view`
> **Service SQL**: `07_academic`
> **Tables**: `program_semesters`, `program_courses`

---

## Fonctionnalités

### 1. Navigation par programme

- **Sélecteur de programme** en haut de page
  - Dropdown ou recherche autocomplete
  - Affiche le programme actuellement sélectionné
  - Permet de basculer entre les programmes

### 2. Liste des semestres d'un programme

- **Affichage en accordéon** ou **onglets**
  - Chaque semestre est une section dépliable
  - Affichage : Numéro, Titre, Crédits totaux, Nombre de cours
  - Boutons : Modifier, Supprimer, Réordonner (drag & drop)

- **Actions**
  - Ajouter un semestre
  - Réordonner les semestres (drag & drop)

### 3. Gestion d'un semestre

- **Formulaire de création/modification**
  - Numéro* (unique par programme)
  - Titre (ex: "Semestre 1 - Fondamentaux")
  - Crédits totaux
  - Ordre d'affichage

### 4. Liste des cours d'un semestre

- **Tableau** dans chaque section semestre
  - Colonnes : Code, Titre, Crédits, Heures (CM/TD/TP), Coefficient
  - Tri par ordre d'affichage
  - Actions : Modifier, Supprimer, Réordonner

- **Ajout rapide** de cours
  - Formulaire inline ou modal

### 5. Gestion d'un cours (UE)

- **Formulaire de création/modification**
  - Code (optionnel)
  - Titre*
  - Description
  - Crédits ECTS
  - Heures CM (cours magistraux)
  - Heures TD (travaux dirigés)
  - Heures TP (travaux pratiques)
  - Coefficient
  - Ordre d'affichage

### 6. Import/Export (optionnel)

- Export CSV de la maquette pédagogique
- Import CSV pour création en masse

---

## Endpoints FastAPI

### Semestres d'un programme

```
GET /api/admin/programs/{program_id}/semesters
```
**Réponse**: Liste des semestres avec leurs cours

### Création d'un semestre

```
POST /api/admin/programs/{program_id}/semesters
```
**Body**:
```json
{
  "number": 1,
  "title": "Semestre 1 - Fondamentaux",
  "credits": 30,
  "display_order": 1
}
```
**Permission**: `programs.edit`

### Modification d'un semestre

```
PUT /api/admin/semesters/{id}
```
**Permission**: `programs.edit`

### Suppression d'un semestre

```
DELETE /api/admin/semesters/{id}
```
**Permission**: `programs.edit`
**Note**: Supprime aussi tous les cours associés (CASCADE)

### Réordonnement des semestres

```
PUT /api/admin/programs/{program_id}/semesters/reorder
```
**Body**:
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```
**Permission**: `programs.edit`

### Cours d'un semestre

```
GET /api/admin/semesters/{semester_id}/courses
```

### Création d'un cours

```
POST /api/admin/semesters/{semester_id}/courses
```
**Body**:
```json
{
  "code": "UE101",
  "title": "Introduction au management",
  "description": "...",
  "credits": 3,
  "lecture_hours": 20,
  "tutorial_hours": 10,
  "practical_hours": 5,
  "coefficient": 1.5,
  "display_order": 1
}
```
**Permission**: `programs.edit`

### Modification d'un cours

```
PUT /api/admin/courses/{id}
```
**Permission**: `programs.edit`

### Suppression d'un cours

```
DELETE /api/admin/courses/{id}
```
**Permission**: `programs.edit`

### Réordonnement des cours

```
PUT /api/admin/semesters/{semester_id}/courses/reorder
```
**Body**:
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```
**Permission**: `programs.edit`

### Export CSV maquette

```
GET /api/admin/programs/{program_id}/curriculum/export
```
**Réponse**: Fichier CSV

### Import CSV maquette

```
POST /api/admin/programs/{program_id}/curriculum/import
```
**Body**: FormData avec fichier CSV
**Permission**: `programs.edit`

---

## Notes d'implémentation

- L'interface doit permettre une gestion fluide sans rechargement de page
- Le drag & drop utilise un composant de type `vue-draggable` ou `dnd-kit`
- Les calculs de totaux (crédits, heures) sont affichés en temps réel
- Validation : le numéro de semestre doit être unique par programme
- La suppression d'un semestre demande une confirmation (affiche le nombre de cours qui seront supprimés)
