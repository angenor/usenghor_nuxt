<script setup lang="ts">
import type { ApplicationRead, ApplicationStatus, ApplicationStatistics } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

const {
  listApplications,
  getStatistics,
  deleteApplication: apiDeleteApplication,
  updateApplicationStatus,
  applicationStatusLabels,
  salutationLabels,
} = useApplicationsApi()

const { listCalls } = useApplicationCallsApi()

// === STATE ===
const loading = ref(false)
const error = ref<string | null>(null)

// Data
const applications = ref<ApplicationRead[]>([])
const stats = ref<ApplicationStatistics>({
  total: 0,
  submitted: 0,
  under_review: 0,
  accepted: 0,
  rejected: 0,
  waitlisted: 0,
  incomplete: 0,
})
const allCalls = ref<{ id: string; title: string }[]>([])

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

// Filtres
const searchQuery = ref('')
const filterStatus = ref<ApplicationStatus | 'all'>('all')
const filterCallId = ref<string | 'all'>('all')

// Tri
const sortBy = ref<'submitted_at' | 'reference_number' | 'last_name' | 'status' | 'review_score'>('submitted_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Sélection
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modals
const showDeleteModal = ref(false)
const deletingApplication = ref<ApplicationRead | null>(null)
const showAssignModal = ref(false)
const assignReviewerId = ref('')

// === FETCH ===
async function fetchApplications() {
  loading.value = true
  error.value = null

  try {
    const response = await listApplications({
      page: currentPage.value,
      limit: itemsPerPage.value,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
      search: searchQuery.value || undefined,
      status: filterStatus.value,
      call_id: filterCallId.value,
    })

    applications.value = response.items
    totalItems.value = response.total
  } catch {
    error.value = 'Erreur lors du chargement des candidatures'
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const callId = filterCallId.value !== 'all' ? filterCallId.value : undefined
    stats.value = await getStatistics(callId)
  } catch {
    // silently fail for stats
  }
}

async function fetchCalls() {
  try {
    const response = await listCalls({ limit: 100 })
    allCalls.value = response.items.map(c => ({ id: c.id, title: c.title }))
  } catch {
    // silently fail
  }
}

// Initial fetch
onMounted(() => {
  fetchApplications()
  fetchStats()
  fetchCalls()
})

// Watch filters with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    selectedIds.value = []
    selectAll.value = false
    fetchApplications()
  }, 300)
})

watch([filterStatus, filterCallId], () => {
  currentPage.value = 1
  selectedIds.value = []
  selectAll.value = false
  fetchApplications()
  fetchStats()
})

// Watch pagination and sort
watch([currentPage, sortBy, sortOrder], () => {
  selectedIds.value = []
  selectAll.value = false
  fetchApplications()
})

// === METHODS ===
// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = applications.value.map(a => a.id)
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

// Tri
const toggleSort = (column: typeof sortBy.value) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

// Reset filtres
const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterCallId.value = 'all'
  currentPage.value = 1
}

// Navigation
const viewApplication = (id: string) => {
  router.push(`/admin/candidatures/dossiers/${id}`)
}

// Suppression
const confirmDelete = (application: ApplicationRead) => {
  deletingApplication.value = application
  showDeleteModal.value = true
}

const deleteApplication = async () => {
  if (!deletingApplication.value) return

  try {
    await apiDeleteApplication(deletingApplication.value.id)
    showDeleteModal.value = false
    deletingApplication.value = null
    fetchApplications()
    fetchStats()
  } catch {
    error.value = 'Erreur lors de la suppression'
  }
}

// Actions groupées
const bulkAssignReviewer = () => {
  if (selectedIds.value.length > 0) {
    showAssignModal.value = true
  }
}

const confirmBulkAssign = async () => {
  if (!assignReviewerId.value || selectedIds.value.length === 0) return

  try {
    // Pour chaque candidature sélectionnée, mettre à jour le reviewer
    await Promise.all(
      selectedIds.value.map(id =>
        updateApplicationStatus(id, {
          status: 'under_review',
          reviewer_external_id: assignReviewerId.value,
        }),
      ),
    )
    showAssignModal.value = false
    assignReviewerId.value = ''
    selectedIds.value = []
    fetchApplications()
    fetchStats()
  } catch {
    error.value = 'Erreur lors de l\'assignation'
  }
}

const bulkChangeStatus = async (status: ApplicationStatus) => {
  if (selectedIds.value.length === 0) return

  try {
    await Promise.all(
      selectedIds.value.map(id =>
        updateApplicationStatus(id, { status }),
      ),
    )
    selectedIds.value = []
    fetchApplications()
    fetchStats()
  } catch {
    error.value = 'Erreur lors du changement de statut'
  }
}

const exportSelection = () => {
  console.log('Export des candidatures:', selectedIds.value.length > 0 ? selectedIds.value : 'toutes')
}

