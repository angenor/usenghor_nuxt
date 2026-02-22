<script setup lang="ts">
import type { MediaRead, PublicationStatus } from '~/types/api'
import type { AlbumWithMedia } from '~/composables/useAlbumsApi'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const albumId = computed(() => route.params.id as string)

const {
  getAlbumById,
  updateAlbum: apiUpdateAlbum,
  addMediaToAlbum,
  removeMediaFromAlbum,
  reorderAlbumMedia
} = useAlbumsApi()

const {
  listMedia,
  getMediaUrl,
  formatFileSize,
  formatDuration
} = useMediaApi()

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

const mediaTypeColors: Record<string, string> = {
  image: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  audio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  document: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
}

// === STATE ===
const album = ref<AlbumWithMedia | null>(null)
const albumMedia = computed(() => album.value?.media_items || [])
const availableMedia = ref<MediaRead[]>([])
const isLoading = ref(true)
const isSaving = ref(false)

// Modals
const showAddMediaModal = ref(false)
const showRemoveMediaModal = ref(false)
const showEditInfoModal = ref(false)
const selectedMediaToRemove = ref<MediaRead | null>(null)

// Sélection pour ajout
const selectedMediaIds = ref<string[]>([])

// Filtre dans le modal d'ajout
const addMediaSearch = ref('')
const addMediaType = ref<'all' | 'image' | 'video' | 'audio' | 'document'>('all')

// Formulaire édition
const editForm = ref({
  title: '',
  description: '',
  status: 'draft' as PublicationStatus
})

// === LOAD DATA ===
async function loadAlbum() {
  isLoading.value = true
  try {
    const foundAlbum = await getAlbumById(albumId.value)
    album.value = foundAlbum
  } catch (error) {
    console.error('Erreur chargement album:', error)
    album.value = null
  } finally {
    isLoading.value = false
  }
}

async function loadAvailableMedia() {
  try {
    const allMedia = await listMedia({ limit: 500 })
    const albumMediaIds = album.value?.media_items.map(m => m.id) || []
    availableMedia.value = allMedia.items.filter(m => !albumMediaIds.includes(m.id))
  } catch (error) {
    console.error('Erreur chargement médias disponibles:', error)
  }
}

onMounted(loadAlbum)
watch(albumId, loadAlbum)

// === COMPUTED ===
const filteredAvailableMedia = computed(() => {
  let media = [...availableMedia.value]

  if (addMediaSearch.value) {
    const query = addMediaSearch.value.toLowerCase()
    media = media.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query) ||
      m.alt_text?.toLowerCase().includes(query)
    )
  }

  if (addMediaType.value !== 'all') {
    media = media.filter(m => m.type === addMediaType.value)
  }

  return media
})

const isMediaSelected = (id: string) => selectedMediaIds.value.includes(id)

// === METHODS ===
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status: string) => {
  return albumStatusLabels[status] || status
}

const getStatusColor = (status: string) => {
  return albumStatusColors[status] || 'bg-gray-100 text-gray-800'
}

// Add media modal
const openAddMediaModal = async () => {
  selectedMediaIds.value = []
  addMediaSearch.value = ''
  addMediaType.value = 'all'
  await loadAvailableMedia()
  showAddMediaModal.value = true
}

const closeAddMediaModal = () => {
  showAddMediaModal.value = false
  selectedMediaIds.value = []
}

const toggleMediaSelection = (id: string) => {
  const index = selectedMediaIds.value.indexOf(id)
  if (index === -1) {
    selectedMediaIds.value.push(id)
  } else {
    selectedMediaIds.value.splice(index, 1)
  }
}

const handleAddMedia = async () => {
  if (selectedMediaIds.value.length === 0) return
  isSaving.value = true
  try {
    album.value = await addMediaToAlbum(albumId.value, selectedMediaIds.value)
    closeAddMediaModal()
  } catch (error) {
    console.error('Erreur ajout médias:', error)
  } finally {
    isSaving.value = false
  }
}

