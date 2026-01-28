<script setup lang="ts">
import type {
  CoreValue,
  EditorialContentRead,
  EditorialHistoryRead,
  EditorialValuesStats,
  ValueSectionKey,
} from '~/types/api'
import type { FrontOfficePage, PageSection, PageSectionField } from '~/composables/useEditorialValuesApi'

definePageMeta({
  layout: 'admin',
})

const {
  listContents,
  getContentByKey,
  createContent,
  updateContent,
  getCoreValues,
  createCoreValue: apiCreateCoreValue,
  updateCoreValue: apiUpdateCoreValue,
  deleteCoreValue: apiDeleteCoreValue,
  getValuesCategory,
  getValuesStats,
  getContentHistory,
  isCoreValueTitleTaken: apiIsCoreValueTitleTaken,
  validateCoreValueTitle,
  validateCoreValueDescription,
  getNextCoreValueOrder,
  coreValueAvailableIcons,
  frontOfficePages,
} = useEditorialValuesApi()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const activeTab = ref<'pages' | 'values'>('pages')
const selectedPage = ref<FrontOfficePage | null>(null)
const expandedSections = ref<Set<string>>(new Set())

// Tous les contenus éditoriaux chargés depuis la BDD
const allContents = ref<Map<string, EditorialContentRead>>(new Map())

// Field editing state
const editingFieldKey = ref<string | null>(null)
const editingFieldValue = ref<string>('')
const editingFieldType = ref<'text' | 'textarea' | 'number' | 'html'>('text')
const editingFieldValueType = ref<'text' | 'number' | 'html'>('text') // Type pour le backend

// Core values state
const coreValues = ref<CoreValue[]>([])
const showValueModal = ref(false)
const showDeleteModal = ref(false)
const editingValue = ref<CoreValue | null>(null)
const valueToDelete = ref<CoreValue | null>(null)
const valueForm = ref({
  title: '',
  description: '',
  icon: 'star',
  is_active: true,
})
const valueFormErrors = ref<Record<string, string>>({})

// History state
const showHistoryModal = ref(false)
const selectedHistoryItem = ref<{ id: string, name: string } | null>(null)
const historyItems = ref<EditorialHistoryRead[]>([])
const isLoadingHistory = ref(false)

// Category ID (nécessaire pour créer des contenus)
const categoryId = ref<string | null>(null)

// Statistics
const globalStats = ref<EditorialValuesStats>({
  sections_count: 0,
  core_values_count: 0,
  active_core_values: 0,
  last_updated: null,
})

// === METHODS ===

// Initialisation
onMounted(() => {
  loadData()
  if (frontOfficePages.length > 0) {
    selectedPage.value = frontOfficePages[0] ?? null
  }
})

async function loadData() {
  isLoading.value = true
  error.value = null

  try {
    // Charger la catégorie pour obtenir son ID
    const category = await getValuesCategory()
    if (category) {
      categoryId.value = category.id
    }

    // Charger tous les contenus éditoriaux (limit max 100 côté backend)
    const contentsResponse = await listContents({ limit: 100 })
    allContents.value = new Map(
      contentsResponse.items.map(c => [c.key, c]),
    )

    // Charger les valeurs fondamentales et stats
    const [valuesData, statsData] = await Promise.all([
      getCoreValues(true),
      getValuesStats(),
    ])

    coreValues.value = valuesData
    globalStats.value = statsData
  }
  catch (err) {
    console.error('Erreur chargement des données:', err)
    error.value = 'Erreur lors du chargement des données'
  }
  finally {
    isLoading.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
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

// Show success message
function showSuccess(message: string) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

// === PAGE SECTIONS METHODS ===

const toggleSection = (sectionId: string) => {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId)
  }
  else {
    expandedSections.value.add(sectionId)
  }
}

const isSectionExpanded = (sectionId: string) => {
  return expandedSections.value.has(sectionId)
}

