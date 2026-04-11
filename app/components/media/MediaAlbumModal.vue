<script setup lang="ts">
import type { MediaType } from '~/types/api/media'

interface MediaItem {
  id: string
  title_fr: string
  title_en?: string
  url: string
  thumbnail?: string
  date?: string
  type?: MediaType
  mime_type?: string
}

type FilterType = 'all' | MediaType

interface Props {
  open: boolean
  title: string
  items: MediaItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const { locale } = useI18n()

// Current view mode: 'grid' or 'single'
const viewMode = ref<'grid' | 'single'>('grid')
const currentIndex = ref(0)
const activeFilter = ref<FilterType>('all')

// Détecter le type à partir du nom de fichier si non fourni
function detectType(item: MediaItem): MediaType {
  if (item.type) return item.type
  const name = (item.title_fr || item.url || '').toLowerCase()
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|ico)(\?|$)/.test(name)) return 'image'
  if (/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/.test(name)) return 'video'
  if (/\.(mp3|wav|flac|aac|m4a|wma)(\?|$)/.test(name)) return 'audio'
  return 'document'
}

// Icône par type
function getTypeIcon(type: MediaType): string {
  switch (type) {
    case 'image': return 'fa-solid fa-image'
    case 'video': return 'fa-solid fa-film'
    case 'audio': return 'fa-solid fa-headphones'
    case 'document': return 'fa-solid fa-file-lines'
  }
}

// Couleur par type
function getTypeColor(type: MediaType): string {
  switch (type) {
    case 'image': return 'text-blue-500'
    case 'video': return 'text-purple-500'
    case 'audio': return 'text-amber-500'
    case 'document': return 'text-red-500'
  }
}

// Couleur de fond par type pour les vignettes non-image
function getTypeBg(type: MediaType): string {
  switch (type) {
    case 'image': return 'bg-blue-50 dark:bg-blue-900/30'
    case 'video': return 'bg-purple-50 dark:bg-purple-900/30'
    case 'audio': return 'bg-amber-50 dark:bg-amber-900/30'
    case 'document': return 'bg-red-50 dark:bg-red-900/30'
  }
}

// Label par type
function getTypeLabel(type: FilterType): string {
  switch (type) {
    case 'all': return 'Tout'
    case 'image': return 'Images'
    case 'video': return 'Vidéos'
    case 'audio': return 'Audio'
    case 'document': return 'Documents'
  }
}

// Types disponibles dans les items
const availableTypes = computed(() => {
  const types = new Set<MediaType>()
  props.items.forEach(item => types.add(detectType(item)))
  return Array.from(types)
})

// Afficher les filtres seulement si plus d'un type
const showFilters = computed(() => availableTypes.value.length > 1)

// Compteurs par type
function countByType(type: MediaType): number {
  return props.items.filter(item => detectType(item) === type).length
}

// Items filtrés
const filteredItems = computed(() => {
  if (activeFilter.value === 'all') return props.items
  return props.items.filter(item => detectType(item) === activeFilter.value)
})

// Get localized title
const getLocalizedTitle = (item: MediaItem) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  return item.title_fr
}

// Format date
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Navigation sur les items filtrés
const currentItem = computed(() => filteredItems.value[currentIndex.value])

const goToNext = () => {
  if (currentIndex.value < filteredItems.value.length - 1) {
    currentIndex.value++
  }
}

const goToPrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const openSingleView = (index: number) => {
  currentIndex.value = index
  viewMode.value = 'single'
}

const backToGrid = () => {
  viewMode.value = 'grid'
}

// Reset index quand le filtre change
watch(activeFilter, () => {
  currentIndex.value = 0
  if (viewMode.value === 'single') {
    viewMode.value = 'grid'
  }
})

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.open) return

  switch (e.key) {
    case 'Escape':
      if (viewMode.value === 'single') {
        backToGrid()
      } else {
        emit('close')
      }
      break
    case 'ArrowRight':
      if (viewMode.value === 'single') goToNext()
      break
    case 'ArrowLeft':
      if (viewMode.value === 'single') goToPrev()
      break
  }
}

// Reset state when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    viewMode.value = 'grid'
    currentIndex.value = 0
    activeFilter.value = 'all'
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Obtenir l'extension du fichier pour l'affichage
function getFileExtension(item: MediaItem): string {
  const name = item.title_fr || item.url || ''
  const match = name.match(/\.(\w+)(\?|$)/)
  return match ? match[1].toUpperCase() : ''
}

// Un document PDF peut être affiché directement dans un iframe
function isInlineViewableDocument(item: MediaItem): boolean {
  if (detectType(item) !== 'document') return false
  if (item.mime_type === 'application/pdf') return true
  return getFileExtension(item) === 'PDF'
}

