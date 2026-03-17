<script setup lang="ts">
import type { FundraiserDisplay } from '~/types/fundraising'

const props = defineProps<{
  fundraiser: FundraiserDisplay
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { formatCurrency } = usePublicFundraisingApi()

const progressCapped = computed(() => Math.min(props.fundraiser.progressPercentage, 100))

const statusBadgeClass = computed(() => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }
  return colors[props.fundraiser.status] || 'bg-gray-100 text-gray-800'
})

const localeForCurrency = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})
</script>

<template>
  <NuxtLink
    :to="localePath(`/levees-de-fonds/${fundraiser.slug}`)"
    class="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
  >
    <!-- Image -->
    <div class="relative h-48 overflow-hidden">
      <img
        v-if="fundraiser.coverImageUrl"
        :src="fundraiser.coverImageUrl"
        :alt="fundraiser.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 flex items-center justify-center"
      >
        <svg class="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>

      <!-- Badge statut -->
      <span
        :class="statusBadgeClass"
        class="absolute top-3 end-3 px-2.5 py-0.5 rounded-full text-xs font-medium"
      >
        {{ t(`leveesDeFonds.status.${fundraiser.status}`) }}
      </span>
    </div>

    <!-- Contenu -->
    <div class="p-5">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-blue-600 transition-colors">
        {{ fundraiser.title }}
      </h3>

      <!-- Barre de progression -->
      <div class="mb-3">
        <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>{{ formatCurrency(fundraiser.totalRaised, localeForCurrency) }}</span>
          <span>{{ Math.round(progressCapped) }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            class="bg-brand-blue-600 h-2.5 rounded-full transition-all duration-500"
            :style="{ width: `${progressCapped}%` }"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
          <span>{{ t('leveesDeFonds.list.totalRaised') }}</span>
          <span>{{ t('leveesDeFonds.list.goalAmount') }}: {{ formatCurrency(fundraiser.goalAmount, localeForCurrency) }}</span>
        </div>
      </div>

      <!-- Contributeurs -->
      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <svg class="w-4 h-4 me-1.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
        <span>{{ fundraiser.contributorCount }} {{ t('leveesDeFonds.list.contributors', fundraiser.contributorCount) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
