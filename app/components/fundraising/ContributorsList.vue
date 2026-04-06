<script setup lang="ts">
import type { AllContributorsItem, ContributorCategory, ContributorPublic } from '~/types/fundraising'
import { contributorCategoryOrder } from '~/types/fundraising'

type ContributorItem = ContributorPublic | AllContributorsItem

const props = withDefaults(defineProps<{
  contributors: ContributorItem[]
  showCampaignCount?: boolean
}>(), {
  showCampaignCount: false,
})

const { t, locale } = useI18n()
const { formatCurrency } = usePublicFundraisingApi()

const INITIAL_VISIBLE = 12
const showAll = ref(false)

// Group contributors by category
const groupedContributors = computed(() => {
  const groups = new Map<ContributorCategory, ContributorItem[]>()

  for (const cat of contributorCategoryOrder) {
    const items = props.contributors.filter((c) => c.category === cat)
    if (items.length > 0) {
      groups.set(cat, items)
    }
  }

  return groups
})

// Flatten for "voir plus" logic
const totalCount = computed(() => props.contributors.length)
const shouldTruncate = computed(() => totalCount.value > INITIAL_VISIBLE && !showAll.value)

// Get contributor name in locale
function getContributorName(c: ContributorItem): string {
  if ('name_en' in c) {
    if (locale.value === 'en' && c.name_en) return c.name_en
    if (locale.value === 'ar' && c.name_ar) return c.name_ar
  }
  return c.name
}

// Get initials for avatar fallback
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

// Get amount to display
function getAmount(c: ContributorItem): number | null {
  if ('total_amount' in c) {
    return (c as AllContributorsItem).show_amount_publicly ? c.total_amount : null
  }
  return c.amount ?? null
}

// Currency locale
const currencyLocale = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})

// Track how many items shown when truncated
let shownCount = 0
function shouldShowItem(): boolean {
  if (!shouldTruncate.value) return true
  shownCount++
  return shownCount <= INITIAL_VISIBLE
}

// Reset counter on each render via computed
const resetCounter = computed(() => {
  shownCount = 0
  return true
})
</script>

<template>
  <div>
    <!-- Hidden computed trigger to reset counter -->
    <span v-if="resetCounter" class="hidden" />

    <template v-for="[category, items] in groupedContributors" :key="category">
      <!-- Category label -->
      <p class="mb-5 mt-10 text-xs font-semibold uppercase tracking-widest text-gray-400 first:mt-0 dark:text-gray-500 rtl:text-right">
        {{ t(`leveesDeFonds.detail.contributors.categories.${category}`) }}
      </p>

      <!-- Contributors list -->
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        <template v-for="contributor in items" :key="'name' in contributor ? contributor.name : ''">
          <div
            v-if="shouldShowItem()"
            class="flex items-center gap-4 py-4"
          >
            <!-- Logo or initials -->
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                v-if="contributor.logo_url"
                :src="contributor.logo_url"
                :alt="getContributorName(contributor)"
                class="h-full w-full object-cover"
                loading="lazy"
              >
              <span
                v-else
                class="text-xs font-semibold text-gray-500 dark:text-gray-400"
              >
                {{ getInitials(getContributorName(contributor)) }}
              </span>
            </div>

            <!-- Name -->
            <p class="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-white rtl:text-right">
              {{ getContributorName(contributor) }}
            </p>

            <!-- Amount / campaign count (right side) -->
            <div class="flex flex-col items-end gap-0.5">
              <p
                v-if="getAmount(contributor) !== null"
                class="text-sm font-semibold text-gray-900 dark:text-white"
              >
                {{ formatCurrency(getAmount(contributor)!, currencyLocale) }}
              </p>
              <p
                v-if="showCampaignCount && 'campaigns_count' in contributor"
                class="text-xs text-gray-400 dark:text-gray-500"
              >
                {{ (contributor as AllContributorsItem).campaigns_count }}
                {{ t('leveesDeFonds.sections.campaignsCount', (contributor as AllContributorsItem).campaigns_count) }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Empty state -->
    <p
      v-if="contributors.length === 0"
      class="py-8 text-center text-gray-500 dark:text-gray-400"
    >
      {{ t('leveesDeFonds.detail.contributors.empty') }}
    </p>

    <!-- Voir plus button -->
    <div v-if="totalCount > INITIAL_VISIBLE" class="mt-10 flex justify-center">
      <button
        class="text-sm font-medium text-brand-blue-600 transition-colors hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300"
        @click="showAll = !showAll"
      >
        {{ showAll ? t('leveesDeFonds.detail.contributors.showLess') : t('leveesDeFonds.detail.contributors.showMore', { count: totalCount }) }}
      </button>
    </div>
  </div>
</template>
