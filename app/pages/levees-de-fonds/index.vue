<script setup lang="ts">
import type {
  AllContributorsItem,
  EditorialSectionPublic,
  FundraiserDisplay,
  GlobalStats,
} from '~/types/fundraising'

const { t, locale } = useI18n()

// SEO
useSeoMeta({
  title: () => t('leveesDeFonds.seo.title'),
  description: () => t('leveesDeFonds.seo.description'),
  ogTitle: () => t('leveesDeFonds.seo.title'),
  ogDescription: () => t('leveesDeFonds.seo.description'),
})

// ── Mock Data (démonstration client) ───────────────────────────────

const mockGlobalStats: GlobalStats = {
  total_raised_all_campaigns: 2_450_000,
  total_contributors: 87,
  active_campaigns_count: 3,
  completed_campaigns_count: 0,
}

const mockCampaigns: FundraiserDisplay[] = [
  {
    id: '1',
    title: 'Modernisation du campus numérique',
    slug: 'modernisation-campus-numerique',
    descriptionHtml: '<p>Un projet ambitieux pour doter le campus d\'équipements numériques de dernière génération : salles informatiques, laboratoires de recherche et espaces collaboratifs connectés.</p>',
    coverImageUrl: '/images/bg/bg_mission_section.jpeg',
    goalAmount: 500_000,
    totalRaised: 342_500,
    progressPercentage: 68.5,
    contributorCount: 24,
    status: 'active',
    createdAt: '2025-09-01',
  },
  {
    id: '2',
    title: 'Bourses d\'excellence pour l\'Afrique francophone',
    slug: 'bourses-excellence-afrique-francophone',
    descriptionHtml: '<p>Financer 50 bourses complètes pour des étudiants méritants issus de pays africains francophones, couvrant frais de scolarité, logement et accompagnement académique.</p>',
    coverImageUrl: '/images/bg/backgroud_senghor3.jpg',
    goalAmount: 750_000,
    totalRaised: 512_000,
    progressPercentage: 68.3,
    contributorCount: 31,
    status: 'active',
    createdAt: '2025-06-15',
  },
  {
    id: '3',
    title: 'Centre de recherche en développement durable',
    slug: 'centre-recherche-developpement-durable',
    descriptionHtml: '<p>Création d\'un centre interdisciplinaire de recherche sur le développement durable en Afrique, réunissant chercheurs, experts et acteurs de terrain.</p>',
    coverImageUrl: '/images/bg/backgroud_senghor2.jpg',
    goalAmount: 1_200_000,
    totalRaised: 285_000,
    progressPercentage: 23.8,
    contributorCount: 15,
    status: 'active',
    createdAt: '2026-01-10',
  },
]

const mockEditorialSections: EditorialSectionPublic[] = [
  {
    slug: 'contribution-benefits',
    title: 'Les avantages de votre contribution',
    items: [
      {
        icon: 'AcademicCapIcon',
        title: 'Impact éducatif direct',
        description: 'Chaque contribution finance directement des bourses, des équipements pédagogiques et des programmes de recherche au bénéfice des étudiants africains.',
      },
      {
        icon: 'GlobeAltIcon',
        title: 'Rayonnement international',
        description: 'Votre soutien renforce le réseau mondial de l\'Université Senghor et contribue au développement de la coopération universitaire francophone.',
      },
      {
        icon: 'HeartIcon',
        title: 'Transparence totale',
        description: 'Un suivi détaillé de l\'utilisation des fonds est publié chaque trimestre, garantissant une transparence complète envers nos donateurs.',
      },
      {
        icon: 'StarIcon',
        title: 'Reconnaissance institutionnelle',
        description: 'Les contributeurs sont reconnus publiquement et invités aux événements exclusifs de l\'Université Senghor.',
      },
    ],
  },
]

