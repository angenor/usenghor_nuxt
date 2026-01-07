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
    class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4"
    :class="isDeadlineSoon ? 'border-l-amber-500' : 'border-l-blue-500'"
  >
    <!-- Header -->
    <div class="p-5 pb-0">
      <!-- Type and urgent badges -->
      <div class="flex items-center gap-2 flex-wrap mb-3">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full"
          :class="typeColors[call.type]"
        >
          <font-awesome-icon :icon="typeIcons[call.type]" class="w-3 h-3" />
          {{ t(`partners.campus.calls.types.${call.type}`) }}
        </span>
        <span
          v-if="isDeadlineSoon"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium rounded-full"
        >
          <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3" />
          {{ daysRemaining }} jours
        </span>
      </div>

      <!-- Title -->
      <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {{ getLocalizedTitle }}
      </h3>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 pt-2 flex flex-col">
      <!-- Description -->
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
        {{ getLocalizedDescription }}
      </p>

      <!-- Deadline -->
      <div class="flex items-center gap-2 text-sm mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <font-awesome-icon icon="fa-solid fa-calendar-check" class="w-4 h-4 text-amber-500" />
        <span class="text-gray-600 dark:text-gray-300">
          {{ t('partners.campus.calls.deadline') }} :
        </span>
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ formattedDeadline }}
        </span>
      </div>

      <!-- Apply button -->
      <a
        v-if="call.url"
        :href="call.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
      >
        <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-4 h-4" />
        {{ t('partners.campus.calls.apply') }}
      </a>
    </div>
  </div>
</template>
