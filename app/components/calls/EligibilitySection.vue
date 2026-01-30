<script setup lang="ts">
import type { CallEligibilityCriteriaRead } from '~/types/api'

interface Props {
  criteria: CallEligibilityCriteriaRead[]
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div v-if="criteria && criteria.length > 0" class="mb-8">
    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      <font-awesome-icon icon="fa-solid fa-list-check" class="text-brand-blue-500" />
      {{ t('actualites.detail.call.eligibilityCriteria') || "Critères d'éligibilité" }}
    </h3>
    <div class="space-y-3">
      <div
        v-for="criterion in criteria"
        :key="criterion.id"
        class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
      >
        <div
          class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          :class="criterion.is_mandatory ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'"
        >
          <font-awesome-icon
            :icon="criterion.is_mandatory ? 'fa-solid fa-asterisk' : 'fa-solid fa-check'"
            class="w-3 h-3"
          />
        </div>
        <div>
          <p class="text-gray-700 dark:text-gray-300">{{ criterion.criterion }}</p>
          <span v-if="criterion.is_mandatory" class="text-xs text-red-600 dark:text-red-400 font-medium">
            Obligatoire
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
