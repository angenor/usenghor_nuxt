<script setup lang="ts">
import type { ProgramPublic } from '~/composables/usePublicProgramsApi'
import type { EventPublic } from '~/composables/usePublicEventsApi'
import type { ApplicationCallPublic, CallType } from '~/types/api'
import type { NewsDisplay } from '~/types/news'

interface Props {
  campusId: string
  activeTab: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { getCampusPrograms } = usePublicCampusApi()
const { listPublishedEvents } = usePublicEventsApi()
const { listPublishedNews } = usePublicNewsApi()
const { listPublicCalls } = useApplicationCallsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

const MAX_ITEMS = 3

// Data fetching (client-side only)
const { data: programs } = useLazyAsyncData(
  `sidebar-programs-${props.campusId}`,
  () => getCampusPrograms(props.campusId),
  { server: false, default: () => [] as ProgramPublic[] }
)

const { data: callsResponse } = useLazyAsyncData(
  `sidebar-calls-${props.campusId}`,
  () => listPublicCalls({
    campus_external_id: props.campusId,
    call_status: 'ongoing',
    limit: MAX_ITEMS,
  }),
  { server: false }
)

const { data: eventsResponse } = useLazyAsyncData(
  `sidebar-events-${props.campusId}`,
  () => listPublishedEvents({
    campus_id: props.campusId,
    limit: MAX_ITEMS,
    upcoming: true,
  }),
  { server: false }
)

const { data: newsResponse } = useLazyAsyncData(
  `sidebar-news-${props.campusId}`,
  () => listPublishedNews({
    campus_id: props.campusId,
    limit: MAX_ITEMS,
  }),
  { server: false }
)

// Computed data
const sidebarPrograms = computed(() => (programs.value || []).slice(0, MAX_ITEMS))
const sidebarCalls = computed(() => (callsResponse.value?.items || []).slice(0, MAX_ITEMS))
const sidebarEvents = computed(() => (eventsResponse.value?.items || []).slice(0, MAX_ITEMS))
const sidebarNews = computed(() => (newsResponse.value?.items || []).slice(0, MAX_ITEMS))

// Visibility (masquer la section de l'onglet actif + si pas de données)
const showFormations = computed(() => props.activeTab !== 'formations' && sidebarPrograms.value.length > 0)
const showCalls = computed(() => props.activeTab !== 'calls' && sidebarCalls.value.length > 0)
const showEvents = computed(() => props.activeTab !== 'events' && sidebarEvents.value.length > 0)
const showNews = computed(() => props.activeTab !== 'news' && sidebarNews.value.length > 0)

const hasAnything = computed(() => showFormations.value || showCalls.value || showEvents.value || showNews.value)

// Helpers
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' },
  )
}

const getCoverImageUrl = (item: { cover_image_external_id?: string | null; cover_image?: string | null }): string | null => {
  if (item.cover_image_external_id) {
    const originalUrl = getMediaUrl(item.cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, 'low') : null
  }
  return (item as any).cover_image || null
}

// Mapping type programme
const programTypeColors: Record<string, string> = {
  master: 'bg-brand-blue-600',
  doctorate: 'bg-purple-600',
  university_diploma: 'bg-brand-red-600',
  certificate: 'bg-green-600',
}

const programTypeLabels: Record<string, string> = {
  master: 'Master',
  doctorate: 'Doctorat',
  university_diploma: 'DU',
  certificate: 'Certificat',
}

// Mapping type appel
const callTypeLabels: Record<CallType, string> = {
  application: 'candidature',
  scholarship: 'bourse',
  project: 'projet',
  recruitment: 'recrutement',
  training: 'formation',
}

// Couleurs événements
const eventTypeColors: Record<string, string> = {
  conference: 'bg-brand-red-600',
  workshop: 'bg-brand-blue-600',
  ceremony: 'bg-brand-blue-500',
  seminar: 'bg-purple-600',
  symposium: 'bg-green-600',
  other: 'bg-gray-600',
}
</script>

