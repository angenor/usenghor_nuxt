<script setup lang="ts">
import type { EventPublic } from '~/composables/usePublicEventsApi'

interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { listPublishedEvents } = usePublicEventsApi()

// Fetch events from API
const { data: eventsResponse, pending } = await useAsyncData(
  `campus-events-${props.campusId}`,
  () => listPublishedEvents({ campus_id: props.campusId, limit: 20 }),
  { server: true }
)

const events = computed(() => eventsResponse.value?.items || [])

// Featured events (first 4) - for the trending section
const featuredEvents = computed(() => events.value.slice(0, 4))

// Latest events (5th onwards) - for the list section
const latestEvents = computed(() => events.value.slice(4, 8))

// Next highlighted event (9th if exists)
const highlightedEvent = computed(() => events.value[8] || null)

// Get event URL
const getEventUrl = (event: EventPublic) => {
  return localePath(`/actualites/evenements/${event.slug}`)
}

// Get cover image URL
const getCoverImage = (event: EventPublic): string | null => {
  return event.cover_image || null
}

// Get location string
const getLocation = (event: EventPublic) => {
  const parts = []
  if (event.venue) parts.push(event.venue)
  if (event.city) parts.push(event.city)
  if (event.is_online) parts.push(t('partners.campus.events.online'))
  return parts.join(', ') || t('partners.campus.events.locationTBA')
}

// Format date
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Event type colors - mapping API types to colors
const typeColors: Record<string, string> = {
  conference: 'bg-red-600',
  workshop: 'bg-indigo-600',
  ceremony: 'bg-brand-blue-600',
  seminar: 'bg-purple-600',
  symposium: 'bg-green-600',
  other: 'bg-gray-600'
}

// Get type label
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    conference: 'conference',
    workshop: 'atelier',
    ceremony: 'ceremonie',
    seminar: 'seminaire',
    symposium: 'colloque',
    other: 'autre'
  }
  return t(`partners.campus.events.types.${typeMap[type] || 'autre'}`)
}
</script>

