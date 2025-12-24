# 05 - Page Organisation `/a-propos/organisation`

> Route: `/a-propos/organisation`
> Fichier: `app/pages/a-propos/organisation.vue`

---

## Objectif

Présenter l'organisation interne de l'Université: organigramme interactif, départements et services.

---

## Structure de la page

```
┌─────────────────────────────────────────────────────┐
│                    HERO SECTION                      │
│  - Titre: "Notre organisation"                      │
│  - Breadcrumb                                       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              SECTION INTRODUCTION                    │
│                                                     │
│  Texte sur la structure organisationnelle          │
│                                                     │
│  Navigation rapide:                                │
│  [Organigramme] [Départements] [Services]          │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│         SECTION ORGANIGRAMME #organigramme          │
│                                                     │
│                  ┌──────────────┐                   │
│                  │   RECTEUR    │                   │
│                  └──────┬───────┘                   │
│                         │                          │
│        ┌────────────────┼────────────────┐         │
│        │                │                │         │
│  ┌─────▼─────┐   ┌──────▼──────┐  ┌─────▼─────┐   │
│  │  Cabinet  │   │ Secrétariat │  │ Direction │   │
│  │           │   │  Général    │  │  Campus   │   │
│  └───────────┘   └─────────────┘  └───────────┘   │
│        │                                           │
│  ┌─────┴─────────────────────────────────┐        │
│  │         DÉPARTEMENTS                   │        │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │        │
│  │  │Cult│ │Env │ │Mgt │ │Sant│ │Doct│  │        │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘  │        │
│  └───────────────────────────────────────┘        │
│                                                     │
│  (Composant interactif cliquable)                  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│           SECTION DÉPARTEMENTS #departements        │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ ▼ Département Culture                        │  │
│  │   Responsable: Dr. Nom Prénom                │  │
│  │   Description du département...              │  │
│  │   [Voir les formations] [Voir l'équipe]      │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ ▶ Département Environnement                  │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │ ▶ Département Management                     │  │
│  └──────────────────────────────────────────────┘  │
│  ... (accordéon pour chaque département)           │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│             SECTION SERVICES #services              │
│                                                     │
│  ── Services académiques ──                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ Scolarité   │ │Bibliothèque │ │ Informatique│  │
│  │ Contact...  │ │ Contact...  │ │ Contact...  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                     │
│  ── Services administratifs ──                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ Comptabilité│ │  Personnel  │ │  Qualité    │  │
│  │ Contact...  │ │ Contact...  │ │ Contact...  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                    CTA SECTION                       │
│                                                     │
│  [Découvrir notre équipe →]                        │
│  Lien vers /a-propos/equipe                        │
└─────────────────────────────────────────────────────┘
```

---

## Tables SQL utilisées

### 1. Départements

```sql
-- Récupérer les départements avec leur responsable
SELECT
  d.id, d.slug, d.name_fr, d.name_en, d.name_ar,
  d.description_fr, d.icon, d.color,
  s.id as head_id,
  s.civility as head_civility,
  s.first_name as head_first_name,
  s.last_name as head_last_name,
  s.title_fr as head_title,
  s.photo as head_photo
FROM departments d
LEFT JOIN staff s ON d.head_id = s.id
WHERE d.is_active = TRUE
ORDER BY d.sort_order;
```

### 2. Services

```sql
-- Récupérer les services groupés par catégorie
SELECT
  sv.id, sv.slug, sv.category,
  sv.name_fr, sv.name_en, sv.name_ar,
  sv.description_fr, sv.icon,
  sv.email, sv.phone, sv.location,
  s.civility as head_civility,
  s.first_name as head_first_name,
  s.last_name as head_last_name
FROM services sv
LEFT JOIN staff s ON sv.head_id = s.id
WHERE sv.is_active = TRUE
ORDER BY sv.category, sv.sort_order;
```

---

## Composants nécessaires

### 1. OrgChart (Organigramme interactif)

```vue
<template>
  <div class="org-chart">
    <!-- Niveau 1: Recteur -->
    <div class="org-chart__level org-chart__level--1">
      <OrgChartNode
        :data="recteur"
        @click="onNodeClick"
        highlight
      />
    </div>

    <!-- Niveau 2: Direction -->
    <div class="org-chart__level org-chart__level--2">
      <div class="org-chart__connector"></div>
      <div class="org-chart__nodes">
        <OrgChartNode
          v-for="node in directionNodes"
          :key="node.id"
          :data="node"
          @click="onNodeClick"
        />
      </div>
    </div>

    <!-- Niveau 3: Départements -->
    <div class="org-chart__level org-chart__level--3">
      <div class="org-chart__connector"></div>
      <div class="org-chart__nodes">
        <OrgChartNode
          v-for="dept in departments"
          :key="dept.id"
          :data="dept"
          :color="dept.color"
          @click="onNodeClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface OrgNode {
  id: string
  type: 'person' | 'department' | 'service'
  title: string
  subtitle?: string
  icon?: string
  color?: string
  link?: string
}

const props = defineProps<{
  recteur: OrgNode
  directionNodes: OrgNode[]
  departments: OrgNode[]
}>()

const emit = defineEmits<{
  nodeClick: [node: OrgNode]
}>()

function onNodeClick(node: OrgNode) {
  if (node.link) {
    navigateTo(node.link)
  }
  emit('nodeClick', node)
}
</script>

<style scoped>
.org-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.org-chart__level {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.org-chart__nodes {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.org-chart__connector {
  width: 2px;
  height: 2rem;
  background: var(--color-border);
}
</style>
```

### 2. OrgChartNode

