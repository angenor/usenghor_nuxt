<script setup lang="ts">
/**
 * Formulaire d'un service (création et édition), partagé par
 * `admin/organisation/services/nouveau.vue` et `admin/organisation/services/[id].vue`.
 *
 * Deux volets affichés selon `tab` (v-show : l'état est conservé) :
 *  - « general »      : secteur, service parent, page dédiée, nom + traductions, sigle,
 *                       couleur, responsable, contact (et statut à la création) ;
 *  - « presentation » : description et mission riches FR / EN / AR.
 *
 * Le composant porte l'état, la validation, la traduction automatique et
 * l'enregistrement (POST ou PUT). La page déclenche l'enregistrement via `save()`
 * (exposé) et reçoit `saved`, `dirty-change` et `request-tab` (bascule vers
 * l'onglet qui contient une erreur).
 *
 * `album_external_id` n'est jamais envoyé : l'album principal est géré par
 * l'onglet « Médias ». En édition, `active` n'est pas envoyé non plus : le statut
 * est piloté par le badge Actif / Inactif de l'en-tête (enregistrement immédiat).
 */
import type { ServiceDisplay, ServiceUpdate } from '~/composables/useServicesApi'
import type { ServiceRead } from '~/types/api'

type FormTab = 'general' | 'presentation'

interface SectorOption {
  id: string
  name: string
  code: string
}

const props = withDefaults(defineProps<{
  /** Identifiant du service édité ; `null` en création */
  serviceId?: string | null
  /** Valeurs initiales (service chargé, ou pré-remplissage secteur / parent en création) */
  initial?: Partial<ServiceRead> | null
  /** Volet affiché */
  tab: FormTab
  sectors: SectorOption[]
  /** Tous les services (parents proposables, nombre de pôles) */
  services: ServiceDisplay[]
  /** Lecture seule (pas de permission organization.edit) */
  disabled?: boolean
}>(), {
  serviceId: null,
  initial: null,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'saved', payload: { id: string, created: boolean }): void
  (e: 'dirty-change', dirty: boolean): void
  (e: 'request-tab', tab: FormTab): void
}>()

const { createService, updateService, translateService } = useServicesApi()
const { apiFetch } = useApi()
const { t } = useI18n()

const isEdit = computed(() => !!props.serviceId)

// ============================================================================
// État du formulaire
// ============================================================================

interface ServiceFormState {
  name: string
  sigle: string
  color: string
  sector_id: string
  parent_id: string | null
  landing_path: string
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
  head_external_id: string
  email: string
  phone: string
  active: boolean
}

function toFormState(src: Partial<ServiceRead> | null | undefined): ServiceFormState {
  const s: Partial<ServiceRead> = src || {}
  return {
    name: s.name || '',
    sigle: s.sigle || '',
    color: s.color || '',
    sector_id: s.sector_id || '',
    parent_id: s.parent_id || null,
    landing_path: s.landing_path || '',
    description_md: s.description_md || '',
    description_html: s.description_html || '',
    mission_md: s.mission_md || '',
    mission_html: s.mission_html || '',
    // backend <champ>_<langue>_<html|md> → état <champ>_<html|md>_<langue>
    name_en: s.name_en || '',
    name_ar: s.name_ar || '',
    description_md_en: s.description_en_md || '',
    description_html_en: s.description_en_html || '',
    description_md_ar: s.description_ar_md || '',
    description_html_ar: s.description_ar_html || '',
    mission_md_en: s.mission_en_md || '',
    mission_html_en: s.mission_en_html || '',
    mission_md_ar: s.mission_ar_md || '',
    mission_html_ar: s.mission_ar_html || '',
    head_external_id: s.head_external_id || '',
    email: s.email || '',
    phone: s.phone || '',
    active: s.active ?? true,
  }
}

const form = reactive<ServiceFormState>(toFormState(props.initial))

