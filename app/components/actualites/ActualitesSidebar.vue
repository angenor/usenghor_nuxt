<script setup lang="ts">
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
const { getUpcomingEvents, getAllNews, getAllOpenCalls, getCampusById, getFlagEmoji } = useMockData()

// Get data
const upcomingEvents = computed(() => getUpcomingEvents().slice(0, props.maxItems))
const recentNews = computed(() => getAllNews().slice(0, props.maxItems))
const openCalls = computed(() => getAllOpenCalls().slice(0, props.maxItems))

// Localization helpers
const getLocalizedTitle = (item: { title_fr: string; title_en?: string; title_ar?: string }) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}

const getCampusFlag = (campusId: string) => {
  const campus = getCampusById(campusId)
  return campus ? getFlagEmoji(campus.country) : ''
}

// Event type colors
const typeColors: Record<string, string> = {
  conference: 'bg-brand-red-600',
  atelier: 'bg-brand-blue-600',
  ceremonie: 'bg-brand-blue-500',
  autre: 'bg-gray-600'
}
</script>

<template>
  <aside class="space-y-8">
    <!-- Upcoming Events -->
    <div v-if="showEvents && upcomingEvents.length > 0" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-calendar" class="text-brand-blue-500" />
        {{ t('actualites.sidebar.upcomingEvents') }}
      </h3>

      <div class="space-y-4">
        <article
          v-for="event in upcomingEvents"
          :key="event.id"
          class="group"
        >
          <div class="flex items-start gap-3">
            <!-- Date badge -->
            <div class="flex-shrink-0 w-12 text-center">
              <div class="bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded-lg py-1.5">
                <div class="text-xs text-brand-blue-700 dark:text-brand-blue-400 font-medium">
                  {{ formatDate(event.date) }}
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <span
                class="inline-block px-1.5 py-0.5 text-xs font-medium text-white rounded mb-1"
                :class="typeColors[event.type]"
              >
                {{ t(`actualites.events.types.${event.type}`) }}
              </span>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                {{ getLocalizedTitle(event) }}
              </h4>
              <div class="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{{ getCampusFlag(event.campus_id) }}</span>
              </div>
            </div>
          </div>
        </article>
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
        <article
          v-for="news in recentNews"
          :key="news.id"
          class="group flex gap-3"
        >
          <!-- Thumbnail -->
          <div class="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
            <img
              :src="news.image || 'https://picsum.photos/seed/default/100/100'"
              :alt="getLocalizedTitle(news)"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            >
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
              {{ getLocalizedTitle(news) }}
            </h4>
            <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ getCampusFlag(news.campus_id) }}</span>
              <span>{{ formatDate(news.date) }}</span>
            </div>
          </div>
        </article>
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
        <article
          v-for="call in openCalls"
          :key="call.id"
          class="group"
        >
          <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
            {{ getLocalizedTitle(call) }}
          </h4>
          <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ getCampusFlag(call.campus_id) }}</span>
            <span class="text-red-500 dark:text-red-400 font-medium">
              {{ t('actualites.calls.deadline') }}: {{ formatDate(call.deadline) }}
            </span>
          </div>
        </article>
      </div>

      <NuxtLink
        :to="localePath('/actualites/appels')"
        class="inline-flex items-center gap-1 mt-4 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300"
      >
        {{ t('actualites.sections.viewAllCalls') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
      </NuxtLink>
    </div>
  </aside>
</template>
