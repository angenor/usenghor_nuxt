# Plan d'implémentation - Permissions

> **Route**: `/admin/administration/permissions`
> **Permission**: `users.roles`
> **Service SQL**: `02_identity`
> **Table**: `permissions`

---

## Fonctionnalités

### 1. Liste des permissions

- **Vue groupée par catégorie**
  - Catégories : users, programs, applications, events, news, campuses, partners, etc.
  - Pour chaque permission : Code, Nom, Description

- **Tableau global**
  - Colonnes : Code, Nom, Catégorie, Rôles utilisant cette permission
  - Filtrable par catégorie
  - Recherche textuelle

### 2. Création d'une permission (rare)

- **Formulaire**
  - Code* (unique, format: category.action)
  - Nom français*
  - Description
  - Catégorie*

### 3. Modification d'une permission

- Modification du nom et de la description uniquement
- Le code ne doit pas être modifié (utilisé dans le code)

### 4. Matrice permissions / rôles

- **Vue matricielle**
  - Lignes : Permissions groupées par catégorie
  - Colonnes : Rôles
  - Cases à cocher pour activer/désactiver
  - Modification en masse possible

### 5. Permissions prédéfinies

Selon le fichier `99_data_init.sql` :

#### Catégorie `users`
- `users.view` - Voir les utilisateurs
- `users.create` - Créer des utilisateurs
- `users.edit` - Modifier les utilisateurs
- `users.delete` - Supprimer des utilisateurs
- `users.roles` - Gérer les rôles des utilisateurs

#### Catégorie `programs`
- `programs.view` - Voir les formations
- `programs.create` - Créer des formations
- `programs.edit` - Modifier les formations
- `programs.delete` - Supprimer des formations

#### Catégorie `applications`
- `applications.view` - Voir les candidatures
- `applications.evaluate` - Évaluer les candidatures
- `applications.export` - Exporter les candidatures

#### Catégorie `events`
- `events.view`, `events.create`, `events.edit`, `events.delete`

#### Catégorie `news`
- `news.view`, `news.create`, `news.edit`, `news.delete`

#### Catégorie `campuses`
- `campuses.view`, `campuses.create`, `campuses.edit`, `campuses.delete`

#### Catégorie `partners`
- `partners.view`, `partners.create`, `partners.edit`, `partners.delete`

#### Catégorie `editorial`
- `editorial.view`, `editorial.edit`

#### Catégorie `newsletter`
- `newsletter.view`, `newsletter.create`, `newsletter.send`

#### Catégorie `admin`
- `admin.settings` - Gérer les paramètres
- `admin.audit` - Voir les logs d'audit

---

## Endpoints FastAPI

### Liste des permissions

```
GET /api/admin/permissions
```
**Paramètres**:
- `category`: string (optionnel)
- `search`: string

**Réponse**:
```json
{
  "categories": [
    {
      "code": "users",
      "name": "Gestion des utilisateurs",
      "permissions": [
        {
          "id": "uuid",
          "code": "users.view",
          "name_fr": "Voir les utilisateurs",
          "description": null,
          "roles_count": 4
        },
        {
          "id": "uuid",
          "code": "users.create",
          "name_fr": "Créer des utilisateurs",
          "description": null,
          "roles_count": 2
        }
      ]
    }
  ]
}
```

### Détail d'une permission

```
GET /api/admin/permissions/{id}
```
**Réponse**: Permission avec liste des rôles

### Création (rare, réservé développeurs)

```
POST /api/admin/permissions
```
**Body**:
```json
{
  "code": "projects.view",
  "name_fr": "Voir les projets",
  "description": "Permet de consulter la liste des projets",
  "category": "projects"
}
```

### Modification

```
PUT /api/admin/permissions/{id}
```
**Body**: `{ "name_fr": "...", "description": "..." }`

### Rôles d'une permission

```
GET /api/admin/permissions/{id}/roles
```
**Réponse**: Liste des rôles ayant cette permission

### Matrice permissions/rôles

```
GET /api/admin/permissions/matrix
```
**Réponse**:
```json
{
  "roles": [
    { "id": "uuid", "code": "admin", "name_fr": "Administrateur" },
    { "id": "uuid", "code": "editor", "name_fr": "Éditeur" }
  ],
  "categories": [
    {
      "code": "users",
      "permissions": [
        {
          "id": "uuid",
          "code": "users.view",
          "roles": ["uuid_admin", "uuid_editor"]
        }
      ]
    }
  ]
}
```

### Modification en masse (matrice)

```
PUT /api/admin/permissions/matrix
```
**Body**:
```json
{
  "changes": [
    { "role_id": "uuid", "permission_id": "uuid", "granted": true },
    { "role_id": "uuid", "permission_id": "uuid", "granted": false }
  ]
}
```

---

## Notes d'implémentation

- Les permissions suivent le format `category.action`
- Les actions standard sont : view, create, edit, delete
- La création de permissions est rare (lors d'ajout de fonctionnalités)
- La matrice visuelle facilite la gestion globale
- Le `super_admin` a toutes les permissions implicitement
- Certaines permissions impliquent d'autres (edit implique view)
- Les permissions sont vérifiées côté backend à chaque requête
