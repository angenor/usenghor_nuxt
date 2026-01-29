<script setup lang="ts">
import type { CampusPartnerPublic } from '~/composables/usePublicCampusApi'

interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { getCampusPartners, getPartnerLogoUrl, getPartnerFlagEmoji } = usePublicCampusApi()

// Fetch partners from API
const { data: partners, pending } = await useAsyncData(
  `campus-partners-${props.campusId}`,
  () => getCampusPartners(props.campusId),
  { server: true }
)

const campusPartners = computed(() => partners.value || [])

// Partner type colors
const typeColors: Record<string, string> = {
  charter_operator: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  campus_partner: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  program_partner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  project_partner: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

// Get type label
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    charter_operator: t('partners.types.charterOperator'),
    campus_partner: t('partners.types.campusPartner'),
    program_partner: t('partners.types.programPartner'),
    project_partner: t('partners.types.projectPartner'),
    other: t('partners.types.other'),
  }
  return typeMap[type] || type
}
</script>

<template>
  <div class="py-8">
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      <span class="relative inline-block">
        {{ t('partners.campus.tabs.partners') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
      </span>
    </h2>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-500"></div>
    </div>

    <div v-else-if="campusPartners.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Partner Card -->
      <div
        v-for="partner in campusPartners"
        :key="partner.id"
        class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <!-- Logo Container -->
        <div class="relative h-40 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-6">
          <img
            :src="getPartnerLogoUrl(partner)"
            :alt="partner.name"
            class="max-h-24 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          >
          <!-- Country Flag -->
          <div
            v-if="partner.country_iso_code"
            class="absolute top-3 right-3 text-2xl"
            :title="partner.country_name_fr || ''"
          >
            {{ getPartnerFlagEmoji(partner) }}
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 p-5 flex flex-col">
          <!-- Type Badge -->
          <span
            class="self-start px-3 py-1 text-xs font-medium rounded-full mb-3"
            :class="typeColors[partner.type] || typeColors.other"
          >
            {{ getTypeLabel(partner.type) }}
          </span>

          <!-- Name -->
          <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
            {{ partner.name }}
          </h3>

          <!-- Description -->
          <p
            v-if="partner.description"
            class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1"
          >
            {{ partner.description }}
          </p>

          <!-- Actions -->
          <div class="mt-auto">
            <a
              v-if="partner.website"
              :href="partner.website"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-3.5 h-3.5" />
              {{ t('partners.card.visitWebsite') }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!pending" class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <font-awesome-icon icon="fa-solid fa-handshake" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noPartners') }}</p>
    </div>
  </div>
</template>
