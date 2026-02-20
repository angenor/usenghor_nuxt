<script setup lang="ts">
import type { CampusPublic } from '~/composables/usePublicCampusApi'
import type { OutputData } from '@editorjs/editorjs'

interface Props {
  campus: CampusPublic
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCoverImageUrl, getCampusLocation, getCampusFlagEmoji } = usePublicCampusApi()

// Convertir une string en OutputData
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
        version: '2.28.0',
      }
    }
  }
  return undefined
}

const descriptionData = computed(() => parseEditorContent(props.campus.description))
const location = computed(() => getCampusLocation(props.campus))
const flagEmoji = computed(() => getCampusFlagEmoji(props.campus))
const coverImage = computed(() => getCoverImageUrl(props.campus))
</script>

<template>
  <section class="py-12">
    <div class="mb-8">
      <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ campus.name }}
      </h2>
      <p v-if="location" class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <span v-if="flagEmoji" class="text-xl">{{ flagEmoji }}</span>
        <font-awesome-icon icon="fa-solid fa-location-dot" class="w-4 h-4" />
        {{ location }}
      </p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Description -->
      <div class="lg:col-span-2">
        <div v-if="descriptionData" class="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm">
          <div class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            <EditorJSRenderer :data="descriptionData" />
          </div>
        </div>
        <div v-else class="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm text-center">
          <font-awesome-icon icon="fa-solid fa-info-circle" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
          <p class="text-gray-500 dark:text-gray-400 text-lg">
            {{ t('partners.campus.noDescription') || 'Aucune description disponible' }}
          </p>
        </div>
      </div>

      <!-- Info card -->
      <div class="space-y-6">
        <!-- Cover image -->
        <div v-if="coverImage" class="rounded-2xl overflow-hidden shadow-sm">
          <img
            :src="coverImage"
            :alt="campus.name"
            class="w-full aspect-[4/3] object-cover"
          />
        </div>

        <!-- Contact -->
        <div v-if="campus.email || campus.phone || campus.address" class="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ t('partners.campus.tabs.presentation') }}
          </h3>
          <div v-if="campus.email" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-envelope" class="w-4 h-4 text-brand-blue-500" />
            <a :href="`mailto:${campus.email}`" class="hover:text-brand-blue-600 transition-colors">{{ campus.email }}</a>
          </div>
          <div v-if="campus.phone" class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-phone" class="w-4 h-4 text-brand-blue-500" />
            <a :href="`tel:${campus.phone}`" class="hover:text-brand-blue-600 transition-colors">{{ campus.phone }}</a>
          </div>
          <div v-if="campus.address" class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-map-marker-alt" class="w-4 h-4 text-brand-blue-500 mt-0.5" />
            <span>{{ campus.address }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
