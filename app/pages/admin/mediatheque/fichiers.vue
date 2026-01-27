<script setup lang="ts">
import type { MediaRead, MediaType } from '~/types/api'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin'
})

const {
  listMedia,
  getMediaStatistics,
  getMediaUsage,
  deleteMedia: apiDeleteMedia,
  bulkDeleteMedia,
  downloadMediaZip,
  getDownloadUrl,
  updateMedia,
  getMediaUrl,
  formatFileSize,
  formatDuration
} = useMediaApi()

// Constantes locales (anciennement dans useMockData)
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

const mediaTypeColors: Record<string, string> = {
  image: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  audio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  document: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
}

// === STATE ===
// Vue
const viewMode = ref<'grid' | 'list'>('grid')

// Filtres
const searchQuery = ref('')
const filterType = ref<'all' | 'image' | 'video' | 'audio' | 'document'>('all')
const dateFrom = ref('')
const dateTo = ref('')

// Tri
const sortBy = ref<'created_at' | 'name' | 'size_bytes'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(24)
const totalItems = ref(0)
const totalPages = ref(1)

// Sélection
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modals
const showDetailModal = ref(false)
const showDeleteModal = ref(false)
const showUploadModal = ref(false)
const selectedMedia = ref<MediaRead | null>(null)
const deletingMedia = ref<MediaRead | null>(null)

// État de chargement
const isLoading = ref(true)
const isSaving = ref(false)

// Données de l'API
const mediaList = ref<MediaRead[]>([])
const stats = ref({
  total: 0,
  images: 0,
  videos: 0,
  documents: 0,
  audio: 0,
  totalSize: 0
})

// Formulaire d'édition
const editForm = reactive({
  name: '',
  description: '',
  alt_text: '',
  credits: ''
})

