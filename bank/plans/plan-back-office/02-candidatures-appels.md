# Plan d'implémentation - Appels à candidatures

> **Route**: `/admin/candidatures/appels`
> **Permission**: `applications.view`
> **Service SQL**: `08_application`
> **Tables**: `application_calls`, `call_eligibility_criteria`, `call_coverage`, `call_required_documents`, `call_schedule`

---

## Fonctionnalités

### 1. Liste des appels à candidatures

- **Tableau paginé**
  - Colonnes : Titre, Type, Programme, Statut, Date limite, Candidatures, Actions
  - Badge de statut coloré (upcoming/ongoing/closed)
  - Compteur de candidatures reçues

- **Filtres**
  - Par type (application, scholarship, project, recruitment, training)
  - Par statut (upcoming, ongoing, closed)
  - Par programme associé
  - Par statut de publication (draft, published, archived)
  - Recherche textuelle

- **Actions en masse**
  - Publier / Dépublier
  - Fermer des appels

### 2. Création d'un appel

- **Formulaire multi-étapes** ou **onglets**

#### Étape 1 : Informations générales
- Titre*
- Slug* (auto-généré)
- Description (éditeur riche)
- Type* (select)
- Programme associé (select, optionnel)
- Campus associé (select, optionnel)
- Image de couverture (upload)
- Public cible (texte)

#### Étape 2 : Dates et tarifs
- Date d'ouverture
- Date limite de candidature*
- Date de début du programme
- Date de fin du programme
- Frais d'inscription
- Devise (EUR par défaut)

#### Étape 3 : Critères d'éligibilité
- Liste des critères (ajout dynamique)
  - Texte du critère
  - Obligatoire (oui/non)
  - Ordre d'affichage

#### Étape 4 : Prises en charge
- Liste des éléments couverts (ajout dynamique)
  - Élément (ex: "Frais de scolarité")
  - Description
  - Ordre d'affichage

#### Étape 5 : Documents requis
- Liste des documents (ajout dynamique)
  - Nom du document*
  - Description
  - Obligatoire (oui/non)
  - Formats acceptés (ex: pdf,doc,docx)
  - Taille max (Mo)
  - Ordre d'affichage

#### Étape 6 : Calendrier
- Liste des étapes du calendrier (ajout dynamique)
  - Étape*
  - Date de début
  - Date de fin
  - Description
  - Ordre d'affichage

#### Étape 7 : Options de candidature
- Utiliser le formulaire interne (oui/non)
- URL formulaire externe (si non)
- Statut de publication

### 3. Modification d'un appel

- Même formulaire que la création
- Possibilité de rouvrir un appel fermé
- Historique des modifications

### 4. Duplication d'un appel

- Copie complète (critères, documents, calendrier)
- Utile pour les sessions récurrentes

### 5. Aperçu de l'appel

- Vue prévisualisation côté public

---

## Endpoints FastAPI

### Liste des appels

```
GET /api/admin/application-calls
```
**Paramètres**:
- `page`, `limit`
- `type`: application | scholarship | project | recruitment | training
- `status`: upcoming | ongoing | closed
- `publication_status`: draft | published | archived
- `program_id`: UUID (optionnel)
- `search`: string
- `sort_by`, `sort_order`

### Détail d'un appel

```
GET /api/admin/application-calls/{id}
```
**Réponse**: Appel complet avec toutes les relations

### Création

```
POST /api/admin/application-calls
```
**Body**: Toutes les données de l'appel
**Permission**: `applications.evaluate` (ou permission spécifique)

### Modification

```
PUT /api/admin/application-calls/{id}
```
**Permission**: `applications.evaluate`

### Suppression

```
DELETE /api/admin/application-calls/{id}
```
**Permission**: `applications.evaluate`
**Note**: Échec si des candidatures existent

### Duplication

```
POST /api/admin/application-calls/{id}/duplicate
```
**Permission**: `applications.evaluate`

### Gestion des critères d'éligibilité

```
GET /api/admin/application-calls/{id}/eligibility-criteria
POST /api/admin/application-calls/{id}/eligibility-criteria
PUT /api/admin/eligibility-criteria/{id}
DELETE /api/admin/eligibility-criteria/{id}
PUT /api/admin/application-calls/{id}/eligibility-criteria/reorder
```

### Gestion des prises en charge

```
GET /api/admin/application-calls/{id}/coverage
POST /api/admin/application-calls/{id}/coverage
PUT /api/admin/coverage/{id}
DELETE /api/admin/coverage/{id}
PUT /api/admin/application-calls/{id}/coverage/reorder
```

### Gestion des documents requis

```
GET /api/admin/application-calls/{id}/required-documents
POST /api/admin/application-calls/{id}/required-documents
PUT /api/admin/required-documents/{id}
DELETE /api/admin/required-documents/{id}
PUT /api/admin/application-calls/{id}/required-documents/reorder
```

### Gestion du calendrier

```
GET /api/admin/application-calls/{id}/schedule
POST /api/admin/application-calls/{id}/schedule
PUT /api/admin/schedule/{id}
DELETE /api/admin/schedule/{id}
PUT /api/admin/application-calls/{id}/schedule/reorder
```

### Changement de statut

```
POST /api/admin/application-calls/{id}/status
```
**Body**: `{ "status": "ongoing" | "closed" }`

### Statistiques d'un appel

```
GET /api/admin/application-calls/{id}/stats
```
**Réponse**:
```json
{
  "total_applications": 150,
  "by_status": {
    "submitted": 45,
    "under_review": 30,
    "accepted": 50,
    "rejected": 20,
    "waitlisted": 5
  }
}
```

---

## Endpoints de référence

```
GET /api/admin/programs (pour associer un programme)
GET /api/admin/campuses (pour associer un campus)
```

---

## Notes d'implémentation

- Le statut de l'appel est automatiquement mis à jour selon les dates (cron job ou calcul dynamique)
- La suppression d'un appel est interdite s'il a des candidatures
- Le formulaire multi-étapes sauvegarde en brouillon à chaque étape
- Les formats de fichiers acceptés doivent être validés côté serveur
- Prévoir un système de notification pour les administrateurs quand un appel approche de sa date limite
