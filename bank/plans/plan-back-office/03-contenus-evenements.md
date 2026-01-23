# Plan d'implémentation - Événements

> **Route**: `/admin/contenus/evenements`
> **Permission**: `events.view`
> **Service SQL**: `09_content`
> **Tables**: `events`, `event_partners`, `event_media_library`

---

## Fonctionnalités

### 1. Liste des événements

- **Tableau paginé**
  - Colonnes : Image, Titre, Type, Date, Lieu, Inscrits, Statut, Actions
  - Miniature de l'image de couverture
  - Badge de type coloré
  - Indicateur "En ligne" si applicable
  - Compteur d'inscriptions

- **Filtres**
  - Par type (conference, workshop, ceremony, seminar, symposium, other)
  - Par statut de publication (draft, published, archived)
  - Par période (à venir, passés, tous)
  - Par campus
  - Par département
  - Par projet associé
  - Recherche textuelle

- **Vues**
  - Vue liste (tableau)
  - Vue calendrier (optionnel)

- **Actions en masse**
  - Publier / Dépublier
  - Supprimer

### 2. Création d'un événement

- **Formulaire**

#### Informations principales
- Titre*
- Slug* (auto-généré)
- Type* (select)
- Type personnalisé (si "other")
- Description courte
- Contenu détaillé (éditeur riche)
- Image de couverture (upload)

#### Dates et lieu
- Date et heure de début*
- Date et heure de fin
- Événement en ligne (checkbox)
- Si en ligne : Lien visioconférence
- Si présentiel :
  - Lieu / Salle
  - Adresse
  - Ville
  - Pays (select)
  - Coordonnées GPS (latitude, longitude)

#### Inscriptions
- Inscriptions requises (checkbox)
- Si oui :
  - Lien d'inscription externe OU inscription interne
  - Nombre max de participants
- Album photos (select ou création)

#### Associations
- Campus (select)
- Département (select)
- Projet lié (select)
- Organisateur (select utilisateur)
- Partenaires (multi-select)

#### Publication
- Statut de publication

### 3. Modification d'un événement

- Même formulaire que la création
- Accès rapide aux inscriptions

### 4. Duplication

- Pour les événements récurrents

### 5. Gestion des albums photos

- Association d'albums existants
- Création d'album depuis l'événement
- Ajout de photos après l'événement

---

## Endpoints FastAPI

### Liste des événements

```
GET /api/admin/events
```
**Paramètres**:
- `page`, `limit`
- `type`: conference | workshop | ceremony | seminar | symposium | other
- `status`: draft | published | archived
- `period`: upcoming | past | all
- `campus_id`, `department_id`, `project_id`
- `date_from`, `date_to`
- `search`
- `sort_by`, `sort_order`

### Détail d'un événement

```
GET /api/admin/events/{id}
```
**Réponse**: Événement complet avec partenaires et albums

### Création

```
POST /api/admin/events
```
**Body**:
```json
{
  "title": "Conférence sur le développement durable",
  "slug": "conference-developpement-durable-2025",
  "type": "conference",
  "type_other": null,
  "description": "Description courte...",
  "content": "<p>Contenu détaillé...</p>",
  "cover_image_external_id": "uuid",
  "start_date": "2025-03-15T09:00:00Z",
  "end_date": "2025-03-15T17:00:00Z",
  "is_online": false,
  "video_conference_link": null,
  "venue": "Amphithéâtre Léopold Sédar Senghor",
  "address": "1 Place Ahmed Orabi",
  "city": "Alexandrie",
  "country_external_id": "uuid",
  "latitude": 31.2001,
  "longitude": 29.9187,
  "registration_required": true,
  "registration_link": null,
  "max_attendees": 200,
  "campus_external_id": "uuid",
  "department_external_id": "uuid",
  "project_external_id": "uuid",
  "organizer_external_id": "uuid",
  "album_external_id": "uuid",
  "status": "draft",
  "partner_ids": ["uuid1", "uuid2"]
}
```
**Permission**: `events.create`

### Modification

```
PUT /api/admin/events/{id}
```
**Permission**: `events.edit`

### Suppression

```
DELETE /api/admin/events/{id}
```
**Permission**: `events.delete`

### Duplication

```
POST /api/admin/events/{id}/duplicate
```
**Permission**: `events.create`

### Gestion des partenaires

```
GET /api/admin/events/{id}/partners
PUT /api/admin/events/{id}/partners
```
**Body PUT**: `{ "partner_ids": ["uuid1", "uuid2"] }`

### Gestion des albums

```
GET /api/admin/events/{id}/albums
POST /api/admin/events/{id}/albums
DELETE /api/admin/events/{id}/albums/{album_id}
```

### Statistiques d'un événement

```
GET /api/admin/events/{id}/stats
```
**Réponse**:
```json
{
  "registrations_count": 145,
  "confirmed_count": 120,
  "cancelled_count": 10,
  "attended_count": 95,
  "capacity": 200,
  "fill_rate": 72.5
}
```

### Vue calendrier

```
GET /api/admin/events/calendar
```
**Paramètres**:
- `month`: 2025-03
- `campus_id` (optionnel)

**Réponse**:
```json
[
  {
    "id": "uuid",
    "title": "Conférence...",
    "start_date": "2025-03-15T09:00:00Z",
    "end_date": "2025-03-15T17:00:00Z",
    "type": "conference",
    "status": "published"
  }
]
```

---

## Endpoints de référence

```
GET /api/admin/campuses
GET /api/admin/departments
GET /api/admin/projects
GET /api/admin/users (organisateurs)
GET /api/admin/partners
GET /api/admin/albums
GET /api/admin/countries
```

---

## Notes d'implémentation

- Les coordonnées GPS peuvent être récupérées via une API de géocodage
- Le compteur d'inscriptions est mis à jour en temps réel
- La vue calendrier utilise un composant de type FullCalendar
- Les événements passés peuvent toujours être modifiés (ajout photos, etc.)
- Prévoir un système de rappel automatique pour les organisateurs
- Les inscriptions internes sont gérées dans la page "Inscriptions événements"