// Compte les champs éditables
const countEditableFields = (pageSection: PageSection) => {
  return pageSection.fields.filter(f => f.editable).length
}

// Récupère la valeur actuelle d'un champ
const getFieldValue = (field: PageSectionField): string => {
  if (!field.editorialKey) return ''
  const content = allContents.value.get(field.editorialKey)
  return content?.value || ''
}

// Vérifie si un champ a une valeur
const hasFieldValue = (field: PageSectionField): boolean => {
  return !!getFieldValue(field)
}

// === FIELD EDITING METHODS ===

function startEditingField(field: PageSectionField) {
  if (!field.editorialKey) return
  editingFieldKey.value = field.editorialKey
  editingFieldValue.value = getFieldValue(field)
  editingFieldType.value = field.type === 'number' ? 'number' : field.type === 'textarea' || field.type === 'html' ? 'textarea' : 'text'
  // Type pour le backend (text, number, html)
  editingFieldValueType.value = field.type === 'number' ? 'number' : field.type === 'html' ? 'html' : 'text'
}

function cancelEditingField() {
  editingFieldKey.value = null
  editingFieldValue.value = ''
  editingFieldValueType.value = 'text'
}

async function saveField() {
  if (!editingFieldKey.value || !categoryId.value) return

  isSaving.value = true
  error.value = null

  try {
    const existingContent = allContents.value.get(editingFieldKey.value)
    // Toujours convertir la valeur en string (le backend attend une string)
    const valueAsString = String(editingFieldValue.value)

    if (existingContent) {
      // Mettre à jour le contenu existant
      const updated = await updateContent(existingContent.id, {
        value: valueAsString,
        value_type: editingFieldValueType.value,
      })
      allContents.value.set(editingFieldKey.value, updated)
    }
    else {
      // Créer un nouveau contenu
      const result = await createContent({
        key: editingFieldKey.value,
        value: valueAsString,
        value_type: editingFieldValueType.value,
        category_id: categoryId.value,
        description: editingFieldKey.value,
        admin_editable: true,
      })

      // Recharger le contenu créé
      try {
        const newContent = await getContentByKey(editingFieldKey.value)
        allContents.value.set(editingFieldKey.value, newContent)
      }
      catch {
        // Si on ne peut pas recharger, on met à jour avec les infos minimales
        allContents.value.set(editingFieldKey.value, {
          id: result.id,
          key: editingFieldKey.value,
          value: valueAsString,
          value_type: editingFieldValueType.value,
          category_id: categoryId.value,
          description: editingFieldKey.value,
          admin_editable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }

    // Rafraîchir les stats
    globalStats.value = await getValuesStats()

    showSuccess('Champ enregistré avec succès')
    editingFieldKey.value = null
    editingFieldValue.value = ''
    editingFieldValueType.value = 'text'
  }
  catch (err) {
    console.error('Erreur sauvegarde champ:', err)
    error.value = 'Erreur lors de la sauvegarde'
  }
  finally {
    isSaving.value = false
  }
}

// === FIELD HISTORY ===

async function openFieldHistory(field: PageSectionField) {
  if (!field.editorialKey) return

  const content = allContents.value.get(field.editorialKey)
  if (!content) return

  selectedHistoryItem.value = {
    id: content.id,
    name: field.label,
  }
  showHistoryModal.value = true
  isLoadingHistory.value = true

  try {
    historyItems.value = await getContentHistory(content.id)
  }
  catch (err) {
    console.error('Erreur chargement historique:', err)
    historyItems.value = []
  }
  finally {
    isLoadingHistory.value = false
  }
}

// === CORE VALUES METHODS ===

const resetValueForm = () => {
  valueForm.value = {
    title: '',
    description: '',
    icon: 'star',
    is_active: true,
  }
  valueFormErrors.value = {}
}

async function validateValueForm(): Promise<boolean> {
  valueFormErrors.value = {}

  if (!valueForm.value.title.trim()) {
    valueFormErrors.value.title = 'Le titre est requis'
  }
  else if (!validateCoreValueTitle(valueForm.value.title)) {
    valueFormErrors.value.title = 'Le titre doit contenir entre 2 et 50 caractères'
  }
  else {
    const isTaken = await apiIsCoreValueTitleTaken(valueForm.value.title, editingValue.value?.id)
    if (isTaken) {
      valueFormErrors.value.title = 'Ce titre est déjà utilisé'
    }
  }

  if (!valueForm.value.description.trim()) {
    valueFormErrors.value.description = 'La description est requise'
  }
  else if (!validateCoreValueDescription(valueForm.value.description)) {
    valueFormErrors.value.description = 'La description doit contenir entre 10 et 500 caractères'
  }

  return Object.keys(valueFormErrors.value).length === 0
}

const openAddValueModal = () => {
  editingValue.value = null
  resetValueForm()
  showValueModal.value = true
}

const openEditValueModal = (value: CoreValue) => {
  editingValue.value = value
  valueForm.value = {
    title: value.title,
    description: value.description,
    icon: value.icon,
    is_active: value.is_active,
  }
  valueFormErrors.value = {}
  showValueModal.value = true
}

const openDeleteValueModal = (value: CoreValue) => {
  valueToDelete.value = value
  showDeleteModal.value = true
}

async function saveValue() {
  const isValid = await validateValueForm()
  if (!isValid) return

  isSaving.value = true
  error.value = null

  try {
    if (editingValue.value) {
      const updated = await apiUpdateCoreValue(editingValue.value.id, {
        title: valueForm.value.title,
        description: valueForm.value.description,
        icon: valueForm.value.icon,
        is_active: valueForm.value.is_active,
      })

      const index = coreValues.value.findIndex(v => v.id === editingValue.value?.id)
      if (index !== -1) {
        coreValues.value[index] = updated
      }
    }
    else {
      if (!categoryId.value) {
        error.value = 'Catégorie non trouvée'
        return
      }

      const nextOrder = await getNextCoreValueOrder()
      const newValue = await apiCreateCoreValue(
        {
          title: valueForm.value.title,
          description: valueForm.value.description,
          icon: valueForm.value.icon,
          display_order: nextOrder,
          is_active: valueForm.value.is_active,
        },
        categoryId.value,
      )

      coreValues.value.push(newValue)
      coreValues.value.sort((a, b) => a.display_order - b.display_order)
    }

    globalStats.value = await getValuesStats()
    showValueModal.value = false
    editingValue.value = null
    resetValueForm()
    showSuccess('Valeur enregistrée avec succès')
  }
  catch (err) {
    console.error('Erreur sauvegarde valeur:', err)
    error.value = 'Erreur lors de la sauvegarde'
  }
  finally {
    isSaving.value = false
  }
}

async function deleteValue() {
  if (!valueToDelete.value) return

  isSaving.value = true
  error.value = null

  try {
    await apiDeleteCoreValue(valueToDelete.value.id)
    coreValues.value = coreValues.value.filter(v => v.id !== valueToDelete.value?.id)
    globalStats.value = await getValuesStats()
    showDeleteModal.value = false
    valueToDelete.value = null
    showSuccess('Valeur supprimée avec succès')
  }
  catch (err) {
    console.error('Erreur suppression valeur:', err)
    error.value = 'Erreur lors de la suppression'
  }
  finally {
    isSaving.value = false
  }
}

async function moveValue(index: number, direction: 'up' | 'down') {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= coreValues.value.length) return

  const items = [...coreValues.value]
  const temp = items[index]
  const swap = items[newIndex]
  if (!temp || !swap) return
  items[index] = swap
  items[newIndex] = temp

  items.forEach((item, i) => {
    item.display_order = i + 1
  })
  coreValues.value = items

  try {
    const valueToMove = coreValues.value[newIndex]
    const swappedValue = coreValues.value[index]

    if (valueToMove && swappedValue) {
      await Promise.all([
        apiUpdateCoreValue(valueToMove.id, { display_order: valueToMove.display_order }),
        apiUpdateCoreValue(swappedValue.id, { display_order: swappedValue.display_order }),
      ])
    }
  }
  catch (err) {
    console.error('Erreur réorganisation:', err)
    await loadData()
  }
}

async function openValueHistory(value: CoreValue) {
  selectedHistoryItem.value = {
    id: value.id,
    name: value.title,
  }
  showHistoryModal.value = true
  isLoadingHistory.value = true

  try {
    historyItems.value = await getContentHistory(value.id)
  }
  catch (err) {
    console.error('Erreur chargement historique:', err)
    historyItems.value = []
  }
  finally {
    isLoadingHistory.value = false
  }
}

function closeHistoryModal() {
  showHistoryModal.value = false
  selectedHistoryItem.value = null
  historyItems.value = []
}

function closeModals() {
  showValueModal.value = false
  showDeleteModal.value = false
  showHistoryModal.value = false
  editingValue.value = null
  valueToDelete.value = null
  selectedHistoryItem.value = null
  resetValueForm()
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Contenus éditoriaux
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les contenus des pages du site par section
        </p>
      </div>
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

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-center gap-3">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="h-5 w-5 text-red-600 dark:text-red-400" />
        <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        <button
          class="ml-auto text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
          @click="loadData"
        >
          Réessayer
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Statistics cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon :icon="['fas', 'file-alt']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ allContents.size }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Contenus définis</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'star']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.core_values_count }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Valeurs fondamentales</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.active_core_values }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Valeurs actives</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ globalStats.last_updated ? formatDateShort(globalStats.last_updated) : '-' }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          <button
            class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
            :class="activeTab === 'pages'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = 'pages'"
          >
            <font-awesome-icon :icon="['fas', 'sitemap']" class="mr-2 h-4 w-4" />
            Par page du site
          </button>
          <button
            class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
            :class="activeTab === 'values'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = 'values'"
          >
            <font-awesome-icon :icon="['fas', 'star']" class="mr-2 h-4 w-4" />
            Valeurs fondamentales
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              {{ coreValues.length }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Pages Tab -->
      <div v-if="activeTab === 'pages'" class="space-y-6">
        <!-- Page selector -->
        <div v-if="frontOfficePages.length > 1" class="flex gap-2 flex-wrap">
          <button
            v-for="page in frontOfficePages"
            :key="page.id"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
            :class="selectedPage?.id === page.id
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
            @click="selectedPage = page"
          >
            <font-awesome-icon :icon="['fas', page.icon]" class="h-4 w-4" />
            {{ page.name }}
          </button>
        </div>

        <!-- Selected page info -->
        <div v-if="selectedPage" class="space-y-4">
          <div class="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
                <font-awesome-icon :icon="['fas', selectedPage.icon]" class="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 class="font-semibold text-primary-900 dark:text-primary-100">{{ selectedPage.name }}</h3>
                <p class="text-sm text-primary-700 dark:text-primary-300">{{ selectedPage.description }}</p>
                <p class="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  URL : <code class="bg-primary-100 dark:bg-primary-900/40 px-1 rounded">{{ selectedPage.slug }}</code>
                </p>
              </div>
            </div>
          </div>

          <!-- Sections list -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Sections de la page
            </h3>

            <div class="space-y-3">
              <div
                v-for="pageSection in selectedPage.sections"
                :key="pageSection.id"
                class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden"
              >
                <!-- Section header -->
                <button
                  class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  @click="toggleSection(pageSection.id)"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-lg"
                      :class="pageSection.color"
                    >
                      <font-awesome-icon :icon="['fas', pageSection.icon]" class="h-5 w-5" />
                    </div>
                    <div>
                      <h4 class="font-medium text-gray-900 dark:text-white">{{ pageSection.name }}</h4>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ pageSection.description }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {{ countEditableFields(pageSection) }} champ(s)
                    </span>
                    <font-awesome-icon
                      :icon="['fas', isSectionExpanded(pageSection.id) ? 'chevron-up' : 'chevron-down']"
                      class="h-4 w-4 text-gray-400"
                    />
                  </div>
                </button>

                <!-- Section content (expanded) -->
                <div
                  v-if="isSectionExpanded(pageSection.id)"
                  class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50"
                >
                  <div class="space-y-3">
                    <div
                      v-for="field in pageSection.fields"
                      :key="field.key"
                      class="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <!-- Field header -->
                      <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-gray-900 dark:text-white text-sm">{{ field.label }}</span>
                          <span
                            v-if="hasFieldValue(field)"
                            class="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          >
                            Défini
                          </span>
                          <span
                            v-else
                            class="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            Non défini
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <button
                            v-if="hasFieldValue(field)"
                            class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Historique"
                            @click="openFieldHistory(field)"
                          >
                            <font-awesome-icon :icon="['fas', 'history']" class="h-3.5 w-3.5" />
                          </button>
                          <button
                            v-if="editingFieldKey !== field.editorialKey"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                            @click="startEditingField(field)"
                          >
                            <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3" />
                            Modifier
                          </button>
                        </div>
                      </div>

                      <!-- Field content / Edit form -->
                      <div class="p-3">
                        <!-- Editing mode -->
                        <div v-if="editingFieldKey === field.editorialKey" class="space-y-3">
                          <div>
                            <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                              {{ field.description }}
                            </label>
                            <input
                              v-if="editingFieldType === 'text' || editingFieldType === 'number'"
                              v-model="editingFieldValue"
                              :type="editingFieldType"
                              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              :placeholder="field.label"
                            />
                            <textarea
                              v-else
                              v-model="editingFieldValue"
                              rows="4"
                              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              :placeholder="field.label"
                            />
                          </div>
                          <div class="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                              :disabled="isSaving"
                              @click="cancelEditingField"
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              class="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                              :disabled="isSaving"
                              @click="saveField"
                            >
                              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-3 w-3 animate-spin" />
                              <font-awesome-icon v-else :icon="['fas', 'save']" class="h-3 w-3" />
                              Enregistrer
                            </button>
                          </div>
                        </div>

                        <!-- Display mode -->
                        <div v-else>
                          <p v-if="hasFieldValue(field)" class="text-sm text-gray-700 dark:text-gray-300">
                            {{ getFieldValue(field) }}
                          </p>
                          <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
                            Aucune valeur définie. Cliquez sur "Modifier" pour ajouter du contenu.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Core Values Tab -->
      <div v-if="activeTab === 'values'" class="space-y-6">
        <!-- Add button -->
        <div class="flex justify-end">
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            @click="openAddValueModal"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
            Ajouter une valeur
          </button>
        </div>

        <!-- Values list -->
        <div v-if="coreValues.length === 0" class="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <font-awesome-icon :icon="['fas', 'star']" class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            Aucune valeur fondamentale
          </h3>
          <p class="mb-6 text-gray-500 dark:text-gray-400">
            Commencez par ajouter vos valeurs fondamentales.
          </p>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
            @click="openAddValueModal"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
            Ajouter une valeur
          </button>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(value, index) in coreValues"
            :key="value.id"
            class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            :class="{ 'opacity-60': !value.is_active }"
          >
            <div class="flex items-start gap-4">
              <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <font-awesome-icon :icon="['fas', value.icon]" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ value.title }}
                  </h3>
                  <span
                    v-if="!value.is_active"
                    class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  >
                    Inactif
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ value.description }}
                </p>
                <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Modifié le {{ formatDateShort(value.updated_at) }}
                </p>
              </div>

              <div class="flex items-center gap-1">
                <button
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Monter"
                  :disabled="index === 0"
                  @click="moveValue(index, 'up')"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-4 w-4" />
                </button>
                <button
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Descendre"
                  :disabled="index === coreValues.length - 1"
                  @click="moveValue(index, 'down')"
                >
                  <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-4 w-4" />
                </button>
                <button
                  class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Historique"
                  @click="openValueHistory(value)"
                >
                  <font-awesome-icon :icon="['fas', 'history']" class="h-4 w-4" />
                </button>
                <button
                  class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Modifier"
                  @click="openEditValueModal(value)"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                </button>
                <button
                  class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Supprimer"
                  @click="openDeleteValueModal(value)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal: Add/Edit Value -->
    <Teleport to="body">
      <div
        v-if="showValueModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingValue ? 'Modifier la valeur' : 'Ajouter une valeur' }}
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="space-y-4 p-6" @submit.prevent="saveValue">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre *
              </label>
              <input
                v-model="valueForm.title"
                type="text"
                placeholder="ex: Excellence"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': valueFormErrors.title }"
              />
              <p v-if="valueFormErrors.title" class="mt-1 text-sm text-red-500">
                {{ valueFormErrors.title }}
              </p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                v-model="valueForm.description"
                rows="4"
                placeholder="Description de la valeur..."
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :class="{ 'border-red-500': valueFormErrors.description }"
              />
              <p v-if="valueFormErrors.description" class="mt-1 text-sm text-red-500">
                {{ valueFormErrors.description }}
              </p>
              <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ valueForm.description.length }}/500 caractères
              </p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Icône
              </label>
              <div class="grid grid-cols-8 gap-2">
                <button
                  v-for="iconOption in coreValueAvailableIcons"
                  :key="iconOption.value"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors"
                  :class="valueForm.icon === iconOption.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-400'"
                  :title="iconOption.label"
                  @click="valueForm.icon = iconOption.value"
                >
                  <font-awesome-icon :icon="['fas', iconOption.value]" class="h-5 w-5" />
                </button>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <input
                id="is_active"
                v-model="valueForm.is_active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 bg-white text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label for="is_active" class="text-sm text-gray-700 dark:text-gray-300">
                Valeur active (visible sur le site public)
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                {{ editingValue ? 'Enregistrer' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Delete Confirmation -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && valueToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer cette valeur ?
            </h3>
            <p class="mb-6 text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer la valeur
              <span class="font-medium text-gray-700 dark:text-gray-300">« {{ valueToDelete.title }} »</span> ?
              Cette action est irréversible.
            </p>
            <div class="flex justify-center gap-3">
              <button
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
                @click="deleteValue"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: History -->
    <Teleport to="body">
      <div
        v-if="showHistoryModal && selectedHistoryItem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeHistoryModal"
      >
        <div class="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Historique des modifications
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedHistoryItem.name }}
              </p>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeHistoryModal"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div v-if="isLoadingHistory" class="flex items-center justify-center py-8">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-6 w-6 animate-spin text-gray-400" />
            </div>

            <div v-else-if="historyItems.length === 0" class="py-8 text-center">
              <font-awesome-icon :icon="['fas', 'history']" class="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p class="text-gray-500 dark:text-gray-400">
                Aucune modification enregistrée
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(entry, index) in historyItems"
                :key="entry.id"
                class="relative pb-4 pl-6"
                :class="{ 'border-l-2 border-gray-200 dark:border-gray-700': index < historyItems.length - 1 }"
              >
                <div class="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(entry.modified_at) }}
                    </span>
                  </div>
                  <div class="text-sm">
                    <p v-if="entry.old_value" class="text-gray-500 dark:text-gray-400 line-clamp-2">
                      {{ truncateText(entry.old_value, 100) }}
                    </p>
                    <p v-else class="text-gray-400 dark:text-gray-500 italic">
                      (vide)
                    </p>
                    <font-awesome-icon :icon="['fas', 'arrow-down']" class="my-1 h-3 w-3 text-gray-400" />
                    <p v-if="entry.new_value" class="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {{ truncateText(entry.new_value, 100) }}
                    </p>
                    <p v-else class="text-gray-400 dark:text-gray-500 italic">
                      (vide)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <button
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
              @click="closeHistoryModal"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
