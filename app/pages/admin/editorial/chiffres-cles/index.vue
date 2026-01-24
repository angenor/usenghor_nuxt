<script setup lang="ts">
import type { EditorialStatistic, EditorialCategory, EditorialStatisticHistory, StatisticFilters, EditorialValueType } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllStatistics,
  getStatisticById,
  getStatisticByKey,
  isStatisticKeyTaken,
  getStatisticHistory,
  getAllEditorialCategories,
  getEditorialCategoryById,
  getStatisticAvailableYears,
  getEditorialGlobalStats,
  formatStatisticValue,
  canEditStatistic,
  canDeleteStatistic,
  valueTypeLabels,
  valueTypeColors,
  generateStatisticId,
  generateHistoryId
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref<string | 'all'>('all')
const yearFilter = ref<number | 'all'>('all')
const sortBy = ref<StatisticFilters['sort_by']>('updated_at')
const sortOrder = ref<StatisticFilters['sort_order']>('desc')

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showHistoryModal = ref(false)

const selectedStatistic = ref<EditorialStatistic | null>(null)
const statisticToDelete = ref<EditorialStatistic | null>(null)
const statisticHistory = ref<EditorialStatisticHistory[]>([])

// Formulaire
const formData = ref({
  key: '',
  value: '',
  value_type: 'number' as EditorialValueType,
  category_id: '',
  year: null as number | null,
  description: ''
})
const formErrors = ref<Record<string, string>>({})

// === COMPUTED ===

// Statistiques globales
const globalStats = computed(() => getEditorialGlobalStats())

// Catégories disponibles
const categories = computed(() => getAllEditorialCategories())

// Années disponibles
const availableYears = computed(() => getStatisticAvailableYears())

// Filtres appliqués
const filters = computed<StatisticFilters>(() => ({
  search: searchQuery.value || undefined,
  category: categoryFilter.value === 'all' ? undefined : categoryFilter.value,
  year: yearFilter.value === 'all' ? undefined : yearFilter.value,
  sort_by: sortBy.value,
  sort_order: sortOrder.value
}))

// Liste filtrée
const filteredStatistics = computed(() => getAllStatistics(filters.value))

// Types de valeurs disponibles
const valueTypes: EditorialValueType[] = ['number', 'text', 'html', 'markdown', 'json']

// === METHODS ===

// Initialisation
onMounted(() => {
  isLoading.value = false
})

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  yearFilter.value = 'all'
}

// Trier par colonne
const toggleSort = (column: StatisticFilters['sort_by']) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date courte
const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Obtenir le nom de la catégorie
const getCategoryName = (categoryId: string | null) => {
  if (!categoryId) return 'Sans catégorie'
  const category = getEditorialCategoryById(categoryId)
  return category?.name || 'Inconnue'
}

// Réinitialiser le formulaire
const resetForm = () => {
  formData.value = {
    key: '',
    value: '',
    value_type: 'number',
    category_id: '',
    year: null,
    description: ''
  }
  formErrors.value = {}
}

// Valider le formulaire
const validateForm = (): boolean => {
  formErrors.value = {}

  if (!formData.value.key.trim()) {
    formErrors.value.key = 'La clé est requise'
  } else if (!/^[a-z][a-z0-9_]*$/.test(formData.value.key)) {
    formErrors.value.key = 'La clé doit commencer par une lettre et ne contenir que des lettres minuscules, chiffres et underscores'
  } else if (isStatisticKeyTaken(formData.value.key, selectedStatistic.value?.id)) {
    formErrors.value.key = 'Cette clé est déjà utilisée'
  }

  if (!formData.value.value.trim()) {
    formErrors.value.value = 'La valeur est requise'
  }

  if (formData.value.value_type === 'number') {
    const num = parseFloat(formData.value.value)
    if (isNaN(num)) {
      formErrors.value.value = 'La valeur doit être un nombre valide'
    }
  }

  return Object.keys(formErrors.value).length === 0
}

// Ouvrir modal d'ajout
const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

// Ouvrir modal d'édition
const openEditModal = (stat: EditorialStatistic) => {
  selectedStatistic.value = stat
  formData.value = {
    key: stat.key,
    value: stat.value,
    value_type: stat.value_type,
    category_id: stat.category_id || '',
    year: stat.year,
    description: stat.description || ''
  }
  formErrors.value = {}
  showEditModal.value = true
}

// Ouvrir modal de suppression
const openDeleteModal = (stat: EditorialStatistic) => {
  statisticToDelete.value = stat
  showDeleteModal.value = true
}

// Ouvrir modal d'historique
const openHistoryModal = (stat: EditorialStatistic) => {
  selectedStatistic.value = stat
  statisticHistory.value = getStatisticHistory(stat.id)
  showHistoryModal.value = true
}

