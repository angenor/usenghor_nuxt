# Plan d'implémentation - Campagnes newsletter

> **Route**: `/admin/newsletter/campagnes`
> **Permission**: `newsletter.view`
> **Service SQL**: `11_newsletter`
> **Tables**: `newsletter_campaigns`, `newsletter_sends`

---

## Fonctionnalités

### 1. Liste des campagnes

- **Tableau paginé**
  - Colonnes : Titre, Objet, Statut, Date d'envoi, Destinataires, Ouvertures, Clics, Actions
  - Badge de statut coloré (draft, scheduled, sent)
  - Statistiques en miniature

- **Filtres**
  - Par statut (draft, scheduled, sent)
  - Par période
  - Recherche par titre/objet

### 2. Création d'une campagne

- **Formulaire multi-étapes** ou **onglets**

#### Étape 1 : Informations de base
- Titre interne* (pour identification)
- Objet de l'email*

#### Étape 2 : Contenu
- **Éditeur de contenu**
  - Version HTML (éditeur WYSIWYG ou éditeur de code)
  - Version texte (générée automatiquement ou manuelle)
  - Prévisualisation responsive (desktop/mobile)
- **Variables dynamiques**
  - `{{first_name}}`, `{{last_name}}`, `{{email}}`
  - `{{unsubscribe_link}}`
- **Templates prédéfinis** (optionnel)

#### Étape 3 : Test
- Envoi d'un email de test à une adresse spécifique
- Vérification du rendu

#### Étape 4 : Programmation
- Envoi immédiat OU
- Programmation (date et heure)

### 3. Modification d'une campagne

- Possible uniquement si statut = draft
- Les campagnes envoyées sont en lecture seule

### 4. Duplication

- Copie du contenu pour une nouvelle campagne

### 5. Suppression

- Possible uniquement si statut = draft
- Les campagnes envoyées ne peuvent pas être supprimées

### 6. Détail d'une campagne envoyée

- Statistiques détaillées
- Liste des destinataires avec statut individuel

---

## Endpoints FastAPI

### Liste des campagnes

```
GET /api/admin/newsletter/campaigns
```
**Paramètres**:
- `page`, `limit`
- `status`: draft | scheduled | sent
- `date_from`, `date_to`
- `search`
- `sort_by`: created_at | sent_at | title
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Newsletter Janvier 2025",
      "subject": "Les actualités de l'Université Senghor",
      "status": "sent",
      "scheduled_send_at": null,
      "sent_at": "2025-01-15T09:00:00Z",
      "recipient_count": 1500,
      "open_count": 650,
      "click_count": 120,
      "open_rate": 43.3,
      "click_rate": 8.0,
      "created_at": "2025-01-10T14:00:00Z"
    }
  ],
  "total": 24
}
```

### Détail d'une campagne

```
GET /api/admin/newsletter/campaigns/{id}
```

### Création

```
POST /api/admin/newsletter/campaigns
```
**Body**:
```json
{
  "title": "Newsletter Février 2025",
  "subject": "Découvrez nos nouvelles formations",
  "html_content": "<html>...</html>",
  "text_content": "Version texte..."
}
```
**Permission**: `newsletter.create`

### Modification

```
PUT /api/admin/newsletter/campaigns/{id}
```
**Note**: Échec si statut != draft
**Permission**: `newsletter.create`

### Suppression

```
DELETE /api/admin/newsletter/campaigns/{id}
```
**Note**: Échec si statut != draft

### Duplication

```
POST /api/admin/newsletter/campaigns/{id}/duplicate
```

### Envoi de test

```
POST /api/admin/newsletter/campaigns/{id}/test
```
**Body**: `{ "email": "test@example.com" }`
**Permission**: `newsletter.create`

### Programmation

```
POST /api/admin/newsletter/campaigns/{id}/schedule
```
**Body**: `{ "send_at": "2025-02-01T09:00:00Z" }`
**Permission**: `newsletter.send`

### Annuler la programmation

```
POST /api/admin/newsletter/campaigns/{id}/unschedule
```
**Permission**: `newsletter.send`

### Envoi immédiat

```
POST /api/admin/newsletter/campaigns/{id}/send
```
**Permission**: `newsletter.send`

### Statistiques détaillées

```
GET /api/admin/newsletter/campaigns/{id}/stats
```
**Réponse**:
```json
{
  "recipient_count": 1500,
  "sent_count": 1498,
  "error_count": 2,
  "open_count": 650,
  "unique_opens": 580,
  "click_count": 120,
  "unique_clicks": 95,
  "open_rate": 43.3,
  "click_rate": 8.0,
  "by_day": [
    { "date": "2025-01-15", "opens": 400, "clicks": 80 },
    { "date": "2025-01-16", "opens": 150, "clicks": 30 }
  ]
}
```

### Destinataires d'une campagne

```
GET /api/admin/newsletter/campaigns/{id}/recipients
```
**Paramètres**:
- `page`, `limit`
- `status`: sent | opened | clicked | error
- `search`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "exemple@email.com",
      "subscriber_name": "Jean Dupont",
      "status": "opened",
      "sent_at": "2025-01-15T09:00:00Z",
      "opened_at": "2025-01-15T10:30:00Z",
      "clicked_at": "2025-01-15T10:35:00Z"
    }
  ],
  "total": 1500
}
```

### Templates (optionnel)

```
GET /api/admin/newsletter/templates
POST /api/admin/newsletter/templates
```

---

## Notes d'implémentation

- L'envoi réel des emails se fait via un service externe (SendGrid, Mailjet, etc.)
- Tracking des ouvertures via pixel invisible
- Tracking des clics via redirection des liens
- Le lien de désinscription doit être obligatoire
- Les variables dynamiques sont remplacées à l'envoi
- La version texte peut être générée automatiquement depuis le HTML
- Prévoir un système de gestion des erreurs d'envoi (bounces)
- Les campagnes programmées sont envoyées par un job cron
