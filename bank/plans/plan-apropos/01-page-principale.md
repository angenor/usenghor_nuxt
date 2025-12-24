# 01 - Page Principale `/a-propos`

> Route: `/a-propos`
> Fichier: `app/pages/a-propos/index.vue`

---

## Objectif

Page d'entrée de la section institutionnelle. Présente une vue d'ensemble de l'université avec navigation vers les sous-pages détaillées.

---

## Structure de la page

```
┌─────────────────────────────────────────────────────┐
│                    HERO SECTION                      │
│  - Image de fond (campus Alexandrie)                │
│  - Titre: "Nous connaître"                          │
│  - Sous-titre: "Université internationale..."       │
│  - Breadcrumb: Accueil > Nous connaître            │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              SECTION MISSION #mission               │
│  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │     Image       │  │  Titre: Notre mission   │  │
│  │   ou Vidéo      │  │  Texte éditorial        │  │
│  │                 │  │  CTA: "Notre histoire"  │  │
│  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                 SECTION STATS                        │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│   │  30+   │  │  15    │  │ 5000+  │  │  50+   │   │
│   │ années │  │ pays   │  │ alumni │  │ forma- │   │
│   │        │  │bailleurs│ │        │  │ tions  │   │
│   └────────┘  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│          SECTION ENGAGEMENTS #engagements           │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Nos valeurs │ │ Excellence  │ │  Diversité  │   │
│  │    icon     │ │    icon     │ │    icon     │   │
│  │   texte     │ │   texte     │ │   texte     │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                     │
│  [Télécharger notre charte éthique] (PDF)          │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              NAVIGATION CARDS                        │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Histoire    │  │ Gouvernance  │                │
│  │    →         │  │     →        │                │
│  └──────────────┘  └──────────────┘                │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Organisation │  │  Partenaires │                │
│  │    →         │  │     →        │                │
│  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## Composants nécessaires

### 1. PageHero
```vue
<PageHero
  :title="$t('about.hero.title')"
  :subtitle="$t('about.hero.subtitle')"
  image="/images/campus/hero-apropos.jpg"
  :breadcrumb="[
    { label: $t('nav.home'), to: '/' },
    { label: $t('nav.about') }
  ]"
/>
```

### 2. SectionMission
```vue
<SectionMission
  :title="$t('about.mission.title')"
  :content="$t('about.mission.content')"
  image="/images/about/mission.jpg"
  :cta="{ label: $t('about.mission.cta'), to: '/a-propos/histoire' }"
/>
```

### 3. SectionStats
```vue
<SectionStats
  :stats="[
    { value: '30+', label: $t('about.stats.years') },
    { value: '15', label: $t('about.stats.countries') },
    { value: '5000+', label: $t('about.stats.alumni') },
    { value: '50+', label: $t('about.stats.programs') }
  ]"
/>
```

### 4. SectionEngagements
```vue
<SectionEngagements
  :values="[
    { icon: 'star', title: $t('about.values.excellence'), text: '...' },
    { icon: 'users', title: $t('about.values.diversity'), text: '...' },
    { icon: 'globe', title: $t('about.values.openness'), text: '...' }
  ]"
  :charter="{ label: $t('about.charter.download'), url: '/documents/charte-ethique.pdf' }"
/>
```

### 5. NavigationCards
```vue
<NavigationCards
  :cards="[
    { title: $t('nav.history'), to: '/a-propos/histoire', icon: 'clock' },
    { title: $t('nav.governance'), to: '/a-propos/gouvernance', icon: 'building' },
    { title: $t('nav.organization'), to: '/a-propos/organisation', icon: 'sitemap' },
    { title: $t('nav.partners'), to: '/a-propos/partenaires', icon: 'handshake' }
  ]"
/>
```

---

## Fichier i18n: `about.json`

```json
{
  "hero": {
    "title": "Nous connaître",
    "subtitle": "Université internationale de langue française au service du développement africain"
  },
  "mission": {
    "title": "Notre mission",
    "content": "Accompagner la transformation de l'Afrique en formant ses futurs décideurs...",
    "cta": "Découvrir notre histoire"
  },
  "stats": {
    "years": "années d'existence",
    "countries": "pays bailleurs",
    "alumni": "diplômés",
    "programs": "formations"
  },
  "values": {
    "excellence": "Excellence",
    "diversity": "Diversité",
    "openness": "Ouverture"
  },
  "charter": {
    "title": "Notre charte éthique",
    "download": "Télécharger la charte"
  }
}
```

---

## SEO

```vue
<script setup>
useSeoMeta({
  title: () => $t('about.seo.title'),
  description: () => $t('about.seo.description'),
  ogImage: '/images/og/about.jpg'
})
</script>
```

---

## Données

Cette page est principalement **statique** (i18n + images).
Les chiffres clés peuvent être:
- Codés en dur dans i18n
- Ou récupérés depuis `settings.stats` (JSONB)

---

## Fichiers à créer

```
app/
├── pages/
│   └── a-propos/
│       └── index.vue
├── components/
│   ├── page/
│   │   └── PageHero.vue
│   └── section/
│       ├── SectionMission.vue
│       ├── SectionStats.vue
│       ├── SectionEngagements.vue
│       └── NavigationCards.vue
i18n/locales/
├── fr/about.json
├── en/about.json
└── ar/about.json
```
