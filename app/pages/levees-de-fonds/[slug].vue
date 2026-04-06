<script setup lang="ts">
import type { ContributorPublic, FundraiserPublicDetail } from '~/types/fundraising'
import { contributorCategoryOrder } from '~/types/fundraising'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getFundraiserBySlug, formatCurrency } = usePublicFundraisingApi()

const slug = computed(() => route.params.slug as string)

// Fetch data
const { data: fundraiser, status } = await useAsyncData(
  `fundraiser-${slug.value}`,
  () => getFundraiserBySlug(slug.value),
)

// 404 if not found
if (!fundraiser.value) {
  throw createError({ statusCode: 404, statusMessage: 'Campagne non trouvée' })
}

// SEO
useSeoMeta({
  title: () => fundraiser.value?.title || t('leveesDeFonds.seo.title'),
  description: () => t('leveesDeFonds.seo.description'),
  ogTitle: () => fundraiser.value?.title || '',
  ogDescription: () => t('leveesDeFonds.seo.description'),
  ogImage: () => fundraiser.value?.cover_image_url || undefined,
})

// Active tab
const activeTab = ref<'presentation' | 'contributors' | 'media' | 'news'>('presentation')

// Currency locale
const currencyLocale = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})

// Locale-aware content
const descriptionHtml = computed(() => {
  if (!fundraiser.value) return ''
  if (locale.value === 'en') return fundraiser.value.description_en_html || fundraiser.value.description_html
  if (locale.value === 'ar') return fundraiser.value.description_ar_html || fundraiser.value.description_html
  return fundraiser.value.description_html
})

const reasonHtml = computed(() => {
  if (!fundraiser.value) return ''
  if (locale.value === 'en') return fundraiser.value.reason_en_html || fundraiser.value.reason_html
  if (locale.value === 'ar') return fundraiser.value.reason_ar_html || fundraiser.value.reason_html
  return fundraiser.value.reason_html
})

// Remaining amount
const remaining = computed(() => {
  if (!fundraiser.value) return 0
  return Math.max(0, fundraiser.value.goal_amount - fundraiser.value.total_raised)
})

// Contributors grouped by category
const contributorsByCategory = computed(() => {
  if (!fundraiser.value?.contributors) return []
  return contributorCategoryOrder
    .map(category => ({
      category,
      label: t(`leveesDeFonds.detail.contributors.categories.${category}`),
      items: fundraiser.value!.contributors.filter(c => c.category === category),
    }))
    .filter(group => group.items.length > 0)
})

// Has media
const hasMedia = computed(() => {
  return fundraiser.value?.media && fundraiser.value.media.length > 0
})

// Tab list
const tabs = computed(() => {
  const list = [
    { key: 'presentation', label: t('leveesDeFonds.detail.tabs.presentation') },
    { key: 'contributors', label: t('leveesDeFonds.detail.tabs.contributors') },
  ]
  if (hasMedia.value) {
    list.push({ key: 'media', label: t('leveesDeFonds.detail.tabs.media') })
  }
  if (fundraiser.value?.news && fundraiser.value.news.length > 0) {
    list.push({ key: 'news', label: t('leveesDeFonds.detail.tabs.news') })
  }
  return list
})
</script>

