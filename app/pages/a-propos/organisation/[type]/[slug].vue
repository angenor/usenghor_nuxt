<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getDepartmentBySlug, services, getStaffByDepartment, getStaffByService } = useMockData()

// Get route params directly (not computed for SSG compatibility)
const entityType = route.params.type as string
const entitySlug = route.params.slug as string

// Validate type
const validTypes = ['departement', 'service']
const isValidType = validTypes.includes(entityType)

// Get entity data
const getEntity = () => {
  if (entityType === 'departement') {
    return getDepartmentBySlug(entitySlug)
  } else if (entityType === 'service') {
    return services.value.find(s => s.slug === entitySlug)
  }
  return null
}

const entity = getEntity()

// Redirect to 404 if invalid
if (!isValidType || !entity) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found'
  })
}

// Get localized name
const entityName = computed(() => {
  if (!entity) return ''
  if (locale.value === 'ar') return entity.name_ar
  if (locale.value === 'en') return entity.name_en
  return entity.name_fr
})

// Get localized description
const entityDescription = computed(() => {
  if (!entity) return ''
  const desc = entity as any
  if (locale.value === 'ar' && desc.description_ar) return desc.description_ar
  if (locale.value === 'en' && desc.description_en) return desc.description_en
  return desc.description_fr || ''
})

// Get team members
const teamMembers = computed(() => {
  if (!entity) return []
  if (entityType === 'departement') {
    return getStaffByDepartment(entity.id)
  } else {
    return getStaffByService(entity.id)
  }
})

// Get color based on entity type and category
const entityColor = computed(() => {
  if (!entity) return 'amber'
  if (entityType === 'departement') {
    return 'purple'
  }
  // For services, color based on category
  const service = entity as any
  if (service.category === 'rectorat') return 'amber'
  if (service.category === 'academique') return 'blue'
  if (service.category === 'administratif') return 'emerald'
  return 'gray'
})

// Color palette
const colorPalette: Record<string, { bg: string; bgLight: string; text: string; border: string; gradient: string; hoverBg: string }> = {
  amber: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500',
    gradient: 'from-amber-500 to-amber-600',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
  },
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
  },
  gray: {
    bg: 'bg-gray-500',
    bgLight: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-500',
    gradient: 'from-gray-500 to-gray-600',
    hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
  }
}

// Color classes (always returns a valid value)
const colorClasses = computed(() => colorPalette[entityColor.value] ?? colorPalette.gray)

// SEO
useSeoMeta({
  title: () => entityType === 'departement'
    ? t('organizationDetail.seo.titleDepartment', { name: entityName.value })
    : t('organizationDetail.seo.titleService', { name: entityName.value }),
  description: () => t('organizationDetail.seo.description', {
    type: t(`organizationDetail.types.${entityType === 'departement' ? 'department' : 'service'}`),
    name: entityName.value
  })
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('about.tabs.organization'), to: '/a-propos/organisation' },
  { label: entityName.value }
])

// Active tab
const activeTab = ref('missions')
const tabs = [
  { key: 'missions', icon: 'fa-solid fa-bullseye' },
  { key: 'team', icon: 'fa-solid fa-users' },
  { key: 'achievements', icon: 'fa-solid fa-trophy' },
  { key: 'projects', icon: 'fa-solid fa-diagram-project' },
  { key: 'news', icon: 'fa-solid fa-newspaper' },
  { key: 'media', icon: 'fa-solid fa-photo-film' }
]

// Icon map
const iconMap: Record<string, string> = {
  'building-columns': 'fa-solid fa-building-columns',
  megaphone: 'fa-solid fa-bullhorn',
  map: 'fa-solid fa-map',
  rocket: 'fa-solid fa-rocket',
  globe: 'fa-solid fa-globe',
  users: 'fa-solid fa-users',
  lightbulb: 'fa-solid fa-lightbulb',
  'book-open': 'fa-solid fa-book-open',
  'clipboard-list': 'fa-solid fa-clipboard-list',
  server: 'fa-solid fa-server',
  video: 'fa-solid fa-video',
  calculator: 'fa-solid fa-calculator',
  'users-cog': 'fa-solid fa-users-gear',
  'check-circle': 'fa-solid fa-circle-check',
  plane: 'fa-solid fa-plane',
  home: 'fa-solid fa-house',
  palette: 'fa-solid fa-palette',
  leaf: 'fa-solid fa-leaf',
  briefcase: 'fa-solid fa-briefcase',
  'heart-pulse': 'fa-solid fa-heart-pulse',
  'graduation-cap': 'fa-solid fa-graduation-cap'
}

