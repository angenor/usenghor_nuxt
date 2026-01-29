<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { sectors, getFormationsBySector } = useMockData()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeIn', threshold: 0.05 })

// Map sector icons to Font Awesome icons
const iconMap: Record<string, string> = {
  palette: 'fa-solid fa-palette',
  leaf: 'fa-solid fa-leaf',
  briefcase: 'fa-solid fa-briefcase',
  'heart-pulse': 'fa-solid fa-heart-pulse',
  'graduation-cap': 'fa-solid fa-graduation-cap'
}

// Color configuration per sector
// svgFill = couleur de la section courante (pour les bulles SVG)
// nextBg = couleur de fond de la section suivante (pour le fond du separateur)
const colorConfig: Record<string, {
  bgLight: string
  bgDark: string
  bgLightHex: string
  bgDarkHex: string
  textDark: string
  iconBg: string
  badgeBg: string
  badgeText: string
}> = {
  '#8B5CF6': {
    bgLight: 'bg-purple-100',
    bgDark: 'dark:bg-purple-900',
    bgLightHex: '#f3e8ff', // purple-100
    bgDarkHex: '#581c87', // purple-900
    textDark: 'dark:text-purple-100',
    iconBg: 'bg-purple-500',
    badgeBg: 'bg-white/60 dark:bg-purple-800/60',
    badgeText: 'text-purple-700 dark:text-purple-200'
  },
  '#10B981': {
    bgLight: 'bg-emerald-100',
    bgDark: 'dark:bg-emerald-900',
    bgLightHex: '#d1fae5', // emerald-100
    bgDarkHex: '#064e3b', // emerald-900
    textDark: 'dark:text-emerald-100',
    iconBg: 'bg-emerald-500',
    badgeBg: 'bg-white/60 dark:bg-emerald-800/60',
    badgeText: 'text-emerald-700 dark:text-emerald-200'
  },
  '#F59E0B': {
    bgLight: 'bg-brand-blue-100',
    bgDark: 'dark:bg-brand-blue-900',
    bgLightHex: '#dce6ff', // brand-blue-100
    bgDarkHex: '#1e3a8a', // brand-blue-900
    textDark: 'dark:text-brand-blue-100',
    iconBg: 'bg-brand-blue-500',
    badgeBg: 'bg-white/60 dark:bg-brand-blue-800/60',
    badgeText: 'text-brand-blue-700 dark:text-brand-blue-200'
  },
  '#EF4444': {
    bgLight: 'bg-rose-100',
    bgDark: 'dark:bg-rose-900',
    bgLightHex: '#ffe4e6', // rose-100
    bgDarkHex: '#881337', // rose-900
    textDark: 'dark:text-rose-100',
    iconBg: 'bg-rose-500',
    badgeBg: 'bg-white/60 dark:bg-rose-800/60',
    badgeText: 'text-rose-700 dark:text-rose-200'
  },
  '#6366F1': {
    bgLight: 'bg-indigo-100',
    bgDark: 'dark:bg-indigo-900',
    bgLightHex: '#e0e7ff', // indigo-100
    bgDarkHex: '#312e81', // indigo-900
    textDark: 'dark:text-indigo-100',
    iconBg: 'bg-indigo-500',
    badgeBg: 'bg-white/60 dark:bg-indigo-800/60',
    badgeText: 'text-indigo-700 dark:text-indigo-200'
  }
}

const getIcon = (icon: string) => iconMap[icon] || 'fa-solid fa-building'
const getColors = (hexColor: string) => colorConfig[hexColor] || colorConfig['#F59E0B']

// Couleur de la section courante (pour le SVG/bulles)
const getCurrentSvgColor = (index: number, isDark: boolean) => {
  const dept = sectors.value[index]
  const config = getColors(sec.color)
  return isDark ? config.bgDarkHex : config.bgLightHex
}

// Couleur de fond de la section suivante (pour le fond du séparateur)
const getNextBgColor = (index: number, isDark: boolean) => {
  if (index >= sectors.value.length - 1) return isDark ? '#111827' : '#f3f4f6'
  const nextSec = sectors.value[index + 1]
  const config = getColors(nextSec.color)
  return isDark ? config.bgDarkHex : config.bgLightHex
}

