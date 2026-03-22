<script setup lang="ts">
import type {
  AllContributorsItem,
  EditorialSectionPublic,
  FundraiserDisplay,
  GlobalStats,
} from '~/types/fundraising'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  listPublishedFundraisers,
  getGlobalStats,
  getAllContributors,
  getEditorialSections,
  transformToDisplay,
  formatCurrency,
} = usePublicFundraisingApi()

// SEO
useSeoMeta({
  title: () => t('leveesDeFonds.seo.title'),
  description: () => t('leveesDeFonds.seo.description'),
  ogTitle: () => t('leveesDeFonds.seo.title'),
  ogDescription: () => t('leveesDeFonds.seo.description'),
})

// State
const loading = ref(true)
const globalStats = ref<GlobalStats | null>(null)
const editorialSections = ref<EditorialSectionPublic[]>([])
const activeCampaign = ref<FundraiserDisplay | null>(null)
const pastCampaigns = ref<FundraiserDisplay[]>([])
const allContributors = ref<AllContributorsItem[]>([])

// Anchor sections for nav
const anchorSections = computed(() => {
  const sections = []
  if (editorialSections.value.length > 0) {
    sections.push({ id: 'editorial', label: t('leveesDeFonds.anchors.editorial') })
  }
  sections.push({ id: 'stats', label: t('leveesDeFonds.anchors.stats') })
  if (activeCampaign.value) {
    sections.push({ id: 'active-campaign', label: t('leveesDeFonds.anchors.activeCampaign') })
  }
  if (pastCampaigns.value.length > 0) {
    sections.push({ id: 'past-campaigns', label: t('leveesDeFonds.anchors.pastCampaigns') })
  }
  if (allContributors.value.length > 0) {
    sections.push({ id: 'contributors', label: t('leveesDeFonds.anchors.contributors') })
  }
  return sections
})

// Currency locale
const currencyLocale = computed(() => {
  if (locale.value === 'ar') return 'ar-EG'
  if (locale.value === 'en') return 'en-US'
  return 'fr-FR'
})

// Load all data
async function loadData() {
  loading.value = true
  try {
    const [statsData, editorialData, activeData, completedData, contributorsData] = await Promise.all([
      getGlobalStats(),
      getEditorialSections(),
      listPublishedFundraisers({ status: 'active', limit: 1 }),
      listPublishedFundraisers({ status: 'completed', limit: 6 }),
      getAllContributors({ limit: 50 }),
    ])

    globalStats.value = statsData
    editorialSections.value = editorialData.sections || []

    if (activeData.items.length > 0) {
      activeCampaign.value = transformToDisplay(activeData.items[0])
    }
    pastCampaigns.value = completedData.items.map(transformToDisplay)
    allContributors.value = contributorsData.items || []
  }
  catch (e) {
    console.error('Erreur chargement levées de fonds:', e)
  }
  finally {
    loading.value = false
  }
}

onMounted(loadData)

// Recharger les sections éditoriales quand la locale change
watch(locale, async () => {
  try {
    const editorialData = await getEditorialSections()
    editorialSections.value = editorialData.sections || []
  }
  catch (e) {
    console.error('Erreur rechargement sections:', e)
  }
})
</script>

<template>
  <div>
    <!-- Hero -->
    <FundraisingHeroSection />

    <!-- Anchor Navigation -->
    <FundraisingAnchorNav
      v-if="!loading && anchorSections.length > 0"
      :sections="anchorSections"
    />

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue-500 border-t-transparent" />
    </div>

    <template v-else>
      <!-- Editorial Sections -->
      <section
        v-if="editorialSections.length > 0"
        id="editorial"
        class="bg-gray-50 py-16 dark:bg-gray-900 md:py-24"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FundraisingEditorialSection
            v-for="section in editorialSections"
            :key="section.slug"
            :title="section.title"
            :items="section.items"
            class="mb-16 last:mb-0"
          />
        </div>
      </section>

      <!-- Global Stats -->
      <section
        v-if="globalStats"
        id="stats"
        class="bg-white py-16 dark:bg-gray-800 md:py-24"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 class="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {{ t('leveesDeFonds.sections.globalStats') }}
          </h2>
          <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div class="text-center">
              <p class="text-3xl font-bold text-brand-blue-600 dark:text-brand-blue-400 md:text-4xl">
                {{ formatCurrency(globalStats.total_raised_all_campaigns, currencyLocale) }}
              </p>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ t('leveesDeFonds.sections.totalRaised') }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-brand-blue-600 dark:text-brand-blue-400 md:text-4xl">
                {{ globalStats.total_contributors }}
              </p>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ t('leveesDeFonds.sections.totalContributors') }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-green-600 dark:text-green-400 md:text-4xl">
                {{ globalStats.active_campaigns_count }}
              </p>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ t('leveesDeFonds.sections.activeCampaigns', globalStats.active_campaigns_count) }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 md:text-4xl">
                {{ globalStats.completed_campaigns_count }}
              </p>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ t('leveesDeFonds.sections.completedCampaigns', globalStats.completed_campaigns_count) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Active Campaign -->
      <section
        v-if="activeCampaign"
        id="active-campaign"
        class="bg-gray-50 py-16 dark:bg-gray-900 md:py-24"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 class="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {{ t('leveesDeFonds.sections.activeCampaign') }}
          </h2>
          <div class="mx-auto max-w-2xl">
            <CardsCardFundraiser :fundraiser="activeCampaign" />
          </div>
        </div>
      </section>

      <!-- Past Campaigns -->
      <section
        v-if="pastCampaigns.length > 0"
        id="past-campaigns"
        class="bg-white py-16 dark:bg-gray-800 md:py-24"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 class="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {{ t('leveesDeFonds.sections.pastCampaigns') }}
          </h2>
          <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <CardsCardFundraiser
              v-for="campaign in pastCampaigns"
              :key="campaign.id"
              :fundraiser="campaign"
            />
          </div>
        </div>
      </section>

      <!-- All Contributors -->
      <section
        v-if="allContributors.length > 0"
        id="contributors"
        class="bg-gray-50 py-16 dark:bg-gray-900 md:py-24"
      >
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 class="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {{ t('leveesDeFonds.sections.allContributors') }}
          </h2>
          <p class="mb-12 text-center text-gray-600 dark:text-gray-400">
            {{ t('leveesDeFonds.sections.allContributorsSubtitle') }}
          </p>
          <FundraisingContributorsList
            :contributors="allContributors"
            :show-campaign-count="true"
          />
        </div>
      </section>
    </template>
  </div>
</template>
