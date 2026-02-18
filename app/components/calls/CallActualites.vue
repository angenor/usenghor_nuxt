<script setup lang="ts">
import type { NewsPublicEnriched } from '~/types/news'

interface Props {
  callSlug: string
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getCallNews } = usePublicCallsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

const news = ref<NewsPublicEnriched[]>([])
const loading = ref(true)

async function fetchNews() {
  loading.value = true
  try {
    const data = await getCallNews(props.callSlug)
    news.value = data as NewsPublicEnriched[]
  }
  catch (e) {
    console.error('Erreur chargement actualités de l\'appel:', e)
    news.value = []
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNews()
})

// Format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
}

// Get cover image URL (null if no image available)
function getCoverImage(item: NewsPublicEnriched): string | null {
  if (item.cover_image_external_id) {
    const url = getMediaUrl(item.cover_image_external_id)
    return url ? getImageVariantUrl(url, 'medium') : null
  }
  return null
}
</script>

<template>
  <div class="py-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
      <font-awesome-icon icon="fa-solid fa-newspaper" class="text-brand-blue-500" />
      {{ t('actualites.detail.call.tabs.actualites') }}
    </h2>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-600 border-t-transparent" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="news.length === 0"
      class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl"
    >
      <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ t('actualites.detail.call.noNews') }}</p>
    </div>

    <!-- News grid -->
    <div v-else class="grid gap-6 md:grid-cols-2">
      <article
        v-for="item in news"
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Image -->
        <div class="h-48 overflow-hidden">
          <img
            v-if="getCoverImage(item)"
            :src="getCoverImage(item)!"
            :alt="item.title"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-5">
          <!-- Date -->
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
            {{ formatDate(item.published_at || item.created_at) }}
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {{ item.title }}
          </h3>

          <!-- Summary -->
          <p v-if="item.summary" class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {{ item.summary }}
          </p>

          <!-- Read more link -->
          <NuxtLink
            :to="localePath(`/actualites/${item.slug}`)"
            class="inline-flex items-center gap-2 mt-4 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 text-sm font-medium"
          >
            {{ t('actualites.readMore') }}
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
          </NuxtLink>
        </div>
      </article>
    </div>
  </div>
</template>
