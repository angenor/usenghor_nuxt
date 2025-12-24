# 04 - Page Stratégie `/a-propos/strategie`

> Route: `/a-propos/strategie`
> Fichier: `app/pages/a-propos/strategie.vue`
> Statut: **À implémenter**

---

## Objectif

Présenter le plan stratégique de l'Université, ses axes, objectifs chiffrés et initiatives de levée de fonds.

---

## Sections de la page

1. **Hero** - Titre, sous-titre, breadcrumb
2. **Plan stratégique** - Image couverture + résumé EditorJS + PDF téléchargeable
3. **Axes stratégiques** - Cards des 5 axes avec objectifs (Excellence, Innovation, Rayonnement, Développement durable, Gouvernance)
4. **Indicateurs clés** - Objectifs chiffrés 2030 (étudiants/an, programmes, femmes, insertion)
5. **Levée de fonds** - Projets prioritaires (Bourses, Campus, Recherche, Bibliothèque) + CTA contact

---

## Composants à créer

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `StrategicAxisCard` | `components/strategy/StrategicAxisCard.vue` | Card axe stratégique avec icône et objectifs |
| `TargetIndicators` | `components/strategy/TargetIndicators.vue` | Grille d'indicateurs animés |
| `FundraisingSection` | `components/strategy/FundraisingSection.vue` | Section projets levée de fonds |

---

## Données

Page principalement **éditoriale**:
- `page_sections` (type `editor_js`) pour contenu riche
- `documents` pour PDF plan stratégique
- `i18n` pour textes statiques

---

## i18n

Créer: `i18n/locales/{fr,en,ar}/strategy.json`

Clés principales:
- `strategy.hero.title` / `strategy.hero.subtitle`
- `strategy.plan.title` / `strategy.plan.download`
- `strategy.axes.title` / `strategy.axes.items[]`
- `strategy.indicators.title` / `strategy.indicators.items[]`
- `strategy.fundraising.title` / `strategy.fundraising.projects[]` / `strategy.fundraising.cta`
