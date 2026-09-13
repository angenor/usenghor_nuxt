<script setup lang="ts">
/**
 * Formulaire de création / édition d'une cohorte PEI (FSE / SEE).
 */
import type {
  PeiCohortAdmin,
  PeiCohortCreatePayload,
  PeiCohortType,
} from '~/types/api/entrepreneurship'
import { cohortTypeOptions } from '~/composables/useEntrepreneurshipApi'

interface Props {
  cohort?: PeiCohortAdmin | null
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cohort: null,
  saving: false,
})

const emit = defineEmits<{
  (e: 'submit', payload: PeiCohortCreatePayload): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()
const { translateCohort } = useEntrepreneurshipApi()

const isEditMode = computed(() => !!props.cohort)
const lang = ref<'fr' | 'en' | 'ar'>('fr')

function buildForm(c: PeiCohortAdmin | null) {
  return {
    code: c?.code ?? '',
    label: c?.label ?? '',
    label_en: c?.label_en ?? '',
    label_ar: c?.label_ar ?? '',
    year: c?.year ?? new Date().getFullYear(),
    type: (c?.type ?? 'fse') as PeiCohortType,
    focus: c?.focus ?? '',
    focus_en: c?.focus_en ?? '',
    focus_ar: c?.focus_ar ?? '',
    summary_md: c?.summary_md ?? '',
    summary_html: c?.summary_html ?? '',
    summary_en_md: c?.summary_en_md ?? '',
    summary_en_html: c?.summary_en_html ?? '',
    summary_ar_md: c?.summary_ar_md ?? '',
    summary_ar_html: c?.summary_ar_html ?? '',
    active: c?.active ?? true,
  }
}

const form = reactive(buildForm(props.cohort))

// ── Code (auto-généré depuis le libellé FR) ────────────────────────
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

const codeManuallyEdited = ref(isEditMode.value)
const codeChanged = computed(
  () => isEditMode.value && form.code !== (props.cohort?.code ?? ''),
)

watch(
  () => form.label,
  (value) => {
    if (!codeManuallyEdited.value) {
      form.code = slugify(value)
    }
  },
)

// Resynchronise tout le formulaire quand la cohorte est rechargée (nouvel `updated_at`,
// ex. après enregistrement) ; un simple basculement Actif/Inactif ne touche que `active`
// afin de préserver les modifications en cours.
watch(
  () => props.cohort?.updated_at,
  () => {
    if (props.cohort) {
      Object.assign(form, buildForm(props.cohort))
      codeManuallyEdited.value = true
    }
  },
)

watch(
  () => props.cohort?.active,
  (value) => {
    if (typeof value === 'boolean') form.active = value
  },
)

function onCodeInput() {
  codeManuallyEdited.value = true
}

function regenerateCode() {
  form.code = slugify(form.label)
  codeManuallyEdited.value = false
}

// ── Traduction automatique FR → EN/AR ──────────────────────────────
const translating = ref(false)
const translateMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function handleTranslate() {
  translateMessage.value = null
  if (!form.label && !form.focus && !form.summary_md) {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateNeedsFr') }
    return
  }
  translating.value = true
  try {
    const res = await translateCohort({
      label: form.label || null,
      focus: form.focus || null,
      summary_md: form.summary_md || null,
      summary_html: form.summary_html || null,
    })
    // N'écrase que les champs EN/AR encore vides
    if (res.label_en && !form.label_en) form.label_en = res.label_en
    if (res.label_ar && !form.label_ar) form.label_ar = res.label_ar
    if (res.focus_en && !form.focus_en) form.focus_en = res.focus_en
    if (res.focus_ar && !form.focus_ar) form.focus_ar = res.focus_ar
    if (res.summary_en_md && !form.summary_en_md) {
      form.summary_en_md = res.summary_en_md
      form.summary_en_html = res.summary_en_html ?? ''
    }
    if (res.summary_ar_md && !form.summary_ar_md) {
      form.summary_ar_md = res.summary_ar_md
      form.summary_ar_html = res.summary_ar_html ?? ''
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
const errorMessage = ref<string | null>(null)
const CODE_PATTERN = /^[a-z0-9][a-z0-9-]*$/

function handleSubmit() {
  errorMessage.value = null
  const label = form.label.trim()
  const code = form.code.trim()
  const year = Number(form.year)

  if (!label) {
    lang.value = 'fr'
    errorMessage.value = 'Le libellé en français est obligatoire.'
    return
  }
  if (!code) {
    errorMessage.value = 'Le code est obligatoire.'
    return
  }
  if (!CODE_PATTERN.test(code)) {
    errorMessage.value = 'Le code ne doit contenir que des lettres minuscules, chiffres et tirets (sans tiret initial).'
    return
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    errorMessage.value = 'L\'année doit être comprise entre 2000 et 2100.'
    return
  }
  if (!form.type) {
    errorMessage.value = 'Le type de cohorte est obligatoire.'
    return
  }

  const payload: PeiCohortCreatePayload = {
    code,
    label,
    label_en: form.label_en.trim() || null,
    label_ar: form.label_ar.trim() || null,
    year,
    type: form.type,
    focus: form.focus.trim() || null,
    focus_en: form.focus_en.trim() || null,
    focus_ar: form.focus_ar.trim() || null,
    summary_md: form.summary_md || null,
    summary_html: form.summary_html || null,
    summary_en_md: form.summary_en_md || null,
    summary_en_html: form.summary_en_html || null,
    summary_ar_md: form.summary_ar_md || null,
    summary_ar_html: form.summary_ar_html || null,
    active: form.active,
  }
  emit('submit', payload)
}

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
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
    <section class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Identité
      </h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="cohort-code" :class="labelClass">Code *</label>
          <div class="flex gap-2">
            <input
              id="cohort-code"
              v-model="form.code"
              type="text"
              maxlength="60"
              required
              placeholder="fse-4"
              :class="[inputClass, 'font-mono']"
              @input="onCodeInput"
            >
            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 px-3 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              title="Régénérer le code depuis le libellé FR"
              @click="regenerateCode"
            >
              <font-awesome-icon icon="fa-solid fa-rotate" class="h-3 w-3" />
              Régénérer
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lettres minuscules, chiffres et tirets. Généré automatiquement depuis le libellé FR.
          </p>
          <p
            v-if="isEditMode && codeChanged"
            class="mt-1 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400"
          >
            <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-3 w-3" />
            Modifier le code change l'identifiant utilisé ailleurs (liens, lauréats).
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="cohort-year" :class="labelClass">Année *</label>
            <input
              id="cohort-year"
              v-model.number="form.year"
              type="number"
              min="2000"
              max="2100"
              step="1"
              required
              :class="inputClass"
            >
          </div>
          <div>
            <label for="cohort-type" :class="labelClass">Type *</label>
            <select
              id="cohort-type"
              v-model="form.type"
              required
              :class="inputClass"
            >
              <option v-for="opt in cohortTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
          <input
            v-model="form.active"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
          Cohorte active (visible sur le site public)
        </label>
      </div>
    </section>

    <!-- Textes trilingues -->
    <section class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-4 text-base font-semibold text-gray-900 dark:text-white">
        Libellé et focus
      </h2>

      <EntrepreneurshipAdminLangTabs v-model="lang">
        <div v-show="lang === 'fr'" class="space-y-4">
          <div>
            <label for="cohort-label-fr" :class="labelClass">Libellé (FR) *</label>
            <input
              id="cohort-label-fr"
              v-model="form.label"
              type="text"
              maxlength="200"
              required
              placeholder="FSE — 4e cohorte"
              :class="inputClass"
            >
          </div>
          <div>
            <label for="cohort-focus-fr" :class="labelClass">Focus (FR)</label>
            <textarea
              id="cohort-focus-fr"
              v-model="form.focus"
              rows="3"
              :class="inputClass"
            />
          </div>
        </div>

        <div v-show="lang === 'en'" class="space-y-4">
          <div>
            <label for="cohort-label-en" :class="labelClass">Libellé (EN)</label>
            <input
              id="cohort-label-en"
              v-model="form.label_en"
              type="text"
              maxlength="200"
              :class="inputClass"
            >
          </div>
          <div>
            <label for="cohort-focus-en" :class="labelClass">Focus (EN)</label>
            <textarea
              id="cohort-focus-en"
              v-model="form.focus_en"
              rows="3"
              :class="inputClass"
            />
          </div>
        </div>

        <div v-show="lang === 'ar'" class="space-y-4">
          <div>
            <label for="cohort-label-ar" :class="labelClass">Libellé (AR)</label>
            <input
              id="cohort-label-ar"
              v-model="form.label_ar"
              type="text"
              dir="rtl"
              maxlength="200"
              :class="inputClass"
            >
          </div>
          <div>
            <label for="cohort-focus-ar" :class="labelClass">Focus (AR)</label>
            <textarea
              id="cohort-focus-ar"
              v-model="form.focus_ar"
              dir="rtl"
              rows="3"
              :class="inputClass"
            />
          </div>
        </div>
      </EntrepreneurshipAdminLangTabs>
    </section>

    <!-- Bilan (contenu riche) -->
    <AdminRichTextEditor
      v-model="form.summary_md"
      v-model:model-value-en="form.summary_en_md"
      v-model:model-value-ar="form.summary_ar_md"
      v-model:html-value="form.summary_html"
      v-model:html-value-en="form.summary_en_html"
      v-model:html-value-ar="form.summary_ar_html"
      mode="modal"
      title="Bilan de la cohorte"
      description="Résultats, faits marquants et chiffres de la cohorte."
      icon="fa-solid fa-people-group"
      height="350px"
    />

    <!-- Traduction automatique -->
    <div class="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-brand-blue-300 bg-brand-blue-50/50 p-3 dark:border-brand-blue-700 dark:bg-brand-blue-900/20">
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
  </form>
</template>
