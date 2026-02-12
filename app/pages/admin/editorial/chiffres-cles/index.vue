<script setup lang="ts">
import type { EditorialContentRead, EditorialCategoryRead, EditorialHistoryRead } from '~/types/api'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
})

const {
  listContents,
  listCategoriesWithCount,
  createContent,
  updateContent,
  deleteContent,
  getContentHistory,
} = useEditorialValuesApi()

// === CHIFFRES CLÉS PRÉDÉFINIS ===
// Ces chiffres sont utilisés sur différentes pages du site
const predefinedKeyFigures = [
  { key: 'stats_countries', label: 'Nombre de pays africains', description: 'Nombre de pays africains représentés' },
  { key: 'stats_donor_countries', label: 'Pays bailleurs', description: 'Nombre de pays contributeurs au financement' },
  { key: 'stats_graduates', label: 'Nombre de diplômés', description: 'Nombre total de diplômés depuis la création' },
  { key: 'stats_alumni', label: 'Alumni (réseau)', description: 'Nombre d\'anciens diplômés dans le réseau alumni' },
  { key: 'stats_years', label: 'Années d\'existence', description: 'Nombre d\'années depuis la création de l\'université' },
  { key: 'stats_programs', label: 'Nombre de formations', description: 'Nombre de programmes de formation proposés' },
  { key: 'stats_partners', label: 'Nombre de partenaires', description: 'Nombre d\'universités et institutions partenaires' },
  { key: 'stats_professors', label: 'Nombre d\'enseignants', description: 'Nombre de professeurs et intervenants' },
  { key: 'stats_students', label: 'Étudiants actuels', description: 'Nombre d\'étudiants actuellement inscrits' },
  { key: 'stats_nationalities', label: 'Nationalités représentées', description: 'Nombre de nationalités parmi les étudiants' },
  { key: 'stats_open_positions', label: 'Postes ouverts', description: 'Nombre de postes actuellement ouverts au recrutement' },
  { key: 'stats_project_countries', label: 'Pays (projets)', description: 'Nombre de pays couverts par les projets de recherche' },
  { key: 'stats_project_beneficiaries', label: 'Bénéficiaires (projets)', description: 'Nombre de bénéficiaires des projets de recherche' },
  { key: 'stats_alumni_countries', label: 'Pays (alumni)', description: 'Nombre de pays représentés dans le réseau alumni' },
  { key: 'stats_alumni_sectors', label: 'Secteurs (alumni)', description: 'Nombre de secteurs d\'activité des anciens diplômés' },
  { key: 'stats_promotions', label: 'Promotions', description: 'Nombre de promotions depuis la création' },
  { key: 'stats_site_surface', label: 'Surface (campus)', description: 'Surface totale du campus en m²' },
  { key: 'stats_site_rooms', label: 'Salles (campus)', description: 'Nombre de salles de cours et espaces de travail' },
  { key: 'stats_site_capacity', label: 'Capacité (campus)', description: 'Capacité d\'accueil totale du campus' },
  { key: 'stats_site_founded', label: 'Année de fondation', description: 'Année de création de l\'université' },
  { key: 'stats_partnership_years', label: 'Années de partenariat', description: 'Nombre d\'années de partenariat (ex: 35+)' },
]

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Données
const contents = ref<EditorialContentRead[]>([])
const categories = ref<EditorialCategoryRead[]>([])
const totalItems = ref(0)
const totalPages = ref(1)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(50)

// Filtres
const searchQuery = ref('')
const categoryFilter = ref<string | 'all'>('all')

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showHistoryModal = ref(false)

const selectedContent = ref<EditorialContentRead | null>(null)
const contentToDelete = ref<EditorialContentRead | null>(null)
const contentHistory = ref<EditorialHistoryRead[]>([])
const isLoadingHistory = ref(false)

// Formulaire - uniquement pour les nombres
const formData = ref({
  key: '',
  value: '',
  category_id: '',
  year: null as number | null,
  description: '',
})
const formErrors = ref<Record<string, string>>({})
const usePredefinedKey = ref(true)
const selectedPredefinedKey = ref('')

// === COMPUTED ===

// Statistiques
const stats = computed(() => {
  const defined = contents.value.length
  const predefinedDefined = contents.value.filter(c =>
    predefinedKeyFigures.some(p => p.key === c.key),
  ).length
  const lastUpdated = contents.value.length > 0
    ? contents.value.reduce((latest, c) =>
        new Date(c.updated_at) > new Date(latest.updated_at) ? c : latest,
      ).updated_at
    : null
  return { defined, predefinedDefined, total: predefinedKeyFigures.length, lastUpdated }
})