// Remove media
const openRemoveMediaModal = (media: MediaRead) => {
  selectedMediaToRemove.value = media
  showRemoveMediaModal.value = true
}

const closeRemoveMediaModal = () => {
  showRemoveMediaModal.value = false
  selectedMediaToRemove.value = null
}

const handleRemoveMedia = async () => {
  if (!selectedMediaToRemove.value) return
  isSaving.value = true
  try {
    album.value = await removeMediaFromAlbum(albumId.value, selectedMediaToRemove.value.id)
    closeRemoveMediaModal()
  } catch (error) {
    console.error('Erreur retrait média:', error)
  } finally {
    isSaving.value = false
  }
}

// Couverture = premier média de l'album (le backend ne supporte pas cover_media_id)
const setCoverImage = async (media: MediaRead) => {
  if (!album.value || media.type !== 'image') return
  // Déplacer l'image en première position pour en faire la couverture
  const index = album.value.media_items.findIndex(m => m.id === media.id)
  if (index > 0) {
    await moveToFirstPosition(index)
  }
}

const isCoverImage = (media: MediaRead) => {
  // Le premier média image est considéré comme la couverture
  return album.value?.media_items[0]?.id === media.id
}

// Edit info modal
const openEditInfoModal = () => {
  if (!album.value) return
  editForm.value = {
    title: album.value.title,
    description: album.value.description || '',
    status: album.value.status
  }
  showEditInfoModal.value = true
}

const closeEditInfoModal = () => {
  showEditInfoModal.value = false
}

const handleSaveAlbumInfo = async () => {
  if (!album.value) return
  isSaving.value = true
  try {
    await apiUpdateAlbum(albumId.value, {
      title: editForm.value.title,
      description: editForm.value.description || null,
      status: editForm.value.status
    })
    await loadAlbum()
    closeEditInfoModal()
  } catch (error) {
    console.error('Erreur mise à jour album:', error)
  } finally {
    isSaving.value = false
  }
}

// Reorder (avec appel API)
async function saveReorder(newOrder: MediaRead[]) {
  try {
    album.value = await reorderAlbumMedia(albumId.value, newOrder.map(m => m.id))
  } catch (error) {
    console.error('Erreur réordonnancement:', error)
    // Recharger pour revenir à l'état précédent
    await loadAlbum()
  }
}

const moveUp = async (index: number) => {
  if (index === 0 || !album.value) return
  const items = [...album.value.media_items]
  ;[items[index], items[index - 1]] = [items[index - 1], items[index]]
  album.value.media_items = items
  await saveReorder(items)
}

const moveDown = async (index: number) => {
  if (!album.value || index === album.value.media_items.length - 1) return
  const items = [...album.value.media_items]
  ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
  album.value.media_items = items
  await saveReorder(items)
}

const moveToFirstPosition = async (index: number) => {
  if (index === 0 || !album.value) return
  const items = [...album.value.media_items]
  const [item] = items.splice(index, 1)
  items.unshift(item)
  album.value.media_items = items
  await saveReorder(items)
}

const moveToFirst = moveToFirstPosition