/** Corps envoyé à l'API : uniquement les champs du formulaire. */
function buildPayload(): ServiceUpdate {
  const payload: ServiceUpdate = {
    name: form.name.trim(),
    sigle: form.sigle.trim() || null,
    color: form.color || null,
    sector_id: form.sector_id || null,
    parent_id: form.parent_id || null,
    landing_path: form.landing_path.trim() || null,
    description_html: form.description_html || null,
    description_md: form.description_md || null,
    mission_html: form.mission_html || null,
    mission_md: form.mission_md || null,
    // état <champ>_<html|md>_<langue> → backend <champ>_<langue>_<html|md>
    name_en: form.name_en || null,
    name_ar: form.name_ar || null,
    description_en_html: form.description_html_en || null,
    description_en_md: form.description_md_en || null,
    description_ar_html: form.description_html_ar || null,
    description_ar_md: form.description_md_ar || null,
    mission_en_html: form.mission_html_en || null,
    mission_en_md: form.mission_md_en || null,
    mission_ar_html: form.mission_html_ar || null,
    mission_ar_md: form.mission_md_ar || null,
    head_external_id: form.head_external_id || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
  }
  // En édition, le statut est géré par le badge de l'en-tête
  if (!isEdit.value) payload.active = form.active
  return payload
}

// ============================================================================
// Modifications non enregistrées
// ============================================================================

const snapshot = ref('')
const initialSectorId = ref('')
const parentResetNotice = ref(false)

function initFrom(src: Partial<ServiceRead> | null | undefined) {
  Object.assign(form, toFormState(src))
  snapshot.value = JSON.stringify(buildPayload())
  initialSectorId.value = form.sector_id
  parentResetNotice.value = false
  clearErrors()
  translateMessage.value = null
}

// Réinitialisation quand la page fournit un nouveau service (chargement, rechargement
// après enregistrement). Une mutation en place (ex. album principal) ne déclenche rien.
watch(() => props.initial, src => initFrom(src))

const isDirty = computed(() => JSON.stringify(buildPayload()) !== snapshot.value)
watch(isDirty, v => emit('dirty-change', v))

// ============================================================================
// Hiérarchie (pôles) et page dédiée
// ============================================================================

