<script setup lang="ts">
/**
 * Formulaire de création / édition d'un portrait PEI
 * (lauréat FSE ou étudiant-entrepreneur).
 */
import type { MediaRead } from '~/types/api'
import type {
  PeiCohortAdmin,
  PeiLaureateAdmin,
  PeiLaureateCreatePayload,
  PeiLaureateType,
} from '~/types/api/entrepreneurship'
import {
  cohortTypeForLaureateType,
  laureateTypeOptions,
} from '~/composables/useEntrepreneurshipApi'

const QUOTE_MAX = 600

interface Props {
  laureate?: PeiLaureateAdmin | null
  cohorts: PeiCohortAdmin[]
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  laureate: null,
  saving: false,
})

const emit = defineEmits<{
  (e: 'submit', payload: PeiLaureateCreatePayload): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()
const { translateLaureate } = useEntrepreneurshipApi()
const { getMediaUrl } = useMediaApi()

const lang = ref<'fr' | 'en' | 'ar'>('fr')

function buildForm(l: PeiLaureateAdmin | null) {
  return {
    type: (l?.type ?? 'fse_laureate') as PeiLaureateType,
    cohort_id: l?.cohort_id ?? '',
    full_name: l?.full_name ?? '',
    project_name: l?.project_name ?? '',
    department_label: l?.department_label ?? '',
    department_label_en: l?.department_label_en ?? '',
    department_label_ar: l?.department_label_ar ?? '',
    quote: l?.quote ?? '',
    quote_en: l?.quote_en ?? '',
    quote_ar: l?.quote_ar ?? '',
    photo_external_id: l?.photo_external_id ?? null as string | null,
    website_url: l?.website_url ?? '',
    linkedin_url: l?.linkedin_url ?? '',
    instagram_url: l?.instagram_url ?? '',
    facebook_url: l?.facebook_url ?? '',
    video_url: l?.video_url ?? '',
    grant_amount: l?.grant_amount ?? '',
    is_featured: l?.is_featured ?? false,
    is_published: l?.is_published ?? false,
  }
}

const form = reactive(buildForm(props.laureate))

// Resynchronise le formulaire quand le portrait est rechargé (nouvel `updated_at`)
watch(
  () => props.laureate?.updated_at,
  () => {
    if (props.laureate) Object.assign(form, buildForm(props.laureate))
  },
)

// Bascules faites depuis l'en-tête de la page : ne touchent que leur champ
watch(() => props.laureate?.is_published, (value) => {
  if (typeof value === 'boolean') form.is_published = value
})
watch(() => props.laureate?.is_featured, (value) => {
  if (typeof value === 'boolean') form.is_featured = value
})

// ── Cohortes compatibles avec le type ──────────────────────────────
const compatibleCohorts = computed(() =>
  props.cohorts.filter(c => c.type === cohortTypeForLaureateType[form.type]),
)

watch(
  [() => form.type, compatibleCohorts],
  () => {
    if (form.cohort_id && !compatibleCohorts.value.some(c => c.id === form.cohort_id)) {
      form.cohort_id = ''
    }
  },
)

// ── Photo ──────────────────────────────────────────────────────────
const pickerOpen = ref(false)
const photoUrl = computed(() => getMediaUrl(form.photo_external_id, 'medium'))

function onMediaSelect(media: MediaRead) {
  form.photo_external_id = media.id
  pickerOpen.value = false
}

// ── Traduction automatique FR → EN/AR ──────────────────────────────
const translating = ref(false)
const translateMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function handleTranslate() {
  translateMessage.value = null
  if (!form.department_label.trim() && !form.quote.trim()) {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateNeedsFr') }
    return
  }
  translating.value = true
  try {
    const res = await translateLaureate({
      department_label: form.department_label || null,
      quote: form.quote || null,
    })
    // N'écrase que les champs EN/AR encore vides
    if (res.department_label_en && !form.department_label_en) form.department_label_en = res.department_label_en
    if (res.department_label_ar && !form.department_label_ar) form.department_label_ar = res.department_label_ar
    if (res.quote_en && !form.quote_en) form.quote_en = res.quote_en.slice(0, QUOTE_MAX)
    if (res.quote_ar && !form.quote_ar) form.quote_ar = res.quote_ar.slice(0, QUOTE_MAX)
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
const errorMessage = ref<string | null>(null)

const urlFields = [
  { key: 'website_url', label: 'Site web', icon: 'fa-solid fa-globe', placeholder: 'https://…' },
  { key: 'linkedin_url', label: 'LinkedIn', icon: 'fa-brands fa-linkedin', placeholder: 'https://www.linkedin.com/in/…' },
  { key: 'instagram_url', label: 'Instagram', icon: 'fa-brands fa-instagram', placeholder: 'https://www.instagram.com/…' },
  { key: 'facebook_url', label: 'Facebook', icon: 'fa-brands fa-facebook', placeholder: 'https://www.facebook.com/…' },
  { key: 'video_url', label: 'Vidéo', icon: 'fa-solid fa-video', placeholder: 'https://www.youtube.com/watch?v=…' },
] as const

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  catch {
    return false
  }
}

function nullable(value: string): string | null {
  return value.trim() || null
}

function handleSubmit() {
  errorMessage.value = null
  const fullName = form.full_name.trim()
  const projectName = form.project_name.trim()

  if (!form.cohort_id) {
    errorMessage.value = 'La cohorte est obligatoire.'
    return
  }
  if (fullName.length < 2) {
    errorMessage.value = 'Le nom est obligatoire (2 caractères minimum).'
    return
  }
  if (projectName.length < 2) {
    errorMessage.value = 'Le nom du projet est obligatoire (2 caractères minimum).'
    return
  }
  for (const field of urlFields) {
    const value = form[field.key].trim()
    if (value && !isHttpUrl(value)) {
      errorMessage.value = `Adresse web invalide : ${field.label} (saisissez une adresse complète commençant par https://).`
      return
    }
  }
  const amountRaw = String(form.grant_amount ?? '').trim()
  const amount = amountRaw === '' ? null : Number(amountRaw)
  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
    errorMessage.value = 'Le montant de la subvention doit être un nombre positif.'
    return
  }

  emit('submit', {
    cohort_id: form.cohort_id,
    type: form.type,
    full_name: fullName,
    project_name: projectName,
    department_label: nullable(form.department_label),
    department_label_en: nullable(form.department_label_en),
    department_label_ar: nullable(form.department_label_ar),
    quote: nullable(form.quote),
    quote_en: nullable(form.quote_en),
    quote_ar: nullable(form.quote_ar),
    photo_external_id: form.photo_external_id,
    website_url: nullable(form.website_url),
    linkedin_url: nullable(form.linkedin_url),
    instagram_url: nullable(form.instagram_url),
    facebook_url: nullable(form.facebook_url),
    video_url: nullable(form.video_url),
    grant_amount: amount === null ? null : Math.round(amount * 100) / 100,
    is_featured: form.is_featured,
    is_published: form.is_published,
  })
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
const cardClass = 'rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800'
const checkboxClass = 'h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700'
</script>

<template>
  <form class="space-y-6" novalidate @submit.prevent="handleSubmit">
    <div
      v-if="errorMessage"
      class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
      role="alert"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Identité -->
    <section :class="cardClass">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Identité
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="laureate-type" :class="labelClass">Type *</label>
          <select id="laureate-type" v-model="form.type" required :class="inputClass">
            <option v-for="opt in laureateTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div>
          <label for="laureate-cohort" :class="labelClass">Cohorte *</label>
          <select id="laureate-cohort" v-model="form.cohort_id" required :class="inputClass">
            <option value="" disabled>
              Choisir une cohorte…
            </option>
            <option v-for="c in compatibleCohorts" :key="c.id" :value="c.id">
              {{ c.label }}{{ c.active ? '' : ' (inactive)' }}
            </option>
          </select>
          <p v-if="!compatibleCohorts.length" class="mt-1 text-xs text-amber-700 dark:text-amber-400">
            Aucune cohorte de ce type : créez-la d'abord dans « Cohortes ».
          </p>
          <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Seules les cohortes compatibles avec le type sont proposées (FSE pour un lauréat, SEE pour un étudiant-entrepreneur).
          </p>
        </div>
        <div>
          <label for="laureate-name" :class="labelClass">Nom *</label>
          <input
            id="laureate-name"
            v-model="form.full_name"
            type="text"
            maxlength="200"
            required
            placeholder="Awa Diop"
            :class="inputClass"
          >
        </div>
        <div>
          <label for="laureate-project" :class="labelClass">Projet *</label>
          <input
            id="laureate-project"
            v-model="form.project_name"
            type="text"
            maxlength="200"
            required
            placeholder="Nom du projet"
            :class="inputClass"
          >
        </div>
        <div>
          <label for="laureate-grant" :class="labelClass">Montant de la subvention (€)</label>
          <input
            id="laureate-grant"
            v-model="form.grant_amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="5000"
            :class="inputClass"
          >
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Non affiché individuellement sur le site : sert au chiffre « jusqu'à … € ».
          </p>
        </div>
        <div class="flex flex-col justify-center gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input v-model="form.is_featured" type="checkbox" :class="checkboxClass">
            Mis en avant
          </label>
          <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input v-model="form.is_published" type="checkbox" :class="checkboxClass">
            Publié (visible sur le site public)
          </label>
        </div>
      </div>
    </section>

    <!-- Textes trilingues -->
    <section :class="cardClass">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Département et verbatim
      </h2>

      <EntrepreneurshipAdminLangTabs v-model="lang">
        <div v-show="lang === 'fr'" class="space-y-4">
          <div>
            <label for="laureate-dept-fr" :class="labelClass">Département (FR)</label>
            <input
              id="laureate-dept-fr"
              v-model="form.department_label"
              type="text"
              maxlength="200"
              placeholder="Département Santé"
              :class="inputClass"
            >
          </div>
          <div>
            <label for="laureate-quote-fr" :class="labelClass">Verbatim (FR)</label>
            <textarea
              id="laureate-quote-fr"
              v-model="form.quote"
              rows="4"
              :maxlength="QUOTE_MAX"
              :class="inputClass"
            />
            <p class="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
              {{ form.quote.length }}/{{ QUOTE_MAX }}
            </p>
          </div>
        </div>

        <div v-show="lang === 'en'" class="space-y-4">
          <div>
            <label for="laureate-dept-en" :class="labelClass">Département (EN)</label>
            <input
              id="laureate-dept-en"
              v-model="form.department_label_en"
              type="text"
              maxlength="200"
              :class="inputClass"
            >
          </div>
          <div>
            <label for="laureate-quote-en" :class="labelClass">Verbatim (EN)</label>
            <textarea
              id="laureate-quote-en"
              v-model="form.quote_en"
              rows="4"
              :maxlength="QUOTE_MAX"
              :class="inputClass"
            />
            <p class="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
              {{ form.quote_en.length }}/{{ QUOTE_MAX }}
            </p>
          </div>
        </div>

        <div v-show="lang === 'ar'" class="space-y-4">
          <div>
            <label for="laureate-dept-ar" :class="labelClass">Département (AR)</label>
            <input
              id="laureate-dept-ar"
              v-model="form.department_label_ar"
              type="text"
              dir="rtl"
              maxlength="200"
              :class="inputClass"
            >
          </div>
          <div>
            <label for="laureate-quote-ar" :class="labelClass">Verbatim (AR)</label>
            <textarea
              id="laureate-quote-ar"
              v-model="form.quote_ar"
              dir="rtl"
              rows="4"
              :maxlength="QUOTE_MAX"
              :class="inputClass"
            />
            <p class="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
              {{ form.quote_ar.length }}/{{ QUOTE_MAX }}
            </p>
          </div>
        </div>
      </EntrepreneurshipAdminLangTabs>

      <!-- Traduction automatique -->
      <div class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-brand-blue-300 bg-brand-blue-50/50 p-3 dark:border-brand-blue-700 dark:bg-brand-blue-900/20">
        <button
          type="button"
          :disabled="translating"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
          @click="handleTranslate"
        >
          <font-awesome-icon
            :icon="translating ? 'fa-solid fa-spinner' : 'fa-solid fa-language'"
            :class="['h-4 w-4', translating ? 'animate-spin' : '']"
          />
          {{ translating ? t('adminTranslate.translating') : t('adminTranslate.translate') }}
        </button>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          {{ t('adminTranslate.translateHint') }} Seuls les champs EN/AR vides sont remplis.
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
    </section>

    <!-- Photo -->
    <section :class="cardClass">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Photo
      </h2>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div class="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
          <img
            v-if="photoUrl"
            :src="photoUrl"
            alt="Aperçu de la photo du portrait"
            class="h-full w-full object-cover"
          >
          <div v-else class="text-center text-xs text-gray-400">
            <font-awesome-icon icon="fa-solid fa-user" class="mb-1 block text-2xl" />
            Aucune photo
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
            v-if="form.photo_external_id"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
            @click="form.photo_external_id = null"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
            Retirer
          </button>
        </div>
      </div>
    </section>

    <!-- Liens -->
    <section :class="cardClass">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Liens
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div v-for="field in urlFields" :key="field.key">
          <label :for="`laureate-${field.key}`" :class="labelClass">
            <font-awesome-icon :icon="field.icon" class="me-1 h-3.5 w-3.5 text-gray-400" />
            {{ field.label }}
          </label>
          <input
            :id="`laureate-${field.key}`"
            v-model="form[field.key]"
            type="url"
            maxlength="500"
            :placeholder="field.placeholder"
            :class="inputClass"
          >
        </div>
      </div>
    </section>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="emit('cancel')"
      >
        Annuler
      </button>
      <button
        type="submit"
        :disabled="saving"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
      >
        <font-awesome-icon
          :icon="saving ? 'fa-solid fa-spinner' : 'fa-solid fa-floppy-disk'"
          :class="['h-4 w-4', saving ? 'animate-spin' : '']"
        />
        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
      </button>
    </div>

    <AdminMediaPicker
      :open="pickerOpen"
      type="image"
      title="Choisir la photo du portrait"
      @select="onMediaSelect"
      @close="pickerOpen = false"
    />
  </form>
</template>
