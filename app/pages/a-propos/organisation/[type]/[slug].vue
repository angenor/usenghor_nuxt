<script setup lang="ts">
import type {
  SectorPublicWithServices,
  ServicePublicWithDetails,
  ServiceObjectivePublic,
  ServiceAchievementPublic,
  ServiceProjectPublic,
  ServiceTeamMemberPublic,
} from '~/composables/usePublicOrganizationApi'
import type { OutputData } from '@editorjs/editorjs'
import type { NewsDisplay } from '~/types/news'
import type { AlbumWithMedia } from '~/types/api/media'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  getSectorByCode,
  findServiceBySlug,
  slugify,
} = usePublicOrganizationApi()
const { listPublishedNews, formatNewsDate } = usePublicNewsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()
const { getAlbumById: getPublicAlbumById } = usePublicAlbumsApi()

// Scroll detection for sticky title
const heroRef = ref<HTMLElement | null>(null)
const showTitleInNav = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry) {
        showTitleInNav.value = entry.intersectionRatio < 0.2
      }
    },
    { threshold: [0, 0.2, 0.5, 1] },
  )

  if (heroRef.value) {
    observer.observe(heroRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

// Get route params
const entityType = route.params.type as string
const entitySlug = route.params.slug as string

// Validate type (now supports 'secteur' and 'service')
const validTypes = ['secteur', 'service']
const isValidType = validTypes.includes(entityType)

// State
const loading = ref(true)
const error = ref<string | null>(null)
const sector = ref<SectorPublicWithServices | null>(null)
const service = ref<ServicePublicWithDetails | null>(null)
const relatedNews = ref<NewsDisplay[]>([])
const serviceAlbum = ref<AlbumWithMedia | null>(null)

// Fetch entity data
const fetchEntity = async () => {
  loading.value = true
  error.value = null

  try {
    if (entityType === 'secteur') {
      sector.value = await getSectorByCode(entitySlug.toUpperCase())
    }
    else if (entityType === 'service') {
      service.value = await findServiceBySlug(entitySlug)
    }
  }
  catch (err: unknown) {
    const fetchError = err as { message?: string }
    error.value = fetchError.message || 'Entité non trouvée'
    console.error('Error fetching entity:', err)
  }
  finally {
    loading.value = false
  }
}

// Fetch related news for this entity
const fetchRelatedNews = async () => {
  try {
    if (entityType === 'secteur' && sector.value) {
      const response = await listPublishedNews({ sector_id: sector.value.id, limit: 6 })
      relatedNews.value = response.items
    }
    else if (entityType === 'service' && service.value) {
      const response = await listPublishedNews({ service_id: service.value.id, limit: 6 })
      relatedNews.value = response.items
    }
  }
  catch (err) {
    console.error('Error fetching related news:', err)
    relatedNews.value = []
  }
}

// Fetch service album (media library)
const fetchServiceAlbum = async () => {
  if (entityType !== 'service' || !service.value?.album_external_id) {
    serviceAlbum.value = null
    return
  }

  try {
    serviceAlbum.value = await getPublicAlbumById(service.value.album_external_id)
  }
  catch (err) {
    console.error('Error fetching service album:', err)
    serviceAlbum.value = null
  }
}

// Fetch on mount
onMounted(async () => {
  await fetchEntity()
  await Promise.all([
    fetchRelatedNews(),
    fetchServiceAlbum(),
  ])
})

// SSR data
const { data: entityData } = await useAsyncData(
  `organization-${entityType}-${entitySlug}`,
  async () => {
    try {
      if (entityType === 'secteur') {
        return { type: 'sector', data: await getSectorByCode(entitySlug.toUpperCase()) }
      }
      else if (entityType === 'service') {
        return { type: 'service', data: await findServiceBySlug(entitySlug) }
      }
      return null
    }
    catch {
      return null
    }
  },
)

// Initialize from SSR
if (entityData.value) {
  if (entityData.value.type === 'sector') {
    sector.value = entityData.value.data as SectorPublicWithServices
  }
  else if (entityData.value.type === 'service') {
    service.value = entityData.value.data as ServicePublicWithDetails
  }
  loading.value = false
  // Charger les actualités et l'album associés (côté client)
  if (import.meta.client) {
    fetchRelatedNews()
    fetchServiceAlbum()
  }
}

// Computed: current entity (sector or service)
const entity = computed(() => {
  if (entityType === 'secteur') return sector.value
  if (entityType === 'service') return service.value
  return null
})

// Redirect to 404 if invalid type
if (!isValidType) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
  })
}

