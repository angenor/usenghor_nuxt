<script setup lang="ts">
interface Props {
  projectId: string
}

const props = defineProps<Props>()

const { t, locale } = useI18n()
const { getProjectMediaByType } = useMockData()

// Get media for this project
const videos = computed(() => getProjectMediaByType(props.projectId, 'video'))
const photos = computed(() => getProjectMediaByType(props.projectId, 'photo'))

// Check if we have any media
const hasMedia = computed(() => videos.value.length > 0 || photos.value.length > 0)

// Active tab
const activeMediaTab = ref<'videos' | 'photos'>('videos')

// Localization helpers
const getLocalizedTitle = (item: any) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  return item.title_fr
}

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Get YouTube video ID from URL
const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? match[1] : null
}
</script>

<template>
  <div class="py-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
      <font-awesome-icon icon="fa-solid fa-photo-film" class="text-brand-blue-500" />
      {{ t('projets.mediatheque.title') }}
    </h2>

    <!-- Empty state -->
    <div
      v-if="!hasMedia"
      class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl"
    >
      <font-awesome-icon icon="fa-solid fa-photo-film" class="w-12 h-12 text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">{{ t('projets.mediatheque.noMedia') }}</p>
    </div>

    <template v-else>
      <!-- Media tabs -->
      <div class="flex gap-2 mb-6">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeMediaTab === 'videos'
            ? 'bg-brand-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
          @click="activeMediaTab = 'videos'"
        >
          <font-awesome-icon icon="fa-solid fa-video" class="w-4 h-4" />
          {{ t('projets.mediatheque.videos') }}
          <span class="ml-1 px-1.5 py-0.5 text-xs rounded-full" :class="activeMediaTab === 'videos' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'">
            {{ videos.length }}
          </span>
        </button>
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeMediaTab === 'photos'
            ? 'bg-brand-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
          @click="activeMediaTab = 'photos'"
        >
          <font-awesome-icon icon="fa-solid fa-images" class="w-4 h-4" />
          {{ t('projets.mediatheque.photos') }}
          <span class="ml-1 px-1.5 py-0.5 text-xs rounded-full" :class="activeMediaTab === 'photos' ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'">
            {{ photos.length }}
          </span>
        </button>
      </div>

      <!-- Videos -->
      <div v-if="activeMediaTab === 'videos'">
        <div v-if="videos.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          {{ t('projets.mediatheque.noVideos') }}
        </div>
        <div v-else class="grid gap-6 md:grid-cols-2">
          <article
            v-for="video in videos"
            :key="video.id"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <!-- Video thumbnail -->
            <a
              :href="video.url"
              target="_blank"
              rel="noopener noreferrer"
              class="relative block aspect-video bg-gray-100 dark:bg-gray-900 group"
            >
              <img
                :src="video.thumbnail || `https://img.youtube.com/vi/${getYouTubeId(video.url)}/hqdefault.jpg`"
                :alt="getLocalizedTitle(video)"
                class="w-full h-full object-cover"
              />
              <!-- Play button overlay -->
              <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <div class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <font-awesome-icon icon="fa-solid fa-play" class="w-6 h-6 text-brand-blue-600 ml-1" />
                </div>
              </div>
            </a>

            <!-- Video info -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ getLocalizedTitle(video) }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(video.date) }}
              </p>
            </div>
          </article>
        </div>
      </div>

      <!-- Photos -->
      <div v-if="activeMediaTab === 'photos'">
        <div v-if="photos.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          {{ t('projets.mediatheque.noPhotos') }}
        </div>
        <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <a
            v-for="photo in photos"
            :key="photo.id"
            :href="photo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <img
              :src="photo.thumbnail || photo.url"
              :alt="getLocalizedTitle(photo)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <!-- Overlay on hover -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
              <div class="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 class="font-medium text-sm">{{ getLocalizedTitle(photo) }}</h3>
                <p class="text-xs text-white/70">{{ formatDate(photo.date) }}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </template>
  </div>
</template>
