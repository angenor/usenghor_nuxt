# Plan d'implémentation - Pays

> **Route**: `/admin/references/pays`
> **Permission**: `admin.settings`
> **Service SQL**: `01_core`
> **Table**: `countries`

---

## Fonctionnalités

### 1. Liste des pays

- **Tableau paginé**
  - Colonnes : Drapeau, Code ISO, Nom (FR), Nom (EN), Nom (AR), Indicatif, Statut, Actions
  - Drapeau généré depuis le code ISO
  - Badge actif/inactif

- **Filtres**
  - Par statut (actif/inactif)
  - Recherche par nom ou code

- **Tri**
  - Par nom (alphabétique)
  - Par code ISO

### 2. Modification d'un pays

- **Formulaire**
  - Code ISO 2* (lecture seule si existant)
  - Code ISO 3
  - Nom français*
  - Nom anglais
  - Nom arabe
  - Indicatif téléphonique
  - Actif (checkbox)

### 3. Activation / Désactivation

- Les pays inactifs n'apparaissent pas dans les sélecteurs
- Utile pour masquer des pays non pertinents

### 4. Import initial

- Import de la liste ISO 3166 complète
- Mise à jour périodique si nécessaire

### 5. Recherche dans les sélecteurs

- Composant réutilisable pour sélectionner un pays
- Recherche par nom ou code
- Affichage du drapeau

---

## Endpoints FastAPI

### Liste des pays

```
GET /api/admin/countries
```
**Paramètres**:
- `page`, `limit`
- `active`: true | false
- `search`
- `sort_by`: name_fr | iso_code
- `sort_order`

**Réponse**:
```json
{
  "items": [
    {
      "id": "uuid",
      "iso_code": "EG",
      "iso_code3": "EGY",
      "name_fr": "Égypte",
      "name_en": "Egypt",
      "name_ar": "مصر",
      "phone_code": "+20",
      "active": true
    },
    {
      "id": "uuid",
      "iso_code": "SN",
      "iso_code3": "SEN",
      "name_fr": "Sénégal",
      "name_en": "Senegal",
      "name_ar": "السنغال",
      "phone_code": "+221",
      "active": true
    }
  ],
  "total": 195
}
```

### Détail d'un pays

```
GET /api/admin/countries/{id}
```

### Création (rare)

```
POST /api/admin/countries
```
**Body**:
```json
{
  "iso_code": "XX",
  "iso_code3": "XXX",
  "name_fr": "Nouveau pays",
  "name_en": "New country",
  "name_ar": "بلد جديد",
  "phone_code": "+999",
  "active": true
}
```

### Modification

```
PUT /api/admin/countries/{id}
```
**Body**: Champs modifiables (noms, indicatif, statut)

### Activation / Désactivation

```
POST /api/admin/countries/{id}/toggle-active
```

### Activation en masse

```
POST /api/admin/countries/bulk-toggle
```
**Body**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "active": true
}
```

### Import ISO 3166

```
POST /api/admin/countries/import-iso
```
**Permission**: `admin.settings`
**Note**: Importe ou met à jour depuis une source officielle

---

### Endpoint public (pour les sélecteurs)

```
GET /api/public/countries
```
**Paramètres**: `search`, `lang` (fr|en|ar)
**Réponse**: Liste des pays actifs pour les formulaires publics

---

## Notes d'implémentation

- Les codes ISO sont la référence internationale (ISO 3166-1)
- Les drapeaux peuvent être générés via des bibliothèques ou CDN
- La liste complète compte environ 250 pays/territoires
- Seuls les pays actifs apparaissent dans les formulaires
- Les traductions en arabe sont importantes pour le site trilingue
- L'indicatif téléphonique inclut le "+" (ex: "+33")
- Prévoir un import initial depuis une source officielle
- La création de nouveaux pays est rare (changements géopolitiques)
