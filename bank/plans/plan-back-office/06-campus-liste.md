# Plan d'implémentation - Liste des campus

> **Route**: `/admin/campus/liste`
> **Permission**: `campuses.view`
> **Service SQL**: `05_campus`
> **Tables**: `campuses`, `campus_partners`, `campus_media_library`

---

## Fonctionnalités

### 1. Liste des campus

- **Vue en cartes** ou **tableau**
  - Image de couverture
  - Nom, Code, Pays, Ville
  - Responsable
  - Badge "Siège" si is_headquarters
  - Indicateur actif/inactif
  - Actions

- **Filtres**
  - Par pays
  - Par statut (actif/inactif)
  - Recherche textuelle

### 2. Création d'un campus

- **Formulaire**

#### Informations générales
- Code* (unique, ex: "ALX", "DKR")
- Nom*
- Description (éditeur riche)
- Image de couverture (upload)
- Album photos (select ou création)
- Est le siège (checkbox)
- Actif (checkbox)

#### Localisation
- Pays* (select)
- Ville*
- Adresse
- Code postal
- Coordonnées GPS (latitude, longitude)

#### Contact
- Email
- Téléphone

#### Direction
- Responsable / Directeur (select utilisateur)

### 3. Modification d'un campus

- Même formulaire que la création
- Accès aux équipes et partenaires

### 4. Gestion des partenaires du campus

- Association de partenaires existants
- Date de début et fin du partenariat

### 5. Gestion des albums

- Association d'albums pour la médiathèque du campus

### 6. Suppression / Désactivation

- Désactivation recommandée
- Vérifier les dépendances (formations, équipes, événements)

---

## Endpoints FastAPI

### Liste des campus

```
GET /api/admin/campuses
```
**Paramètres**:
- `page`, `limit`
- `country_id`: UUID
- `active`: true | false
- `search`
- `sort_by`: name | code | country
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "code": "ALX",
      "name": "Campus d'Alexandrie",
      "description": "...",
      "cover_image_external_id": "uuid",
      "country": { "id": "uuid", "name": "Égypte", "iso_code": "EG" },
      "city": "Alexandrie",
      "head": { "id": "uuid", "name": "Dr. Ahmed Hassan" },
      "is_headquarters": true,
      "active": true
    }
  ],
  "total": 3
}
```

### Détail d'un campus

```
GET /api/admin/campuses/{id}
```

### Création

```
POST /api/admin/campuses
```
**Body**:
```json
{
  "code": "DKR",
  "name": "Campus de Dakar",
  "description": "<p>Description...</p>",
  "cover_image_external_id": "uuid",
  "album_external_id": "uuid",
  "country_external_id": "uuid",
  "city": "Dakar",
  "address": "Avenue Cheikh Anta Diop",
  "postal_code": "10000",
  "latitude": 14.6937,
  "longitude": -17.4441,
  "email": "dakar@usenghor.org",
  "phone": "+221 33 123 4567",
  "head_external_id": "uuid",
  "is_headquarters": false,
  "active": true
}
```
**Permission**: `campuses.create`

### Modification

```
PUT /api/admin/campuses/{id}
```
**Permission**: `campuses.edit`

### Suppression

```
DELETE /api/admin/campuses/{id}
```
**Permission**: `campuses.delete`

### Activation / Désactivation

```
POST /api/admin/campuses/{id}/toggle-active
```

### Gestion des partenaires du campus

```
GET /api/admin/campuses/{id}/partners
PUT /api/admin/campuses/{id}/partners
```
**Body PUT**:
```json
{
  "partners": [
    {
      "partner_id": "uuid",
      "start_date": "2020-01-01",
      "end_date": null
    }
  ]
}
```

### Gestion de la médiathèque du campus

```
GET /api/admin/campuses/{id}/media-library
POST /api/admin/campuses/{id}/media-library
DELETE /api/admin/campuses/{id}/media-library/{album_id}
```

### Statistiques d'un campus

```
GET /api/admin/campuses/{id}/stats
```
**Réponse**:
```json
{
  "programs_count": 5,
  "team_members_count": 12,
  "partners_count": 8,
  "upcoming_events_count": 3
}
```

---

## Endpoints de référence

```
GET /api/admin/countries
GET /api/admin/users?role=campus_admin
GET /api/admin/partners
GET /api/admin/albums
```

---

## Notes d'implémentation

- Le code campus est utilisé dans les URLs et références
- Un seul campus peut être marqué comme siège (is_headquarters)
- Les coordonnées GPS permettent l'affichage sur une carte
- Les partenaires de campus sont distincts des partenaires de formations
- La désactivation masque le campus du site public mais conserve les données
