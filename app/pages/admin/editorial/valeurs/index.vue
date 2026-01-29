<script setup lang="ts">
import type {
  CoreValue,
  EditorialContentRead,
  EditorialHistoryRead,
  EditorialValuesStats,
} from '~/types/api'
import type { PageSectionField } from '~/composables/useEditorialValuesApi'

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

// Tous les contenus éditoriaux chargés depuis la BDD
const allContents = ref<Map<string, EditorialContentRead>>(new Map())

// Core values state
const coreValues = ref<CoreValue[]>([])
const showValueModal = ref(false)
const showDeleteModal = ref(false)
const editingValue = ref<CoreValue | null>(null)
const valueToDelete = ref<CoreValue | null>(null)

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

onMounted(() => {
  loadData()
})

async function loadData() {
  isLoading.value = true
  error.value = null

  try {
    const category = await getValuesCategory()
    if (category) {
      categoryId.value = category.id
    }

    const contentsResponse = await listContents({ limit: 500 })
    allContents.value = new Map(
      contentsResponse.items.map(c => [c.key, c]),
    )

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

function showSuccess(message: string) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

// === FIELD SAVING ===

async function handleSaveField(key: string, value: string, valueType: 'text' | 'number' | 'html') {
  if (!categoryId.value) return

  isSaving.value = true
  error.value = null

  try {
    let existingContent = allContents.value.get(key)
    const valueAsString = String(value)

    // Si le contenu n'est pas dans le cache local, vérifier s'il existe en BDD
    if (!existingContent) {
      try {
        existingContent = await getContentByKey(key)
        if (existingContent) {
          allContents.value.set(key, existingContent)
        }
      }
      catch {
        // Le contenu n'existe pas en BDD, on va le créer
      }
    }

    if (existingContent) {
      const updated = await updateContent(existingContent.id, {
        value: valueAsString,
        value_type: valueType,
      })
      allContents.value.set(key, updated)
    }
    else {
      const result = await createContent({
        key,
        value: valueAsString,
        value_type: valueType,
        category_id: categoryId.value,
        description: key,
        admin_editable: true,
      })

      try {
        const newContent = await getContentByKey(key)
        allContents.value.set(key, newContent)
      }
      catch {
        allContents.value.set(key, {
          id: result.id,
          key,
          value: valueAsString,
          value_type: valueType,
          category_id: categoryId.value,
          year: null,
          description: key,
          admin_editable: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }

    globalStats.value = await getValuesStats()
    showSuccess('Champ enregistré avec succès')
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

function openAddValueModal() {
  editingValue.value = null
  showValueModal.value = true
}

function openEditValueModal(value: CoreValue) {
  editingValue.value = value
  showValueModal.value = true
}

function openDeleteValueModal(value: CoreValue) {
  valueToDelete.value = value
  showDeleteModal.value = true
}

async function saveValue(data: { title: string, description: string, icon: string, is_active: boolean }) {
  isSaving.value = true
  error.value = null

  try {
    if (editingValue.value) {
      const updated = await apiUpdateCoreValue(editingValue.value.id, data)
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
        { ...data, display_order: nextOrder },
        categoryId.value,
      )

      coreValues.value.push(newValue)
      coreValues.value.sort((a, b) => a.display_order - b.display_order)
    }

    globalStats.value = await getValuesStats()
    showValueModal.value = false
    editingValue.value = null
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

function closeValueModal() {
  showValueModal.value = false
  editingValue.value = null
}

function closeDeleteModal() {
  showDeleteModal.value = false
  valueToDelete.value = null
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
      <AdminEditorialStatsCards
        :contents-count="allContents.size"
        :stats="globalStats"
      />

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
      <AdminEditorialPageSections
        v-if="activeTab === 'pages'"
        :pages="frontOfficePages"
        :all-contents="allContents"
        :is-saving="isSaving"
        @save-field="handleSaveField"
        @open-history="openFieldHistory"
      />

      <!-- Core Values Tab -->
      <AdminEditorialCoreValuesList
        v-if="activeTab === 'values'"
        :values="coreValues"
        @add="openAddValueModal"
        @edit="openEditValueModal"
        @delete="openDeleteValueModal"
        @move="moveValue"
        @history="openValueHistory"
      />
    </template>

    <!-- Modals -->
    <AdminEditorialValueModal
      :show="showValueModal"
      :editing-value="editingValue"
      :is-saving="isSaving"
      :available-icons="coreValueAvailableIcons"
      @close="closeValueModal"
      @save="saveValue"
    />

    <AdminEditorialDeleteModal
      :show="showDeleteModal"
      :value="valueToDelete"
      :is-saving="isSaving"
      @close="closeDeleteModal"
      @confirm="deleteValue"
    />

    <AdminEditorialHistoryModal
      :show="showHistoryModal"
      :item-name="selectedHistoryItem?.name ?? ''"
      :items="historyItems"
      :is-loading="isLoadingHistory"
      @close="closeHistoryModal"
    />
  </div>
</template>
