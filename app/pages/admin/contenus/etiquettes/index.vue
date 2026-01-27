<script setup lang="ts">
import type { TagRead, TagCreate, TagUpdate } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  mergeTags,
  getTagUsage,
  slugify,
  availableIcons,
  getTagColor,
} = useTagsApi()

// === STATE ===
const searchQuery = ref('')
const sortBy = ref<'name' | 'created_at'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showMergeModal = ref(false)

// Data
const tags = ref<(TagRead & { news_count?: number })[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Selected items
const editingTag = ref<TagRead | null>(null)
const deletingTag = ref<(TagRead & { news_count?: number }) | null>(null)
const mergingTag = ref<(TagRead & { news_count?: number }) | null>(null)
const selectedMergeTarget = ref('')

// Form state
const newTag = ref<TagCreate>({
  name: '',
  slug: '',
  icon: '',
  description: ''
})

// Loading states for actions
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const isMerging = ref(false)

// === LOAD DATA ===
async function loadTags() {
  isLoading.value = true
  error.value = null

  try {
    const response = await listTags({ limit: 100 })

    // Charger les statistiques d'utilisation pour chaque tag
    const tagsWithUsage = await Promise.all(
      response.items.map(async (tag) => {
        try {
          const usage = await getTagUsage(tag.id)
          return { ...tag, news_count: usage.news_count }
        } catch {
          return { ...tag, news_count: 0 }
        }
      })
    )

    tags.value = tagsWithUsage
  } catch (e) {
    console.error('Error loading tags:', e)
    error.value = 'Erreur lors du chargement des étiquettes'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTags)

// === COMPUTED ===
const stats = computed(() => {
  const total = tags.value.length
  const totalNewsCount = tags.value.reduce((sum, t) => sum + (t.news_count || 0), 0)
  const mostUsed = tags.value.reduce((max, t) =>
    (t.news_count || 0) > (max?.news_count || 0) ? t : max,
    null as (TagRead & { news_count?: number }) | null
  )
  return { total, totalNewsCount, mostUsed }
})

// Tags filtrés et triés
const filteredTags = computed(() => {
  let result = [...tags.value]

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.slug.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    )
  }

  // Tri
  result.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy.value === 'created_at') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})

// Tags disponibles pour la fusion (exclut le tag en cours)
const mergeTargetTags = computed(() => {
  if (!mergingTag.value) return []
  return tags.value.filter(t => t.id !== mergingTag.value?.id)
})

// === METHODS ===
const toggleSort = (field: 'name' | 'created_at') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
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
  if (newTag.value.name && !editingTag.value) {
    newTag.value.slug = slugify(newTag.value.name)
  }
}

// Modals
const openAddModal = () => {
  newTag.value = { name: '', slug: '', icon: '', description: '' }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newTag.value = { name: '', slug: '', icon: '', description: '' }
}

const openEditModal = (tag: TagRead) => {
  editingTag.value = { ...tag }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingTag.value = null
}

const openDeleteModal = (tag: TagRead & { news_count?: number }) => {
  deletingTag.value = tag
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingTag.value = null
}

const openMergeModal = (tag: TagRead & { news_count?: number }) => {
  mergingTag.value = tag
  showMergeModal.value = true
}

const closeMergeModal = () => {
  showMergeModal.value = false
  mergingTag.value = null
  selectedMergeTarget.value = ''
}

// === API ACTIONS ===
async function addTag() {
  if (!newTag.value.name.trim()) return

  isCreating.value = true
  try {
    const data: TagCreate = {
      name: newTag.value.name,
      slug: newTag.value.slug || slugify(newTag.value.name),
      icon: newTag.value.icon || null,
      description: newTag.value.description || null,
    }

    await createTag(data)
    await loadTags()
    closeAddModal()
  } catch (e) {
    console.error('Error creating tag:', e)
    error.value = 'Erreur lors de la création'
  } finally {
    isCreating.value = false
  }
}

