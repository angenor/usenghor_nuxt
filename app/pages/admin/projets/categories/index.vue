<script setup lang="ts">
import type { ProjectCategoryRead } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const {
  listCategories,
  createCategory,
  updateCategory: updateCategoryApi,
  deleteCategory: deleteCategoryApi,
  slugify,
} = useProjectsApi()

// Liste des icônes disponibles
const categoryIcons = [
  { value: 'leaf', label: '🌿 Environnement (leaf)' },
  { value: 'graduation-cap', label: '🎓 Éducation (graduation-cap)' },
  { value: 'heartbeat', label: '💓 Santé (heartbeat)' },
  { value: 'seedling', label: '🌱 Agriculture (seedling)' },
  { value: 'water', label: '💧 Eau (water)' },
  { value: 'bolt', label: '⚡ Énergie (bolt)' },
  { value: 'city', label: '🏙️ Urbanisme (city)' },
  { value: 'handshake', label: '🤝 Partenariat (handshake)' },
  { value: 'globe-africa', label: '🌍 International (globe-africa)' },
  { value: 'users', label: '👥 Social (users)' },
  { value: 'laptop', label: '💻 Numérique (laptop)' },
  { value: 'flask', label: '🔬 Recherche (flask)' },
  { value: 'balance-scale', label: '⚖️ Gouvernance (balance-scale)' },
  { value: 'briefcase', label: '💼 Économie (briefcase)' },
  { value: 'paint-brush', label: '🎨 Culture (paint-brush)' },
]

// === STATE ===
const searchQuery = ref('')
const sortBy = ref<'name' | 'created_at'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref<ProjectCategoryRead | null>(null)
const deletingCategory = ref<ProjectCategoryRead | null>(null)

// API State
const categories = ref<ProjectCategoryRead[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)

// Form state
const newCategory = ref({
  name: '',
  slug: '',
  icon: '',
  description: ''
})

// === CHARGEMENT DES DONNÉES ===
const loadCategories = async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await listCategories({ limit: 100, search: searchQuery.value || undefined })
    categories.value = response.items
  }
  catch (err: any) {
    console.error('Erreur chargement catégories:', err)
    error.value = err.message || 'Erreur lors du chargement des catégories'
  }
  finally {
    isLoading.value = false
  }
}

// Chargement initial
onMounted(() => {
  loadCategories()
})

// Recharger lors de la recherche (avec debounce)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadCategories()
  }, 300)
})

// === COMPUTED ===
const stats = computed(() => ({
  total: categories.value.length,
}))

// Catégories triées
const sortedCategories = computed(() => {
  const result = [...categories.value]

  result.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name)
    }
    else if (sortBy.value === 'created_at') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// === METHODS ===
const toggleSort = (field: 'name' | 'created_at') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: 'name' | 'created_at') => {
  if (sortBy.value !== field) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-up' : 'sort-down'
}

// Auto-génération du slug
const updateSlug = () => {
  if (newCategory.value.name && !editingCategory.value) {
    newCategory.value.slug = slugify(newCategory.value.name)
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

const openEditModal = (category: ProjectCategoryRead) => {
  editingCategory.value = { ...category }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCategory.value = null
}

const openDeleteModal = (category: ProjectCategoryRead) => {
  deletingCategory.value = category
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingCategory.value = null
}

// === ACTIONS CRUD ===
const addCategory = async () => {
  if (!newCategory.value.name.trim()) return
  if (!newCategory.value.slug.trim()) {
    newCategory.value.slug = slugify(newCategory.value.name)
  }

  isSaving.value = true
  error.value = null

  try {
    await createCategory({
      name: newCategory.value.name,
      slug: newCategory.value.slug,
      icon: newCategory.value.icon || null,
      description: newCategory.value.description || null,
    })

    closeAddModal()
    await loadCategories()
  }
  catch (err: any) {
    console.error('Erreur création catégorie:', err)
    error.value = err.message || 'Erreur lors de la création'
  }
  finally {
    isSaving.value = false
  }
}

const updateCategory = async () => {
  if (!editingCategory.value) return

  isSaving.value = true
  error.value = null

  try {
    await updateCategoryApi(editingCategory.value.id, {
      name: editingCategory.value.name,
      slug: editingCategory.value.slug,
      icon: editingCategory.value.icon || null,
      description: editingCategory.value.description || null,
    })

    closeEditModal()
    await loadCategories()
  }
  catch (err: any) {
    console.error('Erreur mise à jour catégorie:', err)
    error.value = err.message || 'Erreur lors de la mise à jour'
  }
  finally {
    isSaving.value = false
  }
}

const deleteCategory = async () => {
  if (!deletingCategory.value) return

  isSaving.value = true
  error.value = null

  try {
    await deleteCategoryApi(deletingCategory.value.id)
    closeDeleteModal()
    await loadCategories()
  }
  catch (err: any) {
    console.error('Erreur suppression catégorie:', err)
    error.value = err.message || 'Erreur lors de la suppression'
  }
  finally {
    isSaving.value = false
  }
}

// Navigation vers les projets filtrés par catégorie
const viewProjectsByCategory = (categoryId: string) => {
  navigateTo(`/admin/projets/liste?category_id=${categoryId}`)
}

// Format date
const formatDate = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
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
    <div class="grid gap-4 sm:grid-cols-2">
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
            <font-awesome-icon icon="fa-solid fa-check-circle" class="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Statut</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">
              {{ isLoading ? 'Chargement...' : 'Synchronisé' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Erreur globale -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
      <div class="flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-exclamation-circle" />
        {{ error }}
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

    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-4xl text-blue-600" />
    </div>

    <!-- Tableau des catégories -->
    <div v-else class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
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
                @click="toggleSort('created_at')"
              >
                <div class="flex items-center gap-2">
                  Créée le
                  <font-awesome-icon :icon="['fas', getSortIcon('created_at')]" />
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            <tr
              v-for="category in sortedCategories"
              :key="category.id"
              class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
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
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(category.created_at) }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Voir les projets"
                    @click="viewProjectsByCategory(category.id)"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
                  </button>
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
            <tr v-if="sortedCategories.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
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
                Nom <span class="text-red-500">*</span>
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
                Slug <span class="text-red-500">*</span>
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
                :disabled="isSaving"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
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

          <form @submit.prevent="updateCategory">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom <span class="text-red-500">*</span>
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
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Attention : modifier le slug peut casser les liens existants
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
                <option :value="null">Aucune icône</option>
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
                :disabled="isSaving"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
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
                  {{ deletingCategory.slug }}
                </p>
              </div>
            </div>
          </div>

          <div class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-900/20">
            <div class="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="mt-0.5" />
              <div class="text-sm">
                <p>
                  Cette action est irréversible. Les projets associés à cette catégorie seront dissociés.
                </p>
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
              :disabled="isSaving"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              @click="deleteCategory"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
