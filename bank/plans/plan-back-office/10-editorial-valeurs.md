# Plan d'implémentation - Valeurs

> **Route**: `/admin/editorial/valeurs`
> **Permission**: `editorial.edit`
> **Service SQL**: `12_editorial`
> **Tables**: `editorial_categories`, `editorial_contents`

---

## Fonctionnalités

### 1. Gestion des contenus "Valeurs"

Cette page permet de gérer les textes de présentation de l'université : mission, vision, valeurs fondamentales.

- **Sections éditables**
  - Mission de l'université
  - Vision
  - Valeurs fondamentales (liste)
  - Historique / À propos
  - Mot du recteur

- **Pour chaque section**
  - Titre
  - Contenu (éditeur riche)
  - Ordre d'affichage

### 2. Gestion des valeurs fondamentales

- **Liste des valeurs** (ex: Excellence, Intégrité, Innovation)
  - Titre de la valeur
  - Description
  - Icône (optionnel)
  - Ordre d'affichage
  - Actions : Modifier, Supprimer, Réordonner

### 3. Historique des modifications

- Chaque modification est tracée
- Possibilité de voir les versions précédentes

---

## Endpoints FastAPI

### Liste des contenus "valeurs"

```
GET /api/admin/editorial/values
```
**Réponse**:
```json
{
  "sections": [
    {
      "id": "uuid",
      "key": "mission",
      "value": "<p>L'Université Senghor a pour mission...</p>",
      "value_type": "html",
      "description": "Mission de l'université"
    },
    {
      "id": "uuid",
      "key": "vision",
      "value": "<p>Notre vision est de...</p>",
      "value_type": "html",
      "description": "Vision"
    }
  ],
  "core_values": [
    {
      "id": "uuid",
      "key": "value_excellence",
      "value": "{\"title\": \"Excellence\", \"description\": \"...\", \"icon\": \"star\"}",
      "value_type": "json"
    }
  ]
}
```

### Modification d'une section

```
PUT /api/admin/editorial/values/{key}
```
**Body**:
```json
{
  "value": "<p>Nouveau contenu de la mission...</p>"
}
```

### Gestion des valeurs fondamentales

```
GET /api/admin/editorial/core-values
```
**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Excellence",
      "description": "Nous visons l'excellence dans...",
      "icon": "star",
      "display_order": 1
    }
  ]
}
```

### Ajout d'une valeur fondamentale

```
POST /api/admin/editorial/core-values
```
**Body**:
```json
{
  "title": "Innovation",
  "description": "Nous encourageons l'innovation...",
  "icon": "lightbulb",
  "display_order": 5
}
```

### Modification d'une valeur fondamentale

```
PUT /api/admin/editorial/core-values/{id}
```

### Suppression d'une valeur fondamentale

```
DELETE /api/admin/editorial/core-values/{id}
```

### Réordonnement des valeurs

```
PUT /api/admin/editorial/core-values/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2", "uuid3"] }`

### Historique d'un contenu

```
GET /api/admin/editorial/values/{key}/history
```

---

## Notes d'implémentation

- Ces contenus utilisent la catégorie "values" de editorial_categories
- Les sections principales (mission, vision) sont des clés fixes
- Les valeurs fondamentales sont stockées en JSON pour flexibilité
- L'éditeur riche permet le formatage du texte
- Les icônes proviennent de Lucide Icons
- Ces contenus sont rarement modifiés mais l'historique est important