<template>
  <div class="py-8">
    <!-- Title -->
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
      <span class="relative inline-block">
        {{ t('partners.campus.events.title') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
      </span>
    </h2>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500"></div>
    </div>

    <div v-else-if="events.length > 0">
      <!-- Section 1: Trending/Featured Events (4 cards with hover effect) -->
      <div v-if="featuredEvents.length > 0" class="mb-10">
        <h3 class="border-b-2 border-brand-blue-600 mb-6">
          <span class="bg-brand-blue-600 px-3 py-1.5 text-white uppercase tracking-wide text-sm font-semibold">
            {{ t('partners.campus.events.featured') }}
          </span>
        </h3>

        <div class="flex flex-col flex-wrap md:flex-row md:-mx-2">
          <div
            v-for="event in featuredEvents"
            :key="event.id"
            class="w-full md:w-1/2 lg:w-1/4 mb-4 lg:mb-0"
          >
            <NuxtLink
              :to="getEventUrl(event)"
              class="h-72 md:h-96 block group relative md:mx-2 overflow-hidden rounded-xl"
            >
              <!-- Background Image -->
              <img
                v-if="getCoverImage(event)"
                :src="getCoverImage(event)!"
                :alt="event.title"
                class="absolute z-0 object-cover w-full h-72 md:h-96 transform transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              >
              <div v-else class="absolute z-0 w-full h-72 md:h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-calendar" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <!-- Gradient Overlay -->
              <div class="absolute event-gradient transition duration-300 group-hover:bg-black group-hover:opacity-90 w-full h-72 md:h-96 z-10"></div>

              <!-- Content -->
              <div class="absolute left-0 right-0 bottom-0 p-6 z-30 transform translate-y-1/2 transition duration-300 h-full group-hover:translate-y-0 delay-100">
                <div class="h-1/2 relative">
                  <div class="absolute bottom-0">
                    <!-- Event Type Badge -->
                    <span
                      class="inline-block px-2 py-1 text-xs font-semibold text-white rounded mb-3"
                      :class="typeColors[event.type] || 'bg-gray-600'"
                    >
                      {{ getTypeLabel(event.type) }}
                    </span>
                    <!-- Title -->
                    <h4 class="font-bold text-white leading-tight transition duration-300 text-lg md:text-xl pb-4 group-hover:underline">
                      {{ event.title }}
                    </h4>
                  </div>
                </div>
                <div class="h-1/2">
                  <!-- Description (hidden, shown on hover) -->
                  <p v-if="event.description" class="text-white text-sm pb-3 opacity-0 transition duration-300 group-hover:opacity-100 line-clamp-3">
                    {{ event.description }}
                  </p>
                  <!-- Date & Location -->
                  <div class="text-gray-200 text-sm opacity-0 transition duration-300 group-hover:opacity-100 flex items-center gap-2 mb-3">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                    <span>{{ formatDate(event.start_date) }}</span>
                  </div>
                  <div class="text-gray-200 text-sm opacity-0 transition duration-300 group-hover:opacity-100 flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                    <span>{{ getLocation(event) }}</span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Section 2: Latest Events (horizontal list) + Highlighted Event (sidebar) -->
      <div v-if="latestEvents.length > 0 || highlightedEvent" class="flex flex-col flex-wrap md:flex-row md:-mx-4 mt-8">
        <!-- Left: Latest Events List -->
        <div class="w-full" :class="highlightedEvent ? 'md:w-2/3' : 'md:w-full'">
          <div class="md:mx-4">
            <h3 class="border-b-2 border-red-600 mb-6">
              <span class="bg-red-600 px-3 py-1.5 text-white uppercase tracking-wide text-sm font-semibold">
                {{ t('partners.campus.events.upcoming') }}
              </span>
            </h3>

            <!-- Event items -->
            <div
              v-for="event in latestEvents"
              :key="event.id"
              class="flex flex-wrap items-center md:-mx-2 mb-6"
            >
              <!-- Thumbnail -->
              <div class="w-full md:w-3/12">
                <div class="md:mx-2">
                  <div class="overflow-hidden rounded-lg">
                    <img
                      v-if="getCoverImage(event)"
                      :src="getCoverImage(event)!"
                      :alt="event.title"
                      class="w-full h-40 md:h-32 object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    >
                    <div v-else class="w-full h-40 md:h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="md:w-9/12 mt-4 md:mt-0">
                <div class="md:mx-2">
                  <!-- Type Badge -->
                  <span
                    class="inline-block px-2 py-0.5 text-xs font-semibold text-white rounded mb-2"
                    :class="typeColors[event.type] || 'bg-gray-600'"
                  >
                    {{ getTypeLabel(event.type) }}
                  </span>
                  <!-- Title -->
                  <h4 class="text-gray-900 dark:text-white font-bold text-xl md:text-2xl pb-2 leading-tight">
                    <NuxtLink :to="getEventUrl(event)" class="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 hover:underline transition-colors duration-200">
                      {{ event.title }}
                    </NuxtLink>
                  </h4>
                  <!-- Description -->
                  <p v-if="event.description" class="text-gray-600 dark:text-gray-400 pb-2 line-clamp-2">
                    {{ event.description }}
                  </p>
                  <!-- Meta info -->
                  <div class="text-gray-500 dark:text-gray-400 py-1 text-sm flex flex-wrap gap-4">
                    <span class="flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                      {{ formatDate(event.start_date) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                      {{ getLocation(event) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="w-full mb-5 pb-5 border-b border-gray-200 dark:border-gray-700 md:mx-2"></div>
            </div>

            <!-- If no latest events but we have featured ones -->
            <div v-if="latestEvents.length === 0" class="text-center py-8">
              <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.events.noMore') }}</p>
            </div>
          </div>
        </div>

        <!-- Right: Highlighted Event (sidebar) -->
        <div v-if="highlightedEvent" class="w-full md:w-1/3 mb-4 lg:mb-0">
          <div class="md:mx-4">
            <h3 class="border-b-2 border-indigo-600 mb-6">
              <span class="bg-indigo-600 px-3 py-1.5 text-white uppercase tracking-wide text-sm font-semibold">
                {{ t('partners.campus.events.highlighted') }}
              </span>
            </h3>

            <!-- Event Card -->
            <NuxtLink :to="getEventUrl(highlightedEvent)" class="group block">
              <div class="overflow-hidden rounded-xl">
                <img
                  v-if="getCoverImage(highlightedEvent)"
                  :src="getCoverImage(highlightedEvent)!"
                  :alt="highlightedEvent.title"
                  class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                >
                <div v-else class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <!-- Type Badge -->
              <span
                class="inline-block px-2 py-1 text-xs font-semibold text-white rounded mt-4"
                :class="typeColors[highlightedEvent.type] || 'bg-gray-600'"
              >
                {{ getTypeLabel(highlightedEvent.type) }}
              </span>

              <!-- Title -->
              <h4 class="text-gray-900 dark:text-white font-bold text-xl md:text-2xl pb-3 leading-tight mt-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors duration-200">
                {{ highlightedEvent.title }}
              </h4>

              <!-- Description -->
              <p v-if="highlightedEvent.description" class="text-gray-600 dark:text-gray-400 pb-3 line-clamp-3">
                {{ highlightedEvent.description }}
              </p>

              <!-- Meta info -->
              <div class="text-gray-500 dark:text-gray-400 text-sm space-y-1">
                <div class="flex items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                  <span>{{ formatDate(highlightedEvent.start_date) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-3 h-3" />
                  <span>{{ getLocation(highlightedEvent) }}</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!pending" class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <font-awesome-icon icon="fa-solid fa-calendar-alt" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noEvents') }}</p>
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

.group:hover .group-hover\:translate-y-0 {
  transform: translateY(0);
}
</style>
