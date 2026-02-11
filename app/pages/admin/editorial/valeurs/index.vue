<script setup lang="ts">
import type {
  EditorialContentRead,
  EditorialHistoryRead,
  EditorialValuesStats,
} from '~/types/api'
import type { PageSectionField } from '~/composables/editorial-pages-config'

definePageMeta({
  layout: 'admin',
})

const {
  listContents,
  getContentByKey,
  createContent,
  updateContent,
  getValuesCategory,
  getValuesStats,
  getContentHistory,
  frontOfficePages,
} = useEditorialValuesApi()

// Store du front-office pour invalider le cache après sauvegarde
const editorialContentStore = useEditorialContentStore()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Tous les contenus éditoriaux chargés depuis la BDD
const allContents = ref<Map<string, EditorialContentRead>>(new Map())

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

    globalStats.value = await getValuesStats()
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

    // Forcer le type JSON pour les clés stockées en JSON (documents, pays)
    const actualValueType = (key.endsWith('.documents') || key.endsWith('.countries')) ? 'json' as const : valueType

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
        value_type: actualValueType,
      })
      allContents.value.set(key, updated)
    }
    else {
      const result = await createContent({
        key,
        value: valueAsString,
        value_type: actualValueType,
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

    // Invalider le cache du front-office pour que les modifications soient visibles immédiatement
    editorialContentStore.invalidateCache()

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

function closeHistoryModal() {
  showHistoryModal.value = false
  selectedHistoryItem.value = null
  historyItems.value = []
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

      <!-- Pages Sections -->
      <AdminEditorialPageSections
        :pages="frontOfficePages"
        :all-contents="allContents"
        :is-saving="isSaving"
        @save-field="handleSaveField"
        @open-history="openFieldHistory"
      />
    </template>

    <!-- History Modal -->
    <AdminEditorialHistoryModal
      :show="showHistoryModal"
      :item-name="selectedHistoryItem?.name ?? ''"
      :items="historyItems"
      :is-loading="isLoadingHistory"
      @close="closeHistoryModal"
    />
  </div>
</template>