const mockContributors: AllContributorsItem[] = [
  {
    name: 'Organisation Internationale de la Francophonie',
    category: 'state_organization',
    total_amount: 500_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 3,
  },
  {
    name: 'Agence Universitaire de la Francophonie',
    category: 'state_organization',
    total_amount: 350_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 2,
  },
  {
    name: 'République Française — Ministère de l\'Europe et des Affaires étrangères',
    category: 'state_organization',
    total_amount: 400_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 4,
  },
  {
    name: 'République Arabe d\'Égypte',
    category: 'state_organization',
    total_amount: 250_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 2,
  },
  {
    name: 'Fondation Ahmed Baba',
    category: 'foundation_philanthropist',
    total_amount: 120_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 2,
  },
  {
    name: 'Fondation pour le Développement de l\'Afrique',
    category: 'foundation_philanthropist',
    total_amount: 85_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 1,
  },
  {
    name: 'Fondation Léopold Sédar Senghor',
    category: 'foundation_philanthropist',
    total_amount: 150_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 3,
  },
  {
    name: 'Orange Afrique & Moyen-Orient',
    category: 'company',
    total_amount: 75_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 1,
  },
  {
    name: 'Total Energies Foundation',
    category: 'company',
    total_amount: 100_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 2,
  },
  {
    name: 'Société Générale Afrique',
    category: 'company',
    total_amount: 60_000,
    show_amount_publicly: true,
    logo_url: null,
    campaigns_count: 1,
  },
]

// Mock news data
const mockNews = [
  {
    id: '1',
    slug: 'inauguration-nouveau-campus',
    title: 'Inauguration du nouveau campus numérique',
    summary: 'Grâce aux contributions de nos donateurs, le campus numérique de l\'Université Senghor a été inauguré, offrant des équipements de pointe aux étudiants.',
    cover_image: '/images/bg/bg_mission_section.jpeg',
    published_at: '2026-03-15',
    tags: [{ name: 'Campus', slug: 'campus' }],
  },
  {
    id: '2',
    slug: 'bourse-excellence-2026',
    title: 'Lancement du programme de bourses d\'excellence 2026',
    summary: 'Un nouveau programme de bourses financé par les levées de fonds permettra à 50 étudiants africains de poursuivre leurs études à Alexandrie.',
    cover_image: '/images/bg/backgroud_senghor3.jpg',
    published_at: '2026-02-28',
    tags: [{ name: 'Bourses', slug: 'bourses' }],
  },
  {
    id: '3',
    slug: 'partenariat-international',
    title: 'Nouveau partenariat avec l\'Université de Genève',
    summary: 'Ce partenariat stratégique renforcera les échanges académiques et la coopération en matière de recherche entre les deux institutions.',
    cover_image: '/images/bg/backgroud_senghor2.jpg',
    published_at: '2026-01-20',
    tags: [{ name: 'Partenariats', slug: 'partenariats' }],
  },
]

// ── State (initialisé avec les données mock) ───────────────────────

const loading = ref(false)
const globalStats = ref<GlobalStats>(mockGlobalStats)
const editorialSections = ref<EditorialSectionPublic[]>(mockEditorialSections)
const allCampaigns = ref<FundraiserDisplay[]>(mockCampaigns)
const allContributors = ref<AllContributorsItem[]>(mockContributors)

