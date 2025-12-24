# Modèle Conceptuel de Données - Université Senghor

> Ce document définit la structure des données pour le CMS du site usenghor.
> Compatible avec Firebase Firestore / PostgreSQL / MongoDB.

---

## Légende

```
PK = Clé primaire
FK = Clé étrangère
? = Champ optionnel
[] = Tableau/Array
{} = Objet imbriqué
i18n = Champ multilingue {fr, en, ar}
```

---

## 1. SYSTÈME DE PAGES ET SECTIONS DYNAMIQUES

### 1.1. Page

Collection principale des pages du site.

```
pages
├── id: string (PK)
├── slug: string (unique par locale)
├── type: enum ['static', 'listing', 'detail']
├── template: string? (nom du template Vue)
├── parent_id: string? (FK -> pages.id)
├── title: i18n {fr, en, ar}
├── meta_title: i18n?
├── meta_description: i18n?
├── og_image: string?
├── is_published: boolean
├── published_at: timestamp?
├── order: number (pour tri dans menu)
├── show_in_nav: boolean
├── nav_label: i18n? (si différent du title)
├── sections: PageSection[] (voir 1.2)
├── created_at: timestamp
├── updated_at: timestamp
└── created_by: string (FK -> users.id)
```

### 1.2. PageSection (sous-document de Page)

Sections modulaires activables/désactivables avec ordre personnalisable.

```
PageSection
├── id: string
├── type: enum [
│     'editor_js',        // Contenu riche EditorJS
│     'hero',             // Hero avec image/video background
│     'text_image',       // Texte + Image côte à côte
│     'gallery',          // Galerie d'images
│     'cards_grid',       // Grille de cartes
│     'accordion',        // FAQ / Accordéon
│     'tabs',             // Onglets
│     'timeline',         // Chronologie
│     'team_grid',        // Grille équipe
│     'partners_logos',   // Logos partenaires
│     'cta_banner',       // Bannière call-to-action
│     'stats',            // Chiffres clés
│     'testimonials',     // Témoignages carousel
│     'contact_form',     // Formulaire de contact
│     'map',              // Carte géographique
│     'documents_list',   // Liste de documents PDF
│     'video_embed',      // Vidéo YouTube/Vimeo
│     'custom'            // Section personnalisée
│   ]
├── is_active: boolean
├── order: number
├── anchor: string? (pour navigation #anchor)
├── title: i18n?
├── subtitle: i18n?
├── background: enum ['white', 'gray', 'primary', 'dark', 'image']
├── background_image: string?
├── padding: enum ['none', 'small', 'medium', 'large']
├── content: SectionContent{} (structure selon type, voir 1.3)
└── visibility: enum ['all', 'desktop', 'mobile']
```

### 1.3. SectionContent (polymorphe selon type)

#### Type: editor_js
```
{
  blocks: EditorJSBlock[] // Format EditorJS standard
}
```

#### Type: hero
```
{
  layout: enum ['centered', 'left', 'right', 'fullscreen']
  media_type: enum ['image', 'video', 'slideshow']
  media_url: string
  media_alt: i18n?
  overlay_opacity: number (0-100)
  heading: i18n
  subheading: i18n?
  cta_buttons: [{
    label: i18n
    url: string
    style: enum ['primary', 'secondary', 'outline']
  }]
}
```

#### Type: text_image
```
{
  layout: enum ['image_left', 'image_right']
  image_url: string
  image_alt: i18n?
  content: EditorJSBlock[]
  cta: {
    label: i18n
    url: string
  }?
}
```

#### Type: gallery
```
{
  layout: enum ['grid', 'masonry', 'carousel']
  columns: number (2-4)
  images: [{
    url: string
    alt: i18n?
    caption: i18n?
  }]
}
```

#### Type: cards_grid
```
{
  columns: number (2-4)
  card_style: enum ['simple', 'elevated', 'bordered', 'image_top']
  source: enum ['manual', 'collection']
  collection_ref: string? (FK -> nom collection)
  collection_filter: object?
  collection_limit: number?
  manual_items: [{
    image: string?
    icon: string?
    title: i18n
    description: i18n?
    link_url: string?
    link_label: i18n?
  }]?
}
```

#### Type: accordion
```
{
  items: [{
    title: i18n
    content: EditorJSBlock[]
    is_open_default: boolean
  }]
  allow_multiple: boolean
}
```

#### Type: tabs
```
{
  tabs: [{
    label: i18n
    icon: string?
    content: EditorJSBlock[]
  }]
}
```

#### Type: timeline
```
{
  items: [{
    date: string
    title: i18n
    description: i18n?
    image: string?
  }]
}
```

#### Type: stats
```
{
  items: [{
    value: string
    label: i18n
    icon: string?
    prefix: string?
    suffix: string?
  }]
}
```

