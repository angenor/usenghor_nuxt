<script setup lang="ts">
import type { CampusCall } from '~/composables/useMockData'

interface Props {
  call: CampusCall
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

// Get localized title
const getLocalizedTitle = computed(() => {
  if (locale.value === 'en' && props.call.title_en) {
    return props.call.title_en
  }
  if (locale.value === 'ar' && props.call.title_ar) {
    return props.call.title_ar
  }
  return props.call.title_fr
})

// Get localized description
const getLocalizedDescription = computed(() => {
  if (locale.value === 'en' && props.call.description_en) {
    return props.call.description_en
  }
  if (locale.value === 'ar' && props.call.description_ar) {
    return props.call.description_ar
  }
  return props.call.description_fr
})

// Format deadline
const formattedDeadline = computed(() => {
  const date = new Date(props.call.deadline)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

// Check if deadline is soon (within 30 days)
const isDeadlineSoon = computed(() => {
  const deadline = new Date(props.call.deadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 30
})

// Days remaining
const daysRemaining = computed(() => {
  const deadline = new Date(props.call.deadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Type badge colors
const typeColors: Record<string, string> = {
  candidature: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  projet: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  bourse: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
}

// Type icons
const typeIcons: Record<string, string> = {
  candidature: 'fa-solid fa-user-plus',
  projet: 'fa-solid fa-lightbulb',
  bourse: 'fa-solid fa-graduation-cap'
}
</script>

<template>
  <div
    class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
  >
    <!-- Image -->
    <div class="relative h-48 overflow-hidden">
      <img
        :src="call.image"
        :alt="getLocalizedTitle"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="($event.target as HTMLImageElement).src = `https://picsum.photos/seed/${call.id}/800/400`"
      >
      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <!-- Type badge on image -->
      <div class="absolute top-4 left-4">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm"
          :class="typeColors[call.type]"
        >
          <font-awesome-icon :icon="typeIcons[call.type]" class="w-3 h-3" />
          {{ t(`partners.campus.calls.types.${call.type}`) }}
        </span>
      </div>

      <!-- Urgent badge -->
      <div v-if="isDeadlineSoon" class="absolute top-4 right-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg">
          <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3" />
          {{ daysRemaining }} jours
        </span>
      </div>

      <!-- Deadline on image -->
      <div class="absolute bottom-4 left-4 right-4">
        <div class="flex items-center gap-2 text-white text-sm">
          <font-awesome-icon icon="fa-solid fa-calendar-check" class="w-4 h-4 text-amber-400" />
          <span class="opacity-90">{{ t('partners.campus.calls.deadline') }} :</span>
          <span class="font-semibold">{{ formattedDeadline }}</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <!-- Title -->
      <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {{ getLocalizedTitle }}
      </h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
        {{ getLocalizedDescription }}
      </p>

      <!-- Partner logos -->
      <div v-if="call.partner_logos && call.partner_logos.length > 0" class="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
        <span class="text-xs text-gray-500 dark:text-gray-400 mr-1">Partenaires :</span>
        <div class="flex items-center -space-x-2">
          <div
            v-for="(logo, index) in call.partner_logos.slice(0, 4)"
            :key="index"
            class="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-white dark:border-gray-800 overflow-hidden shadow-sm"
          >
            <img
              :src="logo"
              alt="Partenaire"
              class="w-full h-full object-contain p-1"
              loading="lazy"
            >
          </div>
          <div
            v-if="call.partner_logos.length > 4"
            class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center"
          >
            <span class="text-xs font-medium text-gray-600 dark:text-gray-300">+{{ call.partner_logos.length - 4 }}</span>
          </div>
        </div>
      </div>

      <!-- Apply button -->
      <a
        v-if="call.url"
        :href="call.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
      >
        <span>{{ t('partners.campus.calls.apply') }}</span>
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
      </a>
    </div>
  </div>
</template>
