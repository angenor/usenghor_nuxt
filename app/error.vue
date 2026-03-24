<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t, locale } = useI18n()

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() =>
  is404.value ? t('error_page.title') : t('error_page.generic_title')
)

const message = computed(() =>
  is404.value ? t('error_page.message') : t('error_page.generic_message')
)

const handleClearError = () => clearError({ redirect: locale.value === 'fr' ? '/' : `/${locale.value}` })

useHead({
  title: title.value
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <div class="text-center max-w-lg">
      <!-- Illustration SVG -->
      <div class="mx-auto mb-6 w-64 h-64 sm:w-80 sm:h-80">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <!-- Cercle de fond -->
          <circle cx="200" cy="200" r="160" class="fill-brand-blue-50 dark:fill-brand-blue-950/40" />
          <circle cx="200" cy="200" r="160" class="stroke-brand-blue-200 dark:stroke-brand-blue-800" stroke-width="2" stroke-dasharray="8 6" opacity="0.6">
            <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="60s" repeatCount="indefinite" />
          </circle>

          <!-- Livre ouvert -->
          <g transform="translate(200, 230)">
            <!-- Ombre du livre -->
            <ellipse cx="0" cy="65" rx="95" ry="12" class="fill-brand-blue-200/40 dark:fill-brand-blue-800/30" />
            <!-- Page gauche -->
            <path d="M-8 -40 C-8 -40 -85 -35 -85 -20 L-85 50 C-85 55 -8 50 -8 50 Z" class="fill-white dark:fill-gray-800 stroke-brand-blue-300 dark:stroke-brand-blue-600" stroke-width="2" />
            <path d="M-8 -40 C-8 -40 -85 -35 -85 -20 L-85 50 C-85 55 -8 50 -8 50 Z" class="stroke-brand-blue-300 dark:stroke-brand-blue-600" stroke-width="2" fill="none" />
            <!-- Lignes de texte page gauche -->
            <line x1="-70" y1="-10" x2="-22" y2="-12" class="stroke-brand-blue-200 dark:stroke-brand-blue-700" stroke-width="3" stroke-linecap="round" />
            <line x1="-68" y1="2" x2="-24" y2="0" class="stroke-brand-blue-200 dark:stroke-brand-blue-700" stroke-width="3" stroke-linecap="round" />
            <line x1="-66" y1="14" x2="-26" y2="12" class="stroke-brand-blue-200 dark:stroke-brand-blue-700" stroke-width="3" stroke-linecap="round" />
            <line x1="-64" y1="26" x2="-40" y2="24" class="stroke-brand-blue-200 dark:stroke-brand-blue-700" stroke-width="3" stroke-linecap="round" />

            <!-- Page droite -->
            <path d="M8 -40 C8 -40 85 -35 85 -20 L85 50 C85 55 8 50 8 50 Z" class="fill-white dark:fill-gray-800" />
            <path d="M8 -40 C8 -40 85 -35 85 -20 L85 50 C85 55 8 50 8 50 Z" class="stroke-brand-blue-300 dark:stroke-brand-blue-600" stroke-width="2" fill="none" />
            <!-- Point d'interrogation sur la page droite -->
            <text x="46" y="20" text-anchor="middle" class="fill-brand-red-400 dark:fill-brand-red-500" font-size="48" font-weight="bold" font-family="serif" opacity="0.8">?</text>

            <!-- Reliure -->
            <path d="M0 -42 L0 52" class="stroke-brand-blue-400 dark:stroke-brand-blue-500" stroke-width="3" />
          </g>

          <!-- Pages qui s'envolent -->
          <g opacity="0.7">
            <rect x="90" y="90" width="40" height="52" rx="3" class="fill-white dark:fill-gray-700 stroke-brand-blue-300 dark:stroke-brand-blue-600" stroke-width="1.5" transform="rotate(-20 110 116)">
              <animateTransform attributeName="transform" type="translate" values="0,0; -15,-25; -10,-20" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.3;0.7" dur="4s" repeatCount="indefinite" />
            </rect>
            <rect x="270" y="100" width="36" height="48" rx="3" class="fill-white dark:fill-gray-700 stroke-brand-blue-300 dark:stroke-brand-blue-600" stroke-width="1.5" transform="rotate(15 288 124)">
              <animateTransform attributeName="transform" type="translate" values="0,0; 12,-20; 8,-15" dur="5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="5s" repeatCount="indefinite" />
            </rect>
            <rect x="130" y="70" width="32" height="42" rx="3" class="fill-white dark:fill-gray-700 stroke-brand-blue-300 dark:stroke-brand-blue-600" stroke-width="1.5" transform="rotate(-8 146 91)">
              <animateTransform attributeName="transform" type="translate" values="0,0; -8,-18; -5,-12" dur="6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.15;0.5" dur="6s" repeatCount="indefinite" />
            </rect>
          </g>

          <!-- Loupe -->
          <g transform="translate(280, 160) rotate(30)">
            <circle cx="0" cy="0" r="30" class="stroke-brand-blue-500 dark:stroke-brand-blue-400" stroke-width="5" fill="none" />
            <circle cx="0" cy="0" r="24" class="fill-brand-blue-100/30 dark:fill-brand-blue-400/10" />
            <!-- Reflet -->
            <path d="M-12 -18 Q-6 -22 0 -18" class="stroke-white dark:stroke-brand-blue-300" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6" />
            <!-- Manche -->
            <line x1="22" y1="22" x2="45" y2="45" class="stroke-brand-blue-600 dark:stroke-brand-blue-400" stroke-width="6" stroke-linecap="round" />
            <line x1="22" y1="22" x2="45" y2="45" class="stroke-brand-blue-700 dark:stroke-brand-blue-500" stroke-width="3" stroke-linecap="round" />
          </g>

          <!-- Petites etoiles decoratives -->
          <g class="fill-brand-red-400 dark:fill-brand-red-500" opacity="0.6">
            <circle cx="100" cy="140" r="3">
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="310" cy="260" r="2.5">
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="85" cy="260" r="2">
              <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      <!-- Code d'erreur -->
      <p class="text-7xl font-extrabold text-brand-blue-600 dark:text-brand-blue-400 select-none sm:text-8xl">
        {{ error.statusCode }}
      </p>

      <!-- Titre -->
      <h1 class="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
        {{ title }}
      </h1>

      <!-- Message -->
      <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
        {{ message }}
      </p>

      <!-- Bouton retour -->
      <div class="mt-8">
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue-600 transition-colors"
          @click="handleClearError"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            :class="locale === 'ar' ? 'rotate-180' : ''"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t('error_page.backHome') }}
        </button>
      </div>
    </div>
  </div>
</template>
