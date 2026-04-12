<script setup lang="ts">
/**
 * Modale de téléversement direct de fichiers dans la médiathèque.
 * Feature : 016-mediatheque-direct-upload
 *
 * - Utilise `useMediaUploadQueue` pour la file d'attente et les statuts
 * - Pas de champ « URL externe » (FR-014)
 * - Concurrency 5 max géré par le composable
 * - Confirmation à la fermeture si upload en cours (FR-013)
 */

import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import type { UploadItem } from '~/composables/useMediaUploadQueue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (event: 'update:modelValue', value: boolean): void
  (event: 'uploaded', mediaId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { formatFileSize } = useMediaApi()
const queue = useMediaUploadQueue()

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const dialogRef = useTemplateRef<HTMLDivElement>('dialogRef')

const isDragging = ref(false)

const summaryVisible = computed(() => {
  return queue.stats.value.total > 0 && queue.hasActiveUploads.value === false
})

/**
 * Émet `uploaded` à chaque nouvel item passant en `done`.
 * L'implémentation parent déclenche un reload debounced des médias + stats.
 */
const notifiedIds = new Set<string>()
watch(
  queue.items,
  (items) => {
    for (const item of items) {
      if (item.status === 'done' && item.mediaId && !notifiedIds.has(item.id)) {
        notifiedIds.add(item.id)
        emit('uploaded', item.mediaId)
      }
    }
  },
  { deep: false },
)

// === Sélection de fichiers ===

function onBrowseClick(): void {
  fileInput.value?.click()
}

function onInputChange(event: Event): void {
  const target = event.target as HTMLInputElement
  if (!target.files) return
  queue.addFiles(Array.from(target.files))
  // Reset pour pouvoir resélectionner les mêmes fichiers après un retrait
  target.value = ''
}

function onDragOver(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = false
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = false
  if (!event.dataTransfer?.files) return
  queue.addFiles(Array.from(event.dataTransfer.files))
}

// === Statuts / affichage ===

const mimeIcon: Record<string, string> = {
  image: 'fa-image',
  video: 'fa-video',
  audio: 'fa-music',
  application: 'fa-file-pdf',
}

function iconFor(item: UploadItem): string {
  const category = item.mimeType.split('/')[0] ?? 'application'
  return mimeIcon[category] ?? 'fa-file'
}

function statusLabel(item: UploadItem): string {
  return t(`admin.upload.status.${item.status}`)
}

function errorLabel(item: UploadItem): string {
  if (!item.error) return ''
  // Heuristique alignée sur les messages produits par `validateFile`
  // et par `processItem` (cf. useMediaUploadQueue).
  if (item.error === 'errorNetwork') return t('admin.upload.errorNetwork')
  if (item.error === 'errorBadType') return t('admin.upload.errorBadType')
  if (item.error === 'errorTooLarge') return t('admin.upload.errorTooLarge')
  if (item.error.toLowerCase().includes('taille')) return t('admin.upload.errorTooLarge')
  if (item.error.toLowerCase().includes('type')) return t('admin.upload.errorBadType')
  return item.error
}

const statusBadgeClass: Record<UploadItem['status'], string> = {
  queued: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  uploading: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  rejected: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  cancelled: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
}

// === Fermeture / annulation ===

function attemptClose(): void {
  if (queue.hasActiveUploads.value) {
    const confirmed = typeof window !== 'undefined' && window.confirm(t('admin.upload.closeConfirm'))
    if (!confirmed) return
    queue.cancelAll()
  }
  emit('update:modelValue', false)
}

function onOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    attemptClose()
  }
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    attemptClose()
  }
}

// Réinitialisation quand la modale se ferme proprement (sans upload actif)
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      notifiedIds.clear()
      nextTick(() => {
        dialogRef.value?.focus()
      })
    }
    else if (!queue.hasActiveUploads.value) {
      queue.reset()
      notifiedIds.clear()
    }
  },
)

onBeforeUnmount(() => {
  // Sécurité : si le composant est démonté alors que des uploads sont en cours
  // (ex : navigation), on abort proprement.
  queue.cancelAll()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      @click="onOverlayClick"
      @keydown="onKeyDown"
    >
      <div
        ref="dialogRef"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        :aria-label="t('admin.upload.title')"
        class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl outline-none dark:bg-gray-800"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('admin.upload.title') }}
          </h3>
          <button
            type="button"
            class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            :aria-label="t('admin.upload.remove')"
            @click="attemptClose"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
          </button>
        </div>

        <!-- Body scrollable -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Dropzone -->
          <div
            class="mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            :class="isDragging
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <font-awesome-icon icon="fa-solid fa-cloud-arrow-up" class="mb-4 h-12 w-12 text-gray-400" />
            <p class="mb-4 text-gray-600 dark:text-gray-300">
              {{ t('admin.upload.dropzone') }}
            </p>
            <button
              type="button"
              class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              @click="onBrowseClick"
            >
              {{ t('admin.upload.browse') }}
            </button>
            <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden"
              accept="image/*,video/*,audio/*,application/pdf"
              @change="onInputChange"
            >
            <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {{ t('admin.upload.acceptedTypes') }}
            </p>
          </div>

          <!-- Items -->
          <ul
            v-if="queue.items.value.length > 0"
            class="space-y-2"
          >
            <li
              v-for="item in queue.items.value"
              :key="item.id"
              class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <font-awesome-icon
                :icon="`fa-solid ${iconFor(item)}`"
                class="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.name }}
                  </p>
                  <span
                    class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="statusBadgeClass[item.status]"
                  >
                    {{ statusLabel(item) }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(item.size) }}
                </p>
                <p
                  v-if="item.status === 'error' || item.status === 'rejected'"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errorLabel(item) }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button
                  v-if="item.status === 'error'"
                  type="button"
                  class="rounded-md border border-blue-300 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  @click="queue.retryItem(item.id)"
                >
                  {{ t('admin.upload.retry') }}
                </button>
                <button
                  v-if="item.status !== 'uploading'"
                  type="button"
                  class="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="queue.removeItem(item.id)"
                >
                  {{ t('admin.upload.remove') }}
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
          <p
            v-if="summaryVisible"
            class="text-sm text-gray-600 dark:text-gray-300"
          >
            {{ t('admin.upload.summary', { done: queue.stats.value.done, total: queue.stats.value.total }) }}
          </p>
          <span v-else />
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="attemptClose"
          >
            {{ t('admin.upload.close') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
