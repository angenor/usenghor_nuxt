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
      <!-- Logo Dieese -->
      <div class="mx-auto mb-6 w-64 h-64 sm:w-80 sm:h-80">
        <img
          src="/images/logos/Dieese_couleur.png"
          alt="Université Senghor"
          class="w-full h-full object-contain opacity-60"
        >
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
