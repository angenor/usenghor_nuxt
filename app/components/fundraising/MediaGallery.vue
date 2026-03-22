<script setup lang="ts">
import type { FundraiserMediaItem } from '~/types/fundraising'

const props = defineProps<{
  media: FundraiserMediaItem[]
  locale: string
}>()

const { t } = useI18n()
const { resolveMediaUrl } = usePublicFundraisingApi()

// Lightbox state
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const currentMedia = computed(() => props.media[lightboxIndex.value] ?? null)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function nextImage() {
  if (lightboxIndex.value < props.media.length - 1) {
    lightboxIndex.value++
  }
}

function prevImage() {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  }
}

// Get caption in locale
function getCaption(item: FundraiserMediaItem): string | null {
  if (props.locale === 'en' && item.caption_en) return item.caption_en
  if (props.locale === 'ar' && item.caption_ar) return item.caption_ar
  return item.caption_fr
}

// Resolve image URL
function getImageUrl(item: FundraiserMediaItem): string {
  if (item.media_url) return item.media_url
  return resolveMediaUrl(item.media_external_id) ?? ''
}

// Keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div>
    <!-- Empty state -->
    <p
      v-if="media.length === 0"
      class="text-center text-gray-500 dark:text-gray-400 py-12"
    >
      {{ t('leveesDeFonds.detail.media.empty') }}
    </p>

    <!-- Gallery grid -->
    <div
      v-else
      class="grid grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <button
        v-for="(item, index) in media"
        :key="item.id"
        class="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        @click="openLightbox(index)"
      >
        <img
          :src="getImageUrl(item)"
          :alt="getCaption(item) || ''"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        >
        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <font-awesome-icon
            icon="fa-solid fa-expand"
            class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        </div>
        <!-- Caption overlay -->
        <div
          v-if="getCaption(item)"
          class="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent"
        >
          <p class="text-xs text-white truncate">{{ getCaption(item) }}</p>
        </div>
      </button>
    </div>

    <!-- Lightbox modal -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen && currentMedia"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          @click.self="closeLightbox"
        >
          <!-- Close button -->
          <button
            class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
            @click="closeLightbox"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="w-6 h-6" />
          </button>

          <!-- Prev button -->
          <button
            v-if="lightboxIndex > 0"
            class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
            @click="prevImage"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-5 h-5" />
          </button>

          <!-- Next button -->
          <button
            v-if="lightboxIndex < media.length - 1"
            class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
            @click="nextImage"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-5 h-5" />
          </button>

          <!-- Image -->
          <div class="max-w-5xl max-h-[85vh] w-full mx-4 flex flex-col items-center">
            <img
              :src="getImageUrl(currentMedia)"
              :alt="getCaption(currentMedia) || ''"
              class="max-w-full max-h-[75vh] object-contain rounded-lg"
            >
            <!-- Caption -->
            <p
              v-if="getCaption(currentMedia)"
              class="mt-4 text-white/80 text-sm text-center max-w-xl"
            >
              {{ getCaption(currentMedia) }}
            </p>
            <!-- Counter -->
            <p class="mt-2 text-white/50 text-xs">
              {{ lightboxIndex + 1 }} / {{ media.length }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
