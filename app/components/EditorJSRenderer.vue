<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'

interface Props {
  data: OutputData
}

const props = defineProps<Props>()

interface BlockData {
  text?: string
  level?: number
  style?: string
  items?: string[] | ListItem[]
  file?: { url: string }
  caption?: string
  withBorder?: boolean
  withBackground?: boolean
  stretched?: boolean
  author?: string
  alignment?: string
  service?: string
  source?: string
  embed?: string
  width?: number
  height?: number
  content?: string[][]
  link?: string
  meta?: {
    title?: string
    description?: string
    image?: { url?: string }
  }
}

interface ListItem {
  content: string
  items?: ListItem[]
}

function renderBlock(type: string, data: BlockData): string {
  switch (type) {
    case 'paragraph':
      return `<p>${data.text || ''}</p>`

    case 'header':
      const level = data.level || 2
      return `<h${level}>${data.text || ''}</h${level}>`

    case 'list':
      const tag = data.style === 'ordered' ? 'ol' : 'ul'
      const items = data.items || []
      const listItems = items
        .map((item) => {
          if (typeof item === 'string') {
            return `<li>${item}</li>`
          }
          return `<li>${item.content}${item.items?.length ? renderNestedList(item.items, tag) : ''}</li>`
        })
        .join('')
      return `<${tag}>${listItems}</${tag}>`

    case 'image':
      const imgClasses = [
        data.withBorder ? 'border border-gray-300 dark:border-gray-600' : '',
        data.withBackground ? 'bg-gray-100 dark:bg-gray-800 p-4' : '',
        data.stretched ? 'w-full' : '',
      ]
        .filter(Boolean)
        .join(' ')
      return `
        <figure class="${imgClasses}">
          <img src="${data.file?.url || ''}" alt="${data.caption || ''}" class="mx-auto" />
          ${data.caption ? `<figcaption class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">${data.caption}</figcaption>` : ''}
        </figure>
      `

    case 'quote':
      return `
        <blockquote class="border-l-4 border-brand-red-500 pl-4 italic">
          <p>${data.text || ''}</p>
          ${data.caption ? `<cite class="block text-sm text-gray-500 dark:text-gray-400 mt-2">— ${data.caption}</cite>` : ''}
        </blockquote>
      `

    case 'delimiter':
      return `<hr class="my-8 border-gray-300 dark:border-gray-600" />`

    case 'embed':
      return `
        <div class="embed-container aspect-video">
          <iframe
            src="${data.embed || ''}"
            width="${data.width || '100%'}"
            height="${data.height || 400}"
            frameborder="0"
            allowfullscreen
            class="w-full"
          ></iframe>
          ${data.caption ? `<p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">${data.caption}</p>` : ''}
        </div>
      `

    case 'table':
      const rows = data.content || []
      const tableRows = rows
        .map(
          (row, index) =>
            `<tr>${row.map((cell) => (index === 0 ? `<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-50 dark:bg-gray-700">${cell}</th>` : `<td class="border border-gray-300 dark:border-gray-600 px-4 py-2">${cell}</td>`)).join('')}</tr>`
        )
        .join('')
      return `<table class="w-full border-collapse">${tableRows}</table>`

    case 'linkTool':
      return `
        <a href="${data.link || ''}" target="_blank" rel="noopener noreferrer" class="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div class="flex gap-4">
            ${data.meta?.image?.url ? `<img src="${data.meta.image.url}" alt="" class="w-16 h-16 object-cover rounded" />` : ''}
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">${data.meta?.title || data.link}</p>
              ${data.meta?.description ? `<p class="text-sm text-gray-500 dark:text-gray-400">${data.meta.description}</p>` : ''}
            </div>
          </div>
        </a>
      `

    default:
      return ''
  }
}

function renderNestedList(items: ListItem[], tag: string): string {
  const listItems = items
    .map((item) => `<li>${item.content}${item.items?.length ? renderNestedList(item.items, tag) : ''}</li>`)
    .join('')
  return `<${tag} class="ml-4">${listItems}</${tag}>`
}

const renderedHtml = computed(() => {
  if (!props.data?.blocks) return ''
  return props.data.blocks.map((block) => renderBlock(block.type, block.data as BlockData)).join('')
})
</script>

<template>
  <div class="editorjs-renderer prose prose-lg dark:prose-invert max-w-none" v-html="renderedHtml" />
</template>

<style>
.editorjs-renderer {
  @apply text-gray-900 dark:text-gray-100;
}

.editorjs-renderer h1,
.editorjs-renderer h2,
.editorjs-renderer h3,
.editorjs-renderer h4 {
  @apply font-bold text-gray-900 dark:text-gray-100;
}

.editorjs-renderer p {
  @apply mb-4 leading-relaxed;
}

.editorjs-renderer ul,
.editorjs-renderer ol {
  @apply mb-4 pl-6;
}

.editorjs-renderer ul {
  @apply list-disc;
}

.editorjs-renderer ol {
  @apply list-decimal;
}

.editorjs-renderer li {
  @apply mb-1;
}

.editorjs-renderer blockquote {
  @apply my-6;
}

.editorjs-renderer figure {
  @apply my-6;
}

.editorjs-renderer table {
  @apply my-6;
}

.editorjs-renderer a {
  @apply text-brand-blue-600 dark:text-brand-blue-400 hover:underline;
}

.editorjs-renderer code {
  @apply bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono;
}

.editorjs-renderer mark {
  @apply bg-brand-blue-200 dark:bg-brand-blue-600 px-0.5;
}
</style>
