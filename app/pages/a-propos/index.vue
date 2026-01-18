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
  { value: '4200+', label: t('about.stats.alumni') },
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
    icon: 'shield',
    title: t('about.engagements.values.ethics.title'),
    text: t('about.engagements.values.ethics.text')
  },
  {
    icon: 'users',
    title: t('about.engagements.values.inclusion.title'),
    text: t('about.engagements.values.inclusion.text')
  },
  {
    icon: 'lightbulb',
    title: t('about.engagements.values.innovation.title'),
    text: t('about.engagements.values.innovation.text')
  },
  {
    icon: 'handshake',
    title: t('about.engagements.values.solidarity.title'),
    text: t('about.engagements.values.solidarity.text')
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
      :cta-links="[
        { label: t('about.mission.discover.history'), to: '/a-propos/histoire', icon: 'fa-solid fa-landmark' },
        { label: t('about.mission.discover.governance'), to: '/a-propos/gouvernance', icon: 'fa-solid fa-building-columns' }
      ]"
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