async function handleUpdateTag() {
  if (!editingTag.value) return

  isUpdating.value = true
  try {
    const data: TagUpdate = {
      name: editingTag.value.name,
      icon: editingTag.value.icon,
      description: editingTag.value.description,
    }

    await updateTag(editingTag.value.id, data)
    await loadTags()
    closeEditModal()
  } catch (e) {
    console.error('Error updating tag:', e)
    error.value = 'Erreur lors de la mise à jour'
  } finally {
    isUpdating.value = false
  }
}

async function handleDeleteTag() {
  if (!deletingTag.value) return

  isDeleting.value = true
  try {
    await deleteTag(deletingTag.value.id)
    await loadTags()
    closeDeleteModal()
  } catch (e) {
    console.error('Error deleting tag:', e)
    error.value = 'Erreur lors de la suppression'
  } finally {
    isDeleting.value = false
  }
}

async function handleMergeTags() {
  if (!mergingTag.value || !selectedMergeTarget.value) return

  isMerging.value = true
  try {
    await mergeTags({
      source_tag_ids: [mergingTag.value.id],
      target_tag_id: selectedMergeTarget.value,
    })
    await loadTags()
    closeMergeModal()
  } catch (e) {
    console.error('Error merging tags:', e)
    error.value = 'Erreur lors de la fusion'
  } finally {
    isMerging.value = false
  }
}