#### Type: documents_list
```
{
  documents: [{
    title: i18n
    description: i18n?
    file_url: string
    file_type: enum ['pdf', 'doc', 'xls', 'other']
    file_size: string?
  }]
}
```

#### Type: video_embed
```
{
  provider: enum ['youtube', 'vimeo', 'custom']
  video_id: string
  autoplay: boolean
  show_controls: boolean
  caption: i18n?
}
```

---

## 2. ENTITÉS MÉTIER

### 2.1. Formation

```
formations
├── id: string (PK)
├── slug: string
├── type: enum ['doctorat', 'master', 'du', 'certifiante']
├── title: i18n
├── short_description: i18n
├── department_id: string (FK -> departments.id)
├── campus: enum ['alexandrie', 'externalise', 'en_ligne']
├── campus_externalise_id: string? (FK -> campus_externalises.id)
├── duration: i18n (ex: "2 ans", "18 mois")
├── credits: number? (ECTS)
├── diploma: i18n?
├── admission_requirements: EditorJSBlock[]
├── program_content: EditorJSBlock[]
├── career_opportunities: EditorJSBlock[]
├── application_url: string?
├── brochure_url: string?
├── image: string
├── gallery: string[]?
├── is_published: boolean
├── is_featured: boolean
├── application_open: boolean
├── application_deadline: timestamp?
├── start_date: timestamp?
├── sections: PageSection[] (sections additionnelles)
├── seo: {
│     meta_title: i18n?
│     meta_description: i18n?
│     og_image: string?
│   }
├── created_at: timestamp
└── updated_at: timestamp
```

### 2.2. Département

```
departments
├── id: string (PK)
├── slug: string
├── name: i18n
├── description: i18n?
├── icon: string?
├── color: string? (hex)
├── head_id: string? (FK -> staff.id)
├── order: number
└── is_active: boolean
```

### 2.3. Campus Externalisé

```
campus_externalises
├── id: string (PK)
├── slug: string
├── name: i18n
├── country: string
├── city: i18n
├── address: i18n?
├── description: i18n?
├── image: string?
├── logo: string?
├── website: string?
├── contact_email: string?
├── coordinates: {lat, lng}?
├── is_active: boolean
└── order: number
```

### 2.4. Projet

```
projets
├── id: string (PK)
├── slug: string
├── title: i18n
├── short_description: i18n
├── logo: string?
├── cover_image: string
├── status: enum ['en_cours', 'termine', 'a_venir']
├── start_date: timestamp?
├── end_date: timestamp?
├── budget: string?
├── partners: string[] (FK -> partenaires.id)
├── website: string?
├── sections: PageSection[]
├── is_published: boolean
├── is_featured: boolean
├── seo: {meta_title, meta_description, og_image}
├── created_at: timestamp
└── updated_at: timestamp
```

### 2.5. Actualité / Article

```
actualites
├── id: string (PK)
├── slug: string
├── type: enum ['article', 'communique', 'annonce']
├── title: i18n
├── excerpt: i18n
├── cover_image: string
├── content: EditorJSBlock[]
├── categories: string[] (FK -> categories.id)
├── tags: string[]
├── author_id: string? (FK -> staff.id)
├── is_published: boolean
├── is_featured: boolean
├── published_at: timestamp
├── seo: {meta_title, meta_description, og_image}
├── created_at: timestamp
└── updated_at: timestamp
```

### 2.6. Appel à Candidature

```
appels
├── id: string (PK)
├── slug: string
├── type: enum ['formation', 'bourse', 'stage', 'recrutement', 'autre']
├── title: i18n
├── excerpt: i18n
├── cover_image: string?
├── content: EditorJSBlock[]
├── formation_id: string? (FK -> formations.id)
├── requirements: EditorJSBlock[]?
├── documents_required: [{
│     name: i18n
│     is_mandatory: boolean
│   }]?
├── application_url: string?
├── application_email: string?
├── documents: [{
│     title: i18n
│     file_url: string
│   }]
├── status: enum ['brouillon', 'ouvert', 'clos']
├── open_date: timestamp
├── close_date: timestamp
├── results_date: timestamp?
├── is_published: boolean
├── is_featured: boolean
├── seo: {meta_title, meta_description, og_image}
├── created_at: timestamp
└── updated_at: timestamp
```

### 2.7. Événement

