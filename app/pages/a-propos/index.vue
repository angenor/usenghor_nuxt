<script setup lang="ts">
const { t } = useI18n()
const { listContents } = useEditorialApi()

// SEO
useSeoMeta({
  title: () => t('about.seo.title'),
  description: () => t('about.seo.description'),
  ogTitle: () => t('about.seo.title'),
  ogDescription: () => t('about.seo.description'),
  ogImage: 'https://picsum.photos/seed/og-about/1200/630',
})

// Fallback values for stats (used if editorial API not available)
const statsFallback = ref({
  stats_years: '30+',
  stats_donor_countries: '15',
  stats_alumni: '4200+',
  stats_programs: '50+',
})

// Key figures loaded from editorial API
const keyFigures = ref({
  stats_years: '',
  stats_donor_countries: '',
  stats_alumni: '',
  stats_programs: '',
})

// Load key figures on mount
onMounted(async () => {
  try {
    const response = await listContents({ value_type: 'number', limit: 50 })
    for (const item of response.items) {
      if (item.value && Object.prototype.hasOwnProperty.call(keyFigures.value, item.key)) {
        // @ts-expect-error dynamic key assignment
        keyFigures.value[item.key] = item.value
      }
    }
  }
  catch {
    console.warn('Chiffres clés non disponibles, utilisation des fallbacks')
  }
})

// Stats data with editorial API values (with fallback)
const stats = computed(() => [
  {
    value: keyFigures.value.stats_years || statsFallback.value.stats_years,
    label: t('about.stats.years'),
  },
  {
    value: keyFigures.value.stats_donor_countries || statsFallback.value.stats_donor_countries,
    label: t('about.stats.countries'),
  },
  {
    value: keyFigures.value.stats_alumni || statsFallback.value.stats_alumni,
    label: t('about.stats.alumni'),
  },
  {
    value: keyFigures.value.stats_programs || statsFallback.value.stats_programs,
    label: t('about.stats.programs'),
  },
])

// Values data
const values = computed(() => [
  {
    icon: 'star',
    title: t('about.engagements.values.excellence.title'),
    text: t('about.engagements.values.excellence.text'),
  },
  {
    icon: 'shield',
    title: t('about.engagements.values.ethics.title'),
    text: t('about.engagements.values.ethics.text'),
  },
  {
    icon: 'users',
    title: t('about.engagements.values.inclusion.title'),
    text: t('about.engagements.values.inclusion.text'),
  },
  {
    icon: 'lightbulb',
    title: t('about.engagements.values.innovation.title'),
    text: t('about.engagements.values.innovation.text'),
  },
  {
    icon: 'handshake',
    title: t('about.engagements.values.solidarity.title'),
    text: t('about.engagements.values.solidarity.text'),
  },
])

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about') },
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
