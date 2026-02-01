<script setup lang="ts">
import type { OutputData, API } from '@editorjs/editorjs'

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
const isReady = ref(false)

/**
 * Migre les données de l'ancien format @editorjs/list v1.x vers le nouveau format v2.x
 * Ancien: items: ["Item 1", "Item 2"]
 * Nouveau: items: [{ content: "Item 1", items: [] }, { content: "Item 2", items: [] }]
 */
function migrateListData(data: OutputData | undefined): OutputData | undefined {
  if (!data?.blocks) return data

  return {
    ...data,
    blocks: data.blocks.map((block) => {
      if (block.type === 'list' && Array.isArray(block.data?.items)) {
        // Vérifier si c'est l'ancien format (items est un tableau de strings)
        const firstItem = block.data.items[0]
        if (typeof firstItem === 'string') {
          // Migration vers le nouveau format
          return {
            ...block,
            data: {
              ...block.data,
              items: block.data.items.map((item: string) => ({
                content: item,
                items: [],
              })),
            },
          }
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
    { default: Table },
    { default: Delimiter },
    { default: InlineCode },
    { default: Marker },
    { default: LinkTool },
    { default: Checklist },
  ] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@editorjs/header'),
    import('@editorjs/list'),
    import('@editorjs/paragraph'),
    import('@editorjs/image'),
    import('@editorjs/quote'),
    import('@editorjs/embed'),
    import('@editorjs/table'),
    import('@editorjs/delimiter'),
    import('@editorjs/inline-code'),
    import('@editorjs/marker'),
    import('@editorjs/link'),
    import('@editorjs/checklist'),
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
        class: Table,
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
      emit('update:modelValue', data)
      emit('change', api)
    },
    onReady: () => {
      isReady.value = true
      if (editorInstance.value) {
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

// Fonctions pour insérer des blocs
async function insertBlock(type: string, data: Record<string, unknown> = {}) {
  if (!editorInstance.value || !isReady.value) return

  try {
    const currentIndex = editorInstance.value.blocks.getCurrentBlockIndex()
    const insertIndex = currentIndex >= 0 ? currentIndex + 1 : 0

    editorInstance.value.blocks.insert(type, data, undefined, insertIndex, true, false)

    // Focus sur le nouveau bloc après un court délai
    setTimeout(() => {
      if (editorInstance.value) {
        editorInstance.value.caret.setToBlock(insertIndex, 'start')
      }
    }, 10)
  } catch (err) {
    console.error('Error inserting block:', err)
  }
}

async function insertHeading(level: number) {
  if (!editorInstance.value || !isReady.value) return

  try {
    const currentIndex = editorInstance.value.blocks.getCurrentBlockIndex()
    const insertIndex = currentIndex >= 0 ? currentIndex + 1 : 0

    // Insérer le header avec les bonnes données
    editorInstance.value.blocks.insert('header', { text: '', level }, undefined, insertIndex, true, false)

    // Focus et placement du curseur
    setTimeout(() => {
      if (editorInstance.value) {
        editorInstance.value.caret.setToBlock(insertIndex, 'start')
      }
    }, 10)
  } catch (err) {
    console.error('Error inserting heading:', err)
  }
}

function insertParagraph() {
  insertBlock('paragraph', { text: '' })
}

function insertList(style: 'unordered' | 'ordered' = 'unordered') {
  insertBlock('list', { style, items: [''] })
}

function insertChecklist() {
  insertBlock('checklist', { items: [{ text: '', checked: false }] })
}

function insertQuote() {
  insertBlock('quote', { text: '', caption: '' })
}

function insertTable() {
  insertBlock('table', { withHeadings: true, content: [['', ''], ['', '']] })
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
</style>
