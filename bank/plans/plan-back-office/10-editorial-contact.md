# Plan d'implémentation - Informations de contact

> **Route**: `/admin/editorial/contact`
> **Permission**: `editorial.edit`
> **Service SQL**: `12_editorial`
> **Tables**: `editorial_categories`, `editorial_contents`

---

## Fonctionnalités

### 1. Gestion des informations de contact

- **Adresse principale (siège)**
  - Adresse complète
  - Code postal
  - Ville
  - Pays
  - Coordonnées GPS (pour carte)

- **Coordonnées**
  - Téléphone principal
  - Téléphone secondaire
  - Fax (si applicable)
  - Email général
  - Email admissions
  - Email partenariats

- **Horaires d'ouverture**
  - Jours d'ouverture
  - Heures d'ouverture
  - Fermetures exceptionnelles

### 2. Contacts par service (optionnel)

- Liste des contacts par département/service
- Permet d'afficher "Contactez le service des admissions"

### 3. Formulaire de contact

- Configuration du formulaire public
  - Destinataires par défaut
  - Sujets prédéfinis
  - Message de confirmation

---

## Endpoints FastAPI

### Récupération des informations de contact

```
GET /api/admin/editorial/contact
```
**Réponse**:
```json
{
  "address": {
    "street": "1 Place Ahmed Orabi",
    "postal_code": "21131",
    "city": "Alexandrie",
    "country": "Égypte",
    "latitude": 31.2001,
    "longitude": 29.9187
  },
  "phones": {
    "main": "+20 3 484 3562",
    "secondary": "+20 3 484 3563",
    "fax": "+20 3 484 3564"
  },
  "emails": {
    "general": "contact@usenghor.org",
    "admissions": "admissions@usenghor.org",
    "partnerships": "partenariats@usenghor.org"
  },
  "hours": {
    "days": "Dimanche - Jeudi",
    "hours": "08h00 - 16h00",
    "timezone": "EET (UTC+2)",
    "closures": "Jours fériés égyptiens"
  },
  "contact_form": {
    "default_recipients": ["contact@usenghor.org"],
    "subjects": [
      "Demande d'information",
      "Admissions",
      "Partenariat",
      "Autre"
    ],
    "confirmation_message": "Votre message a bien été envoyé..."
  }
}
```

### Modification des informations de contact

```
PUT /api/admin/editorial/contact
```
**Body**: Structure complète ou partielle
**Permission**: `editorial.edit`

### Modification de l'adresse

```
PUT /api/admin/editorial/contact/address
```
**Body**:
```json
{
  "street": "1 Place Ahmed Orabi",
  "postal_code": "21131",
  "city": "Alexandrie",
  "country": "Égypte",
  "latitude": 31.2001,
  "longitude": 29.9187
}
```

### Modification des coordonnées

```
PUT /api/admin/editorial/contact/phones
PUT /api/admin/editorial/contact/emails
```

### Modification des horaires

```
PUT /api/admin/editorial/contact/hours
```

### Configuration du formulaire de contact

```
PUT /api/admin/editorial/contact/form-config
```
**Body**:
```json
{
  "default_recipients": ["contact@usenghor.org"],
  "subjects": ["Demande d'information", "Admissions", "Partenariat", "Autre"],
  "confirmation_message": "Merci pour votre message..."
}
```

---

### Endpoint public

```
GET /api/public/editorial/contact
```
**Réponse**: Informations de contact formatées pour le site

---

## Notes d'implémentation

- Ces contenus utilisent la catégorie "contact" de editorial_categories
- Stockage en JSON pour la flexibilité de la structure
- Les coordonnées GPS permettent l'affichage d'une carte interactive
- Le formulaire de contact public envoie à `default_recipients`
- Les sujets prédéfinis facilitent le tri des messages
- Prévoir la validation des formats (email, téléphone)
- Les horaires peuvent inclure un fuseau horaire pour les visiteurs internationaux
