<script setup lang="ts">
import type { ProjectCallRead, ProjectCallType, ProjectCallStatus } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  listAllCalls,
  listProjects,
  deleteCall: deleteCallApi,
  updateCall,
  projectCallTypeLabels,
  projectCallStatusLabels,
  projectCallStatusColors,
  formatDateShort,
} = useProjectsApi()

// === ÉTAT ===
const calls = ref<ProjectCallRead[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isProcessing = ref(false)

// Projets pour le filtre
const projectsForSelect = ref<{ id: string; title: string }[]>([])

// === FILTRES ===
interface CallFilters {
  project_id?: string
  type?: ProjectCallType
  status?: ProjectCallStatus
  search: string
}

const filters = ref<CallFilters>({
  project_id: undefined,
  type: undefined,
  status: undefined,
  search: ''
})

// === PAGINATION ===
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

// === CHARGEMENT ===
const loadData = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await listAllCalls({
      page: currentPage.value,
      limit: itemsPerPage.value,
      status: filters.value.status,
    })
    calls.value = response.items
    totalItems.value = response.total
  }
  catch (err: any) {
    console.error('Erreur chargement appels:', err)
    error.value = err.message || 'Erreur lors du chargement des appels'
  }
  finally {
    isLoading.value = false
  }
}

const loadProjects = async () => {
  try {
    const response = await listProjects({ limit: 100 })
    projectsForSelect.value = response.items.map(p => ({ id: p.id, title: p.title }))
  }
  catch (err) {
    console.error('Erreur chargement projets:', err)
  }
}

// Charger au montage
onMounted(() => {
  loadData()
  loadProjects()
})

// Recharger quand les filtres changent (avec debounce pour la recherche)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch([() => filters.value.status, () => filters.value.project_id, () => filters.value.type], () => {
  currentPage.value = 1
  loadData()
})

watch(() => filters.value.search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadData()
  }, 300)
})

watch(currentPage, () => {
  loadData()
})

// === TRI (client-side sur la page courante) ===
const sortBy = ref<'title' | 'project' | 'type' | 'deadline'>('deadline')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortedCalls = computed(() => {
  let filtered = [...calls.value]

  // Filtrage local pour la recherche et le projet
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(search)
      || c.description?.toLowerCase().includes(search)
    )
  }

  if (filters.value.project_id) {
    filtered = filtered.filter(c => c.project_id === filters.value.project_id)
  }

  if (filters.value.type) {
    filtered = filtered.filter(c => c.type === filters.value.type)
  }

  // Tri
  filtered.sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'type':
        comparison = (a.type || '').localeCompare(b.type || '')
        break
      case 'deadline':
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0
        comparison = dateA - dateB
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return filtered
})

const toggleSort = (column: typeof sortBy.value) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

// === STATISTIQUES ===
const stats = computed(() => {
  const all = calls.value
  return {
    total: totalItems.value,
    upcoming: all.filter(c => c.status === 'upcoming').length,
    ongoing: all.filter(c => c.status === 'ongoing').length,
    closed: all.filter(c => c.status === 'closed').length,
    byType: {
      project: all.filter(c => c.type === 'project').length,
      training: all.filter(c => c.type === 'training').length,
    }
  }
})

// === SÉLECTION ===
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

watch(selectAll, (value) => {
  selectedIds.value = value ? sortedCalls.value.map(c => c.id) : []
})

// === ACTIONS ===
const changeStatus = async (id: string, newStatus: ProjectCallStatus) => {
  isProcessing.value = true
  try {
    await updateCall(id, { status: newStatus })
    await loadData()
  }
  catch (err: any) {
    console.error('Erreur changement statut:', err)
    alert('Erreur lors du changement de statut')
  }
  finally {
    isProcessing.value = false
  }
}

const deleteCall = async (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet appel ?')) return

  isProcessing.value = true
  try {
    await deleteCallApi(id)
    await loadData()
  }
  catch (err: any) {
    console.error('Erreur suppression:', err)
    alert('Erreur lors de la suppression')
  }
  finally {
    isProcessing.value = false
  }
}

