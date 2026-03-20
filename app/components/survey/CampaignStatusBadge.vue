<script setup lang="ts">
import type { SurveyCampaignStatus } from '~/types/survey'
import { surveyStatusColors, surveyStatusLabels } from '~/composables/useAdminSurveyApi'

const props = defineProps<{
  status: SurveyCampaignStatus
}>()

const label = computed(() => surveyStatusLabels[props.status] || props.status)
const colorClass = computed(() => surveyStatusColors[props.status] || 'bg-gray-100 text-gray-800')
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClass,
    ]"
  >
    {{ label }}
  </span>
</template>
