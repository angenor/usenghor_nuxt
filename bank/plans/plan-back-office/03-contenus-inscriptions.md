# Plan d'implémentation - Inscriptions aux événements

> **Route**: `/admin/contenus/inscriptions`
> **Permission**: `events.view`
> **Service SQL**: `09_content`
> **Table**: `event_registrations`

---

## Fonctionnalités

### 1. Liste des inscriptions

- **Tableau paginé**
  - Colonnes : Événement, Participant, Email, Organisation, Statut, Date inscription, Actions
  - Filtrable par événement
  - Badge de statut coloré

- **Filtres**
  - Par événement (select)
  - Par statut (registered, confirmed, cancelled, attended)
  - Par période d'inscription
  - Recherche textuelle (nom, email, organisation)

- **Actions en masse**
  - Confirmer les inscriptions
  - Annuler les inscriptions
  - Marquer comme "présent"
  - Exporter la liste

### 2. Vue par événement

- **Sélection d'un événement** affiche :
  - Informations de l'événement (titre, date, capacité)
  - Statistiques (inscrits, confirmés, annulés, présents)
  - Jauge de remplissage
  - Liste des inscrits pour cet événement

### 3. Ajout manuel d'une inscription

- **Formulaire**
  - Événement* (select)
  - Utilisateur existant (select autocomplete) OU
  - Nouveau participant :
    - Nom*
    - Prénom*
    - Email*
    - Téléphone
    - Organisation
  - Statut initial

### 4. Modification d'une inscription

- Changement de statut
- Modification des informations (si non-utilisateur)

### 5. Suppression

- Confirmation requise
- Libère une place si capacité limitée

### 6. Émargement (présence)

- Interface de pointage
  - Liste des inscrits avec checkbox
  - Recherche rapide par nom
  - Bouton "Marquer présent" / "Marquer absent"
  - Scan QR code (optionnel, phase 2)

### 7. Export

- Export CSV/Excel de la liste des inscrits
- Export PDF (feuille d'émargement)
- Export badges participants (optionnel)

### 8. Notifications

- Envoi d'email de confirmation
- Envoi de rappel (veille de l'événement)
- Envoi post-événement (remerciements, sondage)

---

## Endpoints FastAPI

### Liste des inscriptions

```
GET /api/admin/event-registrations
```
**Paramètres**:
- `page`, `limit`
- `event_id`: UUID (requis ou optionnel selon le contexte)
- `status`: registered | confirmed | cancelled | attended
- `date_from`, `date_to`
- `search`
- `sort_by`, `sort_order`

### Détail d'une inscription

```
GET /api/admin/event-registrations/{id}
```

### Création d'une inscription

```
POST /api/admin/event-registrations
```
**Body**:
```json
{
  "event_id": "uuid",
  "user_external_id": "uuid",
  "last_name": "Diallo",
  "first_name": "Fatou",
  "email": "fatou@example.com",
  "phone": "+221 77 123 45 67",
  "organization": "Ministère de l'Éducation",
  "status": "registered"
}
```
**Note**: `user_external_id` OU les champs nom/prénom/email
**Permission**: `events.edit`

### Modification d'une inscription

```
PUT /api/admin/event-registrations/{id}
```
**Permission**: `events.edit`

### Suppression d'une inscription

```
DELETE /api/admin/event-registrations/{id}
```
**Permission**: `events.edit`

### Changement de statut

```
POST /api/admin/event-registrations/{id}/status
```
**Body**: `{ "status": "confirmed" }`
**Permission**: `events.edit`

### Changement de statut en masse

```
POST /api/admin/event-registrations/bulk-status
```
**Body**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "status": "confirmed"
}
```
**Permission**: `events.edit`

### Marquer présence (émargement)

```
POST /api/admin/event-registrations/{id}/attendance
```
**Body**: `{ "attended": true }`

### Émargement en masse

```
POST /api/admin/event-registrations/bulk-attendance
```
**Body**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "attended": true
}
```

### Statistiques d'un événement

```
GET /api/admin/events/{event_id}/registration-stats
```
**Réponse**:
```json
{
  "total": 150,
  "registered": 50,
  "confirmed": 80,
  "cancelled": 15,
  "attended": 5,
  "capacity": 200,
  "available_spots": 50
}
```

### Export liste des inscrits

```
GET /api/admin/events/{event_id}/registrations/export
```
**Paramètres**:
- `format`: csv | xlsx
- `status`: filtrer par statut (optionnel)

### Export feuille d'émargement PDF

```
GET /api/admin/events/{event_id}/registrations/attendance-sheet
```

### Envoi d'email aux inscrits

```
POST /api/admin/events/{event_id}/registrations/send-email
```
**Body**:
```json
{
  "type": "confirmation" | "reminder" | "thank_you" | "custom",
  "subject": "Rappel : Conférence demain",
  "message": "Contenu personnalisé...",
  "recipient_filter": {
    "status": ["registered", "confirmed"]
  }
}
```
**Permission**: `events.edit`

---

## Endpoints de référence

```
GET /api/admin/events (pour le select événement)
GET /api/admin/users (pour l'autocomplete utilisateur)
```

---

## Notes d'implémentation

- L'inscription est unique par couple (event_id, email)
- Si l'événement a une capacité max, vérifier les places disponibles
- Les utilisateurs connectés peuvent s'inscrire depuis le site public
- L'émargement peut se faire sur tablette le jour de l'événement
- Les emails utilisent des templates personnalisables
- Prévoir un système de liste d'attente si capacité atteinte
- Le statut "attended" ne peut être défini qu'à partir de la date de l'événement