const bulkDelete = async () => {
  if (selectedIds.value.length === 0) return
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.value.length} appel(s) ?`)) return

  isProcessing.value = true
  try {
    for (const id of selectedIds.value) {
      await deleteCallApi(id)
    }
    selectedIds.value = []
    await loadData()
  }
  catch (err: any) {
    console.error('Erreur suppression groupée:', err)
    alert('Erreur lors de la suppression')
  }
  finally {
    isProcessing.value = false
  }
}

// === FORMATAGE ===
const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isDeadlinePassed = (deadline: string | null | undefined) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const getDaysUntilDeadline = (deadline: string | null | undefined) => {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Helper pour obtenir le nom du projet
const getProjectName = (projectId: string) => {
  const project = projectsForSelect.value.find(p => p.id === projectId)
  return project?.title || '-'
}

// Helper pour extraire le texte brut du JSON EditorJS pour l'aperçu
const getDescriptionPreview = (description: string | null | undefined): string | null => {
  if (!description) return null
  try {
    const parsed = JSON.parse(description)
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      // Extraire le texte du premier bloc
      const firstBlock = parsed.blocks[0]
      if (firstBlock?.data?.text) {
        return firstBlock.data.text
      }
    }
    return null
  }
  catch {
    // Si ce n'est pas du JSON, retourner tel quel
    return description
  }
}

// Couleurs par type
const projectCallTypeColors: Record<ProjectCallType, string> = {
  application: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  scholarship: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  project: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  recruitment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  training: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Appels à projets
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les appels liés aux projets institutionnels
        </p>
      </div>
      <NuxtLink
        to="/admin/projets/appels/nouveau"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        Nouvel appel
      </NuxtLink>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
      {{ error }}
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Total</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-yellow-600">{{ stats.upcoming }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">À venir</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-green-600">{{ stats.ongoing }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">En cours</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-gray-500">{{ stats.closed }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Clôturés</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-purple-600">{{ stats.byType.project }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Projets</div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-2xl font-bold text-teal-600">{{ stats.byType.training }}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Formations</div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Recherche -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recherche
          </label>
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Titre, description..."
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Projet parent -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Projet parent
          </label>
          <select
            v-model="filters.project_id"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option :value="undefined">Tous les projets</option>
            <option v-for="project in projectsForSelect" :key="project.id" :value="project.id">
              {{ project.title }}
            </option>
          </select>
        </div>

        <!-- Type -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <select
            v-model="filters.type"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option :value="undefined">Tous les types</option>
            <option v-for="(label, key) in projectCallTypeLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Statut -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut
          </label>
          <select
            v-model="filters.status"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option :value="undefined">Tous les statuts</option>
            <option v-for="(label, key) in projectCallStatusLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Actions groupées -->
    <div v-if="selectedIds.length > 0" class="flex items-center gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
      <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
        {{ selectedIds.length }} sélectionné(s)
      </span>
      <button
        :disabled="isProcessing"
        class="text-sm text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
        @click="bulkDelete"
      >
        <font-awesome-icon :icon="['fas', 'trash']" class="mr-1" />
        Supprimer
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-blue-500" />
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
                />
              </th>
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
                Projet parent
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('type')"
              >
                <div class="flex items-center gap-1">
                  Type
                  <font-awesome-icon
                    v-if="sortBy === 'type'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="text-blue-500"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Statut
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('deadline')"
              >
                <div class="flex items-center gap-1">
                  Date limite
                  <font-awesome-icon
                    v-if="sortBy === 'deadline'"
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
              v-for="call in sortedCalls"
              :key="call.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-4 py-3">
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="call.id"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td class="px-4 py-3">
                <div>
                  <NuxtLink
                    :to="`/admin/projets/appels/${call.id}`"
                    class="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                  >
                    {{ call.title }}
                  </NuxtLink>
                  <div v-if="getDescriptionPreview(call.description)" class="mt-1 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                    {{ getDescriptionPreview(call.description) }}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {{ getProjectName(call.project_id) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span v-if="call.type" :class="['inline-flex rounded-full px-2 py-1 text-xs font-medium', projectCallTypeColors[call.type]]">
                  {{ projectCallTypeLabels[call.type] }}
                </span>
                <span v-else class="text-sm text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <span :class="['inline-flex rounded-full px-2 py-1 text-xs font-medium', projectCallStatusColors[call.status]]">
                  {{ projectCallStatusLabels[call.status] }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm">
                  <div :class="{ 'text-red-600 dark:text-red-400': isDeadlinePassed(call.deadline) }">
                    {{ formatDate(call.deadline) }}
                  </div>
                  <div v-if="call.deadline && !isDeadlinePassed(call.deadline)" class="text-xs text-gray-500">
                    {{ getDaysUntilDeadline(call.deadline) }} jour(s) restant(s)
                  </div>
                  <div v-else-if="call.deadline && isDeadlinePassed(call.deadline)" class="text-xs text-red-500">
                    Expiré
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <!-- Changement rapide de statut -->
                  <div class="relative">
                    <select
                      :value="call.status"
                      :disabled="isProcessing"
                      class="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      @change="changeStatus(call.id, ($event.target as HTMLSelectElement).value as ProjectCallStatus)"
                    >
                      <option value="upcoming">À venir</option>
                      <option value="ongoing">En cours</option>
                      <option value="closed">Clôturé</option>
                    </select>
                  </div>

                  <NuxtLink
                    :to="`/admin/projets/appels/${call.id}`"
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700"
                    title="Voir"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                  </NuxtLink>
                  <NuxtLink
                    :to="`/admin/projets/appels/${call.id}/edit`"
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                    title="Modifier"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </NuxtLink>
                  <button
                    :disabled="isProcessing"
                    class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-gray-700"
                    title="Supprimer"
                    @click="deleteCall(call.id)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="sortedCalls.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <font-awesome-icon :icon="['fas', 'folder-open']" class="mb-2 text-4xl" />
                <p>Aucun appel trouvé</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ currentPage }} sur {{ totalPages }} ({{ totalItems }} résultats)
        </div>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            class="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="currentPage--"
          >
            Précédent
          </button>
          <button
            :disabled="currentPage === totalPages"
            class="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="currentPage++"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
