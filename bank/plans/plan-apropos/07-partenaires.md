# 07 - Page Partenaires `/a-propos/partenaires`

> Route: `/a-propos/partenaires`
> Fichier: `app/pages/a-propos/partenaires.vue`

---

## Objectif

Présenter les campus externalisés et les partenaires stratégiques de l'Université.

---

## Structure de la page

```
┌─────────────────────────────────────────────────────┐
│                    HERO SECTION                      │
│  - Titre: "Nos partenaires"                         │
│  - Sous-titre: "Un réseau international"           │
│  - Breadcrumb                                       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│              SECTION INTRODUCTION                    │
│                                                     │
│  Texte sur le réseau de partenariats               │
│                                                     │
│  Navigation:                                        │
│  [Campus externalisés] [Partenaires stratégiques]  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│     SECTION CAMPUS EXTERNALISÉS #campus             │
│                                                     │
│  Titre: Nos campus dans le monde                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │         [CARTE INTERACTIVE]                 │   │
│  │            Afrique + Monde                  │   │
│  │         avec markers cliquables             │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │   [Image]   │ │   [Image]   │ │   [Image]   │  │
│  │   Dakar     │ │  Yaoundé    │ │   Tunis     │  │
│  │   Sénégal   │ │  Cameroun   │ │   Tunisie   │  │
│  │ 🇸🇳         │ │ 🇨🇲         │ │ 🇹🇳         │  │
│  │  [Détails]  │ │  [Détails]  │ │  [Détails]  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                     │
│  ... (tous les campus)                             │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│   SECTION PARTENAIRES STRATÉGIQUES #partenaires     │
│                                                     │
│  Titre: Nos partenaires stratégiques               │
│                                                     │
│  Filtrer par type:                                 │
│  [Tous] [Académiques] [Institutionnels] [Entreprises]│
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ Logo │ │ Logo │ │ Logo │ │ Logo │ │ Logo │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │ Logo │ │ Logo │ │ Logo │ │ Logo │ │ Logo │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│                                                     │
│  (Grille de logos cliquables)                      │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│               SECTION DEVENIR PARTENAIRE             │
│                                                     │
│  Titre: Devenir partenaire                         │
│  Texte d'appel à partenariat                       │
│                                                     │
│  [Nous contacter]                                  │
└─────────────────────────────────────────────────────┘
```

---

## Tables SQL utilisées

### 1. Campus Externalisés

```sql
-- Récupérer les campus externalisés actifs
SELECT
  id, slug,
  name_fr, name_en, name_ar,
  country, city_fr, city_en, city_ar,
  address_fr, description_fr,
  image, logo, website, contact_email,
  latitude, longitude
FROM campus_externalises
WHERE is_active = TRUE
ORDER BY sort_order, name_fr;
```

### 2. Partenaires

```sql
-- Récupérer les partenaires actifs
SELECT
  id, slug, partner_type,
  name_fr, name_en, name_ar,
  description_fr, logo, website,
  country, partnership_type_fr,
  is_strategic
FROM partenaires
WHERE is_active = TRUE
ORDER BY
  is_strategic DESC,
  sort_order,
  name_fr;
```

---

## Composants nécessaires

### 1. CampusMap (Carte interactive)

