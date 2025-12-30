import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  alias: {
    '@bank': fileURLToPath(new URL('./bank', import.meta.url))
  },
  nitro: {
    preset: 'static',
    prerender: {
      failOnError: false,
      crawlLinks: true
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
    '@nuxt/test-utils/module'
  ],
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