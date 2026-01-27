<script setup lang="ts">
import type {
  ContentRead,
  CategoryRead,
  HistoryRead,
  EditorialValueType,
  ContentFilters
} from '~/composables/useEditorialApi'
import type { OutputData } from '@editorjs/editorjs'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin'
})

// === TYPES JSON STRUCTURÉS ===

// Type pour les "core values" (valeurs fondamentales)
interface CoreValueData {
  title: string
  description: string
  icon: string
  display_order: number
  is_active: boolean
}

// Type pour les objets JSON simples (clé-valeur)
interface SimpleJsonData {
  [key: string]: string | number | boolean
}

// Mode d'édition JSON
type JsonEditMode = 'form' | 'rich' | 'raw'

const {
  listContents,
  listCategoriesWithCount,
  createContent,
  updateContent,
  deleteContent,
  getContentHistory,
  formatValue,
  canEditContent,
  canDeleteContent,
  getAvailableYears,
  computeGlobalStats,
  valueTypeLabels,
  valueTypeColors
} = useEditorialApi()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)

// Données
const contents = ref<ContentRead[]>([])
const categories = ref<CategoryRead[]>([])
const totalItems = ref(0)
const totalPages = ref(1)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(50)

// Filtres
const searchQuery = ref('')
const categoryFilter = ref<string | 'all'>('all')
const yearFilter = ref<number | 'all'>('all')
const sortBy = ref<'key' | 'updated_at' | 'year'>('updated_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showHistoryModal = ref(false)

const selectedContent = ref<ContentRead | null>(null)
const contentToDelete = ref<ContentRead | null>(null)
const contentHistory = ref<HistoryRead[]>([])

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

// EditorJS content (pour types html uniquement)
const editorContent = ref<OutputData | undefined>(undefined)

// JSON form data (pour type json - formulaire dynamique)
const jsonEditMode = ref<JsonEditMode>('form')
const coreValueForm = ref<CoreValueData>({
  title: '',
  description: '',
  icon: 'fa-star',
  display_order: 0,
  is_active: true
})
const simpleJsonForm = ref<SimpleJsonData>({})
const rawJsonValue = ref('')

// Liste d'icônes courantes pour le sélecteur
const commonIcons = [
  { value: 'fa-star', label: 'Étoile' },
  { value: 'fa-heart', label: 'Cœur' },
  { value: 'fa-lightbulb', label: 'Ampoule' },
  { value: 'fa-users', label: 'Utilisateurs' },
  { value: 'fa-graduation-cap', label: 'Diplôme' },
  { value: 'fa-globe', label: 'Globe' },
  { value: 'fa-book', label: 'Livre' },
  { value: 'fa-handshake', label: 'Poignée de main' },
  { value: 'fa-shield', label: 'Bouclier' },
  { value: 'fa-award', label: 'Récompense' },
  { value: 'fa-check-circle', label: 'Validé' },
  { value: 'fa-flag', label: 'Drapeau' },
]

// === COMPUTED ===

// Statistiques globales
const globalStats = computed(() => computeGlobalStats(contents.value, categories.value))

// Années disponibles
const availableYears = computed(() => getAvailableYears(contents.value))

// Types de valeurs disponibles
const valueTypes: EditorialValueType[] = ['number', 'text', 'html', 'markdown', 'json']

// Détermine si on doit utiliser EditorJS pour ce type (uniquement HTML maintenant)
const useRichEditor = computed(() => formData.value.value_type === 'html')

// Détermine si c'est un champ JSON
const isJsonType = computed(() => formData.value.value_type === 'json')

// Détecte si la valeur JSON est un "core value" (valeur fondamentale)
const isCoreValueJson = computed(() => {
  if (!isJsonType.value) return false
  // Détecter par la clé (convention: core_value_*)
  if (formData.value.key.startsWith('core_value_')) return true
  // Ou détecter par la structure existante
  try {
    const parsed = JSON.parse(formData.value.value || '{}')
    return 'title' in parsed && 'description' in parsed && 'icon' in parsed
  }
  catch {
    return false
  }
})

// Détecte si c'est du contenu EditorJS (pour l'affichage uniquement, pas l'édition)
const isEditorJsContent = computed(() => {
  if (!isJsonType.value) return false
  try {
    const parsed = JSON.parse(formData.value.value || '{}')
    return parsed.blocks && Array.isArray(parsed.blocks)
  }
  catch {
    return false
  }
})

// === API CALLS ===
async function loadContents() {
  isLoading.value = true
  try {
    const params: ContentFilters = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || null,
      category_id: categoryFilter.value !== 'all' ? categoryFilter.value : null,
      year: yearFilter.value !== 'all' ? yearFilter.value : null,
      sort_by: sortBy.value,
      sort_order: sortOrder.value
    }

    const response = await listContents(params)
    contents.value = response.items
    totalItems.value = response.total
    totalPages.value = response.pages
  } catch (error) {
    console.error('Erreur chargement contenus:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadCategories() {
  try {
    const response = await listCategoriesWithCount()
    categories.value = response
  } catch (error) {
    console.error('Erreur chargement catégories:', error)
  }
}

// === WATCHERS ===
watch(searchQuery, useDebounceFn(() => {
  currentPage.value = 1
  loadContents()
}, 300))

watch([categoryFilter, yearFilter, sortBy, sortOrder], () => {
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

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  yearFilter.value = 'all'
}

// Trier par colonne
const toggleSort = (column: 'key' | 'updated_at' | 'year') => {
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
  const category = categories.value.find(c => c.id === categoryId)
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
  editorContent.value = undefined
  // Reset JSON forms
  jsonEditMode.value = 'form'
  coreValueForm.value = {
    title: '',
    description: '',
    icon: 'fa-star',
    display_order: 0,
    is_active: true
  }
  simpleJsonForm.value = {}
  rawJsonValue.value = ''
}

// Convertir une chaîne JSON en OutputData pour EditorJS (uniquement pour HTML)
const parseEditorContent = (value: string | null): OutputData | undefined => {
  if (!value) return undefined
  try {
    const parsed = JSON.parse(value)
    // Vérifier si c'est un format EditorJS valide
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
    // Sinon, créer un bloc paragraphe avec le contenu
    return {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: typeof parsed === 'string' ? parsed : JSON.stringify(parsed) } }],
      version: '2.28.0'
    }
  }
  catch {
    // Si ce n'est pas du JSON, créer un bloc paragraphe
    return {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: value } }],
      version: '2.28.0'
    }
  }
}

// Sérialiser le contenu EditorJS en chaîne JSON
const serializeEditorContent = (): string => {
  if (!editorContent.value) return ''
  return JSON.stringify(editorContent.value)
}

// Parser une valeur JSON en formulaire core value
const parseCoreValueJson = (value: string | null): void => {
  if (!value) {
    coreValueForm.value = {
      title: '',
      description: '',
      icon: 'fa-star',
      display_order: 0,
      is_active: true
    }
    return
  }
  try {
    const parsed = JSON.parse(value)
    coreValueForm.value = {
      title: parsed.title || '',
      description: parsed.description || '',
      icon: parsed.icon || 'fa-star',
      display_order: parsed.display_order ?? 0,
      is_active: parsed.is_active ?? true
    }
  }
  catch {
    coreValueForm.value = {
      title: '',
      description: '',
      icon: 'fa-star',
      display_order: 0,
      is_active: true
    }
  }
}

// Sérialiser le formulaire core value en JSON
const serializeCoreValueJson = (): string => {
  return JSON.stringify(coreValueForm.value)
}

// Parser une valeur JSON en formulaire simple (clé-valeur)
const parseSimpleJson = (value: string | null): void => {
  if (!value) {
    simpleJsonForm.value = {}
    rawJsonValue.value = '{}'
    return
  }
  try {
    const parsed = JSON.parse(value)
    // Vérifier si c'est un objet simple (pas un array, pas EditorJS)
    if (typeof parsed === 'object' && !Array.isArray(parsed) && !parsed.blocks) {
      simpleJsonForm.value = parsed
      rawJsonValue.value = JSON.stringify(parsed, null, 2)
    }
    else {
      simpleJsonForm.value = {}
      rawJsonValue.value = JSON.stringify(parsed, null, 2)
    }
  }
  catch {
    simpleJsonForm.value = {}
    rawJsonValue.value = value || '{}'
  }
}

// Sérialiser le formulaire JSON simple
const serializeSimpleJson = (): string => {
  if (jsonEditMode.value === 'raw') {
    return rawJsonValue.value
  }
  return JSON.stringify(simpleJsonForm.value)
}

// Ajouter un champ au formulaire JSON simple
const addJsonField = () => {
  const newKey = `champ_${Object.keys(simpleJsonForm.value).length + 1}`
  simpleJsonForm.value[newKey] = ''
}

