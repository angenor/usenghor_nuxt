<script setup lang="ts">
import type { MediaRead } from '~/types/api/media'

interface Props {
  media: MediaRead | null
  items?: MediaRead[]
  currentIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  currentIndex: 0,
})

const emit = defineEmits<{
  close: []
  navigate: [index: number]
}>()

const hasList = computed(() => props.items.length > 1)

const canPrev = computed(() => hasList.value && props.currentIndex > 0)
const canNext = computed(() => hasList.value && props.currentIndex < props.items.length - 1)

function goToPrev() {
  if (canPrev.value) emit('navigate', props.currentIndex - 1)
}

function goToNext() {
  if (canNext.value) emit('navigate', props.currentIndex + 1)
}

function close() {
  emit('close')
}

function getFileExtension(item: MediaRead): string {
  const name = item.name || item.url || ''
  const match = name.match(/\.(\w+)(\?|$)/)
  return match ? match[1].toUpperCase() : ''
}

function isInlineViewableDocument(item: MediaRead): boolean {
  if (item.type !== 'document') return false
  if (item.mime_type === 'application/pdf') return true
  return getFileExtension(item) === 'PDF'
}

function getDownloadUrl(item: MediaRead): string {
  const url = item.url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}download=1`
}

function downloadMedia(item: MediaRead) {
  const link = document.createElement('a')
  link.href = getDownloadUrl(item)
  link.download = item.name
  link.target = '_blank'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.media) return
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowRight':
      goToNext()
      break
    case 'ArrowLeft':
      goToPrev()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="preview">
      <div
        v-if="media"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
        @click.self="close"
      >
        <!-- Header -->
        <div class="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 py-4 z-20">
          <div class="text-white min-w-0 flex-1 pr-4">
            <h3 class="font-medium text-sm sm:text-base truncate">{{ media.name }}</h3>
            <p v-if="hasList" class="text-xs text-white/60">
              {{ currentIndex + 1 }} / {{ items.length }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Télécharger"
              @click="downloadMedia(media)"
            >
              <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Fermer"
              @click="close"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Contenu -->
        <div class="relative flex items-center justify-center w-full h-full px-4 sm:px-16 py-20">
          <!-- Navigation précédent -->
          <button
            v-if="canPrev"
            type="button"
            class="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            @click="goToPrev"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-5 h-5" />
          </button>

          <!-- Image -->
          <img
            v-if="media.type === 'image'"
            :src="media.url"
            :alt="media.alt_text || media.name"
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          <!-- Vidéo -->
          <div v-else-if="media.type === 'video'" class="w-full max-w-4xl">
            <video
              :key="media.id"
              controls
              class="w-full max-h-[80vh] rounded-lg bg-black"
              preload="metadata"
            >
              <source :src="media.url" :type="media.mime_type || 'video/mp4'" />
            </video>
          </div>

          <!-- Audio -->
          <div v-else-if="media.type === 'audio'" class="flex flex-col items-center gap-6">
            <div class="w-32 h-32 rounded-full bg-amber-100/20 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-headphones" class="w-16 h-16 text-amber-400" />
            </div>
            <h3 class="text-lg font-medium text-white text-center max-w-md">{{ media.name }}</h3>
            <audio
              :key="media.id"
              controls
              autoplay
              class="w-80 max-w-full"
              preload="metadata"
            >
              <source :src="media.url" :type="media.mime_type || 'audio/mpeg'" />
            </audio>
          </div>

          <!-- Document PDF inline -->
          <div
            v-else-if="isInlineViewableDocument(media)"
            class="w-full max-w-5xl h-[80vh] bg-white rounded-lg overflow-hidden"
          >
            <iframe
              :key="media.id"
              :src="media.url"
              :title="media.name"
              class="w-full h-full"
            />
          </div>

          <!-- Autres documents : fallback téléchargement -->
          <div v-else class="flex flex-col items-center gap-6">
            <div class="w-32 h-32 rounded-2xl bg-white/10 flex flex-col items-center justify-center gap-2">
              <font-awesome-icon icon="fa-solid fa-file-lines" class="w-16 h-16 text-red-400" />
              <span v-if="getFileExtension(media)" class="text-sm font-bold uppercase text-red-400">
                {{ getFileExtension(media) }}
              </span>
            </div>
            <h3 class="text-lg font-medium text-white text-center max-w-md">{{ media.name }}</h3>
            <button
              type="button"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue-600 text-white font-medium hover:bg-brand-blue-700 transition-colors"
              @click="downloadMedia(media)"
            >
              <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
              Télécharger
            </button>
          </div>

          <!-- Navigation suivant -->
          <button
            v-if="canNext"
            type="button"
            class="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            @click="goToNext"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.preview-enter-active,
.preview-leave-active {
  transition: opacity 0.25s ease;
}

.preview-enter-from,
.preview-leave-to {
  opacity: 0;
}
</style>
