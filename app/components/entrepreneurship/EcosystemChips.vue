<script setup lang="ts">
/** Chips des actions récurrentes d'animation de l'écosystème. */
defineProps<{
  title?: string
  items: string[]
}>()
</script>

<template>
  <div v-if="items.length">
    <p v-if="title" class="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center mb-4">
      {{ title }}
    </p>
    <ul class="flex flex-wrap justify-center gap-3">
      <li
        v-for="item in items"
        :key="item"
        class="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-700 dark:text-gray-200"
      >
        <font-awesome-icon icon="fa-solid fa-bolt" class="w-3.5 h-3.5 text-brand-blue-700 dark:text-brand-blue-300" aria-hidden="true" />
        {{ item }}
      </li>
    </ul>
  </div>
</template>
