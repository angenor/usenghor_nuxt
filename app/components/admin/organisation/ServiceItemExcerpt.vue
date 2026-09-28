<script setup lang="ts">
/**
 * Extrait texte (sans HTML ni Markdown) d'une description riche, tronqué en CSS.
 */
const props = withDefaults(defineProps<{
  html?: string | null
  md?: string | null
  /** Nombre de lignes affichées */
  lines?: 1 | 2 | 3
}>(), {
  html: null,
  md: null,
  lines: 2,
})

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&apos;': '\'',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&laquo;': '«',
  '&raquo;': '»',
  '&hellip;': '…',
}

function fromHtml(html: string): string {
  return html
    .replace(/<(br|\/p|\/li|\/h[1-6]|\/div)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z#0-9]+;/gi, entity => ENTITIES[entity.toLowerCase()] ?? ' ')
}

function fromMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~`]+/g, '')
}

const text = computed(() => {
  const raw = props.html ? fromHtml(props.html) : props.md ? fromMarkdown(props.md) : ''
  return raw.replace(/\s+/g, ' ').trim()
})

const clampClass = computed(() => ({ 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3' }[props.lines]))
</script>

<template>
  <p v-if="text" class="text-sm text-gray-600 dark:text-gray-400" :class="clampClass">
    {{ text }}
  </p>
  <p v-else class="text-sm italic text-gray-400 dark:text-gray-500">
    Pas de description
  </p>
</template>
