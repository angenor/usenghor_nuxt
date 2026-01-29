<script setup lang="ts">
import type { SiteFacility } from '~/composables/useMockData'
import type { ContactInfo } from '~/composables/useContactApi'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getAllSiteFacilities } = useMockData()
const { getContactInfo, getGoogleMapsUrlWithCoords } = useContactApi()

// SEO
useSeoMeta({
  title: () => t('site.seo.title'),
  description: () => t('site.seo.description')
})

// Contact info (centralisé depuis /admin/editorial/contact)
const contactInfo = ref<ContactInfo | null>(null)

onMounted(async () => {
  try {
    contactInfo.value = await getContactInfo()
  }
  catch (e) {
    console.warn('Informations de contact non disponibles, utilisation des fallbacks')
  }
})

// Computed contact data avec fallbacks
const locationAddress = computed(() => {
  if (contactInfo.value?.address) {
    const { street, postal_code, city, country } = contactInfo.value.address
    return [street, postal_code, city, country].filter(Boolean).join(', ')
  }
  return 'Université Senghor, Alexandrie, Égypte'
})

const locationCoordinates = computed(() => {
  if (contactInfo.value?.address) {
    const { latitude, longitude } = contactInfo.value.address
    if (latitude && longitude) {
      return `${latitude}, ${longitude}`
    }
  }
  return '31.2018, 29.9158'
})

const locationPhone = computed(() => {
  return contactInfo.value?.phones?.main || '+20 3 484 3562'
})

const locationEmail = computed(() => {
  return contactInfo.value?.emails?.general || 'info@usenghor.org'
})

const mapsUrl = computed(() => {
  if (contactInfo.value?.address) {
    return getGoogleMapsUrlWithCoords(contactInfo.value.address)
  }
  return 'https://www.google.com/maps/place/Senghor+University/@31.2018,29.9158,17z'
})

// Get data
const facilities = computed(() => getAllSiteFacilities())

// Image carousel state per facility
const activeImageIndex = ref<Record<string, number>>({})

const getActiveImageIndex = (facilityId: string) => {
  return activeImageIndex.value[facilityId] || 0
}

const setActiveImageIndex = (facilityId: string, index: number) => {
  activeImageIndex.value[facilityId] = index
}

const nextImage = (facility: SiteFacility) => {
  const currentIndex = getActiveImageIndex(facility.id)
  const nextIndex = (currentIndex + 1) % facility.images.length
  setActiveImageIndex(facility.id, nextIndex)
}

const prevImage = (facility: SiteFacility) => {
  const currentIndex = getActiveImageIndex(facility.id)
  const prevIndex = currentIndex === 0 ? facility.images.length - 1 : currentIndex - 1
  setActiveImageIndex(facility.id, prevIndex)
}

// Localization helpers
const getLocalizedFacilityName = (facility: SiteFacility) => {
  if (locale.value === 'en') return facility.name_en
  if (locale.value === 'ar') return facility.name_ar
  return facility.name_fr
}

const getLocalizedFacilityDescription = (facility: SiteFacility) => {
  if (locale.value === 'en') return facility.description_en
  if (locale.value === 'ar') return facility.description_ar
  return facility.description_fr
}

const getLocalizedFacilityFeatures = (facility: SiteFacility) => {
  if (locale.value === 'en') return facility.features_en
  if (locale.value === 'ar') return facility.features_ar
  return facility.features_fr
}

// Stats
const stats = computed(() => [
  { label: t('site.presentation.stats.surface'), value: t('site.presentation.stats.surfaceValue') },
  { label: t('site.presentation.stats.rooms'), value: t('site.presentation.stats.roomsValue') },
  { label: t('site.presentation.stats.capacity'), value: t('site.presentation.stats.capacityValue') },
  { label: t('site.presentation.stats.founded'), value: t('site.presentation.stats.foundedValue') }
])

