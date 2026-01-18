<script setup lang="ts">
interface MediaItem {
  id: string
  title_fr: string
  title_en?: string
  url: string
  thumbnail?: string
  date?: string
}

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

// Navigation
const currentItem = computed(() => props.items[currentIndex.value])

const goToNext = () => {
  if (currentIndex.value < props.items.length - 1) {
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
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
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
                    {{ currentIndex + 1 }} / {{ items.length }}
                    <span v-if="currentItem.date" class="ml-2">• {{ formatDate(currentItem.date) }}</span>
                  </template>
                  <template v-else>
                    {{ items.length }} {{ items.length > 1 ? 'photos' : 'photo' }}
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

          <!-- Content -->
          <div class="flex-1 overflow-y-auto">
            <!-- Grid view -->
            <div v-if="viewMode === 'grid'" class="p-6">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <button
                  v-for="(item, index) in items"
                  :key="item.id"
                  type="button"
                  class="group relative aspect-square rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                  @click="openSingleView(index)"
                >
                  <img
                    :src="item.thumbnail || item.url"
                    :alt="getLocalizedTitle(item)"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <font-awesome-icon
                      icon="fa-solid fa-expand"
                      class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <!-- Title on hover -->
                  <div class="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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

              <!-- Image -->
              <img
                :src="currentItem.url"
                :alt="getLocalizedTitle(currentItem)"
                class="max-w-full max-h-[70vh] object-contain rounded-lg"
              />

              <!-- Next button -->
              <button
                v-if="currentIndex < items.length - 1"
                type="button"
                class="absolute right-4 z-10 w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
                @click="goToNext"
              >
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Thumbnail strip in single view -->
          <div v-if="viewMode === 'single' && items.length > 1" class="border-t border-gray-200 dark:border-gray-700 p-4">
            <div class="flex gap-2 overflow-x-auto pb-2">
              <button
                v-for="(item, index) in items"
                :key="item.id"
                type="button"
                class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all"
                :class="index === currentIndex ? 'ring-2 ring-brand-blue-500 ring-offset-2 dark:ring-offset-gray-900' : 'opacity-60 hover:opacity-100'"
                @click="currentIndex = index"
              >
                <img
                  :src="item.thumbnail || item.url"
                  :alt="getLocalizedTitle(item)"
                  class="w-full h-full object-cover"
                />
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
