# 04 - Page Stratégie `/a-propos/strategie`

> Route: `/a-propos/strategie`
> Fichier: `app/pages/a-propos/strategie.vue`

---

## Objectif

Présenter le plan stratégique de l'Université, ses objectifs, et les initiatives de levée de fonds.

---

## Structure de la page

```
┌─────────────────────────────────────────────────────┐
│                    HERO SECTION                      │
│  - Titre: "Notre stratégie"                         │
│  - Sous-titre: "Construire l'avenir de l'Afrique"  │
│  - Breadcrumb                                       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│           SECTION PLAN STRATÉGIQUE                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │          [Image couverture plan]            │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Titre: Plan stratégique 2024-2030                 │
│                                                     │
│  Contenu EditorJS (résumé du plan)                │
│  - Vision                                          │
│  - Axes stratégiques                               │
│  - Objectifs                                       │
│                                                     │
│  [Télécharger le plan complet] (PDF)              │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              SECTION AXES STRATÉGIQUES               │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │    AXE 1    │ │    AXE 2    │ │    AXE 3    │   │
│  │  Excellence │ │  Innovation │ │  Rayonnement│   │
│  │  académique │ │ pédagogique │ │international│   │
│  │             │ │             │ │             │   │
│  │  - Obj 1    │ │  - Obj 1    │ │  - Obj 1    │   │
│  │  - Obj 2    │ │  - Obj 2    │ │  - Obj 2    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐                   │
│  │    AXE 4    │ │    AXE 5    │                   │
│  │ Développ.   │ │  Gouver-    │                   │
│  │  durable    │ │   nance     │                   │
│  └─────────────┘ └─────────────┘                   │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│            SECTION INDICATEURS CLÉS                  │
│                                                     │
│  Objectifs chiffrés à horizon 2030                 │
│                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  1000   │ │   20    │ │   50%   │ │  100%   │  │
│  │étudiants│ │nouveaux │ │ femmes  │ │insertion│  │
│  │ /an     │ │programmes││         │ │ pro     │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              SECTION LEVÉE DE FONDS                  │
│                                                     │
│  Titre: Soutenez notre mission                     │
│                                                     │
│  Texte sur les besoins de financement              │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Projets prioritaires:                      │   │
│  │                                             │   │
│  │  ▸ Bourses d'excellence         [En savoir+]│   │
│  │  ▸ Modernisation campus         [En savoir+]│   │
│  │  ▸ Recherche & Innovation       [En savoir+]│   │
│  │  ▸ Bibliothèque numérique       [En savoir+]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Nous contacter pour contribuer]                  │
└─────────────────────────────────────────────────────┘
```

---

## Source des données

Cette page est principalement **éditoriale** avec du contenu géré via:

1. **page_sections** (type `editor_js`) pour le contenu riche
2. **documents** pour les PDF téléchargeables
3. **i18n** pour les textes statiques

---

## Composants nécessaires

### 1. StrategicAxisCard

```vue
<template>
  <div class="axis-card">
    <div class="axis-card__header" :style="{ backgroundColor: color }">
      <span class="axis-card__number">{{ number }}</span>
      <Icon :name="icon" class="axis-card__icon" />
    </div>
    <div class="axis-card__body">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <ul v-if="objectives?.length" class="axis-card__objectives">
        <li v-for="obj in objectives" :key="obj">{{ obj }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: number
  icon: string
  title: string
  description?: string
  objectives?: string[]
  color?: string
}>()
</script>
```

### 2. FundraisingSection

```vue
<template>
  <section class="fundraising">
    <div class="fundraising__intro">
      <h2>{{ title }}</h2>
      <div v-html="content"></div>
    </div>

    <div class="fundraising__projects">
      <div
        v-for="project in projects"
        :key="project.id"
        class="fundraising__project"
      >
        <Icon :name="project.icon" />
        <div>
          <h4>{{ project.title }}</h4>
          <p>{{ project.description }}</p>
        </div>
        <NuxtLink :to="project.link" class="btn-link">
          {{ $t('common.learn_more') }}
        </NuxtLink>
      </div>
    </div>

    <div class="fundraising__cta">
      <NuxtLink to="/contact?subject=fundraising" class="btn btn-primary">
        {{ $t('strategy.fundraising.cta') }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
interface FundraisingProject {
  id: string
  icon: string
  title: string
  description: string
  link: string
}

defineProps<{
  title: string
  content: string
  projects: FundraisingProject[]
}>()
</script>
```

