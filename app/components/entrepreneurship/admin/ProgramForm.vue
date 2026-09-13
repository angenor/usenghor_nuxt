<script setup lang="ts">
/**
 * Formulaire admin d'un dispositif du parcours PEI (création et édition).
 */
import type { MediaRead } from '~/types/api'
import type {
  PeiColor,
  PeiProgramAdmin,
  PeiProgramCreatePayload,
  PeiProgramPhase,
} from '~/types/api/entrepreneurship'
import { colorOptions, programPhaseOptions } from '~/composables/useEntrepreneurshipApi'

type Lang = 'fr' | 'en' | 'ar'

const props = withDefaults(defineProps<{
  program?: PeiProgramAdmin | null
  saving?: boolean
}>(), {
  program: null,
  saving: false,
})

const emit = defineEmits<{
  submit: [payload: PeiProgramCreatePayload]
  cancel: []
}>()

const { t } = useI18n()
const { translateProgram } = useEntrepreneurshipApi()
const { getMediaUrl } = useMediaApi()

const CODE_PATTERN = /^[a-z0-9][a-z0-9-]*$/

const isEditMode = computed(() => !!props.program)

function buildForm(program: PeiProgramAdmin | null) {
  return {
    code: program?.code ?? '',
    sigle: program?.sigle ?? '',
    phase: (program?.phase ?? '') as PeiProgramPhase | '',
    color: (program?.color ?? 'blue') as PeiColor,
    active: program?.active ?? true,
    title: program?.title ?? '',
    title_en: program?.title_en ?? '',
    title_ar: program?.title_ar ?? '',
    tagline: program?.tagline ?? '',
    tagline_en: program?.tagline_en ?? '',
    tagline_ar: program?.tagline_ar ?? '',
    highlight: program?.highlight ?? '',
    highlight_en: program?.highlight_en ?? '',
    highlight_ar: program?.highlight_ar ?? '',
    content_md: program?.content_md ?? '',
    content_html: program?.content_html ?? '',
    content_en_md: program?.content_en_md ?? '',
    content_en_html: program?.content_en_html ?? '',
    content_ar_md: program?.content_ar_md ?? '',
    content_ar_html: program?.content_ar_html ?? '',
    cover_image_external_id: program?.cover_image_external_id ?? null as string | null,
  }
}

const form = reactive(buildForm(props.program))
const lang = ref<Lang>('fr')
const codeManuallyEdited = ref(isEditMode.value)
const errorMessage = ref<string | null>(null)
const pickerOpen = ref(false)

// Resynchroniser le formulaire quand le dispositif est rechargé (après enregistrement)
watch(
  () => [props.program?.id, props.program?.updated_at],
  () => {
    if (!props.program) return
    Object.assign(form, buildForm(props.program))
    codeManuallyEdited.value = true
  },
)

// ── Code (slug) ────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

watch(
  () => form.title,
  (value) => {
    if (!codeManuallyEdited.value) {
      form.code = slugify(value)
    }
  },
)

function onCodeInput() {
  codeManuallyEdited.value = true
}

function regenerateCode() {
  form.code = slugify(form.sigle && !form.title ? form.sigle : form.title)
  codeManuallyEdited.value = false
}

const codeChanged = computed(
  () => isEditMode.value && form.code !== (props.program?.code ?? ''),
)

// ── Visuel ─────────────────────────────────────────────────────────
const coverUrl = computed(() => getMediaUrl(form.cover_image_external_id, 'medium'))

function onMediaSelect(media: MediaRead) {
  form.cover_image_external_id = media.id
  pickerOpen.value = false
}

function removeCover() {
  form.cover_image_external_id = null
}

// ── Traduction automatique FR → EN/AR ──────────────────────────────
const translating = ref(false)
const translateMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

function fillIfEmpty(key: keyof typeof form, value: string | null | undefined) {
  if (!value) return
  const current = form[key]
  if (typeof current === 'string' && current.trim() === '') {
    ;(form as unknown as Record<string, unknown>)[key] = value
  }
}

