<script setup lang="ts">
import type { ApplicationCallPublic } from '~/types/api'
import type { CampusPartnerPublic, CampusTeamMemberPublic } from '~/composables/usePublicCampusApi'
import type { EventPublic } from '~/composables/usePublicEventsApi'
import type { NewsDisplay } from '~/types/news'

interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { listPublicCalls } = useApplicationCallsApi()
const { getCampusPartners, getCampusTeam: fetchCampusTeam, getPartnerLogoUrl, getTeamMemberPhotoUrl, getTeamMemberFullName } = usePublicCampusApi()
const { listPublishedEvents } = usePublicEventsApi()
const { listPublishedNews } = usePublicNewsApi()

// Fetch calls from API using useLazyAsyncData to avoid SSR issues with v-if
const { data: callsResponse, pending: loading } = useLazyAsyncData(
  `campus-calls-${props.campusId}`,
  () => listPublicCalls({ campus_external_id: props.campusId, limit: 100 })
)

const allCalls = computed(() => callsResponse.value?.items || [])

// Fetch sidebar data from real API
const { data: eventsResponse } = useLazyAsyncData(
  `campus-events-${props.campusId}`,
  () => listPublishedEvents({ campus_id: props.campusId, limit: 10 })
)

const { data: newsResponse } = useLazyAsyncData(
  `campus-news-${props.campusId}`,
  () => listPublishedNews({ campus_id: props.campusId, limit: 10 })
)

const { data: partnersData } = useLazyAsyncData(
  `campus-partners-${props.campusId}`,
  () => getCampusPartners(props.campusId)
)

const { data: teamData } = useLazyAsyncData(
  `campus-team-${props.campusId}`,
  () => fetchCampusTeam(props.campusId)
)

// Active filter
type FilterType = 'all' | 'calls' | 'formations' | 'closed' | 'recruitments'
const activeFilter = ref<FilterType>('all')

// Expanded sections state (default: collapsed, showing only 3 items)
const ITEMS_LIMIT = 3
const expandedSections = ref<Record<string, boolean>>({
  calls: false,
  formations: false,
  closed: false,
  recruitments: false
})

const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

// Filter options with counts (only show filters with data)
const allFilters = [
  { id: 'all' as FilterType, label: () => t('partners.campus.calls.filters.all'), icon: 'fa-solid fa-layer-group' },
  { id: 'calls' as FilterType, label: () => t('partners.campus.calls.filters.calls'), icon: 'fa-solid fa-bullhorn', count: () => calls.value.length },
  { id: 'formations' as FilterType, label: () => t('partners.campus.calls.filters.formations'), icon: 'fa-solid fa-graduation-cap', count: () => formationsRealisees.value.length },
  { id: 'closed' as FilterType, label: () => t('partners.campus.calls.filters.closed'), icon: 'fa-solid fa-folder-closed', count: () => closedCalls.value.length },
  { id: 'recruitments' as FilterType, label: () => t('partners.campus.calls.filters.recruitments'), icon: 'fa-solid fa-user-plus', count: () => recruitments.value.length }
]

// Only show filters that have data (except 'all' which is always shown)
const filters = computed(() => {
  return allFilters.filter(f => f.id === 'all' || (f.count && f.count() > 0))
})

// Appels en cours (ongoing/upcoming, hors recrutements et formations)
const calls = computed(() => allCalls.value.filter(c =>
  (c.status === 'ongoing' || c.status === 'upcoming') &&
  c.type !== 'recruitment' &&
  c.type !== 'training'
))

// Formations réalisées (type training, status closed)
const formationsRealisees = computed(() => allCalls.value.filter(c =>
  c.type === 'training' && c.status === 'closed'
))

// Appels clos (tous les types sauf training et recruitment)
const closedCalls = computed(() => allCalls.value.filter(c =>
  c.status === 'closed' &&
  c.type !== 'recruitment' &&
  c.type !== 'training'
))

// Recrutements (type recruitment, ongoing/upcoming)
const recruitments = computed(() => allCalls.value.filter(c =>
  c.type === 'recruitment' &&
  (c.status === 'ongoing' || c.status === 'upcoming')
))

