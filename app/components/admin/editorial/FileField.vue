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

const { uploadMedia, getMediaUrl } = useMediaApi()

// État
const isUploading = ref(false)
const manualUrl = ref('')
const mode = ref<'upload' | 'url'>('upload')

const hasValue = computed(() => !!props.value)

// Détecter si la valeur actuelle est un UUID (fichier uploadé) ou une URL manuelle
const isMediaId = computed(() => {
  if (!props.value) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(props.value)
})

const displayUrl = computed(() => {
  if (!props.value) return null
  if (isMediaId.value) return getMediaUrl(props.value)
  return props.value
})

// Extraire le nom du fichier depuis l'URL
const fileName = computed(() => {
  if (!props.value) return null
  if (isMediaId.value) return 'Fichier uploadé'
  try {
    const url = new URL(props.value, 'http://localhost')
    return decodeURIComponent(url.pathname.split('/').pop() || props.value)
  }
  catch {
    return props.value
  }
})

function startEditing() {
  manualUrl.value = isMediaId.value ? '' : (props.value || '')
  mode.value = 'upload'
  emit('edit')
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const response = await uploadMedia(file, {
      folder: 'editorial-documents',
      description: props.field.label,
    })
    emit('save', response.id, 'text')
  }
  catch (err) {
    console.error('Erreur upload fichier:', err)
  }
  finally {
    isUploading.value = false
    input.value = ''
  }
}

function saveUrl() {
  if (!manualUrl.value.trim()) return
  emit('save', manualUrl.value.trim(), 'text')
}

function cancel() {
  manualUrl.value = ''
  emit('cancel')
}
</script>

<template>
  <div class="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
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

    <!-- Field content -->
    <div class="p-3">
      <!-- Editing mode -->
      <div v-if="isEditing" class="space-y-3">
        <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ field.description }}
        </label>

        <!-- Mode switcher -->
        <div class="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button
            type="button"
            class="flex-1 px-3 py-2 text-xs font-medium transition-colors"
            :class="mode === 'upload'
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'"
            @click="mode = 'upload'"
          >
            <font-awesome-icon :icon="['fas', 'cloud-upload-alt']" class="mr-1.5 h-3 w-3" />
            Uploader un fichier
          </button>
          <button
            type="button"
            class="flex-1 px-3 py-2 text-xs font-medium border-l border-gray-200 dark:border-gray-600 transition-colors"
            :class="mode === 'url'
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'"
            @click="mode = 'url'"
          >
            <font-awesome-icon :icon="['fas', 'link']" class="mr-1.5 h-3 w-3" />
            Entrer une URL
          </button>
        </div>

        <!-- Upload mode -->
        <div v-if="mode === 'upload'">
          <label
            class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div class="flex flex-col items-center justify-center py-4">
              <font-awesome-icon
                v-if="isUploading"
                :icon="['fas', 'spinner']"
                class="h-7 w-7 mb-2 text-gray-400 animate-spin"
              />
              <font-awesome-icon
                v-else
                :icon="['fas', 'file-upload']"
                class="h-7 w-7 mb-2 text-gray-400"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <span v-if="isUploading">Téléversement en cours...</span>
                <span v-else>Cliquez pour téléverser un fichier</span>
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                PDF, DOC, ou tout autre document
              </p>
            </div>
            <input
              type="file"
              class="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp"
              :disabled="isUploading || isSaving"
              @change="handleFileUpload"
            />
          </label>
        </div>

        <!-- URL mode -->
        <div v-if="mode === 'url'" class="space-y-2">
          <input
            v-model="manualUrl"
            type="text"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="/documents/mon-fichier.pdf"
          />
          <div class="flex items-center justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
              :disabled="!manualUrl.trim() || isSaving"
              @click="saveUrl"
            >
              <font-awesome-icon :icon="['fas', 'save']" class="h-3 w-3" />
              Enregistrer
            </button>
          </div>
        </div>

        <div class="flex items-center justify-end">
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            :disabled="isSaving || isUploading"
            @click="cancel"
          >
            Fermer
          </button>
        </div>
      </div>

      <!-- Display mode -->
      <div v-else>
        <div v-if="hasValue" class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <font-awesome-icon :icon="['fas', 'file-pdf']" class="h-8 w-8 text-red-500 flex-shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {{ fileName }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ isMediaId ? 'Fichier uploadé via le média' : value }}
            </p>
          </div>
          <a
            v-if="displayUrl"
            :href="displayUrl"
            target="_blank"
            class="flex-shrink-0 p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Ouvrir le fichier"
          >
            <font-awesome-icon :icon="['fas', 'external-link-alt']" class="h-3.5 w-3.5" />
          </a>
        </div>
        <div v-else class="flex items-center justify-center h-20 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
          <div class="text-center">
            <font-awesome-icon :icon="['fas', 'file']" class="h-6 w-6 text-gray-300 dark:text-gray-600 mb-1" />
            <p class="text-sm text-gray-400 dark:text-gray-500 italic">
              Aucun fichier défini
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
