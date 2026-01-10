<script setup lang="ts">
import type { Partenaire, PartnerCategory } from '~/composables/useMockData'

const { t, locale } = useI18n()
const { partenaires, charterOperators, campusPartners } = useMockData()

const { elementRef: sectionRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Filter state
type FilterType = 'all' | 'charter_operator' | 'campus_partner'
const selectedFilter = ref<FilterType>('all')

// Filter options
const filterOptions = computed(() => [
  {
    value: 'all' as FilterType,
    label: t('partners.filters.all'),
    icon: 'fa-solid fa-globe',
    count: partenaires.value.length
  },
  {
    value: 'charter_operator' as FilterType,
    label: t('partners.filters.charter'),
    icon: 'fa-solid fa-landmark',
    count: charterOperators.value.length
  },
  {
    value: 'campus_partner' as FilterType,
    label: t('partners.filters.campus'),
    icon: 'fa-solid fa-handshake',
    count: campusPartners.value.length
  }
])

// Filtered partners
const filteredPartners = computed(() => {
  if (selectedFilter.value === 'all') {
    return partenaires.value
  }
  return partenaires.value.filter(p => p.category === selectedFilter.value)
})

// Get localized name
const getLocalizedName = (partner: Partenaire) => {
  if (locale.value === 'ar' && partner.name_ar) return partner.name_ar
  if (locale.value === 'en' && partner.name_en) return partner.name_en
  return partner.name_fr
}

// Check if charter operator (for styling)
const isCharterOperator = (partner: Partenaire) => partner.category === 'charter_operator'
</script>

<template>
  <section ref="sectionRef" class="py-16 lg:py-24 bg-gray-50 dark:bg-gray-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-handshake" class="w-3.5 h-3.5 mr-2" />
          {{ t('partners.campus.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="relative inline-block">
            {{ t('partners.hero.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('partners.hero.subtitle') }}
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-10">
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
            :class="selectedFilter === option.value
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'"
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
            :href="partner.website"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative flex flex-col items-center p-4 lg:p-6 rounded-xl hover:shadow-lg transition-all duration-300 border"
            :class="isCharterOperator(partner)
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600'
              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800'"
          >
            <!-- Charter badge -->
            <div
              v-if="isCharterOperator(partner)"
              class="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide text-center"
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
                :src="partner.logo"
                :alt="getLocalizedName(partner)"
                class="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                @error="($event.target as HTMLImageElement).src = `https://picsum.photos/seed/${partner.slug}/200/200`"
              >
            </div>

            <!-- Name -->
            <h3
              class="text-xs lg:text-sm font-medium text-center transition-colors line-clamp-2"
              :class="isCharterOperator(partner)
                ? 'text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400'
                : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400'"
            >
              {{ getLocalizedName(partner) }}
            </h3>

            <!-- External link indicator -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <font-awesome-icon
                icon="fa-solid fa-arrow-up-right-from-square"
                class="w-3 h-3"
                :class="isCharterOperator(partner) ? 'text-amber-500' : 'text-cyan-500'"
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
          <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">{{ partenaires.length }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('partners.campus.stats.institutions') }}</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">30+</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('partners.campus.stats.countries') }}</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">5</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ t('partners.campus.stats.continents') }}</div>
        </div>
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
  transform: scale(0.9);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
