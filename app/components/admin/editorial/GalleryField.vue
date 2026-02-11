<script setup lang="ts">
import type { ImageVariants } from '~/components/media/ImageEditor.client.vue'
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

const { uploadMediaVariants, getMediaUrl } = useMediaApi()

// === STATE ===
const images = ref<string[]>([])
const showImageEditor = ref(false)
const pendingImageFile = ref<File | null>(null)
const isUploading = ref(false)

// === COMPUTED ===
const hasValue = computed(() => images.value.length > 0)

// === WATCHERS ===
watch(() => props.value, (val) => {
  parseImages(val)
}, { immediate: true })

// === METHODS ===

function parseImages(val: string) {
  if (!val) {
    images.value = []
    return
  }
  try {
    const parsed = JSON.parse(val)
    images.value = Array.isArray(parsed) ? parsed : []
  }
  catch {
    images.value = []
  }
}

function getImageUrl(mediaId: string): string {
  return getMediaUrl(mediaId)
}

function startEditing() {
  emit('edit')
}

function cancel() {
  // Restaurer depuis la prop
  parseImages(props.value)
  emit('cancel')
}

function saveImages() {
  emit('save', JSON.stringify(images.value), 'text')
}

// Gestion des fichiers
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  pendingImageFile.value = file
  showImageEditor.value = true
  input.value = ''
}

function cancelImageEditor() {
  showImageEditor.value = false
  pendingImageFile.value = null
}

async function saveEditedImage(variants: ImageVariants) {
  showImageEditor.value = false
  isUploading.value = true

  try {
    const originalName = pendingImageFile.value?.name || 'facility-image.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    const response = await uploadMediaVariants(variants, baseName, { folder: 'facilities' })

    // Ajouter l'ID au tableau
    images.value.push(response.original.id)
    saveImages()
  }
  catch (err) {
    console.error('Erreur upload image galerie:', err)
  }
  finally {
    isUploading.value = false
    pendingImageFile.value = null
  }
}

function removeImage(index: number) {
  images.value.splice(index, 1)
  saveImages()
}

function moveImage(index: number, direction: 'up' | 'down') {
  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= images.value.length) return

  const temp = images.value[index]
  images.value[index] = images.value[newIndex]
  images.value[newIndex] = temp
  saveImages()
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
          {{ images.length }} image{{ images.length > 1 ? 's' : '' }}
        </span>
        <span
          v-else
          class="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        >
          Aucune image
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
          <font-awesome-icon :icon="['fas', 'images']" class="h-3 w-3" />
          Gérer les images
        </button>
      </div>
    </div>

    <!-- Field content -->
    <div class="p-3">
      <!-- Editing mode -->
      <div v-if="isEditing" class="space-y-3">
        <label class="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ field.description }}
        </label>

        <!-- Images grid -->
        <div v-if="hasValue" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="(mediaId, index) in images"
            :key="mediaId"
            class="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
          >
            <img
              :src="getImageUrl(mediaId)"
              :alt="`Image ${index + 1}`"
              class="w-full aspect-[4/3] object-cover"
            />
            <!-- Overlay avec actions -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <!-- Monter -->
              <button
                v-if="index > 0"
                class="w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:bg-white flex items-center justify-center transition-colors"
                title="Déplacer avant"
                @click="moveImage(index, 'up')"
              >
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-3 w-3" />
              </button>
              <!-- Descendre -->
              <button
                v-if="index < images.length - 1"
                class="w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:bg-white flex items-center justify-center transition-colors"
                title="Déplacer après"
                @click="moveImage(index, 'down')"
              >
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3 w-3" />
              </button>
              <!-- Supprimer -->
              <button
                class="w-8 h-8 rounded-full bg-red-500/90 text-white hover:bg-red-600 flex items-center justify-center transition-colors"
                title="Supprimer"
                @click="removeImage(index)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
              </button>
            </div>
            <!-- Numéro -->
            <div class="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center">
              {{ index + 1 }}
            </div>
          </div>
        </div>

        <!-- Upload button -->
        <label
          class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <div class="flex flex-col items-center justify-center py-3">
            <font-awesome-icon
              v-if="isUploading"
              :icon="['fas', 'spinner']"
              class="h-6 w-6 mb-1 text-gray-400 animate-spin"
            />
            <font-awesome-icon
              v-else
              :icon="['fas', 'plus']"
              class="h-6 w-6 mb-1 text-gray-400"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              <span v-if="isUploading">Téléversement en cours...</span>
              <span v-else>Ajouter une image</span>
            </p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Format 4:3 recommandé (800x600)
            </p>
          </div>
          <input
            type="file"
            class="hidden"
            accept="image/*"
            :disabled="isUploading || isSaving"
            @change="handleFileChange"
          />
        </label>

        <div class="flex items-center justify-end gap-2">
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
        <div v-if="hasValue" class="grid grid-cols-4 gap-2">
          <div
            v-for="(mediaId, index) in images"
            :key="mediaId"
            class="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
          >
            <img
              :src="getImageUrl(mediaId)"
              :alt="`Image ${index + 1}`"
              class="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
        <div
          v-else
          class="flex items-center justify-center h-24 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
        >
          <div class="text-center">
            <font-awesome-icon :icon="['fas', 'images']" class="h-6 w-6 text-gray-300 dark:text-gray-600 mb-1" />
            <p class="text-sm text-gray-400 dark:text-gray-500 italic">
              Aucune image définie
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Editor Modal -->
    <Teleport to="body">
      <div
        v-if="showImageEditor && pendingImageFile"
        class="fixed inset-0 z-50 overflow-y-auto"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/70 transition-opacity" />
          <div class="relative w-full max-w-4xl transform transition-all">
            <MediaImageEditor
              :image-file="pendingImageFile"
              :aspect-ratio="4 / 3"
              @save="saveEditedImage"
              @cancel="cancelImageEditor"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