// Chiffres prédéfinis non encore créés
const availablePredefinedKeys = computed(() => {
  const existingKeys = new Set(contents.value.map(c => c.key))
  return predefinedKeyFigures.filter(p => !existingKeys.has(p.key))
})

// === API CALLS ===
async function loadContents() {
  isLoading.value = true
  error.value = null
  try {
    // Charger uniquement les contenus de type number
    const response = await listContents({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      category_code: categoryFilter.value !== 'all' ? categoryFilter.value : undefined,
      value_type: 'number',
    })
    contents.value = response.items
    totalItems.value = response.total
    totalPages.value = response.pages
  }
  catch (err) {
    console.error('Erreur chargement contenus:', err)
    error.value = 'Erreur lors du chargement des chiffres clés'
  }
  finally {
    isLoading.value = false
  }
}

async function loadCategories() {
  try {
    const response = await listCategoriesWithCount()
    categories.value = response
  }
  catch (err) {
    console.error('Erreur chargement catégories:', err)
  }
}

// === WATCHERS ===
watch(searchQuery, useDebounceFn(() => {
  currentPage.value = 1
  loadContents()
}, 300))

watch([categoryFilter], () => {
  currentPage.value = 1
  loadContents()
})

watch(currentPage, () => {
  loadContents()
})

// === LIFECYCLE ===
onMounted(async () => {
  await Promise.all([loadContents(), loadCategories()])
})

// === METHODS ===

function showSuccess(message: string) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatNumber = (value: string | null) => {
  if (!value) return '-'
  const num = Number.parseFloat(value)
  if (Number.isNaN(num)) return value
  return new Intl.NumberFormat('fr-FR').format(num)
}

const getCategoryName = (categoryId: string | null) => {
  if (!categoryId) return 'Sans catégorie'
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || 'Inconnue'
}

const getKeyLabel = (key: string) => {
  const predefined = predefinedKeyFigures.find(p => p.key === key)
  return predefined?.label || key
}

const isPredefinedKey = (key: string) => {
  return predefinedKeyFigures.some(p => p.key === key)
}

const resetForm = () => {
  formData.value = {
    key: '',
    value: '',
    category_id: '',
    year: null,
    description: '',
  }
  formErrors.value = {}
  usePredefinedKey.value = true
  selectedPredefinedKey.value = ''
}

const validateForm = (): boolean => {
  formErrors.value = {}

  const keyToUse = usePredefinedKey.value ? selectedPredefinedKey.value : formData.value.key

  if (!keyToUse.trim()) {
    formErrors.value.key = 'La clé est requise'
  }
  else if (!usePredefinedKey.value && !/^[a-z][a-z0-9_]*$/.test(keyToUse)) {
    formErrors.value.key = 'La clé doit commencer par une lettre et ne contenir que des lettres minuscules, chiffres et underscores'
  }

  const valueStr = String(formData.value.value).trim()
  if (!valueStr) {
    formErrors.value.value = 'La valeur est requise'
  }
  else {
    const num = Number.parseFloat(valueStr)
    if (Number.isNaN(num)) {
      formErrors.value.value = 'La valeur doit être un nombre valide'
    }
  }

  return Object.keys(formErrors.value).length === 0
}

// Watcher pour remplir la description automatiquement
watch(selectedPredefinedKey, (newKey) => {
  if (newKey && usePredefinedKey.value) {
    const predefined = predefinedKeyFigures.find(p => p.key === newKey)
    if (predefined) {
      formData.value.description = predefined.description
    }
  }
})

const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

const openEditModal = (content: EditorialContentRead) => {
  selectedContent.value = content
  formData.value = {
    key: content.key,
    value: content.value || '',
    category_id: content.category_id || '',
    year: content.year,
    description: content.description || '',
  }
  formErrors.value = {}
  usePredefinedKey.value = false
  showEditModal.value = true
}

const openDeleteModal = (content: EditorialContentRead) => {
  contentToDelete.value = content
  showDeleteModal.value = true
}

const openHistoryModal = async (content: EditorialContentRead) => {
  selectedContent.value = content
  isLoadingHistory.value = true
  showHistoryModal.value = true
  try {
    contentHistory.value = await getContentHistory(content.id)
  }
  catch (err) {
    console.error('Erreur chargement historique:', err)
    contentHistory.value = []
  }
  finally {
    isLoadingHistory.value = false
  }
}