### 3. TargetIndicators

```vue
<template>
  <section class="indicators">
    <h2>{{ title }}</h2>
    <p>{{ subtitle }}</p>

    <div class="indicators__grid">
      <div
        v-for="indicator in indicators"
        :key="indicator.label"
        class="indicator"
      >
        <span class="indicator__value">
          {{ indicator.prefix }}{{ indicator.value }}{{ indicator.suffix }}
        </span>
        <span class="indicator__label">{{ indicator.label }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Indicator {
  value: string | number
  label: string
  prefix?: string
  suffix?: string
}

defineProps<{
  title: string
  subtitle?: string
  indicators: Indicator[]
}>()
</script>
```

---

## Fichier i18n: `strategy.json`

```json
{
  "hero": {
    "title": "Notre stratégie",
    "subtitle": "Construire l'avenir de l'Afrique francophone"
  },
  "plan": {
    "title": "Plan stratégique 2024-2030",
    "intro": "Notre nouveau plan stratégique définit les orientations de l'Université pour les six prochaines années...",
    "download": "Télécharger le plan complet",
    "vision": {
      "title": "Notre vision",
      "content": "Être l'université de référence pour la formation des cadres africains..."
    }
  },
  "axes": {
    "title": "Axes stratégiques",
    "items": [
      {
        "number": 1,
        "icon": "academic-cap",
        "title": "Excellence académique",
        "description": "Renforcer la qualité des formations...",
        "objectives": [
          "Accréditations internationales",
          "Partenariats universitaires",
          "Corps professoral de haut niveau"
        ]
      },
      {
        "number": 2,
        "icon": "lightbulb",
        "title": "Innovation pédagogique",
        "description": "Moderniser les méthodes d'enseignement...",
        "objectives": [
          "Digitalisation des cours",
          "Apprentissage hybride",
          "Pédagogie par projets"
        ]
      }
    ]
  },
  "indicators": {
    "title": "Objectifs 2030",
    "subtitle": "Nos engagements chiffrés",
    "items": [
      { "value": "1000", "label": "étudiants par an", "suffix": "+" },
      { "value": "20", "label": "nouveaux programmes" },
      { "value": "50", "label": "de femmes", "suffix": "%" },
      { "value": "100", "label": "d'insertion professionnelle", "suffix": "%" }
    ]
  },
  "fundraising": {
    "title": "Soutenez notre mission",
    "intro": "Pour réaliser nos ambitions, nous avons besoin de votre soutien...",
    "projects": [
      {
        "id": "scholarships",
        "icon": "graduation-cap",
        "title": "Bourses d'excellence",
        "description": "Permettre aux meilleurs étudiants d'accéder à nos formations"
      },
      {
        "id": "campus",
        "icon": "building",
        "title": "Modernisation du campus",
        "description": "Améliorer les infrastructures d'accueil"
      }
    ],
    "cta": "Nous contacter pour contribuer"
  }
}
```

---

## Récupération des données

```ts
// composables/useStrategy.ts
export function useStrategy() {
  const { locale } = useI18n()

  // Document du plan stratégique
  const { data: planDocument } = await useFetch('/api/documents', {
    query: {
      category: 'rapport',
      search: 'plan stratégique'
    }
  })

  // Sections de la page (si contenu dynamique via CMS)
  const { data: pageSections } = await useFetch('/api/pages/strategie/sections')

  return {
    planDocument,
    pageSections
  }
}
```

---

## Fichiers à créer

```
app/
├── pages/
│   └── a-propos/
│       └── strategie.vue
├── components/
│   └── strategy/
│       ├── StrategicAxisCard.vue
│       ├── TargetIndicators.vue
│       └── FundraisingSection.vue
├── composables/
│   └── useStrategy.ts
i18n/locales/
├── fr/strategy.json
├── en/strategy.json
└── ar/strategy.json
```
