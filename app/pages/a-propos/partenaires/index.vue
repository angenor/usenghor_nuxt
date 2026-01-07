<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

// SEO
useSeoMeta({
  title: () => t('partners.seo.title'),
  description: () => t('partners.seo.description'),
  ogTitle: () => t('partners.seo.title'),
  ogDescription: () => t('partners.seo.description'),
  ogImage: 'https://picsum.photos/seed/og-partners/1200/630'
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.about'), to: localePath('/a-propos') },
  { label: t('partners.hero.title') }
])
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageHero
      :badge="t('partners.hero.badge')"
      :title="t('partners.hero.title')"
      :subtitle="t('partners.hero.subtitle')"
      :breadcrumb="breadcrumb"
      badge-icon="fa-solid fa-globe"
    />

    <!-- Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Campus Map Section -->
    <PartnersCampusMapSection />

    <!-- Strategic Partners Section -->
    <PartnersStrategicPartnersSection />
  </div>
</template>
