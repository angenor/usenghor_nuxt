# Plan d'implémentation - Section "Nous connaître"

> Page principale: `/a-propos`
> Référence: [carte_mentale_senghor.md](../carte_mentale_senghor.md) § 1

---

## Vue d'ensemble

La section "Nous connaître" est le coeur institutionnel du site. Elle présente l'identité, la gouvernance, l'organisation et les partenariats de l'Université Senghor.

### Structure des routes

```
/a-propos                    → Page principale (index)
├── /a-propos/histoire       → Notre histoire
├── /a-propos/gouvernance    → Gouvernance & Conseil d'Administration
├── /a-propos/strategie      → Plan stratégique
├── /a-propos/organisation   → Organigramme & Services
├── /a-propos/equipe         → Trombinoscope du personnel
└── /a-propos/partenaires    → Campus externalisés & Partenaires
```

---

## Grandes lignes du plan

### 1. PAGE PRINCIPALE `/a-propos`
> Détails: [01-page-principale.md](./plan-apropos/01-page-principale.md)

- **Hero section** avec image du campus
- **Section Mission** `#mission` - Notre mission et valeurs
- **Section Engagements** `#engagements` - Valeurs + Charte éthique
- **Chiffres clés** (stats section)

#### Sections résumé vers les sous-pages

Chaque section résumé contient: image/illustration + titre + court texte + bouton "En savoir plus"

| Section | Lien vers | Contenu résumé |
|---------|-----------|----------------|
| **Notre Histoire** | `/a-propos/histoire` | Image historique + dates clés + accroche sur la création |
| **Gouvernance** | `/a-propos/gouvernance` | Photo CA + intro textes fondateurs + mention pays bailleurs |
| **Plan Stratégique** | `/a-propos/strategie` | Visuel objectifs + axes principaux |
| **Organisation** | `/a-propos/organisation` | Mini-organigramme simplifié + nombre de services |
| **Notre Équipe** | `/a-propos/equipe` | Galerie photos personnel + chiffre effectif |
| **Partenaires** | `/a-propos/partenaires` | Logos partenaires principaux + carte campus |

### 2. SOUS-PAGE HISTOIRE `/a-propos/histoire`
> Détails: [02-histoire.md](./plan-apropos/02-histoire.md)

- Timeline interactive (création → aujourd'hui)
- Section "Projet Senghor"
- Galerie photos historiques
- Vidéo institutionnelle

### 3. SOUS-PAGE GOUVERNANCE `/a-propos/gouvernance`
> Détails: [03-gouvernance.md](./plan-apropos/03-gouvernance.md)

- Textes fondateurs (documents PDF téléchargeables)
- Liste des pays bailleurs (cards avec drapeaux)
- Conseil d'Administration (cards membres)
- Tables SQL: `pays_bailleurs`, `conseil_administration`, `documents`

### 4. SOUS-PAGE STRATÉGIE `/a-propos/strategie`
> Détails: [04-strategie.md](./plan-apropos/04-strategie.md)

- Plan stratégique (EditorJS + PDF)
- Section levée de fonds
- Objectifs et indicateurs

### 5. SOUS-PAGE ORGANISATION `/a-propos/organisation`
> Détails: [05-organisation.md](./plan-apropos/05-organisation.md)

- Organigramme interactif (composant custom)
- Présentation des départements
- Présentation des services
- Tables SQL: `departments`, `services`

### 6. SOUS-PAGE ÉQUIPE `/a-propos/equipe`
> Détails: [06-equipe.md](./plan-apropos/06-equipe.md)

- Trombinoscope filtrable (par service/département)
- Cards membres du personnel
- Pagination / Infinite scroll
- Table SQL: `staff`

### 7. SOUS-PAGE PARTENAIRES `/a-propos/partenaires`
> Détails: [07-partenaires.md](./plan-apropos/07-partenaires.md)

- Section campus externalisés (cards + carte)
- Section partenaires stratégiques (logos grid)
- Tables SQL: `campus_externalises`, `partenaires`

---

## Composants à créer

| Composant | Usage | Priorité |
|-----------|-------|----------|
| `PageHero` | Hero réutilisable toutes pages | P0 |
| `SectionMission` | Section mission page principale | P0 |
| `SectionEngagements` | Valeurs + Charte éthique | P1 |
| `SectionSummary` | Section résumé réutilisable (image + texte + bouton) | P0 |
| `SectionSummaryHistory` | Résumé histoire (timeline mini + accroche) | P0 |
| `SectionSummaryGovernance` | Résumé gouvernance (drapeaux + intro) | P0 |
| `SectionSummaryStrategy` | Résumé plan stratégique | P1 |
| `SectionSummaryOrganization` | Résumé organisation (mini-organigramme) | P1 |
| `SectionSummaryTeam` | Résumé équipe (galerie visages) | P1 |
| `SectionSummaryPartners` | Résumé partenaires (logos grid) | P1 |
| `TimelineHistory` | Chronologie interactive | P1 |
| `CardCountry` | Card pays bailleur avec drapeau | P1 |
| `CardCAMember` | Card membre Conseil Admin | P1 |
| `OrgChart` | Organigramme interactif | P2 |
| `CardStaff` | Card membre personnel | P1 |
| `StaffGrid` | Grille filtrable personnel | P1 |
| `CardCampus` | Card campus externalisé | P1 |
| `PartnersLogos` | Grille logos partenaires | P2 |
| `DocumentsList` | Liste documents PDF | P1 |

---

## Fichiers de traduction i18n

```
i18n/locales/
├── fr/
│   ├── about.json          # Textes page principale
│   ├── history.json        # Textes histoire (existant)
│   ├── governance.json     # Textes gouvernance (existant)
│   ├── strategy.json       # Textes stratégie
│   ├── organization.json   # Textes organisation
│   ├── team.json           # Textes équipe
│   └── partners.json       # Textes partenaires
├── en/
│   └── ... (idem)
└── ar/
    └── ... (idem)
```

---

## Ordre d'implémentation recommandé

```
Phase 1 - Fondations
├── 1.1 Composants de base (PageHero, Cards)
├── 1.2 Page principale /a-propos
└── 1.3 Fichiers i18n de base

Phase 2 - Contenu statique
├── 2.1 Page Histoire (timeline)
├── 2.2 Page Stratégie
└── 2.3 Section Engagements

Phase 3 - Données dynamiques
├── 3.1 Page Gouvernance (pays + CA)
├── 3.2 Page Organisation (organigramme)
├── 3.3 Page Équipe (trombinoscope)
└── 3.4 Page Partenaires

Phase 4 - Polish
├── 4.1 Animations et transitions
├── 4.2 SEO et meta tags
└── 4.3 Tests et optimisations
```

---

## Dépendances techniques

- **Nuxt Content** ou **API PostgreSQL** pour les données dynamiques
- **@nuxt/image** pour optimisation images
- **VueUse** pour intersection observer (animations scroll)
- Composants EditorJS pour rendu contenu riche
