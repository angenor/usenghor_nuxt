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

// Format deadline date
const formattedDeadline = computed(() => {
  const date = new Date(props.call.deadline)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
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
const typeBgColors: Record<string, string> = {
  candidature: 'bg-blue-500',
  projet: 'bg-emerald-500',
  bourse: 'bg-purple-500'
}
</script>

<template>
  <div
    class="blog-card group relative block w-full max-w-4xl h-[380px] bg-cover bg-center bg-no-repeat overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 mx-auto"
    :style="{ backgroundImage: `url(${call.image})` }"
  >
    <!-- Content mask (white area on left) - inline-block -->
    <div class="content-mask">
      <!-- Type badge -->
      <span
        class="inline-block px-3 py-1.5 text-xs font-semibold text-white rounded shadow-md tracking-wide my-4"
        :class="typeBgColors[call.type]"
      >
        {{ t(`partners.campus.calls.types.${call.type}`) }}
      </span>

      <!-- Title -->
      <h3 class="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-gray-900 leading-tight mb-2 pb-1 border-b-2 border-gray-300">
        {{ getLocalizedTitle }}
      </h3>

      <!-- Description -->
      <p class="text-gray-700 text-sm lg:text-base leading-relaxed line-clamp-3 mt-2">
        {{ getLocalizedDescription }}
      </p>

      <!-- Deadline info -->
      <div class="post-detail">
        <font-awesome-icon icon="fa-regular fa-calendar" class="inline-block w-4 h-4 mr-2 align-middle" />
        <span class="text-sm text-gray-600">{{ formattedDeadline }}</span>
        <span v-if="isDeadlineSoon" class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full animate-pulse">
          {{ daysRemaining }}j
        </span>
      </div>

      <!-- Partner logos -->
      <div v-if="call.partner_logos && call.partner_logos.length > 0" class="absolute bottom-4 left-8 flex items-center gap-1">
        <div
          v-for="(logo, index) in call.partner_logos.slice(0, 3)"
          :key="index"
          class="w-8 h-8 rounded-full bg-white border border-gray-200 overflow-hidden shadow-sm -ml-2 first:ml-0"
        >
          <img :src="logo" alt="Partenaire" class="w-full h-full object-contain p-1" loading="lazy">
        </div>
        <span v-if="call.partner_logos.length > 3" class="text-xs text-gray-500 ml-1">+{{ call.partner_logos.length - 3 }}</span>
      </div>
    </div>

    <!-- Diagonal transition - inline-block next to content-mask -->
    <div class="horizontal" />

    <!-- Apply button (floating on right over image) -->
    <a
      v-if="call.url"
      :href="call.url"
      target="_blank"
      rel="noopener noreferrer"
      class="absolute bottom-5 right-5 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 z-20"
    >
      <span>{{ t('partners.campus.calls.apply') }}</span>
      <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
    </a>
  </div>
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

.dark h3 {
  color: white;
}

.dark p {
  color: #d1d5db;
}

.dark .post-detail {
  color: rgba(255, 255, 255, 0.55);
}

.dark .post-detail span {
  color: #9ca3af;
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
