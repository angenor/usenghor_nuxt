<script setup lang="ts">
import type { CampusEvent } from '~/composables/useMockData'

interface Props {
  event: CampusEvent
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

// Get localized title
const getLocalizedTitle = computed(() => {
  if (locale.value === 'en' && props.event.title_en) {
    return props.event.title_en
  }
  if (locale.value === 'ar' && props.event.title_ar) {
    return props.event.title_ar
  }
  return props.event.title_fr
})

// Get localized location
const getLocalizedLocation = computed(() => {
  if (locale.value === 'en' && props.event.location_en) {
    return props.event.location_en
  }
  return props.event.location_fr
})

// Format date
const formattedDate = computed(() => {
  const date = new Date(props.event.date)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Check if event is past
const isPast = computed(() => {
  return new Date(props.event.date) < new Date()
})

// Type badge colors
const typeColors: Record<string, string> = {
  conference: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  atelier: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ceremonie: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  autre: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

// Type icons
const typeIcons: Record<string, string> = {
  conference: 'fa-solid fa-microphone',
  atelier: 'fa-solid fa-users',
  ceremonie: 'fa-solid fa-award',
  autre: 'fa-solid fa-calendar'
}
</script>

<template>
  <div
    class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    :class="{ 'opacity-75': isPast }"
  >
    <!-- Image -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        v-if="event.image"
        :src="event.image"
        :alt="getLocalizedTitle"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      >
      <div v-else class="w-full h-full bg-gradient-to-br from-brand-blue-400 to-brand-blue-600 flex items-center justify-center">
        <font-awesome-icon :icon="typeIcons[event.type]" class="w-12 h-12 text-white/50" />
      </div>

      <!-- Past badge -->
      <div
        v-if="isPast"
        class="absolute top-3 left-3 px-2 py-1 bg-gray-800/80 text-white text-xs font-medium rounded-full"
      >
        {{ t('partners.campus.events.past') }}
      </div>

      <!-- Type badge -->
      <div
        class="absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full"
        :class="typeColors[event.type]"
      >
        {{ t(`partners.campus.events.types.${event.type}`) }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <!-- Date -->
      <div class="flex items-center gap-2 text-brand-red-600 dark:text-brand-red-400 text-sm font-medium mb-2">
        <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
        {{ formattedDate }}
      </div>

      <!-- Title -->
      <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
        {{ getLocalizedTitle }}
      </h3>

      <!-- Location -->
      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <font-awesome-icon icon="fa-solid fa-location-dot" class="w-4 h-4" />
        {{ getLocalizedLocation }}
      </div>

      <!-- Description -->
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
        {{ event.description_fr }}
      </p>
    </div>
  </div>
</template>
