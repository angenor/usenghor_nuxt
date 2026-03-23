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

const INITIAL_VISIBLE = 8
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

// Track how many items shown per group when truncated
function visibleItems(items: ContributorItem[]): ContributorItem[] {
  if (!shouldTruncate.value) return items
  // Simple truncation: just show all groups but limit total
  return items
}

// Count shown
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
    <span v-if="resetCounter" class="hidden"></span>

    <template v-for="[category, items] in groupedContributors" :key="category">
      <!-- Category label -->
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-8 first:mt-0 rtl:text-right">
        {{ t(`leveesDeFonds.detail.contributors.categories.${category}`) }}
      </h3>

      <!-- Contributors grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <template v-for="contributor in items" :key="'name' in contributor ? contributor.name : ''">
          <div
            v-if="shouldShowItem()"
            class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <!-- Logo or initials -->
            <div class="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center">
              <img
                v-if="contributor.logo_url"
                :src="contributor.logo_url"
                :alt="getContributorName(contributor)"
                class="w-full h-full object-cover"
                loading="lazy"
              >
              <span
                v-else
                class="text-sm font-bold text-brand-blue-600 dark:text-brand-blue-400"
              >
                {{ getInitials(getContributorName(contributor)) }}
              </span>
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-gray-900 dark:text-white text-sm truncate rtl:text-right">
                {{ getContributorName(contributor) }}
              </p>
              <p
                v-if="getAmount(contributor) !== null"
                class="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
              >
                {{ formatCurrency(getAmount(contributor)!, currencyLocale) }}
              </p>
              <p
                v-if="showCampaignCount && 'campaigns_count' in contributor"
                class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
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
      class="text-center text-gray-500 dark:text-gray-400 py-8"
    >
      {{ t('leveesDeFonds.detail.contributors.empty') }}
    </p>

    <!-- Voir plus button -->
    <div v-if="totalCount > INITIAL_VISIBLE" class="flex justify-center mt-8">
      <button
        class="px-6 py-2.5 text-sm font-medium rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        @click="showAll = !showAll"
      >
        {{ showAll ? t('leveesDeFonds.detail.contributors.title') : `Voir plus (${totalCount})` }}
      </button>
    </div>
  </div>
</template>