const moveToLast = async (index: number) => {
  if (!album.value || index === album.value.media_items.length - 1) return
  const items = [...album.value.media_items]
  const [item] = items.splice(index, 1)
  items.push(item)
  album.value.media_items = items
  await saveReorder(items)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <!-- Album non trouvé -->
    <div
      v-else-if="!album"
      class="flex flex-col items-center justify-center rounded-lg bg-white py-16 text-center shadow dark:bg-gray-800"
    >
      <font-awesome-icon icon="fa-solid fa-folder-open" class="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
      <h2 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Album non trouvé</h2>
      <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">L'album demandé n'existe pas ou a été supprimé</p>
      <NuxtLink
        to="/admin/mediatheque"
        class="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        Retour à la médiathèque
      </NuxtLink>
    </div>

    <!-- Contenu -->
    <template v-else>
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <NuxtLink
              to="/admin/mediatheque"
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="mr-1 h-3 w-3" />
              Médiathèque
            </NuxtLink>
          </div>
          <h1 class="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            {{ album.title }}
            <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', getStatusColor(album.status)]">
              {{ getStatusLabel(album.status) }}
            </span>
          </h1>
          <p v-if="album.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ album.description }}
          </p>
          <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Créé le {{ formatDate(album.created_at) }} - Modifié le {{ formatDate(album.updated_at) }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="openEditInfoModal"
          >
            <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
            Modifier les infos
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            @click="openAddMediaModal"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
            Ajouter des médias
          </button>
        </div>
      </div>

      <!-- Stats rapides -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Médias</p>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ albumMedia.length }}</p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Images</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ albumMedia.filter(m => m.type === 'image').length }}
          </p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Vidéos</p>
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ albumMedia.filter(m => m.type === 'video').length }}
          </p>
        </div>
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Autres</p>
          <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {{ albumMedia.filter(m => m.type !== 'image' && m.type !== 'video').length }}
          </p>
        </div>
      </div>

      <!-- Liste des médias -->
      <div class="rounded-lg bg-white shadow dark:bg-gray-800">
        <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 class="font-semibold text-gray-900 dark:text-white">Médias de l'album</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Gérez les médias, définissez l'image de couverture et réordonnez-les
          </p>
        </div>

        <!-- État vide -->
        <div
          v-if="albumMedia.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <font-awesome-icon icon="fa-solid fa-images" class="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Aucun média</h3>
          <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Ajoutez des médias à cet album depuis votre médiathèque
          </p>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            @click="openAddMediaModal"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
            Ajouter des médias
          </button>
        </div>

        <!-- Liste des médias -->
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="(media, index) in albumMedia"
            :key="media.id"
            class="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <!-- Numéro d'ordre -->
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ index + 1 }}
            </div>

            <!-- Miniature -->
            <div class="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <img
                v-if="media.type === 'image'"
                :src="getMediaUrl(media) || ''"
                :alt="media.alt_text || media.name"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
              >
                <font-awesome-icon
                  :icon="`fa-solid ${mediaTypeIcons[media.type]}`"
                  class="h-6 w-6 text-gray-400"
                />
              </div>

              <!-- Badge couverture -->
              <span
                v-if="isCoverImage(media)"
                class="absolute left-1 top-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white"
              >
                Couverture
              </span>
            </div>

            <!-- Infos -->
            <div class="min-w-0 flex-1">
              <h3 class="truncate font-medium text-gray-900 dark:text-white">{{ media.name }}</h3>
              <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', mediaTypeColors[media.type]]">
                  {{ mediaTypeLabels[media.type] }}
                </span>
                <span v-if="media.size_bytes">{{ formatFileSize(media.size_bytes) }}</span>
                <span v-if="media.duration_seconds">{{ formatDuration(media.duration_seconds) }}</span>
                <span v-if="media.width && media.height">{{ media.width }}x{{ media.height }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-1">
              <!-- Réordonner -->
              <div class="flex rounded-lg border border-gray-200 dark:border-gray-600">
                <button
                  class="rounded-l-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
                  title="Mettre en premier"
                  :disabled="index === 0"
                  @click="moveToFirst(index)"
                >
                  <font-awesome-icon icon="fa-solid fa-angles-up" class="h-3 w-3" />
                </button>
                <button
                  class="border-l border-gray-200 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  title="Monter"
                  :disabled="index === 0"
                  @click="moveUp(index)"
                >
                  <font-awesome-icon icon="fa-solid fa-chevron-up" class="h-3 w-3" />
                </button>
                <button
                  class="border-l border-gray-200 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  title="Descendre"
                  :disabled="index === albumMedia.length - 1"
                  @click="moveDown(index)"
                >
                  <font-awesome-icon icon="fa-solid fa-chevron-down" class="h-3 w-3" />
                </button>
                <button
                  class="rounded-r-lg border-l border-gray-200 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  title="Mettre en dernier"
                  :disabled="index === albumMedia.length - 1"
                  @click="moveToLast(index)"
                >
                  <font-awesome-icon icon="fa-solid fa-angles-down" class="h-3 w-3" />
                </button>
              </div>

              <!-- Définir comme couverture -->
              <button
                v-if="media.type === 'image'"
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                :class="{ 'text-blue-600 dark:text-blue-400': isCoverImage(media) }"
                title="Définir comme couverture"
                @click="setCoverImage(media)"
              >
                <font-awesome-icon icon="fa-solid fa-star" class="h-4 w-4" />
              </button>

              <!-- Retirer -->
              <button
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Retirer de l'album"
                @click="openRemoveMediaModal(media)"
              >
                <font-awesome-icon icon="fa-solid fa-times" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal ajout médias -->
    <Teleport to="body">
      <div
        v-if="showAddMediaModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddMediaModal"
      >
        <div class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Ajouter des médias</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedMediaIds.length }} média{{ selectedMediaIds.length > 1 ? 's' : '' }} sélectionné{{ selectedMediaIds.length > 1 ? 's' : '' }}
              </p>
            </div>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddMediaModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <!-- Filtres -->
          <div class="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
            <div class="flex flex-col gap-3 sm:flex-row">
              <div class="relative flex-1">
                <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  v-model="addMediaSearch"
                  type="text"
                  placeholder="Rechercher..."
                  class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                v-model="addMediaType"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Tous les types</option>
                <option value="image">Images</option>
                <option value="video">Vidéos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>

          <!-- Liste -->
          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="filteredAvailableMedia.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <div
                v-for="media in filteredAvailableMedia"
                :key="media.id"
                class="group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors"
                :class="isMediaSelected(media.id) ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-gray-100 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
                @click="toggleMediaSelection(media.id)"
              >
                <!-- Miniature -->
                <div class="aspect-square overflow-hidden">
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
                </div>

                <!-- Checkbox -->
                <div
                  class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-colors"
                  :class="isMediaSelected(media.id) ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-400'"
                >
                  <font-awesome-icon
                    v-if="isMediaSelected(media.id)"
                    icon="fa-solid fa-check"
                    class="h-3 w-3"
                  />
                </div>

                <!-- Nom -->
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p class="truncate text-xs font-medium text-white">{{ media.name }}</p>
                </div>
              </div>
            </div>

            <!-- État vide -->
            <div v-else class="flex flex-col items-center justify-center py-12 text-center">
              <font-awesome-icon icon="fa-solid fa-images" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ addMediaSearch || addMediaType !== 'all' ? 'Aucun média trouvé' : 'Tous les médias sont déjà dans l\'album' }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeAddMediaModal"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="selectedMediaIds.length === 0 || isSaving"
              @click="handleAddMedia"
            >
              <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              Ajouter {{ selectedMediaIds.length }} média{{ selectedMediaIds.length > 1 ? 's' : '' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal retrait média -->
    <Teleport to="body">
      <div
        v-if="showRemoveMediaModal && selectedMediaToRemove"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeRemoveMediaModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6">
            <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <font-awesome-icon icon="fa-solid fa-unlink" class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>

            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Retirer le média
            </h3>

            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Voulez-vous retirer <strong>{{ selectedMediaToRemove.name }}</strong> de cet album ?
            </p>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="mr-1" />
              Le fichier ne sera pas supprimé de la médiathèque.
            </p>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeRemoveMediaModal"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 disabled:opacity-50"
              :disabled="isSaving"
              @click="handleRemoveMedia"
            >
              <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              Retirer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal édition infos -->
    <Teleport to="body">
      <div
        v-if="showEditInfoModal && album"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditInfoModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Modifier l'album</h2>
            <button
              class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditInfoModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6" @submit.prevent="handleSaveAlbumInfo">
            <div class="space-y-4">
              <!-- Titre -->
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="editForm.title"
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
                  v-model="editForm.description"
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
                  v-model="editForm.status"
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
                @click="closeEditInfoModal"
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
  </div>
</template>
