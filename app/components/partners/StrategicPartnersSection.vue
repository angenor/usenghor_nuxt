<script setup lang="ts">
import type { Partenaire } from '~/composables/useMockData'

const { t } = useI18n()
const { partenaires, getPartenairesByType } = useMockData()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Filter state
const selectedFilter = ref<Partenaire['partner_type'] | 'all'>('all')

// Filtered partners
const filteredPartners = computed(() => {
  if (selectedFilter.value === 'all') {
    return partenaires.value
  }
  return getPartenairesByType(selectedFilter.value)
})
</script>

<template>
  <section ref="sectionRef" class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-handshake" class="w-3.5 h-3.5 mr-2" />
          {{ t('partners.strategic.title') }}
        </span>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('partners.strategic.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.strategic.subtitle') }}
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-10">
        <PartnersFilters v-model="selectedFilter" />
      </div>

      <!-- Partners Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <TransitionGroup
          name="list"
          tag="div"
          class="contents"
        >
          <CardsCardPartner
            v-for="partner in filteredPartners"
            :key="partner.id"
            :partner="partner"
          />
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredPartners.length === 0"
        class="text-center py-12"
      >
        <font-awesome-icon icon="fa-solid fa-filter" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">Aucun partenaire dans cette catégorie</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* List transition */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