```vue
<template>
  <div class="campus-map">
    <div ref="mapContainer" class="campus-map__container"></div>

    <!-- Légende -->
    <div class="campus-map__legend">
      <div class="campus-map__legend-item">
        <span class="marker marker--main"></span>
        {{ $t('partners.map.main_campus') }}
      </div>
      <div class="campus-map__legend-item">
        <span class="marker marker--external"></span>
        {{ $t('partners.map.external_campus') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMap } from '~/composables/useMap'

interface Campus {
  id: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
}

const props = defineProps<{
  campuses: Campus[]
  mainCampus?: {
    latitude: number
    longitude: number
  }
}>()

const emit = defineEmits<{
  select: [campus: Campus]
}>()

const mapContainer = ref<HTMLElement>()

// Utiliser Leaflet ou Mapbox
const { initMap, addMarkers } = useMap()

onMounted(() => {
  if (mapContainer.value) {
    const map = initMap(mapContainer.value, {
      center: [30.0444, 31.2357], // Alexandrie par défaut
      zoom: 3
    })

    // Ajouter le campus principal
    if (props.mainCampus) {
      addMarkers(map, [{
        lat: props.mainCampus.latitude,
        lng: props.mainCampus.longitude,
        popup: 'Campus principal - Alexandrie',
        type: 'main'
      }])
    }

    // Ajouter les campus externalisés
    addMarkers(map, props.campuses.map(c => ({
      lat: c.latitude,
      lng: c.longitude,
      popup: `${c.name} - ${c.city}`,
      type: 'external',
      onClick: () => emit('select', c)
    })))
  }
})
</script>
```

### 2. CardCampus

```vue
<template>
  <article class="card-campus">
    <div class="card-campus__image">
      <NuxtImg
        v-if="campus.image"
        :src="campus.image"
        :alt="campus.name"
        width="400"
        height="250"
        fit="cover"
      />
      <div v-else class="card-campus__placeholder">
        <Icon name="building" />
      </div>

      <!-- Flag badge -->
      <span class="card-campus__flag">
        {{ getFlagEmoji(campus.country) }}
      </span>
    </div>

    <div class="card-campus__content">
      <h3>{{ getLocalizedField(campus, 'name') }}</h3>
      <p class="card-campus__location">
        <Icon name="map-pin" />
        {{ getLocalizedField(campus, 'city') }}, {{ getCountryName(campus.country) }}
      </p>

      <p v-if="campus.description_fr" class="card-campus__description">
        {{ truncate(getLocalizedField(campus, 'description'), 100) }}
      </p>

      <div class="card-campus__actions">
        <button @click="$emit('details', campus)" class="btn btn-outline">
          {{ $t('common.details') }}
        </button>
        <a
          v-if="campus.website"
          :href="campus.website"
          target="_blank"
          class="btn btn-link"
        >
          {{ $t('common.website') }}
          <Icon name="external-link" />
        </a>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CampusExternalise } from '~/types/database'
import { getFlagEmoji } from '~/utils/flags'

defineProps<{
  campus: CampusExternalise
}>()

defineEmits<{
  details: [campus: CampusExternalise]
}>()

function truncate(text: string, length: number) {
  if (!text || text.length <= length) return text
  return text.slice(0, length) + '...'
}

function getCountryName(code: string) {
  // Utiliser Intl.DisplayNames pour le nom du pays
  const displayNames = new Intl.DisplayNames([useI18n().locale.value], { type: 'region' })
  return displayNames.of(code)
}
</script>

<style scoped>
.card-campus {
  background: var(--color-surface);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-campus:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-campus__image {
  position: relative;
  aspect-ratio: 16/10;
}

.card-campus__flag {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 1.5rem;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-campus__content {
  padding: 1.25rem;
}

.card-campus__location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.card-campus__description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0.75rem 0;
}

.card-campus__actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>
```

### 3. CampusModal

