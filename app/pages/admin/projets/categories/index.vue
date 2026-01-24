<script setup lang="ts">
import type { ProjectCategory, CategoryUsage } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllProjectCategories,
  getProjectCategoryById,
  getProjectCategoriesStats,
  getProjectCategoryUsage,
  categoryIcons,
  generateProjectCategoryId,
  slugifyCategory
} = useMockData()

// === STATE ===
const searchQuery = ref('')
const sortBy = ref<'name' | 'project_count' | 'display_order'>('display_order')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref<ProjectCategory | null>(null)
const deletingCategory = ref<ProjectCategory | null>(null)
const categoryUsage = ref<CategoryUsage | null>(null)
const isDragging = ref(false)

// Form state
const newCategory = ref({
  name: '',
  slug: '',
  icon: '',
  description: ''
})

// === COMPUTED ===
const allCategories = computed(() => getAllProjectCategories())

const stats = computed(() => getProjectCategoriesStats())

// Catégories filtrées et triées
const filteredCategories = computed(() => {
  let result = [...allCategories.value]

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  }

  // Tri
  result.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy.value === 'project_count') {
      comparison = a.project_count - b.project_count
    } else if (sortBy.value === 'display_order') {
      comparison = a.display_order - b.display_order
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// === METHODS ===
const toggleSort = (field: 'name' | 'project_count' | 'display_order') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: 'name' | 'project_count' | 'display_order') => {
  if (sortBy.value !== field) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-up' : 'sort-down'
}

// Auto-génération du slug
const updateSlug = () => {
  if (newCategory.value.name && !editingCategory.value) {
    newCategory.value.slug = slugifyCategory(newCategory.value.name)
  }
}

// Modals
const openAddModal = () => {
  newCategory.value = { name: '', slug: '', icon: '', description: '' }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newCategory.value = { name: '', slug: '', icon: '', description: '' }
}

const openEditModal = (category: ProjectCategory) => {
  editingCategory.value = { ...category }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCategory.value = null
}

const openDeleteModal = (category: ProjectCategory) => {
  deletingCategory.value = category
  categoryUsage.value = getProjectCategoryUsage(category.id)
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingCategory.value = null
  categoryUsage.value = null
}

// Actions (mock - en prod, appeler l'API)
const addCategory = () => {
  if (!newCategory.value.name.trim()) return

  // En production: POST /api/admin/project-categories
  console.log('Adding category:', {
    id: generateProjectCategoryId(),
    name: newCategory.value.name,
    slug: newCategory.value.slug || slugifyCategory(newCategory.value.name),
    icon: newCategory.value.icon,
    description: newCategory.value.description,
    display_order: allCategories.value.length + 1,
    project_count: 0,
    created_at: new Date().toISOString()
  })

  closeAddModal()
}

const updateCategory = () => {
  if (!editingCategory.value) return

  // En production: PUT /api/admin/project-categories/{id}
  console.log('Updating category:', editingCategory.value)

  closeEditModal()
}

const deleteCategory = () => {
  if (!deletingCategory.value) return

  // En production: DELETE /api/admin/project-categories/{id}
  console.log('Deleting category:', deletingCategory.value.id)

  closeDeleteModal()
}