const entityIcon = computed(() => {
  if (!entity) return 'fa-solid fa-building'
  return iconMap[entity.icon] || 'fa-solid fa-building'
})

// Get staff name
const getStaffName = (staff: any) => {
  if (locale.value === 'ar' && staff.name_ar) return staff.name_ar
  return `${staff.first_name} ${staff.last_name}`
}

const getStaffTitle = (staff: any) => {
  if (locale.value === 'ar' && staff.title_ar) return staff.title_ar
  if (locale.value === 'en' && staff.title_en) return staff.title_en
  return staff.title_fr
}

// Mock data for simulation
const mockObjectives = computed(() => [
  {
    icon: 'fa-solid fa-graduation-cap',
    title: locale.value === 'fr' ? 'Excellence académique' : locale.value === 'ar' ? 'التميز الأكاديمي' : 'Academic excellence',
    description: locale.value === 'fr'
      ? 'Former des cadres de haut niveau pour le développement de l\'Afrique francophone'
      : locale.value === 'ar'
        ? 'تدريب كوادر عالية المستوى لتنمية أفريقيا الناطقة بالفرنسية'
        : 'Train high-level executives for francophone Africa development'
  },
  {
    icon: 'fa-solid fa-handshake',
    title: locale.value === 'fr' ? 'Partenariats stratégiques' : locale.value === 'ar' ? 'الشراكات الاستراتيجية' : 'Strategic partnerships',
    description: locale.value === 'fr'
      ? 'Développer des collaborations avec les institutions internationales'
      : locale.value === 'ar'
        ? 'تطوير التعاون مع المؤسسات الدولية'
        : 'Develop collaborations with international institutions'
  },
  {
    icon: 'fa-solid fa-lightbulb',
    title: locale.value === 'fr' ? 'Innovation pédagogique' : locale.value === 'ar' ? 'الابتكار التربوي' : 'Educational innovation',
    description: locale.value === 'fr'
      ? 'Moderniser les méthodes d\'enseignement et intégrer le numérique'
      : locale.value === 'ar'
        ? 'تحديث طرق التدريس ودمج التقنيات الرقمية'
        : 'Modernize teaching methods and integrate digital technologies'
  },
  {
    icon: 'fa-solid fa-globe-africa',
    title: locale.value === 'fr' ? 'Rayonnement africain' : locale.value === 'ar' ? 'الإشعاع الأفريقي' : 'African influence',
    description: locale.value === 'fr'
      ? 'Contribuer au développement durable du continent africain'
      : locale.value === 'ar'
        ? 'المساهمة في التنمية المستدامة للقارة الأفريقية'
        : 'Contribute to sustainable development of the African continent'
  }
])

const mockAchievements = computed(() => [
  {
    year: '2024',
    title: locale.value === 'fr' ? 'Certification internationale' : locale.value === 'ar' ? 'شهادة دولية' : 'International certification',
    description: locale.value === 'fr'
      ? 'Obtention de la certification qualité pour nos programmes de formation'
      : locale.value === 'ar'
        ? 'الحصول على شهادة الجودة لبرامجنا التدريبية'
        : 'Quality certification obtained for our training programs'
  },
  {
    year: '2023',
    title: locale.value === 'fr' ? 'Nouveau partenariat' : locale.value === 'ar' ? 'شراكة جديدة' : 'New partnership',
    description: locale.value === 'fr'
      ? 'Signature d\'un accord de coopération avec 5 universités africaines'
      : locale.value === 'ar'
        ? 'توقيع اتفاقية تعاون مع 5 جامعات أفريقية'
        : 'Cooperation agreement signed with 5 African universities'
  },
  {
    year: '2022',
    title: locale.value === 'fr' ? 'Digitalisation' : locale.value === 'ar' ? 'الرقمنة' : 'Digitalization',
    description: locale.value === 'fr'
      ? 'Mise en place de la plateforme d\'enseignement à distance'
      : locale.value === 'ar'
        ? 'إنشاء منصة التعليم عن بُعد'
        : 'Implementation of the distance learning platform'
  }
])

