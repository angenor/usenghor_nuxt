<script setup lang="ts">
/**
 * Modale de création / modification d'un secteur (admin « Organisation »).
 *
 * - Création : `sector` à `null` ; le code est proposé à partir du nom tant
 *   qu'il n'a pas été saisi à la main.
 * - Modification : `sector` = secteur à modifier.
 * - Traduction FR → EN/AR sans persistance (bouton « Traduire »).
 * - Émet `saved` avec l'identifiant du secteur une fois enregistré ; le parent
 *   ferme la modale et met ses données à jour.
 */
import type { SectorRead } from '~/types/api'

interface SectorHeadCandidate {
  id: string
  name: string
  active?: boolean
}

const props = defineProps<{
  open: boolean
  sector: SectorRead | null
  headCandidates: SectorHeadCandidate[]
}>()

const emit = defineEmits<{
  close: []
  saved: [id: string, created: boolean]
}>()

const { createSector, updateSector, translateSector, generateSectorCode } = useSectorsApi()
const { t } = useI18n()

interface SectorForm {
  name: string
  code: string
  description_md: string
  description_html: string
  mission_md: string
  mission_html: string
  // Traductions (clé d'état : <champ>_<langue>)
  name_en: string
  name_ar: string
  description_md_en: string
  description_html_en: string
  description_md_ar: string
  description_html_ar: string
  mission_md_en: string
  mission_html_en: string
  mission_md_ar: string
  mission_html_ar: string
  head_id: string
  active: boolean
}

function emptyForm(): SectorForm {
  return {
    name: '',
    code: '',
    description_md: '',
    description_html: '',
    mission_md: '',
    mission_html: '',
    name_en: '',
    name_ar: '',
    description_md_en: '',
    description_html_en: '',
    description_md_ar: '',
    description_html_ar: '',
    mission_md_en: '',
    mission_html_en: '',
    mission_md_ar: '',
    mission_html_ar: '',
    head_id: '',
    active: true,
  }
}

function formFromSector(sector: SectorRead): SectorForm {
  return {
    name: sector.name,
    code: sector.code,
    description_md: sector.description_md || '',
    description_html: sector.description_html || '',
    mission_md: sector.mission_md || '',
    mission_html: sector.mission_html || '',
    name_en: sector.name_en || '',
    name_ar: sector.name_ar || '',
    description_md_en: sector.description_en_md || '',
    description_html_en: sector.description_en_html || '',
    description_md_ar: sector.description_ar_md || '',
    description_html_ar: sector.description_ar_html || '',
    mission_md_en: sector.mission_en_md || '',
    mission_html_en: sector.mission_en_html || '',
    mission_md_ar: sector.mission_ar_md || '',
    mission_html_ar: sector.mission_ar_html || '',
    head_id: sector.head_external_id || '',
    active: sector.active,
  }
}

const form = ref<SectorForm>(emptyForm())
const isEditing = computed(() => !!props.sector)
const isSaving = ref(false)
const saveError = ref<string | null>(null)
// Le code n'est plus proposé automatiquement dès qu'il a été saisi à la main
const codeTouched = ref(false)

const translating = ref(false)
const translateMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

const nameInputRef = ref<HTMLInputElement | null>(null)
const uid = useId()

// Réinitialise le formulaire à chaque ouverture
watch(
  () => props.open,
  (open) => {
    if (!open) return
    form.value = props.sector ? formFromSector(props.sector) : emptyForm()
    codeTouched.value = !!props.sector
    saveError.value = null
    translateMessage.value = null
    nextTick(() => nameInputRef.value?.focus())
  },
  { immediate: true },
)

// Responsables proposés : utilisateurs actifs + responsable actuel s'il n'y figure pas
const headOptions = computed(() => {
  const options = props.headCandidates.filter(c => c.active !== false)
  const current = form.value.head_id
  if (current && !options.some(c => c.id === current)) {
    const known = props.headCandidates.find(c => c.id === current)
    options.unshift({ id: current, name: known ? `${known.name} (compte inactif)` : 'Responsable actuel (non listé)' })
  }
  return options
})

