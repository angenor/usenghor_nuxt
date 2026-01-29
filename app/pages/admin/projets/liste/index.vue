<script setup lang="ts">
import type { ProjectCategoryRead, ProjectStatus, PublicationStatus } from '~/types/api'
import type { ProjectDisplay } from '~/composables/useProjectsApi'

definePageMeta({
  layout: 'admin'
})

const {
  listProjects,
  getAllCategories,
  getProjectStats,
  deleteProject: deleteProjectApi,
  publishProject,
  unpublishProject,
  projectStatusLabels,
  projectStatusColors,
  publicationStatusLabels,
  publicationStatusColors,
  formatDateShort,
  formatBudget,
} = useProjectsApi()

const { sectors } = useReferenceData()

// === ÉTAT ===
const isLoading = ref(true)
const error = ref<string | null>(null)
const projects = ref<ProjectDisplay[]>([])
const categories = ref<ProjectCategoryRead[]>([])
const totalProjects = ref(0)
const stats = ref({
  total: 0,
  byStatus: { planned: 0, ongoing: 0, completed: 0, suspended: 0 },
  byPublicationStatus: { draft: 0, published: 0, archived: 0 },
  totalBudget: 0,
})

// === FILTRES ===
const searchQuery = ref('')
const filterStatus = ref<ProjectStatus | 'all'>('all')
const filterPublicationStatus = ref<PublicationStatus | 'all'>('all')
const filterCategory = ref<string | 'all'>('all')
const filterSector = ref<string | 'all'>('all')

// === PAGINATION ===
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalPages = computed(() => Math.ceil(totalProjects.value / itemsPerPage.value))

// === SÉLECTION ===
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// === CHARGEMENT DES DONNÉES ===
async function loadProjects() {
  isLoading.value = true
  error.value = null

  try {
    const response = await listProjects({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      status: filterStatus.value,
      publication_status: filterPublicationStatus.value,
      category_id: filterCategory.value,
      sector_external_id: filterSector.value,
    })

    projects.value = response.items
    totalProjects.value = response.total
  }
  catch (err: any) {
    console.error('Erreur chargement projets:', err)
    error.value = err.message || 'Erreur lors du chargement des projets'
  }
  finally {
    isLoading.value = false
  }
}

async function loadCategories() {
  try {
    categories.value = await getAllCategories()
  }
  catch (err: any) {
    console.error('Erreur chargement catégories:', err)
  }
}

async function loadStats() {
  try {
    stats.value = await getProjectStats()
  }
  catch (err: any) {
    console.error('Erreur chargement statistiques:', err)
  }
}

// Chargement initial
onMounted(async () => {
  await Promise.all([
    loadProjects(),
    loadCategories(),
    loadStats(),
  ])
})

// Recharger quand les filtres changent
watch([searchQuery, filterStatus, filterPublicationStatus, filterCategory, filterSector], () => {
  currentPage.value = 1
  selectedIds.value = []
  selectAll.value = false
  loadProjects()
})

// Recharger quand la page change
watch(currentPage, () => {
  selectedIds.value = []
  selectAll.value = false
  loadProjects()
})

// === SÉLECTION ===
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = projects.value.map(p => p.id)
  }
  else {
    selectedIds.value = []
  }
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  }
  else {
    selectedIds.value.splice(index, 1)
  }
  selectAll.value = selectedIds.value.length === projects.value.length
}

// === ACTIONS ===
const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterPublicationStatus.value = 'all'
  filterCategory.value = 'all'
  filterSector.value = 'all'
}

const handleDelete = async (project: ProjectDisplay) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${project.title}" ?`)) {
    return
  }

  try {
    await deleteProjectApi(project.id)
    await loadProjects()
    await loadStats()
  }
  catch (err: any) {
    console.error('Erreur suppression:', err)
    alert('Erreur lors de la suppression')
  }
}

const bulkPublish = async () => {
  try {
    await Promise.all(selectedIds.value.map(id => publishProject(id)))
    selectedIds.value = []
    selectAll.value = false
    await loadProjects()
    await loadStats()
  }
  catch (err: any) {
    console.error('Erreur publication:', err)
    alert('Erreur lors de la publication')
  }
}

const bulkUnpublish = async () => {
  try {
    await Promise.all(selectedIds.value.map(id => unpublishProject(id)))
    selectedIds.value = []
    selectAll.value = false
    await loadProjects()
    await loadStats()
  }
  catch (err: any) {
    console.error('Erreur dépublication:', err)
    alert('Erreur lors de la dépublication')
  }
}

