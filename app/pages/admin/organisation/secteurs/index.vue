<script setup lang="ts">
import type { SectorDisplay, SectorUsage } from '~/composables/useSectorsApi'
import type { OutputData } from '@editorjs/editorjs'

definePageMeta({
  layout: 'admin'
})

const {
  getAllSectors,
  getSectorsStats,
  getSectorUsage,
  createSector,
  updateSector,
  deleteSector: apiDeleteDepartment,
  duplicateSector: apiDuplicateSector,
  toggleSectorActive: apiToggleDepartmentActive,
  reorderSectors,
  generateSectorCode,
} = useSectorsApi()

const { apiFetch } = useApi()

// === STATE ===
const searchQuery = ref('')
const filterActive = ref<boolean | undefined>(undefined)
const sortBy = ref<'name' | 'code' | 'display_order' | 'services_count'>('display_order')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingSector = ref<SectorDisplay | null>(null)
const deletingSector = ref<SectorDisplay | null>(null)
const sectorUsage = ref<SectorUsage | null>(null)
const isDragging = ref(false)

// Données chargées depuis l'API
const allSectors = ref<SectorDisplay[]>([])
const stats = ref({ total: 0, active: 0, totalServices: 0, withHead: 0 })
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)

// Form state
// Note: icon_external_id et cover_image_external_id sont des UUID pour le service MEDIA
// La sélection d'icônes FontAwesome n'est pas disponible dans ce schéma
const newSector = ref<{
  name: string
  code: string
  description: OutputData | undefined
  mission: OutputData | undefined
  head_id: string
  active: boolean
}>({
  name: '',
  code: '',
  description: undefined,
  mission: undefined,
  head_id: '',
  active: true
})

// === CHARGEMENT DES DONNÉES ===
async function loadSectors() {
  isLoading.value = true
  error.value = null
  try {
    const [sectorsData, sectorsStats] = await Promise.all([
      getAllSectors(),
      getSectorsStats(),
    ])
    allSectors.value = sectorsData
    stats.value = sectorsStats
  }
  catch (err: any) {
    console.error('Erreur chargement secteurs:', err)
    error.value = err.message || 'Erreur lors du chargement des secteurs'
  }
  finally {
    isLoading.value = false
  }
}

// Candidats responsables (utilisateurs)
interface HeadCandidate {
  id: string
  name: string
}
const headCandidates = ref<HeadCandidate[]>([])

async function loadHeadCandidates() {
  try {
    const response = await apiFetch<{
      items: Array<{
        id: string
        first_name: string
        last_name: string
        salutation: string | null
      }>
    }>('/api/admin/users', {
      query: { limit: 100, active: true },
    })
    headCandidates.value = response.items.map(user => ({
      id: user.id,
      name: user.salutation
        ? `${user.salutation} ${user.first_name} ${user.last_name}`
        : `${user.first_name} ${user.last_name}`,
    }))
  }
  catch (err) {
    console.error('Erreur chargement des candidats responsables:', err)
  }
}

// Enrichir les secteurs avec les infos des responsables
function enrichSectorsWithHeads() {
  if (headCandidates.value.length === 0) return

  allSectors.value = allSectors.value.map((sec) => {
    if (sec.head_external_id) {
      const candidate = headCandidates.value.find(c => c.id === sec.head_external_id)
      if (candidate) {
        return {
          ...sec,
          head: {
            id: candidate.id,
            name: candidate.name,
            title: null,
            photo: null,
          },
        }
      }
    }
    return { ...sec, head: null }
  })
}

// Chargement initial
onMounted(async () => {
  await Promise.all([loadSectors(), loadHeadCandidates()])
  enrichSectorsWithHeads()
})

// Secteurs filtrés et triés
const filteredSectors = computed(() => {
  let result = [...allSectors.value]

  // Filtre par statut actif
  if (filterActive.value !== undefined) {
    result = result.filter(d => d.active === filterActive.value)
  }

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.code.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query) ||
      d.head?.name?.toLowerCase().includes(query)
    )
  }

  // Tri
  result.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name)
    }
    else if (sortBy.value === 'code') {
      comparison = a.code.localeCompare(b.code)
    }
    else if (sortBy.value === 'services_count') {
      comparison = a.services_count - b.services_count
    }
    else if (sortBy.value === 'display_order') {
      comparison = a.display_order - b.display_order
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// === METHODS ===
const toggleSort = (field: 'name' | 'code' | 'display_order' | 'services_count') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: 'name' | 'code' | 'display_order' | 'services_count') => {
  if (sortBy.value !== field) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-up' : 'sort-down'
}

