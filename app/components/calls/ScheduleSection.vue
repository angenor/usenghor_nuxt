<script setup lang="ts">
import type { CallScheduleRead } from '~/types/api'

interface Props {
  schedule: CallScheduleRead[]
  formatDate: (date: string | null) => string
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div v-if="schedule && schedule.length > 0" class="mb-8">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <font-awesome-icon icon="fa-solid fa-calendar-alt" class="text-brand-blue-500" />
      {{ t('actualites.detail.call.schedule') || 'Calendrier' }}
    </h3>
    <div class="relative">
      <!-- Timeline line -->
      <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      <div class="space-y-4">
        <div
          v-for="(step, index) in schedule"
          :key="step.id"
          class="relative flex gap-4 pl-2"
        >
          <!-- Timeline dot -->
          <div class="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 border-brand-blue-600 bg-white dark:bg-gray-900 flex items-center justify-center">
            <span class="text-xs font-bold text-brand-blue-600">{{ index + 1 }}</span>
          </div>
          <div class="flex-1 pb-4">
            <p class="font-medium text-gray-900 dark:text-white">{{ step.step }}</p>
            <div class="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span v-if="step.start_date">
                <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3 mr-1" />
                {{ formatDate(step.start_date) }}
              </span>
              <span v-if="step.end_date && step.start_date !== step.end_date">
                - {{ formatDate(step.end_date) }}
              </span>
            </div>
            <p v-if="step.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
