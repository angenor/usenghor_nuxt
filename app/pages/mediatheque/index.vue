<script setup lang="ts">
import type { MediaType, PublicAlbumListItem, PublicDirectMediaItem } from '~/types/api/media'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()
const { listPublicAlbums } = usePublicAlbumsApi()
const { listPublicDirectMedia } = usePublicMediaApi()

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
type ViewTab = 'all' | 'albums' | 'files'
const activeTab = ref<ViewTab>('all')

const albums = ref<PublicAlbumListItem[]>([])
const files = ref<PublicDirectMediaItem[]>([])
const isLoading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const totalAlbums = ref(0)
const totalFiles = ref(0)
const searchQuery = ref('')
const activeFilter = ref<string>('all')
const limit = 24
// Nombre d'éléments affichés en aperçu dans l'onglet « Tout »
const previewLimit = 8

// Filtres par type de média
const filterTypes: { key: string, icon: string }[] = [
  { key: 'all', icon: 'fa-solid fa-border-all' },
  { key: 'image', icon: 'fa-solid fa-image' },
  { key: 'video', icon: 'fa-solid fa-film' },
  { key: 'audio', icon: 'fa-solid fa-headphones' },
  { key: 'document', icon: 'fa-solid fa-file-lines' },
]

// Charger les albums (pagination indépendante quand l'onglet « Albums » est actif)
async function loadAlbums(opts: { page?: number, limit?: number, updatePagination?: boolean } = {}) {
  try {
    const result = await listPublicAlbums({
      page: opts.page ?? currentPage.value,
      limit: opts.limit ?? limit,
      search: searchQuery.value || undefined,
      media_type: activeFilter.value === 'all' ? undefined : activeFilter.value,
    })
    if (result) {
      albums.value = result.items
      totalAlbums.value = result.total
      if (opts.updatePagination !== false) {
        totalPages.value = result.pages
      }
    }
    else {
      albums.value = []
      totalAlbums.value = 0
    }
  }
  catch (error) {
    console.error('Erreur lors du chargement des albums:', error)
    albums.value = []
  }
}

// Charger les fichiers directs (hors album)
async function loadFiles(opts: { page?: number, limit?: number, updatePagination?: boolean } = {}) {
  try {
    const result = await listPublicDirectMedia({
      page: opts.page ?? currentPage.value,
      limit: opts.limit ?? limit,
      search: searchQuery.value || undefined,
      media_type: activeFilter.value === 'all' ? undefined : activeFilter.value,
    })
    if (result) {
      files.value = result.items
      totalFiles.value = result.total
      if (opts.updatePagination !== false) {
        totalPages.value = result.pages
      }
    }
    else {
      files.value = []
      totalFiles.value = 0
      if (opts.updatePagination !== false) {
        totalPages.value = 1
      }
    }
  }
  catch (error) {
    console.error('Erreur lors du chargement des fichiers:', error)
    files.value = []
  }
}

async function loadCurrentTab() {
  isLoading.value = true
  try {
    if (activeTab.value === 'albums') {
      await loadAlbums()
    }
    else if (activeTab.value === 'files') {
      await loadFiles()
    }
    else {
      // Onglet « Tout » : charger un aperçu des deux listes en parallèle,
      // sans pagination globale (chaque section invite à cliquer sur son onglet
      // dédié pour voir plus).
      totalPages.value = 1
      currentPage.value = 1
      await Promise.all([
        loadAlbums({ page: 1, limit: previewLimit, updatePagination: false }),
        loadFiles({ page: 1, limit: previewLimit, updatePagination: false }),
      ])
    }
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
    loadCurrentTab()
  }, 400)
}

// Changement de filtre
function setFilter(key: string) {
  activeFilter.value = key
  currentPage.value = 1
  loadCurrentTab()
}

// Changement d'onglet
function setTab(tab: ViewTab) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  currentPage.value = 1
  loadCurrentTab()
}

// Pagination
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadCurrentTab()
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

// === Utilitaires pour les cartes fichiers ===
function fileIcon(type: MediaType): string {
  switch (type) {
    case 'image': return 'fa-solid fa-image'
    case 'video': return 'fa-solid fa-film'
    case 'audio': return 'fa-solid fa-headphones'
    case 'document': return 'fa-solid fa-file-lines'
  }
}

