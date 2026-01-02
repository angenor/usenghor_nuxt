<script setup lang="ts">
const { t } = useI18n()

// SEO
useSeoMeta({
  title: () => t('careers.seo.title'),
  description: () => t('careers.seo.description'),
  ogTitle: () => t('careers.seo.title'),
  ogDescription: () => t('careers.seo.description')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('about.tabs.careers') }
])
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      :title="t('careers.hero.title')"
      :subtitle="t('careers.hero.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Introduction -->
    <CareersIntroSection />

    <!-- Opportunities Cards -->
    <CareersOpportunitiesSection />

    <!-- Teachers Section -->
    <CareersTeachersSection />

    <!-- Students Section -->
    <CareersStudentsSection />

    <!-- Partners Section -->
    <CareersPartnersSection />
  </div>
</template>
