<script setup lang="ts">
/**
 * Formulaire de création / édition d'une ressource de la boîte à outils PEI.
 * Source selon le type : document de la médiathèque ou URL (lien / vidéo).
 */
import type { MediaRead } from '~/types/api'
import type {
  PeiResourceAdmin,
  PeiResourceCreatePayload,
  PeiResourceType,
} from '~/types/api/entrepreneurship'
import { resourceTypeOptions } from '~/composables/useEntrepreneurshipApi'

type Lang = 'fr' | 'en' | 'ar'

const props = withDefaults(defineProps<{
  resource?: PeiResourceAdmin | null
  saving?: boolean
}>(), {
  resource: null,
  saving: false,
})

const emit = defineEmits<{
  submit: [payload: PeiResourceCreatePayload]
  cancel: []
}>()

const { t } = useI18n()
const { listResourceCategories, translateResource } = useEntrepreneurshipApi()
const { getMediaById, getMediaUrl, formatFileSize } = useMediaApi()

const MSG_DOCUMENT_REQUIRED = 'Un document de la médiathèque est requis pour le type document'
const MSG_URL_REQUIRED = 'Une URL est requise pour le type lien ou vidéo'

const isEditMode = computed(() => !!props.resource)

const form = reactive({
  type: (props.resource?.type ?? 'document') as PeiResourceType,
  title: props.resource?.title ?? '',
  title_en: props.resource?.title_en ?? '',
  title_ar: props.resource?.title_ar ?? '',
  description: props.resource?.description ?? '',
  description_en: props.resource?.description_en ?? '',
  description_ar: props.resource?.description_ar ?? '',
  category: props.resource?.category ?? '',
  category_en: props.resource?.category_en ?? '',
  category_ar: props.resource?.category_ar ?? '',
  media_external_id: props.resource?.media_external_id ?? null as string | null,
  url: props.resource?.url ?? '',
  is_published: props.resource?.is_published ?? false,
})

// Synchronise la case « Publiée » si le statut change hors formulaire (bouton Publier).
watch(
  () => props.resource?.is_published,
  (value) => {
    if (value !== undefined) form.is_published = value
  },
)

const lang = ref<Lang>('fr')
const errorMessage = ref<string | null>(null)

// ── Catégories existantes (datalist) ───────────────────────────────
const categories = ref<string[]>([])

onMounted(async () => {
  try {
    categories.value = await listResourceCategories()
  }
  catch {
    categories.value = []
  }
})

// ── Document de la médiathèque ─────────────────────────────────────
const pickerOpen = ref(false)
const selectedMedia = ref<MediaRead | null>(null)

const documentUrl = computed(() => {
  if (!form.media_external_id) return null
  if (selectedMedia.value?.id === form.media_external_id) return getMediaUrl(selectedMedia.value)
  if (props.resource?.media_external_id === form.media_external_id && props.resource.media_url) {
    return props.resource.media_url
  }
  return getMediaUrl(form.media_external_id)
})

async function loadSelectedMedia() {
  if (!form.media_external_id) return
  try {
    selectedMedia.value = await getMediaById(form.media_external_id)
  }
  catch {
    selectedMedia.value = null
  }
}

onMounted(loadSelectedMedia)

function onMediaSelect(media: MediaRead) {
  selectedMedia.value = media
  form.media_external_id = media.id
  pickerOpen.value = false
}

function removeMedia() {
  selectedMedia.value = null
  form.media_external_id = null
}

const isUrlType = computed(() => form.type === 'link' || form.type === 'video')

// ── Traduction automatique FR → EN/AR ──────────────────────────────
const translating = ref(false)
const translateMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function handleTranslate() {
  translateMessage.value = null
  if (!form.title.trim() && !form.description.trim() && !form.category.trim()) {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateNeedsFr') }
    return
  }
  translating.value = true
  try {
    const res = await translateResource({
      title: form.title.trim() || null,
      description: form.description.trim() || null,
      category: form.category.trim() || null,
    })
    // N'écrase que les champs EN/AR encore vides.
    const keys = ['title_en', 'title_ar', 'description_en', 'description_ar', 'category_en', 'category_ar'] as const
    for (const key of keys) {
      const value = res[key]
      if (value && !form[key].trim()) form[key] = value
    }
    translateMessage.value = { type: 'success', text: t('adminTranslate.translateSuccess') }
  }
  catch {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateError') }
  }
  finally {
    translating.value = false
  }
}

// ── Validation et soumission ───────────────────────────────────────
function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  }
  catch {
    return false
  }
}

