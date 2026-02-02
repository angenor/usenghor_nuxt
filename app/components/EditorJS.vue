<script setup lang="ts">
import type { OutputData, API } from '@editorjs/editorjs'
import { toRaw } from 'vue'

interface Props {
  modelValue?: OutputData
  placeholder?: string
  readOnly?: boolean
  minHeight?: number
}

interface Emits {
  (e: 'update:modelValue', data: OutputData): void
  (e: 'ready', api: API): void
  (e: 'change', api: API): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: 'Commencez à écrire...',
  readOnly: false,
  minHeight: 300,
})

const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement>()
const editorInstance = shallowRef<InstanceType<typeof import('@editorjs/editorjs').default> | null>(null)
const undoInstance = shallowRef<InstanceType<typeof import('editorjs-undo').default> | null>(null)
const isReady = ref(false)

/**
 * Migre les données de l'ancien format @editorjs/list v1.x vers le nouveau format v2.x
 * Ancien: items: ["Item 1", "Item 2"]
 * Nouveau: items: [{ content: "Item 1", items: [] }, { content: "Item 2", items: [] }]
 */
function migrateListData(data: OutputData | undefined): OutputData | undefined {
  // DEBUG: Afficher les données brutes pour diagnostiquer
  console.log('[EditorJS] Données reçues:', data)

  if (!data?.blocks) return data

  // Convertir les données réactives Vue (Proxy) en objets JavaScript purs
  // pour éviter l'erreur "structuredClone cannot clone Proxy"
  const rawData: OutputData = JSON.parse(JSON.stringify(toRaw(data)))

  return {
    ...rawData,
    blocks: rawData.blocks.map((block) => {
      if (block.type === 'list' && Array.isArray(block.data?.items)) {
        // Migrer chaque item individuellement pour gérer les formats mixtes
        const migratedItems = block.data.items.map((item: unknown) => {
          // Si c'est une string (ancien format v1.x)
          if (typeof item === 'string') {
            return { content: item, items: [] }
          }
          // Si c'est un objet mais sans la propriété 'items' (format intermédiaire)
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>
            // S'assurer que 'content' existe et que 'items' est un tableau
            return {
              content: obj.content ?? obj.text ?? '',
              items: Array.isArray(obj.items) ? obj.items : [],
            }
          }
          // Fallback pour tout autre cas
          return { content: '', items: [] }
        })

        return {
          ...block,
          data: {
            ...block.data,
            items: migratedItems,
          },
        }
      }
      return block
    }),
  }
}