// Enregistrer (ajout)
const handleAdd = () => {
  if (!validateForm()) return

  // Simulation de l'ajout (en mode réel, appel API)
  console.log('Ajout du chiffre clé:', {
    id: generateStatisticId(),
    ...formData.value,
    category_id: formData.value.category_id || null,
    admin_editable: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  showAddModal.value = false
  resetForm()
}

// Enregistrer (modification)
const handleEdit = () => {
  if (!validateForm() || !selectedStatistic.value) return

  // Simulation de la modification (en mode réel, appel API)
  console.log('Modification du chiffre clé:', {
    id: selectedStatistic.value.id,
    ...formData.value,
    category_id: formData.value.category_id || null,
    updated_at: new Date().toISOString()
  })

  showEditModal.value = false
  selectedStatistic.value = null
  resetForm()
}

// Supprimer
const handleDelete = () => {
  if (!statisticToDelete.value) return

  // Simulation de la suppression (en mode réel, appel API)
  console.log('Suppression du chiffre clé:', statisticToDelete.value.id)

  showDeleteModal.value = false
  statisticToDelete.value = null
}

// Fermer les modales
const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  showHistoryModal.value = false
  selectedStatistic.value = null
  statisticToDelete.value = null
  resetForm()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Chiffres clés
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les statistiques affichées sur le site public
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un chiffre
      </button>
    </div>

    <!-- Statistiques globales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'hashtag']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ globalStats.total_count }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Chiffres clés
            </p>
          </div>
        </div>
      </div>

      <!-- Catégories -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'folder']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ categories.length }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Catégories
            </p>
          </div>
        </div>
      </div>

      <!-- Modifiables -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'edit']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ globalStats.editable_count }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Modifiables
            </p>
          </div>
        </div>
      </div>

      <!-- Dernière MAJ -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ globalStats.last_updated ? formatDateShort(globalStats.last_updated) : '-' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Dernière mise à jour
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <!-- Recherche -->
        <div class="relative flex-1">
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par clé, valeur ou description..."
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
        </div>

        <!-- Filtre catégorie -->
        <div class="w-full lg:w-48">
          <select
            v-model="categoryFilter"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">Toutes catégories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Filtre année -->
        <div class="w-full lg:w-36">
          <select
            v-model="yearFilter"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">Toutes années</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <!-- Reset -->
        <button
          v-if="searchQuery || categoryFilter !== 'all' || yearFilter !== 'all'"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          @click="resetFilters"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Liste des chiffres clés -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <div v-else-if="filteredStatistics.length === 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <font-awesome-icon :icon="['fas', 'hashtag']" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun chiffre clé trouvé
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        {{ searchQuery || categoryFilter !== 'all' || yearFilter !== 'all' ? 'Aucun résultat ne correspond à vos critères.' : 'Commencez par ajouter votre premier chiffre clé.' }}
      </p>
      <button
        v-if="!searchQuery && categoryFilter === 'all' && yearFilter === 'all'"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un chiffre
      </button>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Tableau -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                @click="toggleSort('key')"
              >
                <div class="flex items-center gap-2">
                  Clé
                  <font-awesome-icon
                    v-if="sortBy === 'key'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Valeur
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Catégorie
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                @click="toggleSort('year')"
              >
                <div class="flex items-center gap-2">
                  Année
                  <font-awesome-icon
                    v-if="sortBy === 'year'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                @click="toggleSort('updated_at')"
              >
                <div class="flex items-center gap-2">
                  Modifié le
                  <font-awesome-icon
                    v-if="sortBy === 'updated_at'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="stat in filteredStatistics"
              :key="stat.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <!-- Clé -->
              <td class="px-4 py-3">
                <div>
                  <code class="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {{ stat.key }}
                  </code>
                  <p v-if="stat.description" class="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {{ stat.description }}
                  </p>
                </div>
              </td>

              <!-- Valeur -->
              <td class="px-4 py-3">
                <span class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ formatStatisticValue(stat.value, stat.value_type) }}
                </span>
              </td>

              <!-- Type -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="valueTypeColors[stat.value_type]"
                >
                  {{ valueTypeLabels[stat.value_type] }}
                </span>
              </td>

              <!-- Catégorie -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ getCategoryName(stat.category_id) }}
              </td>

              <!-- Année -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ stat.year || '-' }}
              </td>

              <!-- Modifié le -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDateShort(stat.updated_at) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <!-- Historique -->
                  <button
                    class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Voir l'historique"
                    @click="openHistoryModal(stat)"
                  >
                    <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
                  </button>

                  <!-- Modifier -->
                  <button
                    v-if="canEditStatistic(stat)"
                    class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Modifier"
                    @click="openEditModal(stat)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                  </button>

                  <!-- Supprimer -->
                  <button
                    v-if="canDeleteStatistic(stat)"
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                    @click="openDeleteModal(stat)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                  </button>

                  <!-- Non modifiable -->
                  <span
                    v-if="!canEditStatistic(stat)"
                    class="px-2 py-1 text-xs text-gray-400 dark:text-gray-500"
                    title="Ce chiffre n'est pas modifiable"
                  >
                    <font-awesome-icon :icon="['fas', 'lock']" class="h-4 w-4" />
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredStatistics.length }} chiffre{{ filteredStatistics.length > 1 ? 's' : '' }} clé{{ filteredStatistics.length > 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <!-- Modal Ajouter -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un chiffre clé
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="handleAdd">
            <!-- Clé -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clé (identifiant unique) *
              </label>
              <input
                v-model="formData.key"
                type="text"
                placeholder="ex: graduates_count"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.key }"
              >
              <p v-if="formErrors.key" class="mt-1 text-sm text-red-500">{{ formErrors.key }}</p>
              <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">Lettres minuscules, chiffres et underscores uniquement</p>
            </div>

            <!-- Valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valeur *
              </label>
              <input
                v-model="formData.value"
                type="text"
                placeholder="ex: 5200"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.value }"
              >
              <p v-if="formErrors.value" class="mt-1 text-sm text-red-500">{{ formErrors.value }}</p>
            </div>

            <!-- Type de valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de valeur
              </label>
              <select
                v-model="formData.value_type"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option v-for="vt in valueTypes" :key="vt" :value="vt">
                  {{ valueTypeLabels[vt] }}
                </option>
              </select>
            </div>

            <!-- Catégorie et Année -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  v-model="formData.category_id"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Sans catégorie</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Année
                </label>
                <input
                  v-model.number="formData.year"
                  type="number"
                  min="1990"
                  :max="new Date().getFullYear() + 1"
                  placeholder="ex: 2024"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                v-model="formData.description"
                rows="2"
                placeholder="Description pour l'affichage sur le site"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedStatistic"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le chiffre clé
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="handleEdit">
            <!-- Clé (lecture seule) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clé (identifiant unique)
              </label>
              <input
                :value="formData.key"
                type="text"
                disabled
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 py-2 px-3 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
              >
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">La clé ne peut pas être modifiée</p>
            </div>

            <!-- Valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valeur *
              </label>
              <input
                v-model="formData.value"
                type="text"
                placeholder="ex: 5200"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.value }"
              >
              <p v-if="formErrors.value" class="mt-1 text-sm text-red-500">{{ formErrors.value }}</p>
            </div>

            <!-- Type de valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de valeur
              </label>
              <select
                v-model="formData.value_type"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option v-for="vt in valueTypes" :key="vt" :value="vt">
                  {{ valueTypeLabels[vt] }}
                </option>
              </select>
            </div>

            <!-- Catégorie et Année -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  v-model="formData.category_id"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Sans catégorie</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Année
                </label>
                <input
                  v-model.number="formData.year"
                  type="number"
                  min="1990"
                  :max="new Date().getFullYear() + 1"
                  placeholder="ex: 2024"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                v-model="formData.description"
                rows="2"
                placeholder="Description pour l'affichage sur le site"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
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
        v-if="showDeleteModal && statisticToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer ce chiffre clé ?
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Vous êtes sur le point de supprimer le chiffre clé
              <code class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ statisticToDelete.key }}</code>.
              Cette action est irréversible.
            </p>
            <div class="flex justify-center gap-3">
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                @click="handleDelete"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Historique -->
    <Teleport to="body">
      <div
        v-if="showHistoryModal && selectedStatistic"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Historique des modifications
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <code class="font-mono">{{ selectedStatistic.key }}</code>
              </p>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="statisticHistory.length === 0" class="text-center py-8">
              <font-awesome-icon :icon="['fas', 'history']" class="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p class="text-gray-500 dark:text-gray-400">
                Aucune modification enregistrée
              </p>
            </div>

            <div v-else class="space-y-4">
              <!-- Valeur actuelle -->
              <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div class="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                  <font-awesome-icon :icon="['fas', 'check-circle']" class="h-4 w-4" />
                  <span class="text-sm font-medium">Valeur actuelle</span>
                </div>
                <p class="text-lg font-semibold text-green-800 dark:text-green-300">
                  {{ formatStatisticValue(selectedStatistic.value, selectedStatistic.value_type) }}
                </p>
              </div>

              <!-- Historique -->
              <div
                v-for="(entry, index) in statisticHistory"
                :key="entry.id"
                class="relative pl-6 pb-4"
                :class="{ 'border-l-2 border-gray-200 dark:border-gray-700': index < statisticHistory.length - 1 }"
              >
                <div class="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(entry.modified_at) }}
                    </span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">
                      par {{ entry.modified_by_name || 'Inconnu' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">{{ entry.old_value }}</span>
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3 w-3 text-gray-400" />
                    <span class="font-medium text-gray-900 dark:text-white">{{ entry.new_value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              class="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              @click="closeModals"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
