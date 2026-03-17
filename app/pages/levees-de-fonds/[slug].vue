<script setup lang="ts">
import type { FundraiserPublicDetail, ContributorPublic } from '~/types/fundraising'
import { contributorCategoryLabels, contributorCategoryOrder } from '~/types/fundraising'

const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { getFundraiserBySlug, formatCurrency, resolveMediaUrl } = usePublicFundraisingApi()

const slug = computed(() => route.params.slug as string)

const fundraiser = ref<FundraiserPublicDetail | null>(null)
const loading = ref(true)
const activeTab = ref<'presentation' | 'contributors' | 'news'>('presentation')

useHead({
  title: () => fundraiser.value?.title || t('leveesDeFonds.seo.title'),
})

const localeForCurrency = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})

const progressCapped = computed(() =>
  fundraiser.value ? Math.min(fundraiser.value.progress_percentage, 100) : 0,
)

const remaining = computed(() => {
  if (!fundraiser.value) return 0
  return Math.max(fundraiser.value.goal_amount - fundraiser.value.total_raised, 0)
})

const coverImageUrl = computed(() =>
  resolveMediaUrl(fundraiser.value?.cover_image_external_id || null),
)

const descriptionHtml = computed(() => {
  if (!fundraiser.value) return ''
  if (locale.value === 'en') return fundraiser.value.description_en_html || fundraiser.value.description_html
  if (locale.value === 'ar') return fundraiser.value.description_ar_html || fundraiser.value.description_html
  return fundraiser.value.description_html
})

// Contributeurs groupés par catégorie
const contributorsByCategory = computed(() => {
  if (!fundraiser.value?.contributors) return []

  return contributorCategoryOrder
    .map((category) => {
      const items = fundraiser.value!.contributors
        .filter((c: ContributorPublic) => c.category === category)
        .sort((a: ContributorPublic, b: ContributorPublic) => b.amount - a.amount)

      return {
        category,
        label: t(`leveesDeFonds.detail.contributors.categories.${category}`),
        items,
      }
    })
    .filter(group => group.items.length > 0)
})

function getContributorName(contributor: ContributorPublic): string {
  if (locale.value === 'en' && contributor.name_en) return contributor.name_en
  if (locale.value === 'ar' && contributor.name_ar) return contributor.name_ar
  return contributor.name
}

const tabs = [
  { key: 'presentation', label: () => t('leveesDeFonds.detail.tabs.presentation') },
  { key: 'contributors', label: () => t('leveesDeFonds.detail.tabs.contributors') },
  { key: 'news', label: () => t('leveesDeFonds.detail.tabs.news') },
] as const

async function loadFundraiser(newSlug: string) {
  loading.value = true
  activeTab.value = 'presentation'
  fundraiser.value = null
  try {
    fundraiser.value = await getFundraiserBySlug(newSlug)
  }
  catch (e) {
    console.error('Erreur chargement levée de fonds:', e)
    fundraiser.value = null
  }
  finally {
    loading.value = false
  }
}

