<script setup lang="ts">
const { t } = useI18n()

// SEO
useSeoMeta({
  title: () => t('about.seo.title'),
  description: () => t('about.seo.description'),
  ogTitle: () => t('about.seo.title'),
  ogDescription: () => t('about.seo.description'),
  ogImage: 'https://picsum.photos/seed/og-about/1200/630'
})

// Stats data
const stats = computed(() => [
  { value: '30+', label: t('about.stats.years') },
  { value: '15', label: t('about.stats.countries') },
  { value: '5000+', label: t('about.stats.alumni') },
  { value: '50+', label: t('about.stats.programs') }
])

// Values data
const values = computed(() => [
  {
    icon: 'star',
    title: t('about.engagements.values.excellence.title'),
    text: t('about.engagements.values.excellence.text')
  },
  {
    icon: 'users',
    title: t('about.engagements.values.diversity.title'),
    text: t('about.engagements.values.diversity.text')
  },
  {
    icon: 'globe',
    title: t('about.engagements.values.openness.title'),
    text: t('about.engagements.values.openness.text')
  }
])

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about') }
])
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageHero
      :title="t('about.hero.title')"
      :subtitle="t('about.hero.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Mission Section -->
    <SectionAboutMission
      :title="t('about.mission.title')"
      :content="t('about.mission.content')"
      image="https://picsum.photos/seed/about-mission/800/600"
      :cta="{ label: t('about.mission.cta'), to: '/a-propos/histoire' }"
    />

    <!-- Stats Section -->
    <SectionStats :stats="stats" />

    <!-- Engagements Section -->
    <SectionEngagements
      :title="t('about.engagements.title')"
      :values="values"
      :charter="{ label: t('about.charter.download'), url: '/documents/charte-ethique.pdf' }"
    />

    <!-- Section Titre "Découvrir l'Université" -->
    <div class="py-12 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
          {{ t('about.preview.title') }}
        </h2>
      </div>
    </div>

    <!-- Sections indépendantes pour chaque sous-page -->
    <SectionAboutHistory />
    <SectionAboutGovernance />
    <SectionAboutStrategy />
    <SectionAboutOrganization />
    <SectionAboutTeam />
    <SectionAboutPartners />
    <SectionAboutCareers />
  </div>
</template>
