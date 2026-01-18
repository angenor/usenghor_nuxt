<script setup lang="ts">
interface Props {
  campusId: string
}

const props = defineProps<Props>()
const { t } = useI18n()
const { partenaires } = useMockData()

// For now, show all partners (in real app, filter by campus relationship)
// This could be enhanced with a campus_partenaires junction table
const campusPartners = computed(() => {
  // Return first 6 partners as mock campus partners
  return partenaires.value.slice(0, 6)
})
</script>

<template>
  <div class="py-8">
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
      <span class="relative inline-block">
        {{ t('partners.campus.tabs.partners') }}
        <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
      </span>
    </h2>

    <div v-if="campusPartners.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardsCardPartner
        v-for="partner in campusPartners"
        :key="partner.id"
        :partner="partner"
      />
    </div>

    <div v-else class="text-center py-12">
      <font-awesome-icon icon="fa-solid fa-handshake" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noPartners') }}</p>
    </div>
  </div>
</template>