// Navigation vers les actualités filtrées par tag
const viewNewsByTag = (tagId: string) => {
  navigateTo(`/admin/contenus/actualites?tag_id=${tagId}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Étiquettes
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les étiquettes pour catégoriser vos contenus
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openAddModal"
      >
        <font-awesome-icon icon="fa-solid fa-plus" />
        Nouvelle étiquette
      </button>
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
    >
      <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
        <span>{{ error }}</span>
        <button
          class="ml-auto text-red-600 hover:text-red-800 dark:text-red-400"
          @click="error = null"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon icon="fa-solid fa-tags" class="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total étiquettes</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon icon="fa-solid fa-newspaper" class="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Actualités tagguées</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.totalNewsCount }}</p>
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
            placeholder="Rechercher une étiquette..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      <!-- Tableau des étiquettes -->
      <div class="rounded-lg bg-white shadow dark:bg-gray-800">
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
                <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actualités
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              <tr
                v-for="tag in filteredTags"
                :key="tag.id"
                class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="whitespace-nowrap px-6 py-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="inline-flex rounded-full px-3 py-1 text-sm font-medium"
                      :class="getTagColor(tag.slug)"
                    >
                      {{ tag.name }}
                    </span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <code class="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                    {{ tag.slug }}
                  </code>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <div v-if="tag.icon" class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <font-awesome-icon :icon="['fas', tag.icon]" />
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ tag.icon }}</span>
                  </div>
                  <span v-else class="text-gray-400 dark:text-gray-500">-</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <button
                    v-if="(tag.news_count || 0) > 0"
                    class="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    @click="viewNewsByTag(tag.id)"
                  >
                    <span class="font-medium">{{ tag.news_count }}</span>
                    <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="text-xs" />
                  </button>
                  <span v-else class="text-sm text-gray-500 dark:text-gray-400">0</span>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      title="Modifier"
                      @click="openEditModal(tag)"
                    >
                      <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                    </button>
                    <button
                      class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                      title="Fusionner"
                      @click="openMergeModal(tag)"
                    >
                      <font-awesome-icon icon="fa-solid fa-code-merge" class="h-4 w-4" />
                    </button>
                    <button
                      class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                      title="Supprimer"
                      @click="openDeleteModal(tag)"
                    >
                      <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- État vide -->
              <tr v-if="filteredTags.length === 0">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                      <font-awesome-icon icon="fa-solid fa-tags" class="text-3xl text-gray-400" />
                    </div>
                    <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                      Aucune étiquette trouvée
                    </h3>
                    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      {{ searchQuery ? 'Essayez avec d\'autres termes de recherche' : 'Créez votre première étiquette' }}
                    </p>
                    <button
                      v-if="!searchQuery"
                      class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                      @click="openAddModal"
                    >
                      <font-awesome-icon icon="fa-solid fa-plus" />
                      Nouvelle étiquette
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

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
              Nouvelle étiquette
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="addTag">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom *
              </label>
              <input
                v-model="newTag.name"
                type="text"
                required
                placeholder="Ex: Recherche, Événement, Partenariat"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @input="updateSlug"
              />
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug *
              </label>
              <input
                v-model="newTag.slug"
                type="text"
                required
                placeholder="recherche"
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
                v-model="newTag.icon"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucune icône</option>
                <option v-for="icon in availableIcons" :key="icon.value" :value="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <div v-if="newTag.icon" class="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', newTag.icon]" />
                <span class="text-sm">Aperçu</span>
              </div>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newTag.description"
                rows="3"
                placeholder="Description de l'étiquette..."
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
                :disabled="isCreating"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <font-awesome-icon v-if="isCreating" icon="fa-solid fa-spinner" class="animate-spin" />
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
        v-if="showEditModal && editingTag"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier l'étiquette
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="handleUpdateTag">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom *
              </label>
              <input
                v-model="editingTag.name"
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
                :value="editingTag.slug"
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
                v-model="editingTag.icon"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucune icône</option>
                <option v-for="icon in availableIcons" :key="icon.value" :value="icon.value">
                  {{ icon.label }}
                </option>
              </select>
              <div v-if="editingTag.icon" class="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', editingTag.icon]" />
                <span class="text-sm">Aperçu</span>
              </div>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingTag.description"
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
                :disabled="isUpdating"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <font-awesome-icon v-if="isUpdating" icon="fa-solid fa-spinner" class="animate-spin" />
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
        v-if="showDeleteModal && deletingTag"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'étiquette
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette étiquette ?
          </p>

          <div class="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex rounded-full px-3 py-1 text-sm font-medium"
                :class="getTagColor(deletingTag.slug)"
              >
                {{ deletingTag.name }}
              </span>
            </div>
          </div>

          <!-- Avertissement si utilisé -->
          <div
            v-if="(deletingTag.news_count || 0) > 0"
            class="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-900/20"
          >
            <div class="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="mt-0.5" />
              <div class="text-sm">
                <p class="font-medium">Cette étiquette est utilisée</p>
                <p>{{ deletingTag.news_count }} actualité{{ (deletingTag.news_count || 0) > 1 ? 's' : '' }} utilise{{ (deletingTag.news_count || 0) > 1 ? 'nt' : '' }} cette étiquette. La suppression dissociera automatiquement ces contenus.</p>
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
              :disabled="isDeleting"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              @click="handleDeleteTag"
            >
              <font-awesome-icon v-if="isDeleting" icon="fa-solid fa-spinner" class="animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Fusionner -->
    <Teleport to="body">
      <div
        v-if="showMergeModal && mergingTag"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeMergeModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
              <font-awesome-icon icon="fa-solid fa-code-merge" class="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Fusionner les étiquettes
            </h3>
          </div>

          <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Fusionner transfère toutes les associations de l'étiquette source vers l'étiquette cible, puis supprime l'étiquette source.
          </p>

          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Étiquette source (sera supprimée)
            </label>
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
              <div class="flex items-center justify-between">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-sm font-medium"
                  :class="getTagColor(mergingTag.slug)"
                >
                  {{ mergingTag.name }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ mergingTag.news_count || 0 }} actualité{{ (mergingTag.news_count || 0) > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </div>

          <div class="mb-4 flex justify-center">
            <font-awesome-icon icon="fa-solid fa-arrow-down" class="text-gray-400" />
          </div>

          <div class="mb-6">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Étiquette cible (recevra les associations)
            </label>
            <select
              v-model="selectedMergeTarget"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner une étiquette...</option>
              <option v-for="tag in mergeTargetTags" :key="tag.id" :value="tag.id">
                {{ tag.name }} ({{ tag.news_count || 0 }} actualités)
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeMergeModal"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="!selectedMergeTarget || isMerging"
              class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleMergeTags"
            >
              <font-awesome-icon v-if="isMerging" icon="fa-solid fa-spinner" class="animate-spin" />
              Fusionner
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