<template>
  <div v-if="fundraiser">
    <!-- Hero Section -->
    <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
      <!-- Background Image -->
      <template v-if="fundraiser.cover_image_url">
        <div class="absolute inset-0">
          <img
            :src="fundraiser.cover_image_url"
            :alt="fundraiser.title"
            class="h-full w-full object-cover"
          >
          <div class="absolute inset-0 bg-gray-900/60" />
        </div>
      </template>

      <!-- Mode pattern (sans image) -->
      <template v-else>
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500" />
      </template>

      <!-- Content -->
      <div class="relative z-10 flex h-full flex-col justify-center">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <!-- Breadcrumb -->
          <nav class="mb-6">
            <ol class="flex items-center space-x-2 text-sm">
              <li>
                <NuxtLink :to="localePath('/')" class="text-white/70 transition-colors duration-200 hover:text-white">
                  {{ t('common.home', 'Accueil') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="mx-2 h-3 w-3 text-white/40" />
                <NuxtLink :to="localePath('/levees-de-fonds')" class="text-white/70 transition-colors duration-200 hover:text-white">
                  {{ t('leveesDeFonds.detail.breadcrumb') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="mx-2 h-3 w-3 text-white/40" />
                <span class="max-w-xs truncate font-medium text-brand-red-400">{{ fundraiser.title }}</span>
              </li>
            </ol>
          </nav>

          <!-- Status badge -->
          <div v-if="fundraiser.status === 'completed'" class="mb-4">
            <span class="inline-block rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-medium text-blue-300">
              {{ t('leveesDeFonds.detail.closedBadge') }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {{ fundraiser.title }}
          </h1>
        </div>
      </div>

      <!-- Ligne de séparation oblique -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg class="h-12 w-full text-white md:h-16 dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
        </svg>
      </div>
    </section>

    <!-- Main content -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <!-- Progress Section -->
      <div class="mb-12">
        <FundraisingProgressBar
          :goal-amount="fundraiser.goal_amount"
          :total-raised="fundraiser.total_raised"
          :progress-percentage="fundraiser.progress_percentage"
        />
      </div>

      <!-- Stats row -->
      <div class="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold text-brand-blue-600 dark:text-brand-blue-400">
            {{ formatCurrency(fundraiser.goal_amount, currencyLocale) }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('leveesDeFonds.detail.presentation.goalAmount') }}
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ formatCurrency(fundraiser.total_raised, currencyLocale) }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('leveesDeFonds.detail.presentation.totalRaised') }}
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ fundraiser.progress_percentage }}%
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('leveesDeFonds.detail.presentation.progress') }}
          </p>
        </div>
        <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-800">
          <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {{ formatCurrency(remaining, currencyLocale) }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('leveesDeFonds.detail.presentation.remaining') }}
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex gap-4 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors"
            :class="
              activeTab === tab.key
                ? 'border-brand-blue-500 text-brand-blue-600 dark:text-brand-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            "
            @click="activeTab = tab.key as any"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab content -->
      <div class="min-h-[300px]">
        <!-- Presentation -->
        <div v-if="activeTab === 'presentation'" class="space-y-8">
          <div v-if="descriptionHtml">
            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('leveesDeFonds.detail.presentation.title') }}
            </h2>
            <div
              class="prose max-w-none dark:prose-invert"
              v-html="descriptionHtml"
            />
          </div>
          <div v-if="reasonHtml">
            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('leveesDeFonds.detail.presentation.reason') }}
            </h2>
            <div
              class="prose max-w-none dark:prose-invert"
              v-html="reasonHtml"
            />
          </div>
        </div>

        <!-- Contributors -->
        <div v-if="activeTab === 'contributors'">
          <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('leveesDeFonds.detail.contributors.title') }}
          </h2>

          <div v-if="contributorsByCategory.length === 0" class="py-12 text-center text-gray-500 dark:text-gray-400">
            {{ t('leveesDeFonds.detail.contributors.empty') }}
          </div>

          <div v-else class="space-y-8">
            <div v-for="group in contributorsByCategory" :key="group.category">
              <h3 class="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                {{ group.label }}
              </h3>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div
                  v-for="contributor in group.items"
                  :key="contributor.id"
                  class="flex items-center gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800"
                >
                  <!-- Logo or initials -->
                  <div
                    v-if="contributor.logo_url"
                    class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg"
                  >
                    <img
                      :src="contributor.logo_url"
                      :alt="contributor.name"
                      class="h-full w-full object-contain"
                    >
                  </div>
                  <div
                    v-else
                    class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue-100 text-lg font-bold text-brand-blue-600 dark:bg-brand-blue-900 dark:text-brand-blue-300"
                  >
                    {{ contributor.name.charAt(0) }}
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-gray-900 dark:text-white">
                      {{ contributor.name }}
                    </p>
                    <p
                      v-if="contributor.amount !== null"
                      class="text-sm font-semibold text-green-600 dark:text-green-400"
                    >
                      {{ formatCurrency(contributor.amount, currencyLocale) }}
                    </p>
                    <p v-else class="text-sm italic text-gray-400 dark:text-gray-500">
                      {{ t('leveesDeFonds.detail.contributors.amountHidden') }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Media -->
        <div v-if="activeTab === 'media' && hasMedia">
          <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('leveesDeFonds.detail.media.title') }}
          </h2>
          <FundraisingMediaGallery :media="fundraiser.media" :locale="locale" />
        </div>

        <!-- News -->
        <div v-if="activeTab === 'news'">
          <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('leveesDeFonds.detail.news.title') }}
          </h2>

          <div v-if="!fundraiser.news || fundraiser.news.length === 0" class="py-12 text-center text-gray-500 dark:text-gray-400">
            {{ t('leveesDeFonds.detail.news.empty') }}
          </div>

          <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="news in fundraiser.news"
              :key="news.id"
              :to="localePath(`/actualites/${news.slug}`)"
              class="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
            >
              <div class="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  v-if="news.cover_image_url"
                  :src="news.cover_image_url"
                  :alt="news.title"
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                >
                <div v-else class="flex h-full items-center justify-center text-gray-400">
                  <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div class="p-4">
                <p
                  v-if="news.published_at"
                  class="mb-1 text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ t('leveesDeFonds.detail.news.publishedAt') }}
                  {{ new Date(news.published_at).toLocaleDateString(locale) }}
                </p>
                <h3 class="font-medium text-gray-900 group-hover:text-brand-blue-600 dark:text-white dark:group-hover:text-brand-blue-400">
                  {{ news.title }}
                </h3>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Interest Form (only for active campaigns) -->
      <div v-if="fundraiser.status === 'active'" class="mt-12">
        <FundraisingInterestForm
          :slug="fundraiser.slug"
          :is-active="fundraiser.status === 'active'"
        />
      </div>
    </div>
  </div>
</template>
