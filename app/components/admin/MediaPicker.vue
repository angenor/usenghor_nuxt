<script setup lang="ts">
/**
 * Sélecteur de médiathèque (modale) : choisir un média existant ou en téléverser un.
 * Usage : <AdminMediaPicker :open="open" type="image" @select="onSelect" @close="open = false" />
 */
import type { MediaRead, MediaType } from '~/types/api'

const props = withDefaults(defineProps<{
  open: boolean
  type?: MediaType
  title?: string
}>(), {
  type: undefined,
  title: 'Choisir dans la médiathèque',
})

const emit = defineEmits<{
  select: [media: MediaRead]
  close: []
}>()

const { listMedia, uploadMedia, getMediaById, getMediaUrl, formatFileSize } = useMediaApi()

const PAGE_SIZE = 24

const typeOptions: { value: MediaType | '', label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
  { value: 'video', label: 'Vidéos' },
  { value: 'audio', label: 'Audio' },
]

const typeIcons: Record<MediaType, string> = {
  image: 'image',
  document: 'file-lines',
  video: 'film',
  audio: 'music',
}

const items = ref<MediaRead[]>([])
const total = ref(0)
const pages = ref(1)
const page = ref(1)
const search = ref('')
const debouncedSearch = ref('')
const typeFilter = ref<MediaType | ''>(props.type ?? '')
const loading = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

let searchTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

const acceptAttr = computed(() => {
  switch (typeFilter.value) {
    case 'image': return 'image/*'
    case 'video': return 'video/*'
    case 'audio': return 'audio/*'
    case 'document': return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.txt,.csv,.zip'
    default: return undefined
  }
})

async function load() {
  if (!props.open) return
  const current = ++requestId
  loading.value = true
  error.value = null
  try {
    const response = await listMedia({
      type: typeFilter.value || null,
      search: debouncedSearch.value.trim() || null,
      page: page.value,
      limit: PAGE_SIZE,
    })
    if (current !== requestId) return
    items.value = response.items
    total.value = response.total
    pages.value = Math.max(1, response.pages)
  }
  catch (err) {
    if (current !== requestId) return
    console.error('Erreur chargement médiathèque:', err)
    error.value = 'Impossible de charger la médiathèque.'
    items.value = []
  }
  finally {
    if (current === requestId) loading.value = false
  }
}

function reset() {
  search.value = ''
  debouncedSearch.value = ''
  typeFilter.value = props.type ?? ''
  page.value = 1
  error.value = null
}

watch(search, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (value === debouncedSearch.value) return
  searchTimer = setTimeout(() => {
    debouncedSearch.value = value
    page.value = 1
    load()
  }, 300)
})

watch(typeFilter, () => {
  page.value = 1
  load()
})

watch(page, () => load())

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    reset()
    load()
  }
}, { immediate: true })

watch(() => props.type, (value) => {
  typeFilter.value = value ?? ''
})

function onKeydown(event: KeyboardEvent) {
  if (props.open && event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (searchTimer) clearTimeout(searchTimer)
})

function thumbnail(media: MediaRead): string | null {
  if (media.type !== 'image') return null
  if (media.is_external_url) return getMediaUrl(media)
  return getMediaUrl(media.id, 'low')
}

function choose(media: MediaRead) {
  emit('select', media)
}

function openFileDialog() {
  fileInput.value?.click()
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  uploading.value = true
  error.value = null
  try {
    const uploaded = await uploadMedia(file, { folder: 'entrepreneurship' })
    const media = await getMediaById(uploaded.id)
    emit('select', media)
  }
  catch (err) {
    console.error('Erreur téléversement:', err)
    const detail = (err as { data?: { detail?: string } })?.data?.detail
    error.value = typeof detail === 'string' ? detail : 'Le téléversement a échoué.'
  }
  finally {
    uploading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <!-- En-tête -->
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'photo-film']" class="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-400" />
            {{ title }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
          </button>
        </div>

        <!-- Barre d'outils -->
        <div class="flex flex-col gap-3 border-b border-gray-200 px-5 py-3 sm:flex-row sm:items-center dark:border-gray-700">
          <div class="relative flex-1">
            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="search"
              type="search"
              placeholder="Rechercher un média…"
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </div>
          <select
            v-model="typeFilter"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="uploading"
            @click="openFileDialog"
          >
            <font-awesome-icon :icon="['fas', uploading ? 'spinner' : 'upload']" :class="['h-4 w-4', uploading && 'animate-spin']" />
            {{ uploading ? 'Téléversement…' : 'Téléverser un fichier' }}
          </button>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            :accept="acceptAttr"
            @change="onFileChange"
          >
        </div>

        <!-- Erreur -->
        <div
          v-if="error"
          class="mx-5 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
        >
          {{ error }}
        </div>

        <!-- Grille -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div v-if="loading" class="flex justify-center py-16">
            <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
          </div>

          <div v-else-if="items.length === 0" class="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
            <font-awesome-icon :icon="['fas', 'folder-open']" class="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p>Aucun média trouvé.</p>
          </div>

          <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <button
              v-for="media in items"
              :key="media.id"
              type="button"
              class="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-left transition hover:border-brand-blue-500 hover:ring-2 hover:ring-brand-blue-500/40 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-700 dark:bg-gray-900"
              :title="media.name"
              @click="choose(media)"
            >
              <div class="flex aspect-square w-full items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  v-if="thumbnail(media)"
                  :src="thumbnail(media) ?? undefined"
                  :alt="media.alt_text || media.name"
                  loading="lazy"
                  class="h-full w-full object-cover"
                >
                <font-awesome-icon
                  v-else
                  :icon="['fas', typeIcons[media.type]]"
                  class="h-8 w-8 text-gray-400 group-hover:text-brand-blue-500"
                />
              </div>
              <div class="px-2 py-1.5">
                <p class="truncate text-xs font-medium text-gray-800 dark:text-gray-200">
                  {{ media.name }}
                </p>
                <p v-if="media.size_bytes" class="text-[11px] text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(media.size_bytes) }}
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <span>{{ total }} média{{ total > 1 ? 's' : '' }}</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
              :disabled="page <= 1 || loading"
              aria-label="Page précédente"
              @click="page--"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" class="h-3 w-3" />
            </button>
            <span>Page {{ page }} / {{ pages }}</span>
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
              :disabled="page >= pages || loading"
              aria-label="Page suivante"
              @click="page++"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