// Color configuration per facility (rotating colors)
const facilityColors = [
  {
    bgLight: 'bg-brand-blue-100',
    bgDark: 'dark:bg-brand-blue-900',
    bgLightHex: '#dbe4f8',
    bgDarkHex: '#1a2e73',
    textDark: 'dark:text-brand-blue-100',
    iconBg: 'bg-brand-blue-500'
  },
  {
    bgLight: 'bg-brand-red-100',
    bgDark: 'dark:bg-brand-red-900',
    bgLightHex: '#fee2e2',
    bgDarkHex: '#7f1d1d',
    textDark: 'dark:text-brand-red-100',
    iconBg: 'bg-brand-red-500'
  },
  {
    bgLight: 'bg-brand-blue-50',
    bgDark: 'dark:bg-brand-blue-950',
    bgLightHex: '#edf1fc',
    bgDarkHex: '#0f1a42',
    textDark: 'dark:text-brand-blue-50',
    iconBg: 'bg-brand-blue-600'
  },
  {
    bgLight: 'bg-brand-red-50',
    bgDark: 'dark:bg-brand-red-950',
    bgLightHex: '#fef2f2',
    bgDarkHex: '#450a0a',
    textDark: 'dark:text-brand-red-50',
    iconBg: 'bg-brand-red-600'
  },
  {
    bgLight: 'bg-brand-blue-200',
    bgDark: 'dark:bg-brand-blue-800',
    bgLightHex: '#c3d1f4',
    bgDarkHex: '#233da0',
    textDark: 'dark:text-brand-blue-200',
    iconBg: 'bg-brand-blue-400'
  },
  {
    bgLight: 'bg-brand-red-200',
    bgDark: 'dark:bg-brand-red-800',
    bgLightHex: '#fecaca',
    bgDarkHex: '#991b1b',
    textDark: 'dark:text-brand-red-200',
    iconBg: 'bg-brand-red-400'
  },
  {
    bgLight: 'bg-brand-blue-100',
    bgDark: 'dark:bg-brand-blue-900',
    bgLightHex: '#dbe4f8',
    bgDarkHex: '#1a2e73',
    textDark: 'dark:text-brand-blue-100',
    iconBg: 'bg-brand-blue-500'
  }
]

const getFacilityColors = (index: number) => facilityColors[index % facilityColors.length]!

// Get current section SVG color (for wave bubbles)
const getCurrentSvgColor = (index: number, isDark: boolean) => {
  const config = getFacilityColors(index)
  return isDark ? config.bgDarkHex : config.bgLightHex
}