// Construit une URL forçant le téléchargement via ?download=1
function getDownloadUrl(item: MediaItem): string {
  const url = item.url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}download=1`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/90" @click="emit('close')"></div>

        <!-- Modal content -->
        <div class="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <button
                v-if="viewMode === 'single'"
                type="button"
                class="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                @click="backToGrid"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ viewMode === 'single' ? getLocalizedTitle(currentItem) : title }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  <template v-if="viewMode === 'single'">
                    {{ currentIndex + 1 }} / {{ filteredItems.length }}
                    <span v-if="currentItem.date" class="ml-2">· {{ formatDate(currentItem.date) }}</span>
                  </template>
                  <template v-else>
                    {{ filteredItems.length }} {{ filteredItems.length > 1 ? 'fichiers' : 'fichier' }}
                  </template>
                </p>
              </div>
            </div>
            <button
              type="button"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="emit('close')"
            >
              <font-awesome-icon icon="fa-solid fa-times" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <!-- Filtres par type -->
          <div v-if="showFilters && viewMode === 'grid'" class="px-6 pt-4 pb-2 flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              :class="activeFilter === 'all'
                ? 'bg-brand-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
              @click="activeFilter = 'all'"
            >
              Tout
              <span class="text-xs opacity-75">({{ items.length }})</span>
            </button>
            <button
              v-for="type in availableTypes"
              :key="type"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              :class="activeFilter === type
                ? 'bg-brand-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
              @click="activeFilter = type"
            >
              <font-awesome-icon :icon="getTypeIcon(type)" class="w-3.5 h-3.5" />
              {{ getTypeLabel(type) }}
              <span class="text-xs opacity-75">({{ countByType(type) }})</span>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto">
            <!-- Grid view -->
            <div v-if="viewMode === 'grid'" class="p-6">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <button
                  v-for="(item, index) in filteredItems"
                  :key="item.id"
                  type="button"
                  class="group relative aspect-square rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  @click="openSingleView(index)"
                >
                  <!-- Image thumbnail -->
                  <template v-if="detectType(item) === 'image'">
                    <img
                      :src="item.thumbnail || item.url"
                      :alt="getLocalizedTitle(item)"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </template>

                  <!-- Vidéo thumbnail -->
                  <template v-else-if="detectType(item) === 'video'">
                    <div class="w-full h-full bg-purple-50 dark:bg-purple-900/30 flex flex-col items-center justify-center gap-2">
                      <div class="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-800/50 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-play" class="w-6 h-6 text-purple-600 dark:text-purple-400 ml-0.5" />
                      </div>
                      <span class="text-xs text-purple-600 dark:text-purple-400 font-medium px-2 text-center line-clamp-2">{{ getLocalizedTitle(item) }}</span>
                    </div>
                  </template>

                  <!-- Audio thumbnail -->
                  <template v-else-if="detectType(item) === 'audio'">
                    <div class="w-full h-full bg-amber-50 dark:bg-amber-900/30 flex flex-col items-center justify-center gap-2">
                      <div class="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-headphones" class="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span class="text-xs text-amber-600 dark:text-amber-400 font-medium px-2 text-center line-clamp-2">{{ getLocalizedTitle(item) }}</span>
                    </div>
                  </template>

                  <!-- Document thumbnail -->
                  <template v-else>
                    <div class="w-full h-full bg-red-50 dark:bg-red-900/30 flex flex-col items-center justify-center gap-2">
                      <div class="w-14 h-14 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-file-lines" class="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span class="text-xs text-red-600 dark:text-red-400 font-medium px-2 text-center line-clamp-2">{{ getLocalizedTitle(item) }}</span>
                      <span v-if="getFileExtension(item)" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-800/50 text-red-500 dark:text-red-400">
                        {{ getFileExtension(item) }}
                      </span>
                    </div>
                  </template>

                  <!-- Hover overlay -->
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <font-awesome-icon
                      :icon="detectType(item) === 'image' ? 'fa-solid fa-expand' : getTypeIcon(detectType(item))"
                      class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  <!-- Badge type (pour les non-images) -->
                  <div
                    v-if="detectType(item) !== 'image'"
                    class="absolute top-2 left-2"
                  >
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/90 dark:bg-gray-800/90"
                      :class="getTypeColor(detectType(item))"
                    >
                      <font-awesome-icon :icon="getTypeIcon(detectType(item))" class="w-2.5 h-2.5" />
                      {{ detectType(item) }}
                    </span>
                  </div>

                  <!-- Title on hover (images seulement) -->
                  <div
                    v-if="detectType(item) === 'image'"
                    class="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <p class="text-white text-xs font-medium line-clamp-2">{{ getLocalizedTitle(item) }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Single view -->
            <div v-else class="relative flex items-center justify-center h-full min-h-[50vh] p-4">
              <!-- Previous button -->
              <button
                v-if="currentIndex > 0"
                type="button"
                class="absolute left-4 z-10 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
                @click="goToPrev"
              >
                <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-5 h-5" />
              </button>

              <!-- Image single view -->
              <img
                v-if="detectType(currentItem) === 'image'"
                :src="currentItem.url"
                :alt="getLocalizedTitle(currentItem)"
                class="max-w-full max-h-[70vh] object-contain rounded-lg"
              />

              <!-- Vidéo single view -->
              <div v-else-if="detectType(currentItem) === 'video'" class="w-full max-w-4xl">
                <video
                  :key="currentItem.id"
                  controls
                  class="w-full max-h-[70vh] rounded-lg bg-black"
                  preload="metadata"
                >
                  <source :src="currentItem.url" :type="currentItem.mime_type || 'video/mp4'" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>

              <!-- Audio single view -->
              <div v-else-if="detectType(currentItem) === 'audio'" class="w-full max-w-lg flex flex-col items-center gap-6 py-12">
                <div class="w-32 h-32 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-headphones" class="w-16 h-16 text-amber-500 dark:text-amber-400" />
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center">{{ getLocalizedTitle(currentItem) }}</h3>
                <audio
                  :key="currentItem.id"
                  controls
                  autoplay
                  class="w-full"
                  preload="metadata"
                >
                  <source :src="currentItem.url" :type="currentItem.mime_type || 'audio/mpeg'" />
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
                <a
                  :href="getDownloadUrl(currentItem)"
                  :download="getLocalizedTitle(currentItem)"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
                  Télécharger
                </a>
              </div>

              <!-- Document PDF: affichage inline via iframe -->
              <div
                v-else-if="isInlineViewableDocument(currentItem)"
                class="w-full h-full flex flex-col gap-3"
              >
                <div class="w-full h-[70vh] bg-white rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <iframe
                    :key="currentItem.id"
                    :src="currentItem.url"
                    :title="getLocalizedTitle(currentItem)"
                    class="w-full h-full"
                  ></iframe>
                </div>
                <div class="flex justify-center">
                  <a
                    :href="getDownloadUrl(currentItem)"
                    :download="getLocalizedTitle(currentItem)"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
                    Télécharger
                  </a>
                </div>
              </div>

              <!-- Autres documents: fallback avec téléchargement -->
              <div v-else class="flex flex-col items-center gap-6 py-12">
                <div class="w-32 h-32 rounded-2xl bg-red-50 dark:bg-red-900/30 flex flex-col items-center justify-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-file-lines" class="w-16 h-16 text-red-400 dark:text-red-500" />
                  <span v-if="getFileExtension(currentItem)" class="text-sm font-bold uppercase text-red-500">
                    {{ getFileExtension(currentItem) }}
                  </span>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center max-w-md">{{ getLocalizedTitle(currentItem) }}</h3>
                <a
                  :href="getDownloadUrl(currentItem)"
                  :download="getLocalizedTitle(currentItem)"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue-600 text-white font-medium hover:bg-brand-blue-700 transition-colors"
                >
                  <font-awesome-icon icon="fa-solid fa-download" class="w-4 h-4" />
                  Télécharger
                </a>
              </div>

              <!-- Next button -->
              <button
                v-if="currentIndex < filteredItems.length - 1"
                type="button"
                class="absolute right-4 z-10 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
                @click="goToNext"
              >
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Thumbnail strip in single view -->
          <div v-if="viewMode === 'single' && filteredItems.length > 1" class="border-t border-gray-200 dark:border-gray-700 p-4">
            <div class="flex gap-2 overflow-x-auto pb-2">
              <button
                v-for="(item, index) in filteredItems"
                :key="item.id"
                type="button"
                class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
                :class="index === currentIndex ? 'ring-2 ring-brand-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'opacity-60 hover:opacity-100'"
                @click="currentIndex = index"
              >
                <!-- Image thumb -->
                <img
                  v-if="detectType(item) === 'image'"
                  :src="item.thumbnail || item.url"
                  :alt="getLocalizedTitle(item)"
                  class="w-full h-full object-cover"
                />
                <!-- Non-image thumb -->
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                  :class="getTypeBg(detectType(item))"
                >
                  <font-awesome-icon
                    :icon="getTypeIcon(detectType(item))"
                    class="w-5 h-5"
                    :class="getTypeColor(detectType(item))"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
