<script setup lang="ts">
import type { PageSectionField } from '~/composables/editorial-pages-config'

interface NavSubItem {
  id: string
  label: string
  route: string
  icon: string
  badge?: string
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

const items = ref<NavSubItem[]>([])
const editingItemId = ref<string | null>(null)
const isAddingNew = ref(false)

// Formulaire temporaire pour ajout/edition
const formData = ref<Partial<NavSubItem>>({})

// === COMPUTED ===

const hasValue = computed(() => items.value.length > 0)

const sortedItems = computed(() =>
  [...items.value].sort((a, b) => a.sort_order - b.sort_order),
)

// === WATCHERS ===

watch(() => props.value, (val) => {
  parseItems(val)
}, { immediate: true })

// === METHODS ===

function parseItems(val: string) {
  if (!val) {
    items.value = []
    return
  }
  try {
    const parsed = JSON.parse(val)
    items.value = Array.isArray(parsed) ? parsed : []
  }
  catch {
    items.value = []
  }
}

function startEditing() {
  emit('edit')
}

function cancel() {
  parseItems(props.value)
  editingItemId.value = null
  isAddingNew.value = false
  formData.value = {}
  emit('cancel')
}

function save() {
  const sorted = [...items.value].sort((a, b) => a.sort_order - b.sort_order)
  emit('save', JSON.stringify(sorted), 'text')
}

// --- CRUD Items ---

function startAddItem() {
  editingItemId.value = null
  isAddingNew.value = true
  formData.value = {
    label: '',
    route: '',
    icon: 'fa-solid fa-link',
    badge: '',
  }
}

function startEditItem(item: NavSubItem) {
  isAddingNew.value = false
  editingItemId.value = item.id
  formData.value = { ...item }
}

function cancelForm() {
  editingItemId.value = null
  isAddingNew.value = false
  formData.value = {}
}

function confirmAddItem() {
  if (!formData.value.label || !formData.value.route) return

  const newItem: NavSubItem = {
    id: self.crypto?.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join(''),
    label: formData.value.label!,
    route: formData.value.route!,
    icon: formData.value.icon || 'fa-solid fa-link',
    badge: formData.value.badge || undefined,
    sort_order: items.value.length + 1,
  }

  items.value.push(newItem)
  cancelForm()
}

function confirmEditItem() {
  if (!editingItemId.value || !formData.value.label || !formData.value.route) return

  const index = items.value.findIndex(d => d.id === editingItemId.value)
  if (index === -1) return

  const existing = items.value[index]!
  items.value[index] = {
    id: existing.id,
    sort_order: existing.sort_order,
    label: formData.value.label!,
    route: formData.value.route!,
    icon: formData.value.icon || 'fa-solid fa-link',
    badge: formData.value.badge || undefined,
  }

  cancelForm()
}

function deleteItem(id: string) {
  items.value = items.value.filter(d => d.id !== id)
  items.value.forEach((d, i) => {
    d.sort_order = i + 1
  })
}

function moveUp(index: number) {
  if (index <= 0) return
  const sorted = sortedItems.value
  const current = sorted[index]
  const prev = sorted[index - 1]
  if (!current || !prev) return
  const tmpOrder = current.sort_order
  current.sort_order = prev.sort_order
  prev.sort_order = tmpOrder
}

function moveDown(index: number) {
  const sorted = sortedItems.value
  if (index >= sorted.length - 1) return
  const current = sorted[index]
  const next = sorted[index + 1]
  if (!current || !next) return
  const tmpOrder = current.sort_order
  current.sort_order = next.sort_order
  next.sort_order = tmpOrder
}
</script>

<template>
  <div class="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Field header -->
    <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'bars']" class="h-4 w-4 text-indigo-500" />
        <span class="font-medium text-gray-900 dark:text-white text-sm">{{ field.label }}</span>
        <span
          v-if="hasValue"
          class="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
        >
          {{ items.length }} item{{ items.length > 1 ? 's' : '' }}
        </span>
        <span
          v-else
          class="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Aucun item (valeurs par defaut)
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
          Gerer
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

        <!-- Items list -->
        <div v-if="sortedItems.length > 0" class="space-y-2">
          <div
            v-for="(item, index) in sortedItems"
            :key="item.id"
            class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
          >
            <!-- Icone -->
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <font-awesome-icon :icon="item.icon" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            <!-- Infos item -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ item.label }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ item.route }}
                <span v-if="item.badge" class="ml-1 px-1 py-0.5 text-[8px] font-semibold uppercase rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">{{ item.badge }}</span>
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
                :disabled="index === sortedItems.length - 1"
                @click="moveDown(index)"
              >
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Modifier"
                @click="startEditItem(item)"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3" />
              </button>
              <button
                class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Supprimer"
                @click="deleteItem(item.id)"
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
            <font-awesome-icon :icon="['fas', 'bars']" class="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Aucun sous-item defini. Les valeurs par defaut seront utilisees.
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Cliquez sur « Ajouter » ci-dessous pour personnaliser.
            </p>
          </div>
        </div>

        <!-- Add/Edit form -->
        <div
          v-if="isAddingNew || editingItemId"
          class="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3"
        >
          <h5 class="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {{ editingItemId ? 'Modifier le sous-item' : 'Ajouter un sous-item' }}
          </h5>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Libelle -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Libelle <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.label"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Notre mission"
              />
            </div>

            <!-- Route -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Route (lien) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.route"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: /a-propos"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Icone -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Icone FontAwesome
              </label>
              <input
                v-model="formData.icon"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: fa-solid fa-bullseye"
              />
              <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Classe FontAwesome complete (ex: fa-solid fa-star)
              </p>
            </div>

            <!-- Badge -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Badge (optionnel)
              </label>
              <input
                v-model="formData.badge"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: 4200+, nouveau"
              />
            </div>
          </div>

          <!-- Apercu icone -->
          <div v-if="formData.icon" class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Apercu :</span>
            <div class="w-8 h-8 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <font-awesome-icon :icon="formData.icon" class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span class="text-gray-700 dark:text-gray-300">{{ formData.label || '...' }}</span>
          </div>

          <!-- Form actions -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              @click="cancelForm"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              :disabled="!formData.label || !formData.route"
              @click="editingItemId ? confirmEditItem() : confirmAddItem()"
            >
              <font-awesome-icon :icon="['fas', 'check']" class="h-3 w-3" />
              {{ editingItemId ? 'Valider' : 'Ajouter' }}
            </button>
          </div>
        </div>

        <!-- Bottom actions -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            v-if="!isAddingNew && !editingItemId"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            @click="startAddItem"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-3 w-3" />
            Ajouter un sous-item
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
              :disabled="isSaving || isAddingNew || !!editingItemId"
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
        <div v-if="sortedItems.length > 0" class="space-y-1.5">
          <div
            v-for="item in sortedItems"
            :key="item.id"
            class="flex items-center gap-2 text-sm"
          >
            <font-awesome-icon :icon="item.icon" class="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
            <span class="text-gray-700 dark:text-gray-300 truncate">{{ item.label }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ item.route }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
          Aucun sous-item personnalise. Les valeurs par defaut du code sont utilisees.
          Cliquez sur « Gerer » pour personnaliser les liens.
        </p>
      </div>
    </div>
  </div>
</template>