// Supprimer un champ du formulaire JSON simple
const removeJsonField = (key: string) => {
  delete simpleJsonForm.value[key]
}

// Renommer un champ JSON
const renameJsonField = (oldKey: string, newKey: string) => {
  if (oldKey === newKey || !newKey.trim()) return
  const value = simpleJsonForm.value[oldKey] ?? ''
  delete simpleJsonForm.value[oldKey]
  simpleJsonForm.value[newKey] = value
}

// Réinitialiser le contenu quand le type change
watch(() => formData.value.value_type, (newType, oldType) => {
  if (newType === 'html' && oldType !== 'html') {
    // Passage vers HTML : utiliser EditorJS
    editorContent.value = parseEditorContent(formData.value.value)
  }
  else if (newType === 'json' && oldType !== 'json') {
    // Passage vers JSON : parser selon le format
    if (isCoreValueJson.value || formData.value.key.startsWith('core_value_')) {
      parseCoreValueJson(formData.value.value)
      jsonEditMode.value = 'form'
    }
    else {
      parseSimpleJson(formData.value.value)
      jsonEditMode.value = 'form'
    }
  }
  else if (newType !== 'html' && newType !== 'json') {
    // Passage vers un type simple
    if (oldType === 'html' && editorContent.value?.blocks?.length) {
      // Extraire le texte des blocs EditorJS
      const textContent = editorContent.value.blocks
        .map(b => b.data?.text || '')
        .filter(t => t)
        .join('\n')
      formData.value.value = textContent
    }
    else if (oldType === 'json') {
      // Convertir le JSON en texte lisible
      if (isCoreValueJson.value) {
        formData.value.value = coreValueForm.value.title || ''
      }
    }
    editorContent.value = undefined
  }
})