// === API CALLS ===
async function loadMedia() {
  isLoading.value = true
  try {
    const response = await listMedia({
      page: currentPage.value,
      limit: itemsPerPage.value,
      type: filterType.value !== 'all' ? filterType.value as MediaType : null,
      search: searchQuery.value || null,
      date_from: dateFrom.value || null,
      date_to: dateTo.value || null,
      sort_by: sortBy.value,
      sort_order: sortOrder.value
    })
    mediaList.value = response?.items || []
    totalItems.value = response?.total || 0
    totalPages.value = response?.pages || 1
  } catch (error) {
    console.error('Erreur chargement médias:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadStats() {
  try {
    const response = await getMediaStatistics()
    const byType = response?.by_type || {}
    stats.value = {
      total: response?.total || 0,
      images: byType.image || 0,
      videos: byType.video || 0,
      documents: byType.document || 0,
      audio: byType.audio || 0,
      totalSize: response?.total_size_bytes || 0
    }
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

// Utilisation d'un média (async)
const mediaUsageCache = ref<Map<string, { is_used: boolean; usage: Array<{ type: string; id: string; title: string }> }>>(new Map())

async function loadMediaUsage(mediaId: string) {
  if (mediaUsageCache.value.has(mediaId)) return
  try {
    const usage = await getMediaUsage(mediaId)
    mediaUsageCache.value.set(mediaId, usage)
  } catch {
    mediaUsageCache.value.set(mediaId, { is_used: false, usage: [] })
  }
}

// === COMPUTED ===
const paginatedMedia = computed(() => mediaList.value)

const hasActiveFilters = computed(() => {
  return searchQuery.value ||
    filterType.value !== 'all' ||
    dateFrom.value ||
    dateTo.value
})

// === WATCHERS ===
watch(searchQuery, useDebounceFn(() => {
  currentPage.value = 1
  loadMedia()
}, 300))

watch([filterType, dateFrom, dateTo, sortBy, sortOrder], () => {
  currentPage.value = 1
  loadMedia()
})

watch(currentPage, loadMedia)

// === LIFECYCLE ===
onMounted(() => {
  loadMedia()
  loadStats()
})

// === METHODS ===
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedMedia.value.map(m => m.id)
  } else {
    selectedIds.value = []
  }
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const isSelected = (id: string) => selectedIds.value.includes(id)

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
  filterType.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

// Actions
const openDetailModal = async (media: MediaRead) => {
  selectedMedia.value = media
  // Pré-remplir le formulaire d'édition
  editForm.name = media.name
  editForm.description = media.description || ''
  editForm.alt_text = media.alt_text || ''
  editForm.credits = media.credits || ''
  // Charger l'utilisation
  await loadMediaUsage(media.id)
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedMedia.value = null
}

const openDeleteModal = async (media: MediaRead) => {
  deletingMedia.value = media
  await loadMediaUsage(media.id)
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingMedia.value = null
}

const handleDeleteMedia = async () => {
  if (!deletingMedia.value) return
  try {
    await apiDeleteMedia(deletingMedia.value.id)
    closeDeleteModal()
    await loadMedia()
    await loadStats()
  } catch (error) {
    console.error('Erreur suppression:', error)
  }
}

const handleBulkDelete = async () => {
  if (selectedIds.value.length === 0) return
  try {
    await bulkDeleteMedia(selectedIds.value)
    selectedIds.value = []
    selectAll.value = false
    await loadMedia()
    await loadStats()
  } catch (error) {
    console.error('Erreur suppression en masse:', error)
  }
}

const downloadMedia = (media: MediaRead) => {
  if (media.is_external_url) {
    window.open(media.url, '_blank')
  } else {
    window.open(getDownloadUrl(media.id), '_blank')
  }
}

const handleBulkDownload = async () => {
  if (selectedIds.value.length === 0) return
  try {
    const blob = await downloadMediaZip(selectedIds.value)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `media-${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur téléchargement ZIP:', error)
  }
}

const copyUrl = (media: MediaRead) => {
  const url = getMediaUrl(media)
  if (url) {
    navigator.clipboard.writeText(url)
  }
}

const handleSaveMedia = async () => {
  if (!selectedMedia.value) return
  isSaving.value = true
  try {
    await updateMedia(selectedMedia.value.id, {
      name: editForm.name,
      description: editForm.description || null,
      alt_text: editForm.alt_text || null,
      credits: editForm.credits || null
    })
    closeDetailModal()
    await loadMedia()
  } catch (error) {
    console.error('Erreur mise à jour:', error)
  } finally {
    isSaving.value = false
  }
}

// Formatage
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getMediaIcon = (type: string) => {
  return mediaTypeIcons[type as keyof typeof mediaTypeIcons] || 'fa-file'
}

const getMediaTypeLabel = (type: string) => {
  return mediaTypeLabels[type as keyof typeof mediaTypeLabels] || type
}

const getMediaTypeColor = (type: string) => {
  return mediaTypeColors[type as keyof typeof mediaTypeColors] || 'bg-gray-100 text-gray-800'
}

// Vérifier utilisation (depuis le cache)
const getMediaUsageInfo = (mediaId: string) => {
  return mediaUsageCache.value.get(mediaId) || { is_used: false, usage: [] }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Médiathèque - Fichiers
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez vos images, vidéos et documents
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="showUploadModal = true"
      >
        <font-awesome-icon icon="fa-solid fa-upload" class="h-4 w-4" />
        Ajouter des fichiers
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Images</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.images }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Vidéos</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.videos }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Documents</p>
        <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ stats.documents }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Audio</p>
        <p class="text-2xl font-bold text-pink-600 dark:text-pink-400">{{ stats.audio }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Espace total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatFileSize(stats.totalSize) }}</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4">
        <!-- Ligne 1: Recherche + Vue + Filtres -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <!-- Recherche -->
          <div class="relative flex-1 lg:max-w-md">
            <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un fichier..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Toggle vue -->
            <div class="flex rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                class="rounded-l-lg px-3 py-2 text-sm transition-colors"
                :class="viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300'"
                @click="viewMode = 'grid'"
              >
                <font-awesome-icon icon="fa-solid fa-grid-2" class="h-4 w-4" />
              </button>
              <button
                class="rounded-r-lg px-3 py-2 text-sm transition-colors"
                :class="viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300'"
                @click="viewMode = 'list'"
              >
                <font-awesome-icon icon="fa-solid fa-list" class="h-4 w-4" />
              </button>
            </div>

            <!-- Filtres -->
            <select
              v-model="filterType"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les types</option>
              <option value="image">Images</option>
              <option value="video">Vidéos</option>
              <option value="document">Documents</option>
              <option value="audio">Audio</option>
            </select>

            <select
              v-model="sortBy"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="created_at">Tri par date</option>
              <option value="name">Tri par nom</option>
              <option value="size_bytes">Tri par taille</option>
            </select>

            <button
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            >
              <font-awesome-icon :icon="sortOrder === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Ligne 2: Dates + Reset -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">Du</span>
            <input
              v-model="dateFrom"
              type="date"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">au</span>
            <input
              v-model="dateTo"
              type="date"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            v-if="hasActiveFilters"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="resetFilters"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Actions en masse -->
      <div
        v-if="selectedIds.length > 0"
        class="mt-4 flex items-center gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
      >
        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
          {{ selectedIds.length }} fichier(s) sélectionné(s)
        </span>
        <div class="flex gap-2">
          <button
            class="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
            @click="handleBulkDownload"
          >
            Télécharger (ZIP)
          </button>
          <button
            class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            @click="handleBulkDelete"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <!-- Vue Grille -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      <div
        v-for="media in paginatedMedia"
        :key="media.id"
        class="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
        :class="{ 'ring-2 ring-blue-500': isSelected(media.id) }"
        @click="openDetailModal(media)"
      >
        <!-- Checkbox -->
        <div class="absolute left-2 top-2 z-10" @click.stop>
          <input
            type="checkbox"
            :checked="isSelected(media.id)"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            @change="toggleSelect(media.id)"
          />
        </div>

        <!-- Aperçu -->
        <div class="aspect-square bg-gray-100 dark:bg-gray-700">
          <img
            v-if="media.type === 'image'"
            :src="getMediaUrl(media) || ''"
            :alt="media.alt_text || media.name"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full flex-col items-center justify-center p-4">
            <font-awesome-icon :icon="`fa-solid ${getMediaIcon(media.type)}`" class="mb-2 h-12 w-12 text-gray-400" />
            <span
              class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
              :class="getMediaTypeColor(media.type)"
            >
              {{ getMediaTypeLabel(media.type) }}
            </span>
          </div>
        </div>

        <!-- Infos -->
        <div class="p-3">
          <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
            {{ media.name }}
          </p>
          <div class="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{{ formatFileSize(media.size_bytes) }}</span>
            <span>{{ formatDate(media.created_at) }}</span>
          </div>
        </div>

        <!-- Overlay actions -->
        <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100" @click.stop>
          <button
            class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Voir les détails"
            @click="openDetailModal(media)"
          >
            <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
          </button>
          <button
            class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Télécharger"
            @click="downloadMedia(media)"
          >
            <font-awesome-icon icon="fa-solid fa-download" class="h-4 w-4" />
          </button>
          <button
            class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
            title="Copier l'URL"
            @click="copyUrl(media)"
          >
            <font-awesome-icon icon="fa-solid fa-link" class="h-4 w-4" />
          </button>
          <button
            class="rounded-full bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
            title="Supprimer"
            @click="openDeleteModal(media)"
          >
            <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Vue Liste -->
    <div v-else-if="viewMode === 'list' && !isLoading" class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="w-10 px-4 py-3">
                <input
                  v-model="selectAll"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="w-16 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Aperçu
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('name')"
              >
                <span class="flex items-center gap-1">
                  Nom
                  <font-awesome-icon v-if="sortBy === 'name'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('size_bytes')"
              >
                <span class="flex items-center gap-1">
                  Taille
                  <font-awesome-icon v-if="sortBy === 'size_bytes'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('created_at')"
              >
                <span class="flex items-center gap-1">
                  Date
                  <font-awesome-icon v-if="sortBy === 'created_at'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="media in paginatedMedia"
              :key="media.id"
              class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': isSelected(media.id) }"
              @click="openDetailModal(media)"
            >
              <td class="px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="isSelected(media.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelect(media.id)"
                />
              </td>
              <td class="px-4 py-3">
                <div class="h-12 w-12 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                  <img
                    v-if="media.type === 'image'"
                    :src="getMediaUrl(media) || ''"
                    :alt="media.alt_text || media.name"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <font-awesome-icon :icon="`fa-solid ${getMediaIcon(media.type)}`" class="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="min-w-0">
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {{ media.name }}
                  </p>
                  <p v-if="media.description" class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ media.description }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="getMediaTypeColor(media.type)"
                >
                  {{ getMediaTypeLabel(media.type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {{ formatFileSize(media.size_bytes) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(media.created_at) }}
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Voir"
                    @click="openDetailModal(media)"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Télécharger"
                    @click="downloadMedia(media)"
                  >
                    <font-awesome-icon icon="fa-solid fa-download" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                    title="Copier l'URL"
                    @click="copyUrl(media)"
                  >
                    <font-awesome-icon icon="fa-solid fa-link" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(media)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalItems > 0" class="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow dark:bg-gray-800">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalItems) }} sur {{ totalItems }} fichiers
      </div>
      <div class="flex items-center gap-2">
        <button
          :disabled="currentPage === 1"
          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="currentPage--"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-left" class="h-3 w-3" />
        </button>
        <span class="text-sm text-gray-600 dark:text-gray-300">
          Page {{ currentPage }} / {{ totalPages || 1 }}
        </span>
        <button
          :disabled="currentPage === totalPages || totalPages === 0"
          class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="currentPage++"
        >
          <font-awesome-icon icon="fa-solid fa-chevron-right" class="h-3 w-3" />
        </button>
      </div>
    </div>

    <!-- État vide -->
    <div
      v-if="!isLoading && paginatedMedia.length === 0"
      class="flex flex-col items-center justify-center rounded-lg bg-white py-12 shadow dark:bg-gray-800"
    >
      <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
        <font-awesome-icon icon="fa-solid fa-photo-film" class="h-8 w-8 text-gray-400" />
      </div>
      <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
        Aucun fichier trouvé
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Essayez de modifier vos filtres ou ajoutez des fichiers.
      </p>
    </div>

    <!-- Modal Détail/Édition -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedMedia"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDetailModal"
      >
        <div class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Détails du média
            </h3>
            <button
              class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeDetailModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
            </button>
          </div>

          <div class="grid gap-6 p-6 md:grid-cols-2">
            <!-- Aperçu -->
            <div>
              <div class="aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <img
                  v-if="selectedMedia.type === 'image'"
                  :src="getMediaUrl(selectedMedia) || ''"
                  :alt="selectedMedia.alt_text || selectedMedia.name"
                  class="h-full w-full object-contain"
                />
                <video
                  v-else-if="selectedMedia.type === 'video'"
                  :src="getMediaUrl(selectedMedia) || ''"
                  controls
                  class="h-full w-full"
                />
                <div v-else class="flex h-full w-full flex-col items-center justify-center">
                  <font-awesome-icon :icon="`fa-solid ${getMediaIcon(selectedMedia.type)}`" class="mb-2 h-16 w-16 text-gray-400" />
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-sm font-medium"
                    :class="getMediaTypeColor(selectedMedia.type)"
                  >
                    {{ getMediaTypeLabel(selectedMedia.type) }}
                  </span>
                </div>
              </div>

              <!-- Actions rapides -->
              <div class="mt-4 flex gap-2">
                <button
                  class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="downloadMedia(selectedMedia)"
                >
                  <font-awesome-icon icon="fa-solid fa-download" class="mr-2 h-4 w-4" />
                  Télécharger
                </button>
                <button
                  class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="copyUrl(selectedMedia)"
                >
                  <font-awesome-icon icon="fa-solid fa-link" class="mr-2 h-4 w-4" />
                  Copier l'URL
                </button>
              </div>
            </div>

            <!-- Informations -->
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  v-model="editForm.description"
                  rows="2"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Texte alternatif</label>
                <input
                  v-model="editForm.alt_text"
                  type="text"
                  placeholder="Description pour l'accessibilité"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Crédits</label>
                <input
                  v-model="editForm.credits"
                  type="text"
                  placeholder="Photographe, source..."
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Métadonnées -->
              <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <h4 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">Informations</h4>
                <dl class="grid grid-cols-2 gap-2 text-sm">
                  <dt class="text-gray-500 dark:text-gray-400">Type</dt>
                  <dd class="text-gray-900 dark:text-white">{{ getMediaTypeLabel(selectedMedia.type) }}</dd>

                  <dt class="text-gray-500 dark:text-gray-400">Taille</dt>
                  <dd class="text-gray-900 dark:text-white">{{ formatFileSize(selectedMedia.size_bytes) }}</dd>

                  <dt v-if="selectedMedia.width" class="text-gray-500 dark:text-gray-400">Dimensions</dt>
                  <dd v-if="selectedMedia.width" class="text-gray-900 dark:text-white">{{ selectedMedia.width }} x {{ selectedMedia.height }} px</dd>

                  <dt v-if="selectedMedia.duration_seconds" class="text-gray-500 dark:text-gray-400">Durée</dt>
                  <dd v-if="selectedMedia.duration_seconds" class="text-gray-900 dark:text-white">{{ formatDuration(selectedMedia.duration_seconds) }}</dd>

                  <dt class="text-gray-500 dark:text-gray-400">MIME</dt>
                  <dd class="text-gray-900 dark:text-white">{{ selectedMedia.mime_type || '-' }}</dd>

                  <dt class="text-gray-500 dark:text-gray-400">Ajouté le</dt>
                  <dd class="text-gray-900 dark:text-white">{{ formatDate(selectedMedia.created_at) }}</dd>
                </dl>
              </div>

              <!-- Utilisation -->
              <div v-if="getMediaUsageInfo(selectedMedia.id).is_used" class="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <h4 class="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-4 w-4" />
                  Utilisé dans
                </h4>
                <ul class="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                  <li v-for="usage in getMediaUsageInfo(selectedMedia.id).usage" :key="`${usage.type}-${usage.id}`">
                    {{ usage.type === 'album' ? 'Album' : usage.type === 'news' ? 'Actualité' : usage.type }} : {{ usage.title }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-between border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
              @click="openDeleteModal(selectedMedia!); closeDetailModal()"
            >
              <font-awesome-icon icon="fa-solid fa-trash" class="mr-2 h-4 w-4" />
              Supprimer
            </button>
            <div class="flex gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeDetailModal"
              >
                Annuler
              </button>
              <button
                type="button"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSaving"
                @click="handleSaveMedia"
              >
                <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Upload -->
    <Teleport to="body">
      <div
        v-if="showUploadModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showUploadModal = false"
      >
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter des fichiers
            </h3>
            <button
              class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="showUploadModal = false"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
            </button>
          </div>

          <!-- Zone de drop -->
          <div class="mb-6 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-blue-400 dark:border-gray-600">
            <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" class="mb-4 h-12 w-12 text-gray-400" />
            <p class="mb-2 text-gray-600 dark:text-gray-300">
              Glissez-déposez vos fichiers ici
            </p>
            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
              ou
            </p>
            <label class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Parcourir
              <input type="file" multiple class="hidden" />
            </label>
            <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Images (JPG, PNG, GIF, WebP, SVG) - Vidéos (MP4, WebM, MOV) - Documents (PDF, DOC, XLS, PPT) - Audio (MP3, WAV, OGG)
            </p>
          </div>

          <!-- Ajouter URL externe -->
          <div class="mb-6">
            <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ou ajouter une URL externe</p>
            <div class="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                class="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button class="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700">
                Ajouter
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showUploadModal = false"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingMedia"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le fichier
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce fichier ?
          </p>
          <p class="mb-4 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingMedia.name }}
          </p>

          <!-- Avertissement si utilisé -->
          <div v-if="getMediaUsageInfo(deletingMedia.id).is_used" class="mb-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <p class="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-300">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-4 w-4" />
              Ce fichier est utilisé ailleurs et sa suppression pourrait causer des problèmes.
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="handleDeleteMedia"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
