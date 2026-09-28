<script setup lang="ts">
/**
 * État vide engageant des sections d'un service (icône, phrase, bouton d'ajout).
 */
defineProps<{
  icon: string
  title: string
  text: string
  actionLabel: string
  /** Classes de la pastille d'icône (couleur de la section) */
  tone?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex flex-col items-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-800/60">
    <div
      class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
      :class="tone || 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'"
    >
      <font-awesome-icon :icon="['fas', icon]" class="h-6 w-6" aria-hidden="true" />
    </div>
    <p class="text-base font-semibold text-gray-900 dark:text-white">
      {{ title }}
    </p>
    <p class="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
      {{ text }}
    </p>
    <button
      type="button"
      class="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
      @click="emit('action')"
    >
      <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
      {{ actionLabel }}
    </button>
  </div>
</template>
