<script setup lang="ts">
/**
 * Bandeau d'appel à l'action du pôle (lien interne `to` ou adresse directe `href`, ex. mailto).
 * `external` ouvre `href` dans un nouvel onglet ; slot `note` optionnel sous les boutons (spec 025).
 * `variant="rose"` : encart rose, texte à gauche et bouton rouge à droite (« Devenir mentor »).
 */
withDefaults(defineProps<{
  title: string
  description?: string | null
  buttonLabel: string
  to?: string
  href?: string
  email?: string | null
  external?: boolean
  variant?: 'default' | 'rose'
}>(), {
  description: undefined,
  to: undefined,
  href: undefined,
  email: undefined,
  variant: 'default',
})

const ROSE_BUTTON = 'inline-flex min-h-[3.5rem] items-center gap-3 rounded-xl bg-brand-red-700 px-7 text-base font-extrabold text-white transition-colors duration-200 hover:bg-brand-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red-700 dark:bg-brand-red-600 dark:hover:bg-brand-red-700'

const localePath = useLocalePath()
</script>

<template>
  <div
    v-if="variant === 'rose'"
    class="grid items-center gap-8 rounded-[2rem] bg-[#fff1f1] px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:px-16 dark:bg-brand-red-950/40 dark:ring-1 dark:ring-inset dark:ring-brand-red-900/50"
  >
    <div class="flex min-w-0 flex-col gap-3">
      <h2 class="text-3xl font-black leading-[1.1] tracking-[-0.025em] text-brand-blue-900 dark:text-white sm:text-[2.5rem]">
        {{ title }}
      </h2>
      <p v-if="description" class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
        {{ description }}
      </p>
    </div>
    <div class="flex flex-col items-start gap-3 lg:items-end">
      <a
        v-if="href"
        :href="href"
        :target="external ? '_blank' : undefined"
        :rel="external ? 'noopener noreferrer' : undefined"
        :class="ROSE_BUTTON"
      >
        {{ buttonLabel }}
      </a>
      <NuxtLink v-else-if="to" :to="localePath(to)" :class="ROSE_BUTTON">
        {{ buttonLabel }}
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
    <p v-if="$slots.note" class="text-sm text-gray-600 dark:text-gray-400 lg:col-span-2">
      <slot name="note" />
    </p>
  </div>
  <div v-else class="rounded-3xl bg-brand-blue-50 dark:bg-brand-blue-900/30 px-6 py-12 sm:p-16 text-center">
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
