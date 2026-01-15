<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getNewsBySlug, getAllNews, getCampusById, getFlagEmoji } = useMockData()

// Get the news item
const slug = computed(() => route.params.slug as string)
const news = computed(() => getNewsBySlug(slug.value))

// 404 if not found - use onMounted to check after hydration
onMounted(() => {
  if (!news.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Article not found'
    })
  }
})

// Get campus info
const campus = computed(() => news.value ? getCampusById(news.value.campus_id) : null)
const campusFlag = computed(() => campus.value ? getFlagEmoji(campus.value.country) : '')
const campusName = computed(() => {
  if (!campus.value) return ''
  if (locale.value === 'en' && campus.value.name_en) return campus.value.name_en
  if (locale.value === 'ar' && campus.value.name_ar) return campus.value.name_ar
  return campus.value.name_fr
})

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!news.value) return ''
  if (locale.value === 'en' && news.value.title_en) return news.value.title_en
  if (locale.value === 'ar' && news.value.title_ar) return news.value.title_ar
  return news.value.title_fr
})

const getLocalizedExcerpt = computed(() => {
  if (!news.value) return ''
  if (locale.value === 'en' && news.value.excerpt_en) return news.value.excerpt_en
  return news.value.excerpt_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('actualites.seo.title')}`,
  description: () => getLocalizedExcerpt.value,
  ogImage: () => news.value?.image || 'https://picsum.photos/seed/og-news/1200/630'
})

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Related news (same campus, excluding current)
const relatedNews = computed(() => {
  if (!news.value) return []
  return getAllNews()
    .filter(n => n.campus_id === news.value!.campus_id && n.id !== news.value!.id)
    .slice(0, 3)
})

// Get localized title for related news
const getLocalizedTitleFor = (item: { title_fr: string; title_en?: string; title_ar?: string }) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}
</script>

<template>
  <div v-if="news">
    <!-- Hero Section (PageHero style) -->
    <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <img
          :src="news.image || 'https://picsum.photos/seed/news-hero/1920/600'"
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
                <NuxtLink :to="localePath('/actualites')" class="text-white/70 hover:text-white transition-colors duration-200">
                  {{ t('actualites.hero.badge') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40" />
                <span class="text-amber-400 font-medium truncate max-w-xs">{{ getLocalizedTitle }}</span>
              </li>
            </ol>
          </nav>

          <!-- Meta info -->
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white text-sm font-medium rounded-full">
              <span>{{ campusFlag }}</span>
              <span>{{ campusName }}</span>
            </span>
            <span class="text-white/70 text-sm">{{ formatDate(news.date) }}</span>
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
              :src="news.image || 'https://picsum.photos/seed/news-detail/800/450'"
              :alt="getLocalizedTitle"
              class="w-full h-auto object-cover"
            >
          </div>

          <!-- Article content -->
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <p class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ getLocalizedExcerpt }}
            </p>

            <!-- Simulated article content -->
            <div class="mt-8 space-y-6 text-gray-600 dark:text-gray-400">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
          </div>

          <!-- Back button -->
          <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              :to="localePath('/actualites')"
              class="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('actualites.detail.news.backToNews') }}
            </NuxtLink>
          </div>

          <!-- Related news -->
          <section v-if="relatedNews.length > 0" class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('actualites.detail.news.relatedNews') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article
                v-for="item in relatedNews"
                :key="item.id"
                class="group"
              >
                <NuxtLink :to="localePath(`/actualites/${item.id}`)">
                  <div class="overflow-hidden rounded-lg mb-3">
                    <img
                      :src="item.image || 'https://picsum.photos/seed/related/400/250'"
                      :alt="getLocalizedTitleFor(item)"
                      class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    >
                  </div>

                  <h3 class="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {{ getLocalizedTitleFor(item) }}
                  </h3>

                  <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(item.date) }}
                  </div>
                </NuxtLink>
              </article>
            </div>
          </section>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-1/3">
          <ActualitesSidebar :show-news="false" />
        </aside>
      </div>
    </div>
  </div>
</template>