<template>
  <aside v-if="hasAnything" class="space-y-6">
    <!-- Formations -->
    <div v-if="showFormations" class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-graduation-cap" class="text-brand-blue-500" />
        {{ t('partners.campus.sidebar.formations') }}
      </h3>

      <div class="space-y-3">
        <a
          v-for="program in sidebarPrograms"
          :key="program.id"
          href="#formations"
          class="group flex gap-3"
        >
          <!-- Image -->
          <div class="flex-shrink-0 w-14 h-14 overflow-hidden rounded-lg">
            <img
              v-if="getCoverImageUrl(program)"
              :src="getCoverImageUrl(program)!"
              :alt="program.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
              :class="programTypeColors[program.type] || 'bg-gray-600'"
            >
              <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-white/80" />
            </div>
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <span
              class="inline-block px-1.5 py-0.5 text-xs font-medium text-white rounded mb-1"
              :class="programTypeColors[program.type] || 'bg-gray-600'"
            >
              {{ programTypeLabels[program.type] || program.type }}
            </span>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
              {{ program.title }}
            </h4>
            <p v-if="program.duration_months" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ program.duration_months }} mois
            </p>
          </div>
        </a>
      </div>

      <a
        href="#formations"
        class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
      >
        {{ t('partners.campus.sidebar.viewAllFormations') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
      </a>
    </div>

    <!-- Appels en cours -->
    <div v-if="showCalls" class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-brand-blue-500" />
        {{ t('partners.campus.sidebar.ongoingCalls') }}
      </h3>

      <div class="space-y-3">
        <a
          v-for="call in sidebarCalls"
          :key="call.id"
          href="#calls"
          class="group block"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-block px-1.5 py-0.5 text-xs font-medium text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded">
              {{ t(`partners.campus.calls.types.${callTypeLabels[call.type]}`) }}
            </span>
          </div>
          <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
            {{ call.title }}
          </h4>
          <div v-if="call.deadline" class="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3 text-red-500" />
            <span class="text-red-500 dark:text-red-400 font-medium">
              {{ formatDate(call.deadline) }}
            </span>
          </div>
        </a>
      </div>

      <a
        href="#calls"
        class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
      >
        {{ t('partners.campus.sidebar.viewAllCalls') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
      </a>
    </div>

    <!-- Événements à venir -->
    <div v-if="showEvents" class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-calendar" class="text-brand-blue-500" />
        {{ t('partners.campus.sidebar.upcomingEvents') }}
      </h3>

      <div class="space-y-4">
        <a
          v-for="event in sidebarEvents"
          :key="event.id"
          href="#events"
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

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <span
                class="inline-block px-1.5 py-0.5 text-xs font-medium text-white rounded mb-1"
                :class="eventTypeColors[event.type] || 'bg-gray-600'"
              >
                {{ t(`actualites.events.types.${event.type}`) }}
              </span>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                {{ event.title }}
              </h4>
            </div>
          </div>
        </a>
      </div>

      <a
        href="#events"
        class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
      >
        {{ t('partners.campus.sidebar.viewAllEvents') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
      </a>
    </div>

    <!-- Actualités récentes -->
    <div v-if="showNews" class="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm">
      <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-newspaper" class="text-brand-blue-500" />
        {{ t('partners.campus.sidebar.recentNews') }}
      </h3>

      <div class="space-y-4">
        <a
          v-for="news in sidebarNews"
          :key="news.id"
          href="#news"
          class="group flex gap-3"
        >
          <!-- Miniature -->
          <div class="flex-shrink-0 w-14 h-14 overflow-hidden rounded-lg">
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
              <font-awesome-icon icon="fa-solid fa-newspaper" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
              {{ news.title }}
            </h4>
            <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(news.published_at) }}</span>
            </div>
          </div>
        </a>
      </div>

      <a
        href="#news"
        class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
      >
        {{ t('partners.campus.sidebar.viewAllNews') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
      </a>
    </div>
  </aside>
</template>
