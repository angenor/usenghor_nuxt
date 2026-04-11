<script setup lang="ts">
interface Props {
  html?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
  class: '',
})

// Extensions reconnues
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus', 'webm']

// Pictogramme générique de fichier (SVG inline)
const SVG_FILE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 7V3.5L19.5 9H14Z"/></svg>'

const DOCUMENT_EXTENSIONS: Record<string, { label: string, color: string }> = {
  pdf: { label: 'PDF', color: 'text-red-600 dark:text-red-400' },
  doc: { label: 'Word', color: 'text-blue-600 dark:text-blue-400' },
  docx: { label: 'Word', color: 'text-blue-600 dark:text-blue-400' },
  xls: { label: 'Excel', color: 'text-green-600 dark:text-green-400' },
  xlsx: { label: 'Excel', color: 'text-green-600 dark:text-green-400' },
  csv: { label: 'CSV', color: 'text-green-600 dark:text-green-400' },
  ppt: { label: 'PowerPoint', color: 'text-orange-600 dark:text-orange-400' },
  pptx: { label: 'PowerPoint', color: 'text-orange-600 dark:text-orange-400' },
  txt: { label: 'Texte', color: 'text-gray-600 dark:text-gray-400' },
  zip: { label: 'Archive', color: 'text-yellow-600 dark:text-yellow-400' },
  rar: { label: 'Archive', color: 'text-yellow-600 dark:text-yellow-400' },
}

const processedHtml = computed(() => {
  if (!props.html) return ''
  let html = transformFileLinks(props.html)
  html = processLinks(html)
  return html
})

/**
 * Extrait l'extension d'une URL (en ignorant la query string et le hash).
 */
function getExtension(url: string): string {
  const cleaned = url.split('?')[0]?.split('#')[0] ?? ''
  const lastDot = cleaned.lastIndexOf('.')
  if (lastDot === -1) return ''
  return cleaned.slice(lastDot + 1).toLowerCase()
}

/**
 * Échappe les caractères spéciaux HTML pour éviter les injections lors de la
 * réécriture (le contenu vient de l'éditeur admin mais on reste prudent).
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Transforme les liens vers des fichiers en lecteurs audio ou cards de
 * téléchargement selon leur extension. Les liens classiques (web, ancres)
 * sont laissés intacts.
 */
function transformFileLinks(html: string): string {
  return html.replace(
    /<a\s+([^>]*?)href=(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (match, _attrsBefore, _quote, url, _attrsAfter, innerText) => {
      const ext = getExtension(url)
      if (!ext) return match

      const safeUrl = escapeHtml(url)
      const safeText = (innerText as string).trim() || safeUrl

      // === Audio ===
      if (AUDIO_EXTENSIONS.includes(ext)) {
        return `<figure class="my-4 not-prose">
  <figcaption class="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">${safeText}</figcaption>
  <audio controls preload="metadata" class="w-full">
    <source src="${safeUrl}">
    Votre navigateur ne supporte pas la lecture audio.
  </audio>
</figure>`
      }

      // === Documents ===
      const doc = DOCUMENT_EXTENSIONS[ext]
      if (doc) {
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" download class="not-prose my-2 inline-flex max-w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 no-underline shadow-sm transition hover:border-brand-red-300 hover:bg-white hover:shadow dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-red-500 dark:hover:bg-gray-900">
  <span class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-white ${doc.color} dark:bg-gray-900">
    ${SVG_FILE}
  </span>
  <span class="flex min-w-0 flex-col">
    <span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">${safeText}</span>
    <span class="text-xs text-gray-500 dark:text-gray-400">${doc.label} · Télécharger</span>
  </span>
</a>`
      }

      return match
    },
  )
}

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