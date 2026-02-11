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

// État pour l'éditeur d'image
const showImageEditor = ref(false)
const pendingImageFile = ref<File | null>(null)
const isUploadingImage = ref(false)
const imagePreviewUrl = ref<string | null>(null)

const hasValue = computed(() => !!props.value)

// URL de l'image actuelle (depuis le media ou preview)
const currentImageUrl = computed(() => {
  if (imagePreviewUrl.value) {
    return imagePreviewUrl.value
  }
  if (props.value) {
    return getMediaUrl(props.value)
  }
  return null
})

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
  isUploadingImage.value = true

  try {
    const originalName = pendingImageFile.value?.name || 'hero-slide.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    // Upload les 3 versions (low, medium, original)
    const response = await uploadMediaVariants(variants, baseName, { folder: 'hero-slides' })

    // Sauvegarder l'ID du media original
    emit('save', response.original.id, 'text')

    // Afficher l'aperçu immédiat
    imagePreviewUrl.value = URL.createObjectURL(variants.medium)
  }
  catch (err) {
    console.error('Erreur upload image hero:', err)
  }
  finally {
    isUploadingImage.value = false
    pendingImageFile.value = null
  }
}

function startEditing() {
  emit('edit')
}

function cancel() {
  imagePreviewUrl.value = null
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
          <font-awesome-icon :icon="['fas', 'image']" class="h-3 w-3" />
          Modifier
        </button>
      </div>
    </div>

    <!-- Field content -->
    <div class="p-3">
      <!-- Editing mode -->
      <div v-if="isEditing" class="space-y-3">
        <div>
          <label class="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ field.description }}
          </label>

          <!-- Image preview -->
          <div
            v-if="currentImageUrl"
            class="relative mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
          >
            <img
              :src="currentImageUrl"
              :alt="field.label"
              class="w-full h-40 object-cover"
            />
            <div class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="text-white text-sm font-medium">Cliquez ci-dessous pour remplacer</span>
            </div>
          </div>

          <!-- Upload button -->
          <label
            class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            :class="{ 'h-20': currentImageUrl }"
          >
            <div class="flex flex-col items-center justify-center pt-5 pb-6">
              <font-awesome-icon
                v-if="isUploadingImage"
                :icon="['fas', 'spinner']"
                class="h-8 w-8 mb-2 text-gray-400 animate-spin"
              />
              <font-awesome-icon
                v-else
                :icon="['fas', 'cloud-upload-alt']"
                class="h-8 w-8 mb-2 text-gray-400"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <span v-if="isUploadingImage">Téléversement en cours...</span>
                <span v-else-if="currentImageUrl">Cliquez pour remplacer l'image</span>
                <span v-else>Cliquez pour téléverser une image</span>
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Format 16:9 recommandé (1920x1080)
              </p>
            </div>
            <input
              type="file"
              class="hidden"
              accept="image/*"
              :disabled="isUploadingImage || isSaving"
              @change="handleFileChange"
            />
          </label>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            :disabled="isSaving || isUploadingImage"
            @click="cancel"
          >
            Fermer
          </button>
        </div>
      </div>

      <!-- Display mode -->
      <div v-else>
        <div
          v-if="currentImageUrl"
          class="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
        >
          <img
            :src="currentImageUrl"
            :alt="field.label"
            class="w-full h-32 object-cover"
          />
        </div>
        <div
          v-else
          class="flex items-center justify-center h-32 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
        >
          <div class="text-center">
            <font-awesome-icon :icon="['fas', 'image']" class="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
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
              :aspect-ratio="16 / 9"
              @save="saveEditedImage"
              @cancel="cancelImageEditor"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