async function initEditor() {
  if (!editorContainer.value || import.meta.server) return

  const [
    { default: EditorJS },
    { default: Header },
    { default: List },
    { default: Paragraph },
    { default: Image },
    { default: Quote },
    { default: Embed },
    { MergeTable },
    { default: Delimiter },
    { default: InlineCode },
    { default: Marker },
    { default: LinkTool },
    { default: Checklist },
    { default: Undo },
  ] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@editorjs/header'),
    import('@editorjs/list'),
    import('@editorjs/paragraph'),
    import('@editorjs/image'),
    import('@editorjs/quote'),
    import('@editorjs/embed'),
    import('~/components/editorjs/MergeTable'),
    import('@editorjs/delimiter'),
    import('@editorjs/inline-code'),
    import('@editorjs/marker'),
    import('@editorjs/link'),
    import('@editorjs/checklist'),
    import('editorjs-undo'),
  ])

  editorInstance.value = new EditorJS({
    holder: editorContainer.value,
    data: migrateListData(props.modelValue),
    placeholder: props.placeholder,
    readOnly: props.readOnly,
    minHeight: props.minHeight,
    i18n: {
      messages: {
        ui: {
          blockTunes: {
            toggler: {
              'Click to tune': 'Cliquez pour configurer',
              'or drag to move': 'ou glissez pour déplacer',
            },
          },
          inlineToolbar: {
            converter: {
              'Convert to': 'Convertir en',
            },
          },
          toolbar: {
            toolbox: {
              Add: 'Ajouter',
            },
          },
        },
        toolNames: {
          Text: 'Texte',
          Heading: 'Titre',
          List: 'Liste',
          Checklist: 'Liste de tâches',
          Quote: 'Citation',
          Delimiter: 'Séparateur',
          Table: 'Tableau',
          Image: 'Image',
          Embed: 'Vidéo intégrée',
          Link: 'Lien',
        },
        tools: {
          header: {
            'Heading 1': 'Titre 1 (H1)',
            'Heading 2': 'Titre 2 (H2)',
            'Heading 3': 'Titre 3 (H3)',
            'Heading 4': 'Titre 4 (H4)',
          },
          list: {
            Unordered: 'Liste à puces',
            Ordered: 'Liste numérotée',
          },
          table: {
            'Add row above': 'Ajouter une ligne au-dessus',
            'Add row below': 'Ajouter une ligne en-dessous',
            'Delete row': 'Supprimer la ligne',
            'Add column to left': 'Ajouter une colonne à gauche',
            'Add column to right': 'Ajouter une colonne à droite',
            'Delete column': 'Supprimer la colonne',
            'With headings': 'Avec en-têtes',
            'Without headings': 'Sans en-têtes',
          },
        },
        blockTunes: {
          delete: {
            Delete: 'Supprimer',
          },
          moveUp: {
            'Move up': 'Déplacer vers le haut',
          },
          moveDown: {
            'Move down': 'Déplacer vers le bas',
          },
        },
      },
    },
    tools: {
      header: {
        class: Header,
        inlineToolbar: true,
        config: {
          levels: [1, 2, 3, 4],
          defaultLevel: 2,
        },
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered',
        },
      },
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      image: {
        class: Image,
        config: {
          uploader: {
            async uploadByFile(file: File) {
              // TODO: Implémenter l'upload vers Firebase Storage
              const url = URL.createObjectURL(file)
              return {
                success: 1,
                file: { url },
              }
            },
            async uploadByUrl(url: string) {
              return {
                success: 1,
                file: { url },
              }
            },
          },
        },
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Entrez une citation',
          captionPlaceholder: 'Auteur de la citation',
        },
      },
      embed: {
        class: Embed,
        config: {
          services: {
            youtube: true,
            vimeo: true,
            twitter: true,
          },
        },
      },
      table: {
        class: MergeTable,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 3,
        },
      },
      delimiter: Delimiter,
      inlineCode: InlineCode,
      marker: Marker,
      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },
      linkTool: {
        class: LinkTool,
        config: {
          endpoint: '/api/fetchUrl', // Endpoint pour récupérer les métadonnées d'URL
        },
      },
    },
    onChange: async (api) => {
      const data = await api.saver.save()
      // DEBUG: Afficher les données sauvegardées
      console.log('[EditorJS] Données sauvegardées:', data)
      emit('update:modelValue', data)
      emit('change', api)
    },
    onReady: () => {
      isReady.value = true
      if (editorInstance.value) {
        // TODO: Le plugin editorjs-undo cause une erreur DataCloneError avec les listes
        // car structuredClone() ne peut pas cloner les objets Vue réactifs
        // undoInstance.value = new Undo({ editor: editorInstance.value })
        emit('ready', editorInstance.value as unknown as API)
      }
    },
  })
}

async function save(): Promise<OutputData | undefined> {
  if (!editorInstance.value) return
  return await editorInstance.value.save()
}

async function clear() {
  if (!editorInstance.value) return
  await editorInstance.value.clear()
}

function destroy() {
  if (editorInstance.value) {
    editorInstance.value.destroy()
    editorInstance.value = null
    isReady.value = false
  }
}

watch(
  () => props.readOnly,
  (newVal) => {
    if (editorInstance.value) {
      editorInstance.value.readOnly.toggle(newVal)
    }
  }
)

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  destroy()
})

// Fonctions pour convertir ou insérer des blocs
// Ces fonctions convertissent le bloc actuel s'il est vide ou de type paragraphe,
// sinon elles insèrent un nouveau bloc après

async function convertOrInsertBlock(type: string, data: Record<string, unknown> = {}) {
  if (!editorInstance.value || !isReady.value) return

  try {
    const currentIndex = editorInstance.value.blocks.getCurrentBlockIndex()

    if (currentIndex >= 0) {
      // Récupérer le bloc actuel
      const currentBlock = editorInstance.value.blocks.getBlockByIndex(currentIndex)

      if (currentBlock) {
        // Sauvegarder les données du bloc actuel
        const savedData = await currentBlock.save()
        const currentText = savedData?.data?.text || ''

        // Si le bloc est un paragraphe, le convertir
        if (currentBlock.name === 'paragraph') {
          // Supprimer le bloc actuel
          editorInstance.value.blocks.delete(currentIndex)

          // Insérer le nouveau bloc avec le texte existant
          const newData = { ...data }
          if ('text' in newData || type === 'header' || type === 'paragraph') {
            newData.text = currentText
          }
          else if ('content' in newData || type === 'list') {
            // Pour les listes, mettre le texte dans le premier item
            if (currentText && Array.isArray(newData.items)) {
              newData.items = [{ content: currentText, items: [] }]
            }
          }

          editorInstance.value.blocks.insert(type, newData, undefined, currentIndex, true, false)

          // Focus sur le bloc converti
          setTimeout(() => {
            if (editorInstance.value) {
              editorInstance.value.caret.setToBlock(currentIndex, 'end')
            }
          }, 10)
          return
        }
      }
    }

    // Sinon, insérer un nouveau bloc après
    const insertIndex = currentIndex >= 0 ? currentIndex + 1 : 0
    editorInstance.value.blocks.insert(type, data, undefined, insertIndex, true, false)

    setTimeout(() => {
      if (editorInstance.value) {
        editorInstance.value.caret.setToBlock(insertIndex, 'start')
      }
    }, 10)
  }
  catch (err) {
    console.error('Error converting/inserting block:', err)
  }
}

