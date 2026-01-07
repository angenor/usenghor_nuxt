# 07 - Page Nos Partenaires `/a-propos/partenaires`

> Route principale: `/a-propos/partenaires`
> Route détail campus: `/a-propos/partenaires/campus/[slug]`
> Fichier principal: `app/pages/a-propos/partenaires/index.vue`
> Statut: **À implémenter**

---

## Objectif

Créer la page "Nos partenaires" avec deux sous-sections principales :
1. **Campus externalisés** (§1.5.1) - Cartographie interactive avec pages détaillées par campus
2. **Partenaires stratégiques** (§1.5.2) - Grille de partenaires avec filtres par type

---

## Architecture des routes

```
/a-propos/partenaires                    → Page principale (carte + partenaires)
/a-propos/partenaires/campus/[slug]      → Page détaillée d'un campus
```

---

## Section 1 : Page principale `/a-propos/partenaires`

### 1.1 Sections de la page

1. **Hero** - Titre, sous-titre, breadcrumb
2. **TabsNav** - Navigation sticky (intégrer dans la nav existante)
3. **Campus externalisés** - Carte mondiale interactive (réutiliser le pattern de `CampusSection.vue`)
4. **Partenaires stratégiques** - Grille unique avec filtres/badges (tous types, académique, institutionnel, entreprise, ONG)

### 1.2 Composants à créer

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `CampusMapSection` | `components/partners/CampusMapSection.vue` | Carte mondiale avec campus cliquables (basé sur @app/components/CampusSection.vue ) |
| `StrategicPartnersSection` | `components/partners/StrategicPartnersSection.vue` | Grille de partenaires avec filtres |
| `CardPartner` | `components/cards/CardPartner.vue` | Card partenaire avec logo, nom, type, lien |
| `PartnersFilters` | `components/partners/PartnersFilters.vue` | Filtres par type de partenaire |

---

## Section 2 : Page détaillée campus `/a-propos/partenaires/campus/[slug]`

### 2.1 Sections de la page campus

Lorsqu'on clique sur un campus depuis la carte, afficher une page avec les onglets :

1. **Hero Campus** - Image, nom, localisation, description
2. **Tabs internes** :
   - Partenaires locaux
   - Équipe du campus
   - Appels en cours
   - Événements
   - Actualités
   - Médiathèque (Vidéothèque & Photothèque)

### 2.2 Composants à créer pour la page campus

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `CampusHero` | `components/campus/CampusHero.vue` | Hero avec image/carte du campus |
| `CampusTabs` | `components/campus/CampusTabs.vue` | Tabs internes (Partenaires, Équipe, etc.) |
| `CampusPartners` | `components/campus/CampusPartners.vue` | Partenaires associés au campus |
| `CampusTeam` | `components/campus/CampusTeam.vue` | Équipe du campus |
| `CampusCalls` | `components/campus/CampusCalls.vue` | Appels en cours (candidatures, projets) |
| `CampusEvents` | `components/campus/CampusEvents.vue` | Événements à venir et passés |
| `CampusNews` | `components/campus/CampusNews.vue` | Actualités du campus |
| `CampusMedia` | `components/campus/CampusMedia.vue` | Vidéothèque & Photothèque |
| `CardEvent` | `components/cards/CardEvent.vue` | Card événement |
| `CardNews` | `components/cards/CardNews.vue` | Card actualité |
| `CardCall` | `components/cards/CardCall.vue` | Card appel en cours |

---

## Section 3 : Mock Data à créer

### 3.1 Fichiers mock data

| Fichier | Description |
|---------|-------------|
| `bank/mock-data/campus-team.ts` | Équipes des campus externalisés |
| `bank/mock-data/campus-calls.ts` | Appels en cours par campus |
| `bank/mock-data/campus-events.ts` | Événements par campus |
| `bank/mock-data/campus-news.ts` | Actualités par campus |
| `bank/mock-data/campus-media.ts` | Vidéos et photos par campus |

### 3.2 Interfaces TypeScript

```typescript
// campus-team.ts
interface CampusTeamMember {
  id: string
  campus_id: string
  name: string
  role_fr: string
  role_en?: string
  role_ar?: string
  photo: string
  email?: string
}

// campus-calls.ts
interface CampusCall {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  type: 'candidature' | 'projet' | 'bourse'
  deadline: string
  description_fr: string
  description_en?: string
  description_ar?: string
  url?: string
  is_active: boolean
}

// campus-events.ts
interface CampusEvent {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  date: string
  location_fr: string
  location_en?: string
  description_fr: string
  image?: string
  type: 'conference' | 'atelier' | 'ceremonie' | 'autre'
}

// campus-news.ts
interface CampusNews {
  id: string
  campus_id: string
  title_fr: string
  title_en?: string
  title_ar?: string
  date: string
  excerpt_fr: string
  excerpt_en?: string
  image?: string
  url?: string
}

// campus-media.ts
interface CampusMedia {
  id: string
  campus_id: string
  type: 'video' | 'photo'
  title_fr: string
  title_en?: string
  url: string
  thumbnail?: string
  date: string
}
```

---

## Section 4 : Tables SQL (référence)