// Get sector name based on locale
const getSectorName = (sec: any) => {
  if (locale.value === 'ar') return sec.name_ar
  if (locale.value === 'en') return sec.name_en
  return sec.name_fr
}

// Get sector description based on locale
const getSectorDescription = (sec: any) => {
  if (locale.value === 'ar') return sec.description_ar || sec.description_fr
  if (locale.value === 'en') return sec.description_en || sec.description_fr
  return sec.description_fr
}

// Get formation name based on locale
const getFormationName = (formation: any) => {
  if (locale.value === 'ar') return formation.title_ar || formation.title_fr
  if (locale.value === 'en') return formation.title_en || formation.title_fr
  return formation.title_fr
}

// Images illustratives par département (utilisant picsum avec seed pour consistance)
const sectorImages: Record<string, string> = {
  'sec-culture': 'https://picsum.photos/seed/culture-art/600/400',
  'sec-environnement': 'https://picsum.photos/seed/environment-nature/600/400',
  'sec-management': 'https://picsum.photos/seed/business-management/600/400',
  'sec-sante': 'https://picsum.photos/seed/health-medical/600/400',
  'sec-doctoral': 'https://picsum.photos/seed/research-doctoral/600/400'
}

const getSectorImage = (deptId: string) => sectorImages[deptId] || 'https://picsum.photos/seed/university/600/400'
</script>

<template>
  <section ref="sectionRef">
    <!-- Header -->
    <div class="py-16 lg:py-20 bg-white dark:bg-gray-900 text-center">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ t('organization.sectors.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('organization.sectors.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Départements avec bubble waves -->
    <div
      v-for="(dept, index) in sectors"
      :key="sec.id"
      :id="sec.slug"
      class="section-bubble transition-colors duration-300 scroll-mt-20"
      :class="[getColors(sec.color)?.bgLight, getColors(sec.color)?.bgDark]"
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
                :class="getColors(sec.color).iconBg"
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
                    :src="getSectorImage(sec.id)"
                    :alt="getSectorName(sec)"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <!-- Overlay gradient -->
                <div
                  class="absolute inset-0 opacity-20"
                  :class="getColors(sec.color).iconBg"
                ></div>
                <!-- Badge flottant avec icône -->
                <div
                  class="absolute bottom-4 shadow-lg flex items-center justify-center w-16 h-16 rounded-2xl"
                  :class="[
                    getColors(sec.color).iconBg,
                    index % 2 === 0 ? 'right-4' : 'left-4'
                  ]"
                >
                  <font-awesome-icon
                    :icon="getIcon(sec.icon)"
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
              :class="getColors(sec.color).textDark"
            >
              {{ getSectorName(sec) }}
            </h3>

            <!-- Ligne décorative -->
            <div
              class="w-20 h-1 rounded-full mb-6"
              :class="getColors(sec.color).iconBg"
            ></div>

            <!-- Description -->
            <p
              class="text-gray-700 leading-relaxed text-lg mb-8"
              :class="getColors(sec.color).textDark"
            >
              {{ getSectorDescription(sec) }}
            </p>

            <!-- Formations badges -->
            <div v-if="getFormationsBySector(sec.id).length > 0">
              <h4
                class="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-600"
                :class="getColors(sec.color).textDark"
              >
                {{ t('organization.sectors.view_programs') }}
              </h4>
              <div class="flex flex-wrap gap-3">
                <NuxtLink
                  v-for="formation in getFormationsBySector(sec.id)"
                  :key="formation.id"
                  :to="localePath(`/formations/${formation.slug}`)"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5"
                  :class="[getColors(sec.color).badgeBg, getColors(sec.color).badgeText]"
                >
                  <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5" />
                  {{ getFormationName(formation) }}
                </NuxtLink>
              </div>
            </div>
            <p
              v-else
              class="text-sm italic text-gray-500"
              :class="getColors(sec.color).textDark"
            >
              {{ t('organization.sectors.no_programs') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Wave separator (sauf dernier) -->
      <!-- Fond = couleur section suivante, SVG = couleur section courante -->
      <div
        v-if="index < sectors.length - 1"
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
</template>
