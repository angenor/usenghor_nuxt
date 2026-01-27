<script setup lang="ts">
import type { MediaRead, PublicationStatus } from '~/types/api'
import type { AlbumRead, AlbumWithMedia } from '~/composables/useAlbumsApi'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin'
})

const {
  listAlbums,
  getAlbumById,
  createAlbum: apiCreateAlbum,
  updateAlbum: apiUpdateAlbum,
  deleteAlbum: apiDeleteAlbum
} = useAlbumsApi()

const { getMediaUrl } = useMediaApi()

// Constantes locales (anciennement dans useMockData)
const albumStatusLabels: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié'
}

const albumStatusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

const mediaTypeLabels: Record<string, string> = {
  image: 'Image',
  video: 'Vidéo',
  audio: 'Audio',
  document: 'Document'
}

const mediaTypeIcons: Record<string, string> = {
  image: 'fa-image',
  video: 'fa-video',
  audio: 'fa-music',
  document: 'fa-file-pdf'
}

// === STATE ===
// Loading
const isLoading = ref(true)
const isSaving = ref(false)

// Données
const albumsList = ref<AlbumRead[]>([])
const albumsWithMedia = ref<Map<string, AlbumWithMedia>>(new Map())

// Filtres
const searchQuery = ref('')
const filterStatus = ref<'all' | 'draft' | 'published'>('all')

// Tri
const sortBy = ref<'created_at' | 'title'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)
const selectedAlbum = ref<AlbumRead | null>(null)
const selectedAlbumDetails = ref<AlbumWithMedia | null>(null)

// Formulaire création/édition
const albumForm = ref({
  title: '',
  description: '',
  status: 'draft' as PublicationStatus
})

// === API CALLS ===
async function loadAlbums() {
  isLoading.value = true
  try {
    const response = await listAlbums({
      search: searchQuery.value || null,
      status: filterStatus.value !== 'all' ? filterStatus.value as PublicationStatus : null
    })
    albumsList.value = response.items

    // Charger les détails pour les couvertures (max 20 premiers)
    albumsWithMedia.value.clear()
    const albumsToLoad = response.items.slice(0, 20)
    await Promise.all(
      albumsToLoad.map(async (album) => {
        try {
          const details = await getAlbumById(album.id)
          albumsWithMedia.value.set(album.id, details)
        } catch {
          // Ignorer les erreurs individuelles
        }
      })
    )
  } catch (error) {
    console.error('Erreur chargement albums:', error)
  } finally {
    isLoading.value = false
  }
}

// === COMPUTED ===
const stats = computed(() => {
  const total = albumsList.value.length
  const published = albumsList.value.filter(a => a.status === 'published').length
  const draft = albumsList.value.filter(a => a.status === 'draft').length
  let totalMedia = 0
  albumsWithMedia.value.forEach(album => {
    totalMedia += album.media_items.length
  })
  return { total, published, draft, totalMedia }
})

const filteredAlbums = computed(() => {
  let albums = [...albumsList.value]

  // Tri côté client (le backend ne supporte pas encore le tri)
  albums.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'title') {
      comparison = a.title.localeCompare(b.title)
    } else {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return sortOrder.value === 'desc' ? -comparison : comparison
  })

  return albums
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterStatus.value !== 'all'
})

const selectedAlbumMedia = computed(() => {
  if (!selectedAlbumDetails.value) return []
  return selectedAlbumDetails.value.media_items
})

// Helper functions
function getAlbumCover(albumId: string): MediaRead | null {
  const details = albumsWithMedia.value.get(albumId)
  if (!details || details.media_items.length === 0) return null
  // Retourner la première image, sinon le premier média
  return details.media_items.find(m => m.type === 'image') || details.media_items[0]
}

function getAlbumMediaCount(albumId: string): number {
  return albumsWithMedia.value.get(albumId)?.media_items.length || 0
}

// === WATCHERS ===
watch(searchQuery, useDebounceFn(() => {
  loadAlbums()
}, 300))

watch(filterStatus, () => {
  loadAlbums()
})

// === LIFECYCLE ===
onMounted(() => {
  loadAlbums()
})

// === METHODS ===
const toggleSort = (column: typeof sortBy.value) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  loadAlbums()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getStatusLabel = (status: string) => {
  return albumStatusLabels[status] || status
}

const getStatusColor = (status: string) => {
  return albumStatusColors[status] || 'bg-gray-100 text-gray-800'
}