const mockProjects = computed(() => [
  {
    title: locale.value === 'fr' ? 'Campus numérique' : locale.value === 'ar' ? 'الحرم الجامعي الرقمي' : 'Digital campus',
    status: 'ongoing',
    progress: 75,
    description: locale.value === 'fr'
      ? 'Modernisation des infrastructures numériques du campus'
      : locale.value === 'ar'
        ? 'تحديث البنية التحتية الرقمية للحرم الجامعي'
        : 'Modernization of campus digital infrastructure',
    image: '/images/bg/backgroud_senghor2.jpg'
  },
  {
    title: locale.value === 'fr' ? 'Programme d\'échange' : locale.value === 'ar' ? 'برنامج التبادل' : 'Exchange program',
    status: 'planned',
    progress: 25,
    description: locale.value === 'fr'
      ? 'Développement des échanges étudiants avec l\'Europe et l\'Asie'
      : locale.value === 'ar'
        ? 'تطوير التبادل الطلابي مع أوروبا وآسيا'
        : 'Development of student exchanges with Europe and Asia',
    image: '/images/bg/backgroud_senghor1.jpg'
  },
  {
    title: locale.value === 'fr' ? 'Recherche appliquée' : locale.value === 'ar' ? 'البحث التطبيقي' : 'Applied research',
    status: 'completed',
    progress: 100,
    description: locale.value === 'fr'
      ? 'Projets de recherche sur le développement durable en Afrique'
      : locale.value === 'ar'
        ? 'مشاريع بحثية حول التنمية المستدامة في أفريقيا'
        : 'Research projects on sustainable development in Africa',
    image: '/images/bg/bg_mission_section.jpeg'
  }
])

const mockNews = computed(() => [
  {
    title: locale.value === 'fr' ? 'Rentrée académique 2024-2025' : locale.value === 'ar' ? 'الدخول الجامعي 2024-2025' : 'Academic year 2024-2025',
    date: '2024-09-15',
    excerpt: locale.value === 'fr'
      ? 'L\'Université Senghor accueille sa nouvelle promotion d\'étudiants venus de 25 pays africains.'
      : locale.value === 'ar'
        ? 'ترحب جامعة سنغور بدفعتها الجديدة من الطلاب القادمين من 25 دولة أفريقية.'
        : 'Senghor University welcomes its new class of students from 25 African countries.',
    image: '/images/bg/backgroud_senghor3.jpg'
  },
  {
    title: locale.value === 'fr' ? 'Conférence internationale' : locale.value === 'ar' ? 'مؤتمر دولي' : 'International conference',
    date: '2024-06-20',
    excerpt: locale.value === 'fr'
      ? 'Organisation d\'un colloque sur les enjeux du développement durable en Méditerranée.'
      : locale.value === 'ar'
        ? 'تنظيم ندوة حول تحديات التنمية المستدامة في البحر الأبيض المتوسط.'
        : 'Organization of a symposium on sustainable development challenges in the Mediterranean.',
    image: '/images/bg/bg_stats_section.jpeg'
  }
])

const mockMedia = {
  photos: [
    { src: '/images/bg/backgroud_senghor1.jpg', alt: 'Campus Senghor' },
    { src: '/images/bg/backgroud_senghor2.jpg', alt: 'Événement universitaire' },
    { src: '/images/bg/backgroud_senghor3.jpg', alt: 'Étudiants' },
    { src: '/images/bg/bg_mission_section.jpeg', alt: 'Bibliothèque' },
    { src: '/images/bg/bg_stats_section.jpeg', alt: 'Conférence' },
    { src: '/images/bg/backgroud_senghor1.jpg', alt: 'Remise de diplômes' }
  ]
}

