# Plan d'implémentation - Rôles

> **Route**: `/admin/administration/roles`
> **Permission**: `users.roles`
> **Service SQL**: `02_identity`
> **Tables**: `roles`, `role_permissions`

---

## Fonctionnalités

### 1. Liste des rôles

- **Tableau**
  - Colonnes : Nom, Code, Description, Niveau hiérarchique, Utilisateurs, Statut, Actions
  - Compteur d'utilisateurs ayant ce rôle
  - Indicateur actif/inactif

- **Tri**
  - Par niveau hiérarchique
  - Par nom

### 2. Création d'un rôle

- **Formulaire**
  - Code* (unique, snake_case)
  - Nom français*
  - Description
  - Niveau hiérarchique* (0-100, plus élevé = plus de droits)
  - Actif (checkbox)

- **Attribution des permissions**
  - Liste des permissions disponibles
  - Sélection multiple par catégorie
  - Tout sélectionner / Tout désélectionner par catégorie

### 3. Modification d'un rôle

- Même formulaire que la création
- Le code ne devrait pas être modifié (utilisé dans le code)
- Avertissement si modification d'un rôle système

### 4. Suppression d'un rôle

- Impossible si des utilisateurs ont ce rôle
- Confirmation requise
- Les rôles système ne peuvent pas être supprimés

### 5. Duplication d'un rôle

- Copie des permissions
- Utile pour créer des variantes

### 6. Rôles prédéfinis (système)

- `super_admin` : Accès total
- `admin` : Administration générale
- `campus_admin` : Administration d'un campus
- `editor` : Création de contenus
- `moderator` : Modération
- `user` : Utilisateur de base

---

## Endpoints FastAPI

### Liste des rôles

```
GET /api/admin/roles
```
**Paramètres**:
- `active`: true | false
- `sort_by`: hierarchy_level | name_fr | code
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "code": "super_admin",
      "name_fr": "Super Administrateur",
      "description": "Accès complet à toutes les fonctionnalités",
      "hierarchy_level": 100,
      "active": true,
      "users_count": 2,
      "is_system": true
    },
    {
      "id": "uuid",
      "code": "editor",
      "name_fr": "Éditeur",
      "description": "Création et modification de contenus",
      "hierarchy_level": 40,
      "active": true,
      "users_count": 15,
      "is_system": true
    }
  ],
  "total": 6
}
```

### Détail d'un rôle

```
GET /api/admin/roles/{id}
```
**Réponse**: Rôle avec liste des permissions

### Création

```
POST /api/admin/roles
```
**Body**:
```json
{
  "code": "content_manager",
  "name_fr": "Gestionnaire de contenus",
  "description": "Gestion des actualités et événements",
  "hierarchy_level": 45,
  "active": true,
  "permission_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### Modification

```
PUT /api/admin/roles/{id}
```

### Suppression

```
DELETE /api/admin/roles/{id}
```
**Note**: Échec si utilisateurs assignés ou rôle système

### Duplication

```
POST /api/admin/roles/{id}/duplicate
```

### Activation / Désactivation

```
POST /api/admin/roles/{id}/toggle-active
```

### Gestion des permissions d'un rôle

```
GET /api/admin/roles/{id}/permissions
PUT /api/admin/roles/{id}/permissions
```
**Body PUT**: `{ "permission_ids": ["uuid1", "uuid2"] }`

### Utilisateurs d'un rôle

```
GET /api/admin/roles/{id}/users
```
**Paramètres**: `page`, `limit`
**Réponse**: Liste paginée des utilisateurs ayant ce rôle

### Comparaison de rôles (optionnel)

```
GET /api/admin/roles/compare
```
**Paramètres**: `role_ids=uuid1,uuid2`
**Réponse**: Tableau comparatif des permissions

---

## Notes d'implémentation

- Le niveau hiérarchique détermine qui peut modifier qui
- Un utilisateur ne peut pas modifier un rôle de niveau supérieur au sien
- Les rôles système (`is_system`) ne peuvent pas être supprimés
- Le code du rôle est utilisé dans le code applicatif (vérifications)
- La modification des permissions d'un rôle affecte immédiatement tous les utilisateurs
- Prévoir une matrice visuelle des permissions par rôle
- Le `super_admin` a implicitement toutes les permissions
