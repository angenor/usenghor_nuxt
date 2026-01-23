# Plan d'implémentation - Compétences

> **Route**: `/admin/formations/competences`
> **Permission**: `programs.view`
> **Service SQL**: `07_academic`
> **Table**: `program_skills`

---

## Fonctionnalités

### 1. Navigation par programme

- **Sélecteur de programme** en haut de page
  - Dropdown avec recherche
  - Affiche le programme actuellement sélectionné

### 2. Liste des compétences d'un programme

- **Affichage en liste ordonnée**
  - Chaque compétence : Titre + Description
  - Numérotation automatique (1, 2, 3...)
  - Boutons : Modifier, Supprimer
  - Réordonnement par drag & drop

### 3. Ajout d'une compétence

- **Formulaire** (modal ou inline)
  - Titre* (ex: "Maîtriser les outils de gestion de projet")
  - Description (détail de la compétence)
  - Position dans la liste

### 4. Modification d'une compétence

- Édition inline ou via modal
- Sauvegarde automatique ou bouton de validation

### 5. Suppression d'une compétence

- Confirmation requise
- Réordonnement automatique des positions restantes

### 6. Vue globale (optionnel)

- Affichage de toutes les compétences de tous les programmes
- Tableau avec colonnes : Programme, Compétence
- Utile pour avoir une vue d'ensemble

---

## Endpoints FastAPI

### Liste des compétences d'un programme

```
GET /api/admin/programs/{program_id}/skills
```
**Réponse**:
```json
[
  {
    "id": "uuid",
    "title": "Maîtriser les outils de gestion de projet",
    "description": "...",
    "display_order": 1
  }
]
```

### Création d'une compétence

```
POST /api/admin/programs/{program_id}/skills
```
**Body**:
```json
{
  "title": "Analyser les données financières",
  "description": "Capacité à interpréter les états financiers...",
  "display_order": 5
}
```
**Permission**: `programs.edit`

### Modification d'une compétence

```
PUT /api/admin/skills/{id}
```
**Body**:
```json
{
  "title": "Titre modifié",
  "description": "Description modifiée"
}
```
**Permission**: `programs.edit`

### Suppression d'une compétence

```
DELETE /api/admin/skills/{id}
```
**Permission**: `programs.edit`

### Réordonnement des compétences

```
PUT /api/admin/programs/{program_id}/skills/reorder
```
**Body**:
```json
{
  "order": ["uuid1", "uuid2", "uuid3"]
}
```
**Permission**: `programs.edit`

### Vue globale des compétences (optionnel)

```
GET /api/admin/skills
```
**Paramètres**:
- `page`, `limit`
- `program_id` (optionnel, pour filtrer)
- `search` (optionnel)

---

## Notes d'implémentation

- Interface simple et intuitive (type todo-list)
- Le drag & drop permet de réordonner facilement
- La description peut contenir du texte formaté (markdown light)
- Prévoir une limite raisonnable de compétences par programme (ex: 15-20 max)
- L'ordre d'affichage est automatiquement recalculé après drag & drop
