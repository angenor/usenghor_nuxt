<script setup lang="ts">
const { t } = useI18n()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('careers')

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()
})

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
      :title="getContent('careers.hero.title')"
      :subtitle="getContent('careers.hero.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

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
