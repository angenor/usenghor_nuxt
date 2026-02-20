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

// Gestion du scroll lors de la navigation (Lenis intercepte le scroll natif)
if (import.meta.client) {
  router.afterEach((to, from) => {
    // Navigation vers une ancre : Lenis scroll vers l'élément après le rendu
    if (to.hash) {
      const delay = to.path !== from.path ? 600 : 100
      setTimeout(() => {
        const el = document.querySelector(to.hash)
        if (el) {
          if ($lenis) {
            ($lenis as any).scrollTo(el, { offset: -80 })
          } else {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }, delay)
      return
    }

    // Navigation sans ancre : remonter en haut
    if (to.path !== from.path) {
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
