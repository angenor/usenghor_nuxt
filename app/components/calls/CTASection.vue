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
    <NuxtLink
      v-else-if="call.use_internal_form && call.status === 'ongoing'"
      :to="localePath(`/candidatures/postuler/${call.slug}`)"
      class="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
    >
      <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-5 h-5" />
      {{ t('actualites.detail.call.apply') }}
    </NuxtLink>
    <div
      v-else-if="call.status === 'closed'"
      class="inline-flex items-center gap-3 px-8 py-4 bg-gray-400 text-white text-lg font-bold rounded-xl cursor-not-allowed"
    >
      <font-awesome-icon icon="fa-solid fa-lock" class="w-5 h-5" />
      {{ t('actualites.detail.call.closed') }}
    </div>
    <div
      v-else-if="call.status === 'upcoming'"
      class="inline-flex items-center gap-3 px-8 py-4 bg-yellow-500 text-white text-lg font-bold rounded-xl cursor-not-allowed"
    >
      <font-awesome-icon icon="fa-solid fa-clock" class="w-5 h-5" />
      {{ t('actualites.calls.status.upcoming') || 'À venir' }}
    </div>
  </div>
</template>
