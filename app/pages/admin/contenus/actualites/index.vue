<script setup lang="ts">
import type { News, NewsStatus, HighlightStatus } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  getAllAdminNews,
  getAdminNewsStats,
  getAdminFilteredNews,
  getAllNewsTags,
  getAllNewsAuthors,
  newsStatusLabels,
  newsStatusColors,
  highlightStatusLabels,
  highlightStatusColors,
  departments,
  campusExternalises
} = useMockData()

// === STATE ===
// Filtres
const searchQuery = ref('')
const filterStatus = ref<NewsStatus | 'all'>('all')
const filterHighlight = ref<HighlightStatus | 'all'>('all')
const filterTagId = ref<string>('')
const filterAuthorId = ref<string>('')
const filterCampusId = ref<string>('')
const filterDepartmentId = ref<string>('')
const dateFrom = ref('')
const dateTo = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Tri
const sortBy = ref<'title' | 'status' | 'published_at' | 'updated_at'>('updated_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Sélection
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modals
const showDeleteModal = ref(false)
const deletingNews = ref<News | null>(null)

// === COMPUTED ===
const allNews = computed(() => getAllAdminNews())
const allTags = computed(() => getAllNewsTags())
const allAuthors = computed(() => getAllNewsAuthors())
const allCampuses = computed(() => campusExternalises.value)
const allDepartments = computed(() => departments.value)

// Stats
const stats = computed(() => getAdminNewsStats())

// Filtrage
const filteredNews = computed(() => {
  let result = getAdminFilteredNews({
    search: searchQuery.value || undefined,
    status: filterStatus.value !== 'all' ? filterStatus.value : undefined,
    highlight_status: filterHighlight.value !== 'all' ? filterHighlight.value : undefined,
    tag_id: filterTagId.value || undefined,
    author_id: filterAuthorId.value || undefined,
    campus_id: filterCampusId.value || undefined,
    department_id: filterDepartmentId.value || undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined
  })

  // Tri
  result = [...result].sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'published_at':
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
        comparison = dateA - dateB
        break
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredNews.value.length / itemsPerPage.value))

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNews.value.slice(start, end)
})

// Vérifier si filtres actifs
const hasActiveFilters = computed(() => {
  return searchQuery.value ||
    filterStatus.value !== 'all' ||
    filterHighlight.value !== 'all' ||
    filterTagId.value ||
    filterAuthorId.value ||
    filterCampusId.value ||
    filterDepartmentId.value ||
    dateFrom.value ||
    dateTo.value
})

// === METHODS ===
// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = paginatedNews.value.map(n => n.id)
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
  filterHighlight.value = 'all'
  filterTagId.value = ''
  filterAuthorId.value = ''
  filterCampusId.value = ''
  filterDepartmentId.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

// Navigation
const viewNews = (news: News) => {
  router.push(`/admin/contenus/actualites/${news.id}`)
}

const editNews = (news: News) => {
  router.push(`/admin/contenus/actualites/${news.id}/edit`)
}

const createNews = () => {
  router.push('/admin/contenus/actualites/nouveau')
}

// Modals
const openDeleteModal = (news: News) => {
  deletingNews.value = news
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingNews.value = null
}

// Actions CRUD (mock)
const deleteNews = () => {
  if (!deletingNews.value) return
  console.log('Deleting news:', deletingNews.value.id)
  // En production: DELETE /api/admin/news/{id}
  closeDeleteModal()
}