function onNameInput() {
  if (!isEditing.value && !codeTouched.value) {
    form.value.code = form.value.name ? generateSectorCode(form.value.name) : ''
  }
}

function extractErrorDetail(err: unknown): string {
  const e = err as { data?: { detail?: unknown }, message?: string }
  const detail = e?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const messages = detail
      .map(d => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : ''))
      .filter(Boolean)
    if (messages.length) return messages.join(' ; ')
  }
  return e?.message || 'Erreur lors de l\'enregistrement du secteur'
}

async function handleTranslate() {
  translateMessage.value = null
  if (!form.value.name && !form.value.description_md && !form.value.mission_md) {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateNeedsFr') }
    return
  }
  translating.value = true
  try {
    const res = await translateSector({
      name: form.value.name || null,
      description_html: form.value.description_html || null,
      description_md: form.value.description_md || null,
      mission_html: form.value.mission_html || null,
      mission_md: form.value.mission_md || null,
    })
    if (res.name_en != null) form.value.name_en = res.name_en
    if (res.name_ar != null) form.value.name_ar = res.name_ar
    if (res.description_en_html != null) form.value.description_html_en = res.description_en_html
    if (res.description_en_md != null) form.value.description_md_en = res.description_en_md
    if (res.description_ar_html != null) form.value.description_html_ar = res.description_ar_html
    if (res.description_ar_md != null) form.value.description_md_ar = res.description_ar_md
    if (res.mission_en_html != null) form.value.mission_html_en = res.mission_en_html
    if (res.mission_en_md != null) form.value.mission_md_en = res.mission_en_md
    if (res.mission_ar_html != null) form.value.mission_html_ar = res.mission_ar_html
    if (res.mission_ar_md != null) form.value.mission_md_ar = res.mission_ar_md
    translateMessage.value = { type: 'success', text: t('adminTranslate.translateSuccess') }
  }
  catch {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateError') }
  }
  finally {
    translating.value = false
  }
}

const canSave = computed(() => !!form.value.name.trim() && !!form.value.code.trim() && !isSaving.value)

async function save() {
  if (!canSave.value) return
  isSaving.value = true
  saveError.value = null
  const f = form.value
  const payload = {
    code: f.code.trim(),
    name: f.name.trim(),
    description_html: f.description_html || null,
    description_md: f.description_md || null,
    mission_html: f.mission_html || null,
    mission_md: f.mission_md || null,
    // Traductions EN/AR (état <champ>_<langue> → API <champ>_<langue>_<html|md>)
    name_en: f.name_en || null,
    name_ar: f.name_ar || null,
    description_en_html: f.description_html_en || null,
    description_en_md: f.description_md_en || null,
    description_ar_html: f.description_html_ar || null,
    description_ar_md: f.description_md_ar || null,
    mission_en_html: f.mission_html_en || null,
    mission_en_md: f.mission_md_en || null,
    mission_ar_html: f.mission_html_ar || null,
    mission_ar_md: f.mission_md_ar || null,
    head_external_id: f.head_id || null,
    active: f.active,
  }
  try {
    if (props.sector) {
      await updateSector(props.sector.id, payload)
      emit('saved', props.sector.id, false)
    }
    else {
      const res = await createSector(payload)
      emit('saved', res.id, true)
    }
  }
  catch (err) {
    console.error('Erreur enregistrement secteur :', err)
    saveError.value = extractErrorDetail(err)
  }
  finally {
    isSaving.value = false
  }
}

