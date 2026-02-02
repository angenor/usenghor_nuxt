<script setup lang="ts">
import type {
  ServiceDisplay,
  ServiceUsage,
  ServiceStats,
  ServicesBySector,
} from '~/composables/useServicesApi'
import type { OutputData } from '@editorjs/editorjs'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const {
  getAllServices,
  getServicesGroupedBySector,
  getServicesStats,
  getServiceUsage: fetchServiceUsage,
  getSectorsForSelect,
  createService: apiCreateService,
  updateService: apiUpdateService,
  deleteService: apiDeleteService,
  duplicateService: apiDuplicateService,
  toggleServiceActive: apiToggleServiceActive,
  generateServiceId
} = useServicesApi()

const { apiFetch } = useApi()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const searchQuery = ref('')
const filterSector = ref<string | undefined>(route.query.sector as string || undefined)
const filterActive = ref<boolean | undefined>(undefined)
const sortBy = ref<'name' | 'display_order' | 'sector' | 'objectives_count'>('display_order')
const sortOrder = ref<'asc' | 'desc'>('asc')
const viewMode = ref<'table' | 'grouped'>('table')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingService = ref<ServiceDisplay | null>(null)
const deletingService = ref<ServiceDisplay | null>(null)
const serviceUsage = ref<ServiceUsage | null>(null)
const expandedSectors = ref<Set<string>>(new Set())

// Données chargées depuis l'API
const allServices = ref<ServiceDisplay[]>([])
const servicesGrouped = ref<ServicesBySector[]>([])
const stats = ref<ServiceStats>({
  total: 0,
  active: 0,
  inactive: 0,
  withHead: 0,
  withoutHead: 0,
  bySector: [],
  totalObjectives: 0,
  totalAchievements: 0,
  totalProjects: 0
})
const sectors = ref<Array<{ id: string; name: string; code: string }>>([])

// Candidats responsables (utilisateurs)
interface HeadCandidate {
  id: string
  name: string
}
const headCandidates = ref<HeadCandidate[]>([])

// Form state
const newService = ref<{
  name: string
  sector_id: string
  description: OutputData | undefined
  mission: OutputData | undefined
  head_external_id: string
  email: string
  phone: string
  active: boolean
}>({
  name: '',
  sector_id: '',
  description: undefined,
  mission: undefined,
  head_external_id: '',
  email: '',
  phone: '',
  active: true
})

// === CHARGEMENT DES DONNÉES ===
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

async function loadData() {
  isLoading.value = true
  try {
    // Charger les secteurs en premier
    const sectorsData = await getSectorsForSelect()
    sectors.value = sectorsData

    const [servicesData, groupedData, statsData] = await Promise.all([
      getAllServices(),
      getServicesGroupedBySector(),
      getServicesStats()
    ])
    allServices.value = servicesData
    servicesGrouped.value = groupedData
    stats.value = statsData
  }
  catch (error) {
    console.error('Erreur lors du chargement des services:', error)
  }
  finally {
    isLoading.value = false
  }
}

// Enrichir les services avec les infos des responsables
function enrichServicesWithHeads() {
  if (headCandidates.value.length === 0) return

  // Enrichir la liste plate
  allServices.value = allServices.value.map((service) => {
    if (service.head_external_id) {
      const candidate = headCandidates.value.find(c => c.id === service.head_external_id)
      if (candidate) {
        return {
          ...service,
          head: {
            id: candidate.id,
            name: candidate.name,
            title: null,
            photo: null,
          },
        }
      }
    }
    return { ...service, head: null }
  })

  // Enrichir la liste groupée
  servicesGrouped.value = servicesGrouped.value.map(group => ({
    ...group,
    services: group.services.map((service) => {
      if (service.head_external_id) {
        const candidate = headCandidates.value.find(c => c.id === service.head_external_id)
        if (candidate) {
          return {
            ...service,
            head: {
              id: candidate.id,
              name: candidate.name,
              title: null,
              photo: null,
            },
          }
        }
      }
      return { ...service, head: null }
    }),
  }))
}

// Charger les données au montage
onMounted(async () => {
  await Promise.all([loadData(), loadHeadCandidates()])
  enrichServicesWithHeads()
  if (filterSector.value) {
    expandedSectors.value.add(filterSector.value)
  }
})

