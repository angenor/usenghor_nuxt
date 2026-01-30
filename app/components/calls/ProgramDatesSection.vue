<script setup lang="ts">
interface Props {
  startDate: string | null
  endDate: string | null
  formatDate: (date: string | null) => string
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div v-if="startDate || endDate" class="mb-8">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <font-awesome-icon icon="fa-solid fa-calendar-days" class="text-brand-blue-500" />
      {{ t('actualites.detail.call.programDates') || 'Dates du programme' }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-if="startDate" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div class="text-sm text-blue-600 dark:text-blue-400 mb-1">
          {{ t('actualites.detail.call.programStart') || 'Début du programme' }}
        </div>
        <p class="text-lg font-bold text-gray-900 dark:text-white">
          {{ formatDate(startDate) }}
        </p>
      </div>
      <div v-if="endDate" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div class="text-sm text-blue-600 dark:text-blue-400 mb-1">
          {{ t('actualites.detail.call.programEnd') || 'Fin du programme' }}
        </div>
        <p class="text-lg font-bold text-gray-900 dark:text-white">
          {{ formatDate(endDate) }}
        </p>
      </div>
    </div>
  </div>
</template>
