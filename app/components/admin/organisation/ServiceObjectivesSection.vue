<script setup lang="ts">
/**
 * Onglet « Objectifs » de la fiche admin d'un service.
 *
 * Liste ordonnée (glisser-déposer via la poignée, ou boutons monter / descendre au
 * clavier) ; l'ordre est persisté par `reorderServiceObjectives` avec la liste
 * complète des identifiants, et rétabli si l'enregistrement échoue.
 * Émet `count` après le chargement et après chaque création / suppression.
 */
import { VueDraggable } from 'vue-draggable-plus'
import type {
  ServiceObjectiveCreate,
  ServiceObjectiveRead,
} from '~/composables/useServicesApi'

const props = defineProps<{
  serviceId: string
}>()

const emit = defineEmits<{
  count: [value: number]
}>()

const {
  getServiceObjectives,
  createServiceObjective,
  updateServiceObjective,
  deleteServiceObjective,
  reorderServiceObjectives,
  translateServiceObjective,
} = useServicesApi()

const uid = useId()
const headingId = `service-objectives-heading-${uid}`

// =============================================================================
// Chargement
// =============================================================================

const items = ref<ServiceObjectiveRead[]>([])
const loading = ref(false)
const loaded = ref(false)
const loadError = ref<string | null>(null)
const notice = ref<{ type: 'success' | 'error', text: string } | null>(null)

function errorMessage(e: unknown, fallback: string): string {
  const detail = (e as { data?: { detail?: unknown } } | null)?.data?.detail
  return typeof detail === 'string' && detail.trim() ? detail : fallback
}

function byOrder(list: ServiceObjectiveRead[]): ServiceObjectiveRead[] {
  return [...list].sort((a, b) => a.display_order - b.display_order)
}

let loadToken = 0

async function load() {
  const token = ++loadToken
  loading.value = true
  loadError.value = null
  try {
    const data = await getServiceObjectives(props.serviceId)
    if (token !== loadToken) return
    items.value = byOrder(data)
    loaded.value = true
    emit('count', items.value.length)
  }
  catch (e) {
    if (token !== loadToken) return
    console.error('Erreur chargement objectifs :', e)
    loadError.value = errorMessage(e, 'Impossible de charger les objectifs du service.')
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

// =============================================================================
// Réordonnancement (glisser-déposer + clavier)
// =============================================================================

const reordering = ref(false)
const announcement = ref('')
let dragSnapshot: ServiceObjectiveRead[] = []

function sameOrder(a: ServiceObjectiveRead[], b: ServiceObjectiveRead[]): boolean {
  return a.length === b.length && a.every((item, i) => item.id === b[i]?.id)
}

async function persistOrder(previous: ServiceObjectiveRead[]) {
  if (sameOrder(previous, items.value)) return
  reordering.value = true
  try {
    const result = await reorderServiceObjectives(props.serviceId, items.value.map(item => item.id))
    if (Array.isArray(result) && result.length === items.value.length) {
      items.value = byOrder(result)
    }
    notice.value = { type: 'success', text: 'Nouvel ordre des objectifs enregistré.' }
  }
  catch (e) {
    console.error('Erreur réordonnancement objectifs :', e)
    items.value = previous
    notice.value = {
      type: 'error',
      text: `${errorMessage(e, 'L\'ordre n\'a pas pu être enregistré.')} L'ordre précédent a été rétabli.`,
    }
    announcement.value = 'Échec de l\'enregistrement : l\'ordre précédent a été rétabli.'
  }
  finally {
    reordering.value = false
  }
}

function onDragStart() {
  dragSnapshot = [...items.value]
}

function onDragEnd() {
  // Laisser vue-draggable-plus appliquer le déplacement au v-model avant de comparer.
  nextTick(() => {
    const previous = dragSnapshot
    dragSnapshot = []
    persistOrder(previous)
  })
}

function moveButtonId(direction: 'up' | 'down', id: string): string {
  return `service-objective-${uid}-${direction}-${id}`
}

async function move(index: number, delta: -1 | 1) {
  const target = index + delta
  if (reordering.value || target < 0 || target >= items.value.length) return
  const previous = [...items.value]
  const next = [...items.value]
  const [moved] = next.splice(index, 1)
  if (!moved) return
  next.splice(target, 0, moved)
  items.value = next
  announcement.value = `« ${moved.title} » déplacé en position ${target + 1} sur ${next.length}.`

  // Garder le focus sur l'objectif déplacé (bouton de même sens, sinon l'autre).
  await nextTick()
  const sameDirection = document.getElementById(moveButtonId(delta < 0 ? 'up' : 'down', moved.id)) as HTMLButtonElement | null
  const otherDirection = document.getElementById(moveButtonId(delta < 0 ? 'down' : 'up', moved.id)) as HTMLButtonElement | null
  const focusTarget = sameDirection && !sameDirection.disabled ? sameDirection : otherDirection
  focusTarget?.focus()

  await persistOrder(previous)
}

// =============================================================================
// Formulaire (création / modification)
// =============================================================================

interface ObjectiveForm {
  title: string
  title_en: string
  title_ar: string
  description_md: string
  description_html: string
  description_en_md: string
  description_en_html: string
  description_ar_md: string
  description_ar_html: string
}

function emptyForm(): ObjectiveForm {
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
  }
}

function formFromItem(item: ServiceObjectiveRead): ObjectiveForm {
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
  }
}

