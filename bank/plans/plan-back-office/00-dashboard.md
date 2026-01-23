# Plan d'implémentation - Tableau de bord

> **Route**: `/admin`
> **Permission**: Aucune (accessible à tous les utilisateurs connectés)
> **Service SQL**: Agrégation de tous les services

---

## Fonctionnalités

### 1. Vue d'ensemble des statistiques

- **Compteurs principaux** (cards en haut de page)
  - Nombre de candidatures en attente de traitement
  - Nombre d'événements à venir (30 prochains jours)
  - Nombre d'actualités publiées ce mois
  - Nombre d'utilisateurs actifs

### 2. Candidatures récentes

- Liste des 5 dernières candidatures soumises
- Affichage : numéro de référence, nom candidat, formation, date, statut
- Lien vers la page détail de chaque candidature
- Lien "Voir toutes les candidatures"

### 3. Événements à venir

- Liste des 5 prochains événements
- Affichage : titre, date, lieu, nombre d'inscrits
- Lien vers la page détail de chaque événement
- Lien "Voir tous les événements"

### 4. Actualités récentes

- Liste des 5 dernières actualités (tous statuts)
- Affichage : titre, auteur, date, statut (draft/published)
- Lien vers la page d'édition de chaque actualité
- Lien "Voir toutes les actualités"

### 5. Activité récente (Journal)

- Affichage des 10 dernières actions (audit_logs)
- Filtrable par type d'action (create, update, delete)
- Affichage : utilisateur, action, table concernée, date/heure

### 6. Graphiques (optionnel - phase 2)

- Évolution des candidatures par mois
- Répartition des candidatures par statut
- Répartition des candidatures par formation

---

## Endpoints FastAPI

### Statistiques globales

```
GET /api/admin/dashboard/stats
```
**Réponse**:
```json
{
  "pending_applications": 42,
  "upcoming_events": 8,
  "published_news_this_month": 15,
  "active_users": 234
}
```

### Candidatures récentes

```
GET /api/admin/dashboard/recent-applications
```
**Paramètres**: `limit` (default: 5)
**Réponse**: Liste des candidatures avec infos essentielles

### Événements à venir

```
GET /api/admin/dashboard/upcoming-events
```
**Paramètres**: `limit` (default: 5)
**Réponse**: Liste des événements avec compteur inscriptions

### Actualités récentes

```
GET /api/admin/dashboard/recent-news
```
**Paramètres**: `limit` (default: 5)
**Réponse**: Liste des actualités avec auteur et statut

### Activité récente

```
GET /api/admin/dashboard/recent-activity
```
**Paramètres**: `limit` (default: 10), `action` (optionnel)
**Réponse**: Liste des entrées audit_logs avec détails utilisateur

---

## Notes d'implémentation

- Les données sont récupérées en parallèle pour optimiser le chargement
- Utiliser des vues SQL (`v_application_statistics`, `v_upcoming_events`) quand disponibles
- Implémenter un système de cache côté backend (TTL: 60 secondes)
- Le dashboard doit être responsive (cards empilées sur mobile)