async function insertHeading(level: number) {
  if (!editorInstance.value || !isReady.value) return

  try {
    const currentIndex = editorInstance.value.blocks.getCurrentBlockIndex()

    if (currentIndex >= 0) {
      const currentBlock = editorInstance.value.blocks.getBlockByIndex(currentIndex)

      if (currentBlock) {
        const savedData = await currentBlock.save()
        const currentText = savedData?.data?.text || ''

        // Si c'est un paragraphe ou un autre header, le convertir
        if (currentBlock.name === 'paragraph' || currentBlock.name === 'header') {
          editorInstance.value.blocks.delete(currentIndex)
          editorInstance.value.blocks.insert('header', { text: currentText, level }, undefined, currentIndex, true, false)

          setTimeout(() => {
            if (editorInstance.value) {
              editorInstance.value.caret.setToBlock(currentIndex, 'end')
            }
          }, 10)
          return
        }
      }
    }

    // Sinon, insérer un nouveau header après
    const insertIndex = currentIndex >= 0 ? currentIndex + 1 : 0
    editorInstance.value.blocks.insert('header', { text: '', level }, undefined, insertIndex, true, false)

    setTimeout(() => {
      if (editorInstance.value) {
        editorInstance.value.caret.setToBlock(insertIndex, 'start')
      }
    }, 10)
  }
  catch (err) {
    console.error('Error inserting heading:', err)
  }
}

// Fonction legacy pour insérer sans conversion (utilisée par certains types de blocs)
async function insertBlock(type: string, data: Record<string, unknown> = {}) {
  if (!editorInstance.value || !isReady.value) return

  try {
    const currentIndex = editorInstance.value.blocks.getCurrentBlockIndex()
    const insertIndex = currentIndex >= 0 ? currentIndex + 1 : 0

    editorInstance.value.blocks.insert(type, data, undefined, insertIndex, true, false)

    setTimeout(() => {
      if (editorInstance.value) {
        editorInstance.value.caret.setToBlock(insertIndex, 'start')
      }
    }, 10)
  }
  catch (err) {
    console.error('Error inserting block:', err)
  }
}

function insertParagraph() {
  convertOrInsertBlock('paragraph', { text: '' })
}

function insertList(style: 'unordered' | 'ordered' = 'unordered') {
  // Format v2.x de @editorjs/list : items est un tableau d'objets { content, items }
  convertOrInsertBlock('list', { style, items: [{ content: '', items: [] }] })
}

function insertChecklist() {
  insertBlock('checklist', { items: [{ text: '', checked: false }] })
}

function insertQuote() {
  insertBlock('quote', { text: '', caption: '' })
}

function insertTable() {
  // Format MergeTable : content est un tableau 2D d'objets MergeTableCell
  insertBlock('table', {
    withHeadings: true,
    content: [
      [{ content: '', colspan: 1, rowspan: 1 }, { content: '', colspan: 1, rowspan: 1 }, { content: '', colspan: 1, rowspan: 1 }],
      [{ content: '', colspan: 1, rowspan: 1 }, { content: '', colspan: 1, rowspan: 1 }, { content: '', colspan: 1, rowspan: 1 }],
    ],
  })
}

function insertImage() {
  insertBlock('image', {})
}

function insertDelimiter() {
  insertBlock('delimiter', {})
}

defineExpose({
  save,
  clear,
  destroy,
  isReady,
  editor: editorInstance,
  insertBlock,
  insertHeading,
})
</script>