```
evenements
├── id: string (PK)
├── slug: string
├── type: enum ['conference', 'seminaire', 'workshop', 'ceremonie', 'culturel', 'autre']
├── title: i18n
├── excerpt: i18n
├── cover_image: string
├── content: EditorJSBlock[]
├── start_datetime: timestamp
├── end_datetime: timestamp?
├── timezone: string
├── location: {
│     type: enum ['presentiel', 'en_ligne', 'hybride']
│     venue_name: i18n?
│     address: i18n?
│     city: i18n?
│     country: string?
│     coordinates: {lat, lng}?
│     online_url: string?
│   }
├── registration_required: boolean
├── registration_url: string?
├── registration_deadline: timestamp?
├── max_participants: number?
├── is_free: boolean
├── price: string?
├── speakers: [{
│     name: string
│     title: i18n?
│     photo: string?
│     bio: i18n?
│   }]?
├── program: [{
│     time: string
│     title: i18n
│     description: i18n?
│   }]?
├── gallery: string[]? (photos post-événement)
├── video_url: string?
├── status: enum ['a_venir', 'en_cours', 'termine', 'annule']
├── is_published: boolean
├── is_featured: boolean
├── seo: {meta_title, meta_description, og_image}
├── created_at: timestamp
└── updated_at: timestamp
```

---

## 3. PERSONNES ET ORGANISATION

### 3.1. Personnel (Staff)

```
staff
├── id: string (PK)
├── slug: string
├── type: enum ['direction', 'enseignant', 'administratif', 'technique']
├── civility: enum ['M.', 'Mme', 'Dr', 'Pr']
├── first_name: string
├── last_name: string
├── title: i18n (fonction)
├── bio: i18n?
├── photo: string?
├── email: string?
├── phone: string?
├── office: string?
├── department_id: string? (FK -> departments.id)
├── service_id: string? (FK -> services.id)
├── linkedin: string?
├── research_gate: string?
├── orcid: string?
├── publications: [{
│     title: string
│     year: number
│     url: string?
│   }]?
├── is_published: boolean
├── order: number
├── created_at: timestamp
└── updated_at: timestamp
```

### 3.2. Service

```
services
├── id: string (PK)
├── slug: string
├── category: enum ['rectorat', 'academique', 'administratif']
├── name: i18n
├── description: i18n?
├── icon: string?
├── head_id: string? (FK -> staff.id)
├── email: string?
├── phone: string?
├── location: string?
├── order: number
└── is_active: boolean
```

### 3.3. Membre du Conseil d'Administration

```
conseil_administration
├── id: string (PK)
├── civility: enum ['M.', 'Mme', 'Dr', 'Pr', 'S.E.']
├── first_name: string
├── last_name: string
├── title: i18n (fonction)
├── role: enum ['president', 'vice_president', 'membre', 'observateur']
├── representing: i18n (pays ou organisation)
├── country_code: string?
├── photo: string?
├── bio: i18n?
├── order: number
├── is_active: boolean
└── mandate_start: timestamp?
```

### 3.4. Pays Bailleur

```
pays_bailleurs
├── id: string (PK)
├── name: i18n
├── code: string (ISO 3166-1 alpha-2)
├── flag: string?
├── contribution_type: i18n?
├── member_since: number (année)
├── website: string?
├── order: number
└── is_active: boolean
```

### 3.5. Partenaire

```
partenaires
├── id: string (PK)
├── slug: string
├── type: enum ['academique', 'institutionnel', 'entreprise', 'ong']
├── name: i18n
├── description: i18n?
├── logo: string
├── website: string?
├── country: string?
├── partnership_type: i18n? (nature du partenariat)
├── is_strategic: boolean
├── order: number
└── is_active: boolean
```

### 3.6. Alumni

```
alumni
├── id: string (PK)
├── slug: string
├── civility: enum ['M.', 'Mme', 'Dr', 'Pr']
├── first_name: string
├── last_name: string
├── photo: string?
├── promotion: string (ex: "2020")
├── formation_id: string (FK -> formations.id)
├── current_position: i18n?
├── current_organization: string?
├── country: string?
├── testimonial: i18n?
├── linkedin: string?
├── email: string?
├── is_ambassador: boolean
├── is_featured: boolean
├── is_published: boolean
├── consent_given: boolean
└── created_at: timestamp
```

---

## 4. INFRASTRUCTURE CAMPUS

### 4.1. Installation Campus

```
campus_facilities
├── id: string (PK)
├── slug: string
├── type: enum ['logement', 'bibliotheque', 'conference', 'academique', 'sport', 'restauration', 'hotel', 'autre']
├── name: i18n
├── description: i18n
├── features: i18n[]
├── images: string[]
├── capacity: string?
├── opening_hours: i18n?
├── contact_email: string?
├── contact_phone: string?
├── booking_url: string?
├── order: number
└── is_active: boolean
```

---

## 5. DOCUMENTS ET MÉDIAS

### 5.1. Document