const handleAdd = async () => {
  if (!validateForm()) return

  isSaving.value = true
  error.value = null

  try {
    const keyToUse = usePredefinedKey.value ? selectedPredefinedKey.value : formData.value.key
    const predefined = predefinedKeyFigures.find(p => p.key === keyToUse)

    await createContent({
      key: keyToUse,
      value: String(formData.value.value),
      value_type: 'number',
      category_id: formData.value.category_id || undefined,
      year: formData.value.year || undefined,
      description: formData.value.description || predefined?.description || keyToUse,
      admin_editable: true,
    })

    showAddModal.value = false
    resetForm()
    await loadContents()
    showSuccess('Chiffre clé ajouté avec succès')
  }
  catch (err: unknown) {
    const fetchError = err as { data?: { detail?: string } }
    if (fetchError.data?.detail?.includes('existe déjà')) {
      formErrors.value.key = 'Cette clé est déjà utilisée'
    }
    else {
      console.error('Erreur création contenu:', err)
      error.value = 'Erreur lors de la création'
    }
  }
  finally {
    isSaving.value = false
  }
}

const handleEdit = async () => {
  if (!validateForm() || !selectedContent.value) return

  isSaving.value = true
  error.value = null

  try {
    await updateContent(selectedContent.value.id, {
      value: String(formData.value.value),
      category_id: formData.value.category_id || undefined,
      year: formData.value.year || undefined,
      description: formData.value.description || undefined,
    })

    showEditModal.value = false
    selectedContent.value = null
    resetForm()
    await loadContents()
    showSuccess('Chiffre clé modifié avec succès')
  }
  catch (err) {
    console.error('Erreur modification contenu:', err)
    error.value = 'Erreur lors de la modification'
  }
  finally {
    isSaving.value = false
  }
}

