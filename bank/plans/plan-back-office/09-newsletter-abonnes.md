# Plan d'implémentation - Abonnés newsletter

> **Route**: `/admin/newsletter/abonnes`
> **Permission**: `newsletter.view`
> **Service SQL**: `11_newsletter`
> **Table**: `newsletter_subscribers`

---

## Fonctionnalités

### 1. Liste des abonnés

- **Tableau paginé**
  - Colonnes : Email, Nom, Prénom, Source, Statut, Date inscription, Actions
  - Badge de statut (actif/désabonné)

- **Filtres**
  - Par statut (actif/désabonné)
  - Par source d'inscription
  - Par période d'inscription
  - Recherche par email/nom

- **Actions en masse**
  - Exporter la liste
  - Désabonner plusieurs
  - Supprimer plusieurs

### 2. Ajout manuel d'un abonné

- **Formulaire**
  - Email*
  - Nom (optionnel)
  - Prénom (optionnel)
  - Lier à un utilisateur existant (optionnel)
  - Source : "manual"

### 3. Modification d'un abonné

- Modification du nom/prénom
- Changement de statut (actif/désabonné)

### 4. Suppression

- Suppression définitive (RGPD)
- Confirmation requise

### 5. Import

- Import CSV d'une liste d'emails
- Validation des emails
- Détection des doublons
- Rapport d'import

### 6. Export

- Export CSV de la liste complète ou filtrée
- Choix des colonnes

---

## Endpoints FastAPI

### Liste des abonnés

```
GET /api/admin/newsletter/subscribers
```
**Paramètres**:
- `page`, `limit`
- `active`: true | false
- `source`: string
- `date_from`, `date_to`
- `search`
- `sort_by`: subscribed_at | email | last_name
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "exemple@email.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "user_external_id": null,
      "active": true,
      "source": "website_form",
      "subscribed_at": "2024-06-15T10:00:00Z",
      "unsubscribed_at": null
    }
  ],
  "total": 3500
}
```

### Détail d'un abonné

```
GET /api/admin/newsletter/subscribers/{id}
```
**Réponse**: Inclut l'historique des campagnes reçues

### Création manuelle

```
POST /api/admin/newsletter/subscribers
```
**Body**:
```json
{
  "email": "nouveau@email.com",
  "first_name": "Marie",
  "last_name": "Martin",
  "user_external_id": null,
  "source": "manual"
}
```

### Modification

```
PUT /api/admin/newsletter/subscribers/{id}
```

### Suppression

```
DELETE /api/admin/newsletter/subscribers/{id}
```

### Désabonnement

```
POST /api/admin/newsletter/subscribers/{id}/unsubscribe
```

### Réabonnement

```
POST /api/admin/newsletter/subscribers/{id}/resubscribe
```

### Actions en masse

```
POST /api/admin/newsletter/subscribers/bulk-action
```
**Body**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "action": "unsubscribe" | "delete"
}
```

### Import CSV

```
POST /api/admin/newsletter/subscribers/import
```
**Body**: FormData avec fichier CSV
**Réponse**:
```json
{
  "imported": 150,
  "duplicates": 25,
  "invalid": 5,
  "errors": [
    { "line": 12, "email": "invalid-email", "error": "Format email invalide" }
  ]
}
```

### Export CSV

```
GET /api/admin/newsletter/subscribers/export
```
**Paramètres**: Mêmes filtres que la liste

### Statistiques globales

```
GET /api/admin/newsletter/subscribers/stats
```
**Réponse**:
```json
{
  "total": 3500,
  "active": 3200,
  "unsubscribed": 300,
  "by_source": {
    "website_form": 2500,
    "manual": 200,
    "import": 800
  },
  "growth_last_month": 150
}
```

### Historique d'un abonné

```
GET /api/admin/newsletter/subscribers/{id}/history
```
**Réponse**:
```json
{
  "campaigns_received": 12,
  "campaigns_opened": 8,
  "last_open": "2025-01-10T14:00:00Z",
  "campaigns": [
    {
      "campaign_id": "uuid",
      "campaign_title": "Newsletter Janvier",
      "sent_at": "2025-01-15T09:00:00Z",
      "opened_at": "2025-01-15T10:30:00Z",
      "clicked_at": null
    }
  ]
}
```

---

## Notes d'implémentation

- L'email est unique (pas de doublons)
- Le token de désinscription est généré automatiquement
- La source permet de suivre l'origine des inscriptions
- Lier à un utilisateur permet de synchroniser les données
- L'import CSV doit valider le format des emails
- Le consentement RGPD doit être tracé
- Prévoir un endpoint public pour l'inscription depuis le site
- Les abonnés désabonnés sont conservés (soft delete) pour éviter les réinscriptions involontaires
