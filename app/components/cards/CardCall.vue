<script setup lang="ts">
import type { ApplicationCallPublic, CallType } from '~/types/api'
import type { CampusCall } from '~/composables/useMockData'

// Support both API type and mock data type
type CallData = ApplicationCallPublic | CampusCall

interface Props {
  call: CallData
}

const props = defineProps<Props>()
const { t, locale } = useI18n()
const localePath = useLocalePath()

// Helper to check if it's an API call
const isApiCall = computed(() => 'slug' in props.call)

// Get localized title
const getLocalizedTitle = computed(() => {
  if (isApiCall.value) {
    return (props.call as ApplicationCallPublic).title
  }
  const mockCall = props.call as CampusCall
  if (locale.value === 'en' && mockCall.title_en) {
    return mockCall.title_en
  }
  if (locale.value === 'ar' && mockCall.title_ar) {
    return mockCall.title_ar
  }
  return mockCall.title_fr
})

// Extract plain text from EditorJS JSON or return as-is
const extractPlainText = (content: string): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      // Extract text from paragraph and header blocks
      return parsed.blocks
        .filter((block: { type: string }) => block.type === 'paragraph' || block.type === 'header')
        .map((block: { data: { text: string } }) => {
          // Remove HTML tags from text
          const text = block.data?.text || ''
          return text.replace(/<[^>]*>/g, '')
        })
        .join(' ')
        .trim()
    }
  } catch {
    // Not JSON, return as-is
  }
  return content
}

// Get localized description
const getLocalizedDescription = computed(() => {
  let rawDescription = ''
  if (isApiCall.value) {
    rawDescription = (props.call as ApplicationCallPublic).description || ''
  } else {
    const mockCall = props.call as CampusCall
    if (locale.value === 'en' && mockCall.description_en) {
      rawDescription = mockCall.description_en
    } else if (locale.value === 'ar' && mockCall.description_ar) {
      rawDescription = mockCall.description_ar
    } else {
      rawDescription = mockCall.description_fr
    }
  }
  return extractPlainText(rawDescription)
})

// Get deadline
const deadline = computed(() => {
  if (isApiCall.value) {
    return (props.call as ApplicationCallPublic).deadline
  }
  return (props.call as CampusCall).deadline
})

// Format deadline date
const formattedDeadline = computed(() => {
  if (!deadline.value) return ''
  const date = new Date(deadline.value)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
})

// Check if deadline is soon (within 30 days)
const isDeadlineSoon = computed(() => {
  if (!deadline.value) return false
  const deadlineDate = new Date(deadline.value)
  const now = new Date()
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 30
})

