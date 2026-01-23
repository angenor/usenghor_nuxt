# Plan d'implémentation - Équipes campus

> **Route**: `/admin/campus/equipes`
> **Permission**: `campuses.view`
> **Service SQL**: `05_campus`
> **Table**: `campus_team`

---

## Fonctionnalités

### 1. Navigation par campus

- **Sélecteur de campus** en haut de page
- Affiche l'équipe du campus sélectionné

### 2. Liste des membres de l'équipe

- **Tableau ou vue en cartes**
  - Photo (depuis le profil utilisateur)
  - Nom, Prénom
  - Poste / Fonction
  - Date de début
  - Statut (actif/inactif)
  - Actions

- **Filtres**
  - Par statut (actif/inactif)
  - Recherche textuelle

- **Tri**
  - Par ordre d'affichage (drag & drop)
  - Par nom

### 3. Ajout d'un membre

- **Formulaire**
  - Utilisateur* (select autocomplete)
  - Poste / Fonction*
  - Ordre d'affichage
  - Date de début
  - Date de fin (si départ prévu)
  - Actif (checkbox)

### 4. Modification d'un membre

- Changement de poste
- Mise à jour des dates
- Désactivation

### 5. Suppression

- Retrait de l'équipe (ne supprime pas l'utilisateur)

### 6. Vue globale (tous les campus)

- Tableau avec tous les membres de toutes les équipes
- Filtrable par campus
- Utile pour une vue d'ensemble

---

## Endpoints FastAPI

### Liste des membres d'un campus

```
GET /api/admin/campuses/{campus_id}/team
```
**Paramètres**:
- `active`: true | false
- `search`
- `sort_by`: display_order | name | position
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "first_name": "Ahmed",
        "last_name": "Hassan",
        "email": "ahmed@usenghor.org",
        "photo_url": "https://..."
      },
      "position": "Directeur du campus",
      "display_order": 1,
      "start_date": "2020-01-01",
      "end_date": null,
      "active": true
    }
  ],
  "total": 12
}
```

### Ajout d'un membre

```
POST /api/admin/campuses/{campus_id}/team
```
**Body**:
```json
{
  "user_external_id": "uuid",
  "position": "Responsable administratif",
  "display_order": 5,
  "start_date": "2024-09-01",
  "end_date": null,
  "active": true
}
```
**Permission**: `campuses.edit`

### Modification d'un membre

```
PUT /api/admin/campus-team/{id}
```

### Suppression d'un membre

```
DELETE /api/admin/campus-team/{id}
```

### Réordonnement

```
PUT /api/admin/campuses/{campus_id}/team/reorder
```
**Body**: `{ "order": ["uuid1", "uuid2", "uuid3"] }`

### Activation / Désactivation

```
POST /api/admin/campus-team/{id}/toggle-active
```

### Vue globale (tous les campus)

```
GET /api/admin/campus-team
```
**Paramètres**:
- `page`, `limit`
- `campus_id`: UUID (optionnel)
- `active`: true | false
- `search`

---

## Endpoints de référence

```
GET /api/admin/campuses (pour le sélecteur)
GET /api/admin/users (pour l'autocomplete)
```

---

## Notes d'implémentation

- Un utilisateur peut être membre de plusieurs équipes campus
- Le poste est un texte libre (pas d'enum) pour plus de flexibilité
- Les membres inactifs ne sont pas affichés sur le site public
- L'ordre d'affichage détermine la présentation sur le site
- La photo provient du profil utilisateur (photo_external_id)
- Les dates permettent de gérer l'historique des affectations
