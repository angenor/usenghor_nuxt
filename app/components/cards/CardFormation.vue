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

// Get localized title
const getLocalizedTitle = computed(() => {
  if (locale.value === 'en' && props.formation.title_en) {
    return props.formation.title_en
  }
  if (locale.value === 'ar' && props.formation.title_ar) {
    return props.formation.title_ar
  }
  return props.formation.title_fr
})

// Get localized description
const getLocalizedDescription = computed(() => {
  if (locale.value === 'en' && props.formation.short_description_en) {
    return props.formation.short_description_en
  }
  return props.formation.short_description_fr
})

// Get localized duration
const getLocalizedDuration = computed(() => {
  if (locale.value === 'en' && props.formation.duration_en) {
    return props.formation.duration_en
  }
  return props.formation.duration_fr
})

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
</script>

<template>
  <NuxtLink
    :to="detailUrl"
    class="blog-card group relative block w-full h-[380px] bg-cover bg-center bg-no-repeat overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    :style="{ backgroundImage: `url(${formation.image || 'https://picsum.photos/seed/' + formation.slug + '/800/500'})` }"
  >
    <!-- Content mask (white area on left) -->
    <div class="content-mask">
      <!-- Badges row -->
      <div class="flex flex-wrap items-center gap-2 my-4">
        <!-- Type badge -->
        <span
          v-if="showType"
          class="inline-block px-3 py-1.5 text-xs font-semibold text-white rounded shadow-md tracking-wide"
          :class="typeBgColors[formation.formation_type]"
        >
          {{ t(`formations.types.${formation.formation_type}`) }}
        </span>

        <!-- Campus badge -->
        <span
          class="inline-block px-2 py-1 text-xs font-medium rounded"
          :class="campusBgColors[formation.campus]"
        >
          {{ t(`formations.campus.${formation.campus}`) }}
        </span>

        <!-- Application status badge -->
        <span
          v-if="formation.application_open"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded"
        >
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          {{ t('formations.card.applicationOpen') }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2 pb-1 border-b-2 border-gray-300 dark:border-gray-600 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {{ getLocalizedTitle }}
      </h3>

      <!-- Description -->
      <p class="text-gray-700 dark:text-gray-300 text-sm lg:text-base leading-relaxed line-clamp-3 mt-2">
        {{ getLocalizedDescription }}
      </p>

      <!-- Info row -->
      <div class="post-detail">
        <!-- Duration -->
        <font-awesome-icon icon="fa-solid fa-clock" class="inline-block w-4 h-4 mr-1.5 align-middle text-amber-500" />
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ getLocalizedDuration }}</span>

        <!-- Credits -->
        <template v-if="formation.credits">
          <span class="mx-2 text-gray-400">•</span>
          <font-awesome-icon icon="fa-solid fa-award" class="inline-block w-4 h-4 mr-1 align-middle text-amber-500" />
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ formation.credits }}</span>
          <span class="text-sm text-gray-600 dark:text-gray-400 ml-1">{{ t('formations.card.credits') }}</span>
        </template>
      </div>

      <!-- Deadline -->
      <div v-if="formation.application_open && formattedDeadline" class="absolute bottom-4 left-8">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-4 h-4 text-red-500" />
          <span class="font-medium">{{ t('formations.card.deadline') }} :</span>
          <span class="font-semibold text-red-600 dark:text-red-400">{{ formattedDeadline }}</span>
        </div>
      </div>
    </div>

    <!-- Diagonal transition -->
    <div class="horizontal" />
  </NuxtLink>
</template>

<style scoped>
.blog-card {
  background-color: #444;
}

.content-mask {
  display: inline-block;
  background: rgba(255, 255, 255, 0.92);
  width: 61%;
  height: 100%;
  padding: 0.75em 0 0.75em 2em;
  overflow: hidden;
  vertical-align: top;
  position: relative;
}

.horizontal {
  display: inline-block;
  position: relative;
  background: linear-gradient(to top right, rgba(255, 255, 255, 0.92) 50%, transparent 50%);
  height: 101%;
  width: 20%;
  top: -0.5%;
  vertical-align: top;
}

.post-detail {
  color: rgba(0, 0, 0, 0.55);
  margin-top: 1.5rem;
  padding-left: 2px;
}

/* Dark mode */
.dark .content-mask {
  background: rgba(17, 24, 39, 0.92);
}

.dark .horizontal {
  background: linear-gradient(to top right, rgba(17, 24, 39, 0.92) 50%, transparent 50%);
}

.dark .post-detail {
  color: rgba(255, 255, 255, 0.55);
}

/* Mobile: full width content, no diagonal */
@media (max-width: 640px) {
  .content-mask {
    width: 100%;
    padding: 1rem;
  }
  .horizontal {
    display: none;
  }
  .blog-card {
    height: auto;
    min-height: 300px;
  }
}
</style>
