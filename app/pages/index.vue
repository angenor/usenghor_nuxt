<script setup lang="ts">
const { t, locale } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()

const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => t('hero.title'),
  ogTitle: () => t('hero.title'),
  description: () => t('og.defaultDescription'),
  ogDescription: () => t('og.defaultDescription'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

// Chargement SSR du contenu éditorial pour tous les composants homepage
const { loadContent } = useEditorialContent('homepage')
await useAsyncData('editorial-homepage', () => loadContent())
</script>

<template>
  <div>
    <HeroSection />
    <MissionSection />
    <FormationsSection />
    <HistorySection />
    <PartnersSection />
    <PartnersCampusMapSection />
    <PartnersUnifiedPartnersSection variant="marquee" />
  </div>
</template>
