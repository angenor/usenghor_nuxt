<script setup lang="ts">
import World from '@svg-maps/world'

const { t, locale } = useI18n()

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: mapRef } = useScrollAnimation({ animation: 'fadeInLeft', threshold: 0.1 })
const { elementRef: campusButtonsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.2 })

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

interface Campus {
  id: string
  name: string
  nameAr: string
  country: string
  countryName: string
  countryNameEn: string
  countryNameAr: string
  type: 'headquarters' | 'campus'
  description: string
  descriptionEn: string
  descriptionAr: string
  programs: string[]
  programsEn: string[]
  programsAr: string[]
  students: number
  url: string
  image: string
}

const campuses = ref<Campus[]>([
  {
    id: 'headquarters',
    name: 'Alexandrie',
    nameAr: 'الإسكندرية',
    country: 'eg',
    countryName: 'Égypte',
    countryNameEn: 'Egypt',
    countryNameAr: 'مصر',
    type: 'headquarters',
    description: "Siège principal de l'Université Senghor, situé dans la ville historique d'Alexandrie. Le campus offre un environnement académique d'excellence au cœur de la Méditerranée.",
    descriptionEn: 'Main headquarters of Senghor University, located in the historic city of Alexandria. The campus offers an academic environment of excellence in the heart of the Mediterranean.',
    descriptionAr: 'المقر الرئيسي لجامعة سنغور، يقع في مدينة الإسكندرية التاريخية. يوفر الحرم الجامعي بيئة أكاديمية متميزة في قلب البحر الأبيض المتوسط.',
    programs: ['Masters', 'Doctorat', 'Diplômes universitaires'],
    programsEn: ['Masters', 'Doctorate', 'University Diplomas'],
    programsAr: ['الماجستير', 'الدكتوراه', 'الدبلومات الجامعية'],
    students: 500,
    url: 'https://www.usenghor.org',
    image: '/images/bg/backgroud_senghor1.jpg'
  },
  {
    id: 'benin',
    name: 'Campus Bénin',
    nameAr: 'حرم بنين',
    country: 'bj',
    countryName: 'Bénin',
    countryNameEn: 'Benin',
    countryNameAr: 'بنين',
    type: 'campus',
    description: 'Campus externalisé du Bénin offrant des formations continues et certifications adaptées aux besoins locaux.',
    descriptionEn: 'External campus in Benin offering continuing education and certifications adapted to local needs.',
    descriptionAr: 'حرم جامعي خارجي في بنين يقدم تكوينات مستمرة وشهادات مهنية تتناسب مع الاحتياجات المحلية.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 150,
    url: 'https://sites.google.com/usenghor.org/campus-benin',
    image: '/images/bg/backgroud_senghor2.jpg'
  },
  {
    id: 'burkina',
    name: 'Campus Burkina Faso',
    nameAr: 'حرم بوركينا فاسو',
    country: 'bf',
    countryName: 'Burkina Faso',
    countryNameEn: 'Burkina Faso',
    countryNameAr: 'بوركينا فاسو',
    type: 'campus',
    description: "Campus externalisé du Burkina Faso, un hub de formation pour l'Afrique de l'Ouest.",
    descriptionEn: 'External campus in Burkina Faso, a training hub for West Africa.',
    descriptionAr: 'حرم جامعي خارجي في بوركينا فاسو، مركز تكوين لغرب أفريقيا.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 120,
    url: 'https://sites.google.com/usenghor.org/campus-burkinafaso',
    image: '/images/bg/backgroud_senghor3.jpg'
  },
  {
    id: 'cameroon',
    name: 'Campus Cameroun',
    nameAr: 'حرم الكاميرون',
    country: 'cm',
    countryName: 'Cameroun',
    countryNameEn: 'Cameroon',
    countryNameAr: 'الكاميرون',
    type: 'campus',
    description: 'Campus externalisé du Cameroun, contribuant au développement des compétences en Afrique centrale.',
    descriptionEn: 'External campus in Cameroon, contributing to skills development in Central Africa.',
    descriptionAr: 'حرم جامعي خارجي في الكاميرون، يساهم في تطوير الكفاءات في وسط أفريقيا.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 180,
    url: 'http://campus-cameroun.usenghor.org/',
    image: '/images/bg/backgroud_senghor4.jpg'
  },
  {
    id: 'ivorycoast',
    name: "Campus Côte d'Ivoire",
    nameAr: 'حرم ساحل العاج',
    country: 'ci',
    countryName: "Côte d'Ivoire",
    countryNameEn: 'Ivory Coast',
    countryNameAr: 'ساحل العاج',
    type: 'campus',
    description: "Campus externalisé de Côte d'Ivoire, au cœur de la capitale économique ouest-africaine.",
    descriptionEn: 'External campus in Ivory Coast, at the heart of the West African economic capital.',
    descriptionAr: 'حرم جامعي خارجي في ساحل العاج، في قلب العاصمة الاقتصادية لغرب أفريقيا.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 160,
    url: 'http://campus-cotedivoire.usenghor.org/',
    image: '/images/bg/covers_image.jpg'
  },
  {
    id: 'djibouti',
    name: 'Campus Djibouti',
    nameAr: 'حرم جيبوتي',
    country: 'dj',
    countryName: 'Djibouti',
    countryNameEn: 'Djibouti',
    countryNameAr: 'جيبوتي',
    type: 'campus',
    description: "Campus externalisé de Djibouti, porte d'entrée vers la Corne de l'Afrique.",
    descriptionEn: 'External campus in Djibouti, gateway to the Horn of Africa.',
    descriptionAr: 'حرم جامعي خارجي في جيبوتي، بوابة القرن الأفريقي.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 80,
    url: 'https://sites.google.com/usenghor.org/campus-djibouti/',
    image: '/images/bg/covers_image.jpg'
  },
  {
    id: 'gabon',
    name: 'Campus Gabon',
    nameAr: 'حرم الغابون',
    country: 'ga',
    countryName: 'Gabon',
    countryNameEn: 'Gabon',
    countryNameAr: 'الغابون',
    type: 'campus',
    description: "Campus externalisé du Gabon, au service du développement de l'Afrique centrale.",
    descriptionEn: 'External campus in Gabon, serving the development of Central Africa.',
    descriptionAr: 'حرم جامعي خارجي في الغابون، في خدمة تنمية وسط أفريقيا.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 100,
    url: 'https://sites.google.com/usenghor.org/campus-gabon/',
    image: '/images/bg/backgroud_senghor1.jpg'
  },
  {
    id: 'guinea',
    name: 'Campus Guinée',
    nameAr: 'حرم غينيا',
    country: 'gn',
    countryName: 'Guinée',
    countryNameEn: 'Guinea',
    countryNameAr: 'غينيا',
    type: 'campus',
    description: "Campus externalisé de Guinée, formant les cadres de demain en Afrique de l'Ouest.",
    descriptionEn: "External campus in Guinea, training tomorrow's executives in West Africa.",
    descriptionAr: 'حرم جامعي خارجي في غينيا، يكوّن كوادر المستقبل في غرب أفريقيا.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 90,
    url: 'https://sites.google.com/usenghor.org/campus-guinee',
    image: '/images/bg/backgroud_senghor2.jpg'
  },
  {
    id: 'hungary',
    name: 'Campus Hongrie',
    nameAr: 'حرم المجر',
    country: 'hu',
    countryName: 'Hongrie',
    countryNameEn: 'Hungary',
    countryNameAr: 'المجر',
    type: 'campus',
    description: 'Campus externalisé de Hongrie, notre présence européenne au cœur de Budapest.',
    descriptionEn: 'External campus in Hungary, our European presence in the heart of Budapest.',
    descriptionAr: 'حرم جامعي خارجي في المجر، حضورنا الأوروبي في قلب بودابست.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 50,
    url: 'http://campus-hongrie.usenghor.org/',
    image: '/images/bg/backgroud_senghor3.jpg'
  },
  {
    id: 'madagascar',
    name: 'Campus Madagascar',
    nameAr: 'حرم مدغشقر',
    country: 'mg',
    countryName: 'Madagascar',
    countryNameEn: 'Madagascar',
    countryNameAr: 'مدغشقر',
    type: 'campus',
    description: 'Campus externalisé de Madagascar, au service de la Grande Île.',
    descriptionEn: 'External campus in Madagascar, serving the Great Island.',
    descriptionAr: 'حرم جامعي خارجي في مدغشقر، في خدمة الجزيرة الكبرى.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 110,
    url: 'http://campus-madagascar.usenghor.org/',
    image: '/images/bg/backgroud_senghor4.jpg'
  },
  {
    id: 'morocco',
    name: 'Campus Maroc',
    nameAr: 'حرم المغرب',
    country: 'ma',
    countryName: 'Maroc',
    countryNameEn: 'Morocco',
    countryNameAr: 'المغرب',
    type: 'campus',
    description: "Campus externalisé du Maroc, pont entre l'Afrique et l'Europe.",
    descriptionEn: 'External campus in Morocco, bridge between Africa and Europe.',
    descriptionAr: 'حرم جامعي خارجي في المغرب، جسر بين أفريقيا وأوروبا.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 140,
    url: 'http://campus-maroc.usenghor.org/',
    image: '/images/bg/covers_image.jpg'
  },
  {
    id: 'drc',
    name: 'Campus RDC',
    nameAr: 'حرم الكونغو الديمقراطية',
    country: 'cd',
    countryName: 'République démocratique du Congo',
    countryNameEn: 'Democratic Republic of the Congo',
    countryNameAr: 'جمهورية الكونغو الديمقراطية',
    type: 'campus',
    description: 'Campus externalisé de la RDC, contribuant au développement du plus grand pays francophone.',
    descriptionEn: 'External campus in the DRC, contributing to the development of the largest French-speaking country.',
    descriptionAr: 'حرم جامعي خارجي في الكونغو الديمقراطية، يساهم في تنمية أكبر دولة فرنكوفونية.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 130,
    url: 'http://campus-rdc.usenghor.org/',
    image: '/images/bg/backgroud_senghor4.jpg'
  },
  {
    id: 'senegal',
    name: 'Campus Sénégal',
    nameAr: 'حرم السنغال',
    country: 'sn',
    countryName: 'Sénégal',
    countryNameEn: 'Senegal',
    countryNameAr: 'السنغال',
    type: 'campus',
    description: 'Campus externalisé du Sénégal à Dakar, berceau de la Francophonie africaine.',
    descriptionEn: 'External campus in Senegal in Dakar, cradle of African Francophonie.',
    descriptionAr: 'حرم جامعي خارجي في السنغال بداكار، مهد الفرنكوفونية الأفريقية.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 200,
    url: 'http://campus-senegal.usenghor.org/',
    image: '/images/bg/backgroud_senghor1.jpg'
  },
  {
    id: 'togo',
    name: 'Campus Togo',
    nameAr: 'حرم توغو',
    country: 'tg',
    countryName: 'Togo',
    countryNameEn: 'Togo',
    countryNameAr: 'توغو',
    type: 'campus',
    description: 'Campus externalisé du Togo, formant les leaders de demain.',
    descriptionEn: "External campus in Togo, training tomorrow's leaders.",
    descriptionAr: 'حرم جامعي خارجي في توغو، يكوّن قادة المستقبل.',
    programs: ['Formation continue', 'Certifications'],
    programsEn: ['Continuing education', 'Certifications'],
    programsAr: ['التكوين المستمر', 'الشهادات المهنية'],
    students: 85,
    url: 'http://campus-togo.usenghor.org/',
    image: '/images/bg/backgroud_senghor2.jpg'
  }
])

