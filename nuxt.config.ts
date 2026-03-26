import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  app: {
    head: {
      titleTemplate: '%s | Université Senghor',
      meta: [
        { property: 'og:site_name', content: 'Université Senghor' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: `${siteUrl}/images/og/og-default.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${siteUrl}/images/og/og-default.png` },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:locale:alternate', content: 'en_US' },
        { property: 'og:locale:alternate', content: 'ar_SA' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },
  alias: {
    '@bank': fileURLToPath(new URL('./bank', import.meta.url))
  },
  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
    prerender: {
      failOnError: false,
      crawlLinks: false
    },
    devProxy: {
      '/api': {
        target: 'http://localhost:8000/api',
        changeOrigin: true
      }
    }
  },
  vite: {
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia']
    },
    ssr: {
      noExternal: ['vue', 'vue-router', '@fortawesome/vue-fontawesome', '@fortawesome/fontawesome-svg-core']
    }
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxt/test-utils/module',
    './modules/version-generator'
  ],
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**'],
    autoI18n: true
  },
  css: [
    '~/assets/css/main.css',
    '~/assets/css/timeline.css',
    'animate.css',
    '@fontsource-variable/inter/index.css'
  ],
  i18n: {
    locales: [
      { code: 'fr', name: 'Français', file: 'fr/index.ts', dir: 'ltr' },
      { code: 'en', name: 'English', file: 'en/index.ts', dir: 'ltr' },
      { code: 'ar', name: 'العربية', file: 'ar/index.ts', dir: 'rtl' }
    ],
    defaultLocale: 'fr',
    langDir: 'locales',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})