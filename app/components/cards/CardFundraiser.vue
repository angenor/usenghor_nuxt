<script setup lang="ts">
import type { FundraiserDisplay } from '~/types/fundraising'
import { fundraiserStatusColors } from '~/types/fundraising'

const props = defineProps<{
  fundraiser: FundraiserDisplay
}>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { formatCurrency } = usePublicFundraisingApi()

// Cap visual bar at 100%
const visualPercentage = computed(() => Math.min(props.fundraiser.progressPercentage, 100))

// Currency locale
const currencyLocale = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})

// Status badge
const statusLabel = computed(() => t(`leveesDeFonds.status.${props.fundraiser.status}`))
const statusClasses = computed(() => fundraiserStatusColors[props.fundraiser.status])

// Campaign link
const campaignLink = computed(() =>
  localePath(`/levees-de-fonds/${props.fundraiser.slug}`),
)
</script>

<template>
  <NuxtLink
    :to="campaignLink"
    class="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
  >
    <!-- Cover image -->
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        v-if="fundraiser.coverImageUrl"
        :src="fundraiser.coverImageUrl"
        :alt="fundraiser.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      >
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 flex items-center justify-center"
      >
        <font-awesome-icon icon="fa-solid fa-hand-holding-heart" class="w-12 h-12 text-white/30" />
      </div>

      <!-- Status badge -->
      <span
        class="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-3 py-1 text-xs font-medium rounded-full"
        :class="statusClasses"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Content -->
    <div class="flex-1 p-5 flex flex-col">
      <!-- Title -->
      <h3 class="font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors duration-200 rtl:text-right">
        {{ fundraiser.title }}
      </h3>

      <!-- Mini progress bar -->
      <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          class="h-full rounded-full bg-gradient-to-r rtl:bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-700"
          :style="{ width: `${visualPercentage}%` }"
        ></div>
      </div>

      <!-- Amounts -->
      <div class="flex items-center justify-between text-sm mb-3 rtl:flex-row-reverse">
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ formatCurrency(fundraiser.totalRaised, currencyLocale) }}
        </span>
        <span class="text-gray-500 dark:text-gray-400">
          / {{ formatCurrency(fundraiser.goalAmount, currencyLocale) }}
        </span>
      </div>

      <!-- Footer: contributors count + percentage -->
      <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 rtl:flex-row-reverse">
        <span class="flex items-center gap-1.5">
          <font-awesome-icon icon="fa-solid fa-users" class="w-3.5 h-3.5" />
          {{ fundraiser.contributorCount }}
          {{ t('leveesDeFonds.list.contributors', fundraiser.contributorCount) }}
        </span>
        <span class="font-semibold text-emerald-600 dark:text-emerald-400">
          {{ fundraiser.progressPercentage.toFixed(0) }}%
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
