<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { getCampusNews } = useMockData()

const news = computed(() => getCampusNews(props.campusId))

// Featured article (first one)
const featuredNews = computed(() => news.value[0] || null)

// Side articles (2nd to 4th)
const sideNews = computed(() => news.value.slice(1, 4))

// Remaining articles (5th and onwards) - displayed in two-column format
const remainingNews = computed(() => news.value.slice(4))

// Get localized title
const getLocalizedTitle = (item: (typeof news.value)[0]) => {
  if (!item) return ''
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

// Get localized excerpt
const getLocalizedExcerpt = (item: (typeof news.value)[0]) => {
  if (!item) return ''
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
    <!-- Title -->
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8">
      <span class="relative inline-block">
        {{ t('partners.campus.news.title') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
      </span>
    </h2>

    <div v-if="news.length > 0">
      <!-- Section 1: Featured + Side articles -->
      <div class="flex flex-col lg:flex-row lg:space-x-8">
        <!-- Left: Featured article -->
        <div class="lg:w-1/2 xl:w-3/5">
          <div v-if="featuredNews" class="group">
            <!-- Hero image -->
            <div class="overflow-hidden rounded-xl">
              <img
                :src="featuredNews.image || 'https://picsum.photos/seed/default/800/500'"
                :alt="getLocalizedTitle(featuredNews)"
                class="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <!-- Content -->
            <div class="mt-5">
              <!-- Title -->
              <h3 class="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                <a
                  v-if="featuredNews.url"
                  :href="featuredNews.url"
                  class="hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200"
                >
                  {{ getLocalizedTitle(featuredNews) }}
                </a>
                <span v-else class="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200">
                  {{ getLocalizedTitle(featuredNews) }}
                </span>
              </h3>

              <!-- Excerpt -->
              <p class="mt-3 text-gray-600 dark:text-gray-400 text-base lg:text-lg leading-relaxed">
                {{ getLocalizedExcerpt(featuredNews) }}
              </p>

              <!-- Date -->
              <div class="flex items-center gap-3 mt-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(featuredNews.date) }}</span>
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
                    :src="item.image || 'https://picsum.photos/seed/default/400/250'"
                    :alt="getLocalizedTitle(item)"
                    class="w-full h-40 md:h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>
              </div>

              <!-- Content -->
              <div class="md:w-3/5 lg:w-3/5 flex flex-col justify-center">
                <!-- Title -->
                <h4 class="text-lg lg:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  <a
                    v-if="item.url"
                    :href="item.url"
                    class="hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200"
                  >
                    {{ getLocalizedTitle(item) }}
                  </a>
                  <span v-else class="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200">
                    {{ getLocalizedTitle(item) }}
                  </span>
                </h4>

                <!-- Excerpt -->
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {{ getLocalizedExcerpt(item) }}
                </p>

                <!-- Date -->
                <div class="flex items-center gap-2 mt-3">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(item.date) }}</span>
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
              :src="item.image || 'https://picsum.photos/seed/default/600/400'"
              :alt="getLocalizedTitle(item)"
              class="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            >
          </div>

          <!-- Title -->
          <h4 class="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight mt-4">
            <a
              v-if="item.url"
              :href="item.url"
              class="hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200"
            >
              {{ getLocalizedTitle(item) }}
            </a>
            <span v-else class="cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200">
              {{ getLocalizedTitle(item) }}
            </span>
          </h4>

          <!-- Excerpt -->
          <p class="mt-3 text-gray-600 dark:text-gray-400 text-base leading-relaxed line-clamp-3">
            {{ getLocalizedExcerpt(item) }}
          </p>

          <!-- Date -->
          <div class="flex items-center gap-3 mt-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(item.date) }}</span>
          </div>
        </article>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noNews') }}</p>
    </div>
  </div>
</template>
