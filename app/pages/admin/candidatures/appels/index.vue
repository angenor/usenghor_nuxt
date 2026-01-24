<script setup lang="ts">
import type { ApplicationCall, CallType, CallStatus, PublicationStatus } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  getAllApplicationCalls,
  getApplicationCallsStats,
  callTypeLabels,
  callTypeColors,
  callStatusLabels,
  callStatusColors,
  publicationStatusLabels,
  publicationStatusColors,
  formations,
  getFormationBySlug
} = useMockData()

// === STATE ===
// Filtres
const searchQuery = ref('')
const filterType = ref<CallType | 'all'>('all')
const filterStatus = ref<CallStatus | 'all'>('all')
const filterPublicationStatus = ref<PublicationStatus | 'all'>('all')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Tri
const sortBy = ref<'title' | 'type' | 'status' | 'deadline' | 'applications'>('deadline')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Sélection
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modals
const showDeleteModal = ref(false)
const deletingCall = ref<ApplicationCall | null>(null)

// === COMPUTED ===
const allCalls = computed(() => getAllApplicationCalls())

// Stats
const stats = computed(() => getApplicationCallsStats())

// Filtrage
const filteredCalls = computed(() => {
  let result = allCalls.value

  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  }

  // Filtre type
  if (filterType.value !== 'all') {
    result = result.filter(c => c.type === filterType.value)
  }

  // Filtre statut
  if (filterStatus.value !== 'all') {
    result = result.filter(c => c.status === filterStatus.value)
  }

  // Filtre publication
  if (filterPublicationStatus.value !== 'all') {
    result = result.filter(c => c.publication_status === filterPublicationStatus.value)
  }

  // Tri
  result = [...result].sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'deadline':
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0
        comparison = dateA - dateB
        break
      case 'applications':
        comparison = (a.applications_count || 0) - (b.applications_count || 0)
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredCalls.value.length / itemsPerPage.value))

const paginatedCalls = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCalls.value.slice(start, end)
})

// === METHODS ===
// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedCalls.value.map(c => c.id)
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
  filterType.value = 'all'
  filterStatus.value = 'all'
  filterPublicationStatus.value = 'all'
  currentPage.value = 1
}

// Navigation
const viewCall = (call: ApplicationCall) => {
  router.push(`/admin/candidatures/appels/${call.id}`)
}

const editCall = (call: ApplicationCall) => {
  router.push(`/admin/candidatures/appels/${call.id}/edit`)
}

const createCall = () => {
  router.push('/admin/candidatures/appels/nouveau')
}

// Modals
const openDeleteModal = (call: ApplicationCall) => {
  deletingCall.value = call
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingCall.value = null
}

// Actions CRUD (mock)
const deleteCall = () => {
  if (!deletingCall.value) return
  console.log('Deleting call:', deletingCall.value.id)
  // En production: DELETE /api/admin/application-calls/{id}
  closeDeleteModal()
}

const duplicateCall = (call: ApplicationCall) => {
  console.log('Duplicating call:', call.id)
  // En production: POST /api/admin/application-calls/{id}/duplicate
}

