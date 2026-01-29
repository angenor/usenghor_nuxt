<script setup lang="ts">
import type { PartnerPublic } from '~/composables/usePublicPartnersApi'

const { t } = useI18n()
const {
  getAllPartners,
  getPartnerLogoUrl,
  isCharterOperator: checkIsCharterOperator,
} = usePublicPartnersApi()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// === ÉTAT DE CHARGEMENT ===
const loading = ref(true)
const error = ref<string | null>(null)
const allPartners = ref<PartnerPublic[]>([])

// === CHARGEMENT DES DONNÉES ===
onMounted(async () => {
  try {
    allPartners.value = await getAllPartners()
  }
  catch (e) {
    console.error('Erreur chargement partenaires:', e)
    error.value = 'Erreur lors du chargement des partenaires'
  }
  finally {
    loading.value = false
  }
})

// Filter state
type FilterType = 'all' | 'charter_operator' | 'campus_partner'
const selectedFilter = ref<FilterType>('all')

// Compteurs par type
const charterOperatorsCount = computed(() =>
  allPartners.value.filter(p => p.type === 'charter_operator').length
)
const campusPartnersCount = computed(() =>
  allPartners.value.filter(p => p.type === 'campus_partner').length
)

// Filter options
const filterOptions = computed(() => [
  {
    value: 'all' as FilterType,
    label: t('partners.filters.all'),
    icon: 'fa-solid fa-globe',
    count: allPartners.value.length,
  },
  {
    value: 'charter_operator' as FilterType,
    label: t('partners.filters.charter'),
    icon: 'fa-solid fa-landmark',
    count: charterOperatorsCount.value,
  },
  {
    value: 'campus_partner' as FilterType,
    label: t('partners.filters.campus'),
    icon: 'fa-solid fa-handshake',
    count: campusPartnersCount.value,
  },
])

// Filtered partners
const filteredPartners = computed(() => {
  if (selectedFilter.value === 'all') {
    return allPartners.value
  }
  return allPartners.value.filter(p => p.type === selectedFilter.value)
})

// Check if charter operator (for styling)
const isCharterOperator = (partner: PartnerPublic) => checkIsCharterOperator(partner)

// Compteur de pays unique
const uniqueCountriesCount = computed(() => {
  const countries = new Set(
    allPartners.value
      .map(p => p.country_iso_code)
      .filter(Boolean)
  )
  return countries.size
})
</script>

<template>
  <section ref="sectionRef" class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-handshake" class="w-3.5 h-3.5 mr-2" />
          {{ t('partners.campus.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="relative inline-block">
            {{ t('partners.hero.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-red-500 to-brand-red-300 rounded-full"></span>
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.hero.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-12 h-12 text-red-500 mb-4" />
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Content (when loaded) -->
      <template v-else>
        <!-- Filters -->
        <div class="mb-10">
          <div class="flex flex-wrap justify-center gap-3">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
              :class="selectedFilter === option.value
                ? 'bg-brand-blue-600 text-white shadow-lg shadow-brand-blue-500/25'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-brand-blue-300 dark:hover:border-brand-blue-700'"
              @click="selectedFilter = option.value"
            >
              <font-awesome-icon :icon="option.icon" class="w-4 h-4" />
              {{ option.label }}
              <span
                class="px-2 py-0.5 text-xs rounded-full font-semibold"
                :class="selectedFilter === option.value ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'"
              >
                {{ option.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Partners Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          <TransitionGroup
            name="list"
            tag="div"
            class="contents"
          >
            <a
              v-for="partner in filteredPartners"
              :key="partner.id"
              :href="partner.website || undefined"
              :target="partner.website ? '_blank' : undefined"
              :rel="partner.website ? 'noopener noreferrer' : undefined"
              class="group relative flex flex-col items-center p-4 lg:p-6 rounded-xl hover:shadow-lg transition-all duration-300 border"
              :class="[
                isCharterOperator(partner)
                  ? 'bg-gradient-to-br from-brand-blue-50 to-brand-red-50 dark:from-brand-blue-900/20 dark:to-brand-red-900/20 border-brand-blue-200 dark:border-brand-blue-800 hover:border-brand-blue-400 dark:hover:border-brand-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800',
                partner.website ? 'cursor-pointer' : 'cursor-default'
              ]"
            >
              <!-- Charter badge -->
              <div
                v-if="isCharterOperator(partner)"
                class="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-brand-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide text-center"
              >
                {{ t('partners.filters.charter') }}
              </div>

              <!-- Logo -->
              <div
                class="relative w-16 h-16 lg:w-20 lg:h-20 mb-3 flex items-center justify-center rounded-lg p-2"
                :class="isCharterOperator(partner)
                  ? 'bg-white dark:bg-gray-800'
                  : 'bg-gray-50 dark:bg-gray-700'"
              >
                <img
                  :src="getPartnerLogoUrl(partner)"
                  :alt="partner.name"
                  class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  @error="($event.target as HTMLImageElement).src = `https://picsum.photos/seed/${partner.id}/200/200`"
                >
              </div>

              <!-- Name -->
              <h3
                class="text-xs lg:text-sm font-medium text-center transition-colors line-clamp-2"
                :class="isCharterOperator(partner)
                  ? 'text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400'
                  : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400'"
              >
                {{ partner.name }}
              </h3>

              <!-- External link indicator -->
              <div v-if="partner.website" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <font-awesome-icon
                  icon="fa-solid fa-arrow-up-right-from-square"
                  class="w-3 h-3"
                  :class="isCharterOperator(partner) ? 'text-brand-red-500' : 'text-cyan-500'"
                />
              </div>
            </a>
          </TransitionGroup>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredPartners.length === 0"
          class="text-center py-12"
        >
          <font-awesome-icon icon="fa-solid fa-filter" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p class="text-gray-500 dark:text-gray-400">{{ t('partners.campus.noResults') }}</p>
        </div>

        <!-- Stats -->
        <div class="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-brand-blue-600 dark:text-brand-blue-400">{{ allPartners.length }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('partners.campus.stats.institutions') }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-brand-blue-600 dark:text-brand-blue-400">{{ uniqueCountriesCount }}+</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('partners.campus.stats.countries') }}</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-brand-blue-600 dark:text-brand-blue-400">5</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('partners.campus.stats.continents') }}</div>
          </div>
        </div>
      </template>
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
  transform: scale(0.9);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
