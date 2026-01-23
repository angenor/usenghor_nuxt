# Plan d'implémentation - Albums

> **Route**: `/admin/mediatheque/albums`
> **Permission**: `media.view`
> **Service SQL**: `03_media`
> **Tables**: `albums`, `album_media`

---

## Fonctionnalités

### 1. Liste des albums

- **Vue en cartes**
  - Image de couverture (premier média ou sélectionné)
  - Titre
  - Nombre de médias
  - Statut (draft/published)
  - Actions

- **Filtres**
  - Par statut (draft, published)
  - Recherche par titre

- **Tri**
  - Par date de création
  - Par titre

### 2. Création d'un album

- **Formulaire**
  - Titre*
  - Description
  - Statut de publication (draft/published)

- **Ajout de médias**
  - Sélection depuis la médiathèque
  - Upload direct de nouveaux fichiers
  - Drag & drop pour réordonner

### 3. Modification d'un album

- Modification du titre et description
- Gestion des médias :
  - Ajouter des médias
  - Retirer des médias
  - Réordonner (drag & drop)
  - Définir l'image de couverture

### 4. Suppression d'un album

- Confirmation requise
- Ne supprime pas les médias (seulement les associations)
- Vérifier les utilisations (événements, services, campus, projets)

### 5. Vue de l'album

- Galerie des médias de l'album
- Mode diaporama (optionnel)

---

## Endpoints FastAPI

### Liste des albums

```
GET /api/admin/albums
```
**Paramètres**:
- `page`, `limit`
- `status`: draft | published
- `search`
- `sort_by`: created_at | title
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Cérémonie de remise des diplômes 2024",
      "description": "Photos de la cérémonie...",
      "status": "published",
      "media_count": 45,
      "cover_media": {
        "id": "uuid",
        "url": "https://...",
        "type": "image"
      },
      "created_at": "2024-12-15T10:00:00Z"
    }
  ],
  "total": 25
}
```

### Détail d'un album

```
GET /api/admin/albums/{id}
```
**Réponse**: Album avec liste des médias ordonnés

### Création

```
POST /api/admin/albums
```
**Body**:
```json
{
  "title": "Conférence internationale 2025",
  "description": "Photos et vidéos de l'événement",
  "status": "draft"
}
```

### Modification

```
PUT /api/admin/albums/{id}
```

### Suppression

```
DELETE /api/admin/albums/{id}
```

### Médias d'un album

```
GET /api/admin/albums/{id}/media
```
**Réponse**: Liste ordonnée des médias

### Ajout de médias à un album

```
POST /api/admin/albums/{id}/media
```
**Body**:
```json
{
  "media_ids": ["uuid1", "uuid2"],
  "start_order": 10
}
```

### Retrait d'un média de l'album

```
DELETE /api/admin/albums/{id}/media/{media_id}
```

### Réordonnement des médias

```
PUT /api/admin/albums/{id}/media/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2", "uuid3"] }`

### Définir l'image de couverture

```
POST /api/admin/albums/{id}/cover
```
**Body**: `{ "media_id": "uuid" }`

### Changement de statut

```
POST /api/admin/albums/{id}/status
```
**Body**: `{ "status": "published" }`

### Vérification d'utilisation

```
GET /api/admin/albums/{id}/usage
```
**Réponse**:
```json
{
  "is_used": true,
  "usage": [
    { "type": "event", "id": "uuid", "title": "Conférence 2024" },
    { "type": "campus", "id": "uuid", "name": "Campus Alexandrie" }
  ]
}
```

---

## Notes d'implémentation

- Un album est un regroupement logique de médias
- L'ordre d'affichage est stocké dans `album_media.display_order`
- L'image de couverture est par défaut le premier média, ou peut être définie
- Les albums en "draft" ne sont pas visibles sur le site public
- Un média peut appartenir à plusieurs albums
- La suppression d'un album ne supprime pas les médias eux-mêmes
- Les albums sont utilisés par : événements, services, campus, projets
