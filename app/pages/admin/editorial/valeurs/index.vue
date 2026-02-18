<script setup lang="ts">
import type {
  EditorialContentRead,
  EditorialHistoryRead,
  EditorialValuesStats,
  Testimonial,
  TestimonialData,
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
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  getNextTestimonialOrder,
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
  testimonials_count: 0,
  featured_testimonials: 0,
  last_updated: null,
})

// Testimonials state
const testimonials = ref<Testimonial[]>([])
const showTestimonialModal = ref(false)
const editingTestimonial = ref<Testimonial | null>(null)
const showDeleteTestimonialModal = ref(false)
const deletingTestimonial = ref<Testimonial | null>(null)

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

    testimonials.value = await getTestimonials(true)
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

    // Forcer le type JSON pour les clés stockées en JSON (documents, pays, galeries d'images)
    const actualValueType = (key.endsWith('.documents') || key.endsWith('.countries') || key.endsWith('.images')) ? 'json' as const : valueType

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

// === TESTIMONIALS CRUD ===

function handleAddTestimonial() {
  editingTestimonial.value = null
  showTestimonialModal.value = true
}

function handleEditTestimonial(testimonial: Testimonial) {
  editingTestimonial.value = testimonial
  showTestimonialModal.value = true
}

async function handleSaveTestimonial(data: TestimonialData) {
  if (!categoryId.value) return

  isSaving.value = true
  error.value = null

  try {
    if (editingTestimonial.value) {
      await updateTestimonial(editingTestimonial.value.id, data)
      showSuccess('Témoignage modifié avec succès')
    }
    else {
      const nextOrder = await getNextTestimonialOrder()
      await createTestimonial({ ...data, display_order: nextOrder }, categoryId.value)
      showSuccess('Témoignage ajouté avec succès')
    }

    testimonials.value = await getTestimonials(true)
    globalStats.value = await getValuesStats()
    editorialContentStore.invalidateCache()
    showTestimonialModal.value = false
  }
  catch (err) {
    console.error('Erreur sauvegarde témoignage:', err)
    error.value = 'Erreur lors de la sauvegarde du témoignage'
  }
  finally {
    isSaving.value = false
  }
}

function handleRequestDeleteTestimonial(testimonial: Testimonial) {
  deletingTestimonial.value = testimonial
  showDeleteTestimonialModal.value = true
}

async function handleConfirmDeleteTestimonial() {
  if (!deletingTestimonial.value) return

  isSaving.value = true
  error.value = null

  try {
    await deleteTestimonial(deletingTestimonial.value.id)
    testimonials.value = await getTestimonials(true)
    globalStats.value = await getValuesStats()
    editorialContentStore.invalidateCache()
    showDeleteTestimonialModal.value = false
    deletingTestimonial.value = null
    showSuccess('Témoignage supprimé')
  }
  catch (err) {
    console.error('Erreur suppression témoignage:', err)
    error.value = 'Erreur lors de la suppression'
  }
  finally {
    isSaving.value = false
  }
}

async function handleMoveTestimonial(index: number, direction: 'up' | 'down') {
  const items = [...testimonials.value]
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= items.length) return

  const temp = items[index]!
  items[index] = items[targetIndex]!
  items[targetIndex] = temp

  testimonials.value = items

  try {
    await reorderTestimonials(items.map(t => t.id))
    editorialContentStore.invalidateCache()
  }
  catch (err) {
    console.error('Erreur réordonnement:', err)
    testimonials.value = await getTestimonials(true)
  }
}

async function handleTestimonialHistory(testimonial: Testimonial) {
  selectedHistoryItem.value = {
    id: testimonial.id,
    name: `${testimonial.first_name} ${testimonial.last_name}`,
  }
  showHistoryModal.value = true
  isLoadingHistory.value = true

  try {
    historyItems.value = await getContentHistory(testimonial.id)
  }
  catch (err) {
    console.error('Erreur chargement historique:', err)
    historyItems.value = []
  }
  finally {
    isLoadingHistory.value = false
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
      >
        <!-- Témoignages intégrés dans la section Alumni > Témoignages -->
        <template #section-alumni-testimonials>
          <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <AdminEditorialTestimonialsList
              :testimonials="testimonials"
              @add="handleAddTestimonial"
              @edit="handleEditTestimonial"
              @delete="handleRequestDeleteTestimonial"
              @move="handleMoveTestimonial"
              @history="handleTestimonialHistory"
            />
          </div>
        </template>
      </AdminEditorialPageSections>
    </template>

    <!-- Testimonial Modal -->
    <AdminEditorialTestimonialModal
      :show="showTestimonialModal"
      :editing-testimonial="editingTestimonial"
      :is-saving="isSaving"
      @close="showTestimonialModal = false"
      @save="handleSaveTestimonial"
    />

    <!-- Delete Testimonial Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteTestimonialModal && deletingTestimonial"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDeleteTestimonialModal = false"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer ce témoignage ?
            </h3>
            <p class="mb-6 text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer le témoignage de
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ deletingTestimonial.first_name }} {{ deletingTestimonial.last_name }}</span> ?
              Cette action est irréversible.
            </p>
            <div class="flex justify-center gap-3">
              <button
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                @click="showDeleteTestimonialModal = false"
              >
                Annuler
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                :disabled="isSaving"
                @click="handleConfirmDeleteTestimonial"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
