<script setup lang="ts">
import type { PageSectionField } from '~/composables/editorial-pages-config'

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

const editingValue = ref('')
const editingType = ref<'text' | 'textarea' | 'number' | 'list'>('text')

const hasValue = computed(() => !!props.value)

// Pour le type list, convertir la valeur en tableau pour l'affichage
const listItems = computed(() => {
  if (props.field.type !== 'list' || !props.value) return []
  return props.value.split('\n').filter(item => item.trim())
})

function startEditing() {
  editingValue.value = props.value
  if (props.field.type === 'number') {
    editingType.value = 'number'
  }
  else if (props.field.type === 'textarea' || props.field.type === 'html') {
    editingType.value = 'textarea'
  }
  else if (props.field.type === 'list') {
    editingType.value = 'list'
  }
  else {
    editingType.value = 'text'
  }
  emit('edit')
}

function save() {
  const valueType = props.field.type === 'number' ? 'number' : props.field.type === 'html' ? 'html' : 'text'
  emit('save', editingValue.value, valueType)
}

function cancel() {
  editingValue.value = ''
  emit('cancel')
}
</script>

<template>
  <!-- Pour les champs image, utiliser le composant dédié -->
  <AdminEditorialImageField
    v-if="field.type === 'image'"
    :field="field"
    :value="value"
    :is-editing="isEditing"
    :is-saving="isSaving"
    @edit="emit('edit')"
    @save="(mediaId: string, valueType: 'text' | 'number' | 'html') => emit('save', mediaId, valueType)"
    @cancel="emit('cancel')"
    @history="emit('history')"
  />

  <!-- Pour les champs fichier (upload ou URL), utiliser le composant dédié -->
  <AdminEditorialFileField
    v-else-if="field.type === 'file'"
    :field="field"
    :value="value"
    :is-editing="isEditing"
    :is-saving="isSaving"
    @edit="emit('edit')"
    @save="(val: string, valueType: 'text' | 'number' | 'html') => emit('save', val, valueType)"
    @cancel="emit('cancel')"
    @history="emit('history')"
  />

  <!-- Pour les champs documents (liste dynamique JSON), utiliser le composant dédié -->
  <AdminEditorialDocumentsField
    v-else-if="field.type === 'documents'"
    :field="field"
    :value="value"
    :is-editing="isEditing"
    :is-saving="isSaving"
    @edit="emit('edit')"
    @save="(val: string, valueType: 'text' | 'number' | 'html') => emit('save', val, valueType)"
    @cancel="emit('cancel')"
    @history="emit('history')"
  />

  <!-- Pour les champs pays (liste dynamique JSON), utiliser le composant dédié -->
  <AdminEditorialCountriesField
    v-else-if="field.type === 'countries'"
    :field="field"
    :value="value"
    :is-editing="isEditing"
    :is-saving="isSaving"
    @edit="emit('edit')"
    @save="(val: string, valueType: 'text' | 'number' | 'html') => emit('save', val, valueType)"
    @cancel="emit('cancel')"
    @history="emit('history')"
  />

  <!-- Pour les galeries d'images (tableau JSON d'IDs media), utiliser le composant dédié -->
  <AdminEditorialGalleryField
    v-else-if="field.type === 'gallery'"
    :field="field"
    :value="value"
    :is-editing="isEditing"
    :is-saving="isSaving"
    @edit="emit('edit')"
    @save="(val: string, valueType: 'text' | 'number' | 'html') => emit('save', val, valueType)"
    @cancel="emit('cancel')"
    @history="emit('history')"
  />

  <!-- Pour les autres types, garder le comportement actuel -->
  <div v-else class="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
    <!-- Field header -->
    <div class="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <span class="font-medium text-gray-900 dark:text-white text-sm">{{ field.label }}</span>
        <span
          v-if="hasValue"
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
          Modifier
        </button>
      </div>
    </div>

    <!-- Field content / Edit form -->
    <div class="p-3">
      <!-- Editing mode -->
      <div v-if="isEditing" class="space-y-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ field.description }}
          </label>
          <input
            v-if="editingType === 'text' || editingType === 'number'"
            v-model="editingValue"
            :type="editingType === 'number' ? 'number' : 'text'"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            :placeholder="field.label"
          />
          <div v-else-if="editingType === 'list'" class="space-y-2">
            <textarea
              v-model="editingValue"
              rows="6"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
              :placeholder="`${field.label} (une ligne par élément)`"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-1" />
              Entrez un élément par ligne. Chaque ligne deviendra un élément de la liste.
            </p>
          </div>
          <textarea
            v-else
            v-model="editingValue"
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
            @click="cancel"
          >
            Annuler
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            :disabled="isSaving"
            @click="save"
          >
            <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-3 w-3 animate-spin" />
            <font-awesome-icon v-else :icon="['fas', 'save']" class="h-3 w-3" />
            Enregistrer
          </button>
        </div>
      </div>

      <!-- Display mode -->
      <div v-else>
        <!-- List display -->
        <ul v-if="field.type === 'list' && listItems.length > 0" class="space-y-1">
          <li
            v-for="(item, index) in listItems"
            :key="index"
            class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <font-awesome-icon :icon="['fas', 'check']" class="mt-1 h-3 w-3 text-green-500 flex-shrink-0" />
            <span>{{ item }}</span>
          </li>
        </ul>
        <!-- Text display -->
        <p v-else-if="hasValue" class="text-sm text-gray-700 dark:text-gray-300">
          {{ value }}
        </p>
        <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">
          Aucune valeur définie. Cliquez sur "Modifier" pour ajouter du contenu.
        </p>
      </div>
    </div>
  </div>
</template>
