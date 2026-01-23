# Plan d'implémentation - Chiffres clés

> **Route**: `/admin/editorial/chiffres-cles`
> **Permission**: `editorial.edit`
> **Service SQL**: `12_editorial`
> **Tables**: `editorial_categories`, `editorial_contents`

---

## Fonctionnalités

### 1. Gestion des chiffres clés

Les chiffres clés sont des statistiques affichées sur le site public (ex: "5000 diplômés", "35 ans d'existence", "54 pays représentés").

- **Liste des chiffres clés**
  - Affichage en cartes ou tableau
  - Clé, Valeur, Description, Année
  - Actions : Modifier, Supprimer

- **Ajout d'un chiffre clé**
  - Clé* (identifiant unique, ex: "graduates_count")
  - Valeur* (le chiffre ou texte)
  - Type de valeur (number, text)
  - Année (optionnel, pour les stats annuelles)
  - Description (pour l'affichage)

- **Modification**
  - Mise à jour de la valeur
  - Historique des modifications conservé

### 2. Types de chiffres communs

- Nombre de diplômés
- Nombre de pays représentés
- Années d'existence
- Nombre de formations
- Nombre de partenaires
- Taux de réussite
- Taux d'insertion professionnelle

### 3. Historique des modifications

- Pour chaque chiffre, voir l'historique des valeurs
- Date de modification, ancienne valeur, nouvelle valeur, modificateur

---

## Endpoints FastAPI

### Liste des chiffres clés

```
GET /api/admin/editorial/statistics
```
**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "key": "graduates_count",
      "value": "5000",
      "value_type": "number",
      "year": 2024,
      "description": "Nombre de diplômés depuis 1990",
      "updated_at": "2024-12-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "key": "countries_count",
      "value": "54",
      "value_type": "number",
      "year": null,
      "description": "Pays africains représentés"
    }
  ]
}
```

### Création

```
POST /api/admin/editorial/statistics
```
**Body**:
```json
{
  "key": "partners_count",
  "value": "150",
  "value_type": "number",
  "year": null,
  "description": "Partenaires internationaux"
}
```

### Modification

```
PUT /api/admin/editorial/statistics/{id}
```
**Body**:
```json
{
  "value": "5200",
  "year": 2025
}
```

### Suppression

```
DELETE /api/admin/editorial/statistics/{id}
```

### Historique d'un chiffre

```
GET /api/admin/editorial/statistics/{id}/history
```
**Réponse**:
```json
{
  "history": [
    {
      "id": "uuid",
      "old_value": "4800",
      "new_value": "5000",
      "modified_by": { "id": "uuid", "name": "Jean Dupont" },
      "modified_at": "2024-12-15T10:00:00Z"
    }
  ]
}
```

---

### Endpoint public (pour le site)

```
GET /api/public/editorial/statistics
```
**Réponse**: Liste des chiffres clés formatés pour affichage

---

## Notes d'implémentation

- Les chiffres clés utilisent la catégorie "statistics" de editorial_categories
- La clé (`key`) doit être unique et stable (utilisée dans le code frontend)
- Le type de valeur permet un formatage approprié (séparateur de milliers, etc.)
- L'année permet de gérer des statistiques annuelles
- L'historique est stocké dans `editorial_contents_history`
- Ces données sont typiquement mises à jour une fois par an
