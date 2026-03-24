<script setup lang="ts">
import type { AlbumRead } from '~/composables/useAlbumsApi'
import type { ContentAlbumEntry } from '~/types/api/media'

const props = defineProps<{
  albums: ContentAlbumEntry[]
  loading?: boolean
}>()

const emit = defineEmits<{
  add: [albumIds: string[]]
  remove: [albumId: string]
  reorder: [albumIds: string[]]
}>()

const { listAlbums } = useAlbumsApi()

const allAlbums = ref<AlbumRead[]>([])
const isLoadingAlbums = ref(true)
const showAddModal = ref(false)
const selectedAlbumId = ref('')
const searchQuery = ref('')

onMounted(async () => {
  try {
    const response = await listAlbums({ limit: 100 })
    allAlbums.value = response.items
  }
  catch (err) {
    console.error('Erreur chargement albums:', err)
  }
  finally {
    isLoadingAlbums.value = false
  }
})

// Albums déjà associés (IDs)
const linkedAlbumIds = computed(() => props.albums.map(a => a.album_external_id))

// Albums disponibles (non encore associés), filtrés par recherche
const availableAlbums = computed(() => {
  let filtered = allAlbums.value.filter(a => !linkedAlbumIds.value.includes(a.id))
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a => a.title.toLowerCase().includes(q))
  }
  return filtered
})

function handleAdd() {
  if (!selectedAlbumId.value) return
  emit('add', [selectedAlbumId.value])
  showAddModal.value = false
  selectedAlbumId.value = ''
  searchQuery.value = ''
}

function handleRemove(albumId: string) {
  if (!confirm('Retirer cet album ?')) return
  emit('remove', albumId)
}

function moveUp(index: number) {
  if (index <= 0) return
  const ids = linkedAlbumIds.value.slice()
  ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
  emit('reorder', ids)
}

function moveDown(index: number) {
  if (index >= linkedAlbumIds.value.length - 1) return
  const ids = linkedAlbumIds.value.slice()
  ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
  emit('reorder', ids)
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'published': return 'Publié'
    case 'draft': return 'Brouillon'
    case 'archived': return 'Archivé'
    default: return status
  }
}
</script>

<template>
  <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <font-awesome-icon :icon="['fas', 'images']" class="h-5 w-5 text-purple-500" />
        Médiathèque
      </h2>
      <button
        class="text-sm text-blue-600 hover:underline dark:text-blue-400"
        @click="showAddModal = true"
      >
        + Ajouter un album
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="loading || isLoadingAlbums" class="flex items-center justify-center py-8">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-2xl text-gray-400" />
    </div>

    <!-- Liste des albums associés -->
    <div v-else-if="albums.length > 0" class="space-y-3">
      <div
        v-for="(entry, index) in albums"
        :key="entry.album_external_id"
        class="group flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
      >
        <div class="flex items-center gap-3">
          <!-- Miniature -->
          <div v-if="entry.album?.cover_url" class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
            <img :src="entry.album.cover_url" :alt="entry.album?.title" class="h-full w-full object-cover">
          </div>
          <div v-else class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'photo-film']" class="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div class="font-medium text-gray-900 dark:text-white">
              {{ entry.album?.title || 'Album introuvable' }}
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span v-if="entry.album" :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusBadgeClass(entry.album.status)]">
                {{ getStatusLabel(entry.album.status) }}
              </span>
              <span v-if="entry.album?.media_count">
                {{ entry.album.media_count }} média{{ entry.album.media_count > 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Boutons ordre -->
          <button
            v-if="albums.length > 1"
            :disabled="index === 0"
            class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-700"
            title="Monter"
            @click="moveUp(index)"
          >
            <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3" />
          </button>
          <button
            v-if="albums.length > 1"
            :disabled="index === albums.length - 1"
            class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 dark:hover:bg-gray-700"
            title="Descendre"
            @click="moveDown(index)"
          >
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
          </button>
          <!-- Voir l'album -->
          <NuxtLink
            :to="`/admin/mediatheque/albums/${entry.album_external_id}`"
            class="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
            title="Voir l'album"
          >
            <font-awesome-icon :icon="['fas', 'external-link']" class="h-4 w-4" />
          </NuxtLink>
          <!-- Retirer -->
          <button
            class="rounded p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20"
            title="Retirer"
            @click="handleRemove(entry.album_external_id)"
          >
            <font-awesome-icon :icon="['fas', 'unlink']" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="py-8 text-center text-gray-400">
      <font-awesome-icon :icon="['fas', 'photo-film']" class="mb-2 h-8 w-8" />
      <p>Aucun album associé</p>
    </div>

    <!-- Modal ajout album -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter un album
          </h3>

          <!-- Recherche -->
          <div class="mb-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un album..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            >
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Album <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedAlbumId"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">
                Sélectionnez un album
              </option>
              <option v-for="album in availableAlbums" :key="album.id" :value="album.id">
                {{ album.title }} ({{ album.status }})
              </option>
            </select>
            <p v-if="availableAlbums.length === 0" class="mt-2 text-sm text-gray-500">
              Tous les albums sont déjà associés ou aucun album disponible.
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showAddModal = false; searchQuery = ''"
            >
              Annuler
            </button>
            <button
              :disabled="!selectedAlbumId"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleAdd"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
