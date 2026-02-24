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

// Fetch albums from API (pas de await — le composant est monté conditionnellement via v-if)
const { data: albums, pending, error } = useLazyAsyncData(
  `campus-${props.campusId}-albums`,
  () => getCampusAlbums(props.campusId),
  { server: false, default: () => [] as AlbumPublicWithMedia[] }
)

// Resolve media URL
function resolveMediaUrl(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${baseUrl}${url}`
}

// Filter albums with images
const imageAlbums = computed(() => {
  if (!albums.value) return []
  return albums.value.filter(album =>
    album.media_items.some(media => media.type === 'image')
  )
})

// Convert album media to MediaAlbumCard/Modal format
function getAlbumItems(album: AlbumPublicWithMedia) {
  return album.media_items
    .filter(m => m.type === 'image')
    .map(m => ({
      id: m.id,
      title_fr: m.alt_text || m.name || album.title,
      url: resolveMediaUrl(m.url) || '',
      thumbnail: resolveMediaUrl(m.url) || '',
    }))
}

// Album modal state
const selectedAlbum = ref<AlbumPublicWithMedia | null>(null)
const albumModalOpen = ref(false)

function openAlbum(album: AlbumPublicWithMedia) {
  selectedAlbum.value = album
  albumModalOpen.value = true
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
      <MediaAlbumCard
        v-for="album in imageAlbums"
        :key="album.id"
        :title="album.title"
        :items="getAlbumItems(album)"
        :item-count="album.media_items.filter(m => m.type === 'image').length"
        @click="openAlbum(album)"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="py-12 text-center">
      <font-awesome-icon icon="fa-solid fa-photo-film" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noMedia') }}</p>
    </div>

    <!-- Album Modal (with grid + single image view + keyboard nav) -->
    <MediaAlbumModal
      v-if="selectedAlbum"
      :open="albumModalOpen"
      :title="selectedAlbum.title"
      :items="getAlbumItems(selectedAlbum)"
      @close="albumModalOpen = false"
    />
  </div>
</template>
