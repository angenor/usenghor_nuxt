<script setup lang="ts">
/**
 * Onglet « Projets » de la fiche admin d'un service (projets internes).
 *
 * Cartes : couverture (recadrage 16:9, dossier média « service-projects »), titre,
 * statut, extrait, barre d'avancement, dates de début et de fin prévue.
 * Émet `count` après le chargement et après chaque création / suppression.
 */
import type { ProjectStatus, ServiceProjectRead } from '~/composables/useServicesApi'

const props = defineProps<{
  serviceId: string
}>()

const emit = defineEmits<{
  count: [value: number]
}>()

const {
  getServiceProjects,
  createServiceProject,
  updateServiceProject,
  deleteServiceProject,
  translateServiceProject,
  projectStatusLabels,
  projectStatusColors,
} = useServicesApi()

const { getMediaUrl } = useMediaApi()

const statusOrder: ProjectStatus[] = ['planned', 'ongoing', 'completed', 'suspended']

const uid = useId()
const headingId = `service-projects-heading-${uid}`
const ids = {
  status: `service-project-status-${uid}`,
  progress: `service-project-progress-${uid}`,
  progressNumber: `service-project-progress-number-${uid}`,
  start: `service-project-start-${uid}`,
  end: `service-project-end-${uid}`,
  endError: `service-project-end-error-${uid}`,
}

// =============================================================================
// Chargement
// =============================================================================

const items = ref<ServiceProjectRead[]>([])
const loading = ref(false)
const loaded = ref(false)
const loadError = ref<string | null>(null)
const notice = ref<{ type: 'success' | 'error', text: string } | null>(null)
const brokenImages = ref(new Set<string>())

function errorMessage(e: unknown, fallback: string): string {
  const detail = (e as { data?: { detail?: unknown } } | null)?.data?.detail
  return typeof detail === 'string' && detail.trim() ? detail : fallback
}

let loadToken = 0

async function load() {
  const token = ++loadToken
  loading.value = true
  loadError.value = null
  try {
    const data = await getServiceProjects(props.serviceId)
    if (token !== loadToken) return
    items.value = data
    loaded.value = true
    emit('count', items.value.length)
  }
  catch (e) {
    if (token !== loadToken) return
    console.error('Erreur chargement projets :', e)
    loadError.value = errorMessage(e, 'Impossible de charger les projets du service.')
  }
  finally {
    if (token === loadToken) loading.value = false
  }
}

onMounted(load)

watch(() => props.serviceId, () => {
  items.value = []
  loaded.value = false
  notice.value = null
  load()
})

/** Date « AAAA-MM-JJ » affichée sans décalage de fuseau. */
function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function clampProgress(value: unknown): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
}

function progressBarClass(status: ProjectStatus): string {
  if (status === 'completed') return 'bg-green-500'
  if (status === 'suspended') return 'bg-gray-400 dark:bg-gray-500'
  if (status === 'planned') return 'bg-blue-500'
  return 'bg-brand-red-500'
}

function coverUrl(item: ServiceProjectRead): string | null {
  if (!item.cover_image_external_id || brokenImages.value.has(item.id)) return null
  return getMediaUrl(item.cover_image_external_id)
}

function markBroken(id: string) {
  brokenImages.value = new Set(brokenImages.value).add(id)
}

// =============================================================================
// Formulaire (création / modification)
// =============================================================================

interface ProjectForm {
  title: string
  title_en: string
  title_ar: string
  description_md: string
  description_html: string
  description_en_md: string
  description_en_html: string
  description_ar_md: string
  description_ar_html: string
  status: ProjectStatus
  progress: number
  start_date: string
  expected_end_date: string
  cover_image_external_id: string | null
}

function emptyForm(): ProjectForm {
  return {
    title: '',
    title_en: '',
    title_ar: '',
    description_md: '',
    description_html: '',
    description_en_md: '',
    description_en_html: '',
    description_ar_md: '',
    description_ar_html: '',
    status: 'planned',
    progress: 0,
    start_date: '',
    expected_end_date: '',
    cover_image_external_id: null,
  }
}

