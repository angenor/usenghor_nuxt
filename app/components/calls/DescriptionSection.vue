<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'

interface Props {
  description: string | null
}

const props = defineProps<Props>()

// Parser le contenu EditorJS
const parsedDescription = computed((): OutputData | undefined => {
  if (!props.description) return undefined
  try {
    const parsed = JSON.parse(props.description)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    // Si ce n'est pas du JSON valide, créer un bloc paragraphe
    if (props.description.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: props.description } }],
        version: '2.28.0'
      }
    }
  }
  return undefined
})
</script>

<template>
  <div v-if="parsedDescription" class="prose prose-lg dark:prose-invert max-w-none mb-8">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
    <ClientOnly>
      <EditorJSRenderer :data="parsedDescription" />
    </ClientOnly>
  </div>
</template>