```vue
<template>
  <Modal :is-open="isOpen" @close="$emit('close')">
    <div class="campus-modal">
      <div v-if="campus?.image" class="campus-modal__image">
        <NuxtImg :src="campus.image" :alt="campus.name" />
      </div>

      <div class="campus-modal__content">
        <div class="campus-modal__header">
          <span class="campus-modal__flag">{{ getFlagEmoji(campus?.country) }}</span>
          <div>
            <h2>{{ getLocalizedField(campus, 'name') }}</h2>
            <p>{{ getLocalizedField(campus, 'city') }}, {{ getCountryName(campus?.country) }}</p>
          </div>
        </div>

        <div class="campus-modal__description">
          <p>{{ getLocalizedField(campus, 'description') }}</p>
        </div>

        <div v-if="campus?.address_fr" class="campus-modal__address">
          <h4>{{ $t('common.address') }}</h4>
          <p>{{ getLocalizedField(campus, 'address') }}</p>
        </div>

        <div class="campus-modal__contact">
          <h4>{{ $t('common.contact') }}</h4>
          <ul>
            <li v-if="campus?.contact_email">
              <Icon name="mail" />
              <a :href="`mailto:${campus.contact_email}`">{{ campus.contact_email }}</a>
            </li>
            <li v-if="campus?.website">
              <Icon name="globe" />
              <a :href="campus.website" target="_blank">{{ campus.website }}</a>
            </li>
          </ul>
        </div>

        <!-- Mini carte -->
        <div v-if="campus?.latitude && campus?.longitude" class="campus-modal__map">
          <CampusMap
            :campuses="[campus]"
            :center="[campus.latitude, campus.longitude]"
            :zoom="12"
            static
          />
        </div>

        <div class="campus-modal__programs">
          <h4>{{ $t('partners.campus.programs') }}</h4>
          <NuxtLink :to="`/formations?campus=${campus?.slug}`" class="btn btn-primary">
            {{ $t('partners.campus.view_programs') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { CampusExternalise } from '~/types/database'
import { getFlagEmoji } from '~/utils/flags'

defineProps<{
  campus: CampusExternalise | null
  isOpen: boolean
}>()

defineEmits<{
  close: []
}>()
</script>
```

### 4. PartnersLogos

```vue
<template>
  <div class="partners-logos">
    <!-- Filtres par type -->
    <div class="partners-logos__filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="filter-btn"
        :class="{ 'filter-btn--active': activeFilter === filter.value }"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Grille de logos -->
    <TransitionGroup name="grid" tag="div" class="partners-logos__grid">
      <a
        v-for="partner in filteredPartners"
        :key="partner.id"
        :href="partner.website"
        target="_blank"
        class="partner-logo"
        :title="getLocalizedField(partner, 'name')"
      >
        <NuxtImg
          :src="partner.logo"
          :alt="getLocalizedField(partner, 'name')"
          width="160"
          height="80"
          fit="contain"
        />
        <span class="partner-logo__overlay">
          <span class="partner-logo__name">{{ getLocalizedField(partner, 'name') }}</span>
          <span class="partner-logo__type">{{ getTypeLabel(partner.partner_type) }}</span>
        </span>
      </a>
    </TransitionGroup>

    <!-- État vide -->
    <p v-if="!filteredPartners.length" class="partners-logos__empty">
      {{ $t('partners.no_partners') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Partenaire } from '~/types/database'

const props = defineProps<{
  partners: Partenaire[]
}>()

const { t } = useI18n()

const activeFilter = ref('')

const filters = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'academique', label: t('partners.types.academic') },
  { value: 'institutionnel', label: t('partners.types.institutional') },
  { value: 'entreprise', label: t('partners.types.business') },
  { value: 'ong', label: t('partners.types.ngo') }
])

const filteredPartners = computed(() => {
  if (!activeFilter.value) return props.partners
  return props.partners.filter(p => p.partner_type === activeFilter.value)
})

function getTypeLabel(type: string) {
  return t(`partners.types.${type}`)
}
</script>

<style scoped>
.partners-logos__filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 2rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--color-primary);
}

.filter-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.partners-logos__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.partner-logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-surface);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.partner-logo:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.partner-logo img {
  max-width: 100%;
  max-height: 60px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.7;
  transition: all 0.2s;
}

.partner-logo:hover img {
  filter: none;
  opacity: 1;
}

.partner-logo__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  opacity: 0;
  transition: opacity 0.2s;
  padding: 1rem;
  text-align: center;
  border-radius: 0.5rem;
}

.partner-logo:hover .partner-logo__overlay {
  opacity: 1;
}

.partner-logo__name {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.partner-logo__type {
  color: var(--color-primary-light);
  font-size: 0.75rem;
}

/* Animation */
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
```