// Services filtrés et triés
const filteredServices = computed(() => {
  let result = [...allServices.value]

  // Filtre par secteur
  if (filterSector.value) {
    result = result.filter(s => s.sector_id === filterSector.value)
  }

  // Filtre par statut actif
  if (filterActive.value !== undefined) {
    result = result.filter(s => s.active === filterActive.value)
  }

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query) ||
      s.sector?.name?.toLowerCase().includes(query) ||
      s.head?.name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query)
    )
  }

  // Tri
  result.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy.value === 'sector') {
      comparison = (a.sector?.name || '').localeCompare(b.sector?.name || '')
    } else if (sortBy.value === 'objectives_count') {
      comparison = a.objectives_count - b.objectives_count
    } else if (sortBy.value === 'display_order') {
      comparison = a.display_order - b.display_order
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// Services groupés filtrés
const filteredServicesGrouped = computed(() => {
  if (!searchQuery.value && filterActive.value === undefined) {
    return servicesGrouped.value
  }

  return servicesGrouped.value.map(group => ({
    ...group,
    services: group.services.filter(s => {
      let match = true
      if (filterActive.value !== undefined) {
        match = match && s.active === filterActive.value
      }
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        match = match && (
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.head?.name.toLowerCase().includes(query)
        )
      }
      return match
    })
  })).filter(group => group.services.length > 0)
})

// === METHODS ===
const toggleSort = (field: 'name' | 'display_order' | 'sector' | 'objectives_count') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: 'name' | 'display_order' | 'sector' | 'objectives_count') => {
  if (sortBy.value !== field) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-up' : 'sort-down'
}

const toggleSectorExpand = (sectorId: string) => {
  if (expandedSectors.value.has(sectorId)) {
    expandedSectors.value.delete(sectorId)
  } else {
    expandedSectors.value.add(sectorId)
  }
}

const expandAllSectors = () => {
  servicesGrouped.value.forEach(group => {
    expandedSectors.value.add(group.sector.id)
  })
}

const collapseAllSectors = () => {
  expandedSectors.value.clear()
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

// Extraire le texte brut d'un contenu EditorJS (string JSON) pour l'affichage dans la liste
const getPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .filter((block: { type: string; data?: { text?: string } }) => block.type === 'paragraph' && block.data?.text)
        .map((block: { data: { text: string } }) => {
          // Supprimer les balises HTML du texte
          return block.data.text.replace(/<[^>]*>/g, '')
        })
        .join(' ')
        .slice(0, 200) // Limiter à 200 caractères
    }
  } catch {
    // Si ce n'est pas du JSON, retourner le texte tel quel
    return content.slice(0, 200)
  }
  return ''
}

// Modals
const openAddModal = () => {
  newService.value = {
    name: '',
    sector_id: filterSector.value || '',
    description: undefined,
    mission: undefined,
    head_external_id: '',
    email: '',
    phone: '',
    active: true
  }
  showAddModal.value = true
}

const openEditModal = (service: ServiceDisplay) => {
  editingService.value = service
  newService.value = {
    name: service.name,
    sector_id: service.sector_id || '',
    description: parseEditorContent(service.description),
    mission: parseEditorContent(service.mission),
    head_external_id: service.head_external_id || '',
    email: service.email || '',
    phone: service.phone || '',
    active: service.active
  }
  showEditModal.value = true
}

const openDeleteModal = async (service: ServiceDisplay) => {
  deletingService.value = service
  serviceUsage.value = await fetchServiceUsage(service.id)
  showDeleteModal.value = true
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  editingService.value = null
  deletingService.value = null
  serviceUsage.value = null
}

// CRUD operations
const saveService = async () => {
  isSaving.value = true
  try {
    // Convertir les OutputData en JSON string pour l'API
    const descriptionJson = newService.value.description && newService.value.description.blocks?.length
      ? JSON.stringify(newService.value.description)
      : null
    const missionJson = newService.value.mission && newService.value.mission.blocks?.length
      ? JSON.stringify(newService.value.mission)
      : null

    const serviceData = {
      name: newService.value.name,
      sector_id: newService.value.sector_id || null,
      description: descriptionJson,
      mission: missionJson,
      head_external_id: newService.value.head_external_id || null,
      email: newService.value.email || null,
      phone: newService.value.phone || null,
      active: newService.value.active
    }

    if (editingService.value) {
      await apiUpdateService(editingService.value.id, serviceData)
    } else {
      await apiCreateService(serviceData)
    }

    closeModals()
    await loadData()
    enrichServicesWithHeads()
  }
  catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
  finally {
    isSaving.value = false
  }
}

const deleteServiceAction = async () => {
  if (!deletingService.value) return

  isSaving.value = true
  try {
    await apiDeleteService(deletingService.value.id)
    closeModals()
    await loadData()
    enrichServicesWithHeads()
  }
  catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
  finally {
    isSaving.value = false
  }
}

