<script setup lang="ts">
/**
 * Bandeau d'appel à l'action du pôle (lien interne `to` ou adresse directe `href`, ex. mailto).
 * `external` ouvre `href` dans un nouvel onglet ; slot `note` optionnel sous les boutons (spec 025).
 */
defineProps<{
  title: string
  description?: string | null
  buttonLabel: string
  to?: string
  href?: string
  email?: string | null
  external?: boolean
}>()

const localePath = useLocalePath()
</script>

<template>
  <div class="rounded-3xl bg-brand-blue-50 dark:bg-brand-blue-900/30 px-6 py-12 sm:p-16 text-center">
    <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
      {{ description }}
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-6">
      <a
        v-if="href"
        :href="href"
        :target="external ? '_blank' : undefined"
        :rel="external ? 'noopener noreferrer' : undefined"
        class="inline-flex items-center gap-3 rounded-full bg-brand-blue-500 hover:bg-brand-blue-600 px-8 py-4 font-semibold text-white transition-colors duration-200"
      >
        {{ buttonLabel }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
      </a>
      <NuxtLink
        v-else-if="to"
        :to="localePath(to)"
        class="inline-flex items-center gap-3 rounded-full bg-brand-blue-500 hover:bg-brand-blue-600 px-8 py-4 font-semibold text-white transition-colors duration-200"
      >
        {{ buttonLabel }}
        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
      </NuxtLink>
      <a
        v-if="email"
        :href="`mailto:${email}`"
        class="inline-flex items-center gap-2 font-medium text-brand-blue-700 dark:text-brand-blue-300 hover:underline break-all"
      >
        <font-awesome-icon icon="fa-regular fa-envelope" class="w-4 h-4" aria-hidden="true" />
        {{ email }}
      </a>
    </div>
    <p v-if="$slots.note" class="mt-4 text-sm text-gray-500 dark:text-gray-400">
      <slot name="note" />
    </p>
  </div>
</template>
