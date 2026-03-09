<script setup lang="ts">
interface Props {
  html?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
  class: '',
})

const processedHtml = computed(() => {
  if (!props.html) return ''
  return processLinks(props.html)
})

function processLinks(html: string): string {
  // Ajouter target="_blank" et rel="noopener noreferrer" aux liens externes
  return html.replace(
    /<a\s+(?=[^>]*href=["'](?:https?:\/\/)[^"']*["'])((?:(?!target=)[^>])*)>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer">',
  )
}
</script>

<template>
  <div
    :class="['prose dark:prose-invert max-w-none', props.class]"
    v-html="processedHtml"
  />
</template>
