<script setup lang="ts">
import type { MediaRead, MediaType, PublicationStatus } from '~/types/api'
import type { AlbumRead, AlbumWithMedia } from '~/composables/useAlbumsApi'
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

const {
  listAlbums,
  getAlbumById,
  createAlbum: apiCreateAlbum,
  updateAlbum: apiUpdateAlbum,
  deleteAlbum: apiDeleteAlbum,
  addMediaToAlbum
} = useAlbumsApi()

// APIs pour les entités (associations albums)
const { listCampuses, addCampusAlbum, getCampusAlbums } = useCampusApi()
const { getAllServices, addAlbumToService, getServiceAlbums } = useServicesApi()
const { listEvents, addEventAlbum, getEventAlbums } = useEventsApi()
const { listProjects, addProjectAlbum, listProjectMedia } = useProjectsApi()
const { listCalls: listAdminCalls, getCallAlbums, addCallAlbum } = useApplicationCallsApi()

// Constantes
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

const albumStatusLabels: Record<string, string> = {
  draft: 'Brouillon',
  published: 'Publié'
}

const albumStatusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

// === STATE ===
// Onglet actif
const activeTab = ref<'fichiers' | 'albums'>('fichiers')

// Vue
const viewMode = ref<'grid' | 'list'>('grid')

// Filtres médias
const searchQuery = ref('')
const filterType = ref<'all' | 'image' | 'video' | 'audio' | 'document'>('all')
const dateFrom = ref('')
const dateTo = ref('')

// Filtres albums
const albumSearchQuery = ref('')
const filterStatus = ref<'all' | 'draft' | 'published'>('all')

