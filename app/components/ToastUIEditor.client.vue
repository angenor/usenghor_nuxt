<script setup lang="ts">
import Editor from '@toast-ui/editor'
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell'
import colorPlugin from '~/lib/toastui-color-plugin'
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
  (e: 'file-upload', payload: { file: File, callback: (url: string, name: string) => void }): void
}>()

const editorRef = ref<HTMLDivElement>()
const fileInputRef = ref<HTMLInputElement>()
const editorInstance = shallowRef<Editor | null>(null)
const isUpdating = ref(false)

// Extensions acceptées pour l'upload de fichiers (hors images gérées séparément)
const ACCEPTED_FILE_TYPES = [
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  // Audio
  'audio/*',
].join(',')

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const callback = (url: string, name: string) => {
    if (!editorInstance.value) return
    // Insertion d'un lien (mode WYSIWYG ou Markdown).
    // RichTextRenderer detectera l'extension pour styliser ou jouer l'audio.
    editorInstance.value.exec('addLink', {
      linkUrl: url,
      linkText: name || file.name,
    })
  }

  emit('file-upload', { file, callback })

  // Reset pour permettre de re-uploader le même fichier
  input.value = ''
}

function triggerFileUpload() {
  fileInputRef.value?.click()
}

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

  // Bouton custom pour upload de fichier (PDF, Word, Excel, audio…)
  const fileButton = document.createElement('button')
  fileButton.type = 'button'
  fileButton.className = 'toastui-editor-toolbar-icons toastui-editor-file-upload-btn'
  fileButton.setAttribute('aria-label', 'Joindre un fichier')
  fileButton.style.backgroundImage = 'none'
  fileButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>'
  fileButton.addEventListener('click', triggerFileUpload)

  const editor = new Editor({
    el: editorRef.value,
    initialValue: props.modelValue || '',
    initialEditType: props.initialEditType,
    previewStyle: 'vertical',
    height: props.height,
    language: props.language,
    placeholder: props.placeholder,
    plugins: [tableMergedCell, colorPlugin],
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
      [{
        name: 'file',
        tooltip: 'Joindre un fichier (PDF, Word, Excel, audio…)',
        el: fileButton,
      }],
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
  <div v-else>
    <div ref="editorRef" class="toastui-editor-wrapper" />
    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      :accept="ACCEPTED_FILE_TYPES"
      @change="onFileSelected"
    >
  </div>
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

/* ===== Color Picker Plugin Styles ===== */

/* Bouton split (couleur de texte / surlignage) */
.color-split-btn {
  display: inline-flex;
  align-items: center;
  height: 28px;
  border-radius: 3px;
  overflow: hidden;
  vertical-align: middle;
}

.color-split-btn .color-apply-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px 4px 0;
  color: #333;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.color-split-btn .color-apply-btn:hover {
  background-color: #e8eaed;
}

.color-split-btn .color-indicator {
  display: block;
  width: 16px;
  height: 3px;
  margin-top: 1px;
  border-radius: 1px;
}

.color-split-btn .color-dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 10px;
  color: #555;
}

.color-split-btn .color-dropdown-btn:hover {
  background-color: #e8eaed;
}

