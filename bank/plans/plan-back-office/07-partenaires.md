# Plan d'implémentation - Partenaires

> **Route**: `/admin/partenaires`
> **Permission**: `partners.view`
> **Service SQL**: `06_partner`
> **Table**: `partners`

---

## Fonctionnalités

### 1. Liste des partenaires

- **Tableau ou vue en cartes**
  - Logo
  - Nom
  - Type (opérateur de charte, partenaire campus, programme, projet, autre)
  - Pays
  - Statut (actif/inactif)
  - Actions

- **Filtres**
  - Par type
  - Par pays
  - Par statut (actif/inactif)
  - Recherche textuelle

- **Tri**
  - Par ordre d'affichage
  - Par nom, type, pays

### 2. Création d'un partenaire

- **Formulaire**
  - Nom*
  - Type* (select : charter_operator, campus_partner, program_partner, project_partner, other)
  - Description (éditeur riche)
  - Logo (upload)
  - Pays (select)
  - Site web
  - Email de contact
  - Téléphone
  - Ordre d'affichage
  - Actif (checkbox)

### 3. Modification d'un partenaire

- Même formulaire que la création

### 4. Suppression / Désactivation

- Désactivation recommandée
- Vérifier les associations (campus, formations, projets, événements)

### 5. Vue des associations

- Afficher où le partenaire est utilisé :
  - Campus partenaires
  - Formations partenaires
  - Projets partenaires
  - Événements partenaires

---

## Endpoints FastAPI

### Liste des partenaires

```
GET /api/admin/partners
```
**Paramètres**:
- `page`, `limit`
- `type`: charter_operator | campus_partner | program_partner | project_partner | other
- `country_id`: UUID
- `active`: true | false
- `search`
- `sort_by`: display_order | name | type
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Université de Paris",
      "type": "program_partner",
      "description": "...",
      "logo_external_id": "uuid",
      "logo_url": "https://...",
      "country": { "id": "uuid", "name": "France", "iso_code": "FR" },
      "website": "https://u-paris.fr",
      "email": "contact@u-paris.fr",
      "phone": "+33 1 23 45 67 89",
      "display_order": 1,
      "active": true
    }
  ],
  "total": 45
}
```

### Détail d'un partenaire

```
GET /api/admin/partners/{id}
```

### Création

```
POST /api/admin/partners
```
**Body**:
```json
{
  "name": "Organisation Internationale de la Francophonie",
  "type": "charter_operator",
  "description": "<p>Description...</p>",
  "logo_external_id": "uuid",
  "country_external_id": "uuid",
  "website": "https://www.francophonie.org",
  "email": "contact@francophonie.org",
  "phone": "+33 1 44 37 33 00",
  "display_order": 1,
  "active": true
}
```
**Permission**: `partners.create`

### Modification

```
PUT /api/admin/partners/{id}
```
**Permission**: `partners.edit`

### Suppression

```
DELETE /api/admin/partners/{id}
```
**Permission**: `partners.delete`

### Activation / Désactivation

```
POST /api/admin/partners/{id}/toggle-active
```

### Réordonnement

```
PUT /api/admin/partners/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2", "uuid3"] }`

### Associations d'un partenaire

```
GET /api/admin/partners/{id}/associations
```
**Réponse**:
```json
{
  "campuses": [
    { "id": "uuid", "name": "Campus de Dakar" }
  ],
  "programs": [
    { "id": "uuid", "title": "Master en Gestion" }
  ],
  "projects": [
    { "id": "uuid", "title": "Projet de recherche" }
  ],
  "events": [
    { "id": "uuid", "title": "Conférence annuelle" }
  ]
}
```

---

## Endpoints de référence

```
GET /api/admin/countries
GET /api/admin/media (pour upload logo)
```

---

## Notes d'implémentation

- Les types de partenaires définissent leur rôle :
  - `charter_operator` : Opérateur de la charte (OIF, AUF, etc.)
  - `campus_partner` : Partenaire hébergeant un campus
  - `program_partner` : Partenaire académique pour les formations
  - `project_partner` : Partenaire de projets de recherche
  - `other` : Autres partenariats
- Un partenaire peut avoir plusieurs types d'associations simultanément
- Le logo est affiché sur le site public dans les sections partenaires
- L'ordre d'affichage peut être différent selon le contexte (par type)
- La désactivation masque le partenaire mais conserve les associations historiques
