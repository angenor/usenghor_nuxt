# Plan d'implémentation - Actualités

> **Route**: `/admin/contenus/actualites`
> **Permission**: `news.view`
> **Service SQL**: `09_content`
> **Tables**: `news`, `news_media`, `news_tags`

---

## Fonctionnalités

### 1. Liste des actualités

- **Tableau paginé**
  - Colonnes : Image, Titre, Auteur, Tags, Statut, Date publication, Actions
  - Miniature de l'image de couverture
  - Badge de statut coloré (draft/published/archived)
  - Badge highlight (standard/featured/headline)

- **Filtres**
  - Par statut de publication (draft, published, archived)
  - Par statut highlight (standard, featured, headline)
  - Par tag
  - Par auteur
  - Par campus
  - Par département/service
  - Par période de publication
  - Recherche textuelle

- **Actions en masse**
  - Publier / Dépublier
  - Supprimer
  - Assigner des tags

### 2. Création d'une actualité

- **Formulaire**

#### Informations principales
- Titre*
- Slug* (auto-généré)
- Résumé (texte court, 200-300 caractères)
- Contenu* (éditeur riche WYSIWYG)
  - Formatage texte (gras, italique, titres)
  - Listes
  - Liens
  - Images inline
  - Vidéos intégrées
- URL vidéo (YouTube, Vimeo)

#### Médias
- Image de couverture* (upload ou sélection médiathèque)
- Galerie d'images additionnelles (multi-sélection médiathèque)

#### Associations
- Tags (multi-select avec création inline)
- Campus associé (select)
- Département associé (select)
- Service associé (select)
- Événement lié (select)
- Projet lié (select)

#### Publication
- Statut highlight (standard, featured, headline)
- Statut de publication (draft, published, archived)
- Date de publication (programmation possible)
- Visible à partir de (date/heure)

### 3. Modification d'une actualité

- Même formulaire que la création
- Historique des modifications
- Bouton "Prévisualiser"

### 4. Suppression

- Confirmation requise
- Soft delete (archivage) recommandé

### 5. Gestion des mises en avant

- Interface rapide pour changer le statut highlight
- Limite : 1 seule actualité "headline", X actualités "featured"

---

## Endpoints FastAPI

### Liste des actualités

```
GET /api/admin/news
```
**Paramètres**:
- `page`, `limit`
- `status`: draft | published | archived
- `highlight_status`: standard | featured | headline
- `tag_id`: UUID
- `author_id`: UUID
- `campus_id`: UUID
- `department_id`: UUID
- `service_id`: UUID
- `date_from`, `date_to`
- `search`: string
- `sort_by`, `sort_order`

### Détail d'une actualité

```
GET /api/admin/news/{id}
```
**Réponse**: Actualité complète avec médias et tags

### Création

```
POST /api/admin/news
```
**Body**:
```json
{
  "title": "Titre de l'actualité",
  "slug": "titre-de-lactualite",
  "summary": "Résumé court...",
  "content": "<p>Contenu HTML...</p>",
  "video_url": "https://youtube.com/...",
  "cover_image_external_id": "uuid",
  "campus_external_id": "uuid",
  "department_external_id": "uuid",
  "service_external_id": "uuid",
  "event_external_id": "uuid",
  "project_external_id": "uuid",
  "highlight_status": "standard",
  "status": "draft",
  "published_at": "2025-01-20T10:00:00Z",
  "visible_from": "2025-01-20T10:00:00Z",
  "tag_ids": ["uuid1", "uuid2"],
  "media_ids": ["uuid1", "uuid2"]
}
```
**Permission**: `news.create`

### Modification

```
PUT /api/admin/news/{id}
```
**Permission**: `news.edit`

### Suppression

```
DELETE /api/admin/news/{id}
```
**Permission**: `news.delete`

### Actions en masse

```
POST /api/admin/news/bulk-action
```
**Body**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "action": "publish" | "unpublish" | "archive" | "delete"
}
```

### Gestion des tags d'une actualité

```
PUT /api/admin/news/{id}/tags
```
**Body**: `{ "tag_ids": ["uuid1", "uuid2"] }`

### Gestion des médias d'une actualité

```
GET /api/admin/news/{id}/media
PUT /api/admin/news/{id}/media
```
**Body PUT**: `{ "media_ids": ["uuid1", "uuid2"], "order": [0, 1] }`

### Changement de statut highlight

```
POST /api/admin/news/{id}/highlight
```
**Body**: `{ "highlight_status": "featured" }`
**Permission**: `news.edit`

### Publication programmée

```
POST /api/admin/news/{id}/schedule
```
**Body**:
```json
{
  "published_at": "2025-02-01T08:00:00Z",
  "visible_from": "2025-02-01T08:00:00Z"
}
```

---

## Endpoints de référence

```
GET /api/admin/tags (liste des tags)
GET /api/admin/users (liste des auteurs potentiels)
GET /api/admin/campuses
GET /api/admin/departments
GET /api/admin/services
GET /api/admin/events
GET /api/admin/projects
GET /api/admin/media (médiathèque pour sélection)
```

---

## Notes d'implémentation

- L'éditeur riche doit supporter le copier-coller depuis Word
- Les images uploadées dans l'éditeur sont automatiquement ajoutées à la médiathèque
- Le slug est généré automatiquement mais modifiable
- La publication programmée nécessite un job cron côté backend
- Limiter le nombre d'actualités "headline" à 1 et "featured" à 3-5
- Les actualités archivées ne sont plus visibles sur le site public
- L'auteur est automatiquement l'utilisateur connecté (modifiable par admin)
