<script setup lang="ts">
import type { ProgramFieldRead } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

// API composables
const {
  listFields,
  createField: apiCreateField,
  updateField: apiUpdateField,
  deleteField: apiDeleteField,
  reorderFields: apiReorderFields,
} = useProgramFieldsApi()

// === STATE ===
const loading = ref(true)
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const fields = ref<ProgramFieldRead[]>([])
const totalItems = ref(0)

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingField = ref<ProgramFieldRead | null>(null)
const deletingField = ref<ProgramFieldRead | null>(null)

// Form state
const newField = ref({
  name: '',
  slug: '',
  description: '',
})

// Drag & Drop
const draggedIndex = ref<number | null>(null)

// === DATA LOADING ===
async function loadFields() {
  loading.value = true
  error.value = null
  try {
    const response = await listFields({ limit: 100 })
    fields.value = response.items.sort((a, b) => a.display_order - b.display_order)
    totalItems.value = response.total
  }
  catch (e) {
    error.value = 'Erreur lors du chargement des champs'
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

onMounted(loadFields)

// === HELPERS ===
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Auto-génération du slug
watch(() => newField.value.name, (newName) => {
  newField.value.slug = generateSlug(newName)
})

// === MODALS ===
function openAddModal() {
  newField.value = { name: '', slug: '', description: '' }
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  newField.value = { name: '', slug: '', description: '' }
}

function openEditModal(field: ProgramFieldRead) {
  editingField.value = { ...field }
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingField.value = null
}

function openDeleteModal(field: ProgramFieldRead) {
  deletingField.value = field
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletingField.value = null
}

// === CRUD ===
async function handleCreate() {
  if (!newField.value.name.trim()) return

  isSubmitting.value = true
  try {
    await apiCreateField({
      name: newField.value.name,
      slug: newField.value.slug || generateSlug(newField.value.name),
      description: newField.value.description || undefined,
      display_order: fields.value.length,
    })
    closeAddModal()
    await loadFields()
  }
  catch (e: unknown) {
    console.error('Erreur création champ:', e)
    const fetchError = e as { data?: { detail?: string } }
    const detail = fetchError.data?.detail || 'Erreur lors de la création du champ'
    alert(detail)
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleUpdate() {
  if (!editingField.value) return

  isSubmitting.value = true
  try {
    await apiUpdateField(editingField.value.id, {
      name: editingField.value.name,
      slug: editingField.value.slug,
      description: editingField.value.description || undefined,
    })
    closeEditModal()
    await loadFields()
  }
  catch (e: unknown) {
    console.error('Erreur mise à jour champ:', e)
    const fetchError = e as { data?: { detail?: string } }
    const detail = fetchError.data?.detail || 'Erreur lors de la mise à jour du champ'
    alert(detail)
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  if (!deletingField.value) return

  isSubmitting.value = true
  try {
    await apiDeleteField(deletingField.value.id)
    closeDeleteModal()
    await loadFields()
  }
  catch (e) {
    console.error('Erreur suppression champ:', e)
    alert('Erreur lors de la suppression du champ')
  }
  finally {
    isSubmitting.value = false
  }
}

// === DRAG & DROP ===
function onDragStart(index: number) {
  draggedIndex.value = index
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

async function onDrop(e: DragEvent, targetIndex: number) {
  e.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) return

  const newFields = [...fields.value]
  const [draggedField] = newFields.splice(draggedIndex.value, 1)
  newFields.splice(targetIndex, 0, draggedField)
  fields.value = newFields

  const fieldIds = newFields.map(f => f.id)
  try {
    await apiReorderFields(fieldIds)
    await loadFields()
  }
  catch (e) {
    console.error('Erreur lors de la réorganisation:', e)
    await loadFields()
  }
  finally {
    draggedIndex.value = null
  }
}

function onDragEnd() {
  draggedIndex.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Champs disciplinaires
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les domaines thématiques des formations certifiantes
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openAddModal"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Nouveau champ
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalItems }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Champs actifs</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ fields.length }}</p>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-blue-600" />
        <span class="text-gray-600 dark:text-gray-400">Chargement des champs...</span>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
      <div class="flex items-center gap-3">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-5 w-5 text-red-500" />
        <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        <button
          class="ml-auto text-sm text-red-600 hover:underline dark:text-red-400"
          @click="loadFields"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- Liste des champs -->
    <template v-else>
      <!-- État vide -->
      <div
        v-if="fields.length === 0"
        class="flex flex-col items-center justify-center rounded-lg bg-white py-12 shadow dark:bg-gray-800"
      >
        <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
          <font-awesome-icon icon="fa-solid fa-layer-group" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
          Aucun champ disciplinaire
        </h3>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Créez des champs pour organiser vos formations certifiantes.
        </p>
        <button
          class="text-sm text-blue-600 hover:underline dark:text-blue-400"
          @click="openAddModal"
        >
          Créer le premier champ
        </button>
      </div>

      <!-- Liste -->
      <div v-else class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">
          <font-awesome-icon icon="fa-solid fa-grip-vertical" class="mr-1 h-3 w-3" />
          Glissez-déposez pour réorganiser l'ordre d'affichage
        </p>

        <div class="space-y-2">
          <div
            v-for="(field, index) in fields"
            :key="field.id"
            class="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all dark:border-gray-700 dark:bg-gray-700/50"
            :class="{ 'opacity-50': draggedIndex === index }"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover="onDragOver"
            @drop="(e) => onDrop(e, index)"
            @dragend="onDragEnd"
          >
            <!-- Poignée -->
            <div class="cursor-grab text-gray-400 active:cursor-grabbing">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
            </div>

            <!-- Numéro -->
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {{ index + 1 }}
            </div>

            <!-- Contenu -->
            <div class="min-w-0 flex-1">
              <p class="font-medium text-gray-900 dark:text-white">{{ field.name }}</p>
              <p v-if="field.description" class="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
                {{ field.description }}
              </p>
              <p class="mt-0.5 font-mono text-xs text-gray-400 dark:text-gray-500">
                {{ field.slug }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 gap-1">
              <button
                type="button"
                class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                title="Modifier"
                @click="openEditModal(field)"
              >
                <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                title="Supprimer"
                @click="openDeleteModal(field)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>
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
              Nouveau champ disciplinaire
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="handleCreate">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du champ *
              </label>
              <input
                v-model="newField.name"
                type="text"
                required
                placeholder="Ex: Santé, Éducation, Management..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug
              </label>
              <input
                v-model="newField.slug"
                type="text"
                placeholder="sante"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
              <p class="mt-1 text-xs text-gray-500">Auto-généré depuis le nom</p>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newField.description"
                rows="3"
                placeholder="Description du champ disciplinaire..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmitting"
                @click="closeAddModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSubmitting"
              >
                <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmitting ? 'Création...' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && editingField"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le champ
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="handleUpdate">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom du champ *
              </label>
              <input
                v-model="editingField.name"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug
              </label>
              <input
                v-model="editingField.slug"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingField.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmitting"
                @click="closeEditModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSubmitting"
              >
                <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingField"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le champ
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce champ disciplinaire ?
          </p>
          <p class="mb-4 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingField.name }}
          </p>

          <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div class="text-sm text-amber-800 dark:text-amber-300">
                <p>Les certificats utilisant ce champ ne seront pas supprimés, mais leur champ sera retiré.</p>
                <p class="mt-1 text-amber-700 dark:text-amber-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isSubmitting"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isSubmitting"
              @click="handleDelete"
            >
              <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmitting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