// Displayed items (limited or full based on expanded state)
const displayedCalls = computed(() =>
  expandedSections.value.calls ? calls.value : calls.value.slice(0, ITEMS_LIMIT)
)
const displayedFormations = computed(() =>
  expandedSections.value.formations ? formationsRealisees.value : formationsRealisees.value.slice(0, ITEMS_LIMIT)
)
const displayedClosedCalls = computed(() =>
  expandedSections.value.closed ? closedCalls.value : closedCalls.value.slice(0, ITEMS_LIMIT)
)
const displayedRecruitments = computed(() =>
  expandedSections.value.recruitments ? recruitments.value : recruitments.value.slice(0, ITEMS_LIMIT)
)

// === SIDEBAR DATA ===
const allEvents = computed<EventPublic[]>(() => eventsResponse.value?.items || [])
const allNews = computed<NewsDisplay[]>(() => newsResponse.value?.items || [])

// Get upcoming events (future) or recent events if no future ones
const sidebarEvents = computed(() => {
  const now = new Date()
  const upcoming = allEvents.value
    .filter(e => new Date(e.start_date) >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 3)

  if (upcoming.length > 0) return upcoming

  // Fallback: show most recent past events
  return allEvents.value
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
    .slice(0, 3)
})

// Check if showing upcoming or past events
const hasUpcomingEvents = computed(() => {
  const now = new Date()
  return allEvents.value.some(e => new Date(e.start_date) >= now)
})

// Get recent news (limit to 4)
const sidebarNews = computed(() => {
  return allNews.value
    .sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime())
    .slice(0, 4)
})

// Get campus partners (limit to 6 for sidebar)
const sidebarPartners = computed<CampusPartnerPublic[]>(() => {
  return (partnersData.value || []).slice(0, 6)
})

// Get campus team (limit to 4 for sidebar)
const sidebarTeam = computed<CampusTeamMemberPublic[]>(() => {
  return (teamData.value || []).slice(0, 4)
})

// Check if section should be visible (hide empty sections in 'all' mode)
const showSection = (section: FilterType, hasData: boolean) => {
  if (activeFilter.value === section) return true
  if (activeFilter.value === 'all' && hasData) return true
  return false
}

// Check if there's any data at all
const hasAnyData = computed(() => {
  return calls.value.length > 0 || formationsRealisees.value.length > 0 || closedCalls.value.length > 0 || recruitments.value.length > 0
})

// Localized getters
const getEventTitle = (event: EventPublic) => {
  return event.title
}

const getNewsTitle = (news: NewsDisplay) => {
  return news.title
}

const getPartnerName = (partner: CampusPartnerPublic) => {
  return partner.name
}

// Format date
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
}
</script>

