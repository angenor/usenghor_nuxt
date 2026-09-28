<script setup lang="ts">
/**
 * Image de couverture d'une réalisation ou d'un projet de service :
 * choix du fichier → recadrage 16:9 (`MediaImageEditor`) → téléversement des
 * variantes (`uploadMediaVariants`) → aperçu, remplacement ou retrait.
 *
 * v-model : identifiant du média (`cover_image_external_id`).
 * v-model:uploading : vrai pendant le téléversement (pour bloquer l'enregistrement).
 */
import type { ImageVariants } from '~/types/api'

const props = withDefaults(defineProps<{
  /** Dossier de la médiathèque (ex. « achievements », « service-projects ») */
  folder: string
  label?: string
  hint?: string
  aspectRatio?: number
  disabled?: boolean
}>(), {
  label: 'Image de couverture',
  hint: 'Affichée sur la carte (format 16:9, recadrage proposé après le choix du fichier).',
  aspectRatio: 16 / 9,
  disabled: false,
})

const externalId = defineModel<string | null>({ default: null })
const uploading = defineModel<boolean>('uploading', { default: false })

const { getMediaUrl, uploadMediaVariants } = useMediaApi()

const uid = useId()
const inputId = `service-item-cover-${uid}`
const hintId = `service-item-cover-hint-${uid}`

const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingFile = ref<File | null>(null)
const showEditor = ref(false)
const localPreview = ref<string | null>(null)
const previewFailed = ref(false)
const uploadError = ref<string | null>(null)
/** Dernier média téléversé ici : son aperçu local reste affiché. */
let lastUploadedId: string | null = null

const previewUrl = computed(() => localPreview.value || getMediaUrl(externalId.value) || null)

// Changement externe (ouverture d'un autre élément) : oublier l'aperçu local.
watch(externalId, (id, oldId) => {
  if (id !== oldId && id !== lastUploadedId) {
    revokeLocalPreview()
    previewFailed.value = false
  }
})

function revokeLocalPreview() {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = null
}

function openPicker() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploadError.value = null
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Ce fichier n\'est pas une image. Choisissez un fichier PNG, JPG ou WebP.'
    return
  }
  pendingFile.value = file
  showEditor.value = true
}

function cancelEditor() {
  showEditor.value = false
  pendingFile.value = null
}

async function saveEditedImage(variants: ImageVariants) {
  showEditor.value = false
  uploading.value = true
  uploadError.value = null
  try {
    const originalName = pendingFile.value?.name || 'couverture.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')
    const response = await uploadMediaVariants(variants, baseName, { folder: props.folder })
    revokeLocalPreview()
    localPreview.value = URL.createObjectURL(variants.medium)
    previewFailed.value = false
    lastUploadedId = response.original.id
    externalId.value = response.original.id
  }
  catch (err) {
    console.error('Erreur téléversement image de couverture :', err)
    uploadError.value = 'Le téléversement de l\'image a échoué. Réessayez.'
  }
  finally {
    uploading.value = false
    pendingFile.value = null
  }
}

function removeImage() {
  revokeLocalPreview()
  previewFailed.value = false
  uploadError.value = null
  externalId.value = null
}

onBeforeUnmount(revokeLocalPreview)
</script>

<template>
  <div>
    <span class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" :id="`${inputId}-label`">
      {{ label }}
    </span>

    <input
      :id="inputId"
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      :disabled="disabled || uploading"
      @change="onFileChange"
    >

    <!-- Téléversement en cours -->
    <div
      v-if="uploading"
      class="flex aspect-video w-full max-w-md items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50"
      role="status"
    >
      <div class="text-center">
        <font-awesome-icon :icon="['fas', 'spinner']" class="mb-2 h-7 w-7 animate-spin text-brand-red-500" aria-hidden="true" />
        <p class="text-sm text-gray-500 dark:text-gray-400">Téléversement en cours…</p>
      </div>
    </div>

    <!-- Aperçu -->
    <div v-else-if="previewUrl" class="w-full max-w-md">
      <div class="relative aspect-video overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-700 dark:ring-gray-600">
        <img
          v-if="!previewFailed"
          :src="previewUrl"
          alt="Aperçu de l'image de couverture"
          class="h-full w-full object-cover"
          @error="previewFailed = true"
        >
        <div v-else class="flex h-full w-full flex-col items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <font-awesome-icon :icon="['fas', 'image']" class="h-6 w-6" aria-hidden="true" />
          Aperçu indisponible
        </div>
      </div>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          :disabled="disabled"
          @click="openPicker"
        >
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" class="h-3.5 w-3.5" aria-hidden="true" />
          Remplacer
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 dark:border-red-900/60 dark:bg-gray-700 dark:text-red-300 dark:hover:bg-red-900/30"
          :disabled="disabled"
          @click="removeImage"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" class="h-3.5 w-3.5" aria-hidden="true" />
          Retirer l'image
        </button>
      </div>
    </div>

    <!-- Choix du fichier -->
    <button
      v-else
      type="button"
      class="flex w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition-colors hover:border-brand-red-400 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-brand-red-500 dark:hover:bg-gray-700"
      :aria-describedby="hintId"
      :aria-labelledby="`${inputId}-label ${inputId}-cta`"
      :disabled="disabled"
      @click="openPicker"
    >
      <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" class="mb-2 h-7 w-7 text-gray-400" aria-hidden="true" />
      <span :id="`${inputId}-cta`" class="text-sm font-medium text-gray-700 dark:text-gray-200">Choisir une image</span>
      <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG ou WebP</span>
    </button>

    <p :id="hintId" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
      {{ hint }}
    </p>
    <p v-if="uploadError" role="alert" class="mt-1 text-xs text-red-600 dark:text-red-400">
      {{ uploadError }}
    </p>

    <!-- Recadrage (au-dessus de la modale du formulaire) -->
    <Teleport to="body">
      <div
        v-if="showEditor && pendingFile"
        data-service-item-overlay
        class="fixed inset-0 z-[60] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Recadrer l'image de couverture"
      >
        <div class="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div class="relative flex min-h-full items-center justify-center p-4">
          <div class="relative w-full max-w-4xl">
            <MediaImageEditor
              :image-file="pendingFile"
              :aspect-ratio="aspectRatio"
              @save="saveEditedImage"
              @cancel="cancelEditor"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
