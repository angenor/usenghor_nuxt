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

    <!-- Target Audience -->
    <CallsTargetAudienceSection :target-audience="call.target_audience" />

    <!-- Program Dates (specific to training) -->
    <CallsProgramDatesSection
      :start-date="call.program_start_date"
      :end-date="call.program_end_date"
      :format-date="formatDate"
    />

    <!-- Course Fee (specific to training - different label) -->
    <CallsRegistrationFeeSection
      :fee="call.registration_fee"
      :currency="call.currency"
      label-key="courseFee"
    />

    <!-- Coverage/What's Included -->
    <CallsCoverageSection
      v-if="call.coverage && call.coverage.length > 0"
      :coverage="call.coverage"
      :title="t('actualites.detail.call.whatsIncluded') || 'Ce qui est inclus'"
      icon="fa-solid fa-box-open"
    />

    <!-- Eligibility Criteria -->
    <CallsEligibilitySection :criteria="call.eligibility_criteria" />

    <!-- Required Documents -->
    <CallsDocumentsSection :documents="call.required_documents" />

    <!-- Schedule (important for training) -->
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
