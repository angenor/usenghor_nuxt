<script setup lang="ts">
import type { NewsDisplay } from '~/types/news'

interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { listPublishedNews } = usePublicNewsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

// Fetch news from API
const { data: newsResponse, pending } = await useAsyncData(
  `campus-news-${props.campusId}`,
  () => listPublishedNews({ campus_id: props.campusId, limit: 20 }),
  { lazy: true }
)

const news = computed(() => newsResponse.value?.items || [])

// Featured article (first one)
const featuredNews = computed(() => news.value[0] || null)

// Side articles (2nd to 4th)
const sideNews = computed(() => news.value.slice(1, 4))

// Remaining articles (5th and onwards) - displayed in two-column format
const remainingNews = computed(() => news.value.slice(4))

// Get article URL
const getNewsUrl = (item: NewsDisplay) => {
  return localePath(`/actualites/${item.slug}`)
}

// Get cover image URL selon la variante souhaitée
const getCoverImage = (item: NewsDisplay, variant: 'low' | 'medium' | 'original' = 'low'): string | null => {
  if ((item as any).cover_image_external_id) {
    const originalUrl = getMediaUrl((item as any).cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : null
  }
  return item.cover_image || null
}

// Format date with locale
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}
</script>

<template>
  <div class="py-8">
    <!-- Title -->
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
      <span class="relative inline-block">
        {{ t('partners.campus.news.title') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
      </span>
    </h2>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500"></div>
    </div>

    <div v-else-if="news.length > 0">
      <!-- Section 1: Featured + Side articles -->
      <div class="flex flex-col lg:flex-row lg:space-x-8">
        <!-- Left: Featured article -->
        <div class="lg:w-1/2 xl:w-3/5">
          <div v-if="featuredNews" class="group">
            <!-- Hero image -->
            <div class="overflow-hidden rounded-xl">
              <img
                v-if="getCoverImage(featuredNews, 'medium')"
                :src="getCoverImage(featuredNews, 'medium')!"
                :alt="featuredNews.title"
                class="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
              <div v-else class="w-full h-64 md:h-80 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <!-- Content -->
            <div class="mt-5">
              <!-- Featured Badge -->
              <span class="inline-block px-3 py-1 text-xs font-semibold text-white bg-brand-blue-600 rounded uppercase tracking-wide mb-3">
                {{ t('partners.campus.news.featured') }}
              </span>

              <!-- Title -->
              <h3 class="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                <NuxtLink
                  :to="getNewsUrl(featuredNews)"
                  class="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 hover:underline transition-colors duration-200"
                >
                  {{ featuredNews.title }}
                </NuxtLink>
              </h3>

              <!-- Excerpt -->
              <p v-if="featuredNews.summary" class="mt-3 text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed">
                {{ featuredNews.summary }}
              </p>

              <!-- Date -->
              <div class="flex items-center gap-3 mt-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(featuredNews.published_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Side articles -->
        <div class="lg:w-1/2 xl:w-2/5 mt-8 lg:mt-0">
          <div class="space-y-0">
            <article
              v-for="(item, index) in sideNews"
              :key="item.id"
              class="group flex flex-col md:flex-row gap-4 py-5"
              :class="{ 'border-t border-gray-200 dark:border-gray-700': index > 0 }"
            >
              <!-- Thumbnail -->
              <div class="md:w-2/5 lg:w-2/5 flex-shrink-0">
                <div class="overflow-hidden rounded-lg">
                  <img
                    v-if="getCoverImage(item)"
                    :src="getCoverImage(item)!"
                    :alt="item.title"
                    class="w-full h-40 md:h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                  <div v-else class="w-full h-40 md:h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="md:w-3/5 lg:w-3/5 flex flex-col justify-center">
                <!-- Title -->
                <h4 class="text-lg lg:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  <NuxtLink
                    :to="getNewsUrl(item)"
                    class="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 hover:underline transition-colors duration-200"
                  >
                    {{ item.title }}
                  </NuxtLink>
                </h4>

                <!-- Excerpt -->
                <p v-if="item.summary" class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {{ item.summary }}
                </p>

                <!-- Date -->
                <div class="flex items-center gap-2 mt-3">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(item.published_at) }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <!-- Section 2: Remaining articles in two-column format (Policy & Company style) -->
      <div v-if="remainingNews.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <article
          v-for="item in remainingNews"
          :key="item.id"
          class="group border-t border-gray-300 dark:border-gray-700 pt-6"
        >
          <!-- Image -->
          <div class="overflow-hidden rounded-xl">
            <img
              v-if="getCoverImage(item)"
              :src="getCoverImage(item)!"
              :alt="item.title"
              class="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            >
            <div v-else class="w-full h-48 md:h-56 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <!-- Title -->
          <h4 class="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight mt-4">
            <NuxtLink
              :to="getNewsUrl(item)"
              class="hover:text-brand-blue-600 dark:hover:text-brand-blue-400 hover:underline transition-colors duration-200"
            >
              {{ item.title }}
            </NuxtLink>
          </h4>

          <!-- Excerpt -->
          <p v-if="item.summary" class="mt-3 text-gray-600 dark:text-gray-400 text-base leading-relaxed line-clamp-3">
            {{ item.summary }}
          </p>

          <!-- Date -->
          <div class="flex items-center gap-3 mt-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(item.published_at) }}</span>
          </div>
        </article>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!pending" class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noNews') }}</p>
    </div>
  </div>
</template>
