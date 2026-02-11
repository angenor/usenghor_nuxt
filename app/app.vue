<script setup lang="ts">
const { locale } = useI18n()
const router = useRouter()
const { $lenis } = useNuxtApp()

// Set document direction based on locale
watch(locale, (newLocale) => {
  if (import.meta.client) {
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLocale
  }
}, { immediate: true })

// Remonter en haut de page lors de la navigation (Lenis intercepte le scroll natif)
if (import.meta.client) {
  router.afterEach((to, from) => {
    if (to.path !== from.path && !to.hash) {
      nextTick(() => {
        if ($lenis) {
          ($lenis as any).scrollTo(0, { immediate: true })
        }
      })
    }
  })
}
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