/* Icônes dans les boutons split */
.color-icon-text {
  font-family: serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.color-icon-highlight {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-icon-highlight svg {
  width: 14px;
  height: 14px;
}

/* Popup color picker — positionné en fixed sur le body */
.color-popup-container {
  position: fixed;
  z-index: 10000;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 220px;
}

.color-picker-popup {
  padding: 8px;
}

.color-picker-popup .color-section {
  margin-bottom: 6px;
}

.color-picker-popup .color-section label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-picker-popup .color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.color-picker-popup .color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.15s, transform 0.15s;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.color-picker-popup .color-swatch:hover {
  border-color: #333;
  transform: scale(1.15);
}

.color-picker-popup .color-swatch:focus {
  outline: 2px solid #049ddf;
  outline-offset: 1px;
}

.color-picker-popup hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 8px 0;
}

/* Section couleur personnalisée */
.color-picker-popup .color-custom {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.color-picker-popup .color-custom input[type="color"] {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px;
  cursor: pointer;
  background: transparent;
}

.color-picker-popup .color-custom input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker-popup .color-custom input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 2px;
}

.color-picker-popup .color-hex-input {
  width: 80px;
  height: 28px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 6px;
  font-family: monospace;
  font-size: 12px;
}

.color-picker-popup .color-hex-input.error {
  border-color: #e53e3e;
}

.color-picker-popup .color-error {
  font-size: 10px;
  color: #e53e3e;
}

.color-picker-popup .color-apply-custom {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.color-picker-popup .color-apply-custom:hover:not(:disabled) {
  background: #e8eaed;
}

.color-picker-popup .color-apply-custom:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sélecteur de border-radius */
.color-picker-popup .radius-section {
  margin-top: 4px;
}

.color-picker-popup .radius-grid {
  display: flex;
  gap: 4px;
}

.color-picker-popup .radius-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.color-picker-popup .radius-btn:hover {
  background: #f5f5f5;
  border-color: #aaa;
}

.color-picker-popup .radius-btn.active {
  border-color: #049ddf;
  background: #e8f4fd;
}

.color-picker-popup .radius-preview {
  display: block;
  width: 28px;
  height: 14px;
  background: #ffd966;
}

.color-picker-popup .radius-label {
  font-size: 9px;
  color: #666;
  line-height: 1;
}

/* Bouton supprimer la couleur */
.color-picker-popup .color-remove {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.color-picker-popup .color-remove:hover {
  background: #f5f5f5;
  color: #e53e3e;
  border-color: #e53e3e;
}

/* ===== Dark mode — Color Picker ===== */

.dark .color-popup-container {
  background: #1f2937;
  border-color: #374151;
}

.dark .color-split-btn .color-apply-btn {
  color: #d1d5db;
}

.dark .color-split-btn .color-apply-btn:hover {
  background-color: #374151;
}

.dark .color-split-btn .color-dropdown-btn {
  color: #9ca3af;
}

.dark .color-split-btn .color-dropdown-btn:hover {
  background-color: #374151;
}

.dark .color-picker-popup .color-section label {
  color: #9ca3af;
}

.dark .color-picker-popup .color-swatch {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
}

.dark .color-picker-popup .color-swatch:hover {
  border-color: #e5e7eb;
}

.dark .color-picker-popup hr {
  border-top-color: #374151;
}

.dark .color-picker-popup .color-custom input[type="color"] {
  border-color: #4b5563;
}

.dark .color-picker-popup .color-hex-input {
  background-color: #111827;
  color: #e5e7eb;
  border-color: #4b5563;
}

.dark .color-picker-popup .color-hex-input.error {
  border-color: #f87171;
}

.dark .color-picker-popup .color-error {
  color: #f87171;
}

.dark .color-picker-popup .color-apply-custom {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

.dark .color-picker-popup .color-apply-custom:hover:not(:disabled) {
  background: #4b5563;
}

.dark .color-picker-popup .radius-btn {
  border-color: #4b5563;
}

.dark .color-picker-popup .radius-btn:hover {
  background: #374151;
  border-color: #6b7280;
}

.dark .color-picker-popup .radius-btn.active {
  border-color: #049ddf;
  background: #0c3547;
}

.dark .color-picker-popup .radius-label {
  color: #9ca3af;
}

.dark .color-picker-popup .color-remove {
  border-color: #4b5563;
  color: #9ca3af;
}

.dark .color-picker-popup .color-remove:hover {
  background: #374151;
  color: #f87171;
  border-color: #f87171;
}

/* ===== RTL — Color Picker ===== */
.toastui-editor-wrapper[dir="rtl"] .color-picker-popup .color-grid {
  direction: rtl;
}

.toastui-editor-wrapper[dir="rtl"] .color-picker-popup .color-custom {
  direction: rtl;
}
</style>
