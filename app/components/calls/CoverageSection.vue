<script setup lang="ts">
import type { CallCoverageRead } from '~/types/api'

interface Props {
  coverage: CallCoverageRead[]
  title?: string
  icon?: string
  prominent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'fa-solid fa-gift',
  prominent: false,
})

const { t } = useI18n()

const sectionTitle = computed(() => props.title || t('actualites.detail.call.coverage') || 'Prises en charge')
</script>

<template>
  <div v-if="coverage && coverage.length > 0" class="mb-8">
    <h3
      class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
      :class="prominent ? 'text-xl' : 'text-lg'"
    >
      <font-awesome-icon :icon="icon" :class="prominent ? 'text-purple-500' : 'text-brand-blue-500'" />
      {{ sectionTitle }}
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="item in coverage"
        :key="item.id"
        class="flex items-start gap-3 p-4 rounded-xl border"
        :class="prominent
          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
          : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'"
      >
        <div
          class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          :class="prominent
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'"
        >
          <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3" />
        </div>
        <div>
          <p class="font-medium text-gray-900 dark:text-white">{{ item.item }}</p>
          <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
