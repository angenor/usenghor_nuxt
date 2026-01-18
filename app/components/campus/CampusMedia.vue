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

// Album modal state
const albumModalOpen = ref(false)

const openPhotoAlbum = () => {
  albumModalOpen.value = true
}
</script>

<template>
  <div class="py-8">
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      <span class="relative inline-block">
        {{ t('partners.campus.media.title') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
      </span>
    </h2>

    <!-- Videos Section -->
    <div v-if="videos.length > 0" class="mb-10">
      <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-video" class="w-4 h-4 text-brand-red-500" />
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
            <h5 class="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
              {{ getLocalizedTitle(video) }}
            </h5>
          </div>
        </a>
      </div>
    </div>

    <!-- Photos Section - Album Style -->
    <div v-if="photos.length > 0">
      <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-images" class="w-4 h-4 text-brand-red-500" />
        {{ t('partners.campus.media.photos') }}
      </h4>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Album card with stacked images -->
        <MediaAlbumCard
          :title="t('partners.campus.media.photoAlbum')"
          :items="photos"
          @click="openPhotoAlbum"
        />
      </div>

      <!-- Album modal -->
      <MediaAlbumModal
        :open="albumModalOpen"
        :title="t('partners.campus.media.photoAlbum')"
        :items="photos"
        @close="albumModalOpen = false"
      />
    </div>

    <!-- Empty state -->
    <div v-if="videos.length === 0 && photos.length === 0" class="text-center py-12">
      <font-awesome-icon icon="fa-solid fa-photo-film" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noMedia') }}</p>
    </div>
  </div>
</template>
