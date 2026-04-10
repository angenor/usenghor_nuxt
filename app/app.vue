<script setup lang="ts">
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

// Données structurées Schema.org : EducationalOrganization (CollegeOrUniversity) + WebSite
// Permet à Google d'afficher le knowledge panel et la sitelinks searchbox.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollegeOrUniversity',
  '@id': `${siteUrl}/#organization`,
  name: 'Université Senghor',
  alternateName: ['Université internationale Senghor', 'Senghor University'],
  url: siteUrl,
  logo: `${siteUrl}/images/logos/logo-web-noir-petit.png`,
  image: `${siteUrl}/images/og/og-default.png`,
  foundingDate: '1990',
  description: "Université internationale de la Francophonie, opérateur direct de l'OIF, formant les cadres africains au développement durable depuis Alexandrie.",
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1 Place Ahmed Orabi, El Mancheya',
    addressLocality: 'Alexandrie',
    addressCountry: 'EG'
  },
  sameAs: [
    'https://facebook.com/usenghor',
    'https://twitter.com/usenghor',
    'https://linkedin.com/school/usenghor',
    'https://youtube.com/usenghor',
    'https://instagram.com/usenghor'
  ]
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: 'Université Senghor',
  url: siteUrl,
  inLanguage: ['fr', 'en', 'ar'],
  publisher: { '@id': `${siteUrl}/#organization` }
}

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
  ],
  script: [
    {
      type: 'application/ld+json',
      key: 'jsonld-organization',
      innerHTML: JSON.stringify(organizationJsonLd)
    },
    {
      type: 'application/ld+json',
      key: 'jsonld-website',
      innerHTML: JSON.stringify(websiteJsonLd)
    }
  ]
})

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
