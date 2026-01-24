<script setup lang="ts">
import type { Project, ProjectStatus, PublicationStatus } from '~/bank/mock-data/projets'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  getAllProjectsAdmin,
  getProjectStatsAdmin,
  projectStatusLabels,
  projectStatusColors,
  projectPublicationStatusLabels,
  projectPublicationStatusColors,
  getAllProjectCategories,
  departments,
  getFlagEmoji
} = useMockData()

// === DONNÉES ===
const allProjects = computed(() => getAllProjectsAdmin())
const stats = computed(() => getProjectStatsAdmin())
const categories = computed(() => getAllProjectCategories())

// === FILTRES ===
const searchQuery = ref('')
const filterStatus = ref<ProjectStatus | 'all'>('all')
const filterPublicationStatus = ref<PublicationStatus | 'all'>('all')
const filterCategory = ref<string | 'all'>('all')
const filterDepartment = ref<string | 'all'>('all')
const filterFeatured = ref<'all' | 'yes' | 'no'>('all')

// === PAGINATION ===
const currentPage = ref(1)
const itemsPerPage = ref(10)

// === TRI ===
const sortBy = ref<'title' | 'start_date' | 'budget' | 'updated_at'>('updated_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// === SÉLECTION ===
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// === FILTRAGE ===
const filteredProjects = computed(() => {
  let result = [...allProjects.value]

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title_fr.toLowerCase().includes(query) ||
      p.title_en.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      p.summary_fr?.toLowerCase().includes(query) ||
      p.department_name?.toLowerCase().includes(query)
    )
  }

  // Filtre statut projet
  if (filterStatus.value !== 'all') {
    result = result.filter(p => p.status === filterStatus.value)
  }

  // Filtre statut publication
  if (filterPublicationStatus.value !== 'all') {
    result = result.filter(p => p.publication_status === filterPublicationStatus.value)
  }

  // Filtre catégorie
  if (filterCategory.value !== 'all') {
    result = result.filter(p => p.category_ids.includes(filterCategory.value as string))
  }

  // Filtre département
  if (filterDepartment.value !== 'all') {
    result = result.filter(p => p.department_id === filterDepartment.value)
  }

  // Filtre featured
  if (filterFeatured.value !== 'all') {
    result = result.filter(p => filterFeatured.value === 'yes' ? p.featured : !p.featured)
  }

  return result
})

// === TRI ===
const sortedProjects = computed(() => {
  const result = [...filteredProjects.value]

  result.sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'title':
        comparison = a.title_fr.localeCompare(b.title_fr)
        break
      case 'start_date':
        comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        break
      case 'budget':
        comparison = (a.budget || 0) - (b.budget || 0)
        break
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        break
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// === PAGINATION ===
const totalPages = computed(() => Math.ceil(sortedProjects.value.length / itemsPerPage.value))

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return sortedProjects.value.slice(start, start + itemsPerPage.value)
})

// Reset page quand les filtres changent
watch([searchQuery, filterStatus, filterPublicationStatus, filterCategory, filterDepartment, filterFeatured], () => {
  currentPage.value = 1
  selectedIds.value = []
  selectAll.value = false
})

// === SÉLECTION ===
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedProjects.value.map(p => p.id)
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
  selectAll.value = selectedIds.value.length === paginatedProjects.value.length
}

// === TRI ===
const toggleSort = (column: typeof sortBy.value) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

// === ACTIONS ===
const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  filterPublicationStatus.value = 'all'
  filterCategory.value = 'all'
  filterDepartment.value = 'all'
  filterFeatured.value = 'all'
}

const deleteProject = (project: Project) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${project.title_fr}" ?`)) {
    console.log('Deleting project:', project.id)
    // En production: DELETE /api/admin/projects/{id}
  }
}

const bulkPublish = () => {
  console.log('Publishing projects:', selectedIds.value)
  // En production: POST /api/admin/projects/bulk-publish
  selectedIds.value = []
  selectAll.value = false
}

const bulkUnpublish = () => {
  console.log('Unpublishing projects:', selectedIds.value)
  // En production: POST /api/admin/projects/bulk-unpublish
  selectedIds.value = []
  selectAll.value = false
}

const bulkDelete = () => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.value.length} projet(s) ?`)) {
    console.log('Deleting projects:', selectedIds.value)
    // En production: DELETE /api/admin/projects/bulk
    selectedIds.value = []
    selectAll.value = false
  }
}

// === FORMATAGE ===
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatBudget = (budget: number | undefined, currency: string = 'EUR') => {
  if (!budget) return '-'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(budget)
}

const getCategoryNames = (categoryIds: string[]) => {
  return categoryIds
    .map(id => categories.value.find(c => c.id === id)?.name)
    .filter(Boolean)
    .slice(0, 2)
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
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
        <div class="text-2xl font-bold text-purple-600">{{ stats.featured }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">À la une</div>
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
          <option v-for="(label, key) in projectPublicationStatusLabels" :key="key" :value="key">
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

        <!-- Département -->
        <select
          v-model="filterDepartment"
          class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Tous départements</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>

        <!-- Featured -->
        <select
          v-model="filterFeatured"
          class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Tous</option>
          <option value="yes">À la une</option>
          <option value="no">Standard</option>
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

    <!-- Tableau -->
    <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
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
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('title')"
              >
                <div class="flex items-center gap-1">
                  Titre
                  <font-awesome-icon
                    v-if="sortBy === 'title'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="text-blue-500"
                  />
                </div>
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
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('start_date')"
              >
                <div class="flex items-center gap-1">
                  Dates
                  <font-awesome-icon
                    v-if="sortBy === 'start_date'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="text-blue-500"
                  />
                </div>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('budget')"
              >
                <div class="flex items-center gap-1">
                  Budget
                  <font-awesome-icon
                    v-if="sortBy === 'budget'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="text-blue-500"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="project in paginatedProjects"
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
                  :alt="project.title_fr"
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
                    {{ project.title_fr }}
                    <font-awesome-icon
                      v-if="project.featured"
                      :icon="['fas', 'star']"
                      class="ml-1 text-yellow-500"
                      title="À la une"
                    />
                  </NuxtLink>
                  <div v-if="project.summary_fr" class="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                    {{ project.summary_fr }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="catName in getCategoryNames(project.category_ids)"
                    :key="catName"
                    class="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ catName }}
                  </span>
                  <span
                    v-if="project.category_ids.length > 2"
                    class="text-xs text-gray-500"
                  >
                    +{{ project.category_ids.length - 2 }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ project.department_name || '-' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span :class="['inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium', projectStatusColors[project.status]]">
                    {{ projectStatusLabels[project.status] }}
                  </span>
                  <span :class="['inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium', projectPublicationStatusColors[project.publication_status]]">
                    {{ projectPublicationStatusLabels[project.publication_status] }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  {{ formatDate(project.start_date) }}
                  <span v-if="project.end_date" class="text-gray-400">
                    → {{ formatDate(project.end_date) }}
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
                    @click="deleteProject(project)"
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
        v-if="paginatedProjects.length === 0"
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
          {{ sortedProjects.length }} projet(s) - Page {{ currentPage }} sur {{ totalPages }}
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