const bulkDelete = async () => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.value.length} projet(s) ?`)) {
    return
  }

  try {
    await Promise.all(selectedIds.value.map(id => deleteProjectApi(id)))
    selectedIds.value = []
    selectAll.value = false
    await loadProjects()
    await loadStats()
  }
  catch (err: any) {
    console.error('Erreur suppression en masse:', err)
    alert('Erreur lors de la suppression')
  }
}

// === HELPERS ===
const getCategoryNames = (project: ProjectDisplay) => {
  if (!project.categories || project.categories.length === 0) return []
  return project.categories.slice(0, 2).map(c => c.name)
}

const getExtraCategoriesCount = (project: ProjectDisplay) => {
  if (!project.categories || project.categories.length <= 2) return 0
  return project.categories.length - 2
}

const getSectorName = (sectorId: string | null) => {
  if (!sectorId) return '-'
  const sec = sectors.value?.find((d: any) => d.id === sectorId)
  return sec?.name || '-'
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Projets institutionnels
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les projets de l'université
        </p>
      </div>
      <NuxtLink
        to="/admin/projets/liste/nouveau"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        Nouveau projet
      </NuxtLink>
    </div>

    <!-- Statistiques -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Total projets</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-green-600">{{ stats.byStatus.ongoing }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">En cours</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.byStatus.planned }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Planifiés</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-blue-600">{{ stats.byStatus.completed }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Terminés</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatBudget(stats.totalBudget) }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Budget total</div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Recherche -->
        <div class="flex-1">
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un projet..."
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Statut projet -->
        <select
          v-model="filterStatus"
          class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Tous les statuts</option>
          <option v-for="(label, key) in projectStatusLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>

        <!-- Statut publication -->
        <select
          v-model="filterPublicationStatus"
          class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Toutes publications</option>
          <option v-for="(label, key) in publicationStatusLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>

        <!-- Catégorie -->
        <select
          v-model="filterCategory"
          class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Toutes catégories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <!-- Secteur -->
        <select
          v-model="filterSector"
          class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Tous secteurs</option>
          <option v-for="sec in sectors" :key="sec.id" :value="sec.id">
            {{ sec.name }}
          </option>
        </select>

        <!-- Reset -->
        <button
          class="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="resetFilters"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>
    </div>

    <!-- Actions en masse -->
    <div
      v-if="selectedIds.length > 0"
      class="flex items-center gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20"
    >
      <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
        {{ selectedIds.length }} projet(s) sélectionné(s)
      </span>
      <div class="flex gap-2">
        <button
          class="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
          @click="bulkPublish"
        >
          Publier
        </button>
        <button
          class="rounded-lg bg-yellow-600 px-3 py-1.5 text-sm text-white hover:bg-yellow-700"
          @click="bulkUnpublish"
        >
          Dépublier
        </button>
        <button
          class="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          @click="bulkDelete"
        >
          Supprimer
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-4xl text-blue-600" />
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mb-2 text-4xl text-red-500" />
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      <button
        class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        @click="loadProjects"
      >
        Réessayer
      </button>
    </div>

    <!-- Tableau -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="w-12 px-4 py-3">
                <input
                  v-model="selectAll"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="w-16 px-4 py-3" />
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Titre
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Catégories
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Département
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Statut
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Dates
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Budget
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="project in projects"
              :key="project.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-4 py-3">
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="project.id"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td class="px-4 py-3">
                <img
                  v-if="project.cover_image"
                  :src="project.cover_image"
                  :alt="project.title"
                  class="h-10 w-16 rounded object-cover"
                />
                <div
                  v-else
                  class="flex h-10 w-16 items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
                >
                  <font-awesome-icon :icon="['fas', 'image']" class="text-gray-400" />
                </div>
              </td>
              <td class="px-4 py-3">
                <div>
                  <NuxtLink
                    :to="`/admin/projets/liste/${project.id}`"
                    class="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    {{ project.title }}
                  </NuxtLink>
                  <div v-if="project.summary" class="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                    {{ project.summary }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="catName in getCategoryNames(project)"
                    :key="catName"
                    class="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ catName }}
                  </span>
                  <span
                    v-if="getExtraCategoriesCount(project) > 0"
                    class="text-xs text-gray-500"
                  >
                    +{{ getExtraCategoriesCount(project) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ getSectorName(project.sector_external_id) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span :class="['inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium', projectStatusColors[project.status]]">
                    {{ projectStatusLabels[project.status] }}
                  </span>
                  <span :class="['inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium', publicationStatusColors[project.publication_status]]">
                    {{ publicationStatusLabels[project.publication_status] }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  {{ formatDateShort(project.start_date) }}
                  <span v-if="project.end_date" class="text-gray-400">
                    → {{ formatDateShort(project.end_date) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatBudget(project.budget, project.currency) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="`/admin/projets/liste/${project.id}`"
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700"
                    title="Voir"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                  </NuxtLink>
                  <NuxtLink
                    :to="`/admin/projets/liste/${project.id}/edit`"
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                    title="Modifier"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </NuxtLink>
                  <button
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                    title="Supprimer"
                    @click="handleDelete(project)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- État vide -->
      <div
        v-if="projects.length === 0 && !isLoading"
        class="py-12 text-center"
      >
        <font-awesome-icon :icon="['fas', 'folder-open']" class="mb-4 text-5xl text-gray-300" />
        <p class="text-gray-500 dark:text-gray-400">Aucun projet trouvé</p>
        <button
          v-if="searchQuery || filterStatus !== 'all' || filterPublicationStatus !== 'all' || filterCategory !== 'all'"
          class="mt-2 text-sm text-blue-600 hover:underline"
          @click="resetFilters"
        >
          Réinitialiser les filtres
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalProjects }} projet(s) - Page {{ currentPage }} sur {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="currentPage--"
          >
            Précédent
          </button>
          <button
            :disabled="currentPage === totalPages"
            class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="currentPage++"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