// Days remaining
const daysRemaining = computed(() => {
  if (!deadline.value) return 0
  const deadlineDate = new Date(deadline.value)
  const now = new Date()
  const diffTime = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Get call type for display
const callType = computed(() => {
  if (isApiCall.value) {
    return (props.call as ApplicationCallPublic).type
  }
  return (props.call as CampusCall).type
})

// Map API types to translation keys
const apiTypeToKey: Record<CallType, string> = {
  application: 'candidature',
  scholarship: 'bourse',
  project: 'projet',
  recruitment: 'recrutement',
  training: 'formation',
}

// Get type key for translation
const typeKey = computed(() => {
  if (isApiCall.value) {
    return apiTypeToKey[callType.value as CallType] || callType.value
  }
  return callType.value
})

// Type badge colors (support both API and mock types)
const typeBgColors: Record<string, string> = {
  candidature: 'bg-brand-blue-500',
  application: 'bg-brand-blue-500',
  projet: 'bg-brand-blue-600',
  project: 'bg-brand-blue-600',
  bourse: 'bg-brand-red-500',
  scholarship: 'bg-brand-red-500',
  recrutement: 'bg-brand-red-600',
  recruitment: 'bg-brand-red-600',
  training: 'bg-cyan-500',
  formation: 'bg-cyan-500',
}

// Get URL
const callUrl = computed(() => {
  if (isApiCall.value) {
    const apiCall = props.call as ApplicationCallPublic
    // Link to detail page or external URL
    return apiCall.external_form_url || localePath(`/candidatures/${apiCall.slug}`)
  }
  return (props.call as CampusCall).url
})

// Get image (null if no image available)
const callImage = computed(() => {
  if (isApiCall.value) {
    const apiCall = props.call as ApplicationCallPublic
    return apiCall.cover_image_external_id
      ? `/api/public/media/${apiCall.cover_image_external_id}/download?variant=medium`
      : null
  }
  return (props.call as CampusCall).image || null
})

// Get partner logos (only for mock data)
const partnerLogos = computed(() => {
  if (isApiCall.value) {
    return []
  }
  return (props.call as CampusCall).partner_logos || []
})
</script>

<template>
  <div
    class="blog-card group relative block w-full h-[380px] bg-cover bg-center bg-no-repeat overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    :style="callImage ? { backgroundImage: `url(${callImage})` } : {}"
  >
    <!-- Icon placeholder when no cover image -->
    <div
      v-if="!callImage"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
    >
      <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-16 h-16 text-gray-400 dark:text-gray-500" />
    </div>
    <!-- Content mask (white area on left) - inline-block -->
    <div class="content-mask">
      <!-- Type badge -->
      <span
        class="inline-block px-3 py-1.5 text-xs font-semibold text-white rounded shadow-md tracking-wide my-4"
        :class="typeBgColors[callType] || 'bg-gray-500'"
      >
        {{ t(`partners.campus.calls.types.${typeKey}`) }}
      </span>

      <!-- Title -->
      <h3 class="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-gray-900 leading-tight mb-2 pb-1 border-b-2 border-gray-300">
        <NuxtLink
          v-if="callUrl"
          :to="callUrl"
          class="hover:text-brand-blue-600 transition-colors duration-200"
        >
          {{ getLocalizedTitle }}
        </NuxtLink>
        <span v-else>{{ getLocalizedTitle }}</span>
      </h3>

      <!-- Description -->
      <p class="text-gray-700 text-sm lg:text-base leading-relaxed line-clamp-3 mt-2">
        {{ getLocalizedDescription }}
      </p>

      <!-- Deadline info -->
      <div v-if="deadline" class="post-detail">
        <font-awesome-icon icon="fa-regular fa-calendar" class="inline-block w-4 h-4 mr-2 align-middle" />
        <span class="text-sm text-gray-600">{{ formattedDeadline }}</span>
        <span v-if="isDeadlineSoon" class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-brand-red-500 text-white text-xs font-medium rounded-full animate-pulse">
          {{ daysRemaining }}j
        </span>
      </div>

      <!-- Partner logos (mock data only) -->
      <div v-if="partnerLogos.length > 0" class="absolute bottom-4 left-8 flex items-center gap-2">
        <div
          v-for="(logo, index) in partnerLogos.slice(0, 4)"
          :key="index"
          class="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden shadow-md -ml-1 first:ml-0"
        >
          <img :src="logo" alt="Partenaire" class="w-full h-full object-contain p-1.5" loading="lazy">
        </div>
        <span v-if="partnerLogos.length > 4" class="text-xs text-gray-500 ml-1 font-medium">+{{ partnerLogos.length - 4 }}</span>
      </div>
    </div>

    <!-- Diagonal transition - inline-block next to content-mask -->
    <div class="horizontal" />

    <!-- Apply button (floating on right over image) -->
    <NuxtLink
      v-if="callUrl"
      :to="callUrl"
      class="absolute bottom-5 right-5 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 z-20"
    >
      <span>{{ t('partners.campus.calls.apply') }}</span>
      <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
    </NuxtLink>
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
  height: 100%;
  width: 30px;
  vertical-align: top;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 60' preserveAspectRatio='none'%3E%3Cpath d='M0,0 Q15,15 0,30 Q15,45 0,60 L0,60 L0,0 Z' fill='rgba(255,255,255,0.92)'/%3E%3C/svg%3E");
  background-repeat: repeat-y;
  background-size: 100% 60px;
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 60' preserveAspectRatio='none'%3E%3Cpath d='M0,0 Q15,15 0,30 Q15,45 0,60 L0,60 L0,0 Z' fill='rgba(17,24,39,0.92)'/%3E%3C/svg%3E");
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