function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function handleSubmit() {
  errorMessage.value = null
  const title = form.title.trim()
  if (!title) {
    lang.value = 'fr'
    errorMessage.value = 'Le titre en français est requis.'
    return
  }
  if (title.length > 200) {
    errorMessage.value = 'Le titre en français ne doit pas dépasser 200 caractères.'
    return
  }
  if (form.type === 'document' && !form.media_external_id) {
    errorMessage.value = MSG_DOCUMENT_REQUIRED
    return
  }
  const url = form.url.trim()
  if (isUrlType.value) {
    if (!url) {
      errorMessage.value = MSG_URL_REQUIRED
      return
    }
    if (url.length > 500) {
      errorMessage.value = 'L\'URL ne doit pas dépasser 500 caractères.'
      return
    }
    if (!isValidUrl(url)) {
      errorMessage.value = 'L\'URL saisie n\'est pas valide (elle doit commencer par http:// ou https://).'
      return
    }
  }

  const payload: PeiResourceCreatePayload = {
    title,
    title_en: orNull(form.title_en),
    title_ar: orNull(form.title_ar),
    description: orNull(form.description),
    description_en: orNull(form.description_en),
    description_ar: orNull(form.description_ar),
    type: form.type,
    media_external_id: form.type === 'document' ? form.media_external_id : null,
    url: isUrlType.value ? url : null,
    category: orNull(form.category),
    category_en: orNull(form.category_en),
    category_ar: orNull(form.category_ar),
    is_published: form.is_published,
  }
  emit('submit', payload)
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
</script>

<template>
  <form class="space-y-6" novalidate @submit.prevent="handleSubmit">
    <div
      v-if="errorMessage"
      class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Type et source -->
    <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Type et source
      </h2>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium text-gray-700 dark:text-gray-300">Type *</span>
          <select v-model="form.type" :class="inputClass">
            <option v-for="option in resourceTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <div class="md:col-span-2">
          <!-- Document -->
          <div v-if="form.type === 'document'" class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Document de la médiathèque *</span>
            <div
              v-if="form.media_external_id"
              class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/50"
            >
              <font-awesome-icon icon="fa-solid fa-file" class="text-2xl text-gray-400" />
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-gray-900 dark:text-white">
                  {{ selectedMedia?.name ?? 'Document sélectionné' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="selectedMedia?.mime_type">{{ selectedMedia.mime_type }}</span>
                  <span v-if="selectedMedia?.size_bytes"> · {{ formatFileSize(selectedMedia.size_bytes) }}</span>
                </p>
              </div>
              <a
                v-if="documentUrl"
                :href="documentUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-brand-blue-600 hover:underline dark:text-brand-blue-400"
              >
                Ouvrir
              </a>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              Aucun document sélectionné.
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                @click="pickerOpen = true"
              >
                <font-awesome-icon icon="fa-solid fa-photo-film" />
                Choisir dans la médiathèque
              </button>
              <button
                v-if="form.media_external_id"
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                @click="removeMedia"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" />
                Retirer
              </button>
            </div>
          </div>

          <!-- Lien / vidéo -->
          <label v-else class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">
              {{ form.type === 'video' ? 'URL de la vidéo' : 'URL du lien' }} *
            </span>
            <input
              v-model="form.url"
              type="url"
              maxlength="500"
              placeholder="https://"
              :class="inputClass"
            >
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Adresse complète commençant par http:// ou https://
            </span>
          </label>
        </div>
      </div>

      <label class="mt-4 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          v-model="form.is_published"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500 dark:border-gray-600"
        >
        Publiée (visible sur le site public)
      </label>
    </section>

    <!-- Contenu trilingue -->
    <section class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">
          Contenu
        </h2>
        <div class="flex flex-col items-end gap-1">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-brand-blue-300 px-3 py-1.5 text-sm text-brand-blue-700 hover:bg-brand-blue-50 disabled:opacity-50 dark:border-brand-blue-700 dark:text-brand-blue-300 dark:hover:bg-brand-blue-900/20"
            :disabled="translating"
            :title="t('adminTranslate.translateHint')"
            @click="handleTranslate"
          >
            <font-awesome-icon :icon="translating ? 'fa-solid fa-spinner' : 'fa-solid fa-language'" :class="{ 'animate-spin': translating }" />
            {{ translating ? t('adminTranslate.translating') : t('adminTranslate.translate') }}
          </button>
          <p
            v-if="translateMessage"
            :class="[
              'text-xs',
              translateMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            ]"
          >
            {{ translateMessage.text }}
          </p>
        </div>
      </div>

      <datalist id="pei-categories">
        <option v-for="category in categories" :key="category" :value="category" />
      </datalist>

      <EntrepreneurshipAdminLangTabs v-model="lang">
        <div v-if="lang === 'fr'" class="space-y-4">
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Titre (FR) *</span>
            <input v-model="form.title" type="text" maxlength="200" required :class="inputClass">
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Description (FR)</span>
            <textarea v-model="form.description" rows="3" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Catégorie (FR)</span>
            <input v-model="form.category" type="text" list="pei-categories" maxlength="120" :class="inputClass">
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Choisissez une catégorie existante ou saisissez-en une nouvelle.
            </span>
          </label>
        </div>

        <div v-else-if="lang === 'en'" class="space-y-4">
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Titre (EN)</span>
            <input v-model="form.title_en" type="text" maxlength="200" :class="inputClass">
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Description (EN)</span>
            <textarea v-model="form.description_en" rows="3" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Catégorie (EN)</span>
            <input v-model="form.category_en" type="text" maxlength="120" :class="inputClass">
          </label>
        </div>

        <div v-else class="space-y-4">
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Titre (AR)</span>
            <input v-model="form.title_ar" type="text" maxlength="200" dir="rtl" :class="inputClass">
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Description (AR)</span>
            <textarea v-model="form.description_ar" rows="3" dir="rtl" :class="inputClass" />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-gray-700 dark:text-gray-300">Catégorie (AR)</span>
            <input v-model="form.category_ar" type="text" maxlength="120" dir="rtl" :class="inputClass">
          </label>
        </div>
      </EntrepreneurshipAdminLangTabs>
    </section>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        @click="emit('cancel')"
      >
        Annuler
      </button>
      <button
        type="submit"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
        :disabled="saving"
      >
        <font-awesome-icon v-if="saving" icon="fa-solid fa-spinner" class="animate-spin" />
        {{ isEditMode ? 'Enregistrer les modifications' : 'Créer la ressource' }}
      </button>
    </div>

    <AdminMediaPicker
      :open="pickerOpen"
      type="document"
      title="Choisir un document"
      @select="onMediaSelect"
      @close="pickerOpen = false"
    />
  </form>
</template>
