<script setup lang="ts">
import type { ApplicationCallPublicWithDetails, CallType } from '~/types/api'

interface Props {
  relatedCalls: ApplicationCallPublicWithDetails[]
  typeBadgeColors: Record<CallType, string>
  getTypeLabel: (type: CallType) => string
  formatShortDate: (date: string | null) => string
}

defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()

const getCallImage = (call: ApplicationCallPublicWithDetails) => {
  if (call.cover_image_external_id) {
    return `/api/public/media/${call.cover_image_external_id}/download?variant=low`
  }
  return null
}
</script>

<template>
  <section v-if="relatedCalls.length > 0" class="mt-12">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      <span class="relative inline-block">
        {{ t('actualites.detail.call.relatedCalls') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
      </span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <article
        v-for="item in relatedCalls"
        :key="item.id"
        class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <NuxtLink :to="localePath(`/actualites/appels/${item.slug}`)">
          <div class="overflow-hidden h-32">
            <img
              v-if="getCallImage(item)"
              :src="getCallImage(item)!"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            >
            <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <span
                class="inline-block px-2 py-0.5 text-xs font-medium text-white rounded"
                :class="typeBadgeColors[item.type]"
              >
                {{ getTypeLabel(item.type) }}
              </span>
            </div>

            <h3 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
              {{ item.title }}
            </h3>

            <div v-if="item.deadline" class="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
              {{ t('actualites.calls.deadline') }}: {{ formatShortDate(item.deadline) }}
            </div>
          </div>
        </NuxtLink>
      </article>
    </div>
  </section>
</template>