// Drag & drop pour réordonnement
const onDragStart = (event: DragEvent, index: number) => {
  isDragging.value = true
  event.dataTransfer?.setData('text/plain', index.toString())
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const onDrop = (event: DragEvent, targetIndex: number) => {
  isDragging.value = false
  const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') || '0')

  if (sourceIndex === targetIndex) return

  // En production: PUT /api/admin/project-categories/reorder
  const newOrder = [...filteredCategories.value]
  const [movedItem] = newOrder.splice(sourceIndex, 1)
  newOrder.splice(targetIndex, 0, movedItem)

  console.log('Reorder categories:', newOrder.map(c => c.id))
}

const onDragEnd = () => {
  isDragging.value = false
}

// Navigation vers les projets filtrés par catégorie
const viewProjectsByCategory = (categorySlug: string) => {
  navigateTo(`/admin/projets?category=${categorySlug}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Catégories de projets
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les catégories pour classifier vos projets institutionnels
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openAddModal"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Nouvelle catégorie
      </button>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon icon="fa-solid fa-folder-tree" class="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total catégories</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon icon="fa-solid fa-diagram-project" class="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Projets catégorisés</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.totalProjectCount }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon icon="fa-solid fa-star" class="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Plus utilisée</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">
              {{ stats.mostUsed?.name || '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="relative">
        <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher une catégorie..."
          class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        />
      </div>
    </div>

    <!-- Info drag & drop -->
    <div class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-900/20">
      <div class="flex items-center gap-2 text-blue-800 dark:text-blue-200">
        <font-awesome-icon icon="fa-solid fa-grip-vertical" />
        <span class="text-sm">
          Glissez-déposez les lignes pour réorganiser l'ordre d'affichage des catégories sur le site public.
        </span>
      </div>
    </div>

    <!-- Tableau des catégories -->
    <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="w-10 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <font-awesome-icon icon="fa-solid fa-grip-vertical" class="text-gray-400" />
              </th>
              <th
                class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-2">
                  Nom
                  <font-awesome-icon :icon="['fas', getSortIcon('name')]" />
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Slug
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Icône
              </th>
              <th
                class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                @click="toggleSort('project_count')"
              >
                <div class="flex items-center gap-2">
                  Projets
                  <font-awesome-icon :icon="['fas', getSortIcon('project_count')]" />
                </div>
              </th>
              <th
                class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                @click="toggleSort('display_order')"
              >
                <div class="flex items-center gap-2">
                  Ordre
                  <font-awesome-icon :icon="['fas', getSortIcon('display_order')]" />
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            <tr
              v-for="(category, index) in filteredCategories"
              :key="category.id"
              :draggable="!searchQuery"
              :class="[
                'transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
                isDragging ? 'cursor-grabbing' : !searchQuery ? 'cursor-grab' : ''
              ]"
              @dragstart="onDragStart($event, index)"
              @dragover="onDragOver"
              @drop="onDrop($event, index)"
              @dragend="onDragEnd"
            >
              <td class="whitespace-nowrap px-3 py-4">
                <font-awesome-icon
                  v-if="!searchQuery"
                  icon="fa-solid fa-grip-vertical"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                />
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    v-if="category.icon"
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"
                  >
                    <font-awesome-icon :icon="['fas', category.icon]" class="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ category.name }}
                    </p>
                    <p v-if="category.description" class="max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                      {{ category.description }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                <code class="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                  {{ category.slug }}
                </code>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div v-if="category.icon" class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <font-awesome-icon :icon="['fas', category.icon]" />
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ category.icon }}</span>
                </div>
                <span v-else class="text-gray-400 dark:text-gray-500">-</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <button
                  v-if="category.project_count > 0"
                  class="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  @click="viewProjectsByCategory(category.slug)"
                >
                  <span class="font-medium">{{ category.project_count }}</span>
                  <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="text-xs" />
                </button>
                <span v-else class="text-sm text-gray-500 dark:text-gray-400">0</span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ category.display_order }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="openEditModal(category)"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(category)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- État vide -->
            <tr v-if="filteredCategories.length === 0">
              <td colspan="7" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center">
                  <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                    <font-awesome-icon icon="fa-solid fa-folder-tree" class="text-3xl text-gray-400" />
                  </div>
                  <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                    Aucune catégorie trouvée
                  </h3>
                  <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {{ searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Créez votre première catégorie' }}
                  </p>
                  <button
                    v-if="!searchQuery"
                    class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    @click="openAddModal"
                  >
                    <font-awesome-icon icon="fa-solid fa-plus" />
                    Nouvelle catégorie
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Ajouter -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Nouvelle catégorie
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="addCategory">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom *
              </label>
              <input
                v-model="newCategory.name"
                type="text"
                required
                placeholder="Ex: Développement durable, Éducation, Santé"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @input="updateSlug"
              />
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug *
              </label>
              <input
                v-model="newCategory.slug"
                type="text"
                required
                placeholder="developpement-durable"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Identifiant unique pour les URLs (généré automatiquement)
              </p>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icône
              </label>
              <select
                v-model="newCategory.icon"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucune icône</option>
                <option v-for="icon in categoryIcons" :key="icon.value" :value="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <div v-if="newCategory.icon" class="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', newCategory.icon]" />
                <span class="text-sm">Aperçu</span>
              </div>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newCategory.description"
                rows="3"
                placeholder="Description de la catégorie..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeAddModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && editingCategory"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier la catégorie
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <!-- Avertissement si utilisée -->
          <div
            v-if="editingCategory.project_count > 0"
            class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-900/20"
          >
            <div class="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" />
              <span class="text-sm">
                Cette catégorie est utilisée par {{ editingCategory.project_count }} projet{{ editingCategory.project_count > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <form @submit.prevent="updateCategory">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom *
              </label>
              <input
                v-model="editingCategory.name"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug
              </label>
              <input
                v-model="editingCategory.slug"
                type="text"
                disabled
                class="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-600 dark:text-gray-400"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Le slug ne peut pas être modifié (URLs existantes)
              </p>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icône
              </label>
              <select
                v-model="editingCategory.icon"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucune icône</option>
                <option v-for="icon in categoryIcons" :key="icon.value" :value="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <div v-if="editingCategory.icon" class="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', editingCategory.icon]" />
                <span class="text-sm">Aperçu</span>
              </div>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingCategory.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeEditModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingCategory"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer la catégorie
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette catégorie ?
          </p>

          <div class="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
            <div class="flex items-center gap-3">
              <div
                v-if="deletingCategory.icon"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30"
              >
                <font-awesome-icon :icon="['fas', deletingCategory.icon]" class="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ deletingCategory.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ deletingCategory.project_count }} projet{{ deletingCategory.project_count > 1 ? 's' : '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Avertissement si utilisée -->
          <div
            v-if="categoryUsage && categoryUsage.project_count > 0"
            class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-900/20"
          >
            <div class="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="mt-0.5" />
              <div class="text-sm">
                <p class="font-medium">Cette catégorie est utilisée</p>
                <p class="mb-2">
                  {{ categoryUsage.project_count }} projet{{ categoryUsage.project_count > 1 ? 's' : '' }}
                  utilise{{ categoryUsage.project_count > 1 ? 'nt' : '' }} cette catégorie.
                  La suppression dissociera automatiquement ces projets.
                </p>
                <div v-if="categoryUsage.projects_sample.length > 0" class="mt-2">
                  <p class="text-xs font-medium text-yellow-700 dark:text-yellow-300">Projets concernés :</p>
                  <ul class="mt-1 list-inside list-disc text-xs">
                    <li v-for="project in categoryUsage.projects_sample" :key="project.id">
                      {{ project.title }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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
              @click="deleteCategory"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