// Selected campus state - Alexandria by default
const selectedCampus = ref<Campus>(campuses.value[0])

// Countries colored by type
const coloredCountries: Record<string, { color: string; type: string }> = {
  eg: { color: '#f59e0b', type: 'headquarters' },
  bj: { color: '#3b82f6', type: 'campus' },
  bf: { color: '#3b82f6', type: 'campus' },
  cm: { color: '#3b82f6', type: 'campus' },
  ci: { color: '#3b82f6', type: 'campus' },
  dj: { color: '#3b82f6', type: 'campus' },
  ga: { color: '#3b82f6', type: 'campus' },
  gn: { color: '#3b82f6', type: 'campus' },
  hu: { color: '#3b82f6', type: 'campus' },
  mg: { color: '#3b82f6', type: 'campus' },
  ma: { color: '#3b82f6', type: 'campus' },
  cd: { color: '#3b82f6', type: 'campus' },
  sn: { color: '#3b82f6', type: 'campus' },
  tg: { color: '#3b82f6', type: 'campus' }
}

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
  const isSelected = selectedCampus.value?.country === id
  const countryData = coloredCountries[id]

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
const getCampusForCountry = (countryId: string): Campus | undefined => {
  return campuses.value.find((c: Campus) => c.country === countryId)
}

