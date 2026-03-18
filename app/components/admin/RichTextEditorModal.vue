<script setup lang="ts">
interface Props {
  initialMarkdown?: string
  label?: string
  direction?: 'ltr' | 'rtl'
  placeholder?: string
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialMarkdown: '',
  label: '',
  direction: 'ltr',
  placeholder: 'Commencez à écrire...',
  language: 'fr-FR',
})

const emit = defineEmits<{
  (e: 'confirm', payload: { markdown: string, html: string }): void
  (e: 'cancel'): void
}>()

// Upload d'images via l'API média
const { uploadMedia, getMediaUrl } = useMediaApi()

async function handleImageUpload(payload: { blob: Blob, callback: (url: string, alt?: string) => void }) {
  try {
    const file = payload.blob instanceof File
      ? payload.blob
      : new File([payload.blob], `image-${Date.now()}.png`, { type: payload.blob.type })

    const result = await uploadMedia(file, { folder: 'editor' })
    const url = getMediaUrl(result)
    if (url) {
      payload.callback(url, file.name)
    }
  }
  catch (error) {
    console.error('Erreur upload image éditeur:', error)
    alert('Impossible d\'uploader l\'image')
  }
}

const editorRef = ref<{ getMarkdown: () => string, getHTML: () => string } | null>(null)
const initialSnapshot = ref('')
const currentMarkdown = ref('')
const currentHtml = ref('')

// Scroll lock
onMounted(() => {
  initialSnapshot.value = props.initialMarkdown || ''
  currentMarkdown.value = props.initialMarkdown || ''
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

function onEditorUpdate(md: string) {
  currentMarkdown.value = md
}

function onHtmlUpdate(html: string) {
  currentHtml.value = html
}

function hasChanges(): boolean {
  return currentMarkdown.value !== initialSnapshot.value
}

function handleConfirm() {
  emit('confirm', {
    markdown: currentMarkdown.value,
    html: currentHtml.value,
  })
}

function handleCancel() {
  if (hasChanges()) {
    const confirmed = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment annuler ?')
    if (!confirmed) return
  }
  emit('cancel')
}

// Escape key handler
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleCancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex flex-col bg-gray-900/80" @click.self>
      <!-- Header -->
      <div class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ label || 'Éditeur de contenu' }}
        </h2>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="handleCancel"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="h-4 w-4" />
            Annuler
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-red-700"
            @click="handleConfirm"
          >
            <font-awesome-icon :icon="['fas', 'check']" class="h-4 w-4" />
            Valider
          </button>
        </div>
      </div>

      <!-- Editor body -->
      <div class="flex-1 bg-white dark:bg-gray-900">
        <ToastUIEditor
          ref="editorRef"
          :model-value="initialMarkdown"
          :placeholder="placeholder"
          :language="language"
          :direction="direction"
          height="calc(100vh - 64px)"
          mode="inline"
          @update:model-value="onEditorUpdate"
          @update:html="onHtmlUpdate"
          @image-upload="handleImageUpload"
        />
      </div>
    </div>
  </Teleport>
</template>