// Formatage
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: ApplicationStatus) => {
  const colors: Record<ApplicationStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    waitlisted: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    incomplete: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dossiers de candidature</h1>
        <p class="mt-1 text-gray-600 dark:text-gray-400">Gérez et évaluez les candidatures soumises</p>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="exportSelection"
        >
          <font-awesome-icon icon="fa-solid fa-download" class="mr-2 h-4 w-4" />
          Exporter
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Soumises</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.submitted }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">En évaluation</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.under_review }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Acceptées</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.accepted }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Rejetées</p>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ stats.rejected }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Liste d'attente</p>
        <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ stats.waitlisted }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Recherche -->
        <div class="relative flex-1 lg:max-w-md">
          <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Référence, nom, email..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-2">
          <select
            v-model="filterStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option v-for="(label, status) in applicationStatusLabels" :key="status" :value="status">
              {{ label }}
            </option>
          </select>

          <select
            v-model="filterCallId"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les appels</option>
            <option value="spontaneous">Candidatures spontanées</option>
            <option v-for="call in allCalls" :key="call.id" :value="call.id">
              {{ call.title }}
            </option>
          </select>

          <button
            v-if="searchQuery || filterStatus !== 'all' || filterCallId !== 'all'"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="resetFilters"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Actions groupées -->
      <div
        v-if="selectedIds.length > 0"
        class="mt-4 flex items-center gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
      >
        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
          {{ selectedIds.length }} sélectionnée(s)
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="bulkAssignReviewer"
          >
            <font-awesome-icon icon="fa-solid fa-user-plus" class="mr-1 h-3 w-3" />
            Assigner évaluateur
          </button>
          <button
            class="rounded bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
            @click="bulkChangeStatus('under_review')"
          >
            <font-awesome-icon icon="fa-solid fa-clock" class="mr-1 h-3 w-3" />
            En évaluation
          </button>
          <button
            class="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
            @click="bulkChangeStatus('accepted')"
          >
            <font-awesome-icon icon="fa-solid fa-check" class="mr-1 h-3 w-3" />
            Accepter
          </button>
          <button
            class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            @click="bulkChangeStatus('rejected')"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="mr-1 h-3 w-3" />
            Rejeter
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>

    <!-- Table -->
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
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('reference_number')"
              >
                <span class="flex items-center gap-1">
                  Référence
                  <font-awesome-icon v-if="sortBy === 'reference_number'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('last_name')"
              >
                <span class="flex items-center gap-1">
                  Candidat
                  <font-awesome-icon v-if="sortBy === 'last_name'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('submitted_at')"
              >
                <span class="flex items-center gap-1">
                  Date soumission
                  <font-awesome-icon v-if="sortBy === 'submitted_at'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('status')"
              >
                <span class="flex items-center gap-1">
                  Statut
                  <font-awesome-icon v-if="sortBy === 'status'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('review_score')"
              >
                <span class="flex items-center gap-1">
                  Score
                  <font-awesome-icon v-if="sortBy === 'review_score'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="app in applications"
              :key="app.id"
              class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': isSelected(app.id) }"
              @click="viewApplication(app.id)"
            >
              <td class="px-4 py-4" @click.stop>
                <input
                  :checked="isSelected(app.id)"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelect(app.id)"
                />
              </td>
              <td class="px-4 py-4">
                <span class="font-mono text-sm text-gray-900 dark:text-white">{{ app.reference_number }}</span>
              </td>
              <td class="px-4 py-4">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ app.salutation ? salutationLabels[app.salutation] + ' ' : '' }}{{ app.last_name }} {{ app.first_name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ app.email }}</p>
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDateTime(app.submitted_at) }}
              </td>
              <td class="px-4 py-4">
                <span :class="['inline-flex rounded-full px-2 py-1 text-xs font-medium', getStatusColor(app.status)]">
                  {{ applicationStatusLabels[app.status] }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span v-if="app.review_score" class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ Number(app.review_score).toFixed(1) }}
                </span>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-4 py-4 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Voir le dossier"
                    @click="viewApplication(app.id)"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="confirmDelete(app)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalItems) }} sur {{ totalItems }} candidatures
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
        v-if="applications.length === 0 && !loading"
        class="flex flex-col items-center justify-center py-12"
      >
        <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
          <font-awesome-icon icon="fa-solid fa-folder-open" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
          Aucune candidature trouvée
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos filtres.
        </p>
      </div>
    </div>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingApplication"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer la candidature
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette candidature ?
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingApplication.reference_number }} - {{ deletingApplication.last_name }} {{ deletingApplication.first_name }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="deleteApplication"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Assignation -->
    <Teleport to="body">
      <div
        v-if="showAssignModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showAssignModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Assigner un évaluateur
          </h3>
          <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {{ selectedIds.length }} candidature(s) sélectionnée(s)
          </p>

          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">ID de l'évaluateur</label>
            <input
              v-model="assignReviewerId"
              type="text"
              placeholder="Entrez l'ID de l'évaluateur"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showAssignModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="!assignReviewerId"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="confirmBulkAssign"
            >
              Assigner
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