// Get next section background color (for wave separator background)
const getNextBgColor = (index: number, isDark: boolean) => {
  if (index >= facilities.value.length - 1) return isDark ? '#111827' : '#f9fafb'
  const config = getFacilityColors(index + 1)
  return isDark ? config.bgDarkHex : config.bgLightHex
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <span class="inline-block px-4 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full mb-6">
            {{ t('site.hero.badge') }}
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ t('site.hero.title') }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            {{ t('site.hero.subtitle') }}
          </p>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <svg class="w-full h-12 md:h-16 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>

    <!-- Presentation Section -->
    <section class="py-16 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Text -->
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {{ t('site.presentation.title') }}
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {{ t('site.presentation.description') }}
            </p>
            <div class="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <font-awesome-icon icon="fa-solid fa-location-dot" class="w-5 h-5 text-brand-blue-600" />
              <span>{{ t('site.presentation.address') }}</span>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-6">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center"
            >
              <div class="text-3xl font-bold text-brand-blue-600 dark:text-brand-blue-400 mb-2">
                {{ stat.value }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Facilities Section -->
    <section>
      <!-- Header -->
      <div class="py-16 lg:py-20 bg-white dark:bg-gray-900 text-center">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ t('site.facilities.title') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
            </span>
          </h2>
          <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ t('site.facilities.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Facilities avec bubble waves -->
      <div
        v-for="(facility, index) in facilities"
        :key="facility.id"
        :id="facility.slug"
        class="section-bubble transition-colors duration-300 scroll-mt-20"
        :class="[getFacilityColors(index).bgLight, getFacilityColors(index).bgDark]"
      >
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <!-- Layout flex avec alternance image gauche/droite -->
          <div
            class="flex flex-col gap-8 lg:gap-12 items-center"
            :class="index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'"
          >
            <!-- Image Carousel -->
            <div class="w-full lg:w-5/12 flex-shrink-0">
              <div class="relative group">
                <!-- Forme décorative derrière l'image -->
                <div
                  class="absolute -inset-4 rounded-3xl opacity-30 blur-xl transition-all duration-500 group-hover:opacity-50"
                  :class="getFacilityColors(index).iconBg"
                ></div>
                <!-- Container carousel avec forme organique -->
                <div class="relative overflow-hidden rounded-3xl shadow-2xl">
                  <!-- Images carousel -->
                  <div
                    class="aspect-[4/3] overflow-hidden relative"
                    :style="{
                      clipPath: index % 2 === 0
                        ? 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)'
                        : 'polygon(0 0, 100% 0, 100% 100%, 15% 100%, 0 85%)'
                    }"
                  >
                    <!-- Images stack -->
                    <div
                      v-for="(image, imgIndex) in facility.images"
                      :key="imgIndex"
                      class="absolute inset-0 transition-opacity duration-500"
                      :class="getActiveImageIndex(facility.id) === imgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'"
                    >
                      <img
                        :src="image"
                        :alt="`${getLocalizedFacilityName(facility)} - ${imgIndex + 1}`"
                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <!-- Navigation arrows -->
                  <button
                    @click.stop="prevImage(facility)"
                    class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-4 h-4" />
                  </button>
                  <button
                    @click.stop="nextImage(facility)"
                    class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-4 h-4" />
                  </button>

                  <!-- Dots indicators -->
                  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    <button
                      v-for="(_, imgIndex) in facility.images"
                      :key="imgIndex"
                      @click.stop="setActiveImageIndex(facility.id, imgIndex)"
                      class="w-2.5 h-2.5 rounded-full transition-all"
                      :class="getActiveImageIndex(facility.id) === imgIndex
                        ? 'bg-white scale-110'
                        : 'bg-white/50 hover:bg-white/75'"
                    />
                  </div>

                  <!-- Overlay gradient -->
                  <div
                    class="absolute inset-0 opacity-20 pointer-events-none"
                    :class="getFacilityColors(index).iconBg"
                  ></div>

                  <!-- Badge flottant avec icône -->
                  <div
                    class="absolute bottom-4 shadow-lg flex items-center justify-center w-16 h-16 rounded-2xl z-20"
                    :class="[
                      getFacilityColors(index).iconBg,
                      index % 2 === 0 ? 'right-4' : 'left-4'
                    ]"
                  >
                    <font-awesome-icon
                      :icon="facility.icon"
                      class="w-8 h-8 text-white"
                    />
                  </div>
                </div>

                <!-- Thumbnails row -->
                <div class="flex gap-2 mt-4">
                  <button
                    v-for="(image, imgIndex) in facility.images"
                    :key="imgIndex"
                    @click="setActiveImageIndex(facility.id, imgIndex)"
                    class="flex-1 aspect-video rounded-lg overflow-hidden transition-all ring-offset-2"
                    :class="getActiveImageIndex(facility.id) === imgIndex
                      ? 'ring-2 ring-white opacity-100 scale-105'
                      : 'opacity-50 hover:opacity-75 grayscale hover:grayscale-0'"
                  >
                    <img
                      :src="image"
                      :alt="`${getLocalizedFacilityName(facility)} - ${imgIndex + 1}`"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                </div>
              </div>
            </div>

            <!-- Contenu texte -->
            <div class="w-full lg:w-7/12">
              <!-- Titre -->
              <h3
                class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                :class="getFacilityColors(index).textDark"
              >
                {{ getLocalizedFacilityName(facility) }}
              </h3>

              <!-- Ligne décorative -->
              <div
                class="w-20 h-1 rounded-full mb-6"
                :class="getFacilityColors(index).iconBg"
              ></div>

              <!-- Description -->
              <p
                class="text-gray-700 leading-relaxed text-lg mb-8"
                :class="getFacilityColors(index).textDark"
              >
                {{ getLocalizedFacilityDescription(facility) }}
              </p>

              <!-- Features list -->
              <ul class="space-y-3 mb-6">
                <li
                  v-for="(feature, featureIndex) in getLocalizedFacilityFeatures(facility)"
                  :key="featureIndex"
                  class="flex items-center gap-3 text-gray-700"
                  :class="getFacilityColors(index).textDark"
                >
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    :class="getFacilityColors(index).iconBg"
                  >
                    <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3 text-white" />
                  </div>
                  {{ feature }}
                </li>
              </ul>

              <!-- Capacity if available -->
              <div
                v-if="facility.capacity"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/60 dark:bg-gray-800/60"
              >
                <font-awesome-icon icon="fa-solid fa-users" class="w-4 h-4" />
                {{ t('site.facilities.capacity') }}: {{ facility.capacity }}
              </div>
            </div>
          </div>
        </div>

        <!-- Wave separator (sauf dernier) -->
        <div
          v-if="index < facilities.length - 1"
          class="wave-separator"
        >
          <!-- Light mode -->
          <div
            class="absolute inset-0 dark:hidden"
            :style="{ backgroundColor: getNextBgColor(index, false) }"
          >
            <!-- Wave type A (index pair) -->
            <svg
              v-if="index % 2 === 0"
              viewBox="0 0 1185 248"
              preserveAspectRatio="none"
              class="w-full h-full"
            >
              <circle cx="76" cy="121.1" r="20" :fill="getCurrentSvgColor(index, false)" />
              <circle cx="870" cy="201.1" r="11" :fill="getCurrentSvgColor(index, false)" />
              <circle cx="814.5" cy="165.6" r="24.5" :fill="getCurrentSvgColor(index, false)" />
              <path
                :fill="getCurrentSvgColor(index, false)"
                d="M0 0v17.7c22.7 14.8 53 31.9 90.7 51.5 150.8 78 322 116.6 424.8 69.3 102.9-47.4 138-69.3 210.8-69.3s118.3 48.6 219.5 38.3 76.3-59.3 188.7-59.3c18.9 0 35.5 2.6 50.5 6.8V0H0z"
              />
            </svg>
            <!-- Wave type B (index impair) -->
            <svg
              v-if="index % 2 === 1"
              viewBox="0 0 1185 248"
              preserveAspectRatio="none"
              class="w-full h-full"
            >
              <circle cx="1109" cy="126.9" r="20" :fill="getCurrentSvgColor(index, false)" />
              <circle cx="370.5" cy="82.4" r="24.5" :fill="getCurrentSvgColor(index, false)" />
              <circle cx="315" cy="46.9" r="11" :fill="getCurrentSvgColor(index, false)" />
              <path
                :fill="getCurrentSvgColor(index, false)"
                d="M50.5 199.8c112.4 0 87.5-49 188.7-59.3s146.7 38.3 219.5 38.3 107.9-21.9 210.8-69.3c102.8-47.3 274-8.7 424.8 69.3 37.7 19.5 68 36.7 90.7 51.5V0H0v193c15 4.2 31.6 6.8 50.5 6.8z"
              />
            </svg>
          </div>

          <!-- Dark mode -->
          <div
            class="absolute inset-0 hidden dark:block"
            :style="{ backgroundColor: getNextBgColor(index, true) }"
          >
            <!-- Wave type A (index pair) -->
            <svg
              v-if="index % 2 === 0"
              viewBox="0 0 1185 248"
              preserveAspectRatio="none"
              class="w-full h-full"
            >
              <circle cx="76" cy="121.1" r="20" :fill="getCurrentSvgColor(index, true)" />
              <circle cx="870" cy="201.1" r="11" :fill="getCurrentSvgColor(index, true)" />
              <circle cx="814.5" cy="165.6" r="24.5" :fill="getCurrentSvgColor(index, true)" />
              <path
                :fill="getCurrentSvgColor(index, true)"
                d="M0 0v17.7c22.7 14.8 53 31.9 90.7 51.5 150.8 78 322 116.6 424.8 69.3 102.9-47.4 138-69.3 210.8-69.3s118.3 48.6 219.5 38.3 76.3-59.3 188.7-59.3c18.9 0 35.5 2.6 50.5 6.8V0H0z"
              />
            </svg>
            <!-- Wave type B (index impair) -->
            <svg
              v-if="index % 2 === 1"
              viewBox="0 0 1185 248"
              preserveAspectRatio="none"
              class="w-full h-full"
            >
              <circle cx="1109" cy="126.9" r="20" :fill="getCurrentSvgColor(index, true)" />
              <circle cx="370.5" cy="82.4" r="24.5" :fill="getCurrentSvgColor(index, true)" />
              <circle cx="315" cy="46.9" r="11" :fill="getCurrentSvgColor(index, true)" />
              <path
                :fill="getCurrentSvgColor(index, true)"
                d="M50.5 199.8c112.4 0 87.5-49 188.7-59.3s146.7 38.3 219.5 38.3 107.9-21.9 210.8-69.3c102.8-47.3 274-8.7 424.8 69.3 37.7 19.5 68 36.7 90.7 51.5V0H0v193c15 4.2 31.6 6.8 50.5 6.8z"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Location Section - Données centralisées depuis /admin/editorial/contact -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('site.location.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            {{ t('site.location.subtitle') }}
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Map image - clickable to open Google Maps -->
          <a
            :href="mapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="group aspect-video lg:aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden relative block"
          >
            <img
              src="/images/bg/bg_stats_section.jpeg"
              alt="Campus Université Senghor - Alexandrie"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            >
            <!-- Overlay gradient -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-colors"></div>

            <!-- Content overlay -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <!-- Map icon -->
              <div class="w-20 h-20 bg-brand-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <font-awesome-icon icon="fa-solid fa-map-location-dot" class="w-10 h-10 text-white" />
              </div>
              <span class="px-6 py-3 bg-white/90 dark:bg-gray-900/90 text-brand-blue-600 dark:text-brand-blue-400 font-semibold rounded-full shadow-lg flex items-center gap-2 group-hover:bg-brand-blue-600 group-hover:text-white transition-colors">
                <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-4 h-4" />
                {{ t('site.location.openMaps') }}
              </span>
            </div>
          </a>

          <!-- Contact info - depuis useContactApi -->
          <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.address') }}</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ locationAddress }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-globe" class="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.coordinates') }}</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ locationCoordinates }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-phone" class="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.phone') }}</h3>
                  <a :href="`tel:${locationPhone.replace(/\\s/g, '')}`" class="text-gray-600 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors">
                    {{ locationPhone }}
                  </a>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-envelope" class="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.email') }}</h3>
                  <a :href="`mailto:${locationEmail}`" class="text-gray-600 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors">
                    {{ locationEmail }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-brand-blue-500 to-brand-blue-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ t('site.cta.title') }}
        </h2>
        <p class="text-lg text-brand-blue-100 mb-8">
          {{ t('site.cta.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            :to="localePath('/contact')"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-blue-600 font-semibold rounded-lg hover:bg-brand-blue-50 transition-colors shadow-lg"
          >
            {{ t('site.cta.contactButton') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Wave separator styles */
.wave-separator {
  position: relative;
  height: 120px;
  overflow: hidden;
}

@media (min-width: 768px) {
  .wave-separator {
    height: 160px;
  }
}

@media (min-width: 1024px) {
  .wave-separator {
    height: 200px;
  }
}

/* Section bubble container */
.section-bubble {
  position: relative;
}
</style>