const activeMediaTab = ref('photos')

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div v-if="entity">
    <!-- Hero Section with Image -->
    <PageHero
      :title="entityName"
      :subtitle="entityDescription"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    >
      <template #badge>
        <span
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white"
        >
          <font-awesome-icon :icon="entityIcon" class="w-4 h-4" />
          {{ t(`organizationDetail.breadcrumb.${entityType === 'departement' ? 'department' : 'service'}`) }}
        </span>
      </template>
    </PageHero>

    <!-- Tabs Navigation (similar to TabsNav.vue) -->
    <div class="sticky top-20 z-40">
      <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-center overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="group flex items-center gap-2 px-3 sm:px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200"
              :class="activeTab === tab.key
                ? `${colorClasses.border} ${colorClasses.text}`
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'"
              @click="activeTab = tab.key"
            >
              <font-awesome-icon
                :icon="tab.icon"
                class="w-4 h-4 transition-colors duration-200"
                :class="activeTab === tab.key ? colorClasses.text : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'"
              />
              <span class="hidden sm:inline">{{ t(`organizationDetail.tabs.${tab.key}`) }}</span>
            </button>
          </div>
        </div>
      </nav>
    </div>

    <!-- Tab Content -->
    <section class="py-12 lg:py-16 bg-gray-50 dark:bg-gray-800 min-h-[60vh]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Missions Tab -->
        <div v-if="activeTab === 'missions'" class="animate__animated animate__fadeIn">
          <div class="mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('organizationDetail.missions.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.missions.subtitle') }}</p>
          </div>

          <!-- Description Card -->
          <div v-if="entityDescription" class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm mb-8">
            <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ entityDescription }}
            </p>
          </div>

          <!-- Objectives Grid -->
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {{ t('organizationDetail.missions.objectives') }}
          </h3>
          <div class="grid sm:grid-cols-2 gap-6">
            <div
              v-for="(objective, index) in mockObjectives"
              :key="index"
              class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  :class="colorClasses.bgLight"
                >
                  <font-awesome-icon :icon="objective.icon" class="w-5 h-5" :class="colorClasses.text" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ objective.title }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ objective.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Tab -->
        <div v-if="activeTab === 'team'" class="animate__animated animate__fadeIn">
          <div class="mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('organizationDetail.team.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('organizationDetail.team.subtitle', { type: t(`organizationDetail.types.${entityType === 'departement' ? 'department' : 'service'}`) }) }}
            </p>
          </div>

          <div v-if="teamMembers.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="member in teamMembers"
              :key="member.id"
              class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div class="relative h-48 overflow-hidden">
                <img
                  :src="member.photo_url || `https://i.pravatar.cc/400?u=${member.id}`"
                  :alt="getStaffName(member)"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-4 left-4 right-4">
                  <h3 class="font-bold text-white text-lg">{{ getStaffName(member) }}</h3>
                  <p class="text-sm text-white/80">{{ getStaffTitle(member) }}</p>
                </div>
              </div>
              <div class="p-4">
                <a
                  v-if="member.email"
                  :href="`mailto:${member.email}`"
                  class="flex items-center gap-2 text-sm transition-colors"
                  :class="`${colorClasses.text} ${colorClasses.hoverBg} px-3 py-2 rounded-lg`"
                >
                  <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4" />
                  {{ t('organizationDetail.team.contact') }}
                </a>
              </div>
            </div>
          </div>

          <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
            <font-awesome-icon icon="fa-solid fa-users" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <p class="text-gray-500 dark:text-gray-400 text-lg">{{ t('organizationDetail.team.empty') }}</p>
          </div>
        </div>

        <!-- Achievements Tab -->
        <div v-if="activeTab === 'achievements'" class="animate__animated animate__fadeIn">
          <div class="mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('organizationDetail.achievements.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.achievements.subtitle') }}</p>
          </div>

          <!-- Timeline -->
          <div class="relative">
            <div class="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transform lg:-translate-x-1/2"></div>

            <div class="space-y-8">
              <div
                v-for="(achievement, index) in mockAchievements"
                :key="index"
                class="relative"
                :class="index % 2 === 0 ? 'lg:pr-1/2' : 'lg:pl-1/2 lg:ml-auto'"
              >
                <!-- Timeline dot -->
                <div
                  class="absolute left-4 lg:left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 z-10"
                  :class="colorClasses.bg"
                ></div>

                <!-- Card -->
                <div
                  class="ml-12 lg:ml-0 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  :class="index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'"
                >
                  <span
                    class="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3"
                    :class="`${colorClasses.bgLight} ${colorClasses.text}`"
                  >
                    {{ achievement.year }}
                  </span>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ achievement.title }}</h3>
                  <p class="text-gray-600 dark:text-gray-400">{{ achievement.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects Tab -->
        <div v-if="activeTab === 'projects'" class="animate__animated animate__fadeIn">
          <div class="mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('organizationDetail.projects.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.projects.subtitle') }}</p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(project, index) in mockProjects"
              :key="index"
              class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div class="relative h-40 overflow-hidden">
                <img
                  :src="project.image"
                  :alt="project.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div class="absolute top-4 right-4">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': project.status === 'completed',
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': project.status === 'ongoing',
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': project.status === 'planned'
                    }"
                  >
                    {{ t(`organizationDetail.projects.status.${project.status}`) }}
                  </span>
                </div>
              </div>
              <div class="p-6">
                <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ project.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ project.description }}</p>

                <!-- Progress bar -->
                <div class="mb-2">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-500 dark:text-gray-400">Progression</span>
                    <span :class="colorClasses.text">{{ project.progress }}%</span>
                  </div>
                  <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="colorClasses.bg"
                      :style="{ width: `${project.progress}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- News Tab -->
        <div v-if="activeTab === 'news'" class="animate__animated animate__fadeIn">
          <div class="mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('organizationDetail.news.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.news.subtitle') }}</p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <article
              v-for="(news, index) in mockNews"
              :key="index"
              class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div class="relative h-48 overflow-hidden">
                <img
                  :src="news.image"
                  :alt="news.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div class="p-6">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4 mr-2" />
                  {{ formatDate(news.date) }}
                </p>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {{ news.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">{{ news.excerpt }}</p>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 font-medium transition-colors"
                  :class="colorClasses.text"
                >
                  {{ t('organizationDetail.news.readMore') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
                </button>
              </div>
            </article>
          </div>
        </div>

        <!-- Media Tab -->
        <div v-if="activeTab === 'media'" class="animate__animated animate__fadeIn">
          <div class="mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ t('organizationDetail.media.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.media.subtitle') }}</p>
          </div>

          <!-- Media sub-tabs -->
          <div class="flex gap-2 mb-8">
            <button
              v-for="category in ['photos', 'videos', 'documents']"
              :key="category"
              type="button"
              class="px-4 py-2 rounded-lg font-medium transition-all duration-200"
              :class="activeMediaTab === category
                ? `${colorClasses.bgLight} ${colorClasses.text}`
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
              @click="activeMediaTab = category"
            >
              <font-awesome-icon
                :icon="category === 'photos' ? 'fa-solid fa-images' : category === 'videos' ? 'fa-solid fa-video' : 'fa-solid fa-file-alt'"
                class="w-4 h-4 mr-2"
              />
              {{ t(`organizationDetail.media.categories.${category}`) }}
            </button>
          </div>

          <!-- Photos Gallery -->
          <div v-if="activeMediaTab === 'photos'" class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              v-for="(photo, index) in mockMedia.photos"
              :key="index"
              class="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
            >
              <img
                :src="photo.src"
                :alt="photo.alt"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <font-awesome-icon
                  icon="fa-solid fa-expand"
                  class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>

          <!-- Videos / Documents placeholder -->
          <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
            <font-awesome-icon
              :icon="activeMediaTab === 'videos' ? 'fa-solid fa-video' : 'fa-solid fa-file-alt'"
              class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600"
            />
            <p class="text-gray-500 dark:text-gray-400 text-lg">
              {{ t('organizationDetail.media.empty') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Back CTA -->
    <section class="py-12 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <NuxtLink
          :to="localePath('/a-propos/organisation')"
          class="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          :class="`border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500`"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5" />
          {{ t('organizationDetail.cta.backToOrg') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
