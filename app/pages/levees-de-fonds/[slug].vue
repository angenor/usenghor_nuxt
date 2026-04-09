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

// SEO — page en développement, non indexée
useSeoMeta({
  title: () => fundraiser.value?.title || t('leveesDeFonds.seo.title'),
  description: () => t('leveesDeFonds.seo.description'),
  ogTitle: () => fundraiser.value?.title || '',
  ogDescription: () => t('leveesDeFonds.seo.description'),
  ogImage: () => fundraiser.value?.cover_image_url || undefined,
  robots: 'noindex, nofollow',
})

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

// Has news
const hasNews = computed(() => {
  return fundraiser.value?.news && fundraiser.value.news.length > 0
})
</script>

<template>
  <div v-if="fundraiser">
    <!-- Hero Section -->
    <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500" />

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

      <!-- Two-column layout: Main content + Sidebar -->
      <div class="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <!-- Left: Présentation -->
        <div class="min-w-0 flex-1">
          <!-- Cover image -->
          <div v-if="fundraiser.cover_image_url" class="mb-8 overflow-hidden rounded-2xl">
            <img
              :src="fundraiser.cover_image_url"
              :alt="fundraiser.title"
              class="h-auto w-full object-cover"
            >
          </div>

          <!-- Description -->
          <div v-if="descriptionHtml" class="mb-8">
            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('leveesDeFonds.detail.presentation.title') }}
            </h2>
            <div
              class="prose max-w-none dark:prose-invert"
              v-html="descriptionHtml"
            />
          </div>

          <!-- Reason -->
          <div v-if="reasonHtml" class="mb-8">
            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('leveesDeFonds.detail.presentation.reason') }}
            </h2>
            <div
              class="prose max-w-none dark:prose-invert"
              v-html="reasonHtml"
            />
          </div>

          <!-- Media Gallery -->
          <div v-if="hasMedia" class="mb-8">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              {{ t('leveesDeFonds.detail.media.title') }}
            </h2>
            <FundraisingMediaGallery :media="fundraiser.media" :locale="locale" />
          </div>

          <!-- Interest Form (only for active campaigns) -->
          <div v-if="fundraiser.status === 'active'" class="mt-4">
            <FundraisingInterestForm
              :slug="fundraiser.slug"
              :is-active="fundraiser.status === 'active'"
            />
          </div>
        </div>

        <!-- Right: Sidebar -->
        <aside class="w-full flex-shrink-0 lg:w-80 xl:w-96">
          <div class="space-y-8 lg:sticky lg:top-8">
            <!-- Contributors -->
            <div class="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
              <h2 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                {{ t('leveesDeFonds.detail.contributors.title') }}
              </h2>

              <div v-if="contributorsByCategory.length === 0" class="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ t('leveesDeFonds.detail.contributors.empty') }}
              </div>

              <div v-else class="space-y-6">
                <div v-for="group in contributorsByCategory" :key="group.category">
                  <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {{ group.label }}
                  </h3>
                  <div class="space-y-3">
                    <div
                      v-for="contributor in group.items"
                      :key="contributor.id"
                      class="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-700"
                    >
                      <!-- Logo or initials -->
                      <div
                        v-if="contributor.logo_url"
                        class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg"
                      >
                        <img
                          :src="contributor.logo_url"
                          :alt="contributor.name"
                          class="h-full w-full object-contain"
                        >
                      </div>
                      <div
                        v-else
                        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-blue-100 font-bold text-brand-blue-600 dark:bg-brand-blue-900 dark:text-brand-blue-300"
                      >
                        {{ contributor.name.charAt(0) }}
                      </div>

                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {{ contributor.name }}
                        </p>
                        <p
                          v-if="contributor.amount !== null"
                          class="text-xs font-semibold text-green-600 dark:text-green-400"
                        >
                          {{ formatCurrency(contributor.amount, currencyLocale) }}
                        </p>
                        <p v-else class="text-xs italic text-gray-400 dark:text-gray-500">
                          {{ t('leveesDeFonds.detail.contributors.amountHidden') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- News -->
            <div v-if="hasNews" class="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800">
              <h2 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                {{ t('leveesDeFonds.detail.news.title') }}
              </h2>

              <div class="space-y-4">
                <NuxtLink
                  v-for="news in fundraiser.news"
                  :key="news.id"
                  :to="localePath(`/actualites/${news.slug}`)"
                  class="group block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-700"
                >
                  <div class="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-600">
                    <img
                      v-if="news.cover_image_url"
                      :src="news.cover_image_url"
                      :alt="news.title"
                      class="h-full w-full object-cover transition-transform group-hover:scale-105"
                    >
                    <div v-else class="flex h-full items-center justify-center text-gray-400">
                      <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  </div>
                  <div class="p-3">
                    <p
                      v-if="news.published_at"
                      class="mb-1 text-xs text-gray-500 dark:text-gray-400"
                    >
                      {{ new Date(news.published_at).toLocaleDateString(locale) }}
                    </p>
                    <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-blue-600 dark:text-white dark:group-hover:text-brand-blue-400">
                      {{ news.title }}
                    </h3>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
