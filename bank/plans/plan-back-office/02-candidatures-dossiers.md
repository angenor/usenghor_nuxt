# Plan d'implémentation - Dossiers de candidature

> **Route**: `/admin/candidatures/dossiers`
> **Permission**: `applications.view`
> **Service SQL**: `08_application`
> **Tables**: `applications`, `application_degrees`, `application_documents`

---

## Fonctionnalités

### 1. Liste des candidatures

- **Tableau paginé** avec informations clés
  - Colonnes : Référence, Candidat, Formation, Date soumission, Statut, Évaluateur, Actions
  - Badge de statut coloré
  - Indicateur de documents manquants

- **Filtres avancés**
  - Par appel à candidatures
  - Par programme
  - Par statut (submitted, under_review, accepted, rejected, waitlisted, incomplete)
  - Par évaluateur assigné
  - Par période de soumission
  - Par pays de nationalité
  - Recherche textuelle (nom, email, référence)

- **Actions en masse**
  - Assigner un évaluateur
  - Changer le statut
  - Exporter en CSV/Excel

### 2. Fiche détaillée d'une candidature

- **En-tête**
  - Numéro de référence
  - Statut actuel (modifiable)
  - Date de soumission
  - Appel / Programme concerné

- **Onglet : Informations personnelles**
  - Civilité, Nom, Prénom
  - Date et lieu de naissance
  - Nationalité
  - Situation matrimoniale
  - Coordonnées (adresse, téléphone, email, WhatsApp)

- **Onglet : Situation professionnelle**
  - Statut professionnel
  - Poste actuel
  - Employeur (nom, adresse, contact)
  - Durée d'expérience

- **Onglet : Parcours académique**
  - Plus haut diplôme obtenu
  - Liste des diplômes (tableau)
    - Titre, Année, Institution, Ville, Pays, Spécialisation, Mention

- **Onglet : Documents**
  - Liste des documents soumis
  - Pour chaque document :
    - Nom du document requis
    - Fichier uploadé (lien de téléchargement)
    - Statut de validation (en attente, validé, rejeté)
    - Commentaire de validation
  - Actions : Télécharger, Valider, Rejeter

- **Onglet : Évaluation**
  - Évaluateur assigné (select)
  - Note / Score
  - Commentaires d'évaluation
  - Historique des changements de statut

### 3. Validation des documents

- Interface de revue document par document
- Aperçu du document (PDF viewer intégré si possible)
- Boutons : Valider / Rejeter avec commentaire
- Statut global de complétude du dossier

### 4. Changement de statut

- Workflow de statuts :
  - `submitted` → `under_review` (assignation évaluateur)
  - `under_review` → `accepted` | `rejected` | `waitlisted`
  - `incomplete` (si documents manquants/rejetés)
- Notification par email au candidat (optionnel)

### 5. Export des candidatures

- Export CSV/Excel avec filtres appliqués
- Choix des colonnes à exporter
- Export PDF de la fiche complète d'un candidat

### 6. Impression

- Génération PDF de la fiche de candidature
- Format imprimable pour les commissions

---

## Endpoints FastAPI

### Liste des candidatures

```
GET /api/admin/applications
```
**Paramètres**:
- `page`, `limit`
- `call_id`: UUID
- `program_id`: UUID
- `status`: submitted | under_review | accepted | rejected | waitlisted | incomplete
- `reviewer_id`: UUID
- `date_from`, `date_to`: dates
- `nationality_id`: UUID
- `search`: string
- `sort_by`, `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "reference_number": "APP-2025-000042",
      "last_name": "Diallo",
      "first_name": "Amadou",
      "email": "amadou@example.com",
      "program": { "id": "uuid", "title": "Master en Gestion" },
      "status": "under_review",
      "submitted_at": "2025-01-15T10:30:00Z",
      "reviewer": { "id": "uuid", "name": "Jean Dupont" }
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

### Détail d'une candidature

```
GET /api/admin/applications/{id}
```
**Réponse**: Candidature complète avec diplômes et documents

### Modification d'une candidature

```
PUT /api/admin/applications/{id}
```
**Body**: Champs modifiables (statut, évaluateur, notes)
**Permission**: `applications.evaluate`

### Changement de statut

```
POST /api/admin/applications/{id}/status
```
**Body**:
```json
{
  "status": "accepted",
  "review_notes": "Excellent dossier",
  "review_score": 85.5,
  "notify_candidate": true
}
```
**Permission**: `applications.evaluate`

### Assignation d'un évaluateur

```
POST /api/admin/applications/{id}/assign-reviewer
```
**Body**: `{ "reviewer_id": "uuid" }`
**Permission**: `applications.evaluate`

### Assignation en masse

```
POST /api/admin/applications/bulk-assign
```
**Body**:
```json
{
  "application_ids": ["uuid1", "uuid2"],
  "reviewer_id": "uuid"
}
```
**Permission**: `applications.evaluate`

### Changement de statut en masse

```
POST /api/admin/applications/bulk-status
```
**Body**:
```json
{
  "application_ids": ["uuid1", "uuid2"],
  "status": "under_review"
}
```
**Permission**: `applications.evaluate`

### Gestion des diplômes

```
GET /api/admin/applications/{id}/degrees
POST /api/admin/applications/{id}/degrees
PUT /api/admin/application-degrees/{id}
DELETE /api/admin/application-degrees/{id}
```

### Gestion des documents

```
GET /api/admin/applications/{id}/documents
```

### Validation d'un document

```
POST /api/admin/application-documents/{id}/validate
```
**Body**:
```json
{
  "is_valid": true,
  "validation_comment": "Document conforme"
}
```
**Permission**: `applications.evaluate`

### Téléchargement d'un document

```
GET /api/admin/application-documents/{id}/download
```

### Export des candidatures

```
GET /api/admin/applications/export
```
**Paramètres**: Mêmes filtres que la liste + `format` (csv | xlsx)
**Permission**: `applications.export`

### Export PDF d'une candidature

```
GET /api/admin/applications/{id}/pdf
```
**Permission**: `applications.view`

### Statistiques par évaluateur

```
GET /api/admin/applications/reviewer-stats
```
**Réponse**:
```json
[
  {
    "reviewer_id": "uuid",
    "reviewer_name": "Jean Dupont",
    "assigned": 25,
    "reviewed": 18,
    "pending": 7
  }
]
```

---

## Endpoints de référence

```
GET /api/admin/application-calls (pour filtrer par appel)
GET /api/admin/programs (pour filtrer par programme)
GET /api/admin/users?permission=applications.evaluate (liste des évaluateurs)
GET /api/admin/countries (pour filtrer par nationalité)
```

---

## Notes d'implémentation

- Le numéro de référence est généré automatiquement (trigger SQL)
- Les documents sont stockés de manière sécurisée (accès contrôlé)
- L'historique des changements de statut est conservé dans audit_logs
- Prévoir un système de filtres sauvegardés pour les recherches fréquentes
- Le PDF généré doit être professionnel et imprimable
- Les notifications email utilisent des templates personnalisables
