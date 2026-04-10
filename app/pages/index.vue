<script setup lang="ts">
const { t } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()

// Sur la page d'accueil, on force `titleTemplate` à `%s` pour éviter le doublon
// "Université Senghor - ... | Université Senghor" provoqué par le template global.
useHead({
  titleTemplate: '%s'
})

useSeoMeta({
  title: () => t('hero.title'),
  ogTitle: () => t('hero.title'),
  description: () => t('og.defaultDescription'),
  ogDescription: () => t('og.defaultDescription'),
  ogUrl: () => siteUrl + route.path
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
