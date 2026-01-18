<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { getCampusCalls, getCampusFormationsRealisees, getCampusClosedCalls, getCampusRecruitments, getCampusEvents, getCampusNews, getCampusTeam, partenaires } = useMockData()

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

const calls = computed(() => getCampusCalls(props.campusId))
const formationsRealisees = computed(() => getCampusFormationsRealisees(props.campusId))
const closedCalls = computed(() => getCampusClosedCalls(props.campusId))
const recruitments = computed(() => getCampusRecruitments(props.campusId))

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
const allEvents = computed(() => getCampusEvents(props.campusId))
const allNews = computed(() => getCampusNews(props.campusId))

// Get upcoming events (future) or recent events if no future ones
const sidebarEvents = computed(() => {
  const now = new Date()
  const upcoming = allEvents.value
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  if (upcoming.length > 0) return upcoming

  // Fallback: show most recent past events
  return allEvents.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
})

// Check if showing upcoming or past events
const hasUpcomingEvents = computed(() => {
  const now = new Date()
  return allEvents.value.some(e => new Date(e.date) >= now)
})

// Get recent news (limit to 4)
const sidebarNews = computed(() => {
  return allNews.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
})

// Get campus partners (limit to 6 for sidebar)
const sidebarPartners = computed(() => {
  return partenaires.value.slice(0, 6)
})

// Get campus team (limit to 4 for sidebar)
const sidebarTeam = computed(() => {
  return getCampusTeam(props.campusId).slice(0, 4)
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
const getLocalizedEventTitle = (event: CampusEvent) => {
  if (locale.value === 'en' && event.title_en) return event.title_en
  if (locale.value === 'ar' && event.title_ar) return event.title_ar
  return event.title_fr
}

const getLocalizedNewsTitle = (news: CampusNews) => {
  if (locale.value === 'en' && news.title_en) return news.title_en
  if (locale.value === 'ar' && news.title_ar) return news.title_ar
  return news.title_fr
}

const getLocalizedPartnerName = (partner: Partenaire) => {
  if (locale.value === 'en' && partner.name_en) return partner.name_en
  if (locale.value === 'ar' && partner.name_ar) return partner.name_ar
  return partner.name_fr
}

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )
}
</script>

<template>
  <div class="py-8">
    <!-- Empty state when no data at all -->
    <div v-if="!hasAnyData" class="text-center py-16">
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
              <div v-if="event.image" class="w-2/5 flex-shrink-0">
                <div class="overflow-hidden rounded-lg">
                  <img
                    :src="event.image"
                    :alt="getLocalizedEventTitle(event)"
                    class="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>
              </div>
              <!-- Content -->
              <div class="flex-1 flex flex-col justify-center">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  {{ getLocalizedEventTitle(event) }}
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-flex items-center gap-1">
                  <font-awesome-icon icon="fa-regular fa-calendar" class="w-3 h-3" />
                  {{ formatDate(event.date) }}
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
              <div v-if="news.image" class="w-2/5 flex-shrink-0">
                <div class="overflow-hidden rounded-lg">
                  <img
                    :src="news.image"
                    :alt="getLocalizedNewsTitle(news)"
                    class="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>
              </div>
              <!-- Content -->
              <div class="flex-1 flex flex-col justify-center">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  <a v-if="news.url" :href="news.url">
                    {{ getLocalizedNewsTitle(news) }}
                  </a>
                  <span v-else>{{ getLocalizedNewsTitle(news) }}</span>
                </h4>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ formatDate(news.date) }}
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
              :title="getLocalizedPartnerName(partner)"
              class="group flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-blue-400 dark:hover:border-brand-blue-500 transition-colors"
            >
              <img
                :src="partner.logo"
                :alt="getLocalizedPartnerName(partner)"
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
                :src="member.photo"
                :alt="member.name"
                class="w-10 h-10 rounded-full object-cover"
                loading="lazy"
              >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ member.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ member.role_fr }}
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