// Actions en masse
const bulkPublish = () => {
  console.log('Publishing:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

const bulkUnpublish = () => {
  console.log('Unpublishing:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

const bulkClose = () => {
  console.log('Closing:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

// Formatage
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isDeadlinePassed = (deadline?: string) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const isDeadlineSoon = (deadline?: string) => {
  if (!deadline) return false
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diff = deadlineDate.getTime() - now.getTime()
  const daysRemaining = diff / (1000 * 60 * 60 * 24)
  return daysRemaining > 0 && daysRemaining <= 7
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Appels à candidatures
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les appels à candidatures, bourses, recrutements et projets
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="createCall"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Nouvel appel
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
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
        <p class="text-xs text-gray-500 dark:text-gray-400">En cours</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.ongoing }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">À venir</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.upcoming }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Fermés</p>
        <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ stats.closed }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Candidatures</p>
        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ stats.totalApplications }}</p>
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
            placeholder="Rechercher un appel..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-2">
          <select
            v-model="filterType"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="application">Candidature</option>
            <option value="scholarship">Bourse</option>
            <option value="project">Projet</option>
            <option value="recruitment">Recrutement</option>
            <option value="training">Formation</option>
          </select>

          <select
            v-model="filterStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="ongoing">En cours</option>
            <option value="upcoming">À venir</option>
            <option value="closed">Fermé</option>
          </select>

          <select
            v-model="filterPublicationStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Toutes les publications</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>

          <button
            v-if="searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterPublicationStatus !== 'all'"
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
          {{ selectedIds.length }} appel(s) sélectionné(s)
        </span>
        <div class="flex gap-2">
          <button
            class="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
            @click="bulkPublish"
          >
            Publier
          </button>
          <button
            class="rounded bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
            @click="bulkUnpublish"
          >
            Dépublier
          </button>
          <button
            class="rounded bg-gray-600 px-3 py-1 text-xs font-medium text-white hover:bg-gray-700"
            @click="bulkClose"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau -->
    <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
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
                @click="toggleSort('title')"
              >
                <span class="flex items-center gap-1">
                  Appel
                  <font-awesome-icon v-if="sortBy === 'title'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('type')"
              >
                <span class="flex items-center gap-1">
                  Type
                  <font-awesome-icon v-if="sortBy === 'type'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
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
                @click="toggleSort('deadline')"
              >
                <span class="flex items-center gap-1">
                  Date limite
                  <font-awesome-icon v-if="sortBy === 'deadline'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('applications')"
              >
                <span class="flex items-center gap-1">
                  Candidatures
                  <font-awesome-icon v-if="sortBy === 'applications'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Publication
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="call in paginatedCalls"
              :key="call.id"
              class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': isSelected(call.id) }"
              @click="viewCall(call)"
            >
              <td class="px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="isSelected(call.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelect(call.id)"
                />
              </td>
              <td class="px-4 py-3">
                <div class="min-w-0">
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {{ call.title }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ call.slug }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="callTypeColors[call.type]"
                >
                  {{ callTypeLabels[call.type] }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                  :class="callStatusColors[call.status]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="{
                      'bg-green-500': call.status === 'ongoing',
                      'bg-yellow-500': call.status === 'upcoming',
                      'bg-gray-500': call.status === 'closed'
                    }"
                  ></span>
                  {{ callStatusLabels[call.status] }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm">
                  <span
                    :class="{
                      'text-red-600 dark:text-red-400': isDeadlinePassed(call.deadline),
                      'text-orange-600 dark:text-orange-400': isDeadlineSoon(call.deadline) && !isDeadlinePassed(call.deadline),
                      'text-gray-600 dark:text-gray-300': !isDeadlinePassed(call.deadline) && !isDeadlineSoon(call.deadline)
                    }"
                  >
                    {{ formatDate(call.deadline) }}
                  </span>
                  <span
                    v-if="isDeadlinePassed(call.deadline)"
                    class="ml-1 text-xs text-red-500"
                    title="Date limite dépassée"
                  >
                    <font-awesome-icon icon="fa-solid fa-exclamation-circle" class="h-3 w-3" />
                  </span>
                  <span
                    v-else-if="isDeadlineSoon(call.deadline)"
                    class="ml-1 text-xs text-orange-500"
                    title="Date limite proche"
                  >
                    <font-awesome-icon icon="fa-solid fa-clock" class="h-3 w-3" />
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-users" class="h-4 w-4 text-gray-400" />
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ call.applications_count || 0 }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="publicationStatusColors[call.publication_status]"
                >
                  {{ publicationStatusLabels[call.publication_status] }}
                </span>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Voir les détails"
                    @click="viewCall(call)"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="editCall(call)"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                    title="Dupliquer"
                    @click="duplicateCall(call)"
                  >
                    <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(call)"
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
          {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredCalls.length) }} sur {{ filteredCalls.length }} appels
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
        v-if="paginatedCalls.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
          <font-awesome-icon icon="fa-solid fa-bullhorn" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
          Aucun appel trouvé
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos filtres ou créez un nouvel appel.
        </p>
      </div>
    </div>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingCall"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'appel
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cet appel ?
          </p>
          <p
            v-if="deletingCall.applications_count && deletingCall.applications_count > 0"
            class="mb-2 text-sm text-red-600 dark:text-red-400"
          >
            Attention : cet appel contient {{ deletingCall.applications_count }} candidature(s).
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingCall.title }}
          </p>

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
              @click="deleteCall"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