```
documents
├── id: string (PK)
├── category: enum ['texte_fondateur', 'charte', 'rapport', 'guide', 'formulaire', 'autre']
├── title: i18n
├── description: i18n?
├── file_url: string
├── file_type: string
├── file_size: number (bytes)
├── language: enum ['fr', 'en', 'ar', 'multi']
├── year: number?
├── is_public: boolean
├── order: number
├── created_at: timestamp
└── updated_at: timestamp
```

### 5.2. Média (pour médiathèque)

```
medias
├── id: string (PK)
├── type: enum ['image', 'video', 'audio']
├── title: i18n?
├── alt: i18n?
├── description: i18n?
├── url: string
├── thumbnail_url: string?
├── mime_type: string
├── file_size: number
├── dimensions: {width, height}?
├── duration: number? (secondes pour video/audio)
├── tags: string[]
├── folder: string?
├── uploaded_by: string (FK -> users.id)
├── created_at: timestamp
└── updated_at: timestamp
```

---

## 6. SYSTÈME ET CONFIGURATION

### 6.1. Utilisateur CMS

```
users
├── id: string (PK)
├── email: string (unique)
├── display_name: string
├── photo_url: string?
├── role: enum ['super_admin', 'admin', 'editor', 'author', 'viewer']
├── permissions: string[]
├── is_active: boolean
├── last_login: timestamp?
├── created_at: timestamp
└── updated_at: timestamp
```

### 6.2. Configuration Globale

```
settings
├── id: 'global' (singleton)
├── site_name: i18n
├── site_description: i18n
├── logo: string
├── logo_dark: string?
├── favicon: string
├── contact: {
│     address: i18n
│     email: string
│     phone: string
│     fax: string?
│   }
├── social_links: [{
│     platform: enum ['facebook', 'twitter', 'linkedin', 'youtube', 'instagram']
│     url: string
│   }]
├── default_og_image: string
├── google_analytics_id: string?
├── maintenance_mode: boolean
└── updated_at: timestamp
```

### 6.3. Menu de Navigation

```
menus
├── id: string (PK)
├── location: enum ['main', 'footer', 'mobile']
├── items: MenuItem[]
└── updated_at: timestamp

MenuItem (récursif)
├── id: string
├── type: enum ['page', 'custom', 'submenu']
├── label: i18n
├── page_id: string? (FK -> pages.id)
├── url: string? (si custom)
├── target: enum ['_self', '_blank']
├── icon: string?
├── children: MenuItem[]?
└── order: number
```

### 6.4. Catégorie

```
categories
├── id: string (PK)
├── slug: string
├── name: i18n
├── description: i18n?
├── parent_id: string? (FK -> categories.id)
├── color: string?
└── order: number
```

---

## 7. DIAGRAMME RELATIONNEL SIMPLIFIÉ

```
                    ┌─────────────┐
                    │   pages     │
                    └──────┬──────┘
                           │ 1:N
                    ┌──────▼──────┐
                    │ PageSection │
                    └─────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐
    │ EditorJS│      │ cards_grid│     │   hero    │
    │ blocks  │      │  (source) │     │  banner   │
    └─────────┘      └─────┬─────┘     └───────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
   ┌─────▼─────┐    ┌──────▼──────┐   ┌──────▼──────┐
   │ formations│    │   staff     │   │ partenaires │
   └─────┬─────┘    └──────┬──────┘   └─────────────┘
         │                 │
         │           ┌─────▼─────┐
         │           │departments│
         │           │ services  │
         │           └───────────┘
         │
   ┌─────▼─────┐
   │  appels   │
   └───────────┘

   ┌───────────┐     ┌───────────┐     ┌───────────┐
   │ actualites│     │evenements │     │  projets  │
   └───────────┘     └───────────┘     └───────────┘

   ┌───────────┐     ┌───────────────┐
   │  alumni   │     │campus_facility│
   └───────────┘     └───────────────┘
```

---

## 8. INDEX RECOMMANDÉS (Firebase/Firestore)

```javascript
// Index composites recommandés
formations: [type, is_published, campus]
formations: [department_id, is_published]
appels: [status, type, close_date]
evenements: [status, start_datetime]
actualites: [is_published, published_at]
staff: [type, department_id, is_published]
pages: [is_published, parent_id]
```

---

## 9. RÈGLES DE VALIDATION

### Slugs
- Format: `[a-z0-9-]+`
- Unique par collection
- Auto-généré depuis le titre si non fourni

### Champs i18n
- `fr` obligatoire (langue par défaut)
- `en` et `ar` optionnels
- Fallback: ar → en → fr

### Images
- Formats acceptés: jpg, png, webp
- Taille max: 5MB
- Dimensions recommandées selon usage

### EditorJS
- Blocs autorisés: paragraph, header, list, image, quote, table, delimiter, warning, code