// Modals actions
const openCreateModal = () => {
  albumForm.value = {
    title: '',
    description: '',
    status: 'draft'
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  albumForm.value = { title: '', description: '', status: 'draft' }
}

const handleCreateAlbum = async () => {
  isSaving.value = true
  try {
    await apiCreateAlbum({
      title: albumForm.value.title,
      description: albumForm.value.description || null,
      status: albumForm.value.status
    })
    closeCreateModal()
    await loadAlbums()
  } catch (error) {
    console.error('Erreur création album:', error)
  } finally {
    isSaving.value = false
  }
}

const openEditModal = (album: AlbumRead) => {
  selectedAlbum.value = album
  albumForm.value = {
    title: album.title,
    description: album.description || '',
    status: album.status
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedAlbum.value = null
  albumForm.value = { title: '', description: '', status: 'draft' }
}

const handleUpdateAlbum = async () => {
  if (!selectedAlbum.value) return
  isSaving.value = true
  try {
    await apiUpdateAlbum(selectedAlbum.value.id, {
      title: albumForm.value.title,
      description: albumForm.value.description || null,
      status: albumForm.value.status
    })
    closeEditModal()
    await loadAlbums()
  } catch (error) {
    console.error('Erreur mise à jour album:', error)
  } finally {
    isSaving.value = false
  }
}

const openDeleteModal = (album: AlbumRead) => {
  selectedAlbum.value = album
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedAlbum.value = null
}

const handleDeleteAlbum = async () => {
  if (!selectedAlbum.value) return
  isSaving.value = true
  try {
    await apiDeleteAlbum(selectedAlbum.value.id)
    closeDeleteModal()
    await loadAlbums()
  } catch (error) {
    console.error('Erreur suppression album:', error)
  } finally {
    isSaving.value = false
  }
}

const openViewModal = async (album: AlbumRead) => {
  selectedAlbum.value = album
  try {
    selectedAlbumDetails.value = await getAlbumById(album.id)
  } catch (error) {
    console.error('Erreur chargement détails album:', error)
    selectedAlbumDetails.value = null
  }
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedAlbum.value = null
  selectedAlbumDetails.value = null
}

const handleToggleStatus = async (album: AlbumRead) => {
  const newStatus: PublicationStatus = album.status === 'draft' ? 'published' : 'draft'
  try {
    await apiUpdateAlbum(album.id, { status: newStatus })
    await loadAlbums()
  } catch (error) {
    console.error('Erreur changement statut:', error)
  }
}

const duplicateAlbum = async (album: AlbumRead) => {
  // Créer un nouvel album avec le même titre + " (copie)"
  try {
    const details = await getAlbumById(album.id)
    await apiCreateAlbum({
      title: `${album.title} (copie)`,
      description: album.description,
      status: 'draft'
    })
    // Note: La duplication des médias nécessiterait d'ajouter les médias au nouvel album
    await loadAlbums()
  } catch (error) {
    console.error('Erreur duplication album:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Médiathèque - Albums
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Organisez vos médias en albums thématiques
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openCreateModal"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Créer un album
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Publiés</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.published }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Brouillons</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.draft }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Médias totaux</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalMedia }}</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Recherche -->
        <div class="relative flex-1 lg:max-w-md">
          <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un album..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Filtre statut -->
          <select
            v-model="filterStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>

          <!-- Tri -->
          <select
            v-model="sortBy"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="created_at">Date de création</option>
            <option value="title">Titre</option>
          </select>

          <button
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            :title="sortOrder === 'asc' ? 'Tri croissant' : 'Tri décroissant'"
          >
            <font-awesome-icon
              :icon="sortOrder === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'"
              class="h-4 w-4"
            />
          </button>

          <!-- Réinitialiser -->
          <button
            v-if="hasActiveFilters"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-gray-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
            @click="resetFilters"
          >
            <font-awesome-icon icon="fa-solid fa-times" class="mr-1 h-3 w-3" />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <!-- Liste des albums (cartes) -->
    <div v-else-if="filteredAlbums.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="album in filteredAlbums"
        :key="album.id"
        class="group overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
      >
        <!-- Image de couverture -->
        <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            v-if="getAlbumCover(album.id)"
            :src="getMediaUrl(getAlbumCover(album.id)!) || ''"
            :alt="album.title"
            class="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center"
          >
            <font-awesome-icon icon="fa-solid fa-images" class="h-16 w-16 text-gray-300 dark:text-gray-600" />
          </div>

          <!-- Badge statut -->
          <span
            :class="['absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(album.status)]"
          >
            {{ getStatusLabel(album.status) }}
          </span>

          <!-- Badge nombre de médias -->
          <span class="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {{ getAlbumMediaCount(album.id) }} média{{ getAlbumMediaCount(album.id) > 1 ? 's' : '' }}
          </span>

          <!-- Overlay actions au hover -->
          <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
              title="Voir l'album"
              @click="openViewModal(album)"
            >
              <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
            </button>
            <NuxtLink
              :to="`/admin/mediatheque/albums/${album.id}`"
              class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
              title="Gérer les médias"
            >
              <font-awesome-icon icon="fa-solid fa-images" class="h-4 w-4" />
            </NuxtLink>
            <button
              class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
              title="Modifier"
              @click="openEditModal(album)"
            >
              <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Infos -->
        <div class="p-4">
          <h3 class="mb-1 truncate font-semibold text-gray-900 dark:text-white" :title="album.title">
            {{ album.title }}
          </h3>
          <p v-if="album.description" class="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {{ album.description }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500">
            Créé le {{ formatDate(album.created_at) }}
          </p>

          <!-- Actions -->
          <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
            <div class="flex gap-1">
              <button
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                :title="album.status === 'draft' ? 'Publier' : 'Repasser en brouillon'"
                @click="handleToggleStatus(album)"
              >
                <font-awesome-icon
                  :icon="album.status === 'draft' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
                  class="h-4 w-4"
                />
              </button>
              <button
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="Dupliquer"
                @click="duplicateAlbum(album)"
              >
                <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
              </button>
            </div>
            <button
              class="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Supprimer"
              @click="openDeleteModal(album)"
            >
              <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-else
      class="flex flex-col items-center justify-center rounded-lg bg-white py-16 text-center shadow dark:bg-gray-800"
    >
      <font-awesome-icon icon="fa-solid fa-folder-open" class="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
      <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
        {{ hasActiveFilters ? 'Aucun album trouvé' : 'Aucun album' }}
      </h3>
      <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {{ hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Créez votre premier album pour organiser vos médias' }}
      </p>
      <button
        v-if="!hasActiveFilters"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openCreateModal"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Créer un album
      </button>
      <button
        v-else
        class="text-sm text-blue-600 hover:underline dark:text-blue-400"
        @click="resetFilters"
      >
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Modal création -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeCreateModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Créer un album</h2>
            <button
              class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeCreateModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6" @submit.prevent="handleCreateAlbum">
            <div class="space-y-4">
              <!-- Titre -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="albumForm.title"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Nom de l'album"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  v-model="albumForm.description"
                  rows="3"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Description de l'album (optionnel)"
                />
              </div>

              <!-- Statut -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Statut
                </label>
                <select
                  v-model="albumForm.status"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeCreateModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                Créer l'album
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal édition -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedAlbum"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Modifier l'album</h2>
            <button
              class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6" @submit.prevent="handleUpdateAlbum">
            <div class="space-y-4">
              <!-- Titre -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="albumForm.title"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  v-model="albumForm.description"
                  rows="3"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Statut -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Statut
                </label>
                <select
                  v-model="albumForm.status"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeEditModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && selectedAlbum"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-trash" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'album
            </h3>

            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer l'album <strong>{{ selectedAlbum.title }}</strong> ?
              Cette action est irréversible.
            </p>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="mr-1" />
              Les médias ne seront pas supprimés, seulement les associations avec cet album.
            </p>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isSaving"
              @click="handleDeleteAlbum"
            >
              <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal vue album -->
    <Teleport to="body">
      <div
        v-if="showViewModal && selectedAlbum"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeViewModal"
      >
        <div class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedAlbum.title }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedAlbumMedia.length }} média{{ selectedAlbumMedia.length > 1 ? 's' : '' }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <NuxtLink
                :to="`/admin/mediatheque/albums/${selectedAlbum.id}`"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <font-awesome-icon icon="fa-solid fa-pen" class="mr-1 h-3 w-3" />
                Gérer les médias
              </NuxtLink>
              <button
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                @click="closeViewModal"
              >
                <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Description -->
          <div v-if="selectedAlbum.description" class="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedAlbum.description }}</p>
          </div>

          <!-- Galerie -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="selectedAlbumMedia.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <div
                v-for="media in selectedAlbumMedia"
                :key="media.id"
                class="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                <img
                  v-if="media.type === 'image'"
                  :src="getMediaUrl(media) || ''"
                  :alt="media.alt_text || media.name"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full w-full flex-col items-center justify-center"
                >
                  <font-awesome-icon
                    :icon="`fa-solid ${mediaTypeIcons[media.type]}`"
                    class="h-10 w-10 text-gray-400 dark:text-gray-500"
                  />
                  <span class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {{ mediaTypeLabels[media.type] }}
                  </span>
                </div>

                <!-- Overlay info -->
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p class="truncate text-xs font-medium text-white">{{ media.name }}</p>
                </div>
              </div>
            </div>

            <!-- État vide -->
            <div v-else class="flex flex-col items-center justify-center py-12 text-center">
              <font-awesome-icon icon="fa-solid fa-images" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Aucun média dans cet album</p>
              <NuxtLink
                :to="`/admin/mediatheque/albums/${selectedAlbum.id}`"
                class="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Ajouter des médias
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
