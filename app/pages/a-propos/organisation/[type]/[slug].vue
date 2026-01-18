<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getDepartmentBySlug, services, getStaffByDepartment, getStaffByService } = useMockData()

// Scroll detection for sticky title
const heroRef = ref<HTMLElement | null>(null)
const showTitleInNav = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry) {
        // Show title in nav when hero is less than 20% visible
        showTitleInNav.value = entry.intersectionRatio < 0.2
      }
    },
    { threshold: [0, 0.2, 0.5, 1] }
  )

  if (heroRef.value) {
    observer.observe(heroRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

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
  if (!entity) return 'blue'
  if (entityType === 'departement') {
    return 'purple'
  }
  // For services, color based on category
  const service = entity as any
  if (service.category === 'rectorat') return 'blue'
  if (service.category === 'academique') return 'red'
  if (service.category === 'administratif') return 'blue'
  return 'gray'
})

// Color palette
const colorPalette: Record<string, { bg: string; bgLight: string; text: string; border: string; gradient: string; hoverBg: string }> = {
  blue: {
    bg: 'bg-brand-blue-500',
    bgLight: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    text: 'text-brand-blue-600 dark:text-brand-blue-400',
    border: 'border-brand-blue-500',
    gradient: 'from-brand-blue-500 to-brand-blue-600',
    hoverBg: 'hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/20'
  },
  red: {
    bg: 'bg-brand-red-500',
    bgLight: 'bg-brand-red-100 dark:bg-brand-red-900/30',
    text: 'text-brand-red-600 dark:text-brand-red-400',
    border: 'border-brand-red-500',
    gradient: 'from-brand-red-500 to-brand-red-600',
    hoverBg: 'hover:bg-brand-red-50 dark:hover:bg-brand-red-900/20'
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
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

// Navigate to next tab
const goToNextTab = () => {
  const currentIndex = tabs.findIndex(tab => tab.key === activeTab.value)
  const nextTabItem = tabs[currentIndex + 1]
  if (currentIndex < tabs.length - 1 && nextTabItem) {
    activeTab.value = nextTabItem.key
    // Scroll to top of tab content
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }
}

// Get next tab info
const nextTab = computed(() => {
  const currentIndex = tabs.findIndex(tab => tab.key === activeTab.value)
  if (currentIndex < tabs.length - 1) {
    return tabs[currentIndex + 1] ?? null
  }
  return null
})

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

const mockAchievements = computed(() => {
  const achievements = [
    {
      year: '2024',
      subtitle: locale.value === 'fr' ? 'Qualité' : locale.value === 'ar' ? 'الجودة' : 'Quality',
      title: locale.value === 'fr' ? 'Certification internationale' : locale.value === 'ar' ? 'شهادة دولية' : 'International certification',
      description: locale.value === 'fr'
        ? 'Obtention de la certification qualité pour nos programmes de formation. Cette reconnaissance internationale atteste de l\'excellence de notre approche pédagogique.'
        : locale.value === 'ar'
          ? 'الحصول على شهادة الجودة لبرامجنا التدريبية. هذا الاعتراف الدولي يشهد على تميز نهجنا التربوي.'
          : 'Quality certification obtained for our training programs. This international recognition attests to the excellence of our pedagogical approach.',
      image: '/images/bg/backgroud_senghor1.jpg'
    },
    {
      year: '2023',
      subtitle: locale.value === 'fr' ? 'Coopération' : locale.value === 'ar' ? 'التعاون' : 'Cooperation',
      title: locale.value === 'fr' ? 'Nouveau partenariat' : locale.value === 'ar' ? 'شراكة جديدة' : 'New partnership',
      description: locale.value === 'fr'
        ? 'Signature d\'un accord de coopération avec 5 universités africaines majeures, renforçant notre réseau d\'échanges académiques sur le continent.'
        : locale.value === 'ar'
          ? 'توقيع اتفاقية تعاون مع 5 جامعات أفريقية كبرى، مما يعزز شبكة التبادل الأكاديمي في القارة.'
          : 'Cooperation agreement signed with 5 major African universities, strengthening our academic exchange network across the continent.',
      image: '/images/bg/backgroud_senghor2.jpg'
    },
    {
      year: '2022',
      subtitle: locale.value === 'fr' ? 'Innovation' : locale.value === 'ar' ? 'الابتكار' : 'Innovation',
      title: locale.value === 'fr' ? 'Digitalisation complète' : locale.value === 'ar' ? 'الرقمنة الكاملة' : 'Full digitalization',
      description: locale.value === 'fr'
        ? 'Mise en place de la plateforme d\'enseignement à distance permettant à nos étudiants de suivre leurs cours depuis n\'importe où dans le monde.'
        : locale.value === 'ar'
          ? 'إنشاء منصة التعليم عن بُعد التي تتيح لطلابنا متابعة دروسهم من أي مكان في العالم.'
          : 'Implementation of the distance learning platform allowing our students to attend classes from anywhere in the world.',
      image: '/images/bg/backgroud_senghor3.jpg'
    },
    {
      year: '2021',
      subtitle: locale.value === 'fr' ? 'Recherche' : locale.value === 'ar' ? 'البحث' : 'Research',
      title: locale.value === 'fr' ? 'Centre de recherche' : locale.value === 'ar' ? 'مركز البحث' : 'Research center',
      description: locale.value === 'fr'
        ? 'Création du centre de recherche sur le développement durable en Afrique, avec 15 chercheurs permanents et 30 doctorants.'
        : locale.value === 'ar'
          ? 'إنشاء مركز البحث حول التنمية المستدامة في أفريقيا، مع 15 باحثًا دائمًا و30 طالب دكتوراه.'
          : 'Creation of the research center on sustainable development in Africa, with 15 permanent researchers and 30 doctoral students.',
      image: '/images/bg/bg_mission_section.jpeg'
    },
    {
      year: '2020',
      subtitle: locale.value === 'fr' ? 'Expansion' : locale.value === 'ar' ? 'التوسع' : 'Expansion',
      title: locale.value === 'fr' ? 'Nouveaux programmes' : locale.value === 'ar' ? 'برامج جديدة' : 'New programs',
      description: locale.value === 'fr'
        ? 'Lancement de 3 nouveaux masters professionnels en environnement, santé publique et gouvernance numérique pour répondre aux défis contemporains.'
        : locale.value === 'ar'
          ? 'إطلاق 3 ماسترات مهنية جديدة في البيئة والصحة العامة والحوكمة الرقمية لمواجهة التحديات المعاصرة.'
          : 'Launch of 3 new professional masters in environment, public health and digital governance to address contemporary challenges.',
      image: '/images/bg/bg_stats_section.jpeg'
    }
  ]
  // Tri chronologique (du plus récent au plus ancien)
  return achievements.sort((a, b) => parseInt(b.year) - parseInt(a.year))
})

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

const mockMedia = computed(() => ({
  photos: [
    { id: 'photo-1', title_fr: 'Campus Senghor', title_en: 'Senghor Campus', url: '/images/bg/backgroud_senghor1.jpg', thumbnail: '/images/bg/backgroud_senghor1.jpg' },
    { id: 'photo-2', title_fr: 'Événement universitaire', title_en: 'University Event', url: '/images/bg/backgroud_senghor2.jpg', thumbnail: '/images/bg/backgroud_senghor2.jpg' },
    { id: 'photo-3', title_fr: 'Étudiants', title_en: 'Students', url: '/images/bg/backgroud_senghor3.jpg', thumbnail: '/images/bg/backgroud_senghor3.jpg' },
    { id: 'photo-4', title_fr: 'Bibliothèque', title_en: 'Library', url: '/images/bg/bg_mission_section.jpeg', thumbnail: '/images/bg/bg_mission_section.jpeg' },
    { id: 'photo-5', title_fr: 'Conférence', title_en: 'Conference', url: '/images/bg/bg_stats_section.jpeg', thumbnail: '/images/bg/bg_stats_section.jpeg' },
    { id: 'photo-6', title_fr: 'Remise de diplômes', title_en: 'Graduation Ceremony', url: '/images/bg/backgroud_senghor1.jpg', thumbnail: '/images/bg/backgroud_senghor1.jpg' }
  ]
}))

const activeMediaTab = ref('photos')

// Album modal state
const albumModalOpen = ref(false)

const openPhotoAlbum = () => {
  albumModalOpen.value = true
}

// Timeline colors for achievements
type TimelineColor = {
  solid: string
  gradient: string
  bgLight: string
  text: string
  arrowLeft: string
  arrowRight: string
}

const defaultTimelineColor: TimelineColor = {
  solid: '#2b4bbf',
  gradient: 'from-brand-blue-500 to-brand-blue-600',
  bgLight: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
  text: 'text-brand-blue-600 dark:text-brand-blue-400',
  arrowLeft: 'border-l-brand-blue-500',
  arrowRight: 'border-r-brand-blue-500'
}

const timelineColors: TimelineColor[] = [
  defaultTimelineColor,
  {
    solid: '#f32525',
    gradient: 'from-brand-red-500 to-brand-red-600',
    bgLight: 'bg-brand-red-100 dark:bg-brand-red-900/30',
    text: 'text-brand-red-600 dark:text-brand-red-400',
    arrowLeft: 'border-l-brand-red-500',
    arrowRight: 'border-r-brand-red-500'
  },
  {
    solid: '#233da0',
    gradient: 'from-brand-blue-600 to-brand-blue-700',
    bgLight: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    text: 'text-brand-blue-600 dark:text-brand-blue-400',
    arrowLeft: 'border-l-brand-blue-600',
    arrowRight: 'border-r-brand-blue-600'
  },
  {
    solid: '#c21f1f',
    gradient: 'from-brand-red-600 to-brand-red-700',
    bgLight: 'bg-brand-red-100 dark:bg-brand-red-900/30',
    text: 'text-brand-red-600 dark:text-brand-red-400',
    arrowLeft: 'border-l-brand-red-600',
    arrowRight: 'border-r-brand-red-600'
  },
  {
    solid: '#2b4bbf',
    gradient: 'from-brand-blue-500 to-brand-blue-600',
    bgLight: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    text: 'text-brand-blue-600 dark:text-brand-blue-400',
    arrowLeft: 'border-l-brand-blue-500',
    arrowRight: 'border-r-brand-blue-500'
  }
]

const getTimelineColor = (index: number): TimelineColor => {
  return timelineColors[index % timelineColors.length] ?? defaultTimelineColor
}

// Card order for flexbox column wrap layout (zigzag pattern)
// With 5 items and 3 rows: cards 1,3,5 go left column; cards 2,4 go right column
const getCardStyle = (index: number) => {
  // Order calculation for zigzag: odd cards get lower order, even cards get higher
  const order = index % 2 === 0 ? Math.floor(index / 2) + 1 : Math.ceil(mockAchievements.value.length / 2) + Math.floor(index / 2) + 1
  return { order }
}

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
    <div ref="heroRef">
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
    </div>

    <!-- Tabs Navigation (similar to TabsNav.vue) -->
    <div class="sticky top-20 z-40">
      <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-4">
            <!-- Title (appears on scroll) -->
            <div
              class="flex items-center gap-3 py-3 transition-all duration-300 overflow-hidden"
              :class="showTitleInNav ? 'opacity-100 max-w-xs lg:max-w-md' : 'opacity-0 max-w-0'"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="colorClasses.bgLight"
              >
                <font-awesome-icon :icon="entityIcon" class="w-4 h-4" :class="colorClasses.text" />
              </div>
              <span class="font-semibold text-gray-900 dark:text-white truncate text-sm lg:text-base">
                {{ entityName }}
              </span>
            </div>

            <!-- Tabs -->
            <div class="flex-1 flex items-center justify-center overflow-x-auto scrollbar-hide">
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

          <!-- Next Tab Button -->
          <div v-if="nextTab" class="mt-12 flex justify-end">
            <button
              type="button"
              class="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :class="`${colorClasses.bgLight} ${colorClasses.text}`"
              @click="goToNextTab"
            >
              <span>{{ t(`organizationDetail.tabs.${nextTab.key}`) }}</span>
              <font-awesome-icon :icon="nextTab.icon" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
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

          <!-- Next Tab Button -->
          <div v-if="nextTab" class="mt-12 flex justify-end">
            <button
              type="button"
              class="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :class="`${colorClasses.bgLight} ${colorClasses.text}`"
              @click="goToNextTab"
            >
              <span>{{ t(`organizationDetail.tabs.${nextTab.key}`) }}</span>
              <font-awesome-icon :icon="nextTab.icon" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <!-- Achievements Tab - Flexbox Timeline -->
        <div v-if="activeTab === 'achievements'" class="animate__animated animate__fadeIn">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {{ t('organizationDetail.achievements.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{{ t('organizationDetail.achievements.subtitle') }}</p>
          </div>

          <!-- Flexbox Timeline -->
          <div class="demo-card-wrapper">
            <div
              v-for="(achievement, index) in mockAchievements"
              :key="index"
              class="demo-card"
              :class="`demo-card--step${index + 1}`"
              :style="getCardStyle(index)"
            >
              <!-- Head -->
              <div class="head" :style="{ backgroundColor: getTimelineColor(index).solid }">
                <!-- Timeline year marker -->
                <span class="timeline-year">{{ achievement.year }}</span>
                <div class="number-box">
                  <span>{{ String(mockAchievements.length - index).padStart(2, '0') }}</span>
                </div>
                <h2>
                  <span class="small">{{ achievement.subtitle }}</span>
                  {{ achievement.title }}
                </h2>
              </div>
              <!-- Body -->
              <div class="body">
                <p>{{ achievement.description }}</p>
                <img :src="achievement.image" :alt="achievement.title" />
              </div>
            </div>
          </div>

          <!-- Next Tab Button -->
          <div v-if="nextTab" class="mt-12 flex justify-end">
            <button
              type="button"
              class="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :class="`${colorClasses.bgLight} ${colorClasses.text}`"
              @click="goToNextTab"
            >
              <span>{{ t(`organizationDetail.tabs.${nextTab.key}`) }}</span>
              <font-awesome-icon :icon="nextTab.icon" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
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
                      'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/30 dark:text-brand-blue-400': project.status === 'ongoing',
                      'bg-brand-red-100 text-brand-red-700 dark:bg-brand-red-900/30 dark:text-brand-red-400': project.status === 'planned'
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

          <!-- Next Tab Button -->
          <div v-if="nextTab" class="mt-12 flex justify-end">
            <button
              type="button"
              class="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :class="`${colorClasses.bgLight} ${colorClasses.text}`"
              @click="goToNextTab"
            >
              <span>{{ t(`organizationDetail.tabs.${nextTab.key}`) }}</span>
              <font-awesome-icon :icon="nextTab.icon" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
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
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
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

          <!-- Next Tab Button -->
          <div v-if="nextTab" class="mt-12 flex justify-end">
            <button
              type="button"
              class="group inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :class="`${colorClasses.bgLight} ${colorClasses.text}`"
              @click="goToNextTab"
            >
              <span>{{ t(`organizationDetail.tabs.${nextTab.key}`) }}</span>
              <font-awesome-icon :icon="nextTab.icon" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
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

          <!-- Photos Gallery - Album Style -->
          <div v-if="activeMediaTab === 'photos'">
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <MediaAlbumCard
                :title="t('organizationDetail.media.photoAlbum')"
                :items="mockMedia.photos"
                @click="openPhotoAlbum"
              />
            </div>

            <!-- Album modal -->
            <MediaAlbumModal
              :open="albumModalOpen"
              :title="t('organizationDetail.media.photoAlbum')"
              :items="mockMedia.photos"
              @close="albumModalOpen = false"
            />
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

/* Timeline Styles */
.demo-card-wrapper {
  position: relative;
  margin: auto;
  max-width: 94%;
}

/* Timeline vertical line */
.demo-card-wrapper::after {
  z-index: 1;
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-left: 1px solid rgba(191, 191, 191, 0.4);
}

.demo-card {
  position: relative;
  display: block;
  margin: 10px auto 80px;
  max-width: 94%;
  z-index: 2;
  box-sizing: border-box;
}

.demo-card .head {
  position: relative;
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: 400;
}

.demo-card .head .number-box {
  display: inline;
  float: left;
  margin: 15px;
  padding: 10px;
  font-size: 35px;
  line-height: 35px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.17);
}

/* Timeline year - positioned on the center line (mobile: above card) */
.demo-card .head .timeline-year {
  display: block;
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  background: #f7f7f7;
  padding: 4px 12px;
  border-radius: 20px;
  z-index: 10;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

:global(.dark) .demo-card .head .timeline-year {
  background: rgb(31 41 55);
  color: #d1d5db;
}

.demo-card .head h2 {
  text-transform: uppercase;
  font-size: 1.3rem;
  font-weight: inherit;
  letter-spacing: 2px;
  margin: 0;
  padding-bottom: 6px;
  line-height: 1.2;
}

.demo-card .head h2 .small {
  display: block;
  font-size: 0.6rem;
  margin: 0;
}

.demo-card .body {
  background: #fff;
  border: 1px solid rgba(191, 191, 191, 0.4);
  border-top: 0;
  padding: 15px;
}

.demo-card .body p {
  font-size: 14px;
  line-height: 18px;
  margin-bottom: 15px;
  color: #555;
}

.demo-card .body img {
  display: block;
  width: 100%;
}

/* Dark mode */
:global(.dark) .demo-card .body {
  background: rgb(17 24 39);
  border-color: rgb(55 65 81);
}

:global(.dark) .demo-card .body p {
  color: rgb(156 163 175);
}

:global(.dark) .demo-card-wrapper::after {
  border-left-color: rgb(75 85 99);
}

/* Responsive: sm (480px) */
@media (min-width: 480px) {
  .demo-card {
    max-width: 60%;
    box-shadow: 0px 1px 22px 4px rgba(0, 0, 0, 0.07);
  }
  .demo-card .head h2 {
    font-size: 165%;
    line-height: 1.2;
  }
  .demo-card .head h2 .small {
    font-size: 0.8rem;
  }
}

/* Responsive: md (720px) */
@media (min-width: 720px) {
  .demo-card {
    max-width: 40%;
  }
}

/* Responsive: lg (1000px) - Full timeline layout */
@media (min-width: 1000px) {
  .demo-card-wrapper {
    display: flex;
    flex-flow: column wrap;
    width: 1170px; /* 450*2 + 90*3 */
    height: 1650px; /* 3 * (400 + 90) + 180 */
    margin: 0 auto;
    max-width: 100%;
  }

  .demo-card-wrapper::after {
    border-left: 1px solid #bdbdbd;
  }

  :global(.dark) .demo-card-wrapper::after {
    border-left-color: rgb(75 85 99);
  }

  .demo-card {
    max-width: 450px;
    height: 400px;
    margin: 90px;
    margin-top: 45px;
    margin-bottom: 45px;
  }

  .demo-card .body {
    height: 315px; /* 400 - (35 + 50) */
    overflow: hidden;
  }

  /* Odd cards - left side */
  .demo-card:nth-child(odd) {
    margin-right: 45px;
  }

  .demo-card:nth-child(odd) .head::after {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left-width: 15px;
    border-left-style: solid;
    left: 100%;
  }

  .demo-card:nth-child(odd) .head::before {
    display: none;
  }

  .demo-card:nth-child(odd) .head .timeline-year {
    position: absolute;
    left: calc(100% + 25px);
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: 700;
    color: #374151;
    background: #f7f7f7;
    padding: 4px 10px;
    border-radius: 20px;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  :global(.dark) .demo-card:nth-child(odd) .head .timeline-year {
    background: rgb(31 41 55);
    color: #d1d5db;
  }

  /* Even cards - right side */
  .demo-card:nth-child(even) {
    margin-left: 45px;
  }

  .demo-card:nth-child(even) .head::after {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-right-width: 15px;
    border-right-style: solid;
    right: 100%;
  }

  .demo-card:nth-child(even) .head::before {
    display: none;
  }

  .demo-card:nth-child(even) .head .timeline-year {
    position: absolute;
    left: auto;
    right: auto;
    left: -70px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: 700;
    color: #374151;
    background: #f7f7f7;
    padding: 4px 10px;
    border-radius: 20px;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  :global(.dark) .demo-card:nth-child(even) .head .timeline-year {
    background: rgb(31 41 55);
    color: #d1d5db;
  }

  /* Stagger for second card */
  .demo-card:nth-child(2) {
    margin-top: 180px;
  }

  /* Card ordering for column wrap zigzag */
  .demo-card:nth-child(1) { order: 1; }
  .demo-card:nth-child(2) { order: 4; }
  .demo-card:nth-child(3) { order: 2; }
  .demo-card:nth-child(4) { order: 5; }
  .demo-card:nth-child(5) { order: 3; }
}

/* Card colors and arrow colors */
.demo-card--step1 { background-color: #2b4bbf; }
.demo-card--step1 .head::after { border-color: #2b4bbf; }

.demo-card--step2 { background-color: #f32525; }
.demo-card--step2 .head::after { border-color: #f32525; }

.demo-card--step3 { background-color: #233da0; }
.demo-card--step3 .head::after { border-color: #233da0; }

.demo-card--step4 { background-color: #c21f1f; }
.demo-card--step4 .head::after { border-color: #c21f1f; }

.demo-card--step5 { background-color: #2b4bbf; }
.demo-card--step5 .head::after { border-color: #2b4bbf; }
</style>