function formFromItem(item: ServiceProjectRead): ProjectForm {
  return {
    title: item.title || '',
    title_en: item.title_en || '',
    title_ar: item.title_ar || '',
    description_md: item.description_md || '',
    description_html: item.description_html || '',
    description_en_md: item.description_en_md || '',
    description_en_html: item.description_en_html || '',
    description_ar_md: item.description_ar_md || '',
    description_ar_html: item.description_ar_html || '',
    status: item.status || 'planned',
    progress: clampProgress(item.progress),
    start_date: item.start_date ? item.start_date.slice(0, 10) : '',
    expected_end_date: item.expected_end_date ? item.expected_end_date.slice(0, 10) : '',
    cover_image_external_id: item.cover_image_external_id || null,
  }
}

function htmlHasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim().length > 0
}

/**
 * Champs texte envoyés à l'API (une description vide est envoyée à `null`).
 * Un HTML sans Markdown (donnée ancienne) est conservé tel quel.
 */
function textPayload(f: ProjectForm) {
  const rich = (md: string, html: string) => {
    if (md.trim()) return { md, html: html || null }
    return htmlHasText(html) ? { md: null, html } : { md: null, html: null }
  }
  const fr = rich(f.description_md, f.description_html)
  const en = rich(f.description_en_md, f.description_en_html)
  const ar = rich(f.description_ar_md, f.description_ar_html)
  return {
    title: f.title.trim(),
    title_en: f.title_en.trim() || null,
    title_ar: f.title_ar.trim() || null,
    description_md: fr.md,
    description_html: fr.html,
    description_en_md: en.md,
    description_en_html: en.html,
    description_ar_md: ar.md,
    description_ar_html: ar.html,
  }
}

const formOpen = ref(false)
const editing = ref<ServiceProjectRead | null>(null)
const form = ref<ProjectForm>(emptyForm())
const formSnapshot = ref('')
const saving = ref(false)
const uploadingImage = ref(false)
const formError = ref<string | null>(null)
const titleError = ref<string | null>(null)

const endDateError = computed(() => {
  const { start_date: start, expected_end_date: end } = form.value
  return start && end && end < start ? 'La fin prévue ne peut pas précéder la date de début.' : null
})

/** Proposer 100 % quand le projet passe à « Terminé ». */
const suggestFullProgress = computed(() => form.value.status === 'completed' && form.value.progress < 100)

watch(() => form.value.title, (value) => {
  if (value.trim()) titleError.value = null
})

function onProgressInput(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.value === '') return
  form.value.progress = clampProgress(input.value)
}

function onProgressBlur(event: Event) {
  const input = event.target as HTMLInputElement
  form.value.progress = clampProgress(input.value)
  input.value = String(form.value.progress)
}

function openForm(item?: ServiceProjectRead) {
  editing.value = item ?? null
  form.value = item ? formFromItem(item) : emptyForm()
  formSnapshot.value = JSON.stringify(form.value)
  formError.value = null
  titleError.value = null
  formOpen.value = true
}

function closeForm(force = false) {
  if (saving.value || uploadingImage.value) return
  if (!force && JSON.stringify(form.value) !== formSnapshot.value
    && !window.confirm('Des modifications ne sont pas enregistrées. Fermer quand même ?')) {
    return
  }
  formOpen.value = false
  editing.value = null
}