// Anchor sections for nav
const anchorSections = computed(() => {
  const sections = []
  sections.push({ id: 'contribution', label: t('leveesDeFonds.anchors.contribution') })
  if (allCampaigns.value.length > 0) {
    sections.push({ id: 'campaigns', label: t('leveesDeFonds.anchors.campaigns') })
  }
  sections.push({ id: 'news', label: t('leveesDeFonds.anchors.news') })
  if (allContributors.value.length > 0) {
    sections.push({ id: 'contributors', label: t('leveesDeFonds.anchors.contributors') })
  }
  return sections
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

    <!-- Contribution Cards Section -->
    <FundraisingContributionCards id="contribution" />

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue-500 border-t-transparent" />
    </div>

    <template v-else>
      <!-- Nos campagnes (filtrable en cours / clôturé) -->
      <FundraisingCampaignsSection
        v-if="allCampaigns.length > 0"
        id="campaigns"
        :campaigns="allCampaigns"
        class="bg-white dark:bg-gray-800"
      />

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
            :slug="section.slug"
            :items="section.items"
            class="mb-16 last:mb-0"
          />
        </div>
      </section>

      <!-- Global Stats -->
      <section
        v-if="globalStats"
        id="stats"
        class="relative overflow-hidden bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-950 py-20 md:py-28"
      >
        <!-- Motif décoratif arrière-plan -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
          <div class="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-brand-red-500/20 blur-3xl" />
        </div>

        <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 class="mb-4 text-center text-3xl font-bold text-white md:text-4xl">
            <span class="relative inline-block">
              {{ t('leveesDeFonds.sections.globalStats') }}
              <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-white/80 to-white/40" />
            </span>
          </h2>
          <p class="mx-auto mb-16 max-w-2xl text-center text-lg text-brand-blue-200">
            {{ t('leveesDeFonds.sections.globalStatsSubtitle') }}
          </p>

          <div class="flex flex-col items-center justify-center gap-16 md:flex-row md:gap-0 md:divide-x md:divide-white/20">
            <!-- Contributeurs -->
            <div class="flex flex-col items-center px-8 md:px-16">
              <p class="text-5xl font-extralight tracking-tight text-white md:text-6xl lg:text-7xl">
                {{ globalStats.total_contributors }}
              </p>
              <p class="mt-3 text-sm uppercase tracking-widest text-brand-blue-300">
                {{ t('leveesDeFonds.sections.totalContributors') }}
              </p>
            </div>

            <!-- Campagnes actives -->
            <div class="flex flex-col items-center px-8 md:px-16">
              <p class="text-5xl font-extralight tracking-tight text-white md:text-6xl lg:text-7xl">
                {{ globalStats.active_campaigns_count }}
              </p>
              <p class="mt-3 text-sm uppercase tracking-widest text-brand-blue-300">
                {{ t('leveesDeFonds.sections.activeCampaigns', globalStats.active_campaigns_count) }}
              </p>
            </div>

            <!-- Campagnes terminées -->
            <div class="flex flex-col items-center px-8 md:px-16">
              <p class="text-5xl font-extralight tracking-tight text-white md:text-6xl lg:text-7xl">
                {{ globalStats.completed_campaigns_count }}
              </p>
              <p class="mt-3 text-sm uppercase tracking-widest text-brand-blue-300">
                {{ t('leveesDeFonds.sections.completedCampaigns', globalStats.completed_campaigns_count) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Actualités -->
      <section
        id="news"
        class="bg-gray-50 py-16 dark:bg-gray-950 md:py-24"
      >
        <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 class="mb-3 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {{ t('leveesDeFonds.sections.relatedNews') }}
          </h2>
          <p class="mx-auto mb-14 max-w-lg text-center text-gray-500 dark:text-gray-400">
            {{ t('leveesDeFonds.sections.relatedNewsSubtitle') }}
          </p>

          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <NuxtLink
              v-for="item in mockNews"
              :key="item.id"
              :to="`/actualites/${item.slug}`"
              class="group"
            >
              <!-- Image -->
              <div class="aspect-[16/10] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                <img
                  v-if="item.cover_image"
                  :src="item.cover_image"
                  :alt="item.title"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                >
                <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue-100 to-brand-blue-200 dark:from-brand-blue-900 dark:to-brand-blue-800">
                  <svg class="h-10 w-10 text-brand-blue-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="mt-4">
                <div class="flex items-center gap-2">
                  <span
                    v-for="tag in item.tags"
                    :key="tag.slug"
                    class="text-xs font-medium text-brand-blue-600 dark:text-brand-blue-400"
                  >
                    {{ tag.name }}
                  </span>
                  <span class="text-xs text-gray-400 dark:text-gray-500">
                    {{ new Date(item.published_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                  </span>
                </div>
                <h3 class="mt-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-blue-600 dark:text-white dark:group-hover:text-brand-blue-400">
                  {{ item.title }}
                </h3>
                <p class="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {{ item.summary }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- All Contributors -->
      <section
        v-if="allContributors.length > 0"
        id="contributors"
        class="bg-white py-16 dark:bg-gray-900 md:py-24"
      >
        <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 class="mb-3 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {{ t('leveesDeFonds.sections.allContributors') }}
          </h2>
          <p class="mx-auto mb-14 max-w-lg text-center text-gray-500 dark:text-gray-400">
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
