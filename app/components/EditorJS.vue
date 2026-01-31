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
    data: props.modelValue,
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

defineExpose({
  save,
  clear,
  destroy,
  isReady,
  editor: editorInstance,
})
</script>

<template>
  <div class="editor-js-wrapper">
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
  @apply text-gray-900 dark:text-gray-100;
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