const toggleServiceActive = async (service: ServiceDisplay) => {
  try {
    await apiToggleServiceActive(service.id)
    await loadData()
    enrichServicesWithHeads()
  }
  catch (error) {
    console.error('Erreur lors du basculement:', error)
  }
}

const duplicateServiceItem = async (service: ServiceDisplay) => {
  isSaving.value = true
  try {
    const newName = `${service.name} (copie)`
    await apiDuplicateService(service.id, newName)
    await loadData()
    enrichServicesWithHeads()
  }
  catch (error) {
    console.error('Erreur lors de la duplication:', error)
  }
  finally {
    isSaving.value = false
  }
}

// Accès aux détails du service
const goToServiceDetails = (serviceId: string) => {
  navigateTo(`/admin/organisation/services/${serviceId}`)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Clear sector filter from URL
const clearSectorFilter = () => {
  filterSector.value = undefined
  navigateTo('/admin/organisation/services')
}
</script>

<template>
  <div class="p-6">
    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center min-h-[400px]"
    >
      <div class="text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 text-brand-red-600 animate-spin mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Chargement des services...</p>
      </div>
    </div>

    <template v-else>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Services
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des services de l'université
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-red-600 rounded-lg hover:bg-brand-red-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4" />
        Nouveau service
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <font-awesome-icon :icon="['fas', 'sitemap']" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
            <font-awesome-icon :icon="['fas', 'bullseye']" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalObjectives }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Objectifs</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <font-awesome-icon :icon="['fas', 'trophy']" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalAchievements }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Réalisations</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <font-awesome-icon :icon="['fas', 'diagram-project']" class="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalProjects }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Projets</p>
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
              placeholder="Rechercher par nom, description, responsable..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filtre par secteur -->
        <div class="w-full md:w-56">
          <select
            v-model="filterSector"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
          >
            <option :value="undefined">Tous les secteurs</option>
            <option v-for="dept in sectors" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <!-- Filtre par statut -->
        <div class="w-full md:w-40">
          <select
            v-model="filterActive"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
          >
            <option :value="undefined">Tous les statuts</option>
            <option :value="true">Actifs</option>
            <option :value="false">Inactifs</option>
          </select>
        </div>

        <!-- Vue toggle -->
        <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="viewMode === 'table'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
            @click="viewMode = 'table'"
          >
            <font-awesome-icon :icon="['fas', 'table-list']" class="w-4 h-4" />
          </button>
          <button
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="viewMode === 'grouped'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
            @click="viewMode = 'grouped'"
          >
            <font-awesome-icon :icon="['fas', 'layer-group']" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Active sector filter indicator -->
      <div
        v-if="filterSector"
        class="mt-3 flex items-center gap-2"
      >
        <span class="text-sm text-gray-500 dark:text-gray-400">Filtré par :</span>
        <span
          class="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
        >
          {{ sectors.find(d => d.id === filterSector)?.name }}
          <button
            class="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
            @click="clearSectorFilter"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>

    <!-- Vue Table -->
    <div v-if="viewMode === 'table'" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left">
                <button
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  @click="toggleSort('name')"
                >
                  Service
                  <font-awesome-icon :icon="['fas', getSortIcon('name')]" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left">
                <button
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  @click="toggleSort('sector')"
                >
                  Secteur
                  <font-awesome-icon :icon="['fas', getSortIcon('sector')]" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Responsable
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-4 py-3 text-center">
                <button
                  class="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                  @click="toggleSort('objectives_count')"
                >
                  Données
                  <font-awesome-icon :icon="['fas', getSortIcon('objectives_count')]" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="service in filteredServices"
              :key="service.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'opacity-50': !service.active }"
            >
              <!-- Service -->
              <td class="px-4 py-3">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ service.name }}
                  </p>
                  <p v-if="getPlainText(service.description)" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {{ getPlainText(service.description) }}
                  </p>
                </div>
              </td>

              <!-- Secteur -->
              <td class="px-4 py-3">
                <span
                  v-if="service.sector"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {{ service.sector.name }}
                </span>
                <span v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
                  Non assigné
                </span>
              </td>

              <!-- Responsable -->
              <td class="px-4 py-3">
                <div v-if="service.head" class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="service.head.photo"
                      :src="service.head.photo"
                      :alt="service.head.name"
                      class="w-full h-full object-cover"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'user']" class="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ service.head.name }}
                    </p>
                    <p v-if="service.head.title" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ service.head.title }}
                    </p>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
                  Non assigné
                </span>
              </td>

              <!-- Contact -->
              <td class="px-4 py-3">
                <div class="text-sm">
                  <p v-if="service.email" class="text-gray-600 dark:text-gray-300">
                    {{ service.email }}
                  </p>
                  <p v-if="service.phone" class="text-gray-500 dark:text-gray-400">
                    {{ service.phone }}
                  </p>
                  <span v-if="!service.email && !service.phone" class="text-gray-400 dark:text-gray-500 italic">
                    —
                  </span>
                </div>
              </td>

              <!-- Données (objectifs, réalisations, projets) -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-3 text-xs">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                    :class="service.objectives_count > 0
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
                  >
                    <font-awesome-icon :icon="['fas', 'bullseye']" class="w-3 h-3" />
                    {{ service.objectives_count }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                    :class="service.achievements_count > 0
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
                  >
                    <font-awesome-icon :icon="['fas', 'trophy']" class="w-3 h-3" />
                    {{ service.achievements_count }}
                  </span>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                    :class="service.projects_count > 0
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
                  >
                    <font-awesome-icon :icon="['fas', 'diagram-project']" class="w-3 h-3" />
                    {{ service.projects_count }}
                  </span>
                </div>
              </td>

              <!-- Statut -->
              <td class="px-4 py-3 text-center">
                <button
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors"
                  :class="service.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'"
                  @click="toggleServiceActive(service)"
                >
                  <font-awesome-icon :icon="['fas', service.active ? 'check-circle' : 'pause-circle']" class="w-3 h-3" />
                  {{ service.active ? 'Actif' : 'Inactif' }}
                </button>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Voir les détails"
                    @click="goToServiceDetails(service.id)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                    title="Dupliquer"
                    @click="duplicateServiceItem(service)"
                  >
                    <font-awesome-icon :icon="['fas', 'copy']" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Modifier"
                    @click="openEditModal(service)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer"
                    @click="openDeleteModal(service)"
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
        v-if="filteredServices.length === 0"
        class="py-12 text-center"
      >
        <font-awesome-icon :icon="['fas', 'sitemap']" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Aucun service trouvé</p>
        <button
          v-if="searchQuery || filterSector || filterActive !== undefined"
          class="mt-2 text-sm text-brand-red-600 dark:text-brand-red-400 hover:underline"
          @click="searchQuery = ''; filterSector = undefined; filterActive = undefined"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>

    <!-- Vue Groupée par secteur -->
    <div v-else class="space-y-4">
      <!-- Expand/Collapse all buttons -->
      <div class="flex items-center justify-end gap-2 mb-2">
        <button
          class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          @click="expandAllSectors"
        >
          Tout déplier
        </button>
        <span class="text-gray-300 dark:text-gray-600">|</span>
        <button
          class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          @click="collapseAllSectors"
        >
          Tout replier
        </button>
      </div>

      <!-- Department accordions -->
      <div
        v-for="group in filteredServicesGrouped"
        :key="group.sector.id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <!-- Department header -->
        <button
          class="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          @click="toggleSectorExpand(group.sector.id)"
        >
          <div class="flex items-center gap-3">
            <div
              v-if="group.sector.icon"
              class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            >
              <font-awesome-icon :icon="['fas', group.sector.icon]" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900 dark:text-white">
                {{ group.sector.name }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ group.services.length }} service(s)
              </p>
            </div>
          </div>
          <font-awesome-icon
            :icon="['fas', 'chevron-down']"
            class="w-4 h-4 text-gray-400 transition-transform"
            :class="{ 'rotate-180': expandedSectors.has(group.sector.id) }"
          />
        </button>

        <!-- Services list -->
        <div
          v-show="expandedSectors.has(group.sector.id)"
          class="border-t border-gray-200 dark:border-gray-700"
        >
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <div
              v-for="service in group.services"
              :key="service.id"
              class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30"
              :class="{ 'opacity-50': !service.active }"
            >
              <div class="flex items-center gap-4 flex-1">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">
                    {{ service.name }}
                  </p>
                  <div class="flex items-center gap-4 mt-1">
                    <span v-if="service.head" class="text-sm text-gray-500 dark:text-gray-400">
                      {{ service.head.name }}
                    </span>
                    <span v-if="service.email" class="text-sm text-gray-400 dark:text-gray-500">
                      {{ service.email }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span
                    v-if="service.objectives_count > 0"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                  >
                    <font-awesome-icon :icon="['fas', 'bullseye']" class="w-3 h-3" />
                    {{ service.objectives_count }}
                  </span>
                  <span
                    v-if="service.achievements_count > 0"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded"
                  >
                    <font-awesome-icon :icon="['fas', 'trophy']" class="w-3 h-3" />
                    {{ service.achievements_count }}
                  </span>
                  <span
                    v-if="service.projects_count > 0"
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded"
                  >
                    <font-awesome-icon :icon="['fas', 'diagram-project']" class="w-3 h-3" />
                    {{ service.projects_count }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <span
                  class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                  :class="service.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
                >
                  {{ service.active ? 'Actif' : 'Inactif' }}
                </span>
                <button
                  class="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                  title="Dupliquer"
                  @click.stop="duplicateServiceItem(service)"
                >
                  <font-awesome-icon :icon="['fas', 'copy']" class="w-4 h-4" />
                </button>
                <button
                  class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Modifier"
                  @click.stop="openEditModal(service)"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" class="w-4 h-4" />
                </button>
                <button
                  class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Supprimer"
                  @click.stop="openDeleteModal(service)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="filteredServicesGrouped.length === 0"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 py-12 text-center"
      >
        <font-awesome-icon :icon="['fas', 'sitemap']" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Aucun service trouvé</p>
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
        <div class="admin-scrollbar bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-lenis-prevent>
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingService ? 'Modifier le service' : 'Nouveau service' }}
            </h2>
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-4 space-y-4">
            <!-- Secteur parent -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Secteur *
              </label>
              <select
                v-model="newService.sector_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
              >
                <option value="">Sélectionner un secteur</option>
                <option v-for="dept in sectors" :key="dept.id" :value="dept.id">
                  {{ dept.name }} ({{ dept.code }})
                </option>
              </select>
            </div>

            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom *
              </label>
              <input
                v-model="newService.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
                placeholder="Ex: Service de Scolarité"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <ClientOnly>
                <EditorJS
                  v-model="newService.description"
                  placeholder="Description du service..."
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
                  v-model="newService.mission"
                  placeholder="Mission et objectifs du service..."
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
                v-model="newService.head_external_id"
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

            <div class="grid grid-cols-2 gap-4">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email de contact
                </label>
                <input
                  v-model="newService.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
                  placeholder="service@usenghor.org"
                />
              </div>

              <!-- Téléphone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  v-model="newService.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-red-500 focus:border-transparent"
                  placeholder="+20 3 xxx xxxx"
                />
              </div>
            </div>

            <!-- Actif -->
            <div class="flex items-center gap-3">
              <input
                id="active"
                v-model="newService.active"
                type="checkbox"
                class="w-4 h-4 text-brand-red-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-red-500"
              />
              <label for="active" class="text-sm text-gray-700 dark:text-gray-300">
                Service actif
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
              class="px-4 py-2 text-sm font-medium text-white bg-brand-red-600 hover:bg-brand-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!newService.name || !newService.sector_id || isSaving"
              @click="saveService"
            >
              <span v-if="isSaving">Enregistrement...</span>
              <span v-else>{{ editingService ? 'Enregistrer' : 'Créer' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingService"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer le service
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Êtes-vous sûr de vouloir supprimer <strong class="text-gray-900 dark:text-white">{{ deletingService.name }}</strong> ?
            </p>

            <!-- Avertissement si utilisé -->
            <div
              v-if="serviceUsage && !serviceUsage.can_delete"
              class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4 text-left"
            >
              <div class="flex items-start gap-2">
                <font-awesome-icon :icon="['fas', 'warning']" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div class="text-sm">
                  <p class="font-medium text-amber-800 dark:text-amber-200">
                    Ce service ne peut pas être supprimé
                  </p>
                  <p class="text-amber-700 dark:text-amber-300 mt-1">
                    Il contient {{ serviceUsage.objectives_count }} objectif(s),
                    {{ serviceUsage.achievements_count }} réalisation(s) et
                    {{ serviceUsage.projects_count }} projet(s).
                  </p>
                  <ul v-if="serviceUsage.items_sample.length > 0" class="mt-2 space-y-1">
                    <li v-for="(item, index) in serviceUsage.items_sample" :key="index">
                      • {{ item.type }}: {{ item.title }}
                    </li>
                  </ul>
                </div>
              </div>
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
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="(serviceUsage && !serviceUsage.can_delete) || isSaving"
              @click="deleteServiceAction"
            >
              <span v-if="isSaving">Suppression...</span>
              <span v-else>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    </template>
  </div>
</template>
