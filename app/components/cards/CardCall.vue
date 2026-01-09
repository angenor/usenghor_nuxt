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
  <div class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
    <div class="flex flex-col lg:flex-row">
      <!-- Image -->
      <div class="relative lg:w-80 h-48 lg:h-auto flex-shrink-0 overflow-hidden">
        <img
          :src="call.image"
          :alt="getLocalizedTitle"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          @error="($event.target as HTMLImageElement).src = `https://picsum.photos/seed/${call.id}/800/400`"
        >
        <!-- Overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:bg-gradient-to-t" />

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
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg animate-pulse">
            <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3" />
            {{ daysRemaining }} jours
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 p-6 flex flex-col justify-between">
        <div>
          <!-- Title -->
          <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {{ getLocalizedTitle }}
          </h3>

          <!-- Description -->
          <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 lg:line-clamp-3">
            {{ getLocalizedDescription }}
          </p>

          <!-- Deadline -->
          <div class="flex items-center gap-2 text-sm mb-4">
            <font-awesome-icon icon="fa-solid fa-calendar-check" class="w-4 h-4 text-amber-500" />
            <span class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.calls.deadline') }} :</span>
            <span class="font-semibold text-gray-900 dark:text-white">{{ formattedDeadline }}</span>
          </div>
        </div>

        <!-- Footer: Partners + Button -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <!-- Partner logos -->
          <div v-if="call.partner_logos && call.partner_logos.length > 0" class="flex items-center gap-3">
            <span class="text-xs text-gray-500 dark:text-gray-400">Partenaires :</span>
            <div class="flex items-center -space-x-2">
              <div
                v-for="(logo, index) in call.partner_logos.slice(0, 4)"
                :key="index"
                class="w-10 h-10 rounded-full bg-white dark:bg-gray-700 border-2 border-white dark:border-gray-800 overflow-hidden shadow-sm"
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
                class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center"
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
            class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 sm:ml-auto"
          >
            <span>{{ t('partners.campus.calls.apply') }}</span>
            <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
