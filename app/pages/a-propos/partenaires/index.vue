<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('partners')

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()
})

// SEO
useSeoMeta({
  title: () => t('partners.seo.title'),
  description: () => t('partners.seo.description'),
  ogTitle: () => t('partners.seo.title'),
  ogDescription: () => t('partners.seo.description'),
  ogImage: undefined
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