```vue
<template>
  <button
    class="org-node"
    :class="{ 'org-node--highlight': highlight }"
    :style="{ '--node-color': color }"
    @click="$emit('click', data)"
  >
    <div class="org-node__icon" v-if="data.icon">
      <Icon :name="data.icon" />
    </div>
    <div class="org-node__content">
      <span class="org-node__title">{{ data.title }}</span>
      <span v-if="data.subtitle" class="org-node__subtitle">
        {{ data.subtitle }}
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  data: {
    id: string
    title: string
    subtitle?: string
    icon?: string
  }
  color?: string
  highlight?: boolean
}>()

defineEmits<{
  click: [data: any]
}>()
</script>
```

### 3. DepartmentAccordion

```vue
<template>
  <div class="accordion">
    <div
      v-for="dept in departments"
      :key="dept.id"
      class="accordion__item"
    >
      <button
        class="accordion__header"
        :class="{ 'accordion__header--open': openId === dept.id }"
        @click="toggle(dept.id)"
      >
        <div class="accordion__header-content">
          <Icon :name="dept.icon || 'folder'" :style="{ color: dept.color }" />
          <span>{{ getLocalizedField(dept, 'name') }}</span>
        </div>
        <Icon :name="openId === dept.id ? 'chevron-up' : 'chevron-down'" />
      </button>

      <Transition name="accordion">
        <div v-if="openId === dept.id" class="accordion__body">
          <!-- Responsable -->
          <div v-if="dept.head" class="accordion__head">
            <NuxtImg
              v-if="dept.head.photo"
              :src="dept.head.photo"
              width="60"
              height="60"
            />
            <div>
              <strong>{{ $t('organization.head') }}:</strong>
              {{ dept.head.civility }} {{ dept.head.first_name }} {{ dept.head.last_name }}
              <span v-if="dept.head.title">— {{ dept.head.title }}</span>
            </div>
          </div>

          <!-- Description -->
          <p>{{ getLocalizedField(dept, 'description') }}</p>

          <!-- Actions -->
          <div class="accordion__actions">
            <NuxtLink :to="`/formations?department=${dept.slug}`">
              {{ $t('organization.view_programs') }}
            </NuxtLink>
            <NuxtLink :to="`/a-propos/equipe?department=${dept.slug}`">
              {{ $t('organization.view_team') }}
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Department } from '~/types/database'

defineProps<{
  departments: Department[]
}>()

const openId = ref<string | null>(null)

function toggle(id: string) {
  openId.value = openId.value === id ? null : id
}
</script>
```

### 4. ServiceCard

```vue
<template>
  <div class="service-card">
    <div class="service-card__header">
      <Icon :name="icon || 'building'" />
      <h4>{{ name }}</h4>
    </div>

    <p v-if="description" class="service-card__description">
      {{ description }}
    </p>

    <div v-if="head" class="service-card__head">
      <strong>{{ $t('organization.head') }}:</strong>
      {{ head.civility }} {{ head.first_name }} {{ head.last_name }}
    </div>

    <ul class="service-card__contact">
      <li v-if="email">
        <Icon name="mail" />
        <a :href="`mailto:${email}`">{{ email }}</a>
      </li>
      <li v-if="phone">
        <Icon name="phone" />
        <a :href="`tel:${phone}`">{{ phone }}</a>
      </li>
      <li v-if="location">
        <Icon name="map-pin" />
        <span>{{ location }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  description?: string
  icon?: string
  head?: {
    civility?: string
    first_name: string
    last_name: string
  }
  email?: string
  phone?: string
  location?: string
}>()
</script>
```

---

## Fichier i18n: `organization.json`

```json
{
  "hero": {
    "title": "Notre organisation",
    "subtitle": "Une structure au service de l'excellence"
  },
  "intro": {
    "content": "L'Université Senghor est organisée autour de départements académiques et de services support...",
    "nav": {
      "orgchart": "Organigramme",
      "departments": "Départements",
      "services": "Services"
    }
  },
  "orgchart": {
    "title": "Organigramme",
    "recteur": "Recteur",
    "cabinet": "Cabinet du Recteur",
    "sg": "Secrétariat Général",
    "direction_campus": "Direction des Campus"
  },
  "departments": {
    "title": "Départements académiques",
    "culture": "Culture",
    "environment": "Environnement",
    "management": "Management",
    "health": "Santé",
    "doctoral": "École doctorale"
  },
  "services": {
    "title": "Services",
    "academic": "Services académiques",
    "administrative": "Services administratifs"
  },
  "head": "Responsable",
  "view_programs": "Voir les formations",
  "view_team": "Voir l'équipe",
  "cta": {
    "title": "Découvrez notre équipe",
    "button": "Voir le trombinoscope"
  }
}
```

---

## API / Composables

```ts
// composables/useOrganization.ts
export function useOrganization() {
  // Départements avec responsables
  const { data: departments } = await useFetch('/api/departments')

  // Services groupés par catégorie
  const { data: services } = await useFetch('/api/services')

  const academicServices = computed(() =>
    services.value?.filter(s => s.category === 'academique')
  )

  const administrativeServices = computed(() =>
    services.value?.filter(s => s.category === 'administratif')
  )

  const rectoratServices = computed(() =>
    services.value?.filter(s => s.category === 'rectorat')
  )

  return {
    departments,
    services,
    academicServices,
    administrativeServices,
    rectoratServices
  }
}
```

---

## Fichiers à créer

```
app/
├── pages/
│   └── a-propos/
│       └── organisation.vue
├── components/
│   └── organization/
│       ├── OrgChart.vue
│       ├── OrgChartNode.vue
│       ├── DepartmentAccordion.vue
│       └── ServiceCard.vue
├── composables/
│   └── useOrganization.ts
├── server/api/
│   ├── departments.get.ts
│   └── services.get.ts
i18n/locales/
├── fr/organization.json
├── en/organization.json
└── ar/organization.json
```
