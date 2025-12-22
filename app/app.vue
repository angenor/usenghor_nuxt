<script setup lang="ts">
const { locale } = useI18n()

// Set document direction based on locale
watch(locale, (newLocale) => {
  if (import.meta.client) {
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLocale
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <NuxtRouteAnnouncer />
    <AppNavBar />
    <main>
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>