<template>
  <div class="py-8">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue-500 border-t-transparent"></div>
    </div>

    <!-- Empty state when no data at all -->
    <div v-else-if="!hasAnyData" class="text-center py-16">
      <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-6" />
      <p class="text-xl text-gray-500 dark:text-gray-400">{{ t('partners.campus.noCalls') }}</p>
    </div>

    <!-- Content when data exists -->
    <template v-else>
      <!-- Filters -->
      <div class="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
        <button
          v-for="filter in filters"
          :key="filter.id"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
          :class="[
            activeFilter === filter.id
              ? 'bg-brand-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          ]"
          @click="activeFilter = filter.id"
        >
          <font-awesome-icon :icon="filter.icon" class="w-4 h-4" />
          <span>{{ filter.label() }}</span>
          <span
            v-if="filter.count"
            class="px-2 py-0.5 text-xs rounded-full"
            :class="[
              activeFilter === filter.id
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            ]"
          >
            {{ filter.count() }}
          </span>
        </button>
      </div>

      <!-- Two-column layout -->
      <div class="flex flex-col lg:flex-row gap-8">
      <!-- Main content -->
      <div class="flex-1 space-y-16">
        <!-- Section 1: Appels en cours -->
        <section v-if="showSection('calls', calls.length > 0)">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.calls.title') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="calls.length > 0">
            <div class="flex flex-col gap-6">
              <CardsCardCall
                v-for="call in displayedCalls"
                :key="call.id"
                :call="call"
              />
            </div>

            <!-- Show more/less button -->
            <button
              v-if="calls.length > ITEMS_LIMIT"
              class="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
              @click="toggleSection('calls')"
            >
              <font-awesome-icon
                :icon="expandedSections.calls ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                class="w-4 h-4"
              />
              {{ expandedSections.calls ? t('partners.campus.calls.showLess') : t('partners.campus.calls.showMore') }}
              <span class="text-gray-500 dark:text-gray-400">({{ calls.length - ITEMS_LIMIT }})</span>
            </button>
          </div>

          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noCalls') }}</p>
          </div>
        </section>

        <!-- Section 2: Formations réalisées -->
        <section v-if="showSection('formations', formationsRealisees.length > 0)">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.formations.title') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="formationsRealisees.length > 0">
            <div class="flex flex-col gap-6">
              <CardsCardFormationRealisee
                v-for="formation in displayedFormations"
                :key="formation.id"
                :formation="formation"
              />
            </div>

            <!-- Show more/less button -->
            <button
              v-if="formationsRealisees.length > ITEMS_LIMIT"
              class="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
              @click="toggleSection('formations')"
            >
              <font-awesome-icon
                :icon="expandedSections.formations ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                class="w-4 h-4"
              />
              {{ expandedSections.formations ? t('partners.campus.calls.showLess') : t('partners.campus.calls.showMore') }}
              <span class="text-gray-500 dark:text-gray-400">({{ formationsRealisees.length - ITEMS_LIMIT }})</span>
            </button>
          </div>

          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.formations.noFormations') }}</p>
          </div>
        </section>

        <!-- Section 3: Appels clos -->
        <section v-if="showSection('closed', closedCalls.length > 0)">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.calls.closedTitle') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-gray-500 to-gray-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="closedCalls.length > 0">
            <div class="flex flex-col gap-6">
              <CardsCardCall
                v-for="call in displayedClosedCalls"
                :key="call.id"
                :call="call"
              />
            </div>

            <!-- Show more/less button -->
            <button
              v-if="closedCalls.length > ITEMS_LIMIT"
              class="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
              @click="toggleSection('closed')"
            >
              <font-awesome-icon
                :icon="expandedSections.closed ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                class="w-4 h-4"
              />
              {{ expandedSections.closed ? t('partners.campus.calls.showLess') : t('partners.campus.calls.showMore') }}
              <span class="text-gray-500 dark:text-gray-400">({{ closedCalls.length - ITEMS_LIMIT }})</span>
            </button>
          </div>

          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-folder-closed" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.calls.noClosedCalls') }}</p>
          </div>
        </section>

        <!-- Section 4: Recrutements -->
        <section v-if="showSection('recruitments', recruitments.length > 0)">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.calls.recruitmentsTitle') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="recruitments.length > 0">
            <div class="flex flex-col gap-6">
              <CardsCardCall
                v-for="recruitment in displayedRecruitments"
                :key="recruitment.id"
                :call="recruitment"
              />
            </div>

            <!-- Show more/less button -->
            <button
              v-if="recruitments.length > ITEMS_LIMIT"
              class="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
              @click="toggleSection('recruitments')"
            >
              <font-awesome-icon
                :icon="expandedSections.recruitments ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                class="w-4 h-4"
              />
              {{ expandedSections.recruitments ? t('partners.campus.calls.showLess') : t('partners.campus.calls.showMore') }}
              <span class="text-gray-500 dark:text-gray-400">({{ recruitments.length - ITEMS_LIMIT }})</span>
            </button>
          </div>

          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-user-plus" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.calls.noRecruitments') }}</p>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="lg:w-80 xl:w-96 shrink-0">
        <!-- Events Section -->
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-5 h-5 text-brand-red-500" />
            {{ hasUpcomingEvents ? t('partners.campus.calls.sidebar.upcomingEvents') : t('partners.campus.calls.sidebar.recentEvents') }}
          </h3>

          <div v-if="sidebarEvents.length > 0">
            <article
              v-for="(event, index) in sidebarEvents"
              :key="event.id"
              class="group flex gap-4 py-4"
              :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
            >
              <!-- Thumbnail -->
              <div v-if="event.cover_image" class="w-2/5 flex-shrink-0">
                <div class="overflow-hidden rounded-lg">
                  <img
                    :src="event.cover_image"
                    :alt="getEventTitle(event)"
                    class="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>
              </div>
              <!-- Content -->
              <div class="flex-1 flex flex-col justify-center">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  <NuxtLink v-if="event.slug" :to="`/evenements/${event.slug}`">
                    {{ getEventTitle(event) }}
                  </NuxtLink>
                  <span v-else>{{ getEventTitle(event) }}</span>
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-flex items-center gap-1">
                  <font-awesome-icon icon="fa-regular fa-calendar" class="w-3 h-3" />
                  {{ formatDate(event.start_date) }}
                </span>
              </div>
            </article>

            <!-- View all events link -->
            <a
              href="#events"
              class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
            >
              {{ t('partners.campus.calls.sidebar.viewAllEvents') }}
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
            </a>
          </div>

          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('partners.campus.noEvents') }}
          </p>
        </div>

        <!-- Separator -->
        <hr class="border-gray-200 dark:border-gray-700 my-6">

        <!-- News Section -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-newspaper" class="w-5 h-5 text-brand-red-500" />
            {{ t('partners.campus.calls.sidebar.recentNews') }}
          </h3>

          <div v-if="sidebarNews.length > 0">
            <article
              v-for="(news, index) in sidebarNews"
              :key="news.id"
              class="group flex gap-4 py-4"
              :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
            >
              <!-- Thumbnail -->
              <div v-if="news.cover_image" class="w-2/5 flex-shrink-0">
                <div class="overflow-hidden rounded-lg">
                  <img
                    :src="news.cover_image"
                    :alt="getNewsTitle(news)"
                    class="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>
              </div>
              <!-- Content -->
              <div class="flex-1 flex flex-col justify-center">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  <NuxtLink v-if="news.slug" :to="`/actualites/${news.slug}`">
                    {{ getNewsTitle(news) }}
                  </NuxtLink>
                  <span v-else>{{ getNewsTitle(news) }}</span>
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ formatDate(news.published_at || news.created_at) }}
                </span>
              </div>
            </article>

            <!-- View all news link -->
            <a
              href="#news"
              class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
            >
              {{ t('partners.campus.calls.sidebar.viewAllNews') }}
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
            </a>
          </div>

          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('partners.campus.noNews') }}
          </p>
        </div>

        <!-- Separator -->
        <hr class="border-gray-200 dark:border-gray-700 my-6">

        <!-- Partners Section -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-handshake" class="w-5 h-5 text-brand-red-500" />
            {{ t('partners.campus.tabs.partners') }}
          </h3>

          <div v-if="sidebarPartners.length > 0" class="grid grid-cols-3 gap-3">
            <a
              v-for="partner in sidebarPartners"
              :key="partner.id"
              :href="partner.website || '#'"
              :title="getPartnerName(partner)"
              class="group flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-blue-400 dark:hover:border-brand-blue-500 transition-colors"
            >
              <img
                :src="getPartnerLogoUrl(partner)"
                :alt="getPartnerName(partner)"
                class="w-full h-12 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                loading="lazy"
              >
            </a>
          </div>

          <!-- View all partners link -->
          <a
            v-if="sidebarPartners.length > 0"
            href="#partners"
            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
          >
            {{ t('partners.campus.calls.sidebar.viewAllPartners') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
          </a>

          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('partners.campus.noPartners') }}
          </p>
        </div>

        <!-- Separator -->
        <hr class="border-gray-200 dark:border-gray-700 my-6">

        <!-- Team Section -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-users" class="w-5 h-5 text-brand-red-500" />
            {{ t('partners.campus.tabs.team') }}
          </h3>

          <div v-if="sidebarTeam.length > 0" class="space-y-3">
            <div
              v-for="member in sidebarTeam"
              :key="member.id"
              class="flex items-center gap-3"
            >
              <img
                :src="getTeamMemberPhotoUrl(member)"
                :alt="getTeamMemberFullName(member)"
                class="w-10 h-10 rounded-full object-cover"
                loading="lazy"
              >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ getTeamMemberFullName(member) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ member.position }}
                </p>
              </div>
            </div>
          </div>

          <!-- View all team link -->
          <a
            v-if="sidebarTeam.length > 0"
            href="#team"
            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
          >
            {{ t('partners.campus.calls.sidebar.viewAllTeam') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
          </a>

          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('partners.campus.noTeam') }}
          </p>
        </div>
      </aside>
      </div>
    </template>
  </div>
</template>
