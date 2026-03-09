<script setup lang="ts">
import Editor from '@toast-ui/editor'
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/i18n/fr-fr'
import '@toast-ui/editor-plugin-table-merged-cell/dist/toastui-editor-plugin-table-merged-cell.css'

interface Props {
  modelValue?: string
  initialEditType?: 'wysiwyg' | 'markdown'
  height?: string
  placeholder?: string
  language?: string
  direction?: 'ltr' | 'rtl'
  disabled?: boolean
  mode?: 'inline' | 'modal'
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  initialEditType: 'wysiwyg',
  height: '400px',
  placeholder: 'Commencez à écrire...',
  language: 'fr-FR',
  direction: 'ltr',
  disabled: false,
  mode: 'modal',
  label: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:html', value: string): void
  (e: 'ready'): void
  (e: 'image-upload', payload: { blob: Blob, callback: (url: string, alt?: string) => void }): void
}>()

const editorRef = ref<HTMLDivElement>()
const editorInstance = shallowRef<Editor | null>(null)
const isUpdating = ref(false)

// Modal mode state
const isModalOpen = ref(false)

function onModalConfirm(payload: { markdown: string, html: string }) {
  emit('update:modelValue', payload.markdown)
  emit('update:html', payload.html)
  isModalOpen.value = false
}

function onModalCancel() {
  isModalOpen.value = false
}

// Aperçu du contenu pour le bouton modal
const contentPreview = computed(() => {
  if (!props.modelValue) return ''
  // Strip basic markdown syntax for plain text preview
  return props.modelValue
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/^[-*+]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^>\s/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 100)
})

onMounted(async () => {
  if (props.mode === 'modal') return
  await nextTick()
  if (!editorRef.value) return

  const editor = new Editor({
    el: editorRef.value,
    initialValue: props.modelValue || '',
    initialEditType: props.initialEditType,
    previewStyle: 'vertical',
    height: props.height,
    language: props.language,
    placeholder: props.placeholder,
    plugins: [tableMergedCell],
    hooks: {
      addImageBlobHook: (blob: Blob | File, callback: (url: string, alt?: string) => void) => {
        emit('image-upload', { blob, callback })
      },
    },
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
      ['scrollSync'],
    ],
  })

  editor.on('change', () => {
    if (isUpdating.value) return
    const md = editor.getMarkdown()
    const html = editor.getHTML()
    emit('update:modelValue', md)
    emit('update:html', html)
  })

  editorInstance.value = editor
  emit('ready')

  // Appliquer la direction RTL si nécessaire (après un tick pour que le DOM interne soit prêt)
  if (props.direction === 'rtl') {
    await nextTick()
    applyDirection('rtl')
  }
})

onUnmounted(() => {
  editorInstance.value?.destroy()
  editorInstance.value = null
})

function applyDirection(dir: 'ltr' | 'rtl') {
  if (!editorRef.value) return
  // Attribut dir sur le wrapper pour les sélecteurs CSS
  editorRef.value.setAttribute('dir', dir)

  const isRtl = dir === 'rtl'
  const textAlign = isRtl ? 'right' : 'left'

  // Zone WYSIWYG (ProseMirror contenteditable)
  const editorContent = editorRef.value.querySelector('.toastui-editor-contents')
  if (editorContent) {
    (editorContent as HTMLElement).style.direction = dir
    ;(editorContent as HTMLElement).style.textAlign = textAlign
  }

  // Zone Markdown (CodeMirror)
  const codeMirror = editorRef.value.querySelector('.CodeMirror')
  if (codeMirror) {
    (codeMirror as HTMLElement).style.direction = dir
    ;(codeMirror as HTMLElement).style.textAlign = textAlign
  }

  // Preview Markdown
  const preview = editorRef.value.querySelector('.toastui-editor-md-preview')
  if (preview) {
    (preview as HTMLElement).style.direction = dir
    ;(preview as HTMLElement).style.textAlign = textAlign
  }
}

// Surveiller les changements de modelValue depuis l'extérieur
watch(() => props.modelValue, (newVal) => {
  if (!editorInstance.value || isUpdating.value) return
  const currentMd = editorInstance.value.getMarkdown()
  if (newVal !== currentMd) {
    isUpdating.value = true
    editorInstance.value.setMarkdown(newVal || '', false)
    nextTick(() => {
      isUpdating.value = false
    })
  }
})

// Surveiller les changements de direction
watch(() => props.direction, (newDir) => {
  applyDirection(newDir)
})

// Surveiller le mode disabled
watch(() => props.disabled, (disabled) => {
  if (!editorRef.value) return
  const wrapper = editorRef.value.querySelector('.toastui-editor-defaultUI') as HTMLElement
  if (wrapper) {
    wrapper.style.pointerEvents = disabled ? 'none' : ''
    wrapper.style.opacity = disabled ? '0.6' : ''
  }
})

