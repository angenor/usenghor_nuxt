<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const { getCampusMediaByType } = useMockData()

const videos = computed(() => getCampusMediaByType(props.campusId, 'video'))
const photos = computed(() => getCampusMediaByType(props.campusId, 'photo'))

// Get localized title
const getLocalizedTitle = (media: any) => {
  if (locale.value === 'en' && media.title_en) return media.title_en
  return media.title_fr
}

// Lightbox state
const lightboxOpen = ref(false)
const currentPhoto = ref<any>(null)

const openLightbox = (photo: any) => {
  currentPhoto.value = photo
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
  currentPhoto.value = null
}
</script>

<template>
  <div class="py-8">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
      {{ t('partners.campus.media.title') }}
    </h3>

    <!-- Videos Section -->
    <div v-if="videos.length > 0" class="mb-10">
      <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-video" class="w-4 h-4 text-amber-500" />
        {{ t('partners.campus.media.videos') }}
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="video in videos"
          :key="video.id"
          :href="video.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative block bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div class="relative aspect-video overflow-hidden">
            <img
              :src="video.thumbnail"
              :alt="getLocalizedTitle(video)"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <!-- Play button overlay -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <font-awesome-icon icon="fa-solid fa-play" class="w-6 h-6 text-gray-900 ml-1" />
              </div>
            </div>
          </div>
          <div class="p-4">
            <h5 class="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {{ getLocalizedTitle(video) }}
            </h5>
          </div>
        </a>
      </div>
    </div>

    <!-- Photos Section -->
    <div v-if="photos.length > 0">
      <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-images" class="w-4 h-4 text-amber-500" />
        {{ t('partners.campus.media.photos') }}
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <button
          v-for="photo in photos"
          :key="photo.id"
          class="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
          @click="openLightbox(photo)"
        >
          <img
            :src="photo.thumbnail || photo.url"
            :alt="getLocalizedTitle(photo)"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          >
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <font-awesome-icon
              icon="fa-solid fa-expand"
              class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="videos.length === 0 && photos.length === 0" class="text-center py-12">
      <font-awesome-icon icon="fa-solid fa-photo-film" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noMedia') }}</p>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="lightboxOpen && currentPhoto"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          @click.self="closeLightbox"
        >
          <button
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            @click="closeLightbox"
          >
            <font-awesome-icon icon="fa-solid fa-times" class="w-5 h-5" />
          </button>
          <img
            :src="currentPhoto.url"
            :alt="getLocalizedTitle(currentPhoto)"
            class="max-w-full max-h-[90vh] object-contain rounded-lg"
          >
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
