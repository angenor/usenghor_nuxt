<script setup lang="ts">
import type { NewsDisplay } from '~/types/news'
import type { ApplicationCallPublic, CallType, SectorPublic, ServicePublic } from '~/types/api'
import type { ProjectRead } from '~/types/api/projects'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getAllPublishedNews, listPublishedNews } = usePublicNewsApi()
const { getUpcomingEvents: getApiUpcomingEvents } = usePublicEventsApi()
const { listOngoingCalls } = usePublicCallsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()
const { listSectors, listServices } = usePublicOrganizationApi()
const { listProjects } = usePublicProjectsApi()

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(item: NewsDisplay | any, variant: 'low' | 'medium' | 'original' = 'medium'): string {
  if (item.cover_image_external_id) {
    const originalUrl = getMediaUrl(item.cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : 'https://picsum.photos/seed/default/800/500'
  }
  return item.cover_image || 'https://picsum.photos/seed/default/800/500'
}

// SEO
useSeoMeta({
  title: () => t('actualites.seo.title'),
  description: () => t('actualites.seo.description')
})

// Mapping des types API vers les clés i18n
const typeToI18nKey: Record<CallType, string> = {
  application: 'candidature',
  scholarship: 'bourse',
  project: 'projet',
  recruitment: 'recrutement',
  training: 'formation',
}

// Get data
const allNews = ref<NewsDisplay[]>([])
const upcomingEventsData = ref<any[]>([])
const openCallsData = ref<ApplicationCallPublic[]>([])
const isLoading = ref(true)

// Données de référence pour les filtres
const sectors = ref<SectorPublic[]>([])
const services = ref<ServicePublic[]>([])
const projects = ref<ProjectRead[]>([])

// Filtres actifs
const selectedSector = ref<string | null>(null)
const selectedService = ref<string | null>(null)
const selectedProject = ref<string | null>(null)

// Services filtrés par secteur sélectionné
const filteredServices = computed(() => {
  if (!selectedSector.value) return services.value
  return services.value.filter(s => s.sector_id === selectedSector.value)
})

// Fonction pour charger les actualités avec les filtres
async function loadNews() {
  isLoading.value = true
  try {
    const news = await getAllPublishedNews({
      sector_id: selectedSector.value || undefined,
      service_id: selectedService.value || undefined,
      project_id: selectedProject.value || undefined,
    })
    allNews.value = news
  } catch (error) {
    console.error('Erreur lors du chargement des actualités:', error)
    allNews.value = []
  } finally {
    isLoading.value = false
  }
}

// Réinitialiser le service sélectionné quand le secteur change
watch(selectedSector, () => {
  selectedService.value = null
  loadNews()
})

// Recharger les actualités quand service ou projet change
watch([selectedService, selectedProject], () => {
  loadNews()
})

// Réinitialiser tous les filtres
function resetFilters() {
  selectedSector.value = null
  selectedService.value = null
  selectedProject.value = null
}

// Vérifier si des filtres sont actifs
const hasActiveFilters = computed(() =>
  selectedSector.value || selectedService.value || selectedProject.value
)

// Charger les actualités, événements, appels et données de référence depuis l'API
onMounted(async () => {
  try {
    const [news, events, calls, sectorsData, servicesData, projectsData] = await Promise.all([
      getAllPublishedNews(),
      getApiUpcomingEvents(4),
      listOngoingCalls(),
      listSectors(),
      listServices(),
      listProjects({ limit: 50 }).then(r => r.items)
    ])
    allNews.value = news
    upcomingEventsData.value = events
    openCallsData.value = calls.slice(0, 3)
    sectors.value = sectorsData
    services.value = servicesData
    projects.value = projectsData
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    allNews.value = []
    upcomingEventsData.value = []
    openCallsData.value = []
  } finally {
    isLoading.value = false
  }
})

const upcomingEvents = computed(() => upcomingEventsData.value)
const openCalls = computed(() => openCallsData.value)

// Featured news (first one with headline status or first published)
const featuredNews = computed(() => {
  const headline = allNews.value.find(n => n.highlight_status === 'headline')
  return headline || allNews.value[0] || null
})

// Side news (next 3 featured or regular news)
const sideNews = computed(() => {
  const featured = allNews.value.filter(n =>
    n.id !== featuredNews.value?.id &&
    (n.highlight_status === 'featured' || n.highlight_status === 'standard')
  )
  return featured.slice(0, 3)
})

// Latest news - avec pagination
const NEWS_PER_PAGE = 4
const newsDisplayCount = ref(NEWS_PER_PAGE)

// Toutes les actualités restantes (après featured + side)
const remainingNews = computed(() => {
  const usedIds = [
    featuredNews.value?.id,
    ...sideNews.value.map(n => n.id)
  ].filter(Boolean)

  return allNews.value.filter(n => !usedIds.includes(n.id))
})

// Latest news avec limite
const latestNews = computed(() => remainingNews.value.slice(0, newsDisplayCount.value))

// Vérifier s'il reste des actualités à afficher
const hasMoreNews = computed(() => newsDisplayCount.value < remainingNews.value.length)

// Vérifier si on affiche plus que le minimum
const showingMore = computed(() => newsDisplayCount.value > NEWS_PER_PAGE)

// Afficher plus d'actualités
const loadMoreNews = () => {
  newsDisplayCount.value += NEWS_PER_PAGE
}

// Réduire le nombre d'actualités affichées
const showLessNews = () => {
  newsDisplayCount.value = NEWS_PER_PAGE
}

// Localization helpers
const getLocalizedTitle = (item: NewsDisplay) => {
  // Pour le moment, on utilise uniquement le titre principal
  // TODO: Implémenter le support multilingue complet
  return item.title
}

const getLocalizedExcerpt = (item: NewsDisplay) => {
  // Pour le moment, on utilise le summary
  return item.summary || ''
}

// Helper pour obtenir le label du type d'appel
const getCallTypeLabel = (type: CallType) => {
  const key = typeToI18nKey[type]
  return t(`actualites.calls.filters.${key}`)
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

const formatShortDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}

// Event type colors
const typeColors: Record<string, string> = {
  conference: 'bg-brand-red-600',
  workshop: 'bg-brand-blue-600',
  ceremony: 'bg-brand-blue-500',
  seminar: 'bg-purple-600',
  symposium: 'bg-green-600',
  other: 'bg-gray-600'
}

// Helper pour les événements
const getEventTitle = (event: any) => {
  return event.title
}

// Vérifier si une actualité a des associations
const hasAssociations = (item: NewsDisplay) => {
  return item.sector_name || item.service_name || item.project_name
}
</script>

<template>
  <div>
    <!-- Hero -->
    <ActualitesHero
      :title="t('actualites.hero.title')"
      :subtitle="t('actualites.hero.subtitle')"
      :badge="t('actualites.hero.badge')"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Section Filtres -->
      <section v-if="sectors.length > 0 || projects.length > 0" class="mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-filter" class="w-4 h-4 text-brand-blue-500" />
              {{ t('actualites.filters.title', 'Filtrer par') }}
            </h3>
            <button
              v-if="hasActiveFilters"
              @click="resetFilters"
              class="text-sm text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300 flex items-center gap-1"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="w-3 h-3" />
              {{ t('actualites.filters.reset', 'Réinitialiser') }}
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Filtre par secteur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('actualites.filters.sector', 'Secteur') }}
              </label>
              <select
                v-model="selectedSector"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
              >
                <option :value="null">{{ t('actualites.filters.allSectors', 'Tous les secteurs') }}</option>
                <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                  {{ sector.name }}
                </option>
              </select>
            </div>

            <!-- Filtre par service -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('actualites.filters.service', 'Service') }}
              </label>
              <select
                v-model="selectedService"
                :disabled="filteredServices.length === 0"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option :value="null">{{ t('actualites.filters.allServices', 'Tous les services') }}</option>
                <option v-for="service in filteredServices" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
            </div>

            <!-- Filtre par projet -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {{ t('actualites.filters.project', 'Projet') }}
              </label>
              <select
                v-model="selectedProject"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-brand-blue-500"
              >
                <option :value="null">{{ t('actualites.filters.allProjects', 'Tous les projets') }}</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.title }}
                </option>
              </select>
            </div>
          </div>

          <!-- Indicateur de filtres actifs -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
            <span
              v-if="selectedSector"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
            >
              <font-awesome-icon icon="fa-solid fa-building" class="w-3 h-3" />
              {{ sectors.find(s => s.id === selectedSector)?.name }}
              <button @click="selectedSector = null" class="ml-1 hover:text-blue-600">
                <font-awesome-icon icon="fa-solid fa-times" class="w-3 h-3" />
              </button>
            </span>
            <span
              v-if="selectedService"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full"
            >
              <font-awesome-icon icon="fa-solid fa-cogs" class="w-3 h-3" />
              {{ services.find(s => s.id === selectedService)?.name }}
              <button @click="selectedService = null" class="ml-1 hover:text-green-600">
                <font-awesome-icon icon="fa-solid fa-times" class="w-3 h-3" />
              </button>
            </span>
            <span
              v-if="selectedProject"
              class="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full"
            >
              <font-awesome-icon icon="fa-solid fa-project-diagram" class="w-3 h-3" />
              {{ projects.find(p => p.id === selectedProject)?.title }}
              <button @click="selectedProject = null" class="ml-1 hover:text-purple-600">
                <font-awesome-icon icon="fa-solid fa-times" class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>
      </section>
      <!-- Section 1: Featured + Side news + Sidebar -->
      <section class="mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          <span class="relative inline-block">
            {{ t('actualites.sections.featured') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main content: Featured + Side -->
          <div class="lg:w-2/3">
            <!-- Loading state -->
            <div v-if="isLoading" class="flex items-center justify-center py-12">
              <div class="flex flex-col items-center gap-4">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('actualites.loading') }}</span>
              </div>
            </div>

            <div v-else class="flex flex-col md:flex-row gap-6">
              <!-- Featured article -->
              <NuxtLink v-if="featuredNews" :to="localePath(`/actualites/${featuredNews.slug}`)" class="md:w-3/5 group block">
                <div class="overflow-hidden rounded-xl">
                  <img
                    :src="getCoverImageUrl(featuredNews, 'medium')"
                    :alt="getLocalizedTitle(featuredNews)"
                    class="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>

                <div class="mt-5">
                  <div class="flex items-center flex-wrap gap-2 mb-3">
                    <span class="inline-block px-3 py-1 text-xs font-semibold text-white bg-brand-blue-600 rounded uppercase tracking-wide">
                      {{ t('actualites.sections.featured') }}
                    </span>
                    <!-- Badges d'association -->
                    <span
                      v-if="featuredNews.sector_name"
                      class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                    >
                      <font-awesome-icon icon="fa-solid fa-building" class="w-2.5 h-2.5" />
                      {{ featuredNews.sector_name }}
                    </span>
                    <span
                      v-if="featuredNews.service_name"
                      class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
                    >
                      <font-awesome-icon icon="fa-solid fa-cogs" class="w-2.5 h-2.5" />
                      {{ featuredNews.service_name }}
                    </span>
                    <span
                      v-if="featuredNews.project_name"
                      class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                    >
                      <font-awesome-icon icon="fa-solid fa-project-diagram" class="w-2.5 h-2.5" />
                      {{ featuredNews.project_name }}
                    </span>
                  </div>

                  <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {{ getLocalizedTitle(featuredNews) }}
                  </h3>

                  <p class="mt-3 text-gray-600 dark:text-gray-400 text-base leading-relaxed line-clamp-3">
                    {{ getLocalizedExcerpt(featuredNews) }}
                  </p>

                  <div class="flex items-center gap-3 mt-4">
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(featuredNews.published_at) }}</span>
                  </div>
                </div>
              </NuxtLink>

              <!-- Side articles -->
              <div class="md:w-2/5 space-y-0">
                <NuxtLink
                  v-for="(item, index) in sideNews"
                  :key="item.id"
                  :to="localePath(`/actualites/${item.slug}`)"
                  class="group block py-4"
                  :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
                >
                  <div class="overflow-hidden rounded-lg mb-3">
                    <img
                      :src="getCoverImageUrl(item, 'low')"
                      :alt="getLocalizedTitle(item)"
                      class="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    >
                  </div>

                  <h4 class="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {{ getLocalizedTitle(item) }}
                  </h4>

                  <!-- Badges d'association pour les cartes latérales -->
                  <div v-if="hasAssociations(item)" class="flex flex-wrap gap-1 mt-2">
                    <span
                      v-if="item.sector_name"
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                    >
                      {{ item.sector_name }}
                    </span>
                    <span
                      v-if="item.service_name"
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
                    >
                      {{ item.service_name }}
                    </span>
                    <span
                      v-if="item.project_name"
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                    >
                      {{ item.project_name }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(item.published_at) }}</span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:w-1/3">
            <ActualitesSidebar :show-news="false" />
          </div>
        </div>
      </section>

      <!-- Section 2: Latest News Grid -->
      <section v-if="latestNews.length > 0" class="mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          <span class="relative inline-block">
            {{ t('actualites.sections.latestNews') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="item in latestNews"
            :key="item.id"
            :to="localePath(`/actualites/${item.slug}`)"
            class="group block"
          >
            <div class="overflow-hidden rounded-xl">
              <img
                :src="getCoverImageUrl(item, 'low')"
                :alt="getLocalizedTitle(item)"
                class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <div class="mt-4">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                {{ getLocalizedTitle(item) }}
              </h3>

              <!-- Badges d'association pour les cartes Latest News -->
              <div v-if="hasAssociations(item)" class="flex flex-wrap gap-1 mt-2">
                <span
                  v-if="item.sector_name"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                >
                  {{ item.sector_name }}
                </span>
                <span
                  v-if="item.service_name"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
                >
                  {{ item.service_name }}
                </span>
                <span
                  v-if="item.project_name"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-full"
                >
                  {{ item.project_name }}
                </span>
              </div>

              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ getLocalizedExcerpt(item) }}
              </p>

              <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(item.published_at) }}
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Boutons Afficher plus / moins -->
        <div v-if="hasMoreNews || showingMore" class="flex justify-center gap-4 mt-10">
          <button
            v-if="hasMoreNews"
            @click="loadMoreNews"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="w-4 h-4" />
            {{ t('actualites.sections.loadMore') }}
          </button>
          <button
            v-if="showingMore"
            @click="showLessNews"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-minus" class="w-4 h-4" />
            {{ t('actualites.sections.showLess') }}
          </button>
        </div>
      </section>

      <!-- Section 3: Upcoming Events -->
      <section v-if="upcomingEvents.length > 0" class="mb-16">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ t('actualites.sections.upcomingEvents') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
            </span>
          </h2>
          <NuxtLink
            :to="localePath('/actualites/evenements')"
            class="text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium flex items-center gap-1"
          >
            {{ t('actualites.sections.viewAllEvents') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink
            v-for="event in upcomingEvents"
            :key="event.id"
            :to="localePath(`/actualites/evenements/${event.slug}`)"
            class="group relative overflow-hidden rounded-xl h-72 block"
          >
            <!-- Background image -->
            <img
              :src="getCoverImageUrl(event, 'low')"
              :alt="getEventTitle(event)"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            >

            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            <!-- Content -->
            <div class="absolute inset-0 p-5 flex flex-col justify-end">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="inline-block px-2 py-0.5 text-xs font-semibold text-white rounded"
                  :class="typeColors[event.type]"
                >
                  {{ t(`actualites.events.types.${event.type}`) }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:underline">
                {{ getEventTitle(event) }}
              </h3>

              <div class="flex items-center gap-3 mt-2 text-sm text-gray-200">
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                  {{ formatShortDate(event.start_date) }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Section 4: Open Calls -->
      <section v-if="openCalls.length > 0">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ t('actualites.sections.openCalls') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
            </span>
          </h2>
          <NuxtLink
            :to="localePath('/actualites/appels')"
            class="text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium flex items-center gap-1"
          >
            {{ t('actualites.sections.viewAllCalls') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="call in openCalls"
            :key="call.id"
            :to="localePath(`/actualites/appels/${call.slug}`)"
            class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 block"
          >
            <!-- Image -->
            <div class="overflow-hidden h-48">
              <img
                :src="`https://picsum.photos/seed/${call.slug}/800/400`"
                :alt="call.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <!-- Content -->
            <div class="p-5">
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-block px-2 py-0.5 text-xs font-medium text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded">
                  {{ getCallTypeLabel(call.type) }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                {{ call.title }}
              </h3>

              <p v-if="call.description" class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ call.description }}
              </p>

              <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div v-if="call.deadline" class="text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('actualites.calls.deadline') }}:</span>
                  <span class="ml-1 font-semibold text-red-600 dark:text-red-400">{{ formatShortDate(call.deadline) }}</span>
                </div>

                <span class="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-blue-600 text-white text-sm font-medium rounded-lg">
                  {{ t('actualites.readMore') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
