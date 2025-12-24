# 01 - Page Principale `/a-propos`

> Route: `/a-propos`
> Fichier: `app/pages/a-propos/index.vue`
> Statut: **Implémenté**

---

## Objectif

Page d'entrée de la section institutionnelle. Présente la mission, les valeurs et des sections aperçu indépendantes vers chaque sous-page.

---

## Sections de la page

1. **Hero** - Image de fond, titre, sous-titre, breadcrumb
2. **Mission** `#mission` - Présentation avec image et CTA
3. **Stats** - Chiffres clés animés (30+ années, 15 pays, 5000+ alumni, 50+ formations)
4. **Engagements** `#engagements` - Valeurs (Excellence, Diversité, Ouverture) + charte éthique PDF
5. **Titre section** - "Découvrir l'Université"
6. **7 Sections indépendantes** - Chaque sous-page a son propre composant customisable

---

## Sections Aperçu (composants indépendants)

Chaque sous-page a son propre composant dans `components/section/about/` :

| Section | Composant | Couleur | Route |
|---------|-----------|---------|-------|
| Notre histoire | `SectionAboutHistory` | amber | `/a-propos/histoire` |
| Gouvernance | `SectionAboutGovernance` | blue | `/a-propos/gouvernance` |
| Notre stratégie | `SectionAboutStrategy` | emerald | `/a-propos/strategie` |
| Notre organisation | `SectionAboutOrganization` | purple | `/a-propos/organisation` |
| Le personnel | `SectionAboutTeam` | rose | `/a-propos/equipe` |
| Nos partenaires | `SectionAboutPartners` | cyan | `/a-propos/partenaires` |
| Nous rejoindre | `SectionAboutCareers` | lime | `/carrieres` |

---

## Composants

| Composant | Fichier | Statut |
|-----------|---------|--------|
| `PageHero` | `components/page/Hero.vue` | ✅ |
| `SectionAboutMission` | `components/section/AboutMission.vue` | ✅ |
| `SectionStats` | `components/section/Stats.vue` | ✅ |
| `SectionEngagements` | `components/section/Engagements.vue` | ✅ |
| `SectionAboutHistory` | `components/section/about/History.vue` | ✅ |
| `SectionAboutGovernance` | `components/section/about/Governance.vue` | ✅ |
| `SectionAboutStrategy` | `components/section/about/Strategy.vue` | ✅ |
| `SectionAboutOrganization` | `components/section/about/Organization.vue` | ✅ |
| `SectionAboutTeam` | `components/section/about/Team.vue` | ✅ |
| `SectionAboutPartners` | `components/section/about/Partners.vue` | ✅ |
| `SectionAboutCareers` | `components/section/about/Careers.vue` | ✅ |

---

## i18n

Fichiers: `i18n/locales/{fr,en,ar}/about.json`

Clés :
- `about.hero.{title,subtitle}`
- `about.mission.{title,content,cta}`
- `about.stats.{years,countries,alumni,programs}`
- `about.engagements.title` / `about.engagements.values.{excellence,diversity,openness}`
- `about.charter.download`
- `about.preview.title`
- `about.preview.{history,governance,strategy,organization,team,partners,careers}.{title,summary}`
- `about.seo.{title,description}`
- `common.discover`

---

## Données

Page **statique** (i18n + images placeholders Picsum).

SEO via `useSeoMeta`.
