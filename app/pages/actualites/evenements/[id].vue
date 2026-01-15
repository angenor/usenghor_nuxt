<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getEventById, getUpcomingEvents, getCampusById, getFlagEmoji } = useMockData()

// Get the event
const id = computed(() => route.params.id as string)
const event = computed(() => getEventById(id.value))

// 404 if not found - use onMounted to check after hydration
onMounted(() => {
  if (!event.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found'
    })
  }
})

// Get campus info
const campus = computed(() => event.value ? getCampusById(event.value.campus_id) : null)
const campusFlag = computed(() => campus.value ? getFlagEmoji(campus.value.country) : '')
const campusName = computed(() => {
  if (!campus.value) return ''
  if (locale.value === 'en' && campus.value.name_en) return campus.value.name_en
  if (locale.value === 'ar' && campus.value.name_ar) return campus.value.name_ar
  return campus.value.name_fr
})

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!event.value) return ''
  if (locale.value === 'en' && event.value.title_en) return event.value.title_en
  if (locale.value === 'ar' && event.value.title_ar) return event.value.title_ar
  return event.value.title_fr
})

const getLocalizedLocation = computed(() => {
  if (!event.value) return ''
  if (locale.value === 'en' && event.value.location_en) return event.value.location_en
  return event.value.location_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('actualites.events.title')}`,
  description: () => event.value?.description_fr || '',
  ogImage: () => event.value?.image || 'https://picsum.photos/seed/og-event/1200/630'
})

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Check if event is past
const isPastEvent = computed(() => {
  if (!event.value) return false
  return new Date(event.value.date) < new Date()
})

// Days until event
const daysUntilEvent = computed(() => {
  if (!event.value) return 0
  const eventDate = new Date(event.value.date)
  const now = new Date()
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Type badge colors
const typeBadgeColors: Record<string, string> = {
  conference: 'bg-red-600',
  atelier: 'bg-indigo-600',
  ceremonie: 'bg-amber-600',
  autre: 'bg-gray-600'
}

// Related events (upcoming, excluding current)
const relatedEvents = computed(() => {
  if (!event.value) return []
  return getUpcomingEvents()
    .filter(e => e.id !== event.value!.id)
    .slice(0, 3)
})

// Get localized title for related events
const getLocalizedTitleFor = (item: { title_fr: string; title_en?: string; title_ar?: string }) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}
</script>

<template>
  <div v-if="event">
    <!-- Hero Section (PageHero style) -->
    <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <img
          :src="event.image || 'https://picsum.photos/seed/event-hero/1920/600'"
          :alt="getLocalizedTitle"
          class="w-full h-full object-cover"
        >
        <!-- Gradient Overlays -->
        <div class="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/30"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full flex flex-col justify-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <!-- Breadcrumb -->
          <nav class="mb-6">
            <ol class="flex items-center space-x-2 text-sm">
              <li>
                <NuxtLink :to="localePath('/')" class="text-white/70 hover:text-white transition-colors duration-200">
                  {{ t('nav.home') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40" />
                <NuxtLink :to="localePath('/actualites/evenements')" class="text-white/70 hover:text-white transition-colors duration-200">
                  {{ t('actualites.events.title') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40" />
                <span class="text-amber-400 font-medium truncate max-w-xs">{{ getLocalizedTitle }}</span>
              </li>
            </ol>
          </nav>

          <!-- Badges -->
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span
              class="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
              :class="typeBadgeColors[event.type]"
            >
              {{ t(`actualites.events.types.${event.type}`) }}
            </span>
            <span
              v-if="isPastEvent"
              class="inline-block px-3 py-1 text-sm font-medium bg-gray-600 text-white rounded-full"
            >
              {{ t('actualites.detail.event.past') }}
            </span>
            <span
              v-else
              class="inline-block px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full"
            >
              {{ t('actualites.detail.event.upcoming') }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {{ getLocalizedTitle }}
          </h1>
        </div>
      </div>

      <!-- Bottom Gradient Fade -->
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
    </section>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Featured image -->
          <div class="overflow-hidden rounded-xl mb-8 shadow-lg">
            <img
              :src="event.image || 'https://picsum.photos/seed/event-detail/800/450'"
              :alt="getLocalizedTitle"
              class="w-full h-auto object-cover"
            >
          </div>

          <!-- Info cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <!-- Date -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
                {{ t('actualites.detail.event.date') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ formatDate(event.date) }}
              </div>
              <div
                v-if="!isPastEvent && daysUntilEvent <= 14 && daysUntilEvent > 0"
                class="text-xs mt-1 text-green-600 dark:text-green-400 font-medium"
              >
                {{ daysUntilEvent === 0 ? "Aujourd'hui" : `Dans ${daysUntilEvent} jour${daysUntilEvent > 1 ? 's' : ''}` }}
              </div>
            </div>

            <!-- Location -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-location-dot" class="w-4 h-4" />
                {{ t('actualites.detail.event.location') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ getLocalizedLocation }}
              </div>
            </div>

            <!-- Campus -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-building" class="w-4 h-4" />
                {{ t('actualites.detail.event.campus') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1 text-sm">
                <span>{{ campusFlag }}</span>
                <span>{{ campusName }}</span>
              </div>
            </div>

            <!-- Type -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-tag" class="w-4 h-4" />
                {{ t('actualites.detail.event.type') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ t(`actualites.events.types.${event.type}`) }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ event.description_fr }}
            </p>

            <!-- Additional simulated content -->
            <div class="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
              <p>
                Cet événement s'inscrit dans le cadre des activités académiques de l'Université Senghor, qui vise à promouvoir l'excellence et le développement en Afrique francophone.
              </p>
              <p>
                La participation est ouverte à tous les membres de la communauté universitaire ainsi qu'aux partenaires et invités. Nous vous encourageons à vous inscrire rapidement car les places sont limitées.
              </p>
            </div>
          </div>

          <!-- Back button -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              :to="localePath('/actualites/evenements')"
              class="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('actualites.detail.event.backToEvents') }}
            </NuxtLink>
          </div>

          <!-- Related events -->
          <section v-if="relatedEvents.length > 0" class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('actualites.detail.event.relatedEvents') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article
                v-for="item in relatedEvents"
                :key="item.id"
                class="group relative overflow-hidden rounded-xl h-56"
              >
                <NuxtLink :to="localePath(`/actualites/evenements/${item.id}`)">
                  <!-- Background image -->
                  <img
                    :src="item.image || 'https://picsum.photos/seed/related-event/400/300'"
                    :alt="getLocalizedTitleFor(item)"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  >

                  <!-- Gradient overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  <!-- Content -->
                  <div class="absolute inset-0 p-4 flex flex-col justify-end">
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="inline-block px-2 py-0.5 text-xs font-medium text-white rounded"
                        :class="typeBadgeColors[item.type]"
                      >
                        {{ t(`actualites.events.types.${item.type}`) }}
                      </span>
                    </div>

                    <h3 class="text-sm font-bold text-white line-clamp-2 group-hover:underline">
                      {{ getLocalizedTitleFor(item) }}
                    </h3>

                    <div class="flex items-center gap-2 mt-2 text-xs text-gray-200">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                      {{ formatShortDate(item.date) }}
                    </div>
                  </div>
                </NuxtLink>
              </article>
            </div>
          </section>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-1/3">
          <ActualitesSidebar :show-events="false" />
        </aside>
      </div>
    </div>
  </div>
</template>
