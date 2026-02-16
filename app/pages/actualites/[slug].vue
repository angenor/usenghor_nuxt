<script setup lang="ts">
import type { NewsDisplay } from '~/types/news'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getNewsBySlug: getPublicNewsBySlug, getAllPublishedNews } = usePublicNewsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(item: NewsDisplay, variant: 'low' | 'medium' | 'original' = 'medium'): string {
  if (item.cover_image_external_id) {
    const originalUrl = getMediaUrl(item.cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : 'https://picsum.photos/seed/default/800/500'
  }
  return item.cover_image || 'https://picsum.photos/seed/default/800/500'
}

// Get the news item
const slug = computed(() => route.params.slug as string)
const news = ref<NewsDisplay | null>(null)
const relatedNewsItems = ref<NewsDisplay[]>([])
const isLoading = ref(true)

// Charger l'actualité depuis l'API
onMounted(async () => {
  try {
    news.value = await getPublicNewsBySlug(slug.value)

    if (!news.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article not found'
      })
    }

    // Charger les actualités liées (par campus commun)
    if (news.value.campus_ids?.length > 0) {
      const allNews = await getAllPublishedNews()
      relatedNewsItems.value = allNews
        .filter(n => n.campus_ids?.some(cid => news.value!.campus_ids.includes(cid)) && n.id !== news.value!.id)
        .slice(0, 3)
    }
  } catch (error) {
    console.error('Erreur lors du chargement de l\'actualité:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Article not found'
    })
  } finally {
    isLoading.value = false
  }
})

// Vérifier s'il y a des métadonnées d'association à afficher
const hasAssociations = computed(() => {
  if (!news.value) return false
  return (news.value.campus_names?.length > 0)
    || (news.value.service_names?.length > 0)
    || news.value.sector_name
})

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!news.value) return ''
  // Pour le moment, on utilise uniquement le titre principal
  // TODO: Implémenter le support multilingue complet
  return news.value.title
})

const getLocalizedExcerpt = computed(() => {
  if (!news.value) return ''
  return news.value.summary || ''
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('actualites.seo.title')}`,
  description: () => getLocalizedExcerpt.value,
  ogImage: () => news.value ? getCoverImageUrl(news.value) : 'https://picsum.photos/seed/og-news/1200/630'
})

// Format date
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Related news (same campus, excluding current)
const relatedNews = computed(() => relatedNewsItems.value)

// Get localized title for related news
const getLocalizedTitleFor = (item: NewsDisplay) => {
  return item.title
}
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-12 min-h-screen">
      <div class="flex flex-col items-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('actualites.loading') }}</span>
      </div>
    </div>

    <div v-else-if="news">
      <!-- Hero Section (PageHero style) -->
      <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            :src="getCoverImageUrl(news, 'original')"
            :alt="getLocalizedTitle"
            class="w-full h-full object-cover"
          >
          <div class="absolute inset-0 bg-gray-900/60"></div>
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
                  <span class="text-brand-red-400 font-medium truncate max-w-xs">{{ getLocalizedTitle }}</span>
                </li>
              </ol>
            </nav>

            <!-- Meta info -->
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span
                v-for="(name, idx) in news.campus_names"
                :key="idx"
                class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue-600 text-white text-sm font-medium rounded-full"
              >
                <font-awesome-icon icon="fa-solid fa-building-columns" class="w-3 h-3" />
                {{ name }}
              </span>
              <span class="text-white/70 text-sm">{{ formatDate(news.published_at) }}</span>
            </div>

            <!-- Title -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {{ getLocalizedTitle }}
            </h1>
          </div>
        </div>

        <!-- Ligne de séparation oblique -->
        <div class="absolute bottom-0 left-0 right-0">
          <svg class="w-full h-12 md:h-16 text-white dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
          </svg>
        </div>
      </section>

    <!-- Content -->
    <div class="bg-grid-pattern max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Featured image -->
          <div class="overflow-hidden rounded-xl mb-8 shadow-lg">
            <img
              :src="getCoverImageUrl(news, 'medium')"
              :alt="getLocalizedTitle"
              class="w-full h-auto object-cover"
            >
          </div>

          <!-- Info cards : campus, services, secteur -->
          <div v-if="hasAssociations" class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <!-- Campus -->
            <div v-if="news.campus_names?.length" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-building-columns" class="w-4 h-4" />
                Campus
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ news.campus_names.join(', ') }}
              </div>
            </div>

            <!-- Services -->
            <div v-if="news.service_names?.length" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-sitemap" class="w-4 h-4" />
                Services
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ news.service_names.join(', ') }}
              </div>
            </div>

            <!-- Secteur -->
            <div v-if="news.sector_name" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-layer-group" class="w-4 h-4" />
                Secteur
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ news.sector_name }}
              </div>
            </div>
          </div>

          <!-- Article content -->
          <div class="prose prose-lg dark:prose-invert max-w-none">
            <!-- Résumé -->
            <p v-if="getLocalizedExcerpt" class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {{ getLocalizedExcerpt }}
            </p>

            <!-- Contenu EditorJS -->
            <EditorJSRenderer v-if="news.content" :data="news.content" />

            <!-- Fallback si pas de contenu -->
            <p v-else class="text-gray-500 dark:text-gray-400 italic">
              {{ t('actualites.detail.news.noContent', 'Aucun contenu disponible pour cet article.') }}
            </p>
          </div>

          <!-- Back button -->
          <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              :to="localePath('/actualites')"
              class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
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
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article
                v-for="item in relatedNews"
                :key="item.id"
                class="group"
              >
                <NuxtLink :to="localePath(`/actualites/${item.slug}`)">
                  <div class="overflow-hidden rounded-lg mb-3">
                    <img
                      :src="getCoverImageUrl(item, 'low')"
                      :alt="getLocalizedTitleFor(item)"
                      class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    >
                  </div>

                  <h3 class="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {{ getLocalizedTitleFor(item) }}
                  </h3>

                  <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(item.published_at) }}
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
  </div>
</template>
