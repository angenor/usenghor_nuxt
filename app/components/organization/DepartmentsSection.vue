<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { departments, getFormationsByDepartment } = useMockData()
const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Map department icons to Font Awesome icons
const iconMap: Record<string, string> = {
  palette: 'fa-solid fa-palette',
  leaf: 'fa-solid fa-leaf',
  briefcase: 'fa-solid fa-briefcase',
  'heart-pulse': 'fa-solid fa-heart-pulse',
  'graduation-cap': 'fa-solid fa-graduation-cap'
}

// Color configuration per department
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
    bgLight: 'bg-amber-100',
    bgDark: 'dark:bg-amber-900',
    bgLightHex: '#fef3c7', // amber-100
    bgDarkHex: '#78350f', // amber-900
    textDark: 'dark:text-amber-100',
    iconBg: 'bg-amber-500',
    badgeBg: 'bg-white/60 dark:bg-amber-800/60',
    badgeText: 'text-amber-700 dark:text-amber-200'
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
  const dept = departments.value[index]
  const config = getColors(dept.color)
  return isDark ? config.bgDarkHex : config.bgLightHex
}

// Couleur de fond de la section suivante (pour le fond du séparateur)
const getNextBgColor = (index: number, isDark: boolean) => {
  if (index >= departments.value.length - 1) return isDark ? '#111827' : '#f3f4f6'
  const nextDept = departments.value[index + 1]
  const config = getColors(nextDept.color)
  return isDark ? config.bgDarkHex : config.bgLightHex
}

// Get department name based on locale
const getDeptName = (dept: any) => {
  if (locale.value === 'ar') return dept.name_ar
  if (locale.value === 'en') return dept.name_en
  return dept.name_fr
}

// Get department description based on locale
const getDeptDescription = (dept: any) => {
  if (locale.value === 'ar') return dept.description_ar || dept.description_fr
  if (locale.value === 'en') return dept.description_en || dept.description_fr
  return dept.description_fr
}

// Get formation name based on locale
const getFormationName = (formation: any) => {
  if (locale.value === 'ar') return formation.title_ar || formation.title_fr
  if (locale.value === 'en') return formation.title_en || formation.title_fr
  return formation.title_fr
}
</script>

<template>
  <section ref="sectionRef">
    <!-- Header -->
    <div class="py-16 lg:py-20 bg-white dark:bg-gray-900 text-center">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
          <span class="relative inline-block">
            {{ t('organization.departments.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {{ t('organization.departments.subtitle') }}
        </p>
      </div>
    </div>

    <!-- Départements avec bubble waves -->
    <div
      v-for="(dept, index) in departments"
      :key="dept.id"
      class="section-bubble transition-colors duration-300"
      :class="[getColors(dept.color).bgLight, getColors(dept.color).bgDark]"
    >
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <!-- Icône + Titre -->
        <div class="flex items-center gap-4 mb-6">
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            :class="getColors(dept.color).iconBg"
          >
            <font-awesome-icon
              :icon="getIcon(dept.icon)"
              class="w-7 h-7 text-white"
            />
          </div>
          <h3
            class="text-2xl lg:text-3xl font-bold text-gray-900"
            :class="getColors(dept.color).textDark"
          >
            {{ getDeptName(dept) }}
          </h3>
        </div>

        <!-- Description -->
        <p
          class="text-gray-700 leading-relaxed mb-8 max-w-3xl"
          :class="getColors(dept.color).textDark"
        >
          {{ getDeptDescription(dept) }}
        </p>

        <!-- Formations badges -->
        <div v-if="getFormationsByDepartment(dept.id).length > 0">
          <h4
            class="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-600"
            :class="getColors(dept.color).textDark"
          >
            {{ t('organization.departments.view_programs') }}
          </h4>
          <div class="flex flex-wrap gap-3">
            <NuxtLink
              v-for="formation in getFormationsByDepartment(dept.id)"
              :key="formation.id"
              :to="localePath(`/formations/${formation.slug}`)"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:scale-105"
              :class="[getColors(dept.color).badgeBg, getColors(dept.color).badgeText]"
            >
              <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5" />
              {{ getFormationName(formation) }}
            </NuxtLink>
          </div>
        </div>
        <p
          v-else
          class="text-sm italic text-gray-500"
          :class="getColors(dept.color).textDark"
        >
          {{ t('organization.departments.no_programs') }}
        </p>
      </div>

      <!-- Wave separator (sauf dernier) -->
      <!-- Fond = couleur section suivante, SVG = couleur section courante -->
      <div
        v-if="index < departments.length - 1"
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

    <!-- Transition vers section suivante -->
    <div class="h-16 bg-gray-100 dark:bg-gray-900"></div>
  </section>
</template>