<template>
  <div class="editor-js-wrapper">
    <!-- Toolbar fixe -->
    <div v-if="!readOnly" class="editor-toolbar">
      <span class="toolbar-label">Insérer :</span>
      <div class="toolbar-buttons">
        <button type="button" class="toolbar-btn" title="Titre 1" @click="insertHeading(1)">
          <span class="font-bold">H1</span>
        </button>
        <button type="button" class="toolbar-btn" title="Titre 2" @click="insertHeading(2)">
          <span class="font-bold">H2</span>
        </button>
        <button type="button" class="toolbar-btn" title="Titre 3" @click="insertHeading(3)">
          <span class="font-bold">H3</span>
        </button>
        <button type="button" class="toolbar-btn" title="Titre 4" @click="insertHeading(4)">
          <span class="font-bold">H4</span>
        </button>
        <span class="toolbar-separator" />
        <button type="button" class="toolbar-btn" title="Paragraphe" @click="insertParagraph">
          <font-awesome-icon icon="fa-solid fa-paragraph" />
        </button>
        <button type="button" class="toolbar-btn" title="Liste à puces" @click="insertList('unordered')">
          <font-awesome-icon icon="fa-solid fa-list-ul" />
        </button>
        <button type="button" class="toolbar-btn" title="Liste numérotée" @click="insertList('ordered')">
          <font-awesome-icon icon="fa-solid fa-list-ol" />
        </button>
        <button type="button" class="toolbar-btn" title="Liste de tâches" @click="insertChecklist">
          <font-awesome-icon icon="fa-solid fa-list-check" />
        </button>
        <span class="toolbar-separator" />
        <button type="button" class="toolbar-btn" title="Tableau" @click="insertTable">
          <font-awesome-icon icon="fa-solid fa-table" />
        </button>
        <button type="button" class="toolbar-btn" title="Image" @click="insertImage">
          <font-awesome-icon icon="fa-solid fa-image" />
        </button>
        <button type="button" class="toolbar-btn" title="Citation" @click="insertQuote">
          <font-awesome-icon icon="fa-solid fa-quote-left" />
        </button>
        <button type="button" class="toolbar-btn" title="Séparateur" @click="insertDelimiter">
          <font-awesome-icon icon="fa-solid fa-minus" />
        </button>
      </div>
    </div>
    <!-- Éditeur -->
    <div
      ref="editorContainer"
      class="editor-js-container prose prose-lg dark:prose-invert max-w-none"
      :class="{ 'opacity-50': !isReady }"
    />
  </div>
</template>

<style>
.editor-js-wrapper {
  @apply w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800;
}

.editor-js-container {
  @apply p-4;
}

/* Toolbar styles */
.editor-toolbar {
  @apply flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-wrap;
}

.toolbar-label {
  @apply text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap;
}

.toolbar-buttons {
  @apply flex flex-wrap gap-1;
}

.toolbar-btn {
  @apply inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500;
  min-width: 32px;
}

.toolbar-btn:active {
  @apply bg-gray-200 dark:bg-gray-600;
}

.toolbar-btn svg {
  @apply w-3.5 h-3.5;
}

.toolbar-separator {
  @apply w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1;
}

/* EditorJS styling overrides */
.codex-editor__redactor {
  @apply pb-4 !important;
}

.ce-block__content {
  @apply max-w-none;
}

.ce-toolbar__content {
  @apply max-w-none;
}

/* Toolbar - icônes + et engrenage */
.ce-toolbar {
  z-index: 10;
}

.ce-toolbar__actions {
  position: absolute;
  left: -36px;
  opacity: 1 !important;
}

.ce-toolbar__plus,
.ce-toolbar__settings-btn {
  @apply text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded;
  width: 28px;
  height: 28px;
}

.ce-toolbar__plus {
  @apply bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 font-bold;
}

.ce-toolbar__plus:hover {
  @apply bg-green-200 text-green-700 dark:bg-green-900/50 dark:text-green-300;
}

.ce-toolbar__settings-btn:hover {
  @apply bg-gray-200 dark:bg-gray-600;
}

.codex-editor__redactor {
  padding-left: 50px !important;
}

.ce-paragraph {
  @apply text-gray-900 dark:text-gray-100;
}

.ce-header {
  @apply text-gray-900 dark:text-gray-100 font-bold;
}

/* Styles pour les différents niveaux de titre */
h1.ce-header {
  @apply text-3xl mt-6 mb-4;
}

h2.ce-header {
  @apply text-2xl mt-5 mb-3;
}

h3.ce-header {
  @apply text-xl mt-4 mb-2;
}

h4.ce-header {
  @apply text-lg mt-3 mb-2;
}

.cdx-quote__text {
  @apply border-l-4 border-brand-red-500 pl-4 italic;
}

.cdx-marker {
  @apply bg-brand-blue-200 dark:bg-brand-blue-600;
}

.ce-inline-toolbar {
  @apply bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700;
}

