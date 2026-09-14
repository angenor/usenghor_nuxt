<script setup lang="ts">
/** État vide propre d'une rubrique du mini-site PEI (aucune donnée à afficher). */
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
  to?: string
  linkLabel?: string
}>(), {
  icon: 'fa-solid fa-folder-open',
  description: undefined,
  to: undefined,
  linkLabel: undefined,
})

const localePath = useLocalePath()
</script>

<template>
  <div role="status" class="py-24 px-4 text-center">
    <font-awesome-icon :icon="icon" class="w-12 h-12 text-gray-300 dark:text-gray-600" aria-hidden="true" />
    <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-3 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
      {{ description }}
    </p>
    <NuxtLink
      v-if="to && linkLabel"
      :to="localePath(to)"
      class="mt-8 inline-flex items-center gap-2 font-semibold text-brand-blue-700 dark:text-brand-blue-300 hover:underline"
    >
      {{ linkLabel }}
      <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
    </NuxtLink>
  </div>
</template>
