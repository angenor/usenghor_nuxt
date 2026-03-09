<script setup lang="ts">
interface Props {
  description: string | null
}

defineProps<Props>()
</script>

<template>
  <div v-if="description" class="prose prose-lg dark:prose-invert max-w-none mb-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
    <RichTextRenderer :html="description" />
  </div>
</template>