async function handleTranslate() {
  translateMessage.value = null
  if (!form.title.trim() && !form.tagline.trim() && !form.highlight.trim() && !form.content_md.trim()) {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateNeedsFr') }
    return
  }
  translating.value = true
  try {
    const res = await translateProgram({
      title: form.title || null,
      tagline: form.tagline || null,
      highlight: form.highlight || null,
      content_md: form.content_md || null,
      content_html: form.content_html || null,
    })
    fillIfEmpty('title_en', res.title_en)
    fillIfEmpty('title_ar', res.title_ar)
    fillIfEmpty('tagline_en', res.tagline_en)
    fillIfEmpty('tagline_ar', res.tagline_ar)
    fillIfEmpty('highlight_en', res.highlight_en)
    fillIfEmpty('highlight_ar', res.highlight_ar)
    // Contenu riche : n'écraser que si les deux colonnes (md + html) de la langue sont vides
    if (!form.content_en_md.trim() && !form.content_en_html.trim()) {
      if (res.content_en_md) form.content_en_md = res.content_en_md
      if (res.content_en_html) form.content_en_html = res.content_en_html
    }
    if (!form.content_ar_md.trim() && !form.content_ar_html.trim()) {
      if (res.content_ar_md) form.content_ar_md = res.content_ar_md
      if (res.content_ar_html) form.content_ar_html = res.content_ar_html
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

// ── Soumission ─────────────────────────────────────────────────────
function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function handleSubmit() {
  errorMessage.value = null
  const title = form.title.trim()
  const code = form.code.trim()

  if (title.length < 3) {
    lang.value = 'fr'
    errorMessage.value = 'Le titre en français est obligatoire (3 caractères minimum).'
    return
  }
  if (!code) {
    errorMessage.value = 'Le code est obligatoire.'
    return
  }
  if (!CODE_PATTERN.test(code)) {
    errorMessage.value = 'Le code ne peut contenir que des lettres minuscules non accentuées, des chiffres et des tirets (sans tiret initial).'
    return
  }
  if (!form.phase) {
    errorMessage.value = 'Veuillez choisir une phase du parcours.'
    return
  }

  const payload: PeiProgramCreatePayload = {
    code,
    sigle: orNull(form.sigle),
    title,
    title_en: orNull(form.title_en),
    title_ar: orNull(form.title_ar),
    phase: form.phase,
    tagline: orNull(form.tagline),
    tagline_en: orNull(form.tagline_en),
    tagline_ar: orNull(form.tagline_ar),
    content_md: form.content_md || null,
    content_html: form.content_html || null,
    content_en_md: form.content_en_md || null,
    content_en_html: form.content_en_html || null,
    content_ar_md: form.content_ar_md || null,
    content_ar_html: form.content_ar_html || null,
    highlight: orNull(form.highlight),
    highlight_en: orNull(form.highlight_en),
    highlight_ar: orNull(form.highlight_ar),
    color: form.color,
    cover_image_external_id: form.cover_image_external_id,
    active: form.active,
  }
  emit('submit', payload)
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
const cardClass = 'rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'
</script>

<template>
  <form class="space-y-6" novalidate @submit.prevent="handleSubmit">
    <div
      v-if="errorMessage"
      class="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Identité -->
    <section :class="cardClass">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Identité
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="program-code" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Code <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              id="program-code"
              v-model="form.code"
              type="text"
              maxlength="60"
              :class="[inputClass, 'font-mono']"
              placeholder="ex. senghor-innov"
              @input="onCodeInput"
            >
            <button
              type="button"
              class="whitespace-nowrap rounded-lg bg-gray-100 px-3 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              @click="regenerateCode"
            >
              <font-awesome-icon icon="fa-solid fa-rotate" class="mr-1" />
              Régénérer
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Identifiant stable, utilisé dans l'adresse publique : minuscules, chiffres et tirets.
          </p>
          <p
            v-if="isEditMode"
            class="mt-2 rounded-lg px-3 py-2 text-xs"
            :class="codeChanged
              ? 'bg-amber-100 font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'"
          >
            <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="mr-1" />
            Modifier le code change l'adresse publique du dispositif.
          </p>
        </div>

        <div>
          <label for="program-sigle" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sigle
          </label>
          <input
            id="program-sigle"
            v-model="form.sigle"
            type="text"
            maxlength="30"
            :class="inputClass"
            placeholder="ex. OSER, SEE, MTI"
          >
        </div>

        <div>
          <label for="program-phase" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phase du parcours <span class="text-red-500">*</span>
          </label>
          <select id="program-phase" v-model="form.phase" :class="inputClass">
            <option value="" disabled>
              Choisir une phase…
            </option>
            <option v-for="option in programPhaseOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <fieldset>
          <legend class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Couleur
          </legend>
          <div class="flex flex-wrap items-center gap-3">
            <label
              v-for="option in colorOptions"
              :key="option.value"
              class="relative cursor-pointer"
              :title="option.label"
            >
              <input
                v-model="form.color"
                type="radio"
                name="program-color"
                :value="option.value"
                class="peer sr-only"
                :aria-label="option.label"
              >
              <span
                class="block h-8 w-8 rounded-full ring-2 ring-offset-2 transition peer-focus-visible:ring-brand-blue-400 dark:ring-offset-gray-800"
                :class="[
                  option.swatchClass,
                  form.color === option.value ? 'ring-gray-900 dark:ring-white' : 'ring-transparent',
                ]"
              />
              <span
                v-if="form.color === option.value"
                class="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-white"
              >
                <font-awesome-icon icon="fa-solid fa-check" />
              </span>
            </label>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ colorOptions.find(option => option.value === form.color)?.label }}
            </span>
          </div>
        </fieldset>

        <div class="flex items-end">
          <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              v-model="form.active"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700"
            >
            Actif (visible sur le site public)
          </label>
        </div>
      </div>
    </section>

    <!-- Textes trilingues -->
    <section :class="cardClass">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Textes
      </h2>

      <div class="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-brand-blue-300 bg-brand-blue-50/50 p-3 dark:border-brand-blue-700 dark:bg-brand-blue-900/20">
        <button
          type="button"
          :disabled="translating"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
          @click="handleTranslate"
        >
          <span v-if="translating" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <font-awesome-icon v-else icon="fa-solid fa-language" />
          {{ translating ? t('adminTranslate.translating') : t('adminTranslate.translate') }}
        </button>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          {{ t('adminTranslate.translateHint') }} Seuls les champs anglais et arabes vides sont complétés.
        </p>
        <p
          v-if="translateMessage"
          class="w-full text-xs"
          :class="translateMessage.type === 'success'
            ? 'text-green-700 dark:text-green-400'
            : 'text-red-700 dark:text-red-400'"
        >
          {{ translateMessage.text }}
        </p>
      </div>

      <EntrepreneurshipAdminLangTabs v-model="lang">
        <div v-if="lang === 'fr'" class="space-y-4">
          <div>
            <label for="program-title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre (FR) <span class="text-red-500">*</span>
            </label>
            <input id="program-title" v-model="form.title" type="text" maxlength="200" :class="inputClass">
          </div>
          <div>
            <label for="program-tagline" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Accroche (FR)
            </label>
            <textarea id="program-tagline" v-model="form.tagline" rows="2" :class="inputClass" />
          </div>
          <div>
            <label for="program-highlight" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chiffre mis en avant (FR)
            </label>
            <input
              id="program-highlight"
              v-model="form.highlight"
              type="text"
              maxlength="120"
              :class="inputClass"
              placeholder="ex. 4 crédits, 5 000 €"
            >
          </div>
        </div>

        <div v-else-if="lang === 'en'" class="space-y-4">
          <div>
            <label for="program-title-en" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre (EN)
            </label>
            <input id="program-title-en" v-model="form.title_en" type="text" maxlength="200" :class="inputClass">
          </div>
          <div>
            <label for="program-tagline-en" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Accroche (EN)
            </label>
            <textarea id="program-tagline-en" v-model="form.tagline_en" rows="2" :class="inputClass" />
          </div>
          <div>
            <label for="program-highlight-en" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chiffre mis en avant (EN)
            </label>
            <input id="program-highlight-en" v-model="form.highlight_en" type="text" maxlength="120" :class="inputClass">
          </div>
        </div>

        <div v-else class="space-y-4">
          <div>
            <label for="program-title-ar" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre (AR)
            </label>
            <input id="program-title-ar" v-model="form.title_ar" type="text" dir="rtl" maxlength="200" :class="inputClass">
          </div>
          <div>
            <label for="program-tagline-ar" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Accroche (AR)
            </label>
            <textarea id="program-tagline-ar" v-model="form.tagline_ar" dir="rtl" rows="2" :class="inputClass" />
          </div>
          <div>
            <label for="program-highlight-ar" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Chiffre mis en avant (AR)
            </label>
            <input id="program-highlight-ar" v-model="form.highlight_ar" type="text" dir="rtl" maxlength="120" :class="inputClass">
          </div>
        </div>
      </EntrepreneurshipAdminLangTabs>
    </section>

    <!-- Contenu riche -->
    <AdminRichTextEditor
      v-model="form.content_md"
      v-model:model-value-en="form.content_en_md"
      v-model:model-value-ar="form.content_ar_md"
      v-model:html-value="form.content_html"
      v-model:html-value-en="form.content_en_html"
      v-model:html-value-ar="form.content_ar_html"
      mode="modal"
      title="Contenu du dispositif"
      description="Présentation détaillée affichée sur la page publique du dispositif."
      height="350px"
    />

    <!-- Visuel -->
    <section :class="cardClass">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Visuel
      </h2>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div class="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 sm:w-64 dark:border-gray-700 dark:bg-gray-900/40">
          <img
            v-if="coverUrl"
            :src="coverUrl"
            alt="Aperçu du visuel du dispositif"
            class="h-full w-full object-cover"
          >
          <div v-else class="text-center text-xs text-gray-400">
            <font-awesome-icon icon="fa-solid fa-image" class="mb-1 block text-2xl" />
            Aucun visuel
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="pickerOpen = true"
          >
            <font-awesome-icon icon="fa-solid fa-photo-film" />
            Choisir dans la médiathèque
          </button>
          <button
            v-if="form.cover_image_external_id"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
            @click="removeCover"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
            Retirer
          </button>
        </div>
      </div>
    </section>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="emit('cancel')"
      >
        Annuler
      </button>
      <button
        type="submit"
        :disabled="saving"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
      >
        <font-awesome-icon v-if="saving" icon="fa-solid fa-spinner" class="animate-spin" />
        Enregistrer
      </button>
    </div>

    <AdminMediaPicker
      :open="pickerOpen"
      type="image"
      title="Choisir le visuel du dispositif"
      @select="onMediaSelect"
      @close="pickerOpen = false"
    />
  </form>
</template>