function fileTypeBg(type: MediaType): string {
  switch (type) {
    case 'image': return 'bg-blue-50 dark:bg-blue-900/30'
    case 'video': return 'bg-purple-50 dark:bg-purple-900/30'
    case 'audio': return 'bg-amber-50 dark:bg-amber-900/30'
    case 'document': return 'bg-red-50 dark:bg-red-900/30'
  }
}

function fileTypeColor(type: MediaType): string {
  switch (type) {
    case 'image': return 'text-blue-500'
    case 'video': return 'text-purple-500'
    case 'audio': return 'text-amber-500'
    case 'document': return 'text-red-500'
  }
}

function fileHref(item: PublicDirectMediaItem): string {
  // Le backend sert le fichier via /api/public/media/{id}/download (inline par défaut).
  // Utiliser l'ID plutôt que l'URL brute pour bénéficier des en-têtes MIME corrects.
  return `/api/public/media/${item.id}/download`
}

// Chargement initial
onMounted(() => {
  loadCurrentTab()
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
      <!-- Onglets Tout / Albums / Fichiers -->
      <div class="flex justify-center mb-8">
        <div class="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
          <button
            type="button"
            class="px-5 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
            :class="activeTab === 'all'
              ? 'bg-brand-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            @click="setTab('all')"
          >
            <font-awesome-icon icon="fa-solid fa-border-all" class="w-4 h-4" />
            <span>{{ t('mediatheque.tabs.all') }}</span>
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
            :class="activeTab === 'albums'
              ? 'bg-brand-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            @click="setTab('albums')"
          >
            <font-awesome-icon icon="fa-solid fa-images" class="w-4 h-4" />
            <span>{{ t('mediatheque.tabs.albums') }}</span>
            <span
              v-if="activeTab === 'albums' && totalAlbums > 0"
              class="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs"
            >{{ totalAlbums }}</span>
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
            :class="activeTab === 'files'
              ? 'bg-brand-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            @click="setTab('files')"
          >
            <font-awesome-icon icon="fa-solid fa-folder-open" class="w-4 h-4" />
            <span>{{ t('mediatheque.tabs.files') }}</span>
            <span
              v-if="activeTab === 'files' && totalFiles > 0"
              class="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs"
            >{{ totalFiles }}</span>
          </button>
        </div>
      </div>

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

      <!-- Onglet Tout : albums + fichiers en deux sections -->
      <template v-else-if="activeTab === 'all'">
        <!-- Rien à afficher -->
        <div
          v-if="albums.length === 0 && files.length === 0"
          class="text-center py-20"
        >
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

        <template v-else>
          <!-- Section Albums -->
          <section v-if="albums.length > 0" class="mb-12">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-images" class="w-5 h-5 text-brand-blue-600" />
                {{ t('mediatheque.sections.albums') }}
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">({{ totalAlbums }})</span>
              </h2>
              <button
                v-if="totalAlbums > albums.length"
                type="button"
                class="text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300 inline-flex items-center gap-1"
                @click="setTab('albums')"
              >
                {{ t('mediatheque.tabs.albums') }}
                <font-awesome-icon :icon="locale === 'ar' ? 'fa-solid fa-arrow-left' : 'fa-solid fa-arrow-right'" class="w-3 h-3" />
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <MediaAlbumCard
                v-for="album in albums"
                :key="album.id"
                :title="album.title"
                :items="getCardItems(album)"
                :item-count="album.media_count"
                @click="navigateTo(localePath(`/mediatheque/${album.slug}`))"
              />
            </div>
          </section>

          <!-- Section Fichiers -->
          <section v-if="files.length > 0">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-folder-open" class="w-5 h-5 text-brand-blue-600" />
                {{ t('mediatheque.sections.files') }}
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">({{ totalFiles }})</span>
              </h2>
              <button
                v-if="totalFiles > files.length"
                type="button"
                class="text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300 inline-flex items-center gap-1"
                @click="setTab('files')"
              >
                {{ t('mediatheque.tabs.files') }}
                <font-awesome-icon :icon="locale === 'ar' ? 'fa-solid fa-arrow-left' : 'fa-solid fa-arrow-right'" class="w-3 h-3" />
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <a
                v-for="item in files"
                :key="item.id"
                :href="fileHref(item)"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative block rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2"
              >
                <div class="relative h-48 sm:h-56">
                  <template v-if="item.type === 'image'">
                    <img
                      :src="fileHref(item)"
                      :alt="item.alt_text || item.name"
                      loading="lazy"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </template>
                  <div
                    v-else
                    class="w-full h-full flex flex-col items-center justify-center gap-3"
                    :class="fileTypeBg(item.type)"
                  >
                    <div
                      class="w-16 h-16 rounded-2xl flex items-center justify-center"
                      :class="item.type === 'document' ? 'bg-red-100 dark:bg-red-800/50' : item.type === 'video' ? 'bg-purple-100 dark:bg-purple-800/50' : 'bg-amber-100 dark:bg-amber-800/50'"
                    >
                      <font-awesome-icon :icon="fileIcon(item.type)" class="w-8 h-8" :class="fileTypeColor(item.type)" />
                    </div>
                  </div>
                  <div class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                    <font-awesome-icon :icon="fileIcon(item.type)" class="w-3 h-3" />
                    <span>{{ t(`mediatheque.filters.${item.type}`) }}</span>
                  </div>
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div class="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <font-awesome-icon icon="fa-solid fa-expand" class="w-5 h-5 text-gray-900" />
                    </div>
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors line-clamp-2">
                    {{ item.name }}
                  </h3>
                  <p
                    v-if="item.description"
                    class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
                  >
                    {{ item.description }}
                  </p>
                </div>
              </a>
            </div>
          </section>
        </template>
      </template>

      <!-- Onglet Albums -->
      <template v-else-if="activeTab === 'albums'">
        <!-- Grille d'albums -->
        <div v-if="albums.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <MediaAlbumCard
            v-for="album in albums"
            :key="album.id"
            :title="album.title"
            :items="getCardItems(album)"
            :item-count="album.media_count"
            @click="navigateTo(localePath(`/mediatheque/${album.slug}`))"
          />
        </div>

        <!-- État vide albums -->
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
      </template>

      <!-- Onglet Fichiers -->
      <template v-else>
        <!-- Grille de fichiers -->
        <div v-if="files.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <a
            v-for="item in files"
            :key="item.id"
            :href="fileHref(item)"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative block rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2"
          >
            <!-- Aperçu -->
            <div class="relative h-48 sm:h-56">
              <template v-if="item.type === 'image'">
                <img
                  :src="fileHref(item)"
                  :alt="item.alt_text || item.name"
                  loading="lazy"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </template>
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center gap-3"
                :class="fileTypeBg(item.type)"
              >
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center"
                  :class="item.type === 'document' ? 'bg-red-100 dark:bg-red-800/50' : item.type === 'video' ? 'bg-purple-100 dark:bg-purple-800/50' : 'bg-amber-100 dark:bg-amber-800/50'"
                >
                  <font-awesome-icon :icon="fileIcon(item.type)" class="w-8 h-8" :class="fileTypeColor(item.type)" />
                </div>
              </div>
              <!-- Badge type -->
              <div class="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                <font-awesome-icon :icon="fileIcon(item.type)" class="w-3 h-3" />
                <span>{{ t(`mediatheque.filters.${item.type}`) }}</span>
              </div>
              <!-- Hover overlay -->
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div class="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                  <font-awesome-icon icon="fa-solid fa-expand" class="w-5 h-5 text-gray-900" />
                </div>
              </div>
            </div>
            <!-- Infos -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors line-clamp-2">
                {{ item.name }}
              </h3>
              <p
                v-if="item.description"
                class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
              >
                {{ item.description }}
              </p>
            </div>
          </a>
        </div>

        <!-- État vide fichiers -->
        <div v-else class="text-center py-20">
          <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-folder-open" class="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ searchQuery || activeFilter !== 'all' ? t('mediatheque.empty.noResults') : t('mediatheque.empty.filesTitle') }}
          </h2>
          <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {{ searchQuery || activeFilter !== 'all' ? t('mediatheque.empty.noResultsDescription') : t('mediatheque.empty.filesDescription') }}
          </p>
        </div>
      </template>

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