---

## Fichier i18n: `partners.json`

```json
{
  "hero": {
    "title": "Nos partenaires",
    "subtitle": "Un réseau international au service de l'excellence"
  },
  "intro": {
    "content": "L'Université Senghor s'appuie sur un vaste réseau de partenaires pour offrir des formations de qualité à travers l'Afrique..."
  },
  "campus": {
    "title": "Nos campus dans le monde",
    "intro": "En plus de notre siège à Alexandrie, nous disposons de campus externalisés dans plusieurs pays africains...",
    "programs": "Formations proposées",
    "view_programs": "Voir les formations"
  },
  "map": {
    "main_campus": "Campus principal (Alexandrie)",
    "external_campus": "Campus externalisé"
  },
  "strategic": {
    "title": "Partenaires stratégiques",
    "intro": "Nous collaborons avec des institutions de premier plan..."
  },
  "types": {
    "academic": "Académiques",
    "institutional": "Institutionnels",
    "business": "Entreprises",
    "ngo": "ONG"
  },
  "become_partner": {
    "title": "Devenir partenaire",
    "content": "Vous souhaitez rejoindre notre réseau de partenaires ? Contactez-nous pour explorer les possibilités de collaboration.",
    "cta": "Nous contacter"
  },
  "no_partners": "Aucun partenaire dans cette catégorie"
}
```

---

## API / Composables

```ts
// composables/usePartners.ts
export function usePartners() {
  // Campus externalisés
  const { data: campuses } = await useFetch('/api/campus-externalises')

  // Partenaires
  const { data: partners } = await useFetch('/api/partenaires')

  // Partenaires stratégiques en premier
  const sortedPartners = computed(() => {
    if (!partners.value) return []
    return [...partners.value].sort((a, b) => {
      if (a.is_strategic && !b.is_strategic) return -1
      if (!a.is_strategic && b.is_strategic) return 1
      return 0
    })
  })

  return {
    campuses,
    partners: sortedPartners
  }
}
```

---

## Composable Map (Leaflet)

```ts
// composables/useMap.ts
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapOptions {
  center: [number, number]
  zoom: number
}

interface MarkerData {
  lat: number
  lng: number
  popup?: string
  type?: 'main' | 'external'
  onClick?: () => void
}

export function useMap() {
  let map: L.Map | null = null

  function initMap(container: HTMLElement, options: MapOptions) {
    map = L.map(container).setView(options.center, options.zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    return map
  }

  function addMarkers(mapInstance: L.Map, markers: MarkerData[]) {
    markers.forEach(marker => {
      const icon = L.divIcon({
        className: `map-marker map-marker--${marker.type || 'default'}`,
        iconSize: [30, 30]
      })

      const m = L.marker([marker.lat, marker.lng], { icon })
        .addTo(mapInstance)

      if (marker.popup) {
        m.bindPopup(marker.popup)
      }

      if (marker.onClick) {
        m.on('click', marker.onClick)
      }
    })
  }

  onUnmounted(() => {
    if (map) {
      map.remove()
      map = null
    }
  })

  return {
    initMap,
    addMarkers
  }
}
```

---

## Fichiers à créer

```
app/
├── pages/
│   └── a-propos/
│       └── partenaires.vue
├── components/
│   └── partners/
│       ├── CampusMap.vue
│       ├── CardCampus.vue
│       ├── CampusModal.vue
│       └── PartnersLogos.vue
├── composables/
│   ├── usePartners.ts
│   └── useMap.ts
├── server/api/
│   ├── campus-externalises.get.ts
│   └── partenaires.get.ts
i18n/locales/
├── fr/partners.json
├── en/partners.json
└── ar/partners.json
```

---

## Dépendances à installer

```bash
# Pour la carte interactive
pnpm add leaflet
pnpm add -D @types/leaflet

# Alternative: Mapbox GL
# pnpm add mapbox-gl
```
