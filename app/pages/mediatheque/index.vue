<script setup lang="ts">
import type { MediaType, PublicAlbumListItem } from '~/types/api/media'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()
const { listPublicAlbums } = usePublicAlbumsApi()

// SEO
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
useSeoMeta({
  title: () => t('mediatheque.title'),
  description: () => t('mediatheque.subtitle'),
  ogTitle: () => t('mediatheque.title'),
  ogDescription: () => t('mediatheque.subtitle'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
})

// État
const albums = ref<PublicAlbumListItem[]>([])
const isLoading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const totalAlbums = ref(0)
const searchQuery = ref('')
const activeFilter = ref<string>('all')
const limit = 24

// Filtres par type de média
const filterTypes: { key: string, icon: string }[] = [
  { key: 'all', icon: 'fa-solid fa-border-all' },
  { key: 'image', icon: 'fa-solid fa-image' },
  { key: 'video', icon: 'fa-solid fa-film' },
  { key: 'audio', icon: 'fa-solid fa-headphones' },
  { key: 'document', icon: 'fa-solid fa-file-lines' },
]

// Charger les albums
async function loadAlbums() {
  isLoading.value = true
  try {
    const result = await listPublicAlbums({
      page: currentPage.value,
      limit,
      search: searchQuery.value || undefined,
      media_type: activeFilter.value === 'all' ? undefined : activeFilter.value,
    })
    if (result) {
      albums.value = result.items
      totalPages.value = result.pages
      totalAlbums.value = result.total
    }
  }
  catch (error) {
    console.error('Erreur lors du chargement des albums:', error)
    albums.value = []
  }
  finally {
    isLoading.value = false
  }
}

// Recherche avec debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadAlbums()
  }, 400)
}

// Changement de filtre
function setFilter(key: string) {
  activeFilter.value = key
  currentPage.value = 1
  loadAlbums()
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadAlbums()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Préparer les items pour MediaAlbumCard
function getCardItems(album: PublicAlbumListItem) {
  if (!album.cover_media) return []
  return [{
    id: album.cover_media.id,
    title_fr: album.cover_media.name,
    url: album.cover_media.url,
    type: album.cover_media.type as MediaType,
  }]
}

// Chargement initial
onMounted(() => {
  loadAlbums()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <!-- Hero section (même style que ActualitesHero) -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>

      <!-- Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <!-- Badge -->
          <span class="inline-block px-4 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full mb-6">
            <font-awesome-icon icon="fa-solid fa-photo-film" class="w-3.5 h-3.5 mr-1.5" />
            {{ t('mediatheque.title') }}
          </span>

          <!-- Title -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ t('mediatheque.title') }}
          </h1>

          <!-- Subtitle -->
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            {{ t('mediatheque.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Ligne de séparation oblique -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg class="w-full h-12 md:h-16 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
        </svg>
      </div>
    </section>

    <!-- Contenu principal -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- Barre de recherche + Filtres -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <!-- Recherche -->
        <div class="relative flex-1">
          <font-awesome-icon
            icon="fa-solid fa-search"
            class="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            :class="locale === 'ar' ? 'right-4' : 'left-4'"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('mediatheque.searchPlaceholder')"
            class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent transition-all"
            :class="locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'"
            @input="onSearchInput"
          />
        </div>

        <!-- Filtres par type -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="filter in filterTypes"
            :key="filter.key"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="activeFilter === filter.key
              ? 'bg-brand-blue-600 text-white shadow-lg shadow-brand-blue-600/25'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'"
            @click="setFilter(filter.key)"
          >
            <font-awesome-icon :icon="filter.icon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ t(`mediatheque.filters.${filter.key}`) }}</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="h-48 sm:h-56 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          <div class="mt-4 px-1">
            <div class="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mt-2"></div>
          </div>
        </div>
      </div>

      <!-- Grille d'albums -->
      <div v-else-if="albums.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <MediaAlbumCard
          v-for="album in albums"
          :key="album.id"
          :title="album.title"
          :items="getCardItems(album)"
          :item-count="album.media_count"
          @click="navigateTo(localePath(`/mediatheque/${album.slug}`))"
        />
      </div>

      <!-- État vide -->
      <div v-else class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <font-awesome-icon icon="fa-solid fa-images" class="w-10 h-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ searchQuery || activeFilter !== 'all' ? t('mediatheque.empty.noResults') : t('mediatheque.empty.title') }}
        </h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {{ searchQuery || activeFilter !== 'all' ? t('mediatheque.empty.noResultsDescription') : t('mediatheque.empty.description') }}
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 1" class="flex items-center justify-center gap-2 mt-12">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="currentPage > 1
            ? 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          {{ t('mediatheque.pagination.previous') }}
        </button>

        <div class="flex items-center gap-1">
          <template v-for="page in totalPages" :key="page">
            <button
              v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
              type="button"
              class="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
              :class="page === currentPage
                ? 'bg-brand-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span
              v-else-if="page === currentPage - 2 || page === currentPage + 2"
              class="px-1 text-gray-400"
            >...</span>
          </template>
        </div>

        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="currentPage < totalPages
            ? 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          {{ t('mediatheque.pagination.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
