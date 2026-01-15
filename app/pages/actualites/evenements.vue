<script setup lang="ts">
import type { CampusEvent } from '~/composables/useMockData'

const { t, locale } = useI18n()
const { getUpcomingEvents, getPastEvents } = useMockData()

// SEO
useSeoMeta({
  title: () => `${t('actualites.events.title')} | ${t('actualites.seo.title')}`,
  description: () => t('actualites.events.subtitle')
})

// Filters
const selectedType = ref<'all' | CampusEvent['type']>('all')

// Get events
const upcomingEvents = computed(() => getUpcomingEvents())
const pastEvents = computed(() => getPastEvents())

// Filtered upcoming events
const filteredUpcoming = computed(() => {
  if (selectedType.value === 'all') return upcomingEvents.value
  return upcomingEvents.value.filter(e => e.type === selectedType.value)
})

// Filtered past events
const filteredPast = computed(() => {
  if (selectedType.value === 'all') return pastEvents.value
  return pastEvents.value.filter(e => e.type === selectedType.value)
})

// Featured events (first 4 upcoming)
const featuredEvents = computed(() => filteredUpcoming.value.slice(0, 4))

// Other upcoming events
const otherUpcomingEvents = computed(() => filteredUpcoming.value.slice(4))

// Show past events toggle
const showPastEvents = ref(false)

// Filter options
const typeFilters = [
  { value: 'all', label: 'actualites.events.filters.all' },
  { value: 'conference', label: 'actualites.events.filters.conference' },
  { value: 'atelier', label: 'actualites.events.filters.atelier' },
  { value: 'ceremonie', label: 'actualites.events.filters.ceremonie' },
  { value: 'autre', label: 'actualites.events.filters.autre' }
]

// Localization helpers
const getLocalizedTitle = (item: { title_fr: string; title_en?: string; title_ar?: string }) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

const getLocalizedLocation = (item: { location_fr: string; location_en?: string }) => {
  if (locale.value === 'en' && item.location_en) return item.location_en
  return item.location_fr
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}

// Event type colors
const typeColors: Record<string, string> = {
  conference: 'bg-red-600',
  atelier: 'bg-indigo-600',
  ceremonie: 'bg-amber-600',
  autre: 'bg-gray-600'
}
</script>

<template>
  <div>
    <!-- Hero -->
    <ActualitesHero
      :title="t('actualites.events.title')"
      :subtitle="t('actualites.events.subtitle')"
      :badge="t('actualites.hero.badge')"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Filters -->
      <div class="mb-10">
        <div class="inline-flex flex-wrap gap-2">
          <button
            v-for="filter in typeFilters"
            :key="filter.value"
            @click="selectedType = filter.value as any"
            class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            :class="selectedType === filter.value
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
          >
            {{ t(filter.label) }}
          </button>
        </div>
      </div>

      <!-- Featured Events Grid -->
      <section v-if="featuredEvents.length > 0" class="mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          <span class="relative inline-block">
            {{ t('actualites.events.featured') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article
            v-for="event in featuredEvents"
            :key="event.id"
            class="group relative overflow-hidden rounded-xl h-80"
          >
            <!-- Background image -->
            <img
              :src="event.image || 'https://picsum.photos/seed/default-event/600/400'"
              :alt="getLocalizedTitle(event)"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            >

            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/90"></div>

            <!-- Content -->
            <div class="absolute inset-0 p-5 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="inline-block px-2 py-0.5 text-xs font-semibold text-white rounded"
                  :class="typeColors[event.type]"
                >
                  {{ t(`actualites.events.types.${event.type}`) }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:underline">
                {{ getLocalizedTitle(event) }}
              </h3>

              <!-- Hidden on default, visible on hover -->
              <p class="mt-2 text-sm text-gray-200 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {{ event.description_fr }}
              </p>

              <div class="flex flex-col gap-1 mt-3 text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                  {{ formatDate(event.date) }}
                </span>
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                  {{ getLocalizedLocation(event) }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Other Upcoming Events + Sidebar -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main content -->
        <div class="lg:w-2/3">
          <!-- Upcoming events list -->
          <section v-if="otherUpcomingEvents.length > 0" class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('actualites.events.upcoming') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
              </span>
            </h2>

            <div class="space-y-6">
              <article
                v-for="event in otherUpcomingEvents"
                :key="event.id"
                class="group flex flex-col md:flex-row gap-4 pb-6 border-b border-gray-200 dark:border-gray-700"
              >
                <!-- Thumbnail -->
                <div class="md:w-1/4 overflow-hidden rounded-lg">
                  <img
                    :src="event.image || 'https://picsum.photos/seed/default-event/600/400'"
                    :alt="getLocalizedTitle(event)"
                    class="w-full h-40 md:h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>

                <!-- Content -->
                <div class="md:w-3/4">
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      class="inline-block px-2 py-0.5 text-xs font-semibold text-white rounded"
                      :class="typeColors[event.type]"
                    >
                      {{ t(`actualites.events.types.${event.type}`) }}
                    </span>
                  </div>

                  <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {{ getLocalizedTitle(event) }}
                  </h3>

                  <p class="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                    {{ event.description_fr }}
                  </p>

                  <div class="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                      {{ formatDate(event.date) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                      {{ getLocalizedLocation(event) }}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- No upcoming events -->
          <div v-else-if="filteredUpcoming.length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-12">
            <font-awesome-icon icon="fa-solid fa-calendar-alt" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p class="text-gray-500 dark:text-gray-400">{{ t('actualites.events.noEvents') }}</p>
          </div>

          <!-- Past Events (collapsible) -->
          <section v-if="filteredPast.length > 0">
            <button
              @click="showPastEvents = !showPastEvents"
              class="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-6 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <font-awesome-icon
                icon="fa-solid fa-chevron-right"
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-90': showPastEvents }"
              />
              {{ t('actualites.events.past') }}
              <span class="text-sm font-normal text-gray-500 dark:text-gray-400">({{ filteredPast.length }})</span>
            </button>

            <transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-[2000px]"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="opacity-100 max-h-[2000px]"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-show="showPastEvents" class="space-y-4 overflow-hidden">
                <article
                  v-for="event in filteredPast.slice(0, 6)"
                  :key="event.id"
                  class="group flex items-center gap-4 py-3 border-b border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <!-- Date badge -->
                  <div class="flex-shrink-0 w-16 text-center">
                    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg py-2">
                      <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {{ formatShortDate(event.date) }}
                      </div>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        class="inline-block px-1.5 py-0.5 text-xs font-medium text-white rounded"
                        :class="typeColors[event.type]"
                      >
                        {{ t(`actualites.events.types.${event.type}`) }}
                      </span>
                    </div>
                    <h4 class="text-base font-medium text-gray-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {{ getLocalizedTitle(event) }}
                    </h4>
                  </div>
                </article>
              </div>
            </transition>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="lg:w-1/3">
          <ActualitesSidebar :show-events="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-gradient {
  background-image: linear-gradient(
    to bottom,
    rgba(243, 244, 246, 0.1),
    rgba(0, 0, 0, 0.85)
  );
}
</style>