.ce-inline-toolbar__dropdown {
  @apply bg-white dark:bg-gray-800;
}

.ce-conversion-toolbar {
  @apply bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700;
}

.ce-settings {
  @apply bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700;
}

.ce-settings__button {
  @apply text-gray-700 dark:text-gray-300;
}

.ce-settings__button:hover {
  @apply bg-gray-100 dark:bg-gray-700;
}

.cdx-search-field {
  @apply bg-gray-100 dark:bg-gray-700;
}

.ce-popover {
  @apply bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700;
}

.ce-popover-item:hover {
  @apply bg-gray-100 dark:bg-gray-700;
}

.ce-popover-item__title {
  @apply text-gray-900 dark:text-gray-100;
}

/* ===== MergeTable Plugin Styles ===== */

/* Wrapper du tableau */
.mt-wrap {
  position: relative;
  width: 100%;
  margin: 1rem 0;
  overflow: visible;
  padding-top: 50px; /* Espace pour la toolbar flottante */
}

/* Tableau principal */
.mt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Cellules */
.mt-cell {
  min-width: 80px;
  min-height: 40px;
  vertical-align: top;
  outline: none;
  word-break: break-word;
}

.mt-cell:focus {
  box-shadow: inset 0 0 0 2px #3b82f6;
}

/* Sélection de cellules */
.mt-cell--selected {
  background-color: rgba(59, 130, 246, 0.15) !important;
}

.dark .mt-cell--selected {
  background-color: rgba(59, 130, 246, 0.25) !important;
}

.mt-cell--selection-start {
  box-shadow: inset 0 0 0 2px #3b82f6 !important;
}

/* Barre d'outils flottante */
.mt-toolbar {
  position: absolute;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 100;
  white-space: nowrap;
}

.dark .mt-toolbar {
  background-color: #1f2937;
  border-color: #374151;
}

.mt-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dark .mt-toolbar-btn {
  color: #d1d5db;
  background-color: #374151;
  border-color: #4b5563;
}

.mt-toolbar-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.dark .mt-toolbar-btn:hover:not(:disabled) {
  background-color: #4b5563;
  border-color: #6b7280;
}

.mt-toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mt-toolbar-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Boutons d'ajout ligne/colonne */
.mt-add-row,
.mt-add-col {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  background-color: transparent;
  border: 1px dashed #d1d5db;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dark .mt-add-row,
.dark .mt-add-col {
  color: #9ca3af;
  border-color: #4b5563;
}

.mt-add-row:hover,
.mt-add-col:hover {
  color: #3b82f6;
  border-color: #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

.dark .mt-add-row:hover,
.dark .mt-add-col:hover {
  color: #60a5fa;
  border-color: #60a5fa;
  background-color: rgba(59, 130, 246, 0.1);
}

/* Animation de sélection */
@keyframes mt-selection-pulse {
  0%, 100% {
    box-shadow: inset 0 0 0 2px #3b82f6;
  }
  50% {
    box-shadow: inset 0 0 0 3px #3b82f6;
  }
}

.mt-cell--selection-start {
  animation: mt-selection-pulse 1.5s ease-in-out infinite;
}

/* ===== Redimensionnement des colonnes ===== */

/* Conteneur des poignées de redimensionnement */
.mt-resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

/* Poignée de redimensionnement */
.mt-resize-handle {
  position: absolute;
  width: 7px;
  cursor: col-resize;
  pointer-events: auto;
  background-color: transparent;
  transition: background-color 0.15s ease;
}

.mt-resize-handle:hover {
  background-color: rgba(59, 130, 246, 0.3);
}

.mt-resize-handle::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background-color: transparent;
  transition: background-color 0.15s ease;
}

.mt-resize-handle:hover::after {
  background-color: #3b82f6;
}

/* Poignée active pendant le redimensionnement */
.mt-resize-handle--active {
  background-color: rgba(59, 130, 246, 0.4) !important;
}

.mt-resize-handle--active::after {
  background-color: #3b82f6 !important;
}

/* Style global pendant le redimensionnement */
body.mt-resizing {
  cursor: col-resize !important;
  user-select: none !important;
}

body.mt-resizing * {
  cursor: col-resize !important;
}

/* Dark mode pour les poignées */
.dark .mt-resize-handle:hover {
  background-color: rgba(96, 165, 250, 0.3);
}

.dark .mt-resize-handle:hover::after {
  background-color: #60a5fa;
}

.dark .mt-resize-handle--active {
  background-color: rgba(96, 165, 250, 0.4) !important;
}

.dark .mt-resize-handle--active::after {
  background-color: #60a5fa !important;
}
</style>