defineExpose({
  getHTML: () => editorInstance.value?.getHTML() ?? '',
  getMarkdown: () => editorInstance.value?.getMarkdown() ?? '',
  setHTML: (html: string) => editorInstance.value?.setHTML(html),
  setMarkdown: (md: string) => editorInstance.value?.setMarkdown(md),
  focus: () => editorInstance.value?.focus(),
  clear: () => editorInstance.value?.reset(),
})
</script>

<template>
  <!-- Mode modal : bouton d'ouverture + modale plein écran -->
  <div v-if="mode === 'modal'">
    <button
      type="button"
      class="group w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-left transition-colors hover:border-brand-red-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-brand-red-500 dark:hover:bg-gray-800"
      @click="isModalOpen = true"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 group-hover:bg-brand-red-50 group-hover:text-brand-red-500 dark:bg-gray-700 dark:group-hover:bg-brand-red-900/30">
          <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-5 w-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p v-if="label" class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ label }}
          </p>
          <p v-if="contentPreview" class="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {{ contentPreview }}{{ modelValue && modelValue.length > 100 ? '...' : '' }}
          </p>
          <p v-else class="text-sm italic text-gray-400 dark:text-gray-500">
            Aucun contenu
          </p>
        </div>
        <font-awesome-icon :icon="['fas', 'expand']" class="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-brand-red-500" />
      </div>
    </button>

    <LazyAdminRichTextEditorModal
      v-if="isModalOpen"
      :initial-markdown="modelValue"
      :label="label"
      :direction="direction"
      :placeholder="placeholder"
      :language="language"
      @confirm="onModalConfirm"
      @cancel="onModalCancel"
    />
  </div>

  <!-- Mode inline : éditeur direct (comportement original) -->
  <div v-else ref="editorRef" class="toastui-editor-wrapper" />
</template>

<style>
/* Dark mode support */
.dark .toastui-editor-defaultUI {
  border-color: #374151;
}

.dark .toastui-editor-defaultUI .toastui-editor-toolbar {
  background-color: #1f2937;
  border-bottom-color: #374151;
}

.dark .toastui-editor-defaultUI .toastui-editor-toolbar button {
  color: #d1d5db;
  border-color: transparent;
}

.dark .toastui-editor-defaultUI .toastui-editor-toolbar button:hover {
  background-color: #374151;
}

.dark .toastui-editor-defaultUI .toastui-editor-toolbar button.active {
  background-color: #4b5563;
}

.dark .toastui-editor-contents {
  background-color: #111827;
  color: #e5e7eb;
}

.dark .toastui-editor-md-container {
  background-color: #111827;
}

.dark .toastui-editor-md-container .toastui-editor-md-preview {
  background-color: #1f2937;
  color: #e5e7eb;
}

.dark .toastui-editor-ww-container {
  background-color: #111827;
}

.dark .toastui-editor-mode-switch {
  background-color: #1f2937;
  border-top-color: #374151;
}

.dark .toastui-editor-mode-switch .tab-item {
  color: #9ca3af;
  border-color: #374151;
}

.dark .toastui-editor-mode-switch .tab-item.active {
  color: #e5e7eb;
  background-color: #374151;
}

.dark .toastui-editor-popup {
  background-color: #1f2937;
  border-color: #374151;
}

.dark .toastui-editor-popup input,
.dark .toastui-editor-popup select {
  background-color: #111827;
  color: #e5e7eb;
  border-color: #374151;
}

/* RTL support workaround — TOAST UI ne supporte pas nativement le RTL */

/* Zones de saisie et preview */
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents,
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-md-preview,
.toastui-editor-wrapper[dir="rtl"] .CodeMirror {
  direction: rtl;
  text-align: right;
}

/* ProseMirror (WYSIWYG) — paragraphes et headings */
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents .ProseMirror {
  direction: rtl;
  text-align: right;
}

/* Placeholder */
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents .placeholder {
  direction: rtl;
  text-align: right;
  right: 0;
  left: auto;
}

.toastui-editor-wrapper[dir="rtl"] .ProseMirror.ProseMirror-focused + .placeholder,
.toastui-editor-wrapper[dir="rtl"] .ProseMirror:not(:empty) + .placeholder {
  right: 0;
  left: auto;
}

/* Toolbar : garder LTR (icônes standard) mais inverser l'ordre visuel */
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-toolbar {
  direction: ltr;
}

/* Listes : puces et numéros à droite */
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents ul,
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents ol {
  padding-right: 1.5em;
  padding-left: 0;
}

/* Blockquote : bordure à droite */
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents blockquote {
  border-left: none;
  border-right: 4px solid #e5e7eb;
  padding-left: 0;
  padding-right: 1em;
}

/* Table cells */
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents table td,
.toastui-editor-wrapper[dir="rtl"] .toastui-editor-contents table th {
  text-align: right;
}

/* CodeMirror curseur et lignes */
.toastui-editor-wrapper[dir="rtl"] .CodeMirror-lines {
  direction: rtl;
  text-align: right;
}
</style>
