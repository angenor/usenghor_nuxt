<script setup lang="ts">
const { t } = useI18n()

// SEO
useSeoMeta({
  title: () => t('about.tabs.careers'),
  description: () => t('wip.message')
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
      :title="t('about.tabs.careers')"
      :subtitle="t('wip.message')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Work in Progress -->
    <PageWorkInProgress
      :title="t('about.tabs.careers')"
      icon="fa-solid fa-briefcase"
    />
  </div>
</template>
