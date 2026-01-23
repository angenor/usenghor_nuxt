# Plan d'implémentation - Statistiques des candidatures

> **Route**: `/admin/candidatures/statistiques`
> **Permission**: `applications.view`
> **Service SQL**: `08_application`
> **Vue SQL**: `v_application_statistics`

---

## Fonctionnalités

### 1. Filtres globaux

- **Période** (date de soumission)
  - Présets : Ce mois, Ce trimestre, Cette année, Année académique
  - Personnalisé : Date début - Date fin

- **Appel à candidatures** (select multiple)

- **Programme** (select multiple)

- **Campus** (select)

### 2. Indicateurs clés (KPIs)

- **Cartes en haut de page**
  - Total des candidatures
  - Candidatures en attente de traitement
  - Taux d'acceptation (%)
  - Taux de complétion des dossiers (%)

### 3. Répartition par statut

- **Graphique en anneau (donut)**
  - submitted, under_review, accepted, rejected, waitlisted, incomplete
  - Affichage des pourcentages et valeurs absolues

### 4. Évolution dans le temps

- **Graphique linéaire**
  - Nombre de candidatures par mois/semaine
  - Comparaison avec la période précédente (optionnel)

### 5. Répartition par programme

- **Graphique en barres horizontales**
  - Top 10 des programmes les plus demandés
  - Avec indication du taux d'acceptation par programme

### 6. Répartition géographique

- **Carte ou tableau**
  - Candidatures par pays de nationalité
  - Top 10 des pays représentés

### 7. Tableau détaillé par appel

- **Tableau récapitulatif**
  - Colonnes : Appel, Total, Soumis, En cours, Acceptés, Rejetés, Liste d'attente
  - Tri par colonne
  - Export CSV

### 8. Statistiques des évaluateurs

- **Tableau**
  - Évaluateur, Dossiers assignés, Dossiers traités, En attente, Temps moyen de traitement

### 9. Export du rapport

- **Export PDF** : Rapport complet avec graphiques
- **Export Excel** : Données brutes avec onglets par section

---

## Endpoints FastAPI

### Statistiques globales

```
GET /api/admin/applications/statistics
```
**Paramètres**:
- `date_from`, `date_to`
- `call_ids`: liste d'UUIDs
- `program_ids`: liste d'UUIDs
- `campus_id`: UUID

**Réponse**:
```json
{
  "total": 450,
  "pending": 85,
  "acceptance_rate": 42.5,
  "completion_rate": 78.3,
  "by_status": {
    "submitted": 85,
    "under_review": 45,
    "accepted": 180,
    "rejected": 95,
    "waitlisted": 25,
    "incomplete": 20
  }
}
```

### Évolution temporelle

```
GET /api/admin/applications/statistics/timeline
```
**Paramètres**:
- `date_from`, `date_to`
- `granularity`: day | week | month
- `call_ids`, `program_ids` (optionnels)

**Réponse**:
```json
{
  "data": [
    { "period": "2025-01", "count": 45 },
    { "period": "2025-02", "count": 62 },
    { "period": "2025-03", "count": 38 }
  ]
}
```

### Statistiques par programme

```
GET /api/admin/applications/statistics/by-program
```
**Paramètres**: filtres standards
**Réponse**:
```json
{
  "data": [
    {
      "program_id": "uuid",
      "program_title": "Master en Gestion de Projet",
      "total": 120,
      "accepted": 48,
      "acceptance_rate": 40.0
    }
  ]
}
```

### Statistiques géographiques

```
GET /api/admin/applications/statistics/by-country
```
**Paramètres**: filtres standards
**Réponse**:
```json
{
  "data": [
    {
      "country_id": "uuid",
      "country_name": "Sénégal",
      "iso_code": "SN",
      "count": 85
    }
  ]
}
```

### Statistiques par appel

```
GET /api/admin/applications/statistics/by-call
```
**Paramètres**: filtres standards
**Réponse**:
```json
{
  "data": [
    {
      "call_id": "uuid",
      "call_title": "Appel Master 2025",
      "total": 150,
      "submitted": 25,
      "under_review": 15,
      "accepted": 80,
      "rejected": 25,
      "waitlisted": 5
    }
  ]
}
```

### Statistiques des évaluateurs

```
GET /api/admin/applications/statistics/by-reviewer
```
**Réponse**:
```json
{
  "data": [
    {
      "reviewer_id": "uuid",
      "reviewer_name": "Jean Dupont",
      "assigned": 50,
      "reviewed": 42,
      "pending": 8,
      "avg_review_time_days": 3.5
    }
  ]
}
```

### Export rapport PDF

```
GET /api/admin/applications/statistics/export/pdf
```
**Paramètres**: filtres standards
**Réponse**: Fichier PDF

### Export données Excel

```
GET /api/admin/applications/statistics/export/xlsx
```
**Paramètres**: filtres standards
**Réponse**: Fichier Excel

---

## Notes d'implémentation

- Utiliser des graphiques interactifs (Chart.js, ApexCharts ou équivalent)
- Les statistiques doivent être calculées côté serveur pour les gros volumes
- Implémenter un système de cache pour les requêtes fréquentes
- Les filtres doivent être persistés dans l'URL pour le partage de liens
- Le rapport PDF doit inclure la date de génération et les filtres appliqués
- Prévoir des comparaisons année N vs année N-1
- Les graphiques doivent être exportables individuellement (PNG)
