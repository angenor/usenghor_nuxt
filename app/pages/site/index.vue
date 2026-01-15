<script setup lang="ts">
import type { SiteFacility, SiteGalleryItem } from '~/composables/useMockData'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  getAllSiteFacilities,
  getAllSiteGallery,
  getSitePhotos,
  getSiteVideos
} = useMockData()

// SEO
useSeoMeta({
  title: () => t('site.seo.title'),
  description: () => t('site.seo.description')
})

// Get data
const facilities = computed(() => getAllSiteFacilities())
const gallery = computed(() => getAllSiteGallery())
const photos = computed(() => getSitePhotos())
const videos = computed(() => getSiteVideos())

// Gallery tab
const activeGalleryTab = ref<'all' | 'photos' | 'videos'>('all')

const visibleGallery = computed(() => {
  if (activeGalleryTab.value === 'photos') return photos.value
  if (activeGalleryTab.value === 'videos') return videos.value
  return gallery.value
})

// Lightbox
const lightboxOpen = ref(false)
const lightboxItem = ref<SiteGalleryItem | null>(null)

const openLightbox = (item: SiteGalleryItem) => {
  lightboxItem.value = item
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
  lightboxItem.value = null
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

const getLocalizedGalleryTitle = (item: SiteGalleryItem) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
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
    bgLight: 'bg-amber-100',
    bgDark: 'dark:bg-amber-900',
    bgLightHex: '#fef3c7',
    bgDarkHex: '#78350f',
    textDark: 'dark:text-amber-100',
    iconBg: 'bg-amber-500'
  },
  {
    bgLight: 'bg-emerald-100',
    bgDark: 'dark:bg-emerald-900',
    bgLightHex: '#d1fae5',
    bgDarkHex: '#064e3b',
    textDark: 'dark:text-emerald-100',
    iconBg: 'bg-emerald-500'
  },
  {
    bgLight: 'bg-purple-100',
    bgDark: 'dark:bg-purple-900',
    bgLightHex: '#f3e8ff',
    bgDarkHex: '#581c87',
    textDark: 'dark:text-purple-100',
    iconBg: 'bg-purple-500'
  },
  {
    bgLight: 'bg-sky-100',
    bgDark: 'dark:bg-sky-900',
    bgLightHex: '#e0f2fe',
    bgDarkHex: '#0c4a6e',
    textDark: 'dark:text-sky-100',
    iconBg: 'bg-sky-500'
  },
  {
    bgLight: 'bg-rose-100',
    bgDark: 'dark:bg-rose-900',
    bgLightHex: '#ffe4e6',
    bgDarkHex: '#881337',
    textDark: 'dark:text-rose-100',
    iconBg: 'bg-rose-500'
  },
  {
    bgLight: 'bg-indigo-100',
    bgDark: 'dark:bg-indigo-900',
    bgLightHex: '#e0e7ff',
    bgDarkHex: '#312e81',
    textDark: 'dark:text-indigo-100',
    iconBg: 'bg-indigo-500'
  },
  {
    bgLight: 'bg-teal-100',
    bgDark: 'dark:bg-teal-900',
    bgLightHex: '#ccfbf1',
    bgDarkHex: '#134e4a',
    textDark: 'dark:text-teal-100',
    iconBg: 'bg-teal-500'
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
      <div class="absolute inset-0 opacity-10 heropattern-topography-amber-500"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <span class="inline-block px-4 py-1.5 text-sm font-semibold text-amber-900 bg-amber-400 rounded-full mb-6">
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
              <font-awesome-icon icon="fa-solid fa-location-dot" class="w-5 h-5 text-amber-600" />
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
              <div class="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
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
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
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
            <!-- Image illustrative -->
            <div class="w-full lg:w-5/12 flex-shrink-0">
              <div class="relative group">
                <!-- Forme décorative derrière l'image -->
                <div
                  class="absolute -inset-4 rounded-3xl opacity-30 blur-xl transition-all duration-500 group-hover:opacity-50"
                  :class="getFacilityColors(index).iconBg"
                ></div>
                <!-- Container image avec forme organique -->
                <div class="relative overflow-hidden rounded-3xl shadow-2xl">
                  <!-- Masque SVG pour forme organique -->
                  <div
                    class="aspect-[4/3] overflow-hidden"
                    :style="{
                      clipPath: index % 2 === 0
                        ? 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)'
                        : 'polygon(0 0, 100% 0, 100% 100%, 15% 100%, 0 85%)'
                    }"
                  >
                    <img
                      :src="facility.image"
                      :alt="getLocalizedFacilityName(facility)"
                      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <!-- Overlay gradient -->
                  <div
                    class="absolute inset-0 opacity-20"
                    :class="getFacilityColors(index).iconBg"
                  ></div>
                  <!-- Badge flottant avec icône -->
                  <div
                    class="absolute bottom-4 shadow-lg flex items-center justify-center w-16 h-16 rounded-2xl"
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

    <!-- Gallery Section -->
    <section class="py-16 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('site.gallery.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            {{ t('site.gallery.subtitle') }}
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex justify-center gap-4 mb-10">
          <button
            v-for="tab in (['all', 'photos', 'videos'] as const)"
            :key="tab"
            @click="activeGalleryTab = tab"
            class="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            :class="activeGalleryTab === tab
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
          >
            {{ t(`site.gallery.tabs.${tab}`) }}
            <span class="ml-1 text-xs opacity-75">
              ({{ tab === 'all' ? gallery.length : tab === 'photos' ? photos.length : videos.length }})
            </span>
          </button>
        </div>

        <!-- Gallery Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in visibleGallery"
            :key="item.id"
            @click="openLightbox(item)"
            class="group relative aspect-video rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <img
              :src="item.thumbnail"
              :alt="getLocalizedGalleryTitle(item)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            >
            <div class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors"></div>

            <!-- Play button for videos -->
            <div
              v-if="item.type === 'video'"
              class="absolute inset-0 flex items-center justify-center"
            >
              <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <font-awesome-icon icon="fa-solid fa-play" class="w-6 h-6 text-amber-600 ml-1" />
              </div>
            </div>

            <!-- Title overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p class="text-white font-medium text-sm">{{ getLocalizedGalleryTitle(item) }}</p>
              <span class="text-white/70 text-xs">
                {{ item.type === 'video' ? t('site.gallery.tabs.videos') : t('site.gallery.tabs.photos') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxOpen && lightboxItem"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          @click.self="closeLightbox"
        >
          <!-- Close button -->
          <button
            @click="closeLightbox"
            class="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-times" class="w-5 h-5 text-white" />
          </button>

          <!-- Content -->
          <div class="max-w-5xl w-full">
            <!-- Image -->
            <img
              v-if="lightboxItem.type === 'photo'"
              :src="lightboxItem.url"
              :alt="getLocalizedGalleryTitle(lightboxItem)"
              class="w-full max-h-[80vh] object-contain rounded-lg"
            >

            <!-- Video -->
            <div v-else class="aspect-video">
              <iframe
                :src="lightboxItem.url"
                class="w-full h-full rounded-lg"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <!-- Caption -->
            <p class="text-white text-center mt-4 text-lg">
              {{ getLocalizedGalleryTitle(lightboxItem) }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Location Section -->
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
          <!-- Map placeholder -->
          <div class="aspect-video lg:aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden relative">
            <img
              src="https://picsum.photos/seed/senghor-map/800/600"
              alt="Campus location"
              class="w-full h-full object-cover"
              loading="lazy"
            >
            <div class="absolute inset-0 flex items-center justify-center">
              <a
                href="https://www.google.com/maps/place/Senghor+University/@31.2018,29.9158,17z"
                target="_blank"
                rel="noopener noreferrer"
                class="px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-lg flex items-center gap-2"
              >
                <font-awesome-icon icon="fa-solid fa-map-location-dot" class="w-5 h-5" />
                {{ t('site.location.openMaps') }}
              </a>
            </div>
          </div>

          <!-- Contact info -->
          <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.address') }}</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ t('site.location.addressValue') }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-globe" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.coordinates') }}</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ t('site.location.coordinatesValue') }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-phone" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.phone') }}</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ t('site.location.phoneValue') }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <font-awesome-icon icon="fa-solid fa-envelope" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-1">{{ t('site.location.email') }}</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ t('site.location.emailValue') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-amber-500 to-amber-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ t('site.cta.title') }}
        </h2>
        <p class="text-lg text-amber-100 mb-8">
          {{ t('site.cta.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            :to="localePath('/contact')"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow-lg"
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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
