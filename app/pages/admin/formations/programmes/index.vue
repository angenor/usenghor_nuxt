<script setup lang="ts">
import type { Formation } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  formations,
  departments,
  getDepartmentById
} = useMockData()

// === STATE ===
// Filtres
const searchQuery = ref('')
const filterType = ref<Formation['formation_type'] | 'all'>('all')
const filterStatus = ref<'all' | 'published' | 'draft'>('all')
const filterDepartment = ref<string>('all')
const filterCampus = ref<'all' | 'alexandrie' | 'externalise' | 'en_ligne'>('all')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Tri
const sortBy = ref<'title' | 'type' | 'department' | 'status'>('title')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Sélection
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const deletingProgram = ref<Formation | null>(null)

// Form state
const programForm = ref({
  title_fr: '',
  title_en: '',
  slug: '',
  formation_type: 'master' as Formation['formation_type'],
  short_description_fr: '',
  short_description_en: '',
  department_id: '',
  campus: 'alexandrie' as Formation['campus'],
  duration_fr: '',
  credits: 120,
  diploma_fr: '',
  is_published: false,
  is_featured: false,
  application_open: false
})

// === COMPUTED ===
// Toutes les formations (pas seulement publiées)
const allFormations = computed(() => {
  // En admin, on voit tout
  return [...formations.value]
})

// Formations filtrées
const filteredFormations = computed(() => {
  let result = allFormations.value

  // Filtre recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f =>
      f.title_fr.toLowerCase().includes(query) ||
      f.title_en?.toLowerCase().includes(query) ||
      f.slug.toLowerCase().includes(query)
    )
  }

  // Filtre type
  if (filterType.value !== 'all') {
    result = result.filter(f => f.formation_type === filterType.value)
  }

  // Filtre statut
  if (filterStatus.value !== 'all') {
    result = result.filter(f =>
      filterStatus.value === 'published' ? f.is_published : !f.is_published
    )
  }

  // Filtre département
  if (filterDepartment.value !== 'all') {
    result = result.filter(f => f.department_id === filterDepartment.value)
  }

  // Filtre campus
  if (filterCampus.value !== 'all') {
    result = result.filter(f => f.campus === filterCampus.value)
  }

  // Tri
  result = [...result].sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'title':
        comparison = a.title_fr.localeCompare(b.title_fr)
        break
      case 'type':
        comparison = a.formation_type.localeCompare(b.formation_type)
        break
      case 'department':
        comparison = a.department_id.localeCompare(b.department_id)
        break
      case 'status':
        comparison = (a.is_published ? 1 : 0) - (b.is_published ? 1 : 0)
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredFormations.value.length / itemsPerPage.value))

const paginatedFormations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFormations.value.slice(start, end)
})

// Stats
const stats = computed(() => ({
  total: allFormations.value.length,
  published: allFormations.value.filter(f => f.is_published).length,
  draft: allFormations.value.filter(f => !f.is_published).length,
  masters: allFormations.value.filter(f => f.formation_type === 'master').length,
  doctorats: allFormations.value.filter(f => f.formation_type === 'doctorat').length
}))

// === METHODS ===
// Génération de slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Watchers pour auto-génération du slug
watch(() => programForm.value.title_fr, (newTitle) => {
  programForm.value.slug = generateSlug(newTitle)
})

// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedFormations.value.map(f => f.id)
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
  filterDepartment.value = 'all'
  filterCampus.value = 'all'
  currentPage.value = 1
}

