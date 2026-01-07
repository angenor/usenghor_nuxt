<script setup lang="ts">
import type { CampusNews } from '~/composables/useMockData'

interface Props {
  news: CampusNews
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

// Get localized title
const getLocalizedTitle = computed(() => {
  if (locale.value === 'en' && props.news.title_en) {
    return props.news.title_en
  }
  if (locale.value === 'ar' && props.news.title_ar) {
    return props.news.title_ar
  }
  return props.news.title_fr
})

// Get localized excerpt
const getLocalizedExcerpt = computed(() => {
  if (locale.value === 'en' && props.news.excerpt_en) {
    return props.news.excerpt_en
  }
  return props.news.excerpt_fr
})

// Format date
const formattedDate = computed(() => {
  const date = new Date(props.news.date)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
  <div
    class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
  >
    <!-- Image -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        v-if="news.image"
        :src="news.image"
        :alt="getLocalizedTitle"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      >
      <div v-else class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-white/50" />
      </div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <!-- Date -->
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
        <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4" />
        {{ formattedDate }}
      </div>

      <!-- Title -->
      <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {{ getLocalizedTitle }}
      </h3>

      <!-- Excerpt -->
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-1 mb-4">
        {{ getLocalizedExcerpt }}
      </p>

      <!-- Read more link -->
      <a
        v-if="news.url"
        :href="news.url"
        class="inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
      >
        {{ t('partners.campus.news.readMore') }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  </div>
</template>
