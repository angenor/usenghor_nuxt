<script setup lang="ts">
import World from '@svg-maps/world'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { campusExternalises, campusPrincipal, getFlagEmoji } = useMockData()

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: mapRef } = useScrollAnimation({ animation: 'fadeInLeft', threshold: 0.1 })
const { elementRef: campusButtonsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

// Ref for the campus card to scroll to
const campusCardRef = ref<HTMLElement | null>(null)

// World map data
const map = World

// Hovered country state
const hovered = ref<{ id: string; name: string } | null>(null)

// Mouse position for tooltip
const mousePosition = ref({ x: 0, y: 0 })

// Handle mouse move on map
const handleMouseMove = (event: MouseEvent) => {
  const container = event.currentTarget as HTMLElement
  const rect = container.getBoundingClientRect()
  mousePosition.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

// Build all campuses list (headquarters + external)
interface CampusItem {
  id: string
  slug?: string
  name_fr: string
  name_en?: string
  name_ar?: string
  city_fr: string
  city_en?: string
  city_ar?: string
  country: string
  country_fr: string
  country_en?: string
  country_ar?: string
  description_fr: string
  description_en?: string
  description_ar?: string
  image?: string
  type: 'headquarters' | 'campus'
  url?: string
}

const allCampuses = computed<CampusItem[]>(() => {
  const headquarters: CampusItem = {
    id: 'headquarters',
    name_fr: campusPrincipal.name_fr,
    name_en: campusPrincipal.name_en,
    name_ar: campusPrincipal.name_ar,
    city_fr: campusPrincipal.city_fr,
    city_en: campusPrincipal.city_en,
    city_ar: campusPrincipal.city_ar,
    country: 'EG',
    country_fr: 'Égypte',
    country_en: 'Egypt',
    country_ar: 'مصر',
    description_fr: "Siège principal de l'Université Senghor, situé dans la ville historique d'Alexandrie.",
    description_en: 'Main headquarters of Senghor University, located in the historic city of Alexandria.',
    description_ar: 'المقر الرئيسي لجامعة سنغور، يقع في مدينة الإسكندرية التاريخية.',
    image: '/images/bg/backgroud_senghor1.jpg',
    type: 'headquarters',
    url: 'https://www.usenghor.org'
  }

  const external = campusExternalises.value.map(c => ({
    ...c,
    type: 'campus' as const
  }))

  return [headquarters, ...external]
})

// External campuses only (for the buttons list - excludes headquarters)
const externalCampusesOnly = computed(() => {
  return allCampuses.value.filter(c => c.type === 'campus')
})

// Selected campus state - First external campus by default
const selectedCampus = ref<CampusItem>((externalCampusesOnly.value[0] ?? allCampuses.value[0])!)

// Build colored countries from campus data
const coloredCountries = computed(() => {
  const countries: Record<string, { color: string; type: string; slug?: string }> = {
    // Headquarters (Egypt)
    eg: { color: '#f59e0b', type: 'headquarters' }
  }

  // Add external campuses
  campusExternalises.value.forEach(campus => {
    countries[campus.country.toLowerCase()] = {
      color: '#3b82f6',
      type: 'campus',
      slug: campus.slug
    }
  })

  return countries
})

// Default color for non-highlighted countries
const defaultColor = '#e5e7eb'

// Selected color (green)
const selectedColor = '#22c55e'

// Adjust brightness for hover effect
const adjustBrightness = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`
}

// Get color for a country
const getColor = (id: string): string => {
  const isHovered = hovered.value?.id === id
  const isSelected = selectedCampus.value?.country.toLowerCase() === id
  const countryData = coloredCountries.value[id]

  if (countryData) {
    if (isSelected) {
      return isHovered ? adjustBrightness(selectedColor, -15) : selectedColor
    }
    if (isHovered) {
      return adjustBrightness(countryData.color, -15)
    }
    return countryData.color
  }

  if (isHovered) {
    return '#bdbdbd'
  }

  return defaultColor
}

// Get campus for a country
const getCampusForCountry = (countryId: string) => {
  return allCampuses.value.find(c => c.country.toLowerCase() === countryId)
}

// Computed property for hovered campus
const hoveredCampus = computed(() => {
  if (!hovered.value) return null
  return getCampusForCountry(hovered.value.id)
})

// Scroll to campus card
const scrollToCampusCard = () => {
  nextTick(() => {
    if (campusCardRef.value) {
      campusCardRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  })
}

// Handle country click
const handleCountryClick = (location: { id: string }) => {
  const campus = getCampusForCountry(location.id)
  if (campus) {
    selectedCampus.value = campus
    scrollToCampusCard()
  }
}

// Handle tooltip click
const handleTooltipClick = () => {
  if (hovered.value) {
    const campus = getCampusForCountry(hovered.value.id)
    if (campus) {
      selectedCampus.value = campus
      scrollToCampusCard()
    }
  }
}

// Get localized field helper
const getLocalizedField = (campus: CampusItem, field: string): string => {
  if (locale.value === 'ar') {
    return (campus as any)[`${field}_ar`] || (campus as any)[`${field}_en`] || (campus as any)[`${field}_fr`]
  }
  if (locale.value === 'en') {
    return (campus as any)[`${field}_en`] || (campus as any)[`${field}_fr`]
  }
  return (campus as any)[`${field}_fr`]
}

// Fallback image handler
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop'
}
</script>

<template>
  <section id="campus-externalises" class="relative py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-visible">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-amber-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-amber-900/10"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute bottom-0 -left-40 w-80 h-80 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div ref="headerRef" class="text-center mb-12 lg:mb-16">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-globe-africa" class="w-3.5 h-3.5 mr-2" />
          {{ t('partners.campus.title') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="relative inline-block">
            {{ t('partners.campus.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.campus.subtitle') }}
        </p>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap justify-center gap-4 lg:gap-6 mb-8">
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full bg-amber-500"></span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('partners.campus.headquarters') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full bg-blue-500"></span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('partners.campus.externalCampus') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full bg-green-500"></span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('partners.campus.selected') }}</span>
        </div>
      </div>

      <!-- Campus Name Cards -->
      <div ref="campusButtonsRef" class="mb-12">
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="campus in externalCampusesOnly"
            :key="campus.id"
            class="campus-name-card"
            :class="{
              'campus-name-card--active': selectedCampus.id === campus.id
            }"
            @click="selectedCampus = campus; scrollToCampusCard()"
          >
            <span class="ltr:mr-1 rtl:ml-1">{{ getFlagEmoji(campus.country) }}</span>
            {{ getLocalizedField(campus, 'city') }}
          </button>
        </div>
      </div>

      <!-- Map and Card Container -->
      <div ref="mapRef" class="relative flex flex-col lg:flex-row gap-6 lg:gap-0">
        <!-- Map Container -->
        <div class="relative flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-4 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl ltr:lg:mr-[-80px] rtl:lg:ml-[-80px] z-10">
          <!-- Map -->
          <div class="map-container relative" @mousemove="handleMouseMove">
            <svg
              :viewBox="map.viewBox"
              class="world-map w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                v-for="location in map.locations"
                :key="location.id"
                :d="location.path"
                :fill="getColor(location.id)"
                stroke="#fff"
                stroke-width="0.5"
                class="map-path"
                :class="{ 'cursor-pointer': coloredCountries[location.id] }"
                @mouseenter="hovered = location"
                @mouseleave="hovered = null"
                @click="handleCountryClick(location)"
              />
            </svg>

            <!-- Tooltip -->
            <Transition name="fade">
              <div
                v-if="hovered"
                class="tooltip"
                :class="{ 'tooltip-clickable': hoveredCampus }"
                :style="{
                  left: mousePosition.x + 15 + 'px',
                  top: mousePosition.y - 10 + 'px'
                }"
                @click.stop="handleTooltipClick"
              >
                <template v-if="hoveredCampus">
                  <span class="tooltip-campus-name">{{ getLocalizedField(hoveredCampus, 'name') }}</span>
                  <span class="tooltip-hint">{{ locale === 'ar' ? 'انقر للعرض' : locale === 'en' ? 'Click to view' : 'Cliquer pour voir' }}</span>
                </template>
                <template v-else>
                  {{ hovered.name }}
                </template>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Campus Card (Notebook style) -->
        <div ref="campusCardRef" class="campus-card-wrapper lg:w-[380px] lg:flex-shrink-0 z-20 lg:mt-12">
          <Transition
            mode="out-in"
            enter-active-class="animate__animated animate__flipInY animate__faster"
            leave-active-class="animate__animated animate__flipOutY animate__faster"
          >
            <div class="campus-card" :key="selectedCampus.id">
              <!-- Image -->
              <div class="card-image">
                <img
                  :src="selectedCampus.image || `https://picsum.photos/seed/${selectedCampus.id}/600/400`"
                  :alt="getLocalizedField(selectedCampus, 'name')"
                  @error="handleImageError"
                />
                <!-- Badge -->
                <div
                  class="absolute top-4 ltr:left-4 rtl:right-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  :class="selectedCampus.type === 'headquarters' ? 'bg-amber-500' : 'bg-blue-500'"
                >
                  {{ selectedCampus.type === 'headquarters' ? t('partners.campus.headquarters') : t('partners.campus.externalCampus') }}
                </div>
              </div>

              <!-- Content -->
              <div class="card-content">
                <h3 class="card-title">{{ getLocalizedField(selectedCampus, 'name') }}</h3>
                <p class="card-country">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                  {{ getLocalizedField(selectedCampus, 'city') }}, {{ getLocalizedField(selectedCampus, 'country') }}
                </p>
                <div class="card-text">
                  <p>{{ getLocalizedField(selectedCampus, 'description') }}</p>
                </div>

                <!-- CTA -->
                <NuxtLink
                  v-if="selectedCampus.type === 'headquarters'"
                  :to="localePath('/site')"
                  class="card-cta"
                >
                  {{ t('partners.campus.viewDetails') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
                </NuxtLink>
                <NuxtLink
                  v-else-if="selectedCampus.type === 'campus' && selectedCampus.slug"
                  :to="localePath(`/a-propos/partenaires/campus/${selectedCampus.slug}`)"
                  class="card-cta"
                >
                  {{ t('partners.campus.viewDetails') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
                </NuxtLink>
                <a
                  v-else-if="selectedCampus.url"
                  :href="selectedCampus.url"
                  target="_blank"
                  class="card-cta"
                >
                  {{ t('partners.campus.visitWebsite') }}
                  <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-4 h-4 ltr:ml-2 rtl:mr-2" />
                </a>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Map Container */
.map-container {
  position: relative;
  width: 100%;
}

.world-map {
  width: 100%;
  height: auto;
}

/* Map Path Styles */
.map-path {
  transition: fill 0.2s ease, opacity 0.2s ease;
}

.map-path:hover {
  opacity: 0.85;
}

/* Tooltip */
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  pointer-events: none;
  z-index: 50;
  white-space: nowrap;
  transform: translateY(-50%);
}

.tooltip-clickable {
  pointer-events: auto;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.tooltip-clickable:hover {
  background: rgba(59, 130, 246, 0.95);
  transform: translateY(-50%) scale(1.05);
}

.tooltip-campus-name {
  font-weight: 600;
  font-size: 14px;
}

.tooltip-hint {
  font-size: 11px;
  opacity: 0.7;
  font-weight: 400;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Blob Animation */
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(30px, 10px) scale(1.05);
  }
}

.animate-blob {
  animation: blob 12s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

/* Campus Card - Notebook Style */
.campus-card-wrapper {
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

.campus-card {
  background-color: white;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-left: 30px;
  background:
    repeating-linear-gradient(#0000 0 calc(1.4rem - 1px), #e5e7eb 0 1.4rem) right bottom / 100% 100%,
    linear-gradient(#3b82f6 0 0) 30px 0 / 2px 100% #fff;
  background-repeat: no-repeat;
  line-height: 1.4rem;
  -webkit-mask: radial-gradient(circle 0.8rem at 2px 50%, #0000 98%, #000) 0 0 / 100% 2.8rem;
  mask: radial-gradient(circle 0.8rem at 2px 50%, #0000 98%, #000) 0 0 / 100% 2.8rem;
}

/* RTL styles for notebook card */
:root[dir="rtl"] .campus-card {
  padding-left: 0;
  padding-right: 30px;
  background:
    repeating-linear-gradient(#0000 0 calc(1.4rem - 1px), #e5e7eb 0 1.4rem) left bottom / 100% 100%,
    linear-gradient(#3b82f6 0 0) calc(100% - 30px) 0 / 2px 100% #fff;
  background-repeat: no-repeat;
  -webkit-mask: radial-gradient(circle 0.8rem at calc(100% - 2px) 50%, #0000 98%, #000) 0 0 / 100% 2.8rem;
  mask: radial-gradient(circle 0.8rem at calc(100% - 2px) 50%, #0000 98%, #000) 0 0 / 100% 2.8rem;
}

:root.dark .campus-card {
  background:
    repeating-linear-gradient(#0000 0 calc(1.4rem - 1px), #374151 0 1.4rem) right bottom / 100% 100%,
    linear-gradient(#3b82f6 0 0) 30px 0 / 2px 100% #1f2937;
  background-repeat: no-repeat;
}

:root.dark[dir="rtl"] .campus-card {
  background:
    repeating-linear-gradient(#0000 0 calc(1.4rem - 1px), #374151 0 1.4rem) left bottom / 100% 100%,
    linear-gradient(#3b82f6 0 0) calc(100% - 30px) 0 / 2px 100% #1f2937;
  background-repeat: no-repeat;
}

.card-image {
  height: 200px;
  padding: 1.4rem 1.4rem 0;
  position: relative;
}

.card-image::before,
.card-image::after {
  content: "";
  position: absolute;
  width: 20px;
  left: 60%;
  top: 0;
  height: 45px;
  background: rgba(230, 230, 230, 0.72);
  transform: rotate(45deg);
}

.card-image::after {
  transform: rotate(-45deg);
  top: auto;
  bottom: -22px;
  left: 40%;
}

/* RTL tape decorations */
:root[dir="rtl"] .card-image::before {
  left: auto;
  right: 60%;
  transform: rotate(-45deg);
}

:root[dir="rtl"] .card-image::after {
  left: auto;
  right: 40%;
  transform: rotate(45deg);
}

:root.dark .card-image::before,
:root.dark .card-image::after {
  background: rgba(55, 65, 81, 0.72);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
}

.card-content {
  padding: 1.4rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
  line-height: 1.4rem;
  padding-top: 0.7rem;
}

:root.dark .card-title {
  color: #f9fafb;
}

.card-country {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  margin: 0 0 1.4rem 0;
  line-height: 1.4rem;
}

:root.dark .card-country {
  color: #9ca3af;
}

.card-text {
  margin: 0 0 1.4rem 0;
}

.card-text p {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.4rem;
}

:root.dark .card-text p {
  color: #d1d5db;
}

.card-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: #fffef0;
  color: #1e40af;
  font-weight: 600;
  font-family: 'Caveat', 'Comic Sans MS', cursive;
  font-size: 1.1rem;
  text-decoration: none;
  position: relative;
  border: none;
  box-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.1),
    inset 0 0 20px rgba(255, 251, 235, 0.5);
  transition: all 0.2s ease;
  transform: rotate(-1deg);
}

.card-cta::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 12px;
  background: linear-gradient(
    to bottom,
    rgba(59, 130, 246, 0.6) 0%,
    rgba(59, 130, 246, 0.4) 100%
  );
  border-radius: 2px;
}

.card-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.02) 2px,
    rgba(0, 0, 0, 0.02) 4px
  );
  pointer-events: none;
}

.card-cta:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 20px rgba(255, 251, 235, 0.5);
}

:root.dark .card-cta {
  background: #fefce8;
  color: #1e40af;
}

/* Campus Name Cards */
.campus-name-card {
  padding: 0.5rem 1rem;
  background: #fffef0;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  position: relative;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  transform: rotate(var(--rotation, 0deg));
}

.campus-name-card:nth-child(odd) {
  --rotation: -1deg;
}

.campus-name-card:nth-child(even) {
  --rotation: 1deg;
}

.campus-name-card:nth-child(3n) {
  --rotation: -0.5deg;
}

.campus-name-card::before {
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 8px;
  background: rgba(156, 163, 175, 0.5);
  border-radius: 1px;
}

.campus-name-card:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.12);
  background: #fefce8;
}

.campus-name-card--active {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.campus-name-card--active::before {
  background: rgba(59, 130, 246, 0.6);
}

.campus-name-card--headquarters {
  background: #fef3c7;
  color: #92400e;
}

.campus-name-card--headquarters::before {
  background: rgba(245, 158, 11, 0.6);
}

.campus-name-card--headquarters.campus-name-card--active {
  background: #fde68a;
}

:root.dark .campus-name-card {
  background: #374151;
  color: #e5e7eb;
}

:root.dark .campus-name-card:hover {
  background: #4b5563;
}

:root.dark .campus-name-card--active {
  background: #1e40af;
  color: #fff;
}

:root.dark .campus-name-card--headquarters {
  background: #78350f;
  color: #fef3c7;
}

:root.dark .campus-name-card--headquarters.campus-name-card--active {
  background: #b45309;
}
</style>
