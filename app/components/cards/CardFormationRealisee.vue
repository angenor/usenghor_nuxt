<script setup lang="ts">
import type { CampusFormationRealisee } from '~/composables/useMockData'
import type { ApplicationCallPublic } from '~/types/api'

// Support both mock data type and API type
type FormationData = CampusFormationRealisee | ApplicationCallPublic

interface Props {
  formation: FormationData
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

// Helper to check if it's an API call
const isApiCall = computed(() => 'slug' in props.formation && 'cover_image_external_id' in props.formation)

// Get localized title
const getLocalizedTitle = computed(() => {
  if (isApiCall.value) {
    return (props.formation as ApplicationCallPublic).title
  }
  const mockFormation = props.formation as CampusFormationRealisee
  if (locale.value === 'en' && mockFormation.title_en) {
    return mockFormation.title_en
  }
  if (locale.value === 'ar' && mockFormation.title_ar) {
    return mockFormation.title_ar
  }
  return mockFormation.title_fr
})

// Extract plain text from EditorJS JSON or return as-is
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .filter((block: { type: string }) => block.type === 'paragraph' || block.type === 'header')
        .map((block: { data: { text: string } }) => {
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
  if (isApiCall.value) {
    return extractPlainText((props.formation as ApplicationCallPublic).description)
  }
  const mockFormation = props.formation as CampusFormationRealisee
  if (locale.value === 'en' && mockFormation.description_en) {
    return mockFormation.description_en
  }
  return mockFormation.description_fr
})

// Get image URL (null if no image available)
const formationImage = computed(() => {
  if (isApiCall.value) {
    const apiCall = props.formation as ApplicationCallPublic
    return apiCall.cover_image_external_id
      ? `/api/public/media/${apiCall.cover_image_external_id}/download?variant=medium`
      : null
  }
  const mockFormation = props.formation as CampusFormationRealisee
  return mockFormation.image || null
})

// Get formation type
const formationType = computed(() => {
  if (isApiCall.value) {
    // API calls of type 'training' map to 'certifiante' for display
    return 'certifiante'
  }
  return (props.formation as CampusFormationRealisee).formation_type
})

// Get promotion info (only for mock data)
const promotion = computed(() => {
  if (isApiCall.value) return null
  return (props.formation as CampusFormationRealisee).promotion
})

// Get graduates count (only for mock data)
const graduatesCount = computed(() => {
  if (isApiCall.value) return null
  return (props.formation as CampusFormationRealisee).graduates_count
})

// Get partner logos (only for mock data)
const partnerLogos = computed(() => {
  if (isApiCall.value) return []
  return (props.formation as CampusFormationRealisee).partner_logos || []
})

// Type badge colors
const typeBgColors: Record<string, string> = {
  master: 'bg-indigo-500',
  du: 'bg-teal-500',
  certifiante: 'bg-rose-500'
}

// Type labels
const typeLabels: Record<string, string> = {
  master: 'Master',
  du: 'DU',
  certifiante: 'Certificat'
}
</script>

<template>
  <div
    class="blog-card group relative block w-full h-[380px] bg-cover bg-center bg-no-repeat overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
    :style="formationImage ? { backgroundImage: `url(${formationImage})` } : {}"
  >
    <!-- Icon placeholder when no cover image -->
    <div
      v-if="!formationImage"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
    >
      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-16 h-16 text-gray-400 dark:text-gray-500" />
    </div>
    <!-- Content mask (white area on left) - inline-block -->
    <div class="content-mask">
      <!-- Type badge -->
      <span
        class="inline-block px-3 py-1.5 text-xs font-semibold text-white rounded shadow-md tracking-wide my-4"
        :class="typeBgColors[formationType]"
      >
        {{ typeLabels[formationType] }}
      </span>

      <!-- Title -->
      <h3 class="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-gray-900 leading-tight mb-2 pb-1 border-b-2 border-gray-300">
        {{ getLocalizedTitle }}
      </h3>

      <!-- Description -->
      <p v-if="getLocalizedDescription" class="text-gray-700 text-sm lg:text-base leading-relaxed line-clamp-3 mt-2">
        {{ getLocalizedDescription }}
      </p>

      <!-- Promotion & Graduates info (only for mock data) -->
      <div v-if="promotion && graduatesCount" class="post-detail">
        <font-awesome-icon icon="fa-solid fa-calendar-check" class="inline-block w-4 h-4 mr-2 align-middle" />
        <span class="text-sm text-gray-600">{{ promotion }}</span>
        <span class="mx-2 text-gray-400">•</span>
        <font-awesome-icon icon="fa-solid fa-user-graduate" class="inline-block w-4 h-4 mr-1 align-middle text-brand-red-500" />
        <span class="text-sm font-semibold text-gray-700">{{ graduatesCount }}</span>
        <span class="text-sm text-gray-600 ml-1">{{ t('partners.campus.formations.graduates') }}</span>
      </div>

      <!-- Partner logos (only for mock data) -->
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
