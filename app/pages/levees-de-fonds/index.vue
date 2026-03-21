<script setup lang="ts">
import type { FundraiserDisplay } from '~/types/fundraising'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()
const { listPublishedFundraisers, transformToDisplay, formatCurrency } = usePublicFundraisingApi()

const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => t('leveesDeFonds.seo.title'),
  description: () => t('leveesDeFonds.seo.description'),
  ogTitle: () => t('leveesDeFonds.seo.title'),
  ogDescription: () => t('leveesDeFonds.seo.description'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

const fundraisers = ref<FundraiserDisplay[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)

async function loadFundraisers(page: number = 1) {
  loading.value = true
  error.value = null
  try {
    const response = await listPublishedFundraisers({ page, limit: 12 })
    fundraisers.value = response.items.map(transformToDisplay)
    totalPages.value = response.pages
    currentPage.value = response.page
  }
  catch (e) {
    console.error('Erreur chargement levées de fonds:', e)
    error.value = 'Erreur lors du chargement'
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFundraisers()
})
</script>

<template>
  <div class="pt-20">
    <!-- Hero -->
    <PageHero
      :title="t('leveesDeFonds.hero.title')"
      :subtitle="t('leveesDeFonds.hero.subtitle')"
      :breadcrumb="[
        { label: t('nav.home'), to: localePath('/') },
        { label: t('leveesDeFonds.hero.title') },
      ]"
    />

    <!-- Contenu -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          {{ t('leveesDeFonds.list.title') }}
        </h2>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse"
          >
            <div class="h-48 bg-gray-200 dark:bg-gray-700" />
            <div class="p-5 space-y-3">
              <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div class="h-2.5 bg-gray-200 dark:bg-gray-700 rounded" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div
          v-else-if="fundraisers.length === 0"
          class="text-center py-16"
        >
          <svg class="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">
            {{ t('leveesDeFonds.list.empty') }}
          </p>
        </div>

        <!-- Grille de cartes -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardsCardFundraiser
            v-for="fundraiser in fundraisers"
            :key="fundraiser.id"
            :fundraiser="fundraiser"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-brand-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
            @click="loadFundraisers(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