function close() {
  if (isSaving.value) return
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="close"
      @keydown="onKeydown"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${uid}-title`"
        class="admin-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-800"
        data-lenis-prevent
      >
        <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 :id="`${uid}-title`" class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier le secteur' : 'Nouveau secteur' }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Fermer"
            @click="close"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-4 p-4" @submit.prevent="save">
          <!-- Erreur d'enregistrement -->
          <div
            v-if="saveError"
            role="alert"
            class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{{ saveError }}</span>
          </div>

          <!-- Nom -->
          <div>
            <label :for="`${uid}-name`" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom *
            </label>
            <input
              :id="`${uid}-name`"
              ref="nameInputRef"
              v-model="form.name"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Ex. : Culture"
              @input="onNameInput"
            >
          </div>

          <!-- Traduction auto FR → EN/AR -->
          <div class="space-y-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                :disabled="translating"
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                @click="handleTranslate"
              >
                <font-awesome-icon v-if="translating" :icon="['fas', 'spinner']" class="animate-spin" />
                {{ translating ? t('adminTranslate.translating') : t('adminTranslate.translate') }}
              </button>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ t('adminTranslate.translateHint') }}
              </p>
            </div>
            <p
              v-if="translateMessage"
              class="text-xs"
              role="status"
              :class="translateMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'"
            >
              {{ translateMessage.text }}
            </p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label :for="`${uid}-name-en`" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nom (EN)</label>
                <input
                  :id="`${uid}-name-en`"
                  v-model="form.name_en"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label :for="`${uid}-name-ar`" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">الاسم (AR)</label>
                <input
                  :id="`${uid}-name-ar`"
                  v-model="form.name_ar"
                  type="text"
                  dir="rtl"
                  class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Les traductions EN/AR de la description et de la mission apparaissent dans les onglets de leurs éditeurs respectifs.
            </p>
          </div>

          <!-- Code -->
          <div>
            <label :for="`${uid}-code`" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code *
            </label>
            <input
              :id="`${uid}-code`"
              v-model="form.code"
              type="text"
              required
              maxlength="20"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Ex. : SEC-CUL"
              :aria-describedby="`${uid}-code-help`"
              @input="codeTouched = true"
            >
            <p :id="`${uid}-code-help`" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Code unique pour identifier le secteur{{ isEditing ? '' : ' (proposé à partir du nom)' }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <span class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </span>
            <AdminRichTextEditor
              v-model="form.description_md"
              v-model:html-value="form.description_html"
              v-model:model-value-en="form.description_md_en"
              v-model:html-value-en="form.description_html_en"
              v-model:model-value-ar="form.description_md_ar"
              v-model:html-value-ar="form.description_html_ar"
              placeholder="Description courte du secteur..."
              :show-card="false"
              height="200px"
            />
          </div>

          <!-- Mission -->
          <div>
            <span class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mission
            </span>
            <AdminRichTextEditor
              v-model="form.mission_md"
              v-model:html-value="form.mission_html"
              v-model:model-value-en="form.mission_md_en"
              v-model:html-value-en="form.mission_html_en"
              v-model:model-value-ar="form.mission_md_ar"
              v-model:html-value-ar="form.mission_html_ar"
              placeholder="Mission et objectifs du secteur..."
              :show-card="false"
              height="250px"
            />
          </div>

          <!-- Responsable -->
          <div>
            <label :for="`${uid}-head`" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Responsable
            </label>
            <select
              :id="`${uid}-head`"
              v-model="form.head_id"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">
                Aucun responsable
              </option>
              <option v-for="candidate in headOptions" :key="candidate.id" :value="candidate.id">
                {{ candidate.name }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choisi parmi les comptes utilisateurs actifs.
            </p>
          </div>

          <!-- Actif -->
          <div class="flex items-center gap-3">
            <input
              :id="`${uid}-active`"
              v-model="form.active"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 bg-white text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
            >
            <label :for="`${uid}-active`" class="text-sm text-gray-700 dark:text-gray-300">
              Secteur actif
            </label>
          </div>
        </form>

        <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="isSaving"
            @click="close"
          >
            Annuler
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canSave"
            @click="save"
          >
            <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
            {{ isEditing ? 'Enregistrer' : 'Créer le secteur' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
