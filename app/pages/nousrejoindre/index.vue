<script setup lang="ts">
const { t, locale } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('careers')
const { getMediaUrl } = useMediaApi()

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-careers', () => loadContent())

// SEO
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => t('careers.seo.title'),
  description: () => t('careers.seo.description'),
  ogTitle: () => t('careers.seo.title'),
  ogDescription: () => t('careers.seo.description'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
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
