<script setup lang="ts">
import type { FundraiserDisplay } from '~/types/fundraising'

const props = defineProps<{
  campaigns: FundraiserDisplay[]
}>()

const { t } = useI18n()

type FilterStatus = 'all' | 'active' | 'completed'

const activeFilter = ref<FilterStatus>('all')

const filters: { key: FilterStatus, labelKey: string }[] = [
  { key: 'all', labelKey: 'leveesDeFonds.campaigns.filterAll' },
  { key: 'active', labelKey: 'leveesDeFonds.campaigns.filterActive' },
  { key: 'completed', labelKey: 'leveesDeFonds.campaigns.filterCompleted' },
]

const filteredCampaigns = computed(() => {
  if (activeFilter.value === 'all') return props.campaigns
  return props.campaigns.filter(c => c.status === activeFilter.value)
})
</script>

<template>
  <section class="py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Titre -->
      <h2 class="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
        <span class="relative inline-block">
          {{ t('leveesDeFonds.campaigns.title') }}
          <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
        </span>
      </h2>
      <p class="mx-auto mb-10 max-w-2xl text-center text-gray-600 dark:text-gray-400">
        {{ t('leveesDeFonds.campaigns.subtitle') }}
      </p>

      <!-- Filtres -->
      <div class="mb-10 flex flex-wrap items-center justify-center gap-3">
        <button
          v-for="filter in filters"
          :key="filter.key"
          class="rounded-full px-5 py-2 text-sm font-medium transition-all duration-300"
          :class="
            activeFilter === filter.key
              ? 'bg-brand-blue-600 text-white shadow-lg shadow-brand-blue-500/25'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          "
          @click="activeFilter = filter.key"
        >
          {{ t(filter.labelKey) }}
          <span
            v-if="filter.key !== 'all'"
            class="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs"
            :class="
              activeFilter === filter.key
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
            "
          >
            {{ campaigns.filter(c => c.status === filter.key).length }}
          </span>
        </button>
      </div>

      <!-- Grille de campagnes -->
      <TransitionGroup
        name="campaign"
        tag="div"
        class="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        <CardsCardFundraiser
          v-for="campaign in filteredCampaigns"
          :key="campaign.id"
          :fundraiser="campaign"
        />
      </TransitionGroup>

      <!-- État vide -->
      <div
        v-if="filteredCampaigns.length === 0"
        class="py-16 text-center"
      >
        <font-awesome-icon
          icon="fa-solid fa-folder-open"
          class="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
        />
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('leveesDeFonds.campaigns.empty') }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.campaign-enter-active,
.campaign-leave-active {
  transition: all 0.4s ease;
}

.campaign-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.campaign-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