// Valider le formulaire
const validateForm = (): boolean => {
  formErrors.value = {}

  if (!formData.value.key.trim()) {
    formErrors.value.key = 'La clé est requise'
  }
  else if (!/^[a-z][a-z0-9_]*$/.test(formData.value.key)) {
    formErrors.value.key = 'La clé doit commencer par une lettre et ne contenir que des lettres minuscules, chiffres et underscores'
  }

  // Validation de la valeur selon le type
  if (useRichEditor.value) {
    // Pour EditorJS (HTML), vérifier qu'il y a du contenu
    if (!editorContent.value || !editorContent.value.blocks || editorContent.value.blocks.length === 0) {
      formErrors.value.value = 'Le contenu est requis'
    }
  }
  else if (isJsonType.value) {
    // Pour JSON, valider selon le mode
    if (isCoreValueJson.value || formData.value.key.startsWith('core_value_')) {
      if (!coreValueForm.value.title.trim()) {
        formErrors.value.value = 'Le titre est requis'
      }
    }
    else if (jsonEditMode.value === 'raw') {
      try {
        JSON.parse(rawJsonValue.value)
      }
      catch {
        formErrors.value.value = 'Le JSON n\'est pas valide'
      }
    }
  }
  else {
    if (!formData.value.value.trim()) {
      formErrors.value.value = 'La valeur est requise'
    }

    if (formData.value.value_type === 'number') {
      const num = parseFloat(formData.value.value)
      if (isNaN(num)) {
        formErrors.value.value = 'La valeur doit être un nombre valide'
      }
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
const openEditModal = (content: ContentRead) => {
  selectedContent.value = content
  formData.value = {
    key: content.key,
    value: content.value || '',
    value_type: content.value_type,
    category_id: content.category_id || '',
    year: content.year,
    description: content.description || ''
  }
  formErrors.value = {}

  // Parser le contenu selon le type
  if (content.value_type === 'html') {
    editorContent.value = parseEditorContent(content.value)
  }
  else if (content.value_type === 'json') {
    // Détecter si c'est un core value
    if (content.key.startsWith('core_value_')) {
      parseCoreValueJson(content.value)
      jsonEditMode.value = 'form'
    }
    else {
      // Essayer de détecter le format
      try {
        const parsed = JSON.parse(content.value || '{}')
        if ('title' in parsed && 'description' in parsed && 'icon' in parsed) {
          // C'est un core value
          parseCoreValueJson(content.value)
          jsonEditMode.value = 'form'
        }
        else {
          // C'est un JSON simple
          parseSimpleJson(content.value)
          jsonEditMode.value = 'form'
        }
      }
      catch {
        parseSimpleJson(content.value)
        jsonEditMode.value = 'raw'
      }
    }
  }
  else {
    editorContent.value = undefined
  }

  showEditModal.value = true
}

// Ouvrir modal de suppression
const openDeleteModal = (content: ContentRead) => {
  contentToDelete.value = content
  showDeleteModal.value = true
}

// Ouvrir modal d'historique
const openHistoryModal = async (content: ContentRead) => {
  selectedContent.value = content
  try {
    contentHistory.value = await getContentHistory(content.id)
  } catch (error) {
    console.error('Erreur chargement historique:', error)
    contentHistory.value = []
  }
  showHistoryModal.value = true
}

// Obtenir la valeur à sauvegarder selon le type
const getValueToSave = (): string => {
  if (useRichEditor.value) {
    return serializeEditorContent()
  }
  if (isJsonType.value) {
    if (isCoreValueJson.value || formData.value.key.startsWith('core_value_')) {
      return serializeCoreValueJson()
    }
    return serializeSimpleJson()
  }
  return formData.value.value
}

// Enregistrer (ajout)
const handleAdd = async () => {
  if (!validateForm()) return

  isSaving.value = true
  try {
    const valueToSave = getValueToSave()

    await createContent({
      key: formData.value.key,
      value: valueToSave,
      value_type: formData.value.value_type,
      category_id: formData.value.category_id || null,
      year: formData.value.year,
      description: formData.value.description || null,
      admin_editable: true
    })
    showAddModal.value = false
    resetForm()
    await loadContents()
  }
  catch (error: unknown) {
    const err = error as { data?: { detail?: string } }
    if (err.data?.detail?.includes('existe déjà')) {
      formErrors.value.key = 'Cette clé est déjà utilisée'
    }
    else {
      console.error('Erreur création contenu:', error)
    }
  }
  finally {
    isSaving.value = false
  }
}

// Enregistrer (modification)
const handleEdit = async () => {
  if (!validateForm() || !selectedContent.value) return

  isSaving.value = true
  try {
    const valueToSave = getValueToSave()

    await updateContent(selectedContent.value.id, {
      value: valueToSave,
      value_type: formData.value.value_type,
      category_id: formData.value.category_id || null,
      year: formData.value.year,
      description: formData.value.description || null
    })
    showEditModal.value = false
    selectedContent.value = null
    resetForm()
    await loadContents()
  }
  catch (error) {
    console.error('Erreur modification contenu:', error)
  }
  finally {
    isSaving.value = false
  }
}

// Supprimer
const handleDelete = async () => {
  if (!contentToDelete.value) return

  isSaving.value = true
  try {
    await deleteContent(contentToDelete.value.id)
    showDeleteModal.value = false
    contentToDelete.value = null
    await loadContents()
  } catch (error) {
    console.error('Erreur suppression contenu:', error)
  } finally {
    isSaving.value = false
  }
}

// Fermer les modales
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
              {{ totalItems }}
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

    <div v-else-if="contents.length === 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
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
              v-for="content in contents"
              :key="content.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <!-- Clé -->
              <td class="px-4 py-3">
                <div>
                  <code class="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {{ content.key }}
                  </code>
                  <p v-if="content.description" class="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {{ content.description }}
                  </p>
                </div>
              </td>

              <!-- Valeur -->
              <td class="px-4 py-3">
                <span class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ formatValue(content.value, content.value_type) }}
                </span>
              </td>

              <!-- Type -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="valueTypeColors[content.value_type]"
                >
                  {{ valueTypeLabels[content.value_type] }}
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
                  <!-- Historique -->
                  <button
                    class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Voir l'historique"
                    @click="openHistoryModal(content)"
                  >
                    <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
                  </button>

                  <!-- Modifier -->
                  <button
                    v-if="canEditContent(content)"
                    class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Modifier"
                    @click="openEditModal(content)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                  </button>

                  <!-- Supprimer -->
                  <button
                    v-if="canDeleteContent(content)"
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                    @click="openDeleteModal(content)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                  </button>

                  <!-- Non modifiable -->
                  <span
                    v-if="!canEditContent(content)"
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

      <!-- Footer avec pagination -->
      <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalItems }} chiffre{{ totalItems > 1 ? 's' : '' }} clé{{ totalItems > 1 ? 's' : '' }}
        </p>

        <div v-if="totalPages > 1" class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-600"
            @click="currentPage = currentPage - 1"
          >
            Précédent
          </button>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Page {{ currentPage }} / {{ totalPages }}
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
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto"
          :class="useRichEditor || isJsonType ? 'max-w-3xl' : 'max-w-lg'"
        >
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

            <!-- Type de valeur (avant la valeur pour conditionner l'affichage) -->
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

            <!-- Valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valeur *
              </label>

              <!-- Éditeur riche pour HTML -->
              <template v-if="useRichEditor">
                <ClientOnly>
                  <EditorJS
                    v-model="editorContent"
                    placeholder="Commencez à écrire..."
                    :min-height="200"
                  />
                  <template #fallback>
                    <div class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 h-[200px]">
                      <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  </template>
                </ClientOnly>
              </template>

              <!-- Formulaire JSON dynamique -->
              <template v-else-if="isJsonType">
                <!-- Core Value Form (titre, description, icône) -->
                <div v-if="isCoreValueJson || formData.key.startsWith('core_value_')" class="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Titre</label>
                    <input
                      v-model="coreValueForm.title"
                      type="text"
                      placeholder="Ex: Excellence"
                      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea
                      v-model="coreValueForm.description"
                      rows="3"
                      placeholder="Description de cette valeur..."
                      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Icône</label>
                      <select
                        v-model="coreValueForm.icon"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                        <option v-for="icon in commonIcons" :key="icon.value" :value="icon.value">
                          {{ icon.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ordre d'affichage</label>
                      <input
                        v-model.number="coreValueForm.display_order"
                        type="number"
                        min="0"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      id="is_active_add"
                      v-model="coreValueForm.is_active"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    >
                    <label for="is_active_add" class="text-sm text-gray-700 dark:text-gray-300">Actif</label>
                  </div>
                </div>

                <!-- JSON Simple (clé-valeur dynamique) -->
                <div v-else class="space-y-3">
                  <!-- Toggle mode -->
                  <div class="flex gap-2 mb-2">
                    <button
                      type="button"
                      class="px-3 py-1 text-xs rounded-lg transition-colors"
                      :class="jsonEditMode === 'form' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
                      @click="jsonEditMode = 'form'"
                    >
                      Formulaire
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1 text-xs rounded-lg transition-colors"
                      :class="jsonEditMode === 'raw' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
                      @click="jsonEditMode = 'raw'; rawJsonValue = JSON.stringify(simpleJsonForm, null, 2)"
                    >
                      JSON brut
                    </button>
                  </div>

                  <!-- Mode formulaire -->
                  <div v-if="jsonEditMode === 'form'" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2">
                    <div v-for="(_, key) in simpleJsonForm" :key="key" class="flex items-center gap-2">
                      <input
                        :value="key"
                        type="text"
                        placeholder="Nom du champ"
                        class="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 px-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        @change="(e) => renameJsonField(key as string, (e.target as HTMLInputElement).value)"
                      >
                      <input
                        v-model="simpleJsonForm[key as string]"
                        type="text"
                        placeholder="Valeur"
                        class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 px-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                      <button
                        type="button"
                        class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        @click="removeJsonField(key as string)"
                      >
                        <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      class="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      @click="addJsonField"
                    >
                      <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3" />
                      Ajouter un champ
                    </button>
                  </div>

                  <!-- Mode JSON brut -->
                  <textarea
                    v-else
                    v-model="rawJsonValue"
                    rows="8"
                    placeholder='{"clé": "valeur"}'
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono"
                    :class="{ 'border-red-500': formErrors.value }"
                  />
                </div>
              </template>

              <!-- Textarea pour Markdown -->
              <textarea
                v-else-if="formData.value_type === 'markdown'"
                v-model="formData.value"
                rows="6"
                placeholder="Contenu en Markdown..."
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono"
                :class="{ 'border-red-500': formErrors.value }"
              />

              <!-- Input simple pour Number/Text -->
              <input
                v-else
                v-model="formData.value"
                type="text"
                placeholder="ex: 5200"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.value }"
              >
              <p v-if="formErrors.value" class="mt-1 text-sm text-red-500">{{ formErrors.value }}</p>
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
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="mr-2 h-4 w-4 animate-spin" />
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
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto"
          :class="useRichEditor || isJsonType ? 'max-w-3xl' : 'max-w-lg'"
        >
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

            <!-- Type de valeur (avant la valeur pour conditionner l'affichage) -->
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

            <!-- Valeur -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valeur *
              </label>

              <!-- Éditeur riche pour HTML -->
              <template v-if="useRichEditor">
                <ClientOnly>
                  <EditorJS
                    v-model="editorContent"
                    placeholder="Commencez à écrire..."
                    :min-height="200"
                  />
                  <template #fallback>
                    <div class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 h-[200px]">
                      <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  </template>
                </ClientOnly>
              </template>

              <!-- Formulaire JSON dynamique -->
              <template v-else-if="isJsonType">
                <!-- Core Value Form (titre, description, icône) -->
                <div v-if="isCoreValueJson || formData.key.startsWith('core_value_')" class="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Titre</label>
                    <input
                      v-model="coreValueForm.title"
                      type="text"
                      placeholder="Ex: Excellence"
                      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea
                      v-model="coreValueForm.description"
                      rows="3"
                      placeholder="Description de cette valeur..."
                      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Icône</label>
                      <select
                        v-model="coreValueForm.icon"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                        <option v-for="icon in commonIcons" :key="icon.value" :value="icon.value">
                          {{ icon.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ordre d'affichage</label>
                      <input
                        v-model.number="coreValueForm.display_order"
                        type="number"
                        min="0"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      id="is_active_edit"
                      v-model="coreValueForm.is_active"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    >
                    <label for="is_active_edit" class="text-sm text-gray-700 dark:text-gray-300">Actif</label>
                  </div>
                </div>

                <!-- JSON Simple (clé-valeur dynamique) -->
                <div v-else class="space-y-3">
                  <!-- Toggle mode -->
                  <div class="flex gap-2 mb-2">
                    <button
                      type="button"
                      class="px-3 py-1 text-xs rounded-lg transition-colors"
                      :class="jsonEditMode === 'form' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
                      @click="jsonEditMode = 'form'"
                    >
                      Formulaire
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1 text-xs rounded-lg transition-colors"
                      :class="jsonEditMode === 'raw' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
                      @click="jsonEditMode = 'raw'; rawJsonValue = JSON.stringify(simpleJsonForm, null, 2)"
                    >
                      JSON brut
                    </button>
                  </div>

                  <!-- Mode formulaire -->
                  <div v-if="jsonEditMode === 'form'" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 space-y-2">
                    <div v-for="(_, key) in simpleJsonForm" :key="key" class="flex items-center gap-2">
                      <input
                        :value="key"
                        type="text"
                        placeholder="Nom du champ"
                        class="w-1/3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 px-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        @change="(e) => renameJsonField(key as string, (e.target as HTMLInputElement).value)"
                      >
                      <input
                        v-model="simpleJsonForm[key as string]"
                        type="text"
                        placeholder="Valeur"
                        class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1.5 px-2 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                      <button
                        type="button"
                        class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        @click="removeJsonField(key as string)"
                      >
                        <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      class="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      @click="addJsonField"
                    >
                      <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3" />
                      Ajouter un champ
                    </button>
                  </div>

                  <!-- Mode JSON brut -->
                  <textarea
                    v-else
                    v-model="rawJsonValue"
                    rows="8"
                    placeholder='{"clé": "valeur"}'
                    class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono"
                    :class="{ 'border-red-500': formErrors.value }"
                  />
                </div>
              </template>

              <!-- Textarea pour Markdown -->
              <textarea
                v-else-if="formData.value_type === 'markdown'"
                v-model="formData.value"
                rows="6"
                placeholder="Contenu en Markdown..."
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-mono"
                :class="{ 'border-red-500': formErrors.value }"
              />

              <!-- Input simple pour Number/Text -->
              <input
                v-else
                v-model="formData.value"
                type="text"
                placeholder="ex: 5200"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.value }"
              >
              <p v-if="formErrors.value" class="mt-1 text-sm text-red-500">{{ formErrors.value }}</p>
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
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="mr-2 h-4 w-4 animate-spin" />
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
              Supprimer ce chiffre clé ?
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Vous êtes sur le point de supprimer le chiffre clé
              <code class="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ contentToDelete.key }}</code>.
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
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                :disabled="isSaving"
                @click="handleDelete"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="mr-2 h-4 w-4 animate-spin" />
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
                Historique des modifications
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <code class="font-mono">{{ selectedContent.key }}</code>
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
            <div v-if="contentHistory.length === 0" class="text-center py-8">
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
                  {{ formatValue(selectedContent.value, selectedContent.value_type) }}
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
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(entry.modified_at) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">{{ entry.old_value || '(vide)' }}</span>
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3 w-3 text-gray-400" />
                    <span class="font-medium text-gray-900 dark:text-white">{{ entry.new_value || '(vide)' }}</span>
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
