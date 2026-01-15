<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getAllNews, getUpcomingEvents, getAllOpenCalls } = useMockData()

// SEO
useSeoMeta({
  title: () => t('actualites.seo.title'),
  description: () => t('actualites.seo.description')
})

// Get data
const allNews = computed(() => getAllNews())
const upcomingEvents = computed(() => getUpcomingEvents().slice(0, 4))
const openCalls = computed(() => getAllOpenCalls().slice(0, 3))

// Featured news (first one)
const featuredNews = computed(() => allNews.value[0] || null)

// Side news (2nd to 4th)
const sideNews = computed(() => allNews.value.slice(1, 4))

// Latest news (5th to 8th)
const latestNews = computed(() => allNews.value.slice(4, 8))

// Localization helpers
const getLocalizedTitle = (item: { title_fr: string; title_en?: string; title_ar?: string }) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

const getLocalizedExcerpt = (item: { excerpt_fr: string; excerpt_en?: string }) => {
  if (locale.value === 'en' && item.excerpt_en) return item.excerpt_en
  return item.excerpt_fr
}

const getLocalizedDescription = (item: { description_fr: string; description_en?: string }) => {
  if (locale.value === 'en' && item.description_en) return item.description_en
  return item.description_fr
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
      :title="t('actualites.hero.title')"
      :subtitle="t('actualites.hero.subtitle')"
      :badge="t('actualites.hero.badge')"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Section 1: Featured + Side news + Sidebar -->
      <section class="mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          <span class="relative inline-block">
            {{ t('actualites.sections.featured') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main content: Featured + Side -->
          <div class="lg:w-2/3">
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Featured article -->
              <div v-if="featuredNews" class="md:w-3/5 group">
                <div class="overflow-hidden rounded-xl">
                  <img
                    :src="featuredNews.image || 'https://picsum.photos/seed/default/800/500'"
                    :alt="getLocalizedTitle(featuredNews)"
                    class="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>

                <div class="mt-5">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="inline-block px-3 py-1 text-xs font-semibold text-white bg-amber-600 rounded uppercase tracking-wide">
                      {{ t('actualites.sections.featured') }}
                    </span>
                    <ActualitesCampusBadge :campus-id="featuredNews.campus_id" size="sm" />
                  </div>

                  <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    <NuxtLink
                      v-if="featuredNews.url"
                      :to="featuredNews.url"
                      class="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      {{ getLocalizedTitle(featuredNews) }}
                    </NuxtLink>
                    <span v-else>{{ getLocalizedTitle(featuredNews) }}</span>
                  </h3>

                  <p class="mt-3 text-gray-600 dark:text-gray-400 text-base leading-relaxed line-clamp-3">
                    {{ getLocalizedExcerpt(featuredNews) }}
                  </p>

                  <div class="flex items-center gap-3 mt-4">
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(featuredNews.date) }}</span>
                  </div>
                </div>
              </div>

              <!-- Side articles -->
              <div class="md:w-2/5 space-y-0">
                <article
                  v-for="(item, index) in sideNews"
                  :key="item.id"
                  class="group py-4"
                  :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
                >
                  <div class="overflow-hidden rounded-lg mb-3">
                    <img
                      :src="item.image || 'https://picsum.photos/seed/default/400/250'"
                      :alt="getLocalizedTitle(item)"
                      class="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    >
                  </div>

                  <ActualitesCampusBadge :campus-id="item.campus_id" size="sm" class="mb-2" />

                  <h4 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    <NuxtLink
                      v-if="item.url"
                      :to="item.url"
                      class="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      {{ getLocalizedTitle(item) }}
                    </NuxtLink>
                    <span v-else class="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors">
                      {{ getLocalizedTitle(item) }}
                    </span>
                  </h4>

                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(item.date) }}</span>
                  </div>
                </article>
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
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ t('actualites.sections.latestNews') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
            </span>
          </h2>
          <NuxtLink
            :to="localePath('/actualites')"
            class="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1"
          >
            {{ t('actualites.sections.viewAll') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article
            v-for="item in latestNews"
            :key="item.id"
            class="group"
          >
            <div class="overflow-hidden rounded-xl">
              <img
                :src="item.image || 'https://picsum.photos/seed/default/400/300'"
                :alt="getLocalizedTitle(item)"
                class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <div class="mt-4">
              <ActualitesCampusBadge :campus-id="item.campus_id" size="sm" class="mb-2" />

              <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {{ getLocalizedTitle(item) }}
              </h3>

              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ getLocalizedExcerpt(item) }}
              </p>

              <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(item.date) }}
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Section 3: Upcoming Events -->
      <section v-if="upcomingEvents.length > 0" class="mb-16">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ t('actualites.sections.upcomingEvents') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
            </span>
          </h2>
          <NuxtLink
            :to="localePath('/actualites/evenements')"
            class="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1"
          >
            {{ t('actualites.sections.viewAllEvents') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <article
            v-for="event in upcomingEvents"
            :key="event.id"
            class="group relative overflow-hidden rounded-xl h-72"
          >
            <!-- Background image -->
            <img
              :src="event.image || 'https://picsum.photos/seed/default-event/600/400'"
              :alt="getLocalizedTitle(event)"
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
                <ActualitesCampusBadge :campus-id="event.campus_id" size="sm" :show-link="false" />
              </div>

              <h3 class="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:underline">
                {{ getLocalizedTitle(event) }}
              </h3>

              <div class="flex items-center gap-3 mt-2 text-sm text-gray-200">
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                  {{ formatShortDate(event.date) }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Section 4: Open Calls -->
      <section v-if="openCalls.length > 0">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            <span class="relative inline-block">
              {{ t('actualites.sections.openCalls') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
            </span>
          </h2>
          <NuxtLink
            :to="localePath('/actualites/appels')"
            class="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium flex items-center gap-1"
          >
            {{ t('actualites.sections.viewAllCalls') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="call in openCalls"
            :key="call.id"
            class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <!-- Image -->
            <div class="overflow-hidden h-48">
              <img
                :src="call.image || 'https://picsum.photos/seed/default-call/800/400'"
                :alt="getLocalizedTitle(call)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <!-- Content -->
            <div class="p-5">
              <div class="flex items-center gap-2 mb-3">
                <ActualitesCampusBadge :campus-id="call.campus_id" size="sm" />
                <span class="inline-block px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded">
                  {{ t(`actualites.calls.filters.${call.type}`) }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {{ getLocalizedTitle(call) }}
              </h3>

              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ getLocalizedDescription(call) }}
              </p>

              <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="text-sm">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('actualites.calls.deadline') }}:</span>
                  <span class="ml-1 font-semibold text-red-600 dark:text-red-400">{{ formatShortDate(call.deadline) }}</span>
                </div>

                <a
                  v-if="call.url"
                  :href="call.url"
                  target="_blank"
                  class="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {{ t('actualites.calls.apply') }}
                  <font-awesome-icon icon="fa-solid fa-external-link" class="w-3 h-3" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
