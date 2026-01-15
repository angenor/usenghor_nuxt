<script setup lang="ts">
import type { Formation } from '~/composables/useMockData'

interface Props {
  formation: Formation
  showType?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showType: true
})

const { t, locale } = useI18n()
const localePath = useLocalePath()

// Mapping type to URL slug
const typeToSlug: Record<string, string> = {
  master: 'masters',
  doctorat: 'doctorats',
  du: 'diplomes-universitaires',
  certifiante: 'certifiantes'
}

// Type badge colors
const typeBgColors: Record<string, string> = {
  master: 'bg-indigo-500',
  doctorat: 'bg-purple-600',
  du: 'bg-teal-500',
  certifiante: 'bg-rose-500'
}

// Campus badge colors
const campusBgColors: Record<string, string> = {
  alexandrie: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  externalise: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_ligne: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

// Get localized title
const localizedTitle = computed(() => {
  if (locale.value === 'en' && props.formation.title_en) {
    return props.formation.title_en
  }
  if (locale.value === 'ar' && props.formation.title_ar) {
    return props.formation.title_ar
  }
  return props.formation.title_fr
})

// Get localized description
const localizedDescription = computed(() => {
  if (locale.value === 'en' && props.formation.short_description_en) {
    return props.formation.short_description_en
  }
  return props.formation.short_description_fr
})

// Get localized duration
const localizedDuration = computed(() => {
  if (locale.value === 'en' && props.formation.duration_en) {
    return props.formation.duration_en
  }
  return props.formation.duration_fr
})

// Detail page URL
const detailUrl = computed(() => {
  const typeSlug = typeToSlug[props.formation.formation_type]
  return localePath(`/formations/${typeSlug}/${props.formation.slug}`)
})

// Format deadline date
const formattedDeadline = computed(() => {
  if (!props.formation.application_deadline) return null
  const date = new Date(props.formation.application_deadline)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
})

// Image URL with fallback
const imageUrl = computed(() => {
  return props.formation.image || `https://picsum.photos/seed/${props.formation.slug}/800/500`
})
</script>

<template>
  <div class="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <NuxtLink :to="detailUrl" class="block">
      <!-- Image -->
      <div class="relative h-48 overflow-hidden">
        <img
          :src="imageUrl"
          :alt="localizedTitle"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <!-- Type badge -->
        <span
          v-if="showType"
          class="absolute top-4 left-4 px-3 py-1 text-xs font-semibold text-white rounded-full shadow-md"
          :class="typeBgColors[props.formation.formation_type]"
        >
          {{ t(`formations.types.${props.formation.formation_type}`) }}
        </span>
        <!-- Application open badge -->
        <span
          v-if="props.formation.application_open"
          class="absolute top-4 right-4 px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full flex items-center gap-1"
        >
          <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {{ t('formations.card.applicationOpen') }}
        </span>
      </div>

      <!-- Content -->
      <div class="p-5">
        <!-- Campus badge -->
        <span
          class="inline-block px-2 py-1 text-xs font-medium rounded mb-3"
          :class="campusBgColors[props.formation.campus]"
        >
          {{ t(`formations.campus.${props.formation.campus}`) }}
        </span>

        <!-- Title -->
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {{ localizedTitle }}
        </h3>

        <!-- Description -->
        <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {{ localizedDescription }}
        </p>

        <!-- Info row -->
        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-1">
            <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4 text-amber-500" />
            <span>{{ localizedDuration }}</span>
          </div>
          <div v-if="props.formation.credits" class="flex items-center gap-1">
            <font-awesome-icon icon="fa-solid fa-award" class="w-4 h-4 text-amber-500" />
            <span>{{ props.formation.credits }} {{ t('formations.card.credits') }}</span>
          </div>
        </div>

        <!-- Deadline -->
        <div v-if="props.formation.application_open && formattedDeadline" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 text-sm">
            <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-4 h-4 text-red-500" />
            <span class="text-gray-600 dark:text-gray-400">{{ t('formations.card.deadline') }} :</span>
            <span class="font-semibold text-red-600 dark:text-red-400">{{ formattedDeadline }}</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
