<script setup lang="ts">
const { t, locale } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()

const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => t('nav.about'),
  ogTitle: () => t('nav.about'),
  description: () => t('mission.subtitle'),
  ogDescription: () => t('mission.subtitle'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})
</script>

<template>
  <div class="min-h-screen pt-20">
    <!-- Hero Section -->
    <section class="relative py-20 bg-gradient-to-br from-gray-900 to-gray-800">
      <div class="absolute inset-0 overflow-hidden">
        <img
          src="/images/bg/covers_image.jpg"
          alt="À propos"
          class="w-full h-full object-cover opacity-30"
        />
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4">
          {{ t('nav.about') }}
        </h1>
        <p class="text-xl text-white/80 max-w-2xl mx-auto">
          {{ t('mission.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Content -->
    <MissionSection />
    <HistorySection />
    <PartnersSection />
    <CampusSection />
  </div>
</template>
