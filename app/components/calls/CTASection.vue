<script setup lang="ts">
import type { ApplicationCallPublicWithDetails } from '~/types/api'

interface Props {
  call: ApplicationCallPublicWithDetails
  isDeadlinePassed: boolean
}

defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="mb-8">
    <!-- External form URL (ongoing with external link) -->
    <a
      v-if="call.external_form_url && call.status === 'ongoing'"
      :href="call.external_form_url"
      target="_blank"
      class="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
    >
      <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-5 h-5" />
      {{ t('actualites.detail.call.apply') }}
      <font-awesome-icon icon="fa-solid fa-external-link" class="w-4 h-4" />
    </a>
    <!-- Closed -->
    <div
      v-else-if="call.status === 'closed' || isDeadlinePassed"
      class="inline-flex items-center gap-3 px-8 py-4 bg-gray-400 text-white text-lg font-bold rounded-xl cursor-not-allowed"
    >
      <font-awesome-icon icon="fa-solid fa-lock" class="w-5 h-5" />
      {{ t('actualites.detail.call.closed') }}
    </div>
    <!-- Upcoming -->
    <div
      v-else-if="call.status === 'upcoming'"
      class="inline-flex items-center gap-3 px-8 py-4 bg-yellow-500 text-white text-lg font-bold rounded-xl cursor-not-allowed"
    >
      <font-awesome-icon icon="fa-solid fa-clock" class="w-5 h-5" />
      {{ t('actualites.calls.status.upcoming') || 'À venir' }}
    </div>
    <!-- Internal form (default for ongoing calls or any other status) -->
    <NuxtLink
      v-else
      :to="localePath(`/candidatures/postuler/${call.slug}`)"
      class="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
    >
      <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-5 h-5" />
      {{ t('actualites.detail.call.apply') }}
    </NuxtLink>
  </div>
</template>
