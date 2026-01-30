<script setup lang="ts">
import type { ApplicationCallPublicWithDetails, CallType } from '~/types/api'

interface Props {
  call: ApplicationCallPublicWithDetails
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

// Format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Type mapping
const typeToI18nKey: Record<CallType, string> = {
  application: 'candidature',
  scholarship: 'bourse',
  project: 'projet',
  recruitment: 'recrutement',
  training: 'formation',
}

const getTypeLabel = (type: CallType) => {
  const key = typeToI18nKey[type]
  return t(`actualites.calls.filters.${key}`)
}

// Check if deadline has passed
const isDeadlinePassed = computed(() => {
  if (!props.call?.deadline) return false
  return new Date(props.call.deadline) < new Date()
})

// Days until deadline
const daysUntilDeadline = computed(() => {
  if (!props.call?.deadline) return 0
  const deadline = new Date(props.call.deadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})
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