const handleDelete = async () => {
  if (!contentToDelete.value) return

  isSaving.value = true
  error.value = null

  try {
    await deleteContent(contentToDelete.value.id)
    showDeleteModal.value = false
    contentToDelete.value = null
    await loadContents()
    showSuccess('Chiffre clé supprimé avec succès')
  }
  catch (err) {
    console.error('Erreur suppression contenu:', err)
    error.value = 'Erreur lors de la suppression'
  }
  finally {
    isSaving.value = false
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  showHistoryModal.value = false
  selectedContent.value = null
  contentToDelete.value = null
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
          Statistiques et données chiffrées affichées sur le site
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

    <!-- Success message -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 transform -translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div class="flex items-center gap-3">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          <p class="text-sm text-green-700 dark:text-green-300">{{ successMessage }}</p>
        </div>
      </div>
    </Transition>

    <!-- Error message -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-center gap-3">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="h-5 w-5 text-red-600 dark:text-red-400" />
        <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'hashtag']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.defined }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Chiffres définis</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.predefinedDefined }} / {{ stats.total }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Chiffres standards</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'folder']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ categories.length }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Catégories</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ stats.lastUpdated ? formatDateShort(stats.lastUpdated) : '-' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Dernière MAJ</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chiffres prédéfinis manquants -->
    <div v-if="availablePredefinedKeys.length > 0" class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div class="flex items-start gap-3">
        <font-awesome-icon :icon="['fas', 'info-circle']" class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-amber-800 dark:text-amber-300">
            {{ availablePredefinedKeys.length }} chiffre(s) standard(s) non défini(s)
          </p>
          <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
            {{ availablePredefinedKeys.map(p => p.label).join(', ') }}
          </p>
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
            placeholder="Rechercher par clé ou description..."
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
            <option v-for="cat in categories" :key="cat.id" :value="cat.code">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <div v-else-if="contents.length === 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <font-awesome-icon :icon="['fas', 'hashtag']" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun chiffre clé
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Commencez par ajouter vos chiffres clés pour les afficher sur le site.
      </p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un chiffre
      </button>
    </div>

    <!-- Tableau des chiffres -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Libellé
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Valeur
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Catégorie
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Année
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Modifié le
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="content in contents"
              :key="content.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <!-- Libellé -->
              <td class="px-4 py-3">
                <div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getKeyLabel(content.key) }}
                  </span>
                  <span
                    v-if="isPredefinedKey(content.key)"
                    class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    Standard
                  </span>
                  <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <code class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ content.key }}</code>
                  </p>
                </div>
              </td>

              <!-- Valeur -->
              <td class="px-4 py-3 text-right">
                <span class="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {{ formatNumber(content.value) }}
                </span>
              </td>

              <!-- Catégorie -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ getCategoryName(content.category_id) }}
              </td>

              <!-- Année -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ content.year || '-' }}
              </td>

              <!-- Modifié le -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDateShort(content.updated_at) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Historique"
                    @click="openHistoryModal(content)"
                  >
                    <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Modifier"
                    @click="openEditModal(content)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                  </button>
                  <button
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                    @click="openDeleteModal(content)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalItems }} chiffre{{ totalItems > 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600"
            @click="currentPage = currentPage - 1"
          >
            Précédent
          </button>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            :disabled="currentPage >= totalPages"
            class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600"
            @click="currentPage = currentPage + 1"
          >
            Suivant
          </button>
        </div>
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
            <!-- Type de clé -->
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="usePredefinedKey"
                  type="radio"
                  :value="true"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm text-gray-700 dark:text-gray-300">Chiffre standard</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="usePredefinedKey"
                  type="radio"
                  :value="false"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm text-gray-700 dark:text-gray-300">Clé personnalisée</span>
              </label>
            </div>

            <!-- Sélection clé prédéfinie -->
            <div v-if="usePredefinedKey">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chiffre *
              </label>
              <select
                v-model="selectedPredefinedKey"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.key }"
              >
                <option value="">Sélectionner un chiffre...</option>
                <option v-for="p in availablePredefinedKeys" :key="p.key" :value="p.key">
                  {{ p.label }}
                </option>
              </select>
              <p v-if="formErrors.key" class="mt-1 text-sm text-red-500">{{ formErrors.key }}</p>
              <p v-else-if="availablePredefinedKeys.length === 0" class="mt-1 text-sm text-amber-600 dark:text-amber-400">
                Tous les chiffres standards sont déjà définis
              </p>
            </div>

            <!-- Clé personnalisée -->
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clé (identifiant) *
              </label>
              <input
                v-model="formData.key"
                type="text"
                placeholder="ex: custom_stat_name"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.key }"
              >
              <p v-if="formErrors.key" class="mt-1 text-sm text-red-500">{{ formErrors.key }}</p>
              <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lettres minuscules, chiffres et underscores
              </p>
            </div>

            <!-- Valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valeur numérique *
              </label>
              <input
                v-model="formData.value"
                type="number"
                step="any"
                placeholder="ex: 5200"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.value }"
              >
              <p v-if="formErrors.value" class="mt-1 text-sm text-red-500">{{ formErrors.value }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                v-model="formData.description"
                type="text"
                placeholder="Description pour l'affichage"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
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
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
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
        v-if="showEditModal && selectedContent"
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
                Chiffre
              </label>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ getKeyLabel(formData.key) }}
                </span>
                <span
                  v-if="isPredefinedKey(formData.key)"
                  class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  Standard
                </span>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <code class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ formData.key }}</code>
              </p>
            </div>

            <!-- Valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valeur numérique *
              </label>
              <input
                v-model="formData.value"
                type="number"
                step="any"
                placeholder="ex: 5200"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.value }"
              >
              <p v-if="formErrors.value" class="mt-1 text-sm text-red-500">{{ formErrors.value }}</p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                v-model="formData.description"
                type="text"
                placeholder="Description pour l'affichage"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
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
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
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
        v-if="showDeleteModal && contentToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer ce chiffre ?
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Voulez-vous supprimer « <span class="font-medium">{{ getKeyLabel(contentToDelete.key) }}</span> » ?
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
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                :disabled="isSaving"
                @click="handleDelete"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
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
        v-if="showHistoryModal && selectedContent"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Historique
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ getKeyLabel(selectedContent.key) }}
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
            <div v-if="isLoadingHistory" class="flex justify-center py-8">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-6 w-6 animate-spin text-gray-400" />
            </div>

            <div v-else-if="contentHistory.length === 0" class="text-center py-8">
              <font-awesome-icon :icon="['fas', 'history']" class="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p class="text-gray-500 dark:text-gray-400">Aucune modification enregistrée</p>
            </div>

            <div v-else class="space-y-4">
              <!-- Valeur actuelle -->
              <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div class="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                  <font-awesome-icon :icon="['fas', 'check-circle']" class="h-4 w-4" />
                  <span class="text-sm font-medium">Valeur actuelle</span>
                </div>
                <p class="text-2xl font-bold text-green-800 dark:text-green-300">
                  {{ formatNumber(selectedContent.value) }}
                </p>
              </div>

              <!-- Historique -->
              <div
                v-for="(entry, index) in contentHistory"
                :key="entry.id"
                class="relative pl-6 pb-4"
                :class="{ 'border-l-2 border-gray-200 dark:border-gray-700': index < contentHistory.length - 1 }"
              >
                <div class="absolute left-0 top-0 -translate-x-1/2 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(entry.modified_at) }}
                  </span>
                  <div class="flex items-center gap-2 mt-1 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">{{ formatNumber(entry.old_value) || '(vide)' }}</span>
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3 w-3 text-gray-400" />
                    <span class="font-bold text-gray-900 dark:text-white">{{ formatNumber(entry.new_value) || '(vide)' }}</span>
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
