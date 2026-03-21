<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('partners')

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-partners', () => loadContent())

// SEO
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }
useSeoMeta({
  title: () => t('partners.seo.title'),
  description: () => t('partners.seo.description'),
  ogTitle: () => t('partners.seo.title'),
  ogDescription: () => t('partners.seo.description'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.about'), to: localePath('/a-propos') },
  { label: getContent('partners.hero.title') }
])
</script>

<template>
  <div class="bg-grid-pattern">
    <!-- Hero Section -->
    <PageHero
      :badge="getContent('partners.hero.badge')"
      :title="getContent('partners.hero.title')"
      :subtitle="getContent('partners.hero.subtitle')"
      :breadcrumb="breadcrumb"
      badge-icon="fa-solid fa-globe"
    />

    <!-- Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Tous les partenaires (avec filtres) -->
    <PartnersUnifiedPartnersSection />

    <!-- Campus externalisés (carte interactive) -->
    <PartnersCampusMapSection />

    

    
  </div>
</template>