// Auto-génération du code
const updateCode = () => {
  if (newSector.value.name && !editingSector.value) {
    newSector.value.code = generateSectorCode(newSector.value.name)
  }
}

// Modals
const openAddModal = () => {
  newSector.value = {
    name: '',
    code: '',
    description: undefined,
    mission: undefined,
    head_id: '',
    active: true
  }
  showAddModal.value = true
}

// Convertir une string (potentiellement JSON ou texte brut) en OutputData
const parseEditorContent = (content: string | null | undefined): OutputData | undefined => {
  if (!content) return undefined
  try {
    const parsed = JSON.parse(content)
    // Vérifier que c'est bien un OutputData valide
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    // Si ce n'est pas du JSON valide, créer un bloc paragraphe avec le texte
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: content } }],
        version: '2.28.0'
      }
    }
  }
  return undefined
}

const openEditModal = (sector: SectorDisplay) => {
  editingSector.value = sector
  newSector.value = {
    name: sector.name,
    code: sector.code,
    description: parseEditorContent(sector.description),
    mission: parseEditorContent(sector.mission),
    head_id: sector.head_external_id || '',
    active: sector.active
  }
  showEditModal.value = true
}

const openDeleteModal = async (sector: SectorDisplay) => {
  deletingSector.value = sector
  sectorUsage.value = await getSectorUsage(sector.id)
  showDeleteModal.value = true
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  editingSector.value = null
  deletingSector.value = null
  sectorUsage.value = null
}

// CRUD operations
const saveSector = async () => {
  if (!newSector.value.name || !newSector.value.code) return

  isSaving.value = true
  error.value = null

  try {
    // Convertir les OutputData en JSON string pour l'API
    const descriptionJson = newSector.value.description && newSector.value.description.blocks?.length
      ? JSON.stringify(newSector.value.description)
      : null
    const missionJson = newSector.value.mission && newSector.value.mission.blocks?.length
      ? JSON.stringify(newSector.value.mission)
      : null

    const payload = {
      code: newSector.value.code,
      name: newSector.value.name,
      description: descriptionJson,
      mission: missionJson,
      head_external_id: newSector.value.head_id || null,
      active: newSector.value.active,
    }

    if (editingSector.value) {
      // Mise à jour
      await updateSector(editingSector.value.id, payload)
    }
    else {
      // Création
      await createSector(payload)
    }
    closeModals()
    await loadSectors()
    enrichSectorsWithHeads()
  }
  catch (err: any) {
    console.error('Erreur sauvegarde secteur:', err)
    error.value = err.message || 'Erreur lors de la sauvegarde du secteur'
  }
  finally {
    isSaving.value = false
  }
}

const deleteSector = async () => {
  if (!deletingSector.value) return

  isSaving.value = true
  error.value = null

  try {
    await apiDeleteDepartment(deletingSector.value.id)
    closeModals()
    await loadSectors()
  }
  catch (err: any) {
    console.error('Erreur suppression secteur:', err)
    error.value = err.message || 'Erreur lors de la suppression du secteur'
  }
  finally {
    isSaving.value = false
  }
}

const duplicateSectorItem = async (sector: SectorDisplay) => {
  isSaving.value = true
  error.value = null

  try {
    const newCode = `${sector.code}-copie-${Date.now()}`
    await apiDuplicateSector(sector.id, newCode)
    await loadSectors()
    enrichSectorsWithHeads()
  }
  catch (err: any) {
    console.error('Erreur duplication secteur:', err)
    error.value = err.message || 'Erreur lors de la duplication du secteur'
  }
  finally {
    isSaving.value = false
  }
}

const toggleSectorActive = async (sector: SectorDisplay) => {
  try {
    await apiToggleSectorActive(sector.id)
    await loadSectors()
  }
  catch (err: any) {
    console.error('Erreur basculement état actif:', err)
    error.value = err.message || 'Erreur lors du changement de statut'
  }
}