// Computed property for hovered campus (avoids non-null assertion in template)
const hoveredCampus = computed(() => {
  if (!hovered.value) return null
  return getCampusForCountry(hovered.value.id)
})

// Get localized content helper
const getLocalizedField = <T extends keyof Campus>(campus: Campus, field: string): Campus[T] => {
  if (locale.value === 'ar') {
    return (campus as any)[`${field}Ar`] || (campus as any)[`${field}En`] || (campus as any)[field]
  }
  if (locale.value === 'en') {
    return (campus as any)[`${field}En`] || (campus as any)[field]
  }
  return (campus as any)[field]
}

// Handle country click
const handleCountryClick = (location: { id: string }) => {
  const campus = getCampusForCountry(location.id)
  if (campus) {
    selectedCampus.value = campus
  }
}

// Handle tooltip click
const handleTooltipClick = () => {
  if (hovered.value) {
    const campus = getCampusForCountry(hovered.value.id)
    if (campus) {
      selectedCampus.value = campus
    }
  }
}

// Fallback image handler
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop'
}
</script>

<template>
  <section class="relative py-16 lg:py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-visible">
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
          {{ t('campus.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('campus.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('campus.subtitle') }}
        </p>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap justify-center gap-4 lg:gap-6 mb-8">
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full bg-amber-500"></span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('campus.legend.headquarters') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-4 h-4 rounded-full bg-blue-500"></span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('campus.legend.campus') }}</span>
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
        <div class="campus-card-wrapper lg:w-[380px] lg:flex-shrink-0 z-20 lg:mt-12">
          <Transition
            mode="out-in"
            enter-active-class="animate__animated animate__flipInY animate__faster"
            leave-active-class="animate__animated animate__flipOutY animate__faster"
          >
            <div class="campus-card" :key="selectedCampus.id">
              <!-- Image -->
              <div class="card-image">
                <img
                  :src="selectedCampus.image"
                  :alt="selectedCampus.name"
                  @error="handleImageError"
                />
                <!-- Badge -->
                <div
                  class="absolute top-4 ltr:left-4 rtl:right-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  :class="selectedCampus.type === 'headquarters' ? 'bg-amber-500' : 'bg-blue-500'"
                >
                  {{ selectedCampus.type === 'headquarters' ? t('campus.legend.headquarters') : t('campus.legend.campus') }}
                </div>
              </div>

              <!-- Content -->
              <div class="card-content">
                <h3 class="card-title">{{ getLocalizedField(selectedCampus, 'name') }}</h3>
                <p class="card-country">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                  {{ getLocalizedField(selectedCampus, 'countryName') }}
                </p>
                <div class="card-text">
                  <p>{{ getLocalizedField(selectedCampus, 'description') }}</p>
                </div>

                <!-- Programs -->
                <div class="card-programs">
                  <span
                    v-for="program in getLocalizedField(selectedCampus, 'programs')"
                    :key="program"
                    class="program-tag"
                  >
                    {{ program }}
                  </span>
                </div>

                <!-- Stats -->
                <div class="card-stats">
                  <div class="stat">
                    <font-awesome-icon icon="fa-solid fa-users" class="w-4 h-4 text-blue-500" />
                    <span class="stat-value">{{ selectedCampus.students }}</span>
                    <span class="stat-label">{{ t('campus.students') }}</span>
                  </div>
                </div>

                <!-- CTA -->
                <a
                  :href="selectedCampus.url"
                  target="_blank"
                  class="card-cta"
                >
                  {{ t('campus.modal.visitWebsite') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" />
                </a>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Campus Name Cards -->
      <div ref="campusButtonsRef" class="mt-12">
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="campus in campuses"
            :key="campus.id"
            class="campus-name-card"
            :class="{
              'campus-name-card--active': selectedCampus.id === campus.id,
              'campus-name-card--headquarters': campus.type === 'headquarters'
            }"
            @click="selectedCampus = campus"
          >
            {{ getLocalizedField(campus, 'name') }}
          </button>
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

.card-programs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1.4rem 0;
}

.program-tag {
  padding: 0.25rem 0.75rem;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

:root.dark .program-tag {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  margin: 0 0 1.4rem 0;
}

:root.dark .card-stats {
  background: rgba(55, 65, 81, 0.5);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

:root.dark .stat-value {
  color: #f9fafb;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

:root.dark .stat-label {
  color: #9ca3af;
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
