<script setup lang="ts">
import type { ApplicationCallPublicWithDetails } from '~/types/api'
import { useCallDetail } from '../composables/useCallDetail'

interface Props {
  call: ApplicationCallPublicWithDetails
}

const props = defineProps<Props>()

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

    <!-- Eligibility Criteria -->
    <CallsEligibilitySection :criteria="call.eligibility_criteria" />

    <!-- Program Dates (specific to application) -->
    <CallsProgramDatesSection
      :start-date="call.program_start_date"
      :end-date="call.program_end_date"
      :format-date="formatDate"
    />

    <!-- Registration Fee (specific to application) -->
    <CallsRegistrationFeeSection
      :fee="call.registration_fee"
      :currency="call.currency"
      label-key="registrationFee"
    />

    <!-- Coverage -->
    <CallsCoverageSection :coverage="call.coverage" />

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
