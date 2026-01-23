# Plan d'implémentation - Utilisateurs

> **Route**: `/admin/administration/utilisateurs`
> **Permission**: `users.view`
> **Service SQL**: `02_identity`
> **Tables**: `users`, `user_roles`

---

## Fonctionnalités

### 1. Liste des utilisateurs

- **Tableau paginé**
  - Colonnes : Photo, Nom, Email, Rôles, Campus, Statut, Dernière connexion, Actions
  - Badge de rôle(s)
  - Indicateur email vérifié
  - Indicateur actif/inactif

- **Filtres**
  - Par rôle
  - Par campus (pour les rôles campus_admin)
  - Par statut (actif/inactif)
  - Par statut email (vérifié/non vérifié)
  - Recherche par nom/email

- **Actions en masse**
  - Activer / Désactiver
  - Assigner un rôle

### 2. Création d'un utilisateur

- **Formulaire**

#### Informations personnelles
- Email*
- Mot de passe* (ou génération automatique)
- Civilité
- Nom*
- Prénom*
- Date de naissance
- Photo (upload)

#### Coordonnées
- Téléphone
- WhatsApp
- LinkedIn
- Nationalité (select pays)
- Pays de résidence (select pays)
- Ville
- Adresse

#### Rôles et accès
- Rôles (multi-select)
- Campus de rattachement (si rôle campus_admin)
- Actif (checkbox)

#### Options
- Envoyer un email de bienvenue (checkbox)
- Forcer la vérification de l'email

### 3. Modification d'un utilisateur

- Même formulaire que la création
- Mot de passe modifiable séparément
- Historique des connexions

### 4. Désactivation / Suppression

- Désactivation : conserve les données, bloque la connexion
- Suppression : supprime les données (attention aux dépendances)
- Anonymisation : pour conformité RGPD

### 5. Réinitialisation du mot de passe

- Génération d'un nouveau mot de passe
- Envoi par email
- Ou : envoi d'un lien de réinitialisation

### 6. Profil utilisateur

- Vue détaillée d'un utilisateur
- Rôles et permissions effectives
- Historique d'activité (depuis audit_logs)

---

## Endpoints FastAPI

### Liste des utilisateurs

```
GET /api/admin/users
```
**Paramètres**:
- `page`, `limit`
- `role_id`: UUID
- `campus_id`: UUID
- `active`: true | false
- `email_verified`: true | false
- `search`
- `sort_by`: last_name | email | created_at | last_login_at
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "jean.dupont@example.com",
      "last_name": "Dupont",
      "first_name": "Jean",
      "salutation": "mr",
      "photo_url": "https://...",
      "roles": [
        { "id": "uuid", "code": "admin", "name_fr": "Administrateur" }
      ],
      "campus": { "id": "uuid", "name": "Campus Alexandrie" },
      "active": true,
      "email_verified": true,
      "last_login_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 150
}
```

### Détail d'un utilisateur

```
GET /api/admin/users/{id}
```
**Réponse**: Utilisateur complet avec rôles et permissions

### Création

```
POST /api/admin/users
```
**Body**:
```json
{
  "email": "nouveau@example.com",
  "password": "MotDePasse123!",
  "salutation": "mrs",
  "last_name": "Martin",
  "first_name": "Marie",
  "birth_date": "1985-06-15",
  "phone": "+33 6 12 34 56 78",
  "phone_whatsapp": "+33 6 12 34 56 78",
  "linkedin": "https://linkedin.com/in/marie-martin",
  "nationality_external_id": "uuid",
  "residence_country_external_id": "uuid",
  "city": "Paris",
  "address": "123 rue de la Paix",
  "photo_external_id": "uuid",
  "role_ids": ["uuid1", "uuid2"],
  "campus_external_id": "uuid",
  "active": true,
  "send_welcome_email": true
}
```
**Permission**: `users.create`

### Modification

```
PUT /api/admin/users/{id}
```
**Permission**: `users.edit`

### Suppression

```
DELETE /api/admin/users/{id}
```
**Permission**: `users.delete`
**Note**: Échec si des dépendances critiques existent

### Activation / Désactivation

```
POST /api/admin/users/{id}/toggle-active
```
**Permission**: `users.edit`

### Actions en masse

```
POST /api/admin/users/bulk-action
```
**Body**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "action": "activate" | "deactivate" | "add_role",
  "role_id": "uuid"
}
```

### Gestion des rôles d'un utilisateur

```
GET /api/admin/users/{id}/roles
PUT /api/admin/users/{id}/roles
```
**Body PUT**:
```json
{
  "roles": [
    { "role_id": "uuid", "campus_external_id": null },
    { "role_id": "uuid", "campus_external_id": "uuid" }
  ]
}
```
**Permission**: `users.roles`

### Réinitialisation du mot de passe

```
POST /api/admin/users/{id}/reset-password
```
**Body**: `{ "send_email": true }` ou `{ "new_password": "..." }`
**Permission**: `users.edit`

### Vérification de l'email

```
POST /api/admin/users/{id}/verify-email
```
**Permission**: `users.edit`

### Historique d'activité

```
GET /api/admin/users/{id}/activity
```
**Paramètres**: `page`, `limit`, `date_from`, `date_to`
**Réponse**: Liste des actions depuis audit_logs

### Permissions effectives

```
GET /api/admin/users/{id}/permissions
```
**Réponse**: Liste des permissions issues de tous les rôles

### Anonymisation (RGPD)

```
POST /api/admin/users/{id}/anonymize
```
**Permission**: `users.delete`

---

## Endpoints de référence

```
GET /api/admin/roles
GET /api/admin/campuses
GET /api/admin/countries
```

---

## Notes d'implémentation

- L'email est unique et sert d'identifiant de connexion
- Le mot de passe doit respecter des règles de complexité
- L'email de bienvenue contient un lien de vérification
- Les rôles peuvent être limités à un campus spécifique
- La désactivation est préférable à la suppression
- L'anonymisation remplace les données personnelles par des valeurs génériques
- L'historique d'activité provient de la table audit_logs
- Le dernier login est mis à jour à chaque connexion
