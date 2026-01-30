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

    <!-- Eligibility Criteria (important for recruitment) -->
    <CallsEligibilitySection :criteria="call.eligibility_criteria" />

    <!-- NO Program Dates for recruitment -->
    <!-- NO Registration Fee for recruitment -->
    <!-- NO Coverage for recruitment -->

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
