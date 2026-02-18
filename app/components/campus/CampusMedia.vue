<script setup lang="ts">
import type { AlbumPublicWithMedia } from '~/composables/usePublicCampusApi'

interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusAlbums } = usePublicCampusApi()
const config = useRuntimeConfig()
const baseUrl = (config.public.apiBase || config.public.apiBaseUrl || 'http://localhost:8000') as string

// Fetch albums from API
const { data: albums, pending, error } = await useAsyncData(
  `campus-${props.campusId}-albums`,
  () => getCampusAlbums(props.campusId),
  { server: true, default: () => [] }
)

// Resolve media URL
function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${baseUrl}${url}`
}

// Album modal state
const selectedAlbum = ref<AlbumPublicWithMedia | null>(null)
const albumModalOpen = ref(false)

function openAlbum(album: AlbumPublicWithMedia) {
  selectedAlbum.value = album
  albumModalOpen.value = true
}

function closeAlbum() {
  albumModalOpen.value = false
  selectedAlbum.value = null
}

// Filter albums by type (images only, videos only, or mixed)
const imageAlbums = computed(() => {
  if (!albums.value) return []
  return albums.value.filter(album =>
    album.media_items.some(media => media.type === 'image')
  )
})

// Get album cover image (first image in the album)
function getAlbumCover(album: AlbumPublicWithMedia): string | null {
  const firstImage = album.media_items.find(m => m.type === 'image')
  if (firstImage?.url) {
    return resolveMediaUrl(firstImage.url)
  }
  return null
}

// Get album preview images (up to 4)
function getAlbumPreviews(album: AlbumPublicWithMedia): string[] {
  const images = album.media_items
    .filter(m => m.type === 'image')
    .slice(0, 4)
    .map(m => resolveMediaUrl(m.url))
    .filter((url): url is string => url !== null)
  return images
}

// Count images in album
function getImageCount(album: AlbumPublicWithMedia): number {
  return album.media_items.filter(m => m.type === 'image').length
}
</script>

<template>
  <div class="py-8">
    <h2 class="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
      <span class="relative inline-block">
        {{ t('partners.campus.media.title') }}
        <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300"></span>
      </span>
    </h2>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue-500 border-t-transparent"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-12 text-center">
      <font-awesome-icon icon="fa-solid fa-exclamation-circle" class="mb-4 h-12 w-12 text-red-400" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.media.error') }}</p>
    </div>

    <!-- Albums Grid -->
    <div v-else-if="imageAlbums.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="album in imageAlbums"
        :key="album.id"
        class="group relative block overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl dark:bg-gray-800"
        @click="openAlbum(album)"
      >
        <!-- Album Cover with stacked effect -->
        <div class="relative aspect-[4/3] overflow-hidden">
          <!-- Stacked cards effect -->
          <div class="absolute inset-0 translate-x-1 translate-y-1 rotate-2 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div class="absolute inset-0 -translate-x-0.5 -translate-y-0.5 -rotate-1 rounded-lg bg-gray-300 dark:bg-gray-600"></div>

          <!-- Main image -->
          <div class="relative h-full w-full overflow-hidden rounded-lg">
            <img
              v-if="getAlbumCover(album)"
              :src="getAlbumCover(album)!"
              :alt="album.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-images" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <!-- Overlay with count -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div class="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-gray-900">
                <font-awesome-icon icon="fa-solid fa-images" class="h-5 w-5" />
                <span class="font-medium">{{ getImageCount(album) }} photos</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Album info -->
        <div class="p-4">
          <h4 class="font-semibold text-gray-900 transition-colors group-hover:text-brand-blue-600 dark:text-white dark:group-hover:text-brand-blue-400">
            {{ album.title }}
          </h4>
          <p v-if="album.description" class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {{ album.description }}
          </p>
        </div>
      </button>
    </div>

    <!-- Empty state -->
    <div v-else class="py-12 text-center">
      <font-awesome-icon icon="fa-solid fa-photo-film" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noMedia') }}</p>
    </div>

    <!-- Album Modal -->
    <Teleport to="body">
      <div
        v-if="albumModalOpen && selectedAlbum"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        @click.self="closeAlbum"
      >
        <div class="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ selectedAlbum.title }}
              </h3>
              <p v-if="selectedAlbum.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ selectedAlbum.description }}
              </p>
            </div>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              @click="closeAlbum"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-6 w-6" />
            </button>
          </div>

          <!-- Gallery Grid -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <div
                v-for="media in selectedAlbum.media_items.filter(m => m.type === 'image')"
                :key="media.id"
                class="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <img
                  :src="resolveMediaUrl(media.url) || ''"
                  :alt="media.alt_text || media.name"
                  class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                >
                <!-- Hover overlay -->
                <div class="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p class="truncate text-sm font-medium text-white">
                    {{ media.alt_text || media.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