function htmlHasText(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim().length > 0
}

/**
 * Champs texte envoyés à l'API (une description vide est envoyée à `null`).
 * Un HTML sans Markdown (donnée ancienne) est conservé tel quel.
 */
function textPayload(f: ObjectiveForm) {
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
const editing = ref<ServiceObjectiveRead | null>(null)
const form = ref<ObjectiveForm>(emptyForm())
const formSnapshot = ref('')
const saving = ref(false)
const formError = ref<string | null>(null)
const titleError = ref<string | null>(null)

watch(() => form.value.title, (value) => {
  if (value.trim()) titleError.value = null
})

function openForm(item?: ServiceObjectiveRead) {
  editing.value = item ?? null
  form.value = item ? formFromItem(item) : emptyForm()
  formSnapshot.value = JSON.stringify(form.value)
  formError.value = null
  titleError.value = null
  formOpen.value = true
}

function closeForm(force = false) {
  if (saving.value) return
  if (!force && JSON.stringify(form.value) !== formSnapshot.value
    && !window.confirm('Des modifications ne sont pas enregistrées. Fermer quand même ?')) {
    return
  }
  formOpen.value = false
  editing.value = null
}

async function save() {
  formError.value = null
  if (!form.value.title.trim()) {
    titleError.value = 'Le titre en français est obligatoire.'
    return
  }
  saving.value = true
  try {
    const payload = textPayload(form.value)
    if (editing.value) {
      const updated = await updateServiceObjective(props.serviceId, editing.value.id, payload)
      items.value = items.value.map(item => (item.id === updated.id ? updated : item))
      notice.value = { type: 'success', text: `Objectif « ${updated.title} » mis à jour.` }
    }
    else {
      const nextOrder = items.value.reduce((max, item) => Math.max(max, item.display_order), 0) + 1
      const data: ServiceObjectiveCreate = { ...payload, display_order: nextOrder }
      const created = await createServiceObjective(props.serviceId, data)
      items.value = [...items.value, created]
      emit('count', items.value.length)
      notice.value = { type: 'success', text: `Objectif « ${created.title} » ajouté.` }
    }
    saving.value = false
    closeForm(true)
  }
  catch (e) {
    console.error('Erreur enregistrement objectif :', e)
    formError.value = errorMessage(e, 'L\'enregistrement a échoué. Vérifiez les champs puis réessayez.')
  }
  finally {
    saving.value = false
  }
}

// =============================================================================
// Suppression
// =============================================================================

const deleting = ref<ServiceObjectiveRead | null>(null)
const deleteBusy = ref(false)
const deleteError = ref<string | null>(null)

function askDelete(item: ServiceObjectiveRead) {
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
    await deleteServiceObjective(props.serviceId, target.id)
    items.value = items.value.filter(item => item.id !== target.id)
    emit('count', items.value.length)
    notice.value = { type: 'success', text: `Objectif « ${target.title} » supprimé.` }
    deleteBusy.value = false
    closeDelete()
  }
  catch (e) {
    console.error('Erreur suppression objectif :', e)
    deleteError.value = errorMessage(e, 'La suppression a échoué. Réessayez.')
  }
  finally {
    deleteBusy.value = false
  }
}

const actionButtonClass = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700'
</script>