const duplicateNews = (news: News) => {
  console.log('Duplicating news:', news.id)
  // En production: POST /api/admin/news/{id}/duplicate
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

const bulkArchive = () => {
  console.log('Archiving:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

const bulkDelete = () => {
  console.log('Deleting:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

// Changer le highlight status rapidement
const setHighlightStatus = (news: News, status: HighlightStatus) => {
  console.log('Setting highlight status:', news.id, status)
  // En production: POST /api/admin/news/{id}/highlight
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

// Truncate text
const truncate = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Actualités
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les actualités et les mises en avant
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="createNews"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Nouvelle actualité
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Publiées</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.published }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Brouillons</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.draft }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Archivées</p>
        <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ stats.archived }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">À la une</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.headline }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Mises en avant</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.featured }}</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4">
        <!-- Ligne 1: Recherche + Filtres principaux -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
          <!-- Recherche -->
          <div class="relative flex-1 lg:max-w-md">
            <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une actualité..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Filtres principaux -->
          <div class="flex flex-wrap gap-2">
            <select
              v-model="filterStatus"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
              <option value="archived">Archivé</option>
            </select>

            <select
              v-model="filterHighlight"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les mises en avant</option>
              <option value="headline">À la une</option>
              <option value="featured">Mise en avant</option>
              <option value="standard">Standard</option>
            </select>

            <select
              v-model="filterTagId"
              class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tous les tags</option>
              <option v-for="tag in allTags" :key="tag.id" :value="tag.id">
                {{ tag.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Ligne 2: Filtres secondaires -->
        <div class="flex flex-wrap items-center gap-2">
          <select
            v-model="filterAuthorId"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les auteurs</option>
            <option v-for="author in allAuthors" :key="author.id" :value="author.id">
              {{ author.name }}
            </option>
          </select>

          <select
            v-model="filterCampusId"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les campus</option>
            <option v-for="campus in allCampuses" :key="campus.id" :value="campus.id">
              {{ campus.name }}
            </option>
          </select>

          <select
            v-model="filterDepartmentId"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les départements</option>
            <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">
              {{ dept.title }}
            </option>
          </select>

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
          {{ selectedIds.length }} actualité(s) sélectionnée(s)
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
            @click="bulkArchive"
          >
            Archiver
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
              <th class="w-16 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Image
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('title')"
              >
                <span class="flex items-center gap-1">
                  Titre
                  <font-awesome-icon v-if="sortBy === 'title'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Auteur
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tags
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
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Mise en avant
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('published_at')"
              >
                <span class="flex items-center gap-1">
                  Publication
                  <font-awesome-icon v-if="sortBy === 'published_at'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="newsItem in paginatedNews"
              :key="newsItem.id"
              class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': isSelected(newsItem.id) }"
              @click="viewNews(newsItem)"
            >
              <td class="px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="isSelected(newsItem.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelect(newsItem.id)"
                />
              </td>
              <td class="px-4 py-3">
                <div class="h-12 w-16 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <img
                    v-if="newsItem.cover_image"
                    :src="newsItem.cover_image"
                    :alt="newsItem.title"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-image" class="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="min-w-0">
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {{ truncate(newsItem.title, 50) }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ newsItem.slug }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <img
                    v-if="newsItem.author.avatar"
                    :src="newsItem.author.avatar"
                    :alt="newsItem.author.name"
                    class="h-6 w-6 rounded-full"
                  />
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    {{ newsItem.author.name }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in newsItem.tags.slice(0, 2)"
                    :key="tag.id"
                    class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {{ tag.name }}
                  </span>
                  <span
                    v-if="newsItem.tags.length > 2"
                    class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  >
                    +{{ newsItem.tags.length - 2 }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="newsStatusColors[newsItem.status]"
                >
                  {{ newsStatusLabels[newsItem.status] }}
                </span>
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="relative">
                  <select
                    :value="newsItem.highlight_status"
                    class="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    @change="setHighlightStatus(newsItem, ($event.target as HTMLSelectElement).value as HighlightStatus)"
                  >
                    <option value="standard">Standard</option>
                    <option value="featured">Mise en avant</option>
                    <option value="headline">À la une</option>
                  </select>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  {{ formatDate(newsItem.published_at) }}
                </div>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Voir les détails"
                    @click="viewNews(newsItem)"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="editNews(newsItem)"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                    title="Dupliquer"
                    @click="duplicateNews(newsItem)"
                  >
                    <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(newsItem)"
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
          {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredNews.length) }} sur {{ filteredNews.length }} actualités
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
        v-if="paginatedNews.length === 0"
        class="flex flex-col items-center justify-center py-12"
      >
        <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
          <font-awesome-icon icon="fa-solid fa-newspaper" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
          Aucune actualité trouvée
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos filtres ou créez une nouvelle actualité.
        </p>
      </div>
    </div>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingNews"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'actualité
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette actualité ?
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingNews.title }}
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
              @click="deleteNews"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
