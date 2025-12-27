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

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Mission Section -->
    <SectionAboutMission
      :title="t('about.mission.title')"
      :content="t('about.mission.content')"
      :transform-text="t('about.mission.transform')"
      :discover-items="[
        { label: t('about.mission.discover.history') },
        { label: t('about.mission.discover.governance') },
        { label: t('about.mission.discover.strategy') }
      ]"
      :cta-label="t('about.mission.ctaLabel')"
      cta-anchor="#history"
    />

    <!-- Stats Section -->
    <SectionStats :stats="stats" />

    <!-- Links to other sections -->
    <SectionAboutLinks />

    <!-- Engagements Section -->
    <SectionEngagements
      :title="t('about.engagements.title')"
      :values="values"
      :charter="{ label: t('about.charter.download'), url: '/documents/charte-ethique.pdf' }"
    />
  </div>
</template>