// Get entity name
const entityName = computed(() => {
  if (!entity.value) return ''
  return entity.value.name
})

// Convertir une string (potentiellement JSON ou texte brut) en OutputData
const parseEditorContent = (content: string | null | undefined): OutputData | undefined => {
  if (!content) return undefined
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    // Si ce n'est pas du JSON valide, créer un bloc paragraphe avec le texte
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: content } }],
        version: '2.28.0'
      }
    }
  }
  return undefined
}

// Extraire le texte brut d'un contenu EditorJS pour les previews
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .filter((block: { type: string }) => block.type === 'paragraph')
        .map((block: { data: { text: string } }) => block.data.text)
        .join(' ')
        .replace(/<[^>]*>/g, '') // Enlever les balises HTML
        .substring(0, 200)
    }
  } catch {
    // Si ce n'est pas du JSON, retourner le texte tel quel
    return content.substring(0, 200)
  }
  return ''
}

// Get entity description (string pour le hero subtitle)
const entityDescriptionText = computed(() => {
  if (!entity.value) return ''
  return extractPlainText(entity.value.description)
})

// Get entity description (OutputData pour le rendu riche)
const entityDescription = computed(() => {
  if (!entity.value) return undefined
  return parseEditorContent(entity.value.description)
})

// Get entity mission (OutputData pour le rendu riche)
const entityMission = computed(() => {
  if (!entity.value) return undefined
  return parseEditorContent(entity.value.mission)
})

// Objectives (only for services)
const objectives = computed<ServiceObjectivePublic[]>(() => {
  if (entityType === 'service' && service.value) {
    return service.value.objectives || []
  }
  return []
})

// Achievements (only for services)
const achievements = computed<ServiceAchievementPublic[]>(() => {
  if (entityType === 'service' && service.value) {
    return service.value.achievements || []
  }
  return []
})

// Projects (only for services)
const projects = computed<ServiceProjectPublic[]>(() => {
  if (entityType === 'service' && service.value) {
    return service.value.projects || []
  }
  return []
})

// Team (only for services)
const team = computed<ServiceTeamMemberPublic[]>(() => {
  if (entityType === 'service' && service.value) {
    return service.value.team || []
  }
  return []
})

// Services (only for sectors)
const sectorServices = computed(() => {
  if (entityType === 'secteur' && sector.value) {
    return sector.value.services || []
  }
  return []
})

// Color palette
const colorPalette: Record<string, { bg: string, bgLight: string, text: string, border: string, gradient: string, hoverBg: string }> = {
  blue: {
    bg: 'bg-brand-blue-500',
    bgLight: 'bg-brand-blue-100 dark:bg-brand-blue-900/30',
    text: 'text-brand-blue-600 dark:text-brand-blue-400',
    border: 'border-brand-blue-500',
    gradient: 'from-brand-blue-500 to-brand-blue-600',
    hoverBg: 'hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/20',
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
  },
}

// Color based on entity type
const entityColor = computed(() => {
  return entityType === 'secteur' ? 'purple' : 'blue'
})

const colorClasses = computed(() => colorPalette[entityColor.value] ?? colorPalette.blue)

// SEO
useSeoMeta({
  title: () => entityType === 'secteur'
    ? t('organizationDetail.seo.titleSector', { name: entityName.value })
    : t('organizationDetail.seo.titleService', { name: entityName.value }),
  description: () => t('organizationDetail.seo.description', {
    type: t(`organizationDetail.types.${entityType === 'secteur' ? 'sector' : 'service'}`),
    name: entityName.value,
  }),
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('about.tabs.organization'), to: '/a-propos/organisation' },
  { label: entityName.value },
])

// Active tab
const activeTab = ref('missions')
const tabs = computed(() => {
  if (entityType === 'secteur') {
    // Secteurs: services list + actualités
    return [
      { key: 'missions', icon: 'fa-solid fa-bullseye' },
      { key: 'services', icon: 'fa-solid fa-building' },
      { key: 'news', icon: 'fa-solid fa-newspaper' },
    ]
  }
  // Services: full tabs + actualités + médiathèque
  return [
    { key: 'missions', icon: 'fa-solid fa-bullseye' },
    { key: 'team', icon: 'fa-solid fa-users' },
    { key: 'achievements', icon: 'fa-solid fa-trophy' },
    { key: 'projects', icon: 'fa-solid fa-diagram-project' },
    { key: 'news', icon: 'fa-solid fa-newspaper' },
    { key: 'media', icon: 'fa-solid fa-images' },
  ]
})

