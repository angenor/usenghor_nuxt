<script setup lang="ts">
import type { CampusPublic } from '~/composables/usePublicCampusApi'
import type { OutputData } from '@editorjs/editorjs'

interface Props {
  campus: CampusPublic
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCoverImageUrl, getCampusFlagEmoji, getCampusLocation } = usePublicCampusApi()

// Cover image URL (with fallback)
const coverImage = computed(() => getCoverImageUrl(props.campus))

// Flag emoji
const flagEmoji = computed(() => getCampusFlagEmoji(props.campus))

// Location (city, country)
const location = computed(() => getCampusLocation(props.campus))

// Convertir une string (potentiellement JSON ou texte brut) en OutputData
const parseEditorContent = (content: string | null | undefined): OutputData | undefined => {
  if (!content) return undefined
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: content } }],
        version: '2.28.0'
      }
    }
  }
  return undefined
}

// Description parsée pour EditorJSRenderer
const descriptionData = computed(() => parseEditorContent(props.campus.description))

// Expose title ref for intersection observer
const titleRef = ref<HTMLElement | null>(null)
defineExpose({ titleRef })
</script>

<template>
  <section class="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        :src="coverImage"
        :alt="campus.name"
        class="w-full h-full object-cover opacity-30"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent"></div>
    </div>

    <!-- Decorative elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-red-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <!-- Text Content -->
        <div>
          <!-- Badge -->
          <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/30 backdrop-blur-sm mb-6">
            <span class="text-xl">{{ flagEmoji }}</span>
            {{ campus.is_headquarters ? t('partners.campus.headquarters') : t('partners.campus.externalCampus') }}
          </span>

          <!-- Title -->
          <h1 ref="titleRef" class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            {{ campus.name }}
          </h1>

          <!-- Location -->
          <div v-if="location" class="flex items-center gap-2 text-xl text-blue-200 mb-6">
            <font-awesome-icon icon="fa-solid fa-location-dot" class="w-5 h-5" />
            {{ location }}
          </div>

          <!-- Description -->
          <div v-if="descriptionData" class="text-lg text-gray-200 leading-relaxed mb-8 max-w-2xl">
            <EditorJSRenderer :data="descriptionData" />
          </div>

          <!-- Contact -->
          <div class="flex flex-wrap gap-4">
            <a
              v-if="campus.email"
              :href="`mailto:${campus.email}`"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4" />
              {{ campus.email }}
            </a>
            <a
              v-if="campus.phone"
              :href="`tel:${campus.phone}`"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-phone" class="w-4 h-4" />
              {{ campus.phone }}
            </a>
          </div>
        </div>

        <!-- Image Card -->
        <div class="relative">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              :src="coverImage"
              :alt="campus.name"
              class="w-full aspect-[4/3] object-cover"
            >
          </div>
          <!-- Decorative frame -->
          <div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-brand-blue-500/30 rounded-2xl -z-10"></div>
        </div>
      </div>
    </div>
  </section>
</template>
