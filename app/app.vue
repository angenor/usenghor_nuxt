<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()

// Set document direction based on locale
watch(locale, (newLocale) => {
  if (import.meta.client) {
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLocale
  }
}, { immediate: true })

// Hide main navbar on externalized campus pages (they have their own CampusNavBar)
const showMainNavbar = computed(() => {
  const path = route.path
  // Match /a-propos/partenaires/campus/[slug] and its localized versions
  return !path.match(/^\/(en\/|ar\/)?a-propos\/partenaires\/campus\//)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <NuxtRouteAnnouncer />
    <AppNavBar v-if="showMainNavbar" />
    <main>
      <NuxtPage />
    </main>
    <AppFooter />
    <EventsWidget />
  </div>
</template>
