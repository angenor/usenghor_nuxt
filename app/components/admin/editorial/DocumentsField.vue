<script setup lang="ts">
import type { PageSectionField } from '~/composables/editorial-pages-config'

interface FoundingDocument {
  id: string
  title_fr: string
  title_en?: string
  description_fr?: string
  file_url: string
  year?: number
  file_size?: number
  cover_image?: string
  sort_order: number
}

const props = defineProps<{
  field: PageSectionField
  value: string
  isEditing: boolean
  isSaving: boolean
}>()

const emit = defineEmits<{
  edit: []
  save: [value: string, valueType: 'text' | 'number' | 'html']
  cancel: []
  history: []
}>()

// === STATE ===

const documents = ref<FoundingDocument[]>([])
const editingDocId = ref<string | null>(null)
const isAddingNew = ref(false)

// Formulaire temporaire pour ajout/édition
const formData = ref<Partial<FoundingDocument>>({})

// === COMPUTED ===

const hasValue = computed(() => {
  return documents.value.length > 0
})

const sortedDocuments = computed(() => {
  return [...documents.value].sort((a, b) => a.sort_order - b.sort_order)
})

// === WATCHERS ===

watch(() => props.value, (val) => {
  parseDocuments(val)
}, { immediate: true })

// === METHODS ===

function parseDocuments(val: string) {
  if (!val) {
    documents.value = []
    return
  }
  try {
    const parsed = JSON.parse(val)
    documents.value = Array.isArray(parsed) ? parsed : []
  }
  catch {
    documents.value = []
  }
}

function startEditing() {
  emit('edit')
}

function cancel() {
  // Restaurer depuis la valeur prop
  parseDocuments(props.value)
  editingDocId.value = null
  isAddingNew.value = false
  formData.value = {}
  emit('cancel')
}

function save() {
  const sorted = [...documents.value].sort((a, b) => a.sort_order - b.sort_order)
  emit('save', JSON.stringify(sorted), 'text')
}

// --- CRUD Documents ---

function startAddDocument() {
  editingDocId.value = null
  isAddingNew.value = true
  formData.value = {
    title_fr: '',
    title_en: '',
    description_fr: '',
    file_url: '',
    year: undefined,
    file_size: undefined,
    cover_image: '',
  }
}

function startEditDocument(doc: FoundingDocument) {
  isAddingNew.value = false
  editingDocId.value = doc.id
  formData.value = { ...doc }
}

function cancelDocForm() {
  editingDocId.value = null
  isAddingNew.value = false
  formData.value = {}
}

function confirmAddDocument() {
  if (!formData.value.title_fr || !formData.value.file_url) return

  const newDoc: FoundingDocument = {
    id: self.crypto?.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join(''),
    title_fr: formData.value.title_fr!,
    title_en: formData.value.title_en || undefined,
    description_fr: formData.value.description_fr || undefined,
    file_url: formData.value.file_url!,
    year: formData.value.year || undefined,
    file_size: formData.value.file_size || undefined,
    cover_image: formData.value.cover_image || undefined,
    sort_order: documents.value.length + 1,
  }

  documents.value.push(newDoc)
  cancelDocForm()
}

function confirmEditDocument() {
  if (!editingDocId.value || !formData.value.title_fr || !formData.value.file_url) return

  const index = documents.value.findIndex(d => d.id === editingDocId.value)
  if (index === -1) return

  const existing = documents.value[index]!
  documents.value[index] = {
    id: existing.id,
    sort_order: existing.sort_order,
    title_fr: formData.value.title_fr!,
    title_en: formData.value.title_en || undefined,
    description_fr: formData.value.description_fr || undefined,
    file_url: formData.value.file_url!,
    year: formData.value.year || undefined,
    file_size: formData.value.file_size || undefined,
    cover_image: formData.value.cover_image || undefined,
  }

  cancelDocForm()
}

function deleteDocument(id: string) {
  documents.value = documents.value.filter(d => d.id !== id)
  // Recalculer sort_order
  documents.value.forEach((d, i) => {
    d.sort_order = i + 1
  })
}

function moveUp(index: number) {
  if (index <= 0) return
  const sorted = sortedDocuments.value
  const current = sorted[index]
  const prev = sorted[index - 1]
  if (!current || !prev) return
  const tmpOrder = current.sort_order
  current.sort_order = prev.sort_order
  prev.sort_order = tmpOrder
}

function moveDown(index: number) {
  const sorted = sortedDocuments.value
  if (index >= sorted.length - 1) return
  const current = sorted[index]
  const next = sorted[index + 1]
  if (!current || !next) return
  const tmpOrder = current.sort_order
  current.sort_order = next.sort_order
  next.sort_order = tmpOrder
}

