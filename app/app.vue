<script setup lang="ts">
const { locale } = useI18n()
const router = useRouter()
const { $lenis } = useNuxtApp()
const { public: { siteUrl } } = useRuntimeConfig()

// SEO i18n : génère automatiquement lang, dir, hreflang alternate,
// canonical et og:locale. Nécessite `i18n.baseUrl` défini dans nuxt.config.ts.
const i18nHead = useLocaleHead({ seo: true })

// Meta OG globales (SSR) — fallback pour toutes les pages
const htmlLang = computed(() => i18nHead.value.htmlAttrs?.lang)
const htmlDir = computed<'auto' | 'ltr' | 'rtl' | undefined>(() => {
  const dir = i18nHead.value.htmlAttrs?.dir
  return dir === 'ltr' || dir === 'rtl' || dir === 'auto' ? dir : undefined
})

useHead({
  titleTemplate: '%s | Université Senghor',
  htmlAttrs: {
    lang: htmlLang,
    dir: htmlDir
  },
  link: () => i18nHead.value.link || [],
  meta: [
    { property: 'og:site_name', content: 'Université Senghor' },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: `${siteUrl}/images/og/og-default.png` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: `${siteUrl}/images/og/og-default.png` },
    ...(i18nHead.value.meta || [])
  ]
})

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
  <AppUpdateBanner />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
