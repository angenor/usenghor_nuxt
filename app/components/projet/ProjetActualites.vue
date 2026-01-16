<script setup lang="ts">
interface Props {
  projectId: string
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const { getProjectNews } = useMockData()

// Get news for this project
const news = computed(() => getProjectNews(props.projectId))

// Localization helpers
const getLocalizedTitle = (item: any) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

const getLocalizedExcerpt = (item: any) => {
  if (locale.value === 'en' && item.excerpt_en) return item.excerpt_en
  return item.excerpt_fr
}

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}
</script>

<template>
  <div class="py-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
      <font-awesome-icon icon="fa-solid fa-newspaper" class="text-brand-blue-500" />
      {{ t('projets.actualites.title') }}
    </h2>

    <!-- Empty state -->
    <div
      v-if="news.length === 0"
      class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl"
    >
      <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ t('projets.actualites.noActualites') }}</p>
    </div>

    <!-- News list -->
    <div v-else class="grid gap-6 md:grid-cols-2">
      <article
        v-for="item in news"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Image -->
        <div v-if="item.image" class="h-48 overflow-hidden">
          <img
            :src="item.image"
            :alt="getLocalizedTitle(item)"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Content -->
        <div class="p-5">
          <!-- Date -->
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
            {{ formatDate(item.date) }}
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {{ getLocalizedTitle(item) }}
          </h3>

          <!-- Excerpt -->
          <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {{ getLocalizedExcerpt(item) }}
          </p>

          <!-- Read more link -->
          <a
            v-if="item.url"
            :href="item.url"
            class="inline-flex items-center gap-2 mt-4 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 text-sm font-medium"
          >
            {{ t('projets.actualites.readMore') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
          </a>
        </div>
      </article>
    </div>
  </div>
</template>
