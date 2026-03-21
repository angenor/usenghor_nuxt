<script setup lang="ts">
const { t, locale } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const route = useRoute()
const localePath = useLocalePath()

const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => t('formations.seo.title'),
  ogTitle: () => t('formations.seo.title'),
  description: () => t('formations.seo.description'),
  ogDescription: () => t('formations.seo.description'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

// Redirect to /nousrejoindre#etudiants
navigateTo(localePath('/nousrejoindre') + '#etudiants', { redirectCode: 301 })
</script>

<template>
  <div></div>
</template>
