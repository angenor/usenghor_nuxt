# Plan d'implémentation - Journal d'audit

> **Route**: `/admin/administration/audit`
> **Permission**: `admin.audit`
> **Service SQL**: `02_identity`
> **Table**: `audit_logs`

---

## Fonctionnalités

### 1. Liste des événements d'audit

- **Tableau paginé**
  - Colonnes : Date/Heure, Utilisateur, Action, Table, Enregistrement, IP, Actions
  - Badge d'action coloré (create=vert, update=bleu, delete=rouge, login=gris)
  - Horodatage précis

- **Filtres avancés**
  - Par utilisateur
  - Par action (create, update, delete, login, logout)
  - Par table/entité
  - Par période (date début - date fin)
  - Par adresse IP
  - Recherche textuelle

### 2. Détail d'un événement

- **Informations complètes**
  - Date et heure
  - Utilisateur (avec lien vers son profil)
  - Action effectuée
  - Table concernée
  - ID de l'enregistrement
  - Anciennes valeurs (avant modification)
  - Nouvelles valeurs (après modification)
  - Adresse IP
  - User-Agent (navigateur)

- **Diff visuel**
  - Pour les modifications, afficher les changements en surbrillance
  - Ancien vs Nouveau

### 3. Export

- Export CSV/Excel des logs filtrés
- Export PDF pour rapport

### 4. Statistiques

- Nombre d'actions par période
- Actions par utilisateur
- Tables les plus modifiées

### 5. Purge (optionnel)

- Suppression des logs anciens (ex: > 2 ans)
- Archivage avant suppression
- Réservé super_admin

---

## Endpoints FastAPI

### Liste des événements d'audit

```
GET /api/admin/audit-logs
```
**Paramètres**:
- `page`, `limit`
- `user_id`: UUID
- `action`: create | update | delete | login | logout
- `table_name`: string
- `date_from`, `date_to`
- `ip_address`: string
- `search`: string
- `sort_by`: created_at (default)
- `sort_order`: desc (default)

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "Jean Dupont",
        "email": "jean@example.com"
      },
      "action": "update",
      "table_name": "news",
      "record_id": "uuid",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-01-20T14:30:00Z",
      "summary": "Modification de l'actualité 'Conférence 2025'"
    }
  ],
  "total": 15000
}
```

### Détail d'un événement

```
GET /api/admin/audit-logs/{id}
```
**Réponse**:
```json
{
  "id": "uuid",
  "user": { ... },
  "action": "update",
  "table_name": "news",
  "record_id": "uuid",
  "old_values": {
    "title": "Ancien titre",
    "status": "draft"
  },
  "new_values": {
    "title": "Nouveau titre",
    "status": "published"
  },
  "changes": [
    { "field": "title", "old": "Ancien titre", "new": "Nouveau titre" },
    { "field": "status", "old": "draft", "new": "published" }
  ],
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "created_at": "2025-01-20T14:30:00Z"
}
```

### Événements d'un utilisateur

```
GET /api/admin/audit-logs/user/{user_id}
```
**Paramètres**: `page`, `limit`, `date_from`, `date_to`

### Événements d'un enregistrement

```
GET /api/admin/audit-logs/record/{table_name}/{record_id}
```
**Réponse**: Historique complet d'un enregistrement spécifique

### Export

```
GET /api/admin/audit-logs/export
```
**Paramètres**: Mêmes filtres + `format` (csv | xlsx | pdf)

### Statistiques

```
GET /api/admin/audit-logs/statistics
```
**Paramètres**: `date_from`, `date_to`
**Réponse**:
```json
{
  "total_events": 15000,
  "by_action": {
    "create": 3000,
    "update": 10000,
    "delete": 500,
    "login": 1200,
    "logout": 300
  },
  "by_table": [
    { "table": "news", "count": 2500 },
    { "table": "events", "count": 1800 },
    { "table": "applications", "count": 5000 }
  ],
  "by_user": [
    { "user_id": "uuid", "user_name": "Jean Dupont", "count": 450 }
  ],
  "by_day": [
    { "date": "2025-01-20", "count": 150 }
  ]
}
```

### Purge des anciens logs

```
POST /api/admin/audit-logs/purge
```
**Body**: `{ "older_than_days": 730 }`
**Permission**: `super_admin` uniquement
**Note**: Archive les logs avant suppression

---

## Notes d'implémentation

- Les logs sont créés automatiquement par des triggers ou middleware
- Les valeurs sensibles (mots de passe) ne sont pas stockées
- Les logs de connexion incluent succès et échecs
- La rétention des logs doit respecter les obligations légales
- Les logs sont en lecture seule (pas de modification possible)
- Prévoir une pagination efficace pour les gros volumes
- L'export PDF est limité en nombre de lignes
- Le diff visuel utilise une bibliothèque de comparaison JSON
- Les adresses IP peuvent être anonymisées selon les régulations (RGPD)