// Tri
const sortBy = ref<'created_at' | 'name' | 'size_bytes'>('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const albumSortBy = ref<'created_at' | 'title'>('created_at')

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
const showAddToAlbumModal = ref(false)
const showCreateAlbumModal = ref(false)
const showEditAlbumModal = ref(false)
const showDeleteAlbumModal = ref(false)
const showAlbumDetailModal = ref(false)
const showLinkEntityModal = ref(false)

// Types d'entités pour l'association
type EntityType = 'campus' | 'service' | 'event' | 'project' | 'call'
interface EntityOption {
  id: string
  name: string
  type: EntityType
  isLinked?: boolean
}

// État pour l'association d'album à une entité
const linkEntityType = ref<EntityType | 'all'>('all')
const entityOptions = ref<EntityOption[]>([])
const isLoadingEntities = ref(false)
const albumToLink = ref<AlbumRead | null>(null)

const selectedMedia = ref<MediaRead | null>(null)
const deletingMedia = ref<MediaRead | null>(null)
const selectedAlbum = ref<AlbumRead | null>(null)
const selectedAlbumDetails = ref<AlbumWithMedia | null>(null)

// État de chargement
const isLoading = ref(true)
const isSaving = ref(false)

// Données
const mediaList = ref<MediaRead[]>([])
const albumsList = ref<AlbumRead[]>([])
const albumsWithMedia = ref<Map<string, AlbumWithMedia>>(new Map())

const stats = ref({
  total: 0,
  images: 0,
  videos: 0,
  documents: 0,
  audio: 0,
  totalSize: 0
})

// Formulaires
const editForm = reactive({
  name: '',
  description: '',
  alt_text: '',
  credits: ''
})

const albumForm = ref({
  title: '',
  description: '',
  status: 'draft' as PublicationStatus
})

// Cache d'utilisation
const mediaUsageCache = ref<Map<string, { is_used: boolean; usage: Array<{ type: string; id: string; title: string }> }>>(new Map())

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

async function loadAlbums() {
  isLoading.value = true
  try {
    const response = await listAlbums({
      search: albumSearchQuery.value || null,
      status: filterStatus.value !== 'all' ? filterStatus.value as PublicationStatus : null
    })
    albumsList.value = response.items

    // Charger les détails pour les couvertures
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

const filteredAlbums = computed(() => {
  let albums = [...albumsList.value]
  albums.sort((a, b) => {
    let comparison = 0
    if (albumSortBy.value === 'title') {
      comparison = a.title.localeCompare(b.title)
    } else {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return sortOrder.value === 'desc' ? -comparison : comparison
  })
  return albums
})

const albumStats = computed(() => {
  const total = albumsList.value.length
  const published = albumsList.value.filter(a => a.status === 'published').length
  const draft = albumsList.value.filter(a => a.status === 'draft').length
  let totalMedia = 0
  albumsWithMedia.value.forEach(album => {
    totalMedia += album.media_items.length
  })
  return { total, published, draft, totalMedia }
})

const hasActiveFilters = computed(() => {
  if (activeTab.value === 'fichiers') {
    return searchQuery.value || filterType.value !== 'all' || dateFrom.value || dateTo.value
  }
  return albumSearchQuery.value || filterStatus.value !== 'all'
})

const hasSelection = computed(() => selectedIds.value.length > 0)

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

watch(albumSearchQuery, useDebounceFn(() => {
  loadAlbums()
}, 300))

watch(filterStatus, loadAlbums)

watch(activeTab, (tab) => {
  if (tab === 'fichiers') {
    loadMedia()
    loadStats()
  } else {
    loadAlbums()
  }
  // Reset sélection quand on change d'onglet
  selectedIds.value = []
  selectAll.value = false
})

// === LIFECYCLE ===
onMounted(() => {
  loadMedia()
  loadStats()
  loadAlbums()
})

// === METHODS ===
// Sélection
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

const clearSelection = () => {
  selectedIds.value = []
  selectAll.value = false
}

// Tri
const toggleSort = (column: typeof sortBy.value) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

// Filtres
const resetFilters = () => {
  if (activeTab.value === 'fichiers') {
    searchQuery.value = ''
    filterType.value = 'all'
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  } else {
    albumSearchQuery.value = ''
    filterStatus.value = 'all'
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

const getMediaIcon = (type: string) => mediaTypeIcons[type] || 'fa-file'
const getMediaTypeLabel = (type: string) => mediaTypeLabels[type] || type
const getMediaTypeColor = (type: string) => mediaTypeColors[type] || 'bg-gray-100 text-gray-800'
const getStatusLabel = (status: string) => albumStatusLabels[status] || status
const getStatusColor = (status: string) => albumStatusColors[status] || 'bg-gray-100 text-gray-800'
const getMediaUsageInfo = (mediaId: string) => mediaUsageCache.value.get(mediaId) || { is_used: false, usage: [] }

// Albums helpers
function getAlbumCover(albumId: string): MediaRead | null {
  const details = albumsWithMedia.value.get(albumId)
  if (!details || details.media_items.length === 0) return null
  return details.media_items.find(m => m.type === 'image') || details.media_items[0]
}

function getAlbumMediaCount(albumId: string): number {
  return albumsWithMedia.value.get(albumId)?.media_items.length || 0
}

// === ACTIONS MÉDIAS ===
const openDetailModal = async (media: MediaRead) => {
  selectedMedia.value = media
  editForm.name = media.name
  editForm.description = media.description || ''
  editForm.alt_text = media.alt_text || ''
  editForm.credits = media.credits || ''
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

// === ACTIONS ALBUMS ===
const openCreateAlbumModal = () => {
  albumForm.value = { title: '', description: '', status: 'draft' }
  showCreateAlbumModal.value = true
}

const closeCreateAlbumModal = () => {
  showCreateAlbumModal.value = false
  albumForm.value = { title: '', description: '', status: 'draft' }
}

const handleCreateAlbum = async () => {
  isSaving.value = true
  try {
    const newAlbum = await apiCreateAlbum({
      title: albumForm.value.title,
      description: albumForm.value.description || null,
      status: albumForm.value.status
    })

    // Si on a des médias sélectionnés, les ajouter au nouvel album
    if (selectedIds.value.length > 0) {
      await addMediaToAlbum(newAlbum.id, selectedIds.value)
      selectedIds.value = []
      selectAll.value = false
    }

    closeCreateAlbumModal()
    await loadAlbums()
    // Basculer vers l'onglet albums pour voir le résultat
    activeTab.value = 'albums'
  } catch (error) {
    console.error('Erreur création album:', error)
  } finally {
    isSaving.value = false
  }
}

const openEditAlbumModal = (album: AlbumRead) => {
  selectedAlbum.value = album
  albumForm.value = {
    title: album.title,
    description: album.description || '',
    status: album.status
  }
  showEditAlbumModal.value = true
}

const closeEditAlbumModal = () => {
  showEditAlbumModal.value = false
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
    closeEditAlbumModal()
    await loadAlbums()
  } catch (error) {
    console.error('Erreur mise à jour album:', error)
  } finally {
    isSaving.value = false
  }
}

const openDeleteAlbumModal = (album: AlbumRead) => {
  selectedAlbum.value = album
  showDeleteAlbumModal.value = true
}

const closeDeleteAlbumModal = () => {
  showDeleteAlbumModal.value = false
  selectedAlbum.value = null
}

const handleDeleteAlbum = async () => {
  if (!selectedAlbum.value) return
  isSaving.value = true
  try {
    await apiDeleteAlbum(selectedAlbum.value.id)
    closeDeleteAlbumModal()
    await loadAlbums()
  } catch (error) {
    console.error('Erreur suppression album:', error)
  } finally {
    isSaving.value = false
  }
}

const openAlbumDetailModal = async (album: AlbumRead) => {
  selectedAlbum.value = album
  try {
    selectedAlbumDetails.value = await getAlbumById(album.id)
  } catch (error) {
    console.error('Erreur chargement détails album:', error)
    selectedAlbumDetails.value = null
  }
  showAlbumDetailModal.value = true
}

const closeAlbumDetailModal = () => {
  showAlbumDetailModal.value = false
  selectedAlbum.value = null
  selectedAlbumDetails.value = null
}

const handleToggleAlbumStatus = async (album: AlbumRead) => {
  const newStatus: PublicationStatus = album.status === 'draft' ? 'published' : 'draft'
  try {
    await apiUpdateAlbum(album.id, { status: newStatus })
    await loadAlbums()
  } catch (error) {
    console.error('Erreur changement statut:', error)
  }
}

// === AJOUTER À UN ALBUM ===
const openAddToAlbumModal = () => {
  if (selectedIds.value.length === 0) return
  showAddToAlbumModal.value = true
}

const closeAddToAlbumModal = () => {
  showAddToAlbumModal.value = false
}

const handleAddToAlbum = async (albumId: string) => {
  if (selectedIds.value.length === 0) return
  isSaving.value = true
  try {
    await addMediaToAlbum(albumId, selectedIds.value)
    closeAddToAlbumModal()
    selectedIds.value = []
    selectAll.value = false
    await loadAlbums()
  } catch (error) {
    console.error('Erreur ajout à l\'album:', error)
  } finally {
    isSaving.value = false
  }
}

const handleCreateAlbumWithSelection = () => {
  closeAddToAlbumModal()
  openCreateAlbumModal()
}

// === ASSOCIER ALBUM À UNE ENTITÉ ===
const entityTypeLabels: Record<EntityType, string> = {
  campus: 'Campus',
  service: 'Service',
  event: 'Événement',
  project: 'Projet',
  call: 'Appel'
}

const entityTypeIcons: Record<EntityType, string> = {
  campus: 'fa-building-columns',
  service: 'fa-cogs',
  event: 'fa-calendar-alt',
  project: 'fa-diagram-project',
  call: 'fa-solid fa-bullhorn'
}

async function loadEntities() {
  isLoadingEntities.value = true
  entityOptions.value = []

  const albumId = albumToLink.value?.id

  try {
    const results: EntityOption[] = []

    // Charger selon le filtre ou tout
    if (linkEntityType.value === 'all' || linkEntityType.value === 'campus') {
      const campuses = await listCampuses({ limit: 100 })
      // Vérifier les associations existantes pour chaque campus
      const campusResults = await Promise.all(
        campuses.items.map(async (c) => {
          let isLinked = false
          if (albumId) {
            try {
              const linkedAlbums = await getCampusAlbums(c.id)
              isLinked = linkedAlbums.includes(albumId)
            } catch { /* ignore */ }
          }
          return { id: c.id, name: c.name, type: 'campus' as EntityType, isLinked }
        })
      )
      results.push(...campusResults)
    }

    if (linkEntityType.value === 'all' || linkEntityType.value === 'service') {
      const services = await getAllServices()
      const serviceResults = await Promise.all(
        services.map(async (s) => {
          let isLinked = false
          if (albumId) {
            try {
              const linkedAlbums = await getServiceAlbums(s.id)
              isLinked = linkedAlbums.includes(albumId)
            } catch { /* ignore */ }
          }
          return { id: s.id, name: s.name, type: 'service' as EntityType, isLinked }
        })
      )
      results.push(...serviceResults)
    }

    if (linkEntityType.value === 'all' || linkEntityType.value === 'event') {
      const events = await listEvents({ limit: 100 })
      const eventResults = await Promise.all(
        events.items.map(async (e) => {
          let isLinked = false
          if (albumId) {
            try {
              const linkedAlbums = await getEventAlbums(e.id)
              isLinked = linkedAlbums.includes(albumId)
            } catch { /* ignore */ }
          }
          return { id: e.id, name: e.title, type: 'event' as EntityType, isLinked }
        })
      )
      results.push(...eventResults)
    }

    if (linkEntityType.value === 'all' || linkEntityType.value === 'project') {
      const projects = await listProjects({ limit: 100 })
      const projectResults = await Promise.all(
        projects.items.map(async (p) => {
          let isLinked = false
          if (albumId) {
            try {
              const linkedMedia = await listProjectMedia(p.id)
              isLinked = linkedMedia.some(m => m.album_external_id === albumId)
            } catch { /* ignore */ }
          }
          return { id: p.id, name: p.title, type: 'project' as EntityType, isLinked }
        })
      )
      results.push(...projectResults)
    }

    if (linkEntityType.value === 'all' || linkEntityType.value === 'call') {
      try {
        const callsResponse = await listAdminCalls({ limit: 100 })
        const callItems = callsResponse.items || []
        const callResults = await Promise.all(
          callItems.map(async (call) => {
            let isLinked = false
            if (albumId) {
              try {
                const albums = await getCallAlbums(call.id)
                isLinked = albums.includes(albumId)
              } catch { /* ignore */ }
            }
            return { id: call.id, name: call.title, type: 'call' as EntityType, isLinked }
          })
        )
        results.push(...callResults)
      } catch (e) {
        console.error('Erreur chargement appels:', e)
      }
    }

    // Trier: entités liées d'abord, puis non liées
    entityOptions.value = results.sort((a, b) => {
      if (a.isLinked === b.isLinked) return a.name.localeCompare(b.name)
      return a.isLinked ? -1 : 1
    })
  } catch (error) {
    console.error('Erreur chargement entités:', error)
  } finally {
    isLoadingEntities.value = false
  }
}

const openLinkEntityModal = async (album: AlbumRead) => {
  albumToLink.value = album
  linkEntityType.value = 'all'
  showLinkEntityModal.value = true
  await loadEntities()
}

const closeLinkEntityModal = () => {
  showLinkEntityModal.value = false
  albumToLink.value = null
  entityOptions.value = []
}

watch(linkEntityType, () => {
  if (showLinkEntityModal.value) {
    loadEntities()
  }
})

const handleLinkToEntity = async (entity: EntityOption) => {
  if (!albumToLink.value) return
  isSaving.value = true

  const entityTypeLabel = {
    campus: 'au campus',
    service: 'au service',
    event: 'à l\'événement',
    project: 'au projet',
    call: 'à l\'appel',
  }[entity.type]

  try {
    switch (entity.type) {
      case 'campus':
        await addCampusAlbum(entity.id, albumToLink.value.id)
        break
      case 'service':
        await addAlbumToService(entity.id, albumToLink.value.id)
        break
      case 'event':
        await addEventAlbum(entity.id, albumToLink.value.id)
        break
      case 'project':
        await addProjectAlbum(entity.id, albumToLink.value.id)
        break
      case 'call':
        await addCallAlbum(entity.id, albumToLink.value.id)
        break
    }
    alert(`Album "${albumToLink.value.title}" associé ${entityTypeLabel} "${entity.name}" avec succès.`)
    closeLinkEntityModal()
  } catch (error: unknown) {
    console.error('Erreur association album:', error)
    // Vérifier si c'est une erreur 409 (Conflict = déjà associé)
    const fetchError = error as { statusCode?: number; status?: number }
    if (fetchError.statusCode === 409 || fetchError.status === 409) {
      alert(`L'album "${albumToLink.value.title}" est déjà associé ${entityTypeLabel} "${entity.name}".`)
    } else {
      alert('Erreur lors de l\'association de l\'album. Veuillez réessayer.')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Médiathèque
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez vos fichiers et albums
        </p>
      </div>

      <div class="flex gap-2">
        <button
          v-if="activeTab === 'fichiers'"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="showUploadModal = true"
        >
          <font-awesome-icon icon="fa-solid fa-upload" class="h-4 w-4" />
          Ajouter des fichiers
        </button>
        <button
          v-else
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="openCreateAlbumModal"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
          Créer un album
        </button>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex gap-4">
        <button
          class="relative px-1 pb-3 text-sm font-medium transition-colors"
          :class="activeTab === 'fichiers' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          @click="activeTab = 'fichiers'"
        >
          <span class="flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-photo-film" class="h-4 w-4" />
            Fichiers
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{{ stats.total }}</span>
          </span>
          <span
            v-if="activeTab === 'fichiers'"
            class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600"
          />
        </button>
        <button
          class="relative px-1 pb-3 text-sm font-medium transition-colors"
          :class="activeTab === 'albums' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          @click="activeTab = 'albums'"
        >
          <span class="flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-images" class="h-4 w-4" />
            Albums
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">{{ albumStats.total }}</span>
          </span>
          <span
            v-if="activeTab === 'albums'"
            class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600"
          />
        </button>
      </nav>
    </div>

    <!-- Stats selon l'onglet -->
    <div v-if="activeTab === 'fichiers'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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

    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Albums</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ albumStats.total }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Publiés</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ albumStats.published }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Brouillons</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ albumStats.draft }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Médias totaux</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ albumStats.totalMedia }}</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <!-- Filtres Fichiers -->
      <div v-if="activeTab === 'fichiers'" class="flex flex-col gap-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

      <!-- Filtres Albums -->
      <div v-else class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="relative flex-1 lg:max-w-md">
          <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="albumSearchQuery"
            type="text"
            placeholder="Rechercher un album..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="filterStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>

          <select
            v-model="albumSortBy"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="created_at">Date de création</option>
            <option value="title">Titre</option>
          </select>

          <button
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
          >
            <font-awesome-icon :icon="sortOrder === 'asc' ? 'fa-solid fa-arrow-up-short-wide' : 'fa-solid fa-arrow-down-wide-short'" class="h-4 w-4" />
          </button>

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

      <!-- Actions en masse (fichiers) -->
      <div
        v-if="hasSelection && activeTab === 'fichiers'"
        class="mt-4 flex items-center gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
      >
        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
          {{ selectedIds.length }} fichier(s) sélectionné(s)
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
            @click="openAddToAlbumModal"
          >
            <font-awesome-icon icon="fa-solid fa-folder-plus" class="mr-1 h-3 w-3" />
            Ajouter à un album
          </button>
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
          <button
            class="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            @click="clearSelection"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <!-- CONTENU FICHIERS -->
    <template v-else-if="activeTab === 'fichiers'">
      <!-- Vue Grille -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <div
          v-for="media in paginatedMedia"
          :key="media.id"
          class="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          :class="{ 'ring-2 ring-blue-500': isSelected(media.id) }"
          @click="openDetailModal(media)"
        >
          <div class="absolute left-2 top-2 z-10" @click.stop>
            <input
              type="checkbox"
              :checked="isSelected(media.id)"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              @change="toggleSelect(media.id)"
            />
          </div>

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

          <div class="p-3">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {{ media.name }}
            </p>
            <div class="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{{ formatFileSize(media.size_bytes) }}</span>
              <span>{{ formatDate(media.created_at) }}</span>
            </div>
          </div>

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
      <div v-else class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
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

      <!-- État vide fichiers -->
      <div
        v-if="paginatedMedia.length === 0"
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
    </template>

    <!-- CONTENU ALBUMS -->
    <template v-else>
      <div v-if="filteredAlbums.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="album in filteredAlbums"
          :key="album.id"
          class="group overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
        >
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

            <span
              :class="['absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(album.status)]"
            >
              {{ getStatusLabel(album.status) }}
            </span>

            <span class="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              {{ getAlbumMediaCount(album.id) }} média{{ getAlbumMediaCount(album.id) > 1 ? 's' : '' }}
            </span>

            <div class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
                title="Voir l'album"
                @click="openAlbumDetailModal(album)"
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
                title="Associer à une entité"
                @click="openLinkEntityModal(album)"
              >
                <font-awesome-icon icon="fa-solid fa-link" class="h-4 w-4" />
              </button>
              <button
                class="rounded-full bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100"
                title="Modifier"
                @click="openEditAlbumModal(album)"
              >
                <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
              </button>
            </div>
          </div>

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

            <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
              <div class="flex gap-1">
                <button
                  class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  :title="album.status === 'draft' ? 'Publier' : 'Repasser en brouillon'"
                  @click="handleToggleAlbumStatus(album)"
                >
                  <font-awesome-icon
                    :icon="album.status === 'draft' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
                    class="h-4 w-4"
                  />
                </button>
                <button
                  class="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                  title="Associer à une entité"
                  @click="openLinkEntityModal(album)"
                >
                  <font-awesome-icon icon="fa-solid fa-link" class="h-4 w-4" />
                </button>
              </div>
              <button
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Supprimer"
                @click="openDeleteAlbumModal(album)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide albums -->
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
          @click="openCreateAlbumModal"
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
    </template>

    <!-- MODALS -->

    <!-- Modal Détail/Édition Média -->
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

    <!-- Modal Supprimer Média -->
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

    <!-- Modal Ajouter à un album -->
    <Teleport to="body">
      <div
        v-if="showAddToAlbumModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddToAlbumModal"
      >
        <div class="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Ajouter à un album</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedIds.length }} fichier(s) sélectionné(s)
              </p>
            </div>
            <button
              class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddToAlbumModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <!-- Créer un nouvel album -->
            <button
              class="mb-4 flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-blue-300 p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
              @click="handleCreateAlbumWithSelection"
            >
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <font-awesome-icon icon="fa-solid fa-plus" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="font-medium text-blue-600 dark:text-blue-400">Créer un nouvel album</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">avec les fichiers sélectionnés</p>
              </div>
            </button>

            <div v-if="albumsList.length > 0" class="space-y-2">
              <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ou choisir un album existant</p>
              <button
                v-for="album in albumsList"
                :key="album.id"
                class="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                @click="handleAddToAlbum(album.id)"
              >
                <div class="h-12 w-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    v-if="getAlbumCover(album.id)"
                    :src="getMediaUrl(getAlbumCover(album.id)!) || ''"
                    :alt="album.title"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center"
                  >
                    <font-awesome-icon icon="fa-solid fa-images" class="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-gray-900 dark:text-white">{{ album.title }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ getAlbumMediaCount(album.id) }} média(s) - {{ getStatusLabel(album.status) }}
                  </p>
                </div>
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div v-else class="py-8 text-center">
              <font-awesome-icon icon="fa-solid fa-folder-open" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Aucun album existant</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Créer Album -->
    <Teleport to="body">
      <div
        v-if="showCreateAlbumModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeCreateAlbumModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ hasSelection ? 'Créer un album avec la sélection' : 'Créer un album' }}
            </h2>
            <button
              class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeCreateAlbumModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6" @submit.prevent="handleCreateAlbum">
            <div v-if="hasSelection" class="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <p class="text-sm text-blue-800 dark:text-blue-300">
                <font-awesome-icon icon="fa-solid fa-info-circle" class="mr-1" />
                {{ selectedIds.length }} fichier(s) seront ajoutés à ce nouvel album
              </p>
            </div>

            <div class="space-y-4">
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
                @click="closeCreateAlbumModal"
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

    <!-- Modal Édition Album -->
    <Teleport to="body">
      <div
        v-if="showEditAlbumModal && selectedAlbum"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditAlbumModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Modifier l'album</h2>
            <button
              class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditAlbumModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6" @submit.prevent="handleUpdateAlbum">
            <div class="space-y-4">
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
                @click="closeEditAlbumModal"
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

    <!-- Modal Suppression Album -->
    <Teleport to="body">
      <div
        v-if="showDeleteAlbumModal && selectedAlbum"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteAlbumModal"
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
              @click="closeDeleteAlbumModal"
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

    <!-- Modal Vue Album -->
    <Teleport to="body">
      <div
        v-if="showAlbumDetailModal && selectedAlbum"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAlbumDetailModal"
      >
        <div class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedAlbum.title }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedAlbumDetails?.media_items.length || 0 }} média{{ (selectedAlbumDetails?.media_items.length || 0) > 1 ? 's' : '' }}
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
                @click="closeAlbumDetailModal"
              >
                <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div v-if="selectedAlbum.description" class="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedAlbum.description }}</p>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="selectedAlbumDetails && selectedAlbumDetails.media_items.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <div
                v-for="media in selectedAlbumDetails.media_items"
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

                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p class="truncate text-xs font-medium text-white">{{ media.name }}</p>
                </div>
              </div>
            </div>

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

    <!-- Modal pour associer un album à une entité -->
    <Teleport to="body">
      <div
        v-if="showLinkEntityModal && albumToLink"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeLinkEntityModal"
      >
        <div class="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Associer l'album à une entité
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ albumToLink.name }}
              </p>
            </div>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeLinkEntityModal"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="h-5 w-5" />
            </button>
          </div>

          <!-- Filtre par type -->
          <div class="border-b border-gray-200 px-6 py-3 dark:border-gray-700">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="typeOption in [
                  { value: 'all', label: 'Tous', icon: 'fa-th-large' },
                  { value: 'campus', label: 'Campus', icon: 'fa-university' },
                  { value: 'service', label: 'Services', icon: 'fa-cogs' },
                  { value: 'event', label: 'Événements', icon: 'fa-calendar' },
                  { value: 'project', label: 'Projets', icon: 'fa-project-diagram' },
                  { value: 'call', label: 'Appels', icon: 'fa-bullhorn' },
                ]"
                :key="typeOption.value"
                :class="[
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  linkEntityType === typeOption.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                ]"
                @click="linkEntityType = typeOption.value as EntityType | 'all'"
              >
                <font-awesome-icon :icon="`fa-solid ${typeOption.icon}`" class="h-3 w-3" />
                {{ typeOption.label }}
              </button>
            </div>
          </div>

          <!-- Liste des entités -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="isLoadingEntities" class="flex items-center justify-center py-8">
              <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-blue-600" />
            </div>

            <div v-else-if="entityOptions.length === 0" class="py-8 text-center">
              <font-awesome-icon icon="fa-solid fa-inbox" class="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p class="text-sm text-gray-500 dark:text-gray-400">Aucune entité disponible</p>
            </div>

            <div v-else class="space-y-2">
              <button
                v-for="entity in entityOptions"
                :key="`${entity.type}-${entity.id}`"
                :class="[
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                  entity.isLinked
                    ? 'cursor-default border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-600 dark:hover:bg-blue-900/20'
                ]"
                :disabled="entity.isLinked"
                @click="!entity.isLinked && handleLinkToEntity(entity)"
              >
                <div :class="[
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                  entity.isLinked ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
                ]">
                  <font-awesome-icon
                    :icon="`fa-solid ${
                      entity.type === 'campus' ? 'fa-university' :
                      entity.type === 'service' ? 'fa-cogs' :
                      entity.type === 'event' ? 'fa-calendar' : 'fa-project-diagram'
                    }`"
                    :class="[
                      'h-5 w-5',
                      entity.isLinked ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    ]"
                  />
                </div>
                <div class="flex-1 overflow-hidden">
                  <p :class="[
                    'truncate font-medium',
                    entity.isLinked ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white'
                  ]">
                    {{ entity.name }}
                  </p>
                  <p :class="[
                    'text-xs',
                    entity.isLinked ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  ]">
                    {{
                      entity.type === 'campus' ? 'Campus' :
                      entity.type === 'service' ? 'Service' :
                      entity.type === 'event' ? 'Événement' : 'Projet'
                    }}
                    <span v-if="entity.isLinked" class="ml-1 font-medium">• Déjà associé</span>
                  </p>
                </div>
                <font-awesome-icon
                  :icon="entity.isLinked ? 'fa-solid fa-check-circle' : 'fa-solid fa-link'"
                  :class="[
                    'h-4 w-4',
                    entity.isLinked ? 'text-green-500' : 'text-gray-400'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