<template>
  <section class="space-y-5" :aria-labelledby="headingId">
    <AdminOrganisationServiceItemSectionHeader
      icon="bullseye"
      title="Objectifs"
      description="Les objectifs du service, affichés dans cet ordre sur sa fiche publique."
      add-label="Ajouter un objectif"
      tone="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      :heading-id="headingId"
      :count="loaded ? items.length : null"
      :add-disabled="!loaded"
      @add="openForm()"
    />

    <AdminOrganisationServiceItemNotice :notice="notice" @dismiss="notice = null" />
    <p class="sr-only" aria-live="assertive" aria-atomic="true">{{ announcement }}</p>

    <!-- Chargement -->
    <div v-if="loading && !loaded" class="space-y-3" role="status" aria-label="Chargement des objectifs">
      <div
        v-for="n in 3"
        :key="n"
        class="flex animate-pulse items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-700/60" />
        </div>
      </div>
      <span class="sr-only">Chargement des objectifs…</span>
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
      icon="bullseye"
      title="Aucun objectif pour l'instant"
      text="Formulez les grandes ambitions du service : elles apparaîtront, dans l'ordre choisi, sur sa fiche publique."
      action-label="Ajouter le premier objectif"
      tone="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      @action="openForm()"
    />

    <!-- Liste ordonnée -->
    <div v-else-if="loaded" class="space-y-2">
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-3 w-3" aria-hidden="true" />
        <span>Glissez la poignée pour changer l'ordre, ou utilisez les flèches.</span>
        <span v-if="reordering" class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300" role="status">
          <font-awesome-icon :icon="['fas', 'spinner']" class="h-3 w-3 animate-spin" aria-hidden="true" />
          Enregistrement de l'ordre…
        </span>
      </p>

      <VueDraggable
        v-model="items"
        tag="ol"
        handle=".drag-handle"
        :animation="150"
        ghost-class="opacity-30"
        :disabled="reordering || items.length < 2"
        class="space-y-2"
        :aria-labelledby="headingId"
        @start="onDragStart"
        @end="onDragEnd"
      >
        <li
          v-for="(objective, index) in items"
          :key="objective.id"
          class="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm sm:p-4 dark:border-gray-700 dark:bg-gray-800"
          :class="{ 'opacity-70': reordering }"
        >
          <!-- Poignée (souris / tactile) -->
          <span
            class="drag-handle mt-1 hidden h-7 w-5 flex-shrink-0 items-center justify-center rounded text-gray-300 sm:inline-flex dark:text-gray-600"
            :class="reordering || items.length < 2 ? 'cursor-not-allowed' : 'cursor-grab hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing dark:hover:bg-gray-700 dark:hover:text-gray-300'"
            title="Glisser pour réordonner"
            aria-hidden="true"
          >
            <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-4 w-4" />
          </span>

          <!-- Numéro -->
          <span
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400"
            aria-hidden="true"
          >
            {{ index + 1 }}
          </span>

          <!-- Contenu -->
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="break-words font-medium text-gray-900 dark:text-white">
                <span class="sr-only">Objectif {{ index + 1 }} : </span>{{ objective.title }}
              </h3>
              <AdminOrganisationServiceItemI18nBadges :item="objective" />
            </div>
            <AdminOrganisationServiceItemExcerpt
              class="mt-1"
              :html="objective.description_html"
              :md="objective.description_md"
            />
          </div>

          <!-- Actions -->
          <div class="flex flex-shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
            <div class="flex items-center">
              <button
                :id="moveButtonId('up', objective.id)"
                type="button"
                :class="actionButtonClass"
                :disabled="reordering || index === 0"
                :aria-label="`Monter « ${objective.title} »`"
                title="Monter"
                @click="move(index, -1)"
              >
                <font-awesome-icon :icon="['fas', 'arrow-up']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                :id="moveButtonId('down', objective.id)"
                type="button"
                :class="actionButtonClass"
                :disabled="reordering || index === items.length - 1"
                :aria-label="`Descendre « ${objective.title} »`"
                title="Descendre"
                @click="move(index, 1)"
              >
                <font-awesome-icon :icon="['fas', 'arrow-down']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <div class="flex items-center">
              <button
                type="button"
                :class="[actionButtonClass, 'hover:text-blue-600 dark:hover:text-blue-400']"
                :aria-label="`Modifier « ${objective.title} »`"
                title="Modifier"
                @click="openForm(objective)"
              >
                <font-awesome-icon :icon="['fas', 'pen']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                :class="[actionButtonClass, 'hover:text-red-600 dark:hover:text-red-400']"
                :aria-label="`Supprimer « ${objective.title} »`"
                title="Supprimer"
                @click="askDelete(objective)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </li>
      </VueDraggable>
    </div>

    <!-- Formulaire -->
    <AdminOrganisationServiceItemModal
      :open="formOpen"
      :title="editing ? 'Modifier l\'objectif' : 'Nouvel objectif'"
      :description="editing ? undefined : 'Il sera ajouté en fin de liste ; vous pourrez ensuite le déplacer.'"
      as-form
      :busy="saving"
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
        :translate="translateServiceObjective"
        title-label="Intitulé"
        title-placeholder="Ex. : Améliorer la satisfaction des étudiants"
        description-placeholder="Précisez l'objectif, ses indicateurs ou son échéance…"
        :title-error="titleError"
        :disabled="saving"
      />

      <template #footer>
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          :disabled="saving"
          @click="closeForm()"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-800"
          :disabled="saving"
        >
          <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
          {{ saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter l\'objectif' }}
        </button>
      </template>
    </AdminOrganisationServiceItemModal>

    <!-- Suppression -->
    <AdminOrganisationServiceItemDeleteModal
      :open="!!deleting"
      item-label="l'objectif"
      :item-title="deleting?.title"
      :busy="deleteBusy"
      :error="deleteError"
      @close="closeDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>
