<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { getCampusCalls, getCampusFormationsRealisees, getCampusClosedCalls, getCampusRecruitments, getCampusEvents, getCampusNews } = useMockData()

// Active filter
type FilterType = 'all' | 'calls' | 'formations' | 'closed' | 'recruitments'
const activeFilter = ref<FilterType>('all')

// Filter options with counts
const filters = computed(() => [
  { id: 'all' as FilterType, label: t('partners.campus.calls.filters.all'), icon: 'fa-solid fa-layer-group' },
  { id: 'calls' as FilterType, label: t('partners.campus.calls.filters.calls'), icon: 'fa-solid fa-bullhorn', count: calls.value.length },
  { id: 'formations' as FilterType, label: t('partners.campus.calls.filters.formations'), icon: 'fa-solid fa-graduation-cap', count: formationsRealisees.value.length },
  { id: 'closed' as FilterType, label: t('partners.campus.calls.filters.closed'), icon: 'fa-solid fa-folder-closed', count: closedCalls.value.length },
  { id: 'recruitments' as FilterType, label: t('partners.campus.calls.filters.recruitments'), icon: 'fa-solid fa-user-plus', count: recruitments.value.length }
])

const calls = computed(() => {
  return getCampusCalls(props.campusId)
})

const formationsRealisees = computed(() => {
  return getCampusFormationsRealisees(props.campusId)
})

const closedCalls = computed(() => {
  return getCampusClosedCalls(props.campusId)
})

const recruitments = computed(() => {
  return getCampusRecruitments(props.campusId)
})

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

// Check if section should be visible
const showSection = (section: FilterType) => {
  return activeFilter.value === 'all' || activeFilter.value === section
}

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
    <!-- Filters -->
    <div class="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-700 mb-8">
      <button
        v-for="filter in filters"
        :key="filter.id"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
        :class="[
          activeFilter === filter.id
            ? 'bg-amber-500 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        ]"
        @click="activeFilter = filter.id"
      >
        <font-awesome-icon :icon="filter.icon" class="w-4 h-4" />
        <span>{{ filter.label }}</span>
        <span
          v-if="filter.count !== undefined"
          class="px-2 py-0.5 text-xs rounded-full"
          :class="[
            activeFilter === filter.id
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          ]"
        >
          {{ filter.count }}
        </span>
      </button>
    </div>

    <!-- Two-column layout -->
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Main content -->
      <div class="flex-1 space-y-16">
        <!-- Section 1: Appels en cours -->
        <section v-if="showSection('calls')">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.calls.title') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="calls.length > 0" class="flex flex-col gap-6">
            <CardsCardCall
              v-for="call in calls"
              :key="call.id"
              :call="call"
            />
          </div>

          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noCalls') }}</p>
          </div>
        </section>

        <!-- Section 2: Formations réalisées -->
        <section v-if="showSection('formations')">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.formations.title') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="formationsRealisees.length > 0" class="flex flex-col gap-6">
            <CardsCardFormationRealisee
              v-for="formation in formationsRealisees"
              :key="formation.id"
              :formation="formation"
            />
          </div>

          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.formations.noFormations') }}</p>
          </div>
        </section>

        <!-- Section 3: Appels clos -->
        <section v-if="showSection('closed')">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.calls.closedTitle') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-gray-500 to-gray-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="closedCalls.length > 0" class="flex flex-col gap-6">
            <CardsCardCall
              v-for="call in closedCalls"
              :key="call.id"
              :call="call"
            />
          </div>

          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-folder-closed" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.calls.noClosedCalls') }}</p>
          </div>
        </section>

        <!-- Section 4: Recrutements -->
        <section v-if="showSection('recruitments')">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            <span class="relative inline-block">
              {{ t('partners.campus.calls.recruitmentsTitle') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full"></span>
            </span>
          </h2>

          <div v-if="recruitments.length > 0" class="flex flex-col gap-6">
            <CardsCardCall
              v-for="recruitment in recruitments"
              :key="recruitment.id"
              :call="recruitment"
            />
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
            <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-5 h-5 text-amber-500" />
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
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
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
              class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
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
            <font-awesome-icon icon="fa-solid fa-newspaper" class="w-5 h-5 text-amber-500" />
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
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
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
              class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              {{ t('partners.campus.calls.sidebar.viewAllNews') }}
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
            </a>
          </div>

          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('partners.campus.noNews') }}
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