watch(slug, (newSlug) => {
  loadFundraiser(newSlug)
}, { immediate: true })
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center pt-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600" />
    </div>

    <!-- 404 -->
    <div v-else-if="!fundraiser" class="min-h-screen flex items-center justify-center pt-20">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p class="text-gray-500 dark:text-gray-400 mb-6">{{ t('leveesDeFonds.list.empty') }}</p>
        <NuxtLink
          :to="localePath('/levees-de-fonds')"
          class="text-brand-blue-600 hover:underline"
        >
          {{ t('leveesDeFonds.detail.breadcrumb') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Détail -->
    <div v-else>
      <!-- Hero Section -->
      <div class="relative overflow-hidden min-h-[400px] max-h-[500px] pt-20">
        <img
          v-if="coverImageUrl"
          :src="coverImageUrl"
          :alt="fundraiser.title"
          class="w-full h-full object-cover absolute inset-0"
        />
        <div
          v-else
          class="w-full h-full absolute inset-0 bg-gradient-to-br from-brand-blue-700 via-brand-blue-600 to-brand-blue-800"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end py-12">
          <!-- Breadcrumb -->
          <nav class="mb-4 text-sm">
            <NuxtLink :to="localePath('/')" class="text-white/70 hover:text-white">
              {{ t('nav.home') }}
            </NuxtLink>
            <span class="mx-2 text-white/50">/</span>
            <NuxtLink :to="localePath('/levees-de-fonds')" class="text-white/70 hover:text-white">
              {{ t('leveesDeFonds.detail.breadcrumb') }}
            </NuxtLink>
            <span class="mx-2 text-white/50">/</span>
            <span class="text-white">{{ fundraiser.title }}</span>
          </nav>

          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {{ fundraiser.title }}
          </h1>

          <!-- Badge statut -->
          <span
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit',
              fundraiser.status === 'active'
                ? 'bg-green-500/20 text-green-200 border border-green-400/30'
                : 'bg-blue-500/20 text-blue-200 border border-blue-400/30',
            ]"
          >
            {{ t(`leveesDeFonds.status.${fundraiser.status}`) }}
          </span>
        </div>

        <!-- Séparateur diagonal -->
        <div class="absolute bottom-0 left-0 right-0 text-gray-50 dark:text-gray-900">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" class="w-full h-8 md:h-12">
            <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
          </svg>
        </div>
      </div>

      <!-- Progression financière (sticky) -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('leveesDeFonds.detail.presentation.totalRaised') }}</p>
              <p class="text-2xl font-bold text-brand-blue-600">{{ formatCurrency(fundraiser.total_raised, localeForCurrency) }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('leveesDeFonds.detail.presentation.goalAmount') }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(fundraiser.goal_amount, localeForCurrency) }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('leveesDeFonds.detail.presentation.progress') }}</p>
              <p class="text-2xl font-bold text-green-600">{{ Math.round(progressCapped) }}%</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('leveesDeFonds.detail.presentation.remaining') }}</p>
              <p class="text-2xl font-bold text-gray-600 dark:text-gray-300">{{ formatCurrency(remaining, localeForCurrency) }}</p>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              class="bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 h-3 rounded-full transition-all duration-700"
              :style="{ width: `${progressCapped}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="flex gap-8" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-brand-blue-600 text-brand-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200',
              ]"
              @click="activeTab = tab.key"
            >
              {{ tab.label() }}
              <span
                v-if="tab.key === 'contributors' && fundraiser.contributors.length > 0"
                class="ms-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs"
              >
                {{ fundraiser.contributors.length }}
              </span>
              <span
                v-if="tab.key === 'news' && fundraiser.news.length > 0"
                class="ms-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs"
              >
                {{ fundraiser.news.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenu des onglets -->
      <section class="py-12 bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Onglet Présentation -->
          <div v-if="activeTab === 'presentation'">
            <div v-if="descriptionHtml" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
              <RichTextRenderer :html="descriptionHtml" class="max-w-none" />
            </div>
            <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>{{ t('leveesDeFonds.detail.presentation.title') }}</p>
            </div>
          </div>

          <!-- Onglet Contributeurs -->
          <div v-else-if="activeTab === 'contributors'">
            <div v-if="contributorsByCategory.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>{{ t('leveesDeFonds.detail.contributors.empty') }}</p>
            </div>

            <div v-else class="space-y-10">
              <div
                v-for="group in contributorsByCategory"
                :key="group.category"
              >
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span
                    :class="[
                      'w-3 h-3 rounded-full me-3',
                      group.category === 'state_organization' ? 'bg-blue-500' :
                      group.category === 'foundation_philanthropist' ? 'bg-purple-500' : 'bg-orange-500',
                    ]"
                  />
                  {{ group.label }}
                  <span class="ms-2 text-sm font-normal text-gray-500">({{ group.items.length }})</span>
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="contributor in group.items"
                    :key="contributor.id"
                    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 flex items-center gap-4"
                  >
                    <!-- Logo -->
                    <div class="flex-shrink-0">
                      <img
                        v-if="contributor.logo_external_id"
                        :src="resolveMediaUrl(contributor.logo_external_id)!"
                        :alt="getContributorName(contributor)"
                        class="w-14 h-14 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 p-1"
                      />
                      <div
                        v-else
                        :class="[
                          'w-14 h-14 rounded-lg flex items-center justify-center text-white text-lg font-bold',
                          group.category === 'state_organization' ? 'bg-blue-500' :
                          group.category === 'foundation_philanthropist' ? 'bg-purple-500' : 'bg-orange-500',
                        ]"
                      >
                        {{ getContributorName(contributor).charAt(0) }}
                      </div>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white truncate">
                        {{ getContributorName(contributor) }}
                      </p>
                      <p class="text-lg font-semibold text-brand-blue-600">
                        {{ formatCurrency(contributor.amount, localeForCurrency) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Actualités -->
          <div v-else-if="activeTab === 'news'">
            <div v-if="fundraiser.news.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p>{{ t('leveesDeFonds.detail.news.empty') }}</p>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NuxtLink
                v-for="newsItem in fundraiser.news"
                :key="newsItem.id"
                :to="localePath(`/actualites/${newsItem.slug}`)"
                class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <!-- Image -->
                <div class="h-40 overflow-hidden">
                  <img
                    v-if="newsItem.cover_image_external_id"
                    :src="resolveMediaUrl(newsItem.cover_image_external_id)!"
                    :alt="newsItem.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center"
                  >
                    <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>

                <!-- Contenu -->
                <div class="p-5">
                  <p v-if="newsItem.published_at" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {{ t('leveesDeFonds.detail.news.publishedAt') }}
                    {{ new Date(newsItem.published_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-US' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                  </p>
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 transition-colors">
                    {{ newsItem.title }}
                  </h3>
                  <p v-if="newsItem.summary" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {{ newsItem.summary }}
                  </p>
                  <span class="mt-3 inline-block text-sm text-brand-blue-600 font-medium group-hover:underline">
                    {{ t('leveesDeFonds.detail.news.readMore') }} →
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
