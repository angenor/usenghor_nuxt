<script setup lang="ts">
import type { NewsDisplay } from '~/types/news'
import type { ApplicationCallPublic, CallType } from '~/types/api'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getAllPublishedNews } = usePublicNewsApi()

// Extraire le texte brut d'un contenu EditorJS
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: { type: string; data: { text?: string } }) => {
          if (block.data?.text) {
            // Supprimer les balises HTML éventuelles
            return block.data.text.replace(/<[^>]*>/g, '')
          }
          return ''
        })
        .filter(Boolean)
        .join(' ')
    }
  } catch {
    // Si ce n'est pas du JSON valide, retourner tel quel
    return content
  }
  return content
}
const { getUpcomingEvents: getApiUpcomingEvents } = usePublicEventsApi()
const { listOngoingCalls } = usePublicCallsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(item: NewsDisplay | any, variant: 'low' | 'medium' | 'original' = 'medium'): string | null {
  if (item.cover_image_external_id) {
    const originalUrl = getMediaUrl(item.cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : null
  }
  return item.cover_image || null
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

// Charger les actualités, événements et appels depuis l'API
onMounted(async () => {
  try {
    const [news, events, calls] = await Promise.all([
      getAllPublishedNews(),
      getApiUpcomingEvents(4),
      listOngoingCalls(),
    ])
    allNews.value = news
    upcomingEventsData.value = events
    openCallsData.value = calls.slice(0, 3)
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
  return item.sector_name || item.service_names?.length || item.project_name
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
      <!-- Section 1: Featured + Side news -->
      <section class="mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          <span class="relative inline-block">
            {{ t('actualites.sections.featured') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>

        <div>
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
                    v-if="getCoverImageUrl(featuredNews, 'medium')"
                    :src="getCoverImageUrl(featuredNews, 'medium')!"
                    :alt="getLocalizedTitle(featuredNews)"
                    class="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                  <div v-else class="w-full h-64 md:h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
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
                      v-if="featuredNews.service_names?.length"
                      class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
                    >
                      <font-awesome-icon icon="fa-solid fa-cogs" class="w-2.5 h-2.5" />
                      {{ featuredNews.service_names?.join(', ') }}
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
                      v-if="getCoverImageUrl(item, 'medium')"
                      :src="getCoverImageUrl(item, 'medium')!"
                      :alt="getLocalizedTitle(item)"
                      class="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    >
                    <div v-else class="w-full h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
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
                      v-if="item.service_names?.length"
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
                    >
                      {{ item.service_names?.join(', ') }}
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
                v-if="getCoverImageUrl(item, 'low')"
                :src="getCoverImageUrl(item, 'low')!"
                :alt="getLocalizedTitle(item)"
                class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
              <div v-else class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
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
                  v-if="item.service_names?.length"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full"
                >
                  {{ item.service_names?.join(', ') }}
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

    </div>

    <!-- Section 3: Upcoming Events (fond bleu) -->
    <section v-if="upcomingEvents.length > 0" class="bg-brand-blue-50 dark:bg-brand-blue-950/30 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              v-if="getCoverImageUrl(event, 'low')"
              :src="getCoverImageUrl(event, 'low')!"
              :alt="getEventTitle(event)"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            >
            <div v-else class="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-calendar" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>

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
      </div>
    </section>

    <!-- Section 4: Open Calls (fond blanc) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                v-if="getCoverImageUrl(call)"
                :src="getCoverImageUrl(call)!"
                :alt="call.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
              <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
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
                {{ extractPlainText(call.description) }}
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
