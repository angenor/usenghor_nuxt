# Plan d'implémentation - Fichiers médias

> **Route**: `/admin/mediatheque/fichiers`
> **Permission**: `media.view`
> **Service SQL**: `03_media`
> **Table**: `media`

---

## Fonctionnalités

### 1. Galerie des médias

- **Vue en grille** (par défaut)
  - Miniatures pour images/vidéos
  - Icônes pour documents
  - Sélection multiple possible
  - Pagination ou scroll infini

- **Vue en liste**
  - Tableau avec colonnes : Miniature, Nom, Type, Taille, Date, Actions

- **Filtres**
  - Par type (image, video, document, audio, other)
  - Par période d'upload
  - Recherche par nom

- **Tri**
  - Par date (récent en premier)
  - Par nom
  - Par taille

### 2. Upload de fichiers

- **Zone de drag & drop**
  - Support multi-fichiers
  - Barre de progression
  - Validation des formats et tailles

- **Formulaire d'upload**
  - Fichier(s)* (input file multiple)
  - Nom (auto-rempli depuis le fichier)
  - Description
  - Texte alternatif (pour accessibilité)
  - Crédits (photographe, source)

- **Types acceptés**
  - Images : jpg, jpeg, png, gif, webp, svg
  - Vidéos : mp4, webm, mov
  - Documents : pdf, doc, docx, xls, xlsx, ppt, pptx
  - Audio : mp3, wav, ogg

### 3. Détail / Modification d'un média

- **Aperçu** (image, lecteur vidéo, aperçu PDF)
- **Informations**
  - Nom*
  - Description
  - Type (auto-détecté)
  - URL (lecture seule ou modifiable si externe)
  - Taille, dimensions, durée
  - Texte alternatif
  - Crédits
  - Date d'upload

### 4. Suppression

- Confirmation requise
- Vérifier si utilisé ailleurs (actualités, événements, etc.)
- Avertissement si média utilisé

### 5. Actions en masse

- Supprimer plusieurs fichiers
- Télécharger plusieurs fichiers (ZIP)

### 6. Intégration avec autres modules

- Sélecteur de média réutilisable
  - Modal de sélection
  - Filtres rapides
  - Upload inline

---

## Endpoints FastAPI

### Liste des médias

```
GET /api/admin/media
```
**Paramètres**:
- `page`, `limit`
- `type`: image | video | document | audio | other
- `date_from`, `date_to`
- `search`
- `sort_by`: created_at | name | size_bytes
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "photo-campus-alexandrie.jpg",
      "description": "Vue aérienne du campus",
      "type": "image",
      "url": "https://storage.../photo-campus-alexandrie.jpg",
      "is_external_url": false,
      "size_bytes": 2456789,
      "mime_type": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "alt_text": "Campus d'Alexandrie vu du ciel",
      "credits": "© Jean Dupont",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 450
}
```

### Détail d'un média

```
GET /api/admin/media/{id}
```

### Upload d'un fichier

```
POST /api/admin/media/upload
```
**Body**: FormData
- `file`: fichier binaire
- `name`: string (optionnel)
- `description`: string (optionnel)
- `alt_text`: string (optionnel)
- `credits`: string (optionnel)

**Permission**: `media.create` (ou permission générale)

**Réponse**:
```json
{
  "id": "uuid",
  "name": "photo.jpg",
  "url": "https://storage.../photo.jpg",
  "type": "image",
  "size_bytes": 123456
}
```

### Upload multiple

```
POST /api/admin/media/upload-multiple
```
**Body**: FormData avec plusieurs fichiers

### Ajout d'un média externe (URL)

```
POST /api/admin/media/external
```
**Body**:
```json
{
  "name": "Vidéo YouTube",
  "url": "https://youtube.com/watch?v=...",
  "type": "video",
  "is_external_url": true,
  "description": "Conférence inaugurale"
}
```

### Modification

```
PUT /api/admin/media/{id}
```
**Body**: Champs modifiables (nom, description, alt_text, credits)

### Suppression

```
DELETE /api/admin/media/{id}
```

### Suppression multiple

```
POST /api/admin/media/bulk-delete
```
**Body**: `{ "ids": ["uuid1", "uuid2"] }`

### Vérification d'utilisation

```
GET /api/admin/media/{id}/usage
```
**Réponse**:
```json
{
  "is_used": true,
  "usage": [
    { "type": "news", "id": "uuid", "title": "Actualité exemple" },
    { "type": "event", "id": "uuid", "title": "Événement exemple" }
  ]
}
```

### Téléchargement

```
GET /api/admin/media/{id}/download
```

### Téléchargement multiple (ZIP)

```
POST /api/admin/media/download-zip
```
**Body**: `{ "ids": ["uuid1", "uuid2"] }`

---

## Notes d'implémentation

- Stockage sur un service cloud (Firebase Storage, S3, etc.)
- Génération automatique de miniatures pour les images
- Extraction des métadonnées (dimensions, durée, etc.)
- Limite de taille par fichier (ex: 50 Mo pour images, 500 Mo pour vidéos)
- Les URL externes ne sont pas stockées localement
- Le sélecteur de média est un composant réutilisable dans tout le back-office
- Prévoir une gestion des quotas de stockage (optionnel)
- Les crédits sont importants pour le respect des droits d'auteur
