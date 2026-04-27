<script setup lang="ts">
import type { MediaRead, MediaType } from '~/types/api/media'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()
const slug = route.params.slug as string
const { getAlbumBySlug } = usePublicAlbumsApi()
const { getMediaUrl } = useMediaApi()

// État
const album = ref<{ id: string, title: string, description: string | null, slug: string, media_items: MediaRead[] } | null>(null)
const isLoading = ref(true)
const error = ref(false)

// Visionneuse
const viewerOpen = ref(false)
const viewerIndex = ref(0)
const activeFilter = ref<'all' | MediaType>('all')

// Charger l'album
onMounted(async () => {
  try {
    const data = await getAlbumBySlug(slug)
    if (data) {
      album.value = data
    }
    else {
      error.value = true
    }
  }
  catch {
    error.value = true
  }
  finally {
    isLoading.value = false
  }
})

// SEO dynamique
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
useSeoMeta({
  title: () => album.value ? `${album.value.title} — ${t('mediatheque.title')}` : t('mediatheque.title'),
  description: () => album.value?.description || t('mediatheque.subtitle'),
  ogTitle: () => album.value ? album.value.title : t('mediatheque.title'),
  ogDescription: () => album.value?.description || t('mediatheque.subtitle'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
})

// Filtres par type
function detectType(item: MediaRead): MediaType {
  return item.type
}

const availableTypes = computed(() => {
  if (!album.value) return []
  const types = new Set<MediaType>()
  album.value.media_items.forEach(m => types.add(m.type))
  return Array.from(types)
})

const showFilters = computed(() => availableTypes.value.length > 1)

const filteredMedia = computed(() => {
  if (!album.value) return []
  if (activeFilter.value === 'all') return album.value.media_items
  return album.value.media_items.filter(m => m.type === activeFilter.value)
})

function countByType(type: MediaType): number {
  if (!album.value) return 0
  return album.value.media_items.filter(m => m.type === type).length
}

function getTypeIcon(type: MediaType): string {
  switch (type) {
    case 'image': return 'fa-solid fa-image'
    case 'video': return 'fa-solid fa-film'
    case 'audio': return 'fa-solid fa-headphones'
    case 'document': return 'fa-solid fa-file-lines'
  }
}

function getTypeColor(type: MediaType): string {
  switch (type) {
    case 'image': return 'text-blue-500'
    case 'video': return 'text-purple-500'
    case 'audio': return 'text-amber-500'
    case 'document': return 'text-red-500'
  }
}

function getTypeBg(type: MediaType): string {
  switch (type) {
    case 'image': return 'bg-blue-50 dark:bg-blue-900/30'
    case 'video': return 'bg-purple-50 dark:bg-purple-900/30'
    case 'audio': return 'bg-amber-50 dark:bg-amber-900/30'
    case 'document': return 'bg-red-50 dark:bg-red-900/30'
  }
}

function getFileExtension(item: MediaRead): string {
  const name = item.name || item.url || ''
  const match = name.match(/\.(\w+)(\?|$)/)
  return match ? match[1].toUpperCase() : ''
}

// Un document est affichable inline si c'est un PDF (la plupart des navigateurs
// prennent en charge l'affichage natif des PDF via <iframe>/<embed>).
function isInlineViewableDocument(item: MediaRead): boolean {
  if (item.type !== 'document') return false
  if (item.mime_type === 'application/pdf') return true
  return getFileExtension(item) === 'PDF'
}

// Construit une URL de téléchargement forcé en ajoutant ?download=1
function getDownloadUrl(item: MediaRead): string {
  const url = item.url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}download=1`
}

// Visionneuse
function openViewer(index: number) {
  viewerIndex.value = index
  viewerOpen.value = true
}

function closeViewer() {
  viewerOpen.value = false
}

const currentViewerItem = computed(() => filteredMedia.value[viewerIndex.value])

function goToNext() {
  if (viewerIndex.value < filteredMedia.value.length - 1) {
    viewerIndex.value++
  }
}

function goToPrev() {
  if (viewerIndex.value > 0) {
    viewerIndex.value--
  }
}

// Navigation clavier
function handleKeydown(e: KeyboardEvent) {
  if (!viewerOpen.value) return
  switch (e.key) {
    case 'Escape':
      closeViewer()
      break
    case 'ArrowRight':
      goToNext()
      break
    case 'ArrowLeft':
      goToPrev()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Réinitialiser l'index quand le filtre change
watch(activeFilter, () => {
  viewerIndex.value = 0
  if (viewerOpen.value) {
    viewerOpen.value = false
  }
})

// Téléchargement
function downloadMedia(item: MediaRead) {
  const link = document.createElement('a')
  link.href = getDownloadUrl(item)
  link.download = item.name
  link.target = '_blank'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[60vh]">
      <div class="animate-spin w-10 h-10 border-4 border-brand-blue-600 border-t-transparent rounded-full"></div>
    </div>

    <!-- Erreur 404 -->
    <div v-else-if="error || !album" class="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <font-awesome-icon icon="fa-solid fa-images" class="w-10 h-10 text-gray-300 dark:text-gray-600" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {{ t('mediatheque.album.notFound') }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
        {{ t('mediatheque.album.notFoundDescription') }}
      </p>
      <NuxtLink
        :to="localePath('/mediatheque')"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue-600 text-white font-medium hover:bg-brand-blue-700 transition-colors"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
        {{ t('mediatheque.album.backToMediatheque') }}
      </NuxtLink>
    </div>

    <!-- Contenu de l'album -->
    <template v-else>
      <!-- Hero Section (même style que ActualitesHero / actualités détail) -->
      <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>

        <!-- Content -->
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Breadcrumb -->
          <nav class="mb-6">
            <ol class="flex items-center space-x-2 text-sm">
              <li>
                <NuxtLink :to="localePath('/')" class="text-white/70 hover:text-white transition-colors duration-200">
                  {{ t('nav.home') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40 rtl:rotate-180" />
                <NuxtLink :to="localePath('/mediatheque')" class="text-white/70 hover:text-white transition-colors duration-200">
                  {{ t('mediatheque.title') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40 rtl:rotate-180" />
                <span class="text-brand-red-400 font-medium truncate max-w-xs">{{ album.title }}</span>
              </li>
            </ol>
          </nav>

          <div class="text-center">
            <!-- Badge -->
            <span class="inline-block px-4 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full mb-6">
              <font-awesome-icon icon="fa-solid fa-images" class="w-3.5 h-3.5 mr-1.5" />
              {{ album.media_items.length }} {{ album.media_items.length > 1 ? 'fichiers' : 'fichier' }}
            </span>

            <!-- Title -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {{ album.title }}
            </h1>

            <!-- Description -->
            <p v-if="album.description" class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              {{ album.description }}
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

      <!-- Filtres par type -->
      <div v-if="showFilters" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="activeFilter === 'all'
              ? 'bg-brand-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
            @click="activeFilter = 'all'"
          >
            {{ t('mediatheque.filters.all') }}
            <span class="text-xs opacity-75">({{ album.media_items.length }})</span>
          </button>
          <button
            v-for="type in availableTypes"
            :key="type"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="activeFilter === type
              ? 'bg-brand-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
            @click="activeFilter = type"
          >
            <font-awesome-icon :icon="getTypeIcon(type)" class="w-3.5 h-3.5" />
            {{ t(`mediatheque.filters.${type}`) }}
            <span class="text-xs opacity-75">({{ countByType(type) }})</span>
          </button>
        </div>
      </div>

      <!-- Grille de médias -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="(item, index) in filteredMedia"
            :key="item.id"
            role="button"
            tabindex="0"
            class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
            @click="openViewer(index)"
            @keydown.enter.prevent="openViewer(index)"
            @keydown.space.prevent="openViewer(index)"
          >
            <!-- Image thumbnail -->
            <template v-if="item.type === 'image'">
              <img
                :src="item.url"
                :alt="item.alt_text || item.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </template>

            <!-- Vidéo -->
            <template v-else-if="item.type === 'video'">
              <img
                v-if="item.thumbnail_url"
                :src="item.thumbnail_url"
                :alt="item.alt_text || item.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div v-else class="w-full h-full bg-purple-50 dark:bg-purple-900/30 flex flex-col items-center justify-center gap-2">
                <div class="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-play" class="w-6 h-6 text-purple-600 dark:text-purple-400 ml-0.5" />
                </div>
                <span class="text-xs text-purple-600 dark:text-purple-400 font-medium px-2 text-center line-clamp-2">{{ item.name }}</span>
              </div>
            </template>

            <!-- Audio -->
            <template v-else-if="item.type === 'audio'">
              <div class="w-full h-full bg-amber-50 dark:bg-amber-900/30 flex flex-col items-center justify-center gap-2">
                <div class="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-headphones" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <span class="text-xs text-amber-600 dark:text-amber-400 font-medium px-2 text-center line-clamp-2">{{ item.name }}</span>
              </div>
            </template>

            <!-- Document -->
            <template v-else>
              <img
                v-if="item.thumbnail_url"
                :src="item.thumbnail_url"
                :alt="item.alt_text || item.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div v-else class="w-full h-full bg-red-50 dark:bg-red-900/30 flex flex-col items-center justify-center gap-2">
                <div class="w-14 h-14 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-file-lines" class="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <span class="text-xs text-red-600 dark:text-red-400 font-medium px-2 text-center line-clamp-2">{{ item.name }}</span>
                <span v-if="getFileExtension(item)" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-800/50 text-red-500 dark:text-red-400">
                  {{ getFileExtension(item) }}
                </span>
              </div>
            </template>

            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <font-awesome-icon
                :icon="item.type === 'image' ? 'fa-solid fa-expand' : getTypeIcon(item.type)"
                class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>

            <!-- Badge type pour non-images -->
            <div
              v-if="item.type !== 'image'"
              class="absolute top-2 left-2 rtl:left-auto rtl:right-2"
            >
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/90 dark:bg-gray-800/90"
                :class="getTypeColor(item.type)"
              >
                <font-awesome-icon :icon="getTypeIcon(item.type)" class="w-2.5 h-2.5" />
                {{ item.type }}
              </span>
            </div>

            <!-- Titre au survol pour les images -->
            <div
              v-if="item.type === 'image'"
              class="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <p class="text-white text-xs font-medium line-clamp-2">{{ item.name }}</p>
            </div>

            <!-- Bouton téléchargement -->
            <button
              type="button"
              class="absolute top-2 right-2 rtl:right-auto rtl:left-2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              :title="t('mediatheque.album.download')"
              @click.stop="downloadMedia(item)"
            >
              <font-awesome-icon icon="fa-solid fa-download" class="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Visionneuse modale -->
    <Teleport to="body">
      <Transition name="viewer">
        <div
          v-if="viewerOpen && currentViewerItem"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          @click.self="closeViewer"
        >
          <!-- Header -->
          <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 py-4 z-20">
            <div class="text-white">
              <h3 class="font-medium text-sm sm:text-base">{{ currentViewerItem.name }}</h3>
              <p class="text-xs text-white/60">{{ viewerIndex + 1 }} / {{ filteredMedia.length }}</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                @click="downloadMedia(currentViewerItem)"
              >
                <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
              </button>
              <button
                type="button"
                class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                @click="closeViewer"
              >
                <font-awesome-icon icon="fa-solid fa-times" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Contenu -->
          <div class="relative flex items-center justify-center w-full h-full px-16 py-20">
            <!-- Navigation précédent -->
            <button
              v-if="viewerIndex > 0"
              type="button"
              class="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              @click="goToPrev"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-5 h-5" />
            </button>

            <!-- Image -->
            <img
              v-if="currentViewerItem.type === 'image'"
              :src="currentViewerItem.url"
              :alt="currentViewerItem.alt_text || currentViewerItem.name"
              class="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            <!-- Vidéo -->
            <div v-else-if="currentViewerItem.type === 'video'" class="w-full max-w-4xl">
              <video
                :key="currentViewerItem.id"
                controls
                class="w-full max-h-[80vh] rounded-lg bg-black"
                preload="metadata"
              >
                <source :src="currentViewerItem.url" :type="currentViewerItem.mime_type || 'video/mp4'" />
              </video>
            </div>

            <!-- Audio -->
            <div v-else-if="currentViewerItem.type === 'audio'" class="flex flex-col items-center gap-6">
              <div class="w-32 h-32 rounded-full bg-amber-100/20 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-headphones" class="w-16 h-16 text-amber-400" />
              </div>
              <h3 class="text-lg font-medium text-white text-center">{{ currentViewerItem.name }}</h3>
              <audio
                :key="currentViewerItem.id"
                controls
                autoplay
                class="w-80 max-w-full"
                preload="metadata"
              >
                <source :src="currentViewerItem.url" :type="currentViewerItem.mime_type || 'audio/mpeg'" />
              </audio>
              <button
                type="button"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                @click="downloadMedia(currentViewerItem)"
              >
                <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
                {{ t('mediatheque.album.download') }}
              </button>
            </div>

            <!-- Document PDF: affichage inline via iframe -->
            <div
              v-else-if="isInlineViewableDocument(currentViewerItem)"
              class="w-full max-w-5xl h-[80vh] bg-white rounded-lg overflow-hidden"
            >
              <iframe
                :key="currentViewerItem.id"
                :src="currentViewerItem.url"
                :title="currentViewerItem.name"
                class="w-full h-full"
              ></iframe>
            </div>

            <!-- Autres documents: fallback avec bouton de téléchargement -->
            <div v-else class="flex flex-col items-center gap-6">
              <div class="w-32 h-32 rounded-2xl bg-white/10 flex flex-col items-center justify-center gap-2">
                <font-awesome-icon icon="fa-solid fa-file-lines" class="w-16 h-16 text-red-400" />
                <span v-if="getFileExtension(currentViewerItem)" class="text-sm font-bold uppercase text-red-400">
                  {{ getFileExtension(currentViewerItem) }}
                </span>
              </div>
              <h3 class="text-lg font-medium text-white text-center max-w-md">{{ currentViewerItem.name }}</h3>
              <button
                type="button"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue-600 text-white font-medium hover:bg-brand-blue-700 transition-colors"
                @click="downloadMedia(currentViewerItem)"
              >
                <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
                {{ t('mediatheque.album.download') }}
              </button>
            </div>

            <!-- Navigation suivant -->
            <button
              v-if="viewerIndex < filteredMedia.length - 1"
              type="button"
              class="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              @click="goToNext"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-5 h-5" />
            </button>
          </div>

          <!-- Bande de miniatures -->
          <div v-if="filteredMedia.length > 1" class="absolute bottom-0 left-0 right-0 px-4 py-3 z-20">
            <div class="flex gap-2 overflow-x-auto justify-center pb-2">
              <button
                v-for="(item, index) in filteredMedia"
                :key="item.id"
                type="button"
                class="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all"
                :class="index === viewerIndex ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-50 hover:opacity-80'"
                @click="viewerIndex = index"
              >
                <img
                  v-if="item.type === 'image'"
                  :src="item.url"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                  :class="getTypeBg(item.type)"
                >
                  <font-awesome-icon
                    :icon="getTypeIcon(item.type)"
                    class="w-5 h-5"
                    :class="getTypeColor(item.type)"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.viewer-enter-active,
.viewer-leave-active {
  transition: opacity 0.3s ease;
}

.viewer-enter-from,
.viewer-leave-to {
  opacity: 0;
}
</style>
