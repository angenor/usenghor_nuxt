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
}

interface Props {
  title: string
  items: MediaItem[]
  itemCount?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: []
}>()

// Show up to 3 images in the stack (préférer les images pour la vignette)
const imageItems = computed(() => props.items.filter(i => !i.type || i.type === 'image'))
const stackImages = computed(() => {
  const images = imageItems.value.slice(0, 3)
  // Si pas assez d'images, compléter avec les autres items
  if (images.length < 3) {
    const others = props.items.filter(i => i.type && i.type !== 'image')
    return [...images, ...others].slice(0, 3)
  }
  return images
})
const totalCount = computed(() => props.itemCount ?? props.items.length)

// Compteurs par type
const typeCounts = computed(() => {
  const counts: Partial<Record<MediaType, number>> = {}
  props.items.forEach(item => {
    const t = item.type || 'image'
    counts[t] = (counts[t] || 0) + 1
  })
  return counts
})

function getTypeIcon(type: MediaType): string {
  switch (type) {
    case 'image': return 'fa-solid fa-image'
    case 'video': return 'fa-solid fa-film'
    case 'audio': return 'fa-solid fa-headphones'
    case 'document': return 'fa-solid fa-file-lines'
  }
}

function isImageItem(item: MediaItem): boolean {
  return !item.type || item.type === 'image'
}
</script>

<template>
  <button
    type="button"
    class="group relative w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2 rounded-2xl"
    @click="emit('click')"
  >
    <!-- Stacked images container -->
    <div class="relative h-48 sm:h-56 flex items-center justify-center">
      <!-- Third image (back) - rotated right -->
      <div
        v-if="stackImages[2]"
        class="absolute inset-2 rounded-xl overflow-hidden shadow-md transition-all duration-300 rotate-6 group-hover:rotate-10"
      >
        <img
          :src="stackImages[2].thumbnail || stackImages[2].url"
          :alt="stackImages[2].title_fr"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/20"></div>
      </div>

      <!-- Second image (middle) - rotated left -->
      <div
        v-if="stackImages[1]"
        class="absolute inset-2 rounded-xl overflow-hidden shadow-lg transition-all duration-300 -rotate-4 group-hover:-rotate-6"
      >
        <img
          :src="stackImages[1].thumbnail || stackImages[1].url"
          :alt="stackImages[1].title_fr"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/10"></div>
      </div>

      <!-- First image (front) - slight rotation -->
      <div
        v-if="stackImages[0]"
        class="absolute inset-2 rounded-xl overflow-hidden shadow-xl transition-all duration-300 rotate-1 group-hover:rotate-0 group-hover:scale-[1.02]"
      >
        <img
          :src="stackImages[0].thumbnail || stackImages[0].url"
          :alt="stackImages[0].title_fr"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        <!-- Photo count badge -->
        <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
          <font-awesome-icon icon="fa-solid fa-images" class="w-3.5 h-3.5" />
          {{ totalCount }}
        </div>

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div class="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
            <font-awesome-icon icon="fa-solid fa-expand" class="w-5 h-5 text-gray-900" />
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="!stackImages[0]"
        class="absolute inset-2 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
      >
        <font-awesome-icon icon="fa-solid fa-images" class="w-12 h-12 text-gray-300 dark:text-gray-600" />
      </div>
    </div>

    <!-- Album title -->
    <div class="mt-4 px-1">
      <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors line-clamp-2">
        {{ title }}
      </h3>
      <div class="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
        <span>{{ totalCount }} {{ totalCount > 1 ? 'fichiers' : 'fichier' }}</span>
        <template v-if="Object.keys(typeCounts).length > 1">
          <span class="text-gray-300 dark:text-gray-600">·</span>
          <span v-for="(count, type) in typeCounts" :key="type" class="inline-flex items-center gap-0.5">
            <font-awesome-icon :icon="getTypeIcon(type as MediaType)" class="w-3 h-3" />
            {{ count }}
          </span>
        </template>
      </div>
    </div>
  </button>
</template>
