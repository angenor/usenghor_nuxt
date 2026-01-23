# Plan d'implémentation - Débouchés

> **Route**: `/admin/formations/debouches`
> **Permission**: `programs.view`
> **Service SQL**: `07_academic`
> **Table**: `program_career_opportunities`

---

## Fonctionnalités

### 1. Navigation par programme

- **Sélecteur de programme** en haut de page
  - Dropdown avec recherche
  - Affiche le programme actuellement sélectionné

### 2. Liste des débouchés d'un programme

- **Affichage en cartes** ou **liste**
  - Chaque débouché : Titre + Description
  - Icône ou image optionnelle
  - Boutons : Modifier, Supprimer
  - Réordonnement par drag & drop

### 3. Ajout d'un débouché

- **Formulaire** (modal ou page dédiée)
  - Titre* (ex: "Directeur de projet")
  - Description (détail du métier, secteur, etc.)
  - Position dans la liste

### 4. Modification d'un débouché

- Édition via modal ou formulaire dédié

### 5. Suppression d'un débouché

- Confirmation requise

### 6. Vue globale (optionnel)

- Tableau de tous les débouchés de tous les programmes
- Permet d'identifier les débouchés communs à plusieurs formations

---

## Endpoints FastAPI

### Liste des débouchés d'un programme

```
GET /api/admin/programs/{program_id}/career-opportunities
```
**Réponse**:
```json
[
  {
    "id": "uuid",
    "title": "Directeur de projet",
    "description": "Pilotage de projets de développement...",
    "display_order": 1
  }
]
```

### Création d'un débouché

```
POST /api/admin/programs/{program_id}/career-opportunities
```
**Body**:
```json
{
  "title": "Consultant en développement",
  "description": "Accompagnement des organisations...",
  "display_order": 3
}
```
**Permission**: `programs.edit`

### Modification d'un débouché

```
PUT /api/admin/career-opportunities/{id}
```
**Body**:
```json
{
  "title": "Titre modifié",
  "description": "Description modifiée"
}
```
**Permission**: `programs.edit`

### Suppression d'un débouché

```
DELETE /api/admin/career-opportunities/{id}
```
**Permission**: `programs.edit`

### Réordonnement des débouchés

```
PUT /api/admin/programs/{program_id}/career-opportunities/reorder
```
**Body**:
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```
**Permission**: `programs.edit`

### Vue globale des débouchés (optionnel)

```
GET /api/admin/career-opportunities
```
**Paramètres**:
- `page`, `limit`
- `program_id` (optionnel)
- `search` (optionnel)

---

## Notes d'implémentation

- Interface similaire à celle des compétences
- La description peut inclure :
  - Secteurs d'activité
  - Types d'employeurs
  - Niveau de responsabilité
  - Exemples concrets de postes
- Possibilité d'ajouter des exemples de métiers types par catégorie
- Le nombre de débouchés n'est pas limité mais recommander 5-10 par programme
