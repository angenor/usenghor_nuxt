<script setup lang="ts">
const { t } = useI18n()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('careers')
const { getMediaUrl } = useMediaApi()

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-careers', () => loadContent())

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
  <div class="bg-grid-pattern">
    <!-- Hero -->
    <PageHero
      :title="getContent('careers.hero.title')"
      :subtitle="getContent('careers.hero.subtitle')"
      image="/images/bg/hero_section_default_backgroune.jpeg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Opportunities Cards -->
    <CareersOpportunitiesSection />

    <!-- Students Section -->
    <CareersStudentsSection :image="getMediaUrl(getRawContent('careers.students.image') ?? '', 'medium') || undefined" />

    <!-- Teachers Section -->
    <CareersTeachersSection
      :image="getMediaUrl(getRawContent('careers.teachers.image') ?? '', 'medium') || undefined"
    />

    <!-- Partners Section -->
    <CareersPartnersSection />
  </div>
</template>
