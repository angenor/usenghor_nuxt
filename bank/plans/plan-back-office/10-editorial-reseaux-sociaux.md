# Plan d'implémentation - Réseaux sociaux

> **Route**: `/admin/editorial/reseaux-sociaux`
> **Permission**: `editorial.edit`
> **Service SQL**: `12_editorial`
> **Tables**: `editorial_categories`, `editorial_contents`

---

## Fonctionnalités

### 1. Gestion des liens réseaux sociaux

- **Liste des réseaux configurés**
  - Plateforme (Facebook, Twitter/X, LinkedIn, Instagram, YouTube, etc.)
  - URL du profil
  - Actif/Inactif
  - Ordre d'affichage

- **Ajout d'un réseau**
  - Plateforme* (select prédéfini)
  - URL du profil*
  - Actif (checkbox)

- **Modification**
  - Mise à jour de l'URL
  - Activation/Désactivation

- **Suppression**
  - Retrait d'un réseau

### 2. Réseaux supportés

- Facebook
- Twitter / X
- LinkedIn
- Instagram
- YouTube
- TikTok
- WhatsApp (lien vers conversation)
- Telegram
- Autre (personnalisé)

### 3. Réordonnement

- Drag & drop pour définir l'ordre d'affichage dans le footer/header

---

## Endpoints FastAPI

### Liste des réseaux sociaux

```
GET /api/admin/editorial/social-media
```
**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "platform": "facebook",
      "url": "https://facebook.com/usenghor",
      "active": true,
      "display_order": 1
    },
    {
      "id": "uuid",
      "platform": "linkedin",
      "url": "https://linkedin.com/school/usenghor",
      "active": true,
      "display_order": 2
    },
    {
      "id": "uuid",
      "platform": "youtube",
      "url": "https://youtube.com/@usenghor",
      "active": true,
      "display_order": 3
    }
  ]
}
```

### Ajout d'un réseau

```
POST /api/admin/editorial/social-media
```
**Body**:
```json
{
  "platform": "instagram",
  "url": "https://instagram.com/usenghor",
  "active": true,
  "display_order": 4
}
```

### Modification

```
PUT /api/admin/editorial/social-media/{id}
```
**Body**:
```json
{
  "url": "https://instagram.com/usenghor_official",
  "active": true
}
```

### Suppression

```
DELETE /api/admin/editorial/social-media/{id}
```

### Activation/Désactivation

```
POST /api/admin/editorial/social-media/{id}/toggle-active
```

### Réordonnement

```
PUT /api/admin/editorial/social-media/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2", "uuid3"] }`

---

### Endpoint public

```
GET /api/public/editorial/social-media
```
**Réponse**: Liste des réseaux actifs avec icônes

---

## Notes d'implémentation

- Stockage en JSON dans editorial_contents avec catégorie "social_media"
- Les icônes sont déterminées automatiquement selon la plateforme
- Validation de l'URL selon le format de chaque plateforme
- Les réseaux inactifs ne sont pas affichés sur le site public
- Prévoir l'option "Autre" pour des réseaux non listés
- Le WhatsApp peut utiliser un format `wa.me/numéro`
