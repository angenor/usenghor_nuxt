<script setup lang="ts">
import type { AlbumWithMedia } from '~/types/api/media'

interface Props {
  callSlug: string
}

const props = defineProps<Props>()

const { t } = useI18n()
const { getCallAlbums } = usePublicCallsApi()
const { getAlbumById } = usePublicAlbumsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

const albums = ref<AlbumWithMedia[]>([])
const loading = ref(true)

// Album modal state
const selectedAlbum = ref<AlbumWithMedia | null>(null)
const albumModalOpen = ref(false)

async function fetchAlbums() {
  loading.value = true
  try {
    const albumIds = await getCallAlbums(props.callSlug)
    if (albumIds.length > 0) {
      const results = await Promise.all(
        albumIds.map(id => getAlbumById(id)),
      )
      albums.value = results.filter((a): a is AlbumWithMedia => a !== null)
    }
  }
  catch (e) {
    console.error('Erreur chargement médiathèque de l\'appel:', e)
    albums.value = []
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAlbums()
})

// Build items for MediaAlbumCard from album media
function getAlbumItems(album: AlbumWithMedia) {
  return album.media_items.map(m => ({
    id: m.id,
    title_fr: m.alt_text || m.name || album.title,
    url: getMediaUrl(m) ? getImageVariantUrl(getMediaUrl(m)!, 'medium') : '',
    thumbnail: getMediaUrl(m) ? getImageVariantUrl(getMediaUrl(m)!, 'low') : '',
  }))
}

function openAlbum(album: AlbumWithMedia) {
  selectedAlbum.value = album
  albumModalOpen.value = true
}
</script>

<template>
  <div class="py-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
      <font-awesome-icon icon="fa-solid fa-photo-film" class="text-brand-blue-500" />
      {{ t('actualites.detail.call.tabs.mediatheque') }}
    </h2>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-600 border-t-transparent" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="albums.length === 0"
      class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl"
    >
      <font-awesome-icon icon="fa-solid fa-photo-film" class="w-12 h-12 text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ t('actualites.detail.call.noMedia') }}</p>
    </div>

    <!-- Albums grid -->
    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MediaAlbumCard
        v-for="album in albums"
        :key="album.id"
        :title="album.title"
        :items="getAlbumItems(album)"
        :item-count="album.media_items.length"
        @click="openAlbum(album)"
      />
    </div>

    <!-- Album modal -->
    <MediaAlbumModal
      v-if="selectedAlbum"
      :open="albumModalOpen"
      :title="selectedAlbum.title"
      :items="getAlbumItems(selectedAlbum)"
      @close="albumModalOpen = false"
    />
  </div>
</template>
