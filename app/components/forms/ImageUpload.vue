<script setup lang="ts">
import type { MediaRead, MediaUploadResponse } from '~/types/api'

interface Props {
  /** ID du média actuellement sélectionné */
  modelValue?: string | null
  /** Label du champ */
  label?: string
  /** Description / aide */
  hint?: string
  /** Dossier de destination sur le serveur */
  folder?: string
  /** Taille max en Mo (défaut: 10) */
  maxSizeMb?: number
  /** Désactivé */
  disabled?: boolean
  /** Afficher le bouton de suppression */
  removable?: boolean
  /** Ratio d'aspect pour la preview (ex: "16/9", "1/1") */
  aspectRatio?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: 'Image',
  hint: '',
  folder: 'uploads',
  maxSizeMb: 10,
  disabled: false,
  removable: true,
  aspectRatio: '16/9',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const {
  uploadMedia,
  getMediaById,
  getMediaUrl,
  validateFile,
  formatFileSize,
} = useMediaApi()

// État
const isLoading = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref<string | null>(null)
const isDragging = ref(false)
const currentMedia = ref<MediaRead | MediaUploadResponse | null>(null)

// Input file reference
const fileInput = ref<HTMLInputElement | null>(null)

// Charger le média existant si un ID est fourni
watch(
  () => props.modelValue,
  async (newId) => {
    if (newId && newId !== currentMedia.value?.id) {
      await loadExistingMedia(newId)
    } else if (!newId) {
      currentMedia.value = null
    }
  },
  { immediate: true },
)

async function loadExistingMedia(id: string) {
  isLoading.value = true
  error.value = null

  try {
    currentMedia.value = await getMediaById(id)
  } catch {
    console.error('Erreur lors du chargement du média:', id)
    // Le média n'existe pas ou n'est plus accessible
    currentMedia.value = null
  } finally {
    isLoading.value = false
  }
}

// URL de preview
const previewUrl = computed(() => {
  if (!currentMedia.value) return null
  return getMediaUrl(currentMedia.value)
})

// Gestion du drag & drop
function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  if (!props.disabled) {
    isDragging.value = true
  }
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  if (props.disabled) return

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelect(files[0])
  }
}

// Clic sur la zone pour ouvrir le sélecteur
function triggerFileInput() {
  if (!props.disabled && fileInput.value) {
    fileInput.value.click()
  }
}

function handleInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    handleFileSelect(input.files[0])
  }
}

async function handleFileSelect(file: File) {
  error.value = null

  // Validation
  const validation = validateFile(file, {
    maxSizeMB: props.maxSizeMb,
    allowedTypes: ['image/*'],
  })

  if (!validation.valid) {
    error.value = validation.error || 'Fichier invalide'
    return
  }

  // Upload
  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Simulation de progression (le vrai pourcentage nécessiterait XMLHttpRequest)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)

    const response = await uploadMedia(file, {
      folder: props.folder,
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    currentMedia.value = response
    emit('update:modelValue', response.id)
  } catch (e) {
    console.error('Erreur upload:', e)
    error.value = 'Erreur lors de l\'upload. Veuillez réessayer.'
  } finally {
    isUploading.value = false
    uploadProgress.value = 0

    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

function removeImage() {
  currentMedia.value = null
  emit('update:modelValue', null)
  error.value = null
}
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
    </label>

    <!-- Zone principale -->
    <div
      class="relative overflow-hidden rounded-lg border-2 border-dashed transition-all"
      :class="{
        'border-gray-300 dark:border-gray-600': !isDragging && !error,
        'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragging,
        'border-red-500': error,
        'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500': !disabled && !previewUrl,
        'cursor-not-allowed opacity-60': disabled,
      }"
      :style="previewUrl ? {} : { aspectRatio }"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click="!previewUrl && triggerFileInput()"
    >
      <!-- Loading existant -->
      <div
        v-if="isLoading"
        class="flex h-full items-center justify-center"
        :style="{ aspectRatio }"
      >
        <font-awesome-icon
          icon="fa-solid fa-spinner"
          class="h-8 w-8 animate-spin text-gray-400"
        />
      </div>

      <!-- Preview de l'image -->
      <div v-else-if="previewUrl" class="group relative">
        <img
          :src="previewUrl"
          :alt="currentMedia?.alt_text || 'Image uploadée'"
          class="h-full w-full object-cover"
          :style="{ aspectRatio }"
        />

        <!-- Overlay avec actions -->
        <div
          class="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <!-- Changer l'image -->
          <button
            type="button"
            class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
            :disabled="disabled"
            @click.stop="triggerFileInput"
          >
            <font-awesome-icon icon="fa-solid fa-camera" class="mr-2 h-4 w-4" />
            Changer
          </button>

          <!-- Supprimer -->
          <button
            v-if="removable"
            type="button"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700"
            :disabled="disabled"
            @click.stop="removeImage"
          >
            <font-awesome-icon icon="fa-solid fa-trash" class="mr-2 h-4 w-4" />
            Supprimer
          </button>
        </div>

        <!-- Info fichier -->
        <div
          v-if="currentMedia && 'size_bytes' in currentMedia && currentMedia.size_bytes"
          class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
        >
          {{ formatFileSize(currentMedia.size_bytes) }}
        </div>
      </div>

      <!-- Zone d'upload (pas d'image) -->
      <div
        v-else-if="!isUploading"
        class="flex h-full flex-col items-center justify-center px-6 py-8"
      >
        <font-awesome-icon
          icon="fa-solid fa-cloud-arrow-up"
          class="mb-3 h-10 w-10 text-gray-400"
        />
        <p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Glissez une image ici
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          ou cliquez pour sélectionner
        </p>
        <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
          PNG, JPG, WebP jusqu'à {{ maxSizeMb }} Mo
        </p>
      </div>

      <!-- Barre de progression -->
      <div
        v-if="isUploading"
        class="flex h-full flex-col items-center justify-center px-6 py-8"
        :style="{ aspectRatio }"
      >
        <font-awesome-icon
          icon="fa-solid fa-spinner"
          class="mb-3 h-8 w-8 animate-spin text-blue-500"
        />
        <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload en cours...
        </p>
        <div class="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-full rounded-full bg-blue-500 transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
        <p class="mt-1 text-xs text-gray-500">
          {{ uploadProgress }}%
        </p>
      </div>
    </div>

    <!-- Input file caché -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      :disabled="disabled"
      @change="handleInputChange"
    />

    <!-- Hint -->
    <p v-if="hint && !error" class="text-xs text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>

    <!-- Erreur -->
    <p v-if="error" class="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-3 w-3" />
      {{ error }}
    </p>
  </div>
</template>