async function save() {
  formError.value = null
  let valid = true
  if (!form.value.title.trim()) {
    titleError.value = 'Le titre en français est obligatoire.'
    valid = false
  }
  if (endDateError.value) valid = false
  if (!valid || uploadingImage.value) return

  saving.value = true
  try {
    const payload = {
      ...textPayload(form.value),
      status: form.value.status,
      progress: clampProgress(form.value.progress),
      start_date: form.value.start_date || null,
      expected_end_date: form.value.expected_end_date || null,
      cover_image_external_id: form.value.cover_image_external_id || null,
    }
    if (editing.value) {
      const editedId = editing.value.id
      const updated = await updateServiceProject(props.serviceId, editedId, payload)
      items.value = items.value.map(item => (item.id === updated.id ? updated : item))
      const next = new Set(brokenImages.value)
      next.delete(editedId)
      brokenImages.value = next
      notice.value = { type: 'success', text: `Projet « ${updated.title} » mis à jour.` }
    }
    else {
      const created = await createServiceProject(props.serviceId, payload)
      items.value = [created, ...items.value]
      emit('count', items.value.length)
      notice.value = { type: 'success', text: `Projet « ${created.title} » ajouté.` }
    }
    saving.value = false
    closeForm(true)
  }
  catch (e) {
    console.error('Erreur enregistrement projet :', e)
    formError.value = errorMessage(e, 'L\'enregistrement a échoué. Vérifiez les champs puis réessayez.')
  }
  finally {
    saving.value = false
  }
}

// =============================================================================
// Suppression
// =============================================================================

const deleting = ref<ServiceProjectRead | null>(null)
const deleteBusy = ref(false)
const deleteError = ref<string | null>(null)

function askDelete(item: ServiceProjectRead) {
  deleting.value = item
  deleteError.value = null
}

function closeDelete() {
  if (deleteBusy.value) return
  deleting.value = null
}

async function confirmDelete() {
  const target = deleting.value
  if (!target) return
  deleteBusy.value = true
  deleteError.value = null
  try {
    await deleteServiceProject(props.serviceId, target.id)
    items.value = items.value.filter(item => item.id !== target.id)
    emit('count', items.value.length)
    notice.value = { type: 'success', text: `Projet « ${target.title} » supprimé.` }
    deleteBusy.value = false
    closeDelete()
  }
  catch (e) {
    console.error('Erreur suppression projet :', e)
    deleteError.value = errorMessage(e, 'La suppression a échoué. Réessayez.')
  }
  finally {
    deleteBusy.value = false
  }
}

const fieldClass = 'w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-red-500 disabled:opacity-60 dark:bg-gray-700 dark:text-white'
const actionButtonClass = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-gray-400 dark:hover:bg-gray-700'
</script>

