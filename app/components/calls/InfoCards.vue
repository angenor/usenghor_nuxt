<script setup lang="ts">
import type { ApplicationCallPublicWithDetails, CallType } from '~/types/api'

interface Props {
  call: ApplicationCallPublicWithDetails
  isDeadlinePassed: boolean
  daysUntilDeadline: number
  formatDate: (date: string | null) => string
  getTypeLabel: (type: CallType) => string
}

const props = defineProps<Props>()
const { t } = useI18n()

// Résoudre le nom du pays à partir de l'ID
const { getCountryById } = useCountriesApi()
const countryName = ref<string | null>(null)

watch(() => props.call.country_external_id, async (id) => {
  if (!id) {
    countryName.value = null
    return
  }
  const country = await getCountryById(id)
  countryName.value = country?.name_fr || null
}, { immediate: true })
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <!-- Deadline -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
        <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
        {{ t('actualites.detail.call.deadline') }}
      </div>
      <div
        class="font-bold"
        :class="isDeadlinePassed ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'"
      >
        {{ formatDate(call.deadline) }}
      </div>
      <div
        v-if="!isDeadlinePassed && daysUntilDeadline <= 14 && daysUntilDeadline > 0"
        class="text-xs mt-1 text-orange-600 dark:text-orange-400 font-medium"
      >
        {{ daysUntilDeadline }} {{ daysUntilDeadline === 1 ? 'jour restant' : 'jours restants' }}
      </div>
      <div
        v-else-if="isDeadlinePassed"
        class="text-xs mt-1 text-gray-500 dark:text-gray-400"
      >
        {{ t('actualites.detail.call.deadlinePassed') }}
      </div>
    </div>

    <!-- Opening date -->
    <div v-if="call.opening_date" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
        <font-awesome-icon icon="fa-solid fa-door-open" class="w-4 h-4" />
        {{ t('actualites.detail.call.openingDate') || 'Ouverture' }}
      </div>
      <div class="font-bold text-gray-900 dark:text-white">
        {{ formatDate(call.opening_date) }}
      </div>
    </div>

    <!-- Lieu -->
    <div v-if="countryName || call.location_address" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
        <font-awesome-icon icon="fa-solid fa-map-marker-alt" class="w-4 h-4" />
        {{ t('actualites.detail.call.location') || 'Lieu' }}
      </div>
      <div class="font-bold text-gray-900 dark:text-white">
        {{ countryName }}
      </div>
      <div v-if="call.location_address" class="text-xs mt-1 text-gray-500 dark:text-gray-400">
        {{ call.location_address }}
      </div>
    </div>
    <!-- Type (fallback si pas de lieu renseigné) -->
    <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
        <font-awesome-icon icon="fa-solid fa-tag" class="w-4 h-4" />
        {{ t('actualites.detail.call.type') }}
      </div>
      <div class="font-bold text-gray-900 dark:text-white">
        {{ getTypeLabel(call.type) }}
      </div>
    </div>

    <!-- Status -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
        <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4" />
        {{ t('actualites.detail.call.status') }}
      </div>
      <div
        class="font-bold"
        :class="call.status === 'ongoing' ? 'text-green-600 dark:text-green-400' : call.status === 'upcoming' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'"
      >
        {{ call.status === 'ongoing' ? t('actualites.detail.call.statusOpen') : call.status === 'upcoming' ? (t('actualites.calls.status.upcoming') || 'À venir') : t('actualites.detail.call.statusClosed') }}
      </div>
    </div>
  </div>
</template>