// Navigate to next tab
const goToNextTab = () => {
  const currentIndex = tabs.value.findIndex(tab => tab.key === activeTab.value)
  const nextTabItem = tabs.value[currentIndex + 1]
  if (currentIndex < tabs.value.length - 1 && nextTabItem) {
    activeTab.value = nextTabItem.key
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }
}

// Get next tab info
const nextTab = computed(() => {
  const currentIndex = tabs.value.findIndex(tab => tab.key === activeTab.value)
  if (currentIndex < tabs.value.length - 1) {
    return tabs.value[currentIndex + 1] ?? null
  }
  return null
})

// Project status colors
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'ongoing':
      return 'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/30 dark:text-brand-blue-400'
    case 'suspended':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

// Format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Get service URL
const getServiceUrl = (svc: { name: string }) => {
  return localePath(`/a-propos/organisation/service/${slugify(svc.name)}`)
}

// Helper pour obtenir l'URL de l'image de couverture d'une actualité
const getNewsCoverImageUrl = (news: NewsDisplay, variant: 'low' | 'medium' | 'original' = 'low'): string => {
  if (news.cover_image_external_id) {
    const originalUrl = getMediaUrl(news.cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : `https://picsum.photos/seed/${news.id}/800/500`
  }
  return news.cover_image || `https://picsum.photos/seed/${news.id}/800/500`
}
</script>

<template>
  <div class="bg-grid-pattern">
    <!-- Loading state -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-600 border-t-transparent mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('common.loading') }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error || !entity" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div class="text-center max-w-md mx-auto px-4">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-500 mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('common.error') || 'Erreur' }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ error || t('organizationDetail.notFound') || 'Entité non trouvée' }}
        </p>
        <NuxtLink
          :to="localePath('/a-propos/organisation')"
          class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
          {{ t('organizationDetail.cta.backToOrg') || 'Retour à l\'organisation' }}
        </NuxtLink>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Hero Section with Image -->
      <div ref="heroRef">
        <PageHero
          :title="entityName"
          :subtitle="entityDescriptionText"
          :breadcrumb="breadcrumb"
        >
          <template #badge>
            <span
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white"
            >
              <font-awesome-icon :icon="entityType === 'secteur' ? 'fa-solid fa-layer-group' : 'fa-solid fa-building'" class="w-4 h-4" />
              {{ t(`organizationDetail.breadcrumb.${entityType === 'secteur' ? 'sector' : 'service'}`) }}
            </span>
          </template>
        </PageHero>
      </div>

      <!-- Tabs Navigation -->
      <div class="sticky top-20 z-40">
        <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative tab-nav-container">
            <div class="flex items-center gap-2 sm:gap-4">
              <!-- Title (appears on scroll) - hidden on mobile -->
              <div
                class="hidden sm:flex items-center gap-3 py-3 transition-all duration-300 overflow-hidden"
                :class="showTitleInNav ? 'opacity-100 max-w-xs lg:max-w-md' : 'opacity-0 max-w-0'"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  :class="colorClasses.bgLight"
                >
                  <font-awesome-icon :icon="entityType === 'secteur' ? 'fa-solid fa-layer-group' : 'fa-solid fa-building'" class="w-4 h-4" :class="colorClasses.text" />
                </div>
                <span class="font-semibold text-gray-900 dark:text-white truncate text-sm lg:text-base">
                  {{ entityName }}
                </span>
              </div>

              <!-- Tabs -->
              <div class="flex-1 flex items-center overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:justify-center">
                <button
                  v-for="tab in tabs"
                  :key="tab.key"
                  type="button"
                  class="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 snap-start flex-shrink-0"
                  :class="activeTab === tab.key
                    ? `${colorClasses.border} ${colorClasses.text}`
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'"
                  @click="activeTab = tab.key"
                >
                  <font-awesome-icon
                    :icon="tab.icon"
                    class="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200"
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

            <!-- Mission Card -->
            <div v-if="entityMission" class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm mb-8">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('organizationDetail.missions.mission') || 'Mission' }}
              </h3>
              <div class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <EditorJSRenderer :data="entityMission" />
              </div>
            </div>

            <!-- Description Card -->
            <div v-if="entityDescription" class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm mb-8">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {{ t('organizationDetail.missions.description') || 'Description' }}
              </h3>
              <div class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                <EditorJSRenderer :data="entityDescription" />
              </div>
            </div>

            <!-- Objectives Grid (for services only) -->
            <div v-if="entityType === 'service' && objectives.length > 0">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {{ t('organizationDetail.missions.objectives') }}
              </h3>
              <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
                <div
                  v-for="(objective, index) in objectives"
                  :key="objective.id"
                  class="flex items-start gap-4 p-5 transition-colors duration-200 group"
                  :class="index === 0 ? 'rounded-t-2xl' : ''"
                >
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    :class="colorClasses.bgLight"
                  >
                    <font-awesome-icon icon="fa-solid fa-circle-check" class="w-5 h-5" :class="colorClasses.text" />
                  </div>
                  <div class="flex-1 min-w-0 pt-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1">{{ objective.title }}</h4>
                    <p v-if="objective.description" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ objective.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state for objectives -->
            <div v-else-if="entityType === 'service'" class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
              <font-awesome-icon icon="fa-solid fa-bullseye" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p class="text-gray-500 dark:text-gray-400 text-lg">{{ t('organizationDetail.missions.noObjectives') || 'Aucun objectif défini' }}</p>
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

          <!-- Team Tab (for services only) -->
          <div v-if="activeTab === 'team' && entityType === 'service'" class="animate__animated animate__fadeIn">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('organizationDetail.team.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{ t('organizationDetail.team.subtitle', { type: t('organizationDetail.types.service') }) }}
              </p>
            </div>

            <div v-if="team.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <NuxtLink
                v-for="member in team"
                :key="member.id"
                :to="localePath(`/a-propos/equipe/${member.user_external_id}`)"
                class="block bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group text-center cursor-pointer hover:-translate-y-1"
              >
                <!-- Photo -->
                <div class="relative mx-auto w-24 h-24 mb-4">
                  <div
                    v-if="member.user?.photo_url"
                    class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-lg"
                  >
                    <img
                      :src="member.user.photo_url"
                      :alt="`${member.user.first_name} ${member.user.last_name}`"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div
                    v-else
                    class="w-24 h-24 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-lg"
                    :class="colorClasses.bgLight"
                  >
                    <font-awesome-icon icon="fa-solid fa-user" class="w-10 h-10" :class="colorClasses.text" />
                  </div>
                </div>

                <!-- Info -->
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
                  {{ member.user ? `${member.user.first_name} ${member.user.last_name}` : t('organizationDetail.team.members') }}
                </h4>
                <p class="text-sm font-medium mb-2" :class="colorClasses.text">
                  {{ member.position }}
                </p>

                <!-- Email -->
                <a
                  v-if="member.user?.email"
                  :href="`mailto:${member.user.email}`"
                  class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  @click.stop
                >
                  <font-awesome-icon icon="fa-solid fa-envelope" class="w-3 h-3" />
                  <span class="truncate max-w-[150px]">{{ member.user.email }}</span>
                </a>
              </NuxtLink>
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

          <!-- Services Tab (for sectors only) -->
          <div v-if="activeTab === 'services' && entityType === 'secteur'" class="animate__animated animate__fadeIn">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('organizationDetail.services.title') || 'Services' }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.services.subtitle') || 'Services rattachés à ce secteur' }}</p>
            </div>

            <div v-if="sectorServices.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <NuxtLink
                v-for="svc in sectorServices"
                :key="svc.id"
                :to="getServiceUrl(svc)"
                class="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 bg-brand-blue-100 dark:bg-brand-blue-900/30"
                  >
                    <font-awesome-icon icon="fa-solid fa-building" class="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                      {{ svc.name }}
                    </h4>
                    <p v-if="svc.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {{ svc.description }}
                    </p>
                    <span class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                      <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                      <span>{{ t('organization.departments.view_programs') }}</span>
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
              <font-awesome-icon icon="fa-solid fa-building" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p class="text-gray-500 dark:text-gray-400 text-lg">{{ t('organizationDetail.services.empty') || 'Aucun service dans ce secteur' }}</p>
            </div>
          </div>

          <!-- Achievements Tab (for services only) -->
          <div v-if="activeTab === 'achievements' && entityType === 'service'" class="animate__animated animate__fadeIn">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('organizationDetail.achievements.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.achievements.subtitle') }}</p>
            </div>

            <div v-if="achievements.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="achievement in achievements"
                :key="achievement.id"
                class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div v-if="achievement.cover_image_external_id" class="relative h-40 overflow-hidden">
                  <img
                    :src="getMediaUrl(achievement.cover_image_external_id) ?? undefined"
                    :alt="achievement.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div v-if="achievement.type" class="absolute top-4 right-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700">
                      {{ achievement.type }}
                    </span>
                  </div>
                </div>
                <div class="p-6">
                  <p v-if="achievement.achievement_date" class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4 mr-2" />
                    {{ formatDate(achievement.achievement_date) }}
                  </p>
                  <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ achievement.title }}</h3>
                  <p v-if="achievement.description" class="text-sm text-gray-600 dark:text-gray-400">{{ achievement.description }}</p>
                </div>
              </div>
            </div>

            <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
              <font-awesome-icon icon="fa-solid fa-trophy" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p class="text-gray-500 dark:text-gray-400 text-lg">{{ t('organizationDetail.achievements.empty') || 'Aucune réalisation enregistrée' }}</p>
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

          <!-- Projects Tab (for services only) -->
          <div v-if="activeTab === 'projects' && entityType === 'service'" class="animate__animated animate__fadeIn">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('organizationDetail.projects.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">{{ t('organizationDetail.projects.subtitle') }}</p>
            </div>

            <div v-if="projects.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="project in projects"
                :key="project.id"
                class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div v-if="project.cover_image_external_id" class="relative h-40 overflow-hidden">
                  <img
                    :src="getMediaUrl(project.cover_image_external_id) ?? undefined"
                    :alt="project.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div class="absolute top-4 right-4">
                    <span
                      class="px-3 py-1 rounded-full text-xs font-semibold"
                      :class="getStatusClasses(project.status)"
                    >
                      {{ t(`organizationDetail.projects.status.${project.status}`) }}
                    </span>
                  </div>
                </div>
                <div class="p-6">
                  <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ project.title }}</h3>
                  <p v-if="project.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ project.description }}</p>

                  <!-- Dates -->
                  <div v-if="project.start_date || project.expected_end_date" class="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span v-if="project.start_date">{{ t('organizationDetail.projects.startDate') || 'Début' }}: {{ formatDate(project.start_date) }}</span>
                    <span v-if="project.expected_end_date" class="ml-3">{{ t('organizationDetail.projects.endDate') || 'Fin prévue' }}: {{ formatDate(project.expected_end_date) }}</span>
                  </div>

                  <!-- Progress bar -->
                  <div class="mb-2">
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-gray-500 dark:text-gray-400">{{ t('organizationDetail.projects.progress') || 'Progression' }}</span>
                      <span :class="colorClasses.text">{{ project.progress }}%</span>
                    </div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="colorClasses.bg"
                        :style="{ width: `${project.progress}%` }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
              <font-awesome-icon icon="fa-solid fa-diagram-project" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p class="text-gray-500 dark:text-gray-400 text-lg">{{ t('organizationDetail.projects.empty') || 'Aucun projet en cours' }}</p>
            </div>
          </div>

          <!-- News Tab (for both sectors and services) -->
          <div v-if="activeTab === 'news'" class="animate__animated animate__fadeIn">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('organizationDetail.news.title') || 'Actualités' }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{ t('organizationDetail.news.subtitle', { name: entityName }) || `Actualités liées à ${entityName}` }}
              </p>
            </div>

            <div v-if="relatedNews.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NuxtLink
                v-for="news in relatedNews"
                :key="news.id"
                :to="localePath(`/actualites/${news.slug}`)"
                class="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <!-- Image -->
                <div class="relative h-48 overflow-hidden">
                  <img
                    :src="getNewsCoverImageUrl(news, 'low')"
                    :alt="news.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <!-- Badge highlight status -->
                  <div v-if="news.highlight_status !== 'standard'" class="absolute top-4 left-4">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-semibold text-white"
                      :class="news.highlight_status === 'headline' ? 'bg-brand-blue-600' : 'bg-purple-600'"
                    >
                      {{ news.highlight_status === 'headline' ? t('actualites.sections.featured') : t('actualites.sections.featured') }}
                    </span>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-5">
                  <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {{ news.title }}
                  </h3>
                  <p v-if="news.summary" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {{ news.summary }}
                  </p>

                  <!-- Tags -->
                  <div v-if="news.tags && news.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
                    <span
                      v-for="tag in news.tags.slice(0, 2)"
                      :key="tag.id"
                      class="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {{ tag.name }}
                    </span>
                  </div>

                  <!-- Date -->
                  <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                    <span>{{ formatNewsDate(news.published_at) }}</span>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Empty state -->
            <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
              <font-awesome-icon icon="fa-solid fa-newspaper" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p class="text-gray-500 dark:text-gray-400 text-lg">
                {{ t('organizationDetail.news.empty') || 'Aucune actualité pour le moment' }}
              </p>
            </div>

            <!-- View all news link -->
            <div v-if="relatedNews.length > 0" class="mt-8 text-center">
              <NuxtLink
                :to="localePath('/actualites')"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                :class="`${colorClasses.bgLight} ${colorClasses.text}`"
              >
                <span>{{ t('organizationDetail.news.viewAll') || 'Voir toutes les actualités' }}</span>
                <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>

          <!-- Media Tab (for services only) -->
          <div v-if="activeTab === 'media' && entityType === 'service'" class="animate__animated animate__fadeIn">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('organizationDetail.media.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{ t('organizationDetail.media.subtitle') }}
              </p>
            </div>

            <!-- Album content -->
            <div v-if="serviceAlbum && serviceAlbum.media_items.length > 0">
              <!-- Album info -->
              <div v-if="serviceAlbum.title || serviceAlbum.description" class="mb-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <h3 v-if="serviceAlbum.title" class="font-semibold text-gray-900 dark:text-white mb-2">
                  {{ serviceAlbum.title }}
                </h3>
                <p v-if="serviceAlbum.description" class="text-sm text-gray-600 dark:text-gray-400">
                  {{ serviceAlbum.description }}
                </p>
              </div>

              <!-- Media grid -->
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div
                  v-for="media in serviceAlbum.media_items"
                  :key="media.id"
                  class="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
                >
                  <!-- Image -->
                  <img
                    v-if="media.type === 'image'"
                    :src="getImageVariantUrl(getMediaUrl(media.id) || '', 'medium')"
                    :alt="media.alt_text || media.name"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  <!-- Video placeholder -->
                  <div
                    v-else-if="media.type === 'video'"
                    class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                  >
                    <font-awesome-icon icon="fa-solid fa-play-circle" class="w-12 h-12 text-gray-400" />
                  </div>

                  <!-- Document placeholder -->
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                  >
                    <font-awesome-icon icon="fa-solid fa-file" class="w-12 h-12 text-gray-400" />
                  </div>

                  <!-- Overlay with info -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div class="absolute bottom-0 left-0 right-0 p-3">
                      <p class="text-white text-sm font-medium truncate">
                        {{ media.name }}
                      </p>
                      <p v-if="media.credits" class="text-white/70 text-xs truncate">
                        © {{ media.credits }}
                      </p>
                    </div>
                  </div>

                  <!-- Download link -->
                  <a
                    :href="getMediaUrl(media.id) || ''"
                    target="_blank"
                    class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white dark:hover:bg-gray-700"
                    :title="t('organizationDetail.media.download')"
                  >
                    <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
                  </a>
                </div>
              </div>

              <!-- Media count -->
              <p class="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                {{ serviceAlbum.media_items.length }} {{ serviceAlbum.media_items.length > 1 ? 'médias' : 'média' }}
              </p>
            </div>

            <!-- Empty state -->
            <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
              <font-awesome-icon icon="fa-solid fa-images" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
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
            class="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5" />
            {{ t('organizationDetail.cta.backToOrg') }}
          </NuxtLink>
        </div>
      </section>
    </div>
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

/* Gradient fade sur les bords pour indiquer le scroll horizontal en mobile */
@media (max-width: 639px) {
  .tab-nav-container::before,
  .tab-nav-container::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 16px;
    z-index: 10;
    pointer-events: none;
  }
  .tab-nav-container::before {
    left: 0;
    background: linear-gradient(to right, rgb(255 255 255) 0%, transparent 100%);
  }
  .tab-nav-container::after {
    right: 0;
    background: linear-gradient(to left, rgb(255 255 255) 0%, transparent 100%);
  }
  :is(.dark) .tab-nav-container::before {
    background: linear-gradient(to right, rgb(17 24 39) 0%, transparent 100%);
  }
  :is(.dark) .tab-nav-container::after {
    background: linear-gradient(to left, rgb(17 24 39) 0%, transparent 100%);
  }
}
</style>