<template>
  <section class="space-y-5" :aria-labelledby="headingId">
    <AdminOrganisationServiceItemSectionHeader
      icon="list-check"
      title="Projets"
      description="Les projets internes du service, avec leur statut et leur avancement."
      add-label="Ajouter un projet"
      tone="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      :heading-id="headingId"
      :count="loaded ? items.length : null"
      :add-disabled="!loaded"
      @add="openForm()"
    />

    <AdminOrganisationServiceItemNotice :notice="notice" @dismiss="notice = null" />

    <!-- Chargement -->
    <div v-if="loading && !loaded" class="space-y-3" role="status" aria-label="Chargement des projets">
      <div
        v-for="n in 2"
        :key="n"
        class="flex animate-pulse gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="hidden aspect-video w-40 rounded-lg bg-gray-200 sm:block dark:bg-gray-700" />
        <div class="flex-1 space-y-3">
          <div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-700/60" />
          <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <span class="sr-only">Chargement des projets…</span>
    </div>

    <!-- Erreur de chargement -->
    <div
      v-else-if="loadError && !loaded"
      role="alert"
      class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
    >
      <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <p class="flex-1">{{ loadError }}</p>
      <button
        type="button"
        class="inline-flex items-center gap-2 self-start rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:self-auto dark:border-red-800 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-900/30"
        @click="load"
      >
        <font-awesome-icon :icon="['fas', 'rotate-right']" class="h-3.5 w-3.5" aria-hidden="true" />
        Réessayer
      </button>
    </div>

    <!-- État vide -->
    <AdminOrganisationServiceItemEmptyState
      v-else-if="loaded && !items.length"
      icon="list-check"
      title="Aucun projet en cours de suivi"
      text="Suivez les chantiers du service : statut, avancement et échéances, visibles d'un coup d'œil."
      action-label="Créer le premier projet"
      tone="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      @action="openForm()"
    />

    <!-- Cartes -->
    <ul v-else-if="loaded" class="space-y-3" :aria-labelledby="headingId">
      <li
        v-for="project in items"
        :key="project.id"
        class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md sm:flex-row dark:border-gray-700 dark:bg-gray-800"
      >
        <!-- Couverture -->
        <div class="aspect-video w-full flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-44 dark:bg-gray-700">
          <img
            v-if="coverUrl(project)"
            :src="coverUrl(project) ?? undefined"
            alt=""
            loading="lazy"
            class="h-full w-full object-cover"
            @error="markBroken(project.id)"
          >
          <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100 dark:from-orange-900/20 dark:to-gray-800">
            <font-awesome-icon :icon="['fas', 'list-check']" class="h-7 w-7 text-orange-300 dark:text-orange-700" aria-hidden="true" />
          </div>
        </div>

        <div class="flex min-w-0 flex-1 flex-col">
          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="break-words font-semibold text-gray-900 dark:text-white">
                  {{ project.title }}
                </h3>
                <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', projectStatusColors[project.status]]">
                  {{ projectStatusLabels[project.status] ?? project.status }}
                </span>
                <AdminOrganisationServiceItemI18nBadges :item="project" />
              </div>
              <AdminOrganisationServiceItemExcerpt
                class="mt-1"
                :html="project.description_html"
                :md="project.description_md"
              />
            </div>
            <div class="flex flex-shrink-0 items-center">
              <button
                type="button"
                :class="[actionButtonClass, 'hover:text-blue-600 dark:hover:text-blue-400']"
                :aria-label="`Modifier « ${project.title} »`"
                title="Modifier"
                @click="openForm(project)"
              >
                <font-awesome-icon :icon="['fas', 'pen']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                :class="[actionButtonClass, 'hover:text-red-600 dark:hover:text-red-400']"
                :aria-label="`Supprimer « ${project.title} »`"
                title="Supprimer"
                @click="askDelete(project)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Avancement -->
          <div class="mt-3">
            <div class="flex items-center justify-between text-xs">
              <span :id="`${headingId}-progress-${project.id}`" class="text-gray-500 dark:text-gray-400">Avancement</span>
              <span class="font-semibold tabular-nums text-gray-900 dark:text-white">{{ clampProgress(project.progress) }} %</span>
            </div>
            <div
              class="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="clampProgress(project.progress)"
              :aria-labelledby="`${headingId}-progress-${project.id}`"
            >
              <div
                class="h-full rounded-full transition-all"
                :class="progressBarClass(project.status)"
                :style="{ width: `${clampProgress(project.progress)}%` }"
              />
            </div>
          </div>

          <!-- Dates -->
          <div
            v-if="project.start_date || project.expected_end_date"
            class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400"
          >
            <span v-if="project.start_date" class="inline-flex items-center gap-1.5">
              <font-awesome-icon :icon="['fas', 'calendar-days']" class="h-3 w-3" aria-hidden="true" />
              Début : <time :datetime="project.start_date.slice(0, 10)">{{ formatDate(project.start_date) }}</time>
            </span>
            <span v-if="project.expected_end_date" class="inline-flex items-center gap-1.5">
              <font-awesome-icon :icon="['fas', 'flag-checkered']" class="h-3 w-3" aria-hidden="true" />
              Fin prévue : <time :datetime="project.expected_end_date.slice(0, 10)">{{ formatDate(project.expected_end_date) }}</time>
            </span>
          </div>
        </div>
      </li>
    </ul>

    <!-- Formulaire -->
    <AdminOrganisationServiceItemModal
      :open="formOpen"
      :title="editing ? 'Modifier le projet' : 'Nouveau projet'"
      as-form
      :busy="saving || uploadingImage"
      @close="closeForm()"
      @submit="save"
    >
      <p
        v-if="formError"
        role="alert"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
      >
        {{ formError }}
      </p>

      <div class="space-y-5">
        <AdminOrganisationServiceItemTextFields
          v-model:title="form.title"
          v-model:title-en="form.title_en"
          v-model:title-ar="form.title_ar"
          v-model:description-md="form.description_md"
          v-model:description-html="form.description_html"
          v-model:description-en-md="form.description_en_md"
          v-model:description-en-html="form.description_en_html"
          v-model:description-ar-md="form.description_ar_md"
          v-model:description-ar-html="form.description_ar_html"
          :translate="translateServiceProject"
          title-placeholder="Ex. : Digitalisation des processus d'inscription"
          description-placeholder="Objectifs, périmètre, partenaires du projet…"
          :title-error="titleError"
          :disabled="saving"
        />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Statut -->
          <div>
            <label :for="ids.status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
            <select
              :id="ids.status"
              v-model="form.status"
              :disabled="saving"
              :class="[fieldClass, 'border-gray-300 dark:border-gray-600']"
            >
              <option v-for="status in statusOrder" :key="status" :value="status">
                {{ projectStatusLabels[status] }}
              </option>
            </select>
          </div>

          <!-- Avancement -->
          <div>
            <label :for="ids.progress" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Avancement</label>
            <div class="flex items-center gap-3">
              <input
                :id="ids.progress"
                v-model.number="form.progress"
                type="range"
                min="0"
                max="100"
                step="5"
                :aria-valuetext="`${form.progress} %`"
                :disabled="saving"
                class="h-2 min-w-0 flex-1 cursor-pointer accent-brand-red-600 disabled:cursor-not-allowed"
              >
              <div class="relative w-20 flex-shrink-0">
                <label :for="ids.progressNumber" class="sr-only">Avancement en pourcentage</label>
                <input
                  :id="ids.progressNumber"
                  :value="form.progress"
                  type="number"
                  inputmode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  :disabled="saving"
                  :class="[fieldClass, 'border-gray-300 py-1.5 pr-7 text-right tabular-nums dark:border-gray-600']"
                  @input="onProgressInput"
                  @blur="onProgressBlur"
                >
                <span class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-gray-500 dark:text-gray-400" aria-hidden="true">%</span>
              </div>
            </div>
            <button
              v-if="suggestFullProgress"
              type="button"
              class="mt-1.5 text-xs font-medium text-brand-red-600 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 dark:text-brand-red-400"
              @click="form.progress = 100"
            >
              Projet terminé : passer l'avancement à 100 %
            </button>
          </div>

          <!-- Dates -->
          <div>
            <label :for="ids.start" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
            <input
              :id="ids.start"
              v-model="form.start_date"
              type="date"
              :disabled="saving"
              :class="[fieldClass, 'border-gray-300 dark:border-gray-600']"
            >
          </div>
          <div>
            <label :for="ids.end" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Fin prévue</label>
            <input
              :id="ids.end"
              v-model="form.expected_end_date"
              type="date"
              :min="form.start_date || undefined"
              :aria-invalid="endDateError ? 'true' : undefined"
              :aria-describedby="endDateError ? ids.endError : undefined"
              :disabled="saving"
              :class="[fieldClass, endDateError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600']"
            >
            <p v-if="endDateError" :id="ids.endError" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ endDateError }}
            </p>
          </div>
        </div>

        <AdminOrganisationServiceItemCoverImageField
          v-model="form.cover_image_external_id"
          v-model:uploading="uploadingImage"
          folder="service-projects"
          hint="Illustre le projet sur sa carte (format 16:9, recadrage proposé après le choix du fichier)."
          :disabled="saving"
        />
      </div>

      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          :disabled="saving || uploadingImage"
          @click="closeForm()"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
          :disabled="saving || uploadingImage || !!endDateError"
        >
          <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
          {{ saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter le projet' }}
        </button>
      </template>
    </AdminOrganisationServiceItemModal>

    <!-- Suppression -->
    <AdminOrganisationServiceItemDeleteModal
      :open="!!deleting"
      item-label="le projet"
      :item-title="deleting?.title"
      :busy="deleteBusy"
      :error="deleteError"
      @close="closeDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>
