# Plan d'implémentation - Statistiques newsletter

> **Route**: `/admin/newsletter/statistiques`
> **Permission**: `newsletter.view`
> **Service SQL**: `11_newsletter`
> **Tables**: `newsletter_campaigns`, `newsletter_sends`, `newsletter_subscribers`

---

## Fonctionnalités

### 1. Vue d'ensemble

- **Période sélectionnable** (mois, trimestre, année, personnalisé)

- **Indicateurs clés (KPIs)**
  - Nombre total d'abonnés actifs
  - Évolution des abonnés (vs période précédente)
  - Nombre de campagnes envoyées
  - Taux d'ouverture moyen
  - Taux de clic moyen
  - Taux de désinscription

### 2. Évolution des abonnés

- **Graphique linéaire**
  - Nouvelles inscriptions par mois
  - Désinscriptions par mois
  - Croissance nette

### 3. Performance des campagnes

- **Graphique en barres**
  - Comparaison des taux d'ouverture par campagne
  - Comparaison des taux de clics

- **Tableau récapitulatif**
  - Campagnes triées par performance
  - Colonnes : Titre, Date, Destinataires, Ouvertures (%), Clics (%)

### 4. Analyse par source d'inscription

- **Graphique en secteurs**
  - Répartition des abonnés par source
  - website_form, manual, import, etc.

### 5. Meilleures heures d'envoi (optionnel)

- Analyse des heures où les ouvertures sont les plus nombreuses
- Recommandation de créneau d'envoi

### 6. Export du rapport

- Export PDF du rapport complet
- Export Excel des données brutes

---

## Endpoints FastAPI

### Statistiques globales

```
GET /api/admin/newsletter/statistics
```
**Paramètres**:
- `date_from`, `date_to`

**Réponse**:
```json
{
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "subscribers": {
    "total_active": 3200,
    "new_this_period": 150,
    "unsubscribed_this_period": 25,
    "growth_rate": 4.1
  },
  "campaigns": {
    "sent_count": 4,
    "total_emails_sent": 12800,
    "avg_open_rate": 42.5,
    "avg_click_rate": 7.8,
    "avg_unsubscribe_rate": 0.3
  }
}
```

### Évolution des abonnés

```
GET /api/admin/newsletter/statistics/subscribers-evolution
```
**Paramètres**:
- `date_from`, `date_to`
- `granularity`: day | week | month

**Réponse**:
```json
{
  "data": [
    {
      "period": "2025-01",
      "new_subscribers": 180,
      "unsubscribes": 30,
      "net_growth": 150
    }
  ]
}
```

### Performance des campagnes

```
GET /api/admin/newsletter/statistics/campaigns-performance
```
**Paramètres**:
- `date_from`, `date_to`
- `sort_by`: sent_at | open_rate | click_rate
- `sort_order`

**Réponse**:
```json
{
  "data": [
    {
      "campaign_id": "uuid",
      "title": "Newsletter Janvier",
      "sent_at": "2025-01-15",
      "recipient_count": 3200,
      "open_rate": 45.2,
      "click_rate": 8.5
    }
  ]
}
```

### Répartition par source

```
GET /api/admin/newsletter/statistics/by-source
```
**Réponse**:
```json
{
  "data": [
    { "source": "website_form", "count": 2500, "percentage": 78.1 },
    { "source": "import", "count": 500, "percentage": 15.6 },
    { "source": "manual", "count": 200, "percentage": 6.3 }
  ]
}
```

### Analyse des heures d'ouverture (optionnel)

```
GET /api/admin/newsletter/statistics/best-send-times
```
**Réponse**:
```json
{
  "by_hour": [
    { "hour": 9, "open_rate": 48.5 },
    { "hour": 10, "open_rate": 45.2 },
    { "hour": 14, "open_rate": 42.0 }
  ],
  "by_day": [
    { "day": "tuesday", "open_rate": 46.5 },
    { "day": "wednesday", "open_rate": 44.2 }
  ],
  "recommendation": {
    "best_day": "tuesday",
    "best_hour": 9
  }
}
```

### Comparaison de périodes

```
GET /api/admin/newsletter/statistics/compare
```
**Paramètres**:
- `period1_from`, `period1_to`
- `period2_from`, `period2_to`

**Réponse**:
```json
{
  "period1": { ... },
  "period2": { ... },
  "comparison": {
    "subscribers_growth": "+15%",
    "open_rate_change": "+2.5%",
    "click_rate_change": "-0.5%"
  }
}
```

### Export rapport PDF

```
GET /api/admin/newsletter/statistics/export/pdf
```
**Paramètres**: `date_from`, `date_to`

### Export données Excel

```
GET /api/admin/newsletter/statistics/export/xlsx
```
**Paramètres**: `date_from`, `date_to`

---

## Notes d'implémentation

- Les statistiques sont calculées à partir des données de `newsletter_sends`
- Prévoir un système de cache pour les calculs fréquents
- Les graphiques utilisent une bibliothèque comme Chart.js ou ApexCharts
- Les taux sont calculés uniquement sur les emails livrés (hors erreurs)
- L'analyse des heures nécessite suffisamment de données historiques
- Le rapport PDF inclut les graphiques et tableaux
- Les filtres doivent être persistés dans l'URL
