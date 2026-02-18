<script setup lang="ts">
import type { ApplicationCallPublic, CallType } from '~/types/api'

interface Props {
  showEvents?: boolean
  showNews?: boolean
  showCalls?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  showEvents: true,
  showNews: true,
  showCalls: true,
  maxItems: 3
})

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getUpcomingEvents } = usePublicEventsApi()
const { getAllPublishedNews } = usePublicNewsApi()
const { listOngoingCalls } = usePublicCallsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

// Helper pour obtenir l'URL de l'image de couverture (utilise la variante low pour les miniatures)
function getCoverImageUrl(item: any): string | null {
  if (item.cover_image_external_id) {
    const originalUrl = getMediaUrl(item.cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, 'low') : null
  }
  return item.cover_image || null
}

// Mapping des types API vers les clés i18n
const typeToI18nKey: Record<CallType, string> = {
  application: 'candidature',
  scholarship: 'bourse',
  project: 'projet',
  recruitment: 'recrutement',
  training: 'formation',
}

// Data
const upcomingEventsData = ref<any[]>([])
const recentNewsData = ref<any[]>([])
const openCallsData = ref<ApplicationCallPublic[]>([])
const isLoading = ref(true)

// Load data
onMounted(async () => {
  try {
    const [events, news, calls] = await Promise.all([
      props.showEvents ? getUpcomingEvents(props.maxItems) : Promise.resolve([]),
      props.showNews ? getAllPublishedNews() : Promise.resolve([]),
      props.showCalls ? listOngoingCalls() : Promise.resolve([])
    ])
    upcomingEventsData.value = events
    recentNewsData.value = news.slice(0, props.maxItems)
    openCallsData.value = calls.slice(0, props.maxItems)
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  } finally {
    isLoading.value = false
  }
})

// Computed
const upcomingEvents = computed(() => upcomingEventsData.value)
const recentNews = computed(() => recentNewsData.value)
const openCalls = computed(() => openCallsData.value)

// Helpers
const getCallTypeLabel = (type: CallType) => {
  const key = typeToI18nKey[type]
  return t(`actualites.calls.filters.${key}`)
}

const formatDate = (dateStr: string | null) => {
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
</script>

<template>
  <aside class="space-y-8">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue-600 border-t-transparent"></div>
    </div>

    <template v-else>
      <!-- Upcoming Events -->
      <div v-if="showEvents && upcomingEvents.length > 0" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-calendar" class="text-brand-blue-500" />
          {{ t('actualites.sidebar.upcomingEvents') }}
        </h3>

        <div class="space-y-4">
          <NuxtLink
            v-for="event in upcomingEvents"
            :key="event.id"
            :to="localePath(`/actualites/evenements/${event.slug}`)"
            class="group block"
          >
            <div class="flex items-start gap-3">
              <!-- Date badge -->
              <div class="flex-shrink-0 w-12 text-center">
                <div class="bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded-lg py-1.5">
                  <div class="text-xs text-brand-blue-700 dark:text-brand-blue-400 font-medium">
                    {{ formatDate(event.start_date) }}
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <span
                  class="inline-block px-1.5 py-0.5 text-xs font-medium text-white rounded mb-1"
                  :class="typeColors[event.type] || 'bg-gray-600'"
                >
                  {{ t(`actualites.events.types.${event.type}`) }}
                </span>
                <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  {{ event.title }}
                </h4>
              </div>
            </div>
          </NuxtLink>
        </div>

        <NuxtLink
          :to="localePath('/actualites/evenements')"
          class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
        >
          {{ t('actualites.sections.viewAllEvents') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
        </NuxtLink>
      </div>

      <!-- Recent News -->
      <div v-if="showNews && recentNews.length > 0" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-newspaper" class="text-brand-blue-500" />
          {{ t('actualites.sidebar.recentNews') }}
        </h3>

        <div class="space-y-4">
          <NuxtLink
            v-for="news in recentNews"
            :key="news.id"
            :to="localePath(`/actualites/${news.slug}`)"
            class="group flex gap-3"
          >
            <!-- Thumbnail -->
            <div class="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
              <img
                v-if="getCoverImageUrl(news)"
                :src="getCoverImageUrl(news)!"
                :alt="news.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              >
              <div
                v-else
                class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
              >
                <font-awesome-icon icon="fa-solid fa-newspaper" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                {{ news.title }}
              </h4>
              <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{{ formatDate(news.published_at) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <NuxtLink
          :to="localePath('/actualites')"
          class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
        >
          {{ t('actualites.sections.viewAllNews') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
        </NuxtLink>
      </div>

      <!-- Open Calls -->
      <div v-if="showCalls && openCalls.length > 0" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-brand-blue-500" />
          {{ t('actualites.sidebar.openCalls') }}
        </h3>

        <div class="space-y-4">
          <NuxtLink
            v-for="call in openCalls"
            :key="call.id"
            :to="localePath(`/actualites/appels/${call.slug}`)"
            class="group block"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="inline-block px-1.5 py-0.5 text-xs font-medium text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded">
                {{ getCallTypeLabel(call.type) }}
              </span>
            </div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
              {{ call.title }}
            </h4>
            <div v-if="call.deadline" class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span class="text-red-500 dark:text-red-400 font-medium">
                {{ t('actualites.calls.deadline') }}: {{ formatDate(call.deadline) }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <NuxtLink
          :to="localePath('/actualites/appels')"
          class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
        >
          {{ t('actualites.sections.viewAllCalls') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
        </NuxtLink>
      </div>
    </template>
  </aside>
</template>