// Même expression que l'API : chemin interne, sans préfixe de langue ni lien court
const LANDING_PATH_RE = /^\/(?!\/)(?!(?:en|ar)(?:\/|$))(?!r\/)[^\s?#]*$/
const COLOR_RE = /^#[0-9a-fA-F]{6}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Nombre de pôles du service édité : s'il en a, il ne peut pas être rattaché. */
const childrenCount = computed(() =>
  props.serviceId ? props.services.filter(s => s.parent_id === props.serviceId).length : 0,
)

/** Parents proposables : premier niveau, même secteur, pas le service lui-même. */
const parentOptions = computed(() =>
  props.services
    .filter(s =>
      !s.parent_id
      && (s.sector_id || null) === (form.sector_id || null)
      && s.id !== props.serviceId,
    )
    .sort((a, b) => a.name.localeCompare(b.name)),
)

/** Changement de secteur par l'utilisateur : le parent d'un autre secteur est retiré. */
function onSectorChange() {
  const parentId = form.parent_id
  if (parentId && !parentOptions.value.some(s => s.id === parentId)) {
    form.parent_id = null
    parentResetNotice.value = true
  }
  else {
    parentResetNotice.value = false
  }
}

const isLandingPathInvalid = computed(() =>
  !!form.landing_path && !LANDING_PATH_RE.test(form.landing_path),
)

const sectorChangeBlocked = computed(() =>
  isEdit.value && childrenCount.value > 0 && form.sector_id !== initialSectorId.value,
)

// ============================================================================
// Responsables (utilisateurs actifs)
// ============================================================================

interface HeadCandidate {
  id: string
  name: string
  email: string
}
const headCandidates = ref<HeadCandidate[]>([])
const usersLoading = ref(true)
const usersLoadError = ref(false)

async function loadHeadCandidates() {
  usersLoading.value = true
  usersLoadError.value = false
  try {
    const response = await apiFetch<{
      items: Array<{
        id: string
        email: string
        first_name: string
        last_name: string
        salutation: string | null
      }>
    }>('/api/admin/users', {
      query: { limit: 100, active: true },
    })
    headCandidates.value = response.items
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.salutation
          ? `${user.salutation} ${user.first_name} ${user.last_name}`
          : `${user.first_name} ${user.last_name}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  catch (err) {
    console.error('Erreur chargement des candidats responsables:', err)
    usersLoadError.value = true
  }
  finally {
    usersLoading.value = false
  }
}

/** Responsable enregistré absent de la liste (inactif, ou au-delà des 100 premiers). */
const headOutOfList = computed(() =>
  !!form.head_external_id
  && !usersLoading.value
  && !headCandidates.value.some(c => c.id === form.head_external_id),
)

onMounted(loadHeadCandidates)

// ============================================================================
// Traduction automatique FR → EN / AR
// ============================================================================

const translating = ref(false)
const translateMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

async function handleTranslate() {
  translateMessage.value = null
  if (!form.name && !form.description_md && !form.mission_md) {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateNeedsFr') }
    return
  }
  translating.value = true
  try {
    const res = await translateService({
      name: form.name || null,
      description_html: form.description_html || null,
      description_md: form.description_md || null,
      mission_html: form.mission_html || null,
      mission_md: form.mission_md || null,
    })
    if (res.name_en != null) form.name_en = res.name_en
    if (res.name_ar != null) form.name_ar = res.name_ar
    if (res.description_en_html != null) form.description_html_en = res.description_en_html
    if (res.description_en_md != null) form.description_md_en = res.description_en_md
    if (res.description_ar_html != null) form.description_html_ar = res.description_ar_html
    if (res.description_ar_md != null) form.description_md_ar = res.description_ar_md
    if (res.mission_en_html != null) form.mission_html_en = res.mission_en_html
    if (res.mission_en_md != null) form.mission_md_en = res.mission_en_md
    if (res.mission_ar_html != null) form.mission_html_ar = res.mission_ar_html
    if (res.mission_ar_md != null) form.mission_md_ar = res.mission_ar_md
    translateMessage.value = { type: 'success', text: t('adminTranslate.translateSuccess') }
  }
  catch {
    translateMessage.value = { type: 'error', text: t('adminTranslate.translateError') }
  }
  finally {
    translating.value = false
  }
}

// ============================================================================
// Erreurs (validation locale + réponses de l'API)
// ============================================================================

const formError = ref('')
const fieldErrors = reactive<Record<string, string>>({})

function clearErrors() {
  formError.value = ''
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}

/** Onglet qui porte un champ donné. */
function tabOfField(field: string): FormTab {
  return /^(description|mission)/.test(field) ? 'presentation' : 'general'
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nom',
  sigle: 'Sigle',
  color: 'Couleur',
  sector_id: 'Secteur',
  parent_id: 'Service parent',
  landing_path: 'Page dédiée',
  head_external_id: 'Responsable',
  email: 'E-mail',
  phone: 'Téléphone',
}

/** Rattache un message d'erreur textuel (409 / 422 / 404) au champ concerné. */
function guessFieldFromMessage(message: string): string | null {
  const m = message.toLowerCase()
  if (m.includes('parent') || m.includes('pôle')) return 'parent_id'
  if (m.includes('secteur')) return 'sector_id'
  if (m.includes('page dédiée') || m.includes('chemin')) return 'landing_path'
  if (m.includes('sigle')) return 'sigle'
  if (m.includes('couleur')) return 'color'
  if (m.includes('mail')) return 'email'
  if (m.includes('nom')) return 'name'
  return null
}

function applyApiError(err: unknown): FormTab | null {
  const e = err as { status?: number, statusCode?: number, data?: { detail?: unknown }, message?: string }
  const status = e?.status ?? e?.statusCode
  const detail = e?.data?.detail
  let firstField: string | null = null

  if (Array.isArray(detail)) {
    // 422 de validation Pydantic : [{ loc: ['body', 'landing_path'], msg: '…' }]
    const messages: string[] = []
    for (const item of detail as Array<{ loc?: unknown[], msg?: string }>) {
      const msg = (item?.msg || '').replace(/^Value error,\s*/i, '')
      const loc = Array.isArray(item?.loc) ? item.loc : []
      const field = typeof loc[loc.length - 1] === 'string' ? loc[loc.length - 1] as string : null
      if (field && field !== 'body') {
        fieldErrors[field] = msg || 'Valeur invalide'
        firstField ??= field
        messages.push(`${FIELD_LABELS[field] || field} : ${msg}`)
      }
      else if (msg) {
        messages.push(msg)
      }
    }
    formError.value = messages.length
      ? `Certaines valeurs sont invalides. ${messages.join(' ; ')}`
      : 'Certaines valeurs sont invalides.'
  }
  else if (typeof detail === 'string' && detail) {
    formError.value = detail
    const field = guessFieldFromMessage(detail)
    if (field) {
      fieldErrors[field] = detail
      firstField = field
    }
  }
  else if (status === 403) {
    formError.value = 'Vous n\'avez pas les droits nécessaires pour enregistrer ce service.'
  }
  else if (status === 404) {
    formError.value = 'Ce service n\'existe plus : il a peut-être été supprimé entre-temps.'
  }
  else {
    formError.value = 'Erreur lors de l\'enregistrement du service. Veuillez réessayer.'
  }

  return firstField ? tabOfField(firstField) : null
}

function validate(): boolean {
  clearErrors()
  if (!form.sector_id) fieldErrors.sector_id = 'Le secteur est requis.'
  if (!form.name.trim()) fieldErrors.name = 'Le nom est requis.'
  if (isLandingPathInvalid.value) {
    fieldErrors.landing_path = 'Chemin invalide : il doit commencer par « / », sans préfixe de langue (/en, /ar), sans « /r/ », ni espace, « ? » ou « # ».'
  }
  if (form.color && !COLOR_RE.test(form.color)) {
    fieldErrors.color = 'Couleur invalide : format attendu #RRGGBB.'
  }
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
    fieldErrors.email = 'Adresse e-mail invalide.'
  }
  const fields = Object.keys(fieldErrors)
  if (fields.length > 0) {
    formError.value = 'Veuillez corriger les champs signalés avant d\'enregistrer.'
    emit('request-tab', tabOfField(fields[0]!))
    return false
  }
  return true
}

// ============================================================================
// Enregistrement
// ============================================================================

const isSaving = ref(false)

async function save(): Promise<boolean> {
  if (props.disabled || isSaving.value) return false
  if (!validate()) return false

  isSaving.value = true
  try {
    const payload = buildPayload()
    if (props.serviceId) {
      await updateService(props.serviceId, payload)
      // Nouveau point de référence : la page recharge ensuite le service
      snapshot.value = JSON.stringify(payload)
      emit('saved', { id: props.serviceId, created: false })
    }
    else {
      const res = await createService({ ...payload, name: payload.name || '' })
      snapshot.value = JSON.stringify(payload)
      emit('saved', { id: res.id, created: true })
    }
    return true
  }
  catch (err) {
    console.error('Erreur lors de l\'enregistrement du service:', err)
    const tab = applyApiError(err)
    if (tab) emit('request-tab', tab)
    return false
  }
  finally {
    isSaving.value = false
  }
}

onMounted(() => {
  snapshot.value = JSON.stringify(buildPayload())
  initialSectorId.value = form.sector_id
})

defineExpose({ save, isSaving, isDirty, form })

// Classes partagées
const inputClass = 'w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:bg-gray-700 dark:text-white disabled:cursor-not-allowed disabled:opacity-60'
const inputBorder = (field: string) => fieldErrors[field]
  ? 'border-red-500 dark:border-red-500'
  : 'border-gray-300 dark:border-gray-600'
const labelClass = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
</script>

<template>
  <fieldset :disabled="disabled" class="min-w-0">
    <legend class="sr-only">
      {{ isEdit ? 'Modifier le service' : 'Nouveau service' }}
    </legend>

    <!-- Erreur globale (validation ou API), visible sur les deux volets -->
    <div
      v-if="formError"
      role="alert"
      class="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
    >
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{{ formError }}</span>
    </div>

    <!-- ================================================================ -->
    <!-- Volet « Général »                                                -->
    <!-- ================================================================ -->
    <div v-show="tab === 'general'" class="space-y-6">
      <!-- Rattachement -->
      <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'sitemap']" class="h-4 w-4 text-gray-400" />
          Rattachement
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Secteur -->
          <div>
            <label for="service-sector" :class="labelClass">
              Secteur <span class="text-red-500">*</span>
            </label>
            <select
              id="service-sector"
              v-model="form.sector_id"
              :class="[inputClass, inputBorder('sector_id')]"
              :aria-invalid="!!fieldErrors.sector_id"
              @change="onSectorChange"
            >
              <option value="">
                Sélectionner un secteur
              </option>
              <option v-for="sector in sectors" :key="sector.id" :value="sector.id">
                {{ sector.name }} ({{ sector.code }})
              </option>
            </select>
            <p v-if="fieldErrors.sector_id" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ fieldErrors.sector_id }}
            </p>
            <p v-else-if="sectorChangeBlocked" class="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Ce service a {{ childrenCount }} pôle(s) : déplacez-les ou détachez-les d'abord, sinon l'enregistrement sera refusé.
            </p>
          </div>

          <!-- Service parent (pôle) -->
          <div>
            <label for="service-parent" :class="labelClass">
              Service parent
            </label>
            <select
              id="service-parent"
              v-model="form.parent_id"
              :disabled="childrenCount > 0"
              :class="[inputClass, inputBorder('parent_id')]"
              :aria-invalid="!!fieldErrors.parent_id"
              aria-describedby="service-parent-help"
            >
              <option :value="null">
                Aucun (service de premier niveau)
              </option>
              <option v-for="option in parentOptions" :key="option.id" :value="option.id">
                {{ option.sigle ? `${option.sigle} · ${option.name}` : option.name }}
              </option>
            </select>
            <p v-if="fieldErrors.parent_id" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ fieldErrors.parent_id }}
            </p>
            <p v-else-if="childrenCount > 0" id="service-parent-help" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Ce service a {{ childrenCount }} pôle(s) : il ne peut pas être rattaché à un autre service.
            </p>
            <p v-else-if="parentResetNotice" id="service-parent-help" class="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Le service parent a été retiré : il n'appartient pas au secteur choisi.
            </p>
            <p v-else id="service-parent-help" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Choisir un parent fait de ce service un pôle (un seul niveau, même secteur).
            </p>
          </div>

          <!-- Page dédiée -->
          <div class="md:col-span-2">
            <label for="service-landing-path" :class="labelClass">
              Page dédiée (facultatif)
            </label>
            <input
              id="service-landing-path"
              v-model.trim="form.landing_path"
              type="text"
              maxlength="255"
              :class="[inputClass, 'font-mono text-sm', (isLandingPathInvalid || fieldErrors.landing_path) ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600']"
              placeholder="/entrepreneuriat"
              :aria-invalid="isLandingPathInvalid || !!fieldErrors.landing_path"
              aria-describedby="service-landing-path-help"
            />
            <p v-if="isLandingPathInvalid" class="mt-1 text-xs text-red-600 dark:text-red-400">
              Chemin invalide : il doit commencer par « / », sans préfixe de langue (/en, /ar), sans « /r/ », ni espace, « ? » ou « # ».
            </p>
            <p v-else-if="fieldErrors.landing_path" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ fieldErrors.landing_path }}
            </p>
            <p id="service-landing-path-help" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Chemin interne sans préfixe de langue. Si renseigné, la carte du service dans l'organigramme mène à cette page.
            </p>
          </div>
        </div>
      </section>

      <!-- Identité -->
      <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'id-card']" class="h-4 w-4 text-gray-400" />
          Identité
        </h2>
        <div class="space-y-4">
          <!-- Nom -->
          <div>
            <label for="service-name" :class="labelClass">
              Nom <span class="text-red-500">*</span>
            </label>
            <input
              id="service-name"
              v-model="form.name"
              type="text"
              maxlength="255"
              :class="[inputClass, inputBorder('name')]"
              placeholder="Ex. : Service de la scolarité"
              :aria-invalid="!!fieldErrors.name"
            />
            <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ fieldErrors.name }}
            </p>
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
                <font-awesome-icon :icon="['fas', translating ? 'spinner' : 'language']" :class="{ 'animate-spin': translating }" />
                {{ translating ? t('adminTranslate.translating') : t('adminTranslate.translate') }}
              </button>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                {{ t('adminTranslate.translateHint') }}
              </p>
            </div>
            <p
              v-if="translateMessage"
              class="text-xs"
              :class="translateMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'"
            >
              {{ translateMessage.text }}
            </p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label for="service-name-en" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nom (EN)</label>
                <input
                  id="service-name-en"
                  v-model="form.name_en"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label for="service-name-ar" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">الاسم (AR)</label>
                <input
                  id="service-name-ar"
                  v-model="form.name_ar"
                  type="text"
                  dir="rtl"
                  class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Les traductions EN/AR de la description et de la mission apparaissent dans les onglets de leurs éditeurs (onglet « Présentation »).
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <!-- Sigle -->
            <div>
              <label for="service-sigle" :class="labelClass">
                Sigle / abréviation
              </label>
              <input
                id="service-sigle"
                v-model="form.sigle"
                type="text"
                maxlength="50"
                :class="[inputClass, inputBorder('sigle')]"
                placeholder="Ex. : SS, DRI, SG…"
              />
              <p v-if="fieldErrors.sigle" class="mt-1 text-xs text-red-600 dark:text-red-400">
                {{ fieldErrors.sigle }}
              </p>
            </div>

            <!-- Couleur -->
            <div>
              <label for="service-color" :class="labelClass">
                Couleur
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model="form.color"
                  type="color"
                  aria-label="Choisir la couleur"
                  class="h-10 w-10 flex-shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-700"
                />
                <input
                  id="service-color"
                  v-model.trim="form.color"
                  type="text"
                  maxlength="7"
                  :class="[inputClass, inputBorder('color'), 'min-w-0 flex-1 font-mono text-sm']"
                  placeholder="#000000"
                />
                <button
                  v-if="form.color"
                  type="button"
                  class="rounded-lg p-2 text-gray-400 transition-colors hover:text-red-500"
                  title="Effacer la couleur"
                  aria-label="Effacer la couleur"
                  @click="form.color = ''"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
                </button>
              </div>
              <p v-if="fieldErrors.color" class="mt-1 text-xs text-red-600 dark:text-red-400">
                {{ fieldErrors.color }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Responsable et contact -->
      <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'address-card']" class="h-4 w-4 text-gray-400" />
          Responsable et contact
        </h2>
        <div class="space-y-4">
          <!-- Responsable -->
          <div>
            <label for="service-head" :class="labelClass">
              Responsable
            </label>
            <select
              id="service-head"
              v-model="form.head_external_id"
              :class="[inputClass, inputBorder('head_external_id')]"
            >
              <option value="">
                Aucun responsable
              </option>
              <option v-if="headOutOfList" :value="form.head_external_id">
                Responsable actuel (absent de la liste des utilisateurs actifs)
              </option>
              <option v-for="candidate in headCandidates" :key="candidate.id" :value="candidate.id">
                {{ candidate.name }} ({{ candidate.email }})
              </option>
            </select>
            <p v-if="usersLoadError" class="mt-1 text-xs text-red-600 dark:text-red-400">
              <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="me-1" />
              Impossible de charger la liste des utilisateurs.
            </p>
            <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Utilisateur actif de la plateforme, affiché comme responsable sur la fiche publique.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <!-- E-mail -->
            <div>
              <label for="service-email" :class="labelClass">
                E-mail de contact
              </label>
              <input
                id="service-email"
                v-model="form.email"
                type="email"
                :class="[inputClass, inputBorder('email')]"
                placeholder="service@usenghor.org"
                :aria-invalid="!!fieldErrors.email"
              />
              <p v-if="fieldErrors.email" class="mt-1 text-xs text-red-600 dark:text-red-400">
                {{ fieldErrors.email }}
              </p>
            </div>

            <!-- Téléphone -->
            <div>
              <label for="service-phone" :class="labelClass">
                Téléphone
              </label>
              <input
                id="service-phone"
                v-model="form.phone"
                type="tel"
                :class="[inputClass, inputBorder('phone')]"
                placeholder="+20 3 xxx xxxx"
              />
              <p v-if="fieldErrors.phone" class="mt-1 text-xs text-red-600 dark:text-red-400">
                {{ fieldErrors.phone }}
              </p>
            </div>
          </div>

          <!-- Statut : seulement à la création (en édition, badge de l'en-tête) -->
          <div v-if="!isEdit" class="flex items-start gap-3">
            <input
              id="service-active"
              v-model="form.active"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-gray-300 bg-white text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <div>
              <label for="service-active" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Service actif
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Les services inactifs n'apparaissent pas sur le site public.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Emplacement libre sous le volet « Général » (ex. liste des pôles) -->
      <slot name="general-after" />
    </div>

    <!-- ================================================================ -->
    <!-- Volet « Présentation »                                           -->
    <!-- ================================================================ -->
    <div v-show="tab === 'presentation'" class="space-y-6">
      <div class="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
        <button
          type="button"
          :disabled="translating"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          @click="handleTranslate"
        >
          <font-awesome-icon :icon="['fas', translating ? 'spinner' : 'language']" :class="{ 'animate-spin': translating }" />
          {{ translating ? t('adminTranslate.translating') : t('adminTranslate.translate') }}
        </button>
        <p class="flex-1 text-xs text-gray-600 dark:text-gray-400">
          Traduit le nom, la description et la mission (FR → EN / AR). Relisez ensuite les onglets EN et AR de chaque éditeur.
        </p>
        <p
          v-if="translateMessage"
          class="w-full text-xs"
          :class="translateMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'"
        >
          {{ translateMessage.text }}
        </p>
      </div>

      <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-1 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'align-left']" class="h-4 w-4 text-gray-400" />
          Description
        </h2>
        <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Présentation du service affichée en tête de sa fiche publique.
        </p>
        <AdminRichTextEditor
          v-model="form.description_md"
          v-model:html-value="form.description_html"
          v-model:model-value-en="form.description_md_en"
          v-model:html-value-en="form.description_html_en"
          v-model:model-value-ar="form.description_md_ar"
          v-model:html-value-ar="form.description_html_ar"
          placeholder="Description du service…"
          :show-card="false"
          height="300px"
        />
        <p v-if="fieldErrors.description_html || fieldErrors.description_md" class="mt-1 text-xs text-red-600 dark:text-red-400">
          {{ fieldErrors.description_html || fieldErrors.description_md }}
        </p>
      </section>

      <section class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-1 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'bullseye']" class="h-4 w-4 text-gray-400" />
          Mission
        </h2>
        <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Mission et rôle du service au sein de l'Université.
        </p>
        <AdminRichTextEditor
          v-model="form.mission_md"
          v-model:html-value="form.mission_html"
          v-model:model-value-en="form.mission_md_en"
          v-model:html-value-en="form.mission_html_en"
          v-model:model-value-ar="form.mission_md_ar"
          v-model:html-value-ar="form.mission_html_ar"
          placeholder="Mission du service…"
          :show-card="false"
          height="300px"
        />
        <p v-if="fieldErrors.mission_html || fieldErrors.mission_md" class="mt-1 text-xs text-red-600 dark:text-red-400">
          {{ fieldErrors.mission_html || fieldErrors.mission_md }}
        </p>
      </section>
    </div>
  </fieldset>
</template>