// Modals
const openCreateModal = () => {
  programForm.value = {
    title_fr: '',
    title_en: '',
    slug: '',
    formation_type: 'master',
    short_description_fr: '',
    short_description_en: '',
    department_id: departments.value[0]?.id || '',
    campus: 'alexandrie',
    duration_fr: '2 ans (4 semestres)',
    credits: 120,
    diploma_fr: 'Master professionnel',
    is_published: false,
    is_featured: false,
    application_open: false
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const openDeleteModal = (program: Formation) => {
  deletingProgram.value = program
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingProgram.value = null
}

// Navigation vers les pages dédiées
const viewProgram = (program: Formation) => {
  router.push(`/admin/formations/programmes/${program.id}`)
}

const editProgram = (program: Formation) => {
  router.push(`/admin/formations/programmes/${program.id}/edit`)
}

// Actions CRUD (mock)
const createProgram = () => {
  console.log('Creating program:', programForm.value)
  // En production: POST /api/admin/programs
  closeCreateModal()
}

const deleteProgram = () => {
  if (!deletingProgram.value) return
  console.log('Deleting program:', deletingProgram.value.id)
  // En production: DELETE /api/admin/programs/{id}
  closeDeleteModal()
}

const duplicateProgram = (program: Formation) => {
  console.log('Duplicating program:', program.id)
  // En production: POST /api/admin/programs/{id}/duplicate
  // Après duplication, rediriger vers la page d'édition du nouveau programme
}

// Actions en masse
const bulkPublish = () => {
  console.log('Publishing:', selectedIds.value)
  // En production: POST /api/admin/programs/bulk-action { action: 'publish', ids: [...] }
  selectedIds.value = []
  selectAll.value = false
}

const bulkUnpublish = () => {
  console.log('Unpublishing:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

const bulkDelete = () => {
  if (confirm(`Supprimer ${selectedIds.value.length} programme(s) ?`)) {
    console.log('Deleting:', selectedIds.value)
    selectedIds.value = []
    selectAll.value = false
  }
}

// Labels et couleurs
const getTypeLabel = (type: Formation['formation_type']) => {
  const labels = {
    master: 'Master',
    doctorat: 'Doctorat',
    du: 'DU',
    certifiante: 'Certificat'
  }
  return labels[type] || type
}

const getTypeColor = (type: Formation['formation_type']) => {
  const colors = {
    master: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    doctorat: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    du: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    certifiante: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  }
  return colors[type] || colors.master
}

const getCampusLabel = (campus: Formation['campus']) => {
  const labels = {
    alexandrie: 'Alexandrie',
    externalise: 'Externalisé',
    en_ligne: 'En ligne'
  }
  return labels[campus] || campus
}

const getCampusColor = (campus: Formation['campus']) => {
  const colors = {
    alexandrie: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    externalise: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    en_ligne: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
  }
  return colors[campus] || colors.alexandrie
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Programmes de formation
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les formations (masters, doctorats, DU, certificats)
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openCreateModal"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="w-4 h-4" />
        Nouveau programme
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
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
        <p class="text-xs text-gray-500 dark:text-gray-400">Masters</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.masters }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Doctorats</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.doctorats }}</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Recherche -->
        <div class="relative flex-1 lg:max-w-md">
          <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un programme..."
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
            <option value="master">Master</option>
            <option value="doctorat">Doctorat</option>
            <option value="du">DU</option>
            <option value="certifiante">Certificat</option>
          </select>

          <select
            v-model="filterStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>

          <select
            v-model="filterDepartment"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les départements</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name_fr }}
            </option>
          </select>

          <select
            v-model="filterCampus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les campus</option>
            <option value="alexandrie">Alexandrie</option>
            <option value="externalise">Externalisé</option>
            <option value="en_ligne">En ligne</option>
          </select>

          <button
            v-if="searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterDepartment !== 'all' || filterCampus !== 'all'"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="resetFilters"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="w-3 h-3" />
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
          {{ selectedIds.length }} programme(s) sélectionné(s)
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
            class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            @click="bulkDelete"
          >
            Supprimer
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
                  Programme
                  <font-awesome-icon v-if="sortBy === 'title'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="w-3 h-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('type')"
              >
                <span class="flex items-center gap-1">
                  Type
                  <font-awesome-icon v-if="sortBy === 'type'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="w-3 h-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('department')"
              >
                <span class="flex items-center gap-1">
                  Département
                  <font-awesome-icon v-if="sortBy === 'department'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="w-3 h-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Campus
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('status')"
              >
                <span class="flex items-center gap-1">
                  Statut
                  <font-awesome-icon v-if="sortBy === 'status'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="w-3 h-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="program in paginatedFormations"
              :key="program.id"
              class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': isSelected(program.id) }"
              @click="viewProgram(program)"
            >
              <td class="px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="isSelected(program.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelect(program.id)"
                />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="h-10 w-10 flex-shrink-0 rounded-lg bg-cover bg-center"
                    :style="{ backgroundImage: program.image ? `url(${program.image})` : 'none', backgroundColor: program.image ? 'transparent' : '#e5e7eb' }"
                  >
                    <div v-if="!program.image" class="flex h-full w-full items-center justify-center text-gray-400">
                      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5" />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-medium text-gray-900 dark:text-white">
                      {{ program.title_fr }}
                    </p>
                    <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                      {{ program.slug }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="getTypeColor(program.formation_type)"
                >
                  {{ getTypeLabel(program.formation_type) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ getDepartmentById(program.department_id)?.name_fr || '-' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="getCampusColor(program.campus)"
                >
                  {{ getCampusLabel(program.campus) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                    :class="program.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :class="program.is_published ? 'bg-green-500' : 'bg-yellow-500'"></span>
                    {{ program.is_published ? 'Publié' : 'Brouillon' }}
                  </span>
                  <span
                    v-if="program.is_featured"
                    class="text-yellow-500"
                    title="Mis en avant"
                  >
                    <font-awesome-icon icon="fa-solid fa-star" class="w-3 h-3" />
                  </span>
                  <span
                    v-if="program.application_open"
                    class="text-green-500"
                    title="Candidatures ouvertes"
                  >
                    <font-awesome-icon icon="fa-solid fa-door-open" class="w-3 h-3" />
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Voir les détails"
                    @click="viewProgram(program)"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" class="w-4 h-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="editProgram(program)"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="w-4 h-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                    title="Dupliquer"
                    @click="duplicateProgram(program)"
                  >
                    <font-awesome-icon icon="fa-solid fa-copy" class="w-4 h-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(program)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="w-4 h-4" />
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
          {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredFormations.length) }} sur {{ filteredFormations.length }} programmes
        </div>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="currentPage--"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3 h-3" />
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-300">
            Page {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            :disabled="currentPage === totalPages"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="currentPage++"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- État vide -->
      <div
        v-if="paginatedFormations.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
          Aucun programme trouvé
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos filtres ou créez un nouveau programme.
        </p>
      </div>
    </div>

    <!-- Modal Créer -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="closeCreateModal"
      >
        <div class="admin-scrollbar w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" data-lenis-prevent>
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Nouveau programme
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeCreateModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="createProgram" class="space-y-4">
            <!-- Titre -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre (FR) *
                </label>
                <input
                  v-model="programForm.title_fr"
                  type="text"
                  required
                  placeholder="Master en..."
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre (EN)
                </label>
                <input
                  v-model="programForm.title_en"
                  type="text"
                  placeholder="Master in..."
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- Slug -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug *
              </label>
              <input
                v-model="programForm.slug"
                type="text"
                required
                placeholder="master-en-..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500">Auto-généré depuis le titre</p>
            </div>

            <!-- Type et Département -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type *
                </label>
                <select
                  v-model="programForm.formation_type"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="master">Master</option>
                  <option value="doctorat">Doctorat</option>
                  <option value="du">Diplôme d'Université (DU)</option>
                  <option value="certifiante">Formation certifiante</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Département *
                </label>
                <select
                  v-model="programForm.department_id"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name_fr }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Campus et Durée -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Campus *
                </label>
                <select
                  v-model="programForm.campus"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="alexandrie">Alexandrie</option>
                  <option value="externalise">Campus externalisé</option>
                  <option value="en_ligne">En ligne</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Durée
                </label>
                <input
                  v-model="programForm.duration_fr"
                  type="text"
                  placeholder="2 ans (4 semestres)"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- Crédits et Diplôme -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Crédits ECTS
                </label>
                <input
                  v-model.number="programForm.credits"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Diplôme délivré
                </label>
                <input
                  v-model="programForm.diploma_fr"
                  type="text"
                  placeholder="Master professionnel"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description courte (FR) *
              </label>
              <textarea
                v-model="programForm.short_description_fr"
                rows="3"
                required
                placeholder="Décrivez brièvement la formation..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Options -->
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2">
                <input
                  v-model="programForm.is_published"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Publier immédiatement</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="programForm.is_featured"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Mettre en avant</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="programForm.application_open"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Candidatures ouvertes</span>
              </label>
            </div>

            <!-- Boutons -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeCreateModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Créer le programme
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingProgram"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le programme
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible.
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingProgram.title_fr }}
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
              @click="deleteProgram"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<!-- Styles scrollbar dans base.css avec classe .admin-scrollbar -->
