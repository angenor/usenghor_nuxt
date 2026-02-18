<script setup lang="ts">
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