```sql
-- Partenaires (existant)
CREATE TABLE partenaires (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    partner_type partner_type NOT NULL, -- 'academique', 'institutionnel', 'entreprise', 'ong'
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    description_fr TEXT,
    logo TEXT NOT NULL,
    website VARCHAR(255),
    country CHAR(2),
    is_strategic BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Campus Externalisés (existant)
CREATE TABLE campus_externalises (
    id UUID PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    country CHAR(2) NOT NULL,
    city_fr VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## Section 5 : i18n

### 5.1 Fichiers de traduction à créer

- `i18n/locales/fr/partners.json`
- `i18n/locales/en/partners.json`
- `i18n/locales/ar/partners.json`

### 5.2 Structure des clés i18n

```json
{
  "partners": {
    "seo": {
      "title": "Nos partenaires | Université Senghor",
      "description": "Découvrez nos campus externalisés et partenaires stratégiques"
    },
    "hero": {
      "badge": "Réseau mondial",
      "title": "Nos partenaires",
      "subtitle": "Un réseau international au service de l'excellence francophone"
    },
    "campus": {
      "title": "Campus externalisés",
      "subtitle": "Notre présence à travers le monde francophone",
      "viewDetails": "Voir le campus",
      "tabs": {
        "partners": "Partenaires",
        "team": "Équipe",
        "calls": "Appels en cours",
        "events": "Événements",
        "news": "Actualités",
        "media": "Médiathèque"
      }
    },
    "strategic": {
      "title": "Partenaires stratégiques",
      "subtitle": "Institutions et organisations qui soutiennent notre mission"
    },
    "filters": {
      "all": "Tous",
      "academic": "Académiques",
      "institutional": "Institutionnels",
      "corporate": "Entreprises",
      "ngo": "ONG"
    },
    "card": {
      "visitWebsite": "Visiter le site",
      "strategic": "Partenaire stratégique"
    }
  }
}
```

### 5.3 Mise à jour des index i18n

Ajouter l'import dans `i18n/locales/{fr,en,ar}/index.ts` :
```typescript
import partners from './partners.json'
// ...
export default { ...partners, ... }
```

---

## Section 6 : Pages à créer

| Fichier | Route | Description |
|---------|-------|-------------|
| `app/pages/a-propos/partenaires/index.vue` | `/a-propos/partenaires` | Page principale |
| `app/pages/a-propos/partenaires/campus/[slug].vue` | `/a-propos/partenaires/campus/[slug]` | Page détaillée campus |

---

## Section 7 : Mise à jour du composable `useMockData`

Ajouter les nouvelles méthodes dans `app/composables/useMockData.ts` :

```typescript
const getCampusTeam = (campusId: string) => /* ... */
const getCampusCalls = (campusId: string) => /* ... */
const getCampusEvents = (campusId: string) => /* ... */
const getCampusNews = (campusId: string) => /* ... */
const getCampusMedia = (campusId: string) => /* ... */
const getCampusBySlug = (slug: string) => /* ... */
```

---

## Section 8 : Mise à jour de la navigation

### 8.1 Fichier `i18n/locales/{lang}/nav.json`

Ajouter le lien "Nos partenaires" dans le menu "À propos".

### 8.2 Fichier `components/section/about/TabsNav.vue`

Ajouter l'onglet "Partenaires" dans la navigation sticky.

---

## Ordre d'implémentation recommandé

### Phase 1 : Infrastructure
1. Créer les fichiers i18n (`partners.json` pour fr, en, ar)
2. Mettre à jour les index i18n
3. Créer les mock data (team, calls, events, news, media)
4. Mettre à jour `useMockData.ts`

### Phase 2 : Page principale
5. Créer `app/pages/a-propos/partenaires/index.vue`
6. Créer `CampusMapSection.vue` (adapté de CampusSection.vue)
7. Créer `StrategicPartnersSection.vue`
8. Créer `CardPartner.vue`
9. Créer `PartnersFilters.vue`

### Phase 3 : Page détaillée campus
10. Créer `app/pages/a-propos/partenaires/campus/[slug].vue`
11. Créer `CampusHero.vue`
12. Créer `CampusTabs.vue`
13. Créer les sections campus (Partners, Team, Calls, Events, News, Media)

### Phase 4 : Intégration
14. Mettre à jour la navigation (TabsNav.vue, nav.json)
15. Mettre à jour le composant preview existant (`Partners.vue`)
16. Tests et ajustements responsive

---

## Fichiers existants à référencer

- `app/components/CampusSection.vue` - Carte mondiale interactive (à adapter)
- `bank/mock-data/partenaires.ts` - 14 partenaires existants
- `bank/mock-data/campus-externalises.ts` - 7 campus existants
- `app/components/section/about/TabsNav.vue` - Navigation tabs
- `app/components/section/about/Partners.vue` - Preview card existant

---

## Résumé des livrables

### Nouveaux fichiers (22)
- 3 fichiers i18n (`partners.json` × 3 langues)
- 5 fichiers mock data
- 2 fichiers pages
- 12 fichiers composants

### Fichiers à modifier (4)
- `i18n/locales/fr/index.ts` (+ en, ar)
- `app/composables/useMockData.ts`
- `components/section/about/TabsNav.vue`
- `i18n/locales/{lang}/nav.json`
