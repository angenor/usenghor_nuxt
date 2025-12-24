# 02 - Page Histoire `/a-propos/histoire`

> Route: `/a-propos/histoire`
> Fichier: `app/pages/a-propos/histoire.vue`

---

## Objectif

Raconter l'histoire de l'Université Senghor depuis sa création jusqu'à aujourd'hui, avec une timeline interactive et du contenu multimédia.

---

## Structure de la page

```
┌─────────────────────────────────────────────────────┐
│                    HERO SECTION                      │
│  - Titre: "Notre histoire"                          │
│  - Sous-titre: "Depuis 1989..."                     │
│  - Breadcrumb: Accueil > Nous connaître > Histoire │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              SECTION INTRODUCTION                    │
│                                                     │
│  Texte éditorial sur la genèse du projet           │
│  (EditorJS ou i18n)                                │
│                                                     │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              SECTION PROJET SENGHOR                  │
│  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Portrait      │  │  Qui était Léopold      │  │
│  │   Senghor       │  │  Sédar Senghor ?        │  │
│  │                 │  │  Texte biographique     │  │
│  └─────────────────┘  └─────────────────────────┘  │
│                                                     │
│  Citation: "..."  — L.S. Senghor                   │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                    TIMELINE                          │
│                                                     │
│  1989 ─●─ Création de l'Université                 │
│           │  Description + image                    │
│           │                                         │
│  1990 ─●─ Première promotion                       │
│           │  Description + image                    │
│           │                                         │
│  1995 ─●─ Extension des départements               │
│           │  Description + image                    │
│           │                                         │
│  2000 ─●─ Ouverture campus externalisés            │
│           │  Description + image                    │
│           │                                         │
│  ...                                               │
│                                                     │
│  2024 ─●─ Aujourd'hui                              │
│           Description + image                       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                 GALERIE PHOTOS                       │
│                                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│  │     │ │     │ │     │ │     │ │     │         │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │
│                                                     │
│  Lightbox au clic                                  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                 VIDEO SECTION                        │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │         Vidéo institutionnelle              │   │
│  │              (YouTube embed)                │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Composants nécessaires

### 1. TimelineHistory

```vue
<template>
  <div class="timeline">
    <div
      v-for="(item, index) in items"
      :key="item.year"
      class="timeline-item"
      :class="{ 'timeline-item--left': index % 2 === 0 }"
    >
      <div class="timeline-marker">
        <span class="timeline-year">{{ item.year }}</span>
      </div>
      <div class="timeline-content">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <img v-if="item.image" :src="item.image" :alt="item.title" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TimelineItem {
  year: number
  title: string
  description: string
  image?: string
}

defineProps<{
  items: TimelineItem[]
}>()
</script>
```

### 2. SectionSenghor (portrait)

```vue
<SectionSenghor
  :portrait="'/images/history/senghor-portrait.jpg'"
  :title="$t('history.senghor.title')"
  :bio="$t('history.senghor.bio')"
  :quote="$t('history.senghor.quote')"
/>
```

### 3. GalleryGrid

```vue
<GalleryGrid
  :images="historicalPhotos"
  :columns="5"
  lightbox
/>
```

### 4. VideoEmbed

```vue
<VideoEmbed
  provider="youtube"
  video-id="xxxxxxxxxxxx"
  :title="$t('history.video.title')"
/>
```

---

## Données Timeline

Les événements peuvent être:
- **Option A**: Stockés dans i18n (statique)
- **Option B**: Stockés en base via `page_sections` type `timeline`

### Option A - i18n (recommandé pour contenu stable)

```json
// history.json
{
  "timeline": [
    {
      "year": 1989,
      "title": "Création de l'Université",
      "description": "L'Université Senghor est fondée à Alexandrie...",
      "image": "/images/history/1989-creation.jpg"
    },
    {
      "year": 1990,
      "title": "Première promotion",
      "description": "Accueil des premiers étudiants...",
      "image": "/images/history/1990-promotion.jpg"
    }
  ]
}
```

### Option B - Base de données (via page_sections)

```sql
-- Récupérer la timeline de la page histoire
SELECT content
FROM page_sections ps
JOIN pages p ON ps.page_id = p.id
WHERE p.slug = 'histoire'
  AND ps.section_type = 'timeline'
  AND ps.is_active = TRUE;
```

---

## Fichier i18n: `history.json`

```json
{
  "hero": {
    "title": "Notre histoire",
    "subtitle": "Plus de 30 ans au service du développement africain"
  },
  "intro": {
    "title": "La genèse",
    "content": "L'idée de créer une université francophone en Afrique..."
  },
  "senghor": {
    "title": "Léopold Sédar Senghor",
    "bio": "Poète, écrivain et homme d'État sénégalais, premier président de la République du Sénégal...",
    "quote": "L'émotion est nègre, la raison est hellène."
  },
  "timeline": [...],
  "gallery": {
    "title": "Galerie historique"
  },
  "video": {
    "title": "Découvrez l'Université Senghor"
  }
}
```

---

## Animations

- Timeline: apparition progressive au scroll (Intersection Observer)
- Images galerie: fade-in au scroll
- Parallax léger sur le hero

```ts
// composables/useScrollAnimation.ts
export function useScrollAnimation() {
  const observer = ref<IntersectionObserver | null>(null)

  onMounted(() => {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )
  })

  return { observer }
}
```

---

## Fichiers à créer

```
app/
├── pages/
│   └── a-propos/
│       └── histoire.vue
├── components/
│   ├── timeline/
│   │   └── TimelineHistory.vue
│   ├── section/
│   │   └── SectionSenghor.vue
│   ├── gallery/
│   │   └── GalleryGrid.vue
│   └── media/
│       └── VideoEmbed.vue
i18n/locales/
├── fr/history.json (compléter)
├── en/history.json
└── ar/history.json
public/images/history/
├── senghor-portrait.jpg
├── 1989-creation.jpg
├── 1990-promotion.jpg
└── ...
```