function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<template>
  <div class="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Field header -->
    <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'file-pdf']" class="h-4 w-4 text-red-500" />
        <span class="font-medium text-gray-900 dark:text-white text-sm">{{ field.label }}</span>
        <span
          v-if="hasValue"
          class="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        >
          {{ documents.length }} document{{ documents.length > 1 ? 's' : '' }}
        </span>
        <span
          v-else
          class="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Aucun document
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="hasValue"
          class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title="Historique"
          @click="emit('history')"
        >
          <font-awesome-icon :icon="['fas', 'history']" class="h-3.5 w-3.5" />
        </button>
        <button
          v-if="!isEditing"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          @click="startEditing"
        >
          <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3" />
          Gérer
        </button>
      </div>
    </div>

    <!-- Field content -->
    <div class="p-3">
      <!-- === EDITING MODE === -->
      <div v-if="isEditing" class="space-y-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ field.description }}
        </p>

        <!-- Documents list -->
        <div v-if="sortedDocuments.length > 0" class="space-y-2">
          <div
            v-for="(doc, index) in sortedDocuments"
            :key="doc.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
          >
            <!-- Icône PDF -->
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'file-pdf']" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <!-- Infos document -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ doc.title_fr }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <span v-if="doc.year">{{ doc.year }}</span>
                <span v-if="doc.year && doc.file_size"> &middot; </span>
                <span v-if="doc.file_size">{{ formatFileSize(doc.file_size) }}</span>
                <span v-if="!doc.year && !doc.file_size" class="italic">Pas de détails</span>
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Monter"
                :disabled="index === 0"
                @click="moveUp(index)"
              >
                <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Descendre"
                :disabled="index === sortedDocuments.length - 1"
                @click="moveDown(index)"
              >
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Modifier"
                @click="startEditDocument(doc)"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Supprimer"
                @click="deleteDocument(doc.id)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="flex items-center justify-center py-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
        >
          <div class="text-center">
            <font-awesome-icon :icon="['fas', 'file-pdf']" class="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Aucun document. Cliquez sur « Ajouter » ci-dessous.
            </p>
          </div>
        </div>

        <!-- Add/Edit form -->
        <div
          v-if="isAddingNew || editingDocId"
          class="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3"
        >
          <h5 class="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {{ editingDocId ? 'Modifier le document' : 'Ajouter un document' }}
          </h5>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Titre FR -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Titre (français) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title_fr"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Convention portant création..."
              />
            </div>

            <!-- Titre EN -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Titre (anglais)
              </label>
              <input
                v-model="formData.title_en"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Convention establishing..."
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Description
            </label>
            <textarea
              v-model="formData.description_fr"
              rows="2"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Brève description du document..."
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- URL du fichier -->
            <div class="sm:col-span-2">
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                URL du fichier <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.file_url"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="/documents/fichier.pdf"
              />
            </div>

            <!-- Année -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Année
              </label>
              <input
                v-model.number="formData.year"
                type="number"
                min="1900"
                max="2100"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="2024"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Taille du fichier -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Taille du fichier (octets)
              </label>
              <input
                v-model.number="formData.file_size"
                type="number"
                min="0"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="2500000"
              />
            </div>

            <!-- Image de couverture -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Image de couverture (URL)
              </label>
              <input
                v-model="formData.cover_image"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <!-- Form actions -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              @click="cancelDocForm"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              :disabled="!formData.title_fr || !formData.file_url"
              @click="editingDocId ? confirmEditDocument() : confirmAddDocument()"
            >
              <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3" />
              {{ editingDocId ? 'Valider' : 'Ajouter' }}
            </button>
          </div>
        </div>

        <!-- Bottom actions -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            v-if="!isAddingNew && !editingDocId"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            @click="startAddDocument"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3" />
            Ajouter un document
          </button>
          <div v-else />

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              :disabled="isSaving"
              @click="cancel"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              :disabled="isSaving || isAddingNew || !!editingDocId"
              @click="save"
            >
              <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-3 w-3 animate-spin" />
              <font-awesome-icon v-else :icon="['fas', 'save']" class="h-3 w-3" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <!-- === DISPLAY MODE === -->
      <div v-else>
        <div v-if="sortedDocuments.length > 0" class="space-y-1.5">
          <div
            v-for="doc in sortedDocuments"
            :key="doc.id"
            class="flex items-center gap-2 text-sm"
          >
            <font-awesome-icon :icon="['fas', 'file-pdf']" class="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            <span class="text-gray-700 dark:text-gray-300 truncate">{{ doc.title_fr }}</span>
            <span v-if="doc.year" class="text-xs text-gray-400 dark:text-gray-500">({{ doc.year }})</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
          Aucun document défini. Cliquez sur « Gérer » pour ajouter des documents fondateurs.
        </p>
      </div>
    </div>
  </div>
</template>
