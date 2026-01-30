<script setup lang="ts">
import type { ApplicationCallPublicWithDetails } from '~/types/api'
import { useCallDetail } from '../composables/useCallDetail'

interface Props {
  call: ApplicationCallPublicWithDetails
}

const props = defineProps<Props>()
const { t } = useI18n()

const callRef = toRef(props, 'call')
const {
  formatDate,
  getTypeLabel,
  isDeadlinePassed,
  daysUntilDeadline,
} = useCallDetail(callRef)
</script>

<template>
  <div>
    <!-- Info Cards -->
    <CallsInfoCards
      :call="call"
      :is-deadline-passed="isDeadlinePassed"
      :days-until-deadline="daysUntilDeadline"
      :format-date="formatDate"
      :get-type-label="getTypeLabel"
    />

    <!-- Description -->
    <CallsDescriptionSection :description="call.description" />

    <!-- Coverage/Benefits (MAIN SECTION for scholarships) -->
    <CallsCoverageSection
      v-if="call.coverage && call.coverage.length > 0"
      :coverage="call.coverage"
      :title="t('actualites.detail.call.scholarshipBenefits') || 'Avantages de la bourse'"
      icon="fa-solid fa-medal"
      prominent
    />

    <!-- Target Audience -->
    <CallsTargetAudienceSection :target-audience="call.target_audience" />

    <!-- Eligibility Criteria -->
    <CallsEligibilitySection :criteria="call.eligibility_criteria" />

    <!-- NO Program Dates for scholarships -->
    <!-- NO Registration Fee for scholarships -->

    <!-- Required Documents -->
    <CallsDocumentsSection :documents="call.required_documents" />

    <!-- Schedule -->
    <CallsScheduleSection
      :schedule="call.schedule"
      :format-date="formatDate"
    />

    <!-- CTA -->
    <CallsCTASection
      :call="call"
      :is-deadline-passed="isDeadlinePassed"
    />
  </div>
</template>