// Drag and drop
const handleDragStart = (event: DragEvent, index: number) => {
  if (searchQuery.value || filterActive.value !== undefined) return
  isDragging.value = true
  event.dataTransfer?.setData('text/plain', index.toString())
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = async (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  isDragging.value = false
  const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') || '0')
  if (sourceIndex !== targetIndex) {
    // Réordonner localement d'abord
    const items = [...allSectors.value]
    const [movedItem] = items.splice(sourceIndex, 1)
    items.splice(targetIndex, 0, movedItem)

    // Mettre à jour l'ordre d'affichage local
    allSectors.value = items

    // Envoyer au backend
    try {
      const sectorIds = items.map(d => d.id)
      await reorderSectors(sectorIds)
      await loadSectors()
    }
    catch (err: any) {
      console.error('Erreur réordonnement:', err)
      error.value = err.message || 'Erreur lors du réordonnement'
      // Recharger pour annuler le changement local
      await loadSectors()
    }
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Lien vers les services du secteur
const goToServices = (sectorId: string) => {
  navigateTo(`/admin/organisation/services?sector=${sectorId}`)
}
</script>

<template>
  <div class="p-6">
    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 animate-spin text-blue-500" />
    </div>

    <!-- Erreur globale -->
    <div v-else-if="error && allSectors.length === 0" class="py-12 text-center">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-12 h-12 text-red-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
      <button
        class="text-brand-red-600 hover:underline"
        @click="loadSectors"
      >
        Réessayer
      </button>
    </div>

    <template v-else>
      <!-- Erreur non-bloquante -->
      <div
        v-if="error"
        class="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      >
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
        {{ error }}
        <button
          class="ml-4 text-sm underline"
          @click="error = null"
        >
          Fermer
        </button>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Secteurs
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des secteurs de l'université
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-red-600 rounded-lg hover:bg-brand-red-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4" />
        Nouveau secteur
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <font-awesome-icon :icon="['fas', 'building']" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Actifs</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <font-awesome-icon :icon="['fas', 'sitemap']" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalServices }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Services</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <font-awesome-icon :icon="['fas', 'user-tie']" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.withHead }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Avec responsable</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Recherche -->
        <div class="flex-1">
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par nom, code, description..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filtre par statut -->
        <div class="w-full md:w-48">
          <select
            v-model="filterActive"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
          >
            <option :value="undefined">Tous les statuts</option>
            <option :value="true">Actifs</option>
            <option :value="false">Inactifs</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Info drag & drop -->
    <div
      v-if="!searchQuery && filterActive === undefined"
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4"
    >
      <div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
        <font-awesome-icon :icon="['fas', 'info-circle']" class="w-4 h-4" />
        <span>Glissez-déposez les lignes pour réordonner l'affichage des secteurs</span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="w-10 px-4 py-3" />
              <th class="px-4 py-3 text-left">
                <button
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  @click="toggleSort('name')"
                >
                  Secteur
                  <font-awesome-icon :icon="['fas', getSortIcon('name')]" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left">
                <button
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  @click="toggleSort('code')"
                >
                  Code
                  <font-awesome-icon :icon="['fas', getSortIcon('code')]" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Responsable
              </th>
              <th class="px-4 py-3 text-center">
                <button
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  @click="toggleSort('services_count')"
                >
                  Services
                  <font-awesome-icon :icon="['fas', getSortIcon('services_count')]" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-4 py-3 text-center">
                <button
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  @click="toggleSort('display_order')"
                >
                  Ordre
                  <font-awesome-icon :icon="['fas', getSortIcon('display_order')]" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(sector, index) in filteredSectors"
              :key="sector.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'opacity-50': !sector.active }"
              :draggable="!searchQuery && filterActive === undefined"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver"
              @drop="handleDrop($event, index)"
              @dragend="handleDragEnd"
            >
              <!-- Grip -->
              <td class="px-4 py-3">
                <button
                  v-if="!searchQuery && filterActive === undefined"
                  class="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <font-awesome-icon :icon="['fas', 'grip-vertical']" class="w-4 h-4" />
                </button>
              </td>

              <!-- Secteur -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <!-- TODO: Afficher cover_image_external_id via le service MEDIA quand disponible -->
                  <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <font-awesome-icon :icon="['fas', 'building']" class="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ sector.name }}
                    </p>
                    <p v-if="sector.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {{ sector.description }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Code -->
              <td class="px-4 py-3">
                <code class="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {{ sector.code }}
                </code>
              </td>

              <!-- Responsable -->
              <td class="px-4 py-3">
                <div v-if="sector.head" class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="sector.head.photo"
                      :src="sector.head.photo"
                      :alt="sector.head.name"
                      class="w-full h-full object-cover"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'user']" class="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ sector.head.name }}
                    </p>
                    <p v-if="sector.head.title" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ sector.head.title }}
                    </p>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
                  Non assigné
                </span>
              </td>

              <!-- Services -->
              <td class="px-4 py-3 text-center">
                <button
                  class="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                  @click="goToServices(sector.id)"
                >
                  <font-awesome-icon :icon="['fas', 'sitemap']" class="w-3 h-3" />
                  {{ sector.services_count }}
                </button>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3 text-center">
                <button
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors"
                  :class="sector.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'"
                  @click="toggleSectorActive(sector)"
                >
                  <font-awesome-icon :icon="['fas', sector.active ? 'check-circle' : 'pause-circle']" class="w-3 h-3" />
                  {{ sector.active ? 'Actif' : 'Inactif' }}
                </button>
              </td>

              <!-- Ordre -->
              <td class="px-4 py-3 text-center">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ sector.display_order }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Dupliquer"
                    @click="duplicateSectorItem(sector)"
                  >
                    <font-awesome-icon :icon="['fas', 'copy']" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Modifier"
                    @click="openEditModal(sector)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer"
                    @click="openDeleteModal(sector)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredSectors.length === 0"
        class="py-12 text-center"
      >
        <font-awesome-icon :icon="['fas', 'building']" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Aucun secteur trouvé</p>
        <button
          v-if="searchQuery || filterActive !== undefined"
          class="mt-2 text-sm text-brand-red-600 dark:text-brand-red-400 hover:underline"
          @click="searchQuery = ''; filterActive = undefined"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <!-- Modal Ajout/Modification -->
    <Teleport to="body">
      <div
        v-if="showAddModal || showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingSector ? 'Modifier le secteur' : 'Nouveau secteur' }}
            </h2>
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-4 space-y-4">
            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom *
              </label>
              <input
                v-model="newSector.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
                placeholder="Ex: Culture"
                @input="updateCode"
              />
            </div>

            <!-- Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code *
              </label>
              <input
                v-model="newSector.code"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent font-mono"
                placeholder="Ex: DEP-CUL"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Code unique pour identifier le secteur
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <ClientOnly>
                <EditorJS
                  v-model="newSector.description"
                  placeholder="Description courte du secteur..."
                  :min-height="150"
                />
              </ClientOnly>
            </div>

            <!-- Mission -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mission
              </label>
              <ClientOnly>
                <EditorJS
                  v-model="newSector.mission"
                  placeholder="Mission et objectifs du secteur..."
                  :min-height="200"
                />
              </ClientOnly>
            </div>

            <!-- Responsable -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsable
              </label>
              <select
                v-model="newSector.head_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
              >
                <option value="">Aucun responsable</option>
                <option v-for="candidate in headCandidates" :key="candidate.id" :value="candidate.id">
                  {{ candidate.name }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Le responsable sera chargé depuis le service Identité
              </p>
            </div>

            <!-- Actif -->
            <div class="flex items-center gap-3">
              <input
                id="active"
                v-model="newSector.active"
                type="checkbox"
                class="w-4 h-4 text-brand-red-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-red-500"
              />
              <label for="active" class="text-sm text-gray-700 dark:text-gray-300">
                Secteur actif
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              :disabled="isSaving"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-brand-red-600 hover:bg-brand-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              :disabled="!newSector.name || !newSector.code || isSaving"
              @click="saveSector"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="w-4 h-4 animate-spin" />
              {{ editingSector ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingSector"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer le secteur
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Êtes-vous sûr de vouloir supprimer <strong class="text-gray-900 dark:text-white">{{ deletingSector.name }}</strong> ?
            </p>

            <!-- Avertissement si utilisé -->
            <div
              v-if="sectorUsage && !sectorUsage.can_delete"
              class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-left"
            >
              <div class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'warning']" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div class="text-sm">
                  <p class="font-medium text-amber-800 dark:text-amber-200">
                    Ce secteur ne peut pas être supprimé
                  </p>
                  <p class="text-amber-700 dark:text-amber-300 mt-1">
                    Il contient {{ sectorUsage.services_count }} service(s).
                    Veuillez d'abord supprimer ou réassigner les services.
                  </p>
                </div>
              </div>
            </div>

            <!-- Info d'utilisation -->
            <div
              v-else-if="sectorUsage && sectorUsage.services_count > 0"
              class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-left"
            >
              <div class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div class="text-sm">
                  <p class="font-medium text-blue-800 dark:text-blue-200">
                    Utilisation du secteur
                  </p>
                  <ul class="text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                    <li>{{ sectorUsage.services_count }} service(s)</li>
                    <li>{{ sectorUsage.programs_count }} programme(s)</li>
                    <li>{{ sectorUsage.projects_count }} projet(s)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="(sectorUsage && !sectorUsage.can_delete) || isSaving"
              @click="deleteSector"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="w-4 h-4 animate-spin mr-1" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    </template>
  </div>
</template>
