<script setup lang="ts">
import type { PublicAlbumWithMedia } from '~/types/api/media'

const props = defineProps<{
  albums: PublicAlbumWithMedia[]
}>()

// Album modal state
const selectedAlbumIndex = ref<number | null>(null)

const selectedAlbum = computed(() => {
  if (selectedAlbumIndex.value === null) return null
  return props.albums[selectedAlbumIndex.value] || null
})

// Convertir les médias de l'album en format MediaItem attendu par MediaAlbumCard/Modal
function toMediaItems(album: PublicAlbumWithMedia) {
  return album.media_items.map(m => ({
    id: m.id,
    title_fr: m.alt_text || m.name,
    url: m.url,
    thumbnail: m.url + '?variant=low',
  }))
}

function openAlbum(index: number) {
  selectedAlbumIndex.value = index
}

function closeAlbum() {
  selectedAlbumIndex.value = null
}
</script>

<template>
  <div v-if="albums.length > 0">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MediaAlbumCard
        v-for="(album, index) in albums"
        :key="album.id"
        :title="album.title"
        :items="toMediaItems(album)"
        :item-count="album.media_items.length"
        @click="openAlbum(index)"
      />
    </div>

    <!-- Modal album -->
    <MediaAlbumModal
      v-if="selectedAlbum"
      :open="selectedAlbumIndex !== null"
      :title="selectedAlbum.title"
      :items="toMediaItems(selectedAlbum)"
      @close="closeAlbum"
    />
  </div>
</template>
