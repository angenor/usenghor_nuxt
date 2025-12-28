<script setup lang="ts">
const { t } = useI18n()

// SEO
useSeoMeta({
  title: () => t('about.tabs.strategy'),
  description: () => t('wip.message')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('about.tabs.strategy') }
])
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      :title="t('about.tabs.strategy')"
      :subtitle="t('wip.message')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Work in Progress -->
    <PageWorkInProgress
      :title="t('about.tabs.strategy')"
      icon="fa-solid fa-chess"
    />
  </div>
</template>
