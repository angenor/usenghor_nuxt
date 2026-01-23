# Plan d'implémentation - Mentions légales

> **Route**: `/admin/editorial/mentions-legales`
> **Permission**: `editorial.edit`
> **Service SQL**: `12_editorial`
> **Tables**: `editorial_categories`, `editorial_contents`

---

## Fonctionnalités

### 1. Pages légales éditables

- **Mentions légales**
  - Éditeur du site
  - Hébergeur
  - Directeur de publication
  - Propriété intellectuelle

- **Politique de confidentialité**
  - Collecte de données
  - Utilisation des données
  - Cookies
  - Droits des utilisateurs (RGPD)
  - Contact DPO

- **Conditions Générales d'Utilisation (CGU)**
  - Accès au site
  - Propriété intellectuelle
  - Responsabilités
  - Modification des CGU

- **Politique de cookies**
  - Types de cookies utilisés
  - Gestion des préférences
  - Cookies tiers

### 2. Éditeur de contenu

- **Pour chaque page légale**
  - Titre
  - Contenu (éditeur riche / markdown)
  - Date de dernière mise à jour (auto)

### 3. Historique des versions

- Conservation des versions précédentes
- Important pour la conformité légale

### 4. Prévisualisation

- Voir le rendu avant publication

---

## Endpoints FastAPI

### Liste des pages légales

```
GET /api/admin/editorial/legal
```
**Réponse**:
```json
{
  "pages": [
    {
      "id": "uuid",
      "key": "legal_notice",
      "title": "Mentions légales",
      "content": "<h1>Mentions légales</h1><p>...</p>",
      "updated_at": "2024-06-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "key": "privacy_policy",
      "title": "Politique de confidentialité",
      "content": "<h1>Politique de confidentialité</h1><p>...</p>",
      "updated_at": "2024-06-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "key": "terms_of_use",
      "title": "Conditions générales d'utilisation",
      "content": "...",
      "updated_at": "2024-06-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "key": "cookie_policy",
      "title": "Politique de cookies",
      "content": "...",
      "updated_at": "2024-06-15T10:00:00Z"
    }
  ]
}
```

### Récupération d'une page légale

```
GET /api/admin/editorial/legal/{key}
```
**Réponse**: Contenu complet de la page

### Modification d'une page légale

```
PUT /api/admin/editorial/legal/{key}
```
**Body**:
```json
{
  "title": "Mentions légales",
  "content": "<h1>Mentions légales</h1><p>Contenu mis à jour...</p>"
}
```

### Historique des versions

```
GET /api/admin/editorial/legal/{key}/history
```
**Réponse**:
```json
{
  "versions": [
    {
      "id": "uuid",
      "content": "...",
      "modified_by": { "id": "uuid", "name": "Jean Dupont" },
      "modified_at": "2024-06-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "content": "...",
      "modified_by": { "id": "uuid", "name": "Marie Martin" },
      "modified_at": "2023-12-01T14:00:00Z"
    }
  ]
}
```

### Restauration d'une version

```
POST /api/admin/editorial/legal/{key}/restore/{version_id}
```

---

### Endpoints publics

```
GET /api/public/editorial/legal/legal_notice
GET /api/public/editorial/legal/privacy_policy
GET /api/public/editorial/legal/terms_of_use
GET /api/public/editorial/legal/cookie_policy
```

---

## Notes d'implémentation

- Ces contenus utilisent la catégorie "legal" de editorial_categories
- L'historique des versions est obligatoire pour la conformité légale
- La date de mise à jour est affichée publiquement
- L'éditeur doit supporter les titres, listes, liens
- Prévoir des templates de base lors de l'initialisation
- Les pages légales sont accessibles sans authentification
- Le RGPD impose certaines mentions obligatoires dans la politique de confidentialité
