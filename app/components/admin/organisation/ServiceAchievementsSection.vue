<script setup lang="ts">
/**
 * Onglet « Réalisations » de la fiche admin d'un service.
 *
 * Cartes triées par date décroissante : image de couverture (recadrage 16:9,
 * dossier média « achievements »), type, date, titre, extrait de description.
 * Émet `count` après le chargement et après chaque création / suppression.
 */
import type { ServiceAchievementRead } from '~/composables/useServicesApi'

const props = defineProps<{
  serviceId: string
}>()

const emit = defineEmits<{
  count: [value: number]
}>()

const {
  getServiceAchievements,
  createServiceAchievement,
  updateServiceAchievement,
  deleteServiceAchievement,
  translateServiceAchievement,
} = useServicesApi()

const { getMediaUrl } = useMediaApi()

/** Types de réalisation (texte libre côté backend, liste fermée côté interface). */
const achievementTypes = [
  'Innovation',
  'Digital',
  'Événement',
  'Digitalisation',
  'Certification',
  'Partenariat',
  'Infrastructure',
  'Formation',
  'Stratégie',
]

const uid = useId()
const headingId = `service-achievements-heading-${uid}`
const ids = {
  type: `service-achievement-type-${uid}`,
  date: `service-achievement-date-${uid}`,
  dateError: `service-achievement-date-error-${uid}`,
}

// =============================================================================
// Chargement
// =============================================================================

const items = ref<ServiceAchievementRead[]>([])
const loading = ref(false)
const loaded = ref(false)
const loadError = ref<string | null>(null)
const notice = ref<{ type: 'success' | 'error', text: string } | null>(null)
const brokenImages = ref(new Set<string>())

function errorMessage(e: unknown, fallback: string): string {
  const detail = (e as { data?: { detail?: unknown } } | null)?.data?.detail
  return typeof detail === 'string' && detail.trim() ? detail : fallback
}

/** Date décroissante (sans date en dernier), puis création décroissante. */
function byDateDesc(list: ServiceAchievementRead[]): ServiceAchievementRead[] {
  return [...list].sort((a, b) => {
    const da = a.achievement_date || ''
    const db = b.achievement_date || ''
    if (da !== db) {
      if (!da) return 1
      if (!db) return -1
      return db.localeCompare(da)
    }
    return (b.created_at || '').localeCompare(a.created_at || '')
  })
}

let loadToken = 0

async function load() {
  const token = ++loadToken
  loading.value = true
  loadError.value = null
  try {
    const data = await getServiceAchievements(props.serviceId)
    if (token !== loadToken) return
    items.value = byDateDesc(data)
    loaded.value = true
    emit('count', items.value.length)
  }
  catch (e) {
    if (token !== loadToken) return
    console.error('Erreur chargement réalisations :', e)
    loadError.value = errorMessage(e, 'Impossible de charger les réalisations du service.')
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
  if (!value) return 'Sans date'
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function coverUrl(item: ServiceAchievementRead): string | null {
  if (!item.cover_image_external_id || brokenImages.value.has(item.id)) return null
  return getMediaUrl(item.cover_image_external_id)
}

function markBroken(id: string) {
  brokenImages.value = new Set(brokenImages.value).add(id)
}

// =============================================================================
// Formulaire (création / modification)
// =============================================================================

interface AchievementForm {
  title: string
  title_en: string
  title_ar: string
  description_md: string
  description_html: string
  description_en_md: string
  description_en_html: string
  description_ar_md: string
  description_ar_html: string
  type: string
  achievement_date: string
  cover_image_external_id: string | null
}

function today(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function emptyForm(): AchievementForm {
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
    type: '',
    achievement_date: today(),
    cover_image_external_id: null,
  }
}

function formFromItem(item: ServiceAchievementRead): AchievementForm {
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
    type: item.type || '',
    achievement_date: item.achievement_date ? item.achievement_date.slice(0, 10) : '',
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
function textPayload(f: AchievementForm) {
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
const editing = ref<ServiceAchievementRead | null>(null)
const form = ref<AchievementForm>(emptyForm())
const formSnapshot = ref('')
const saving = ref(false)
const uploadingImage = ref(false)
const formError = ref<string | null>(null)
const titleError = ref<string | null>(null)
const dateError = ref<string | null>(null)

/** Type hors liste (ancienne saisie libre) : conservé comme option. */
const typeOptions = computed(() => {
  const current = form.value.type
  return current && !achievementTypes.includes(current) ? [...achievementTypes, current] : achievementTypes
})

watch(() => form.value.title, (value) => {
  if (value.trim()) titleError.value = null
})
watch(() => form.value.achievement_date, (value) => {
  if (value) dateError.value = null
})

function openForm(item?: ServiceAchievementRead) {
  editing.value = item ?? null
  form.value = item ? formFromItem(item) : emptyForm()
  formSnapshot.value = JSON.stringify(form.value)
  formError.value = null
  titleError.value = null
  dateError.value = null
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
  if (!form.value.achievement_date) {
    dateError.value = 'La date de la réalisation est obligatoire.'
    valid = false
  }
  if (!valid || uploadingImage.value) return

  saving.value = true
  try {
    const payload = {
      ...textPayload(form.value),
      type: form.value.type || null,
      achievement_date: form.value.achievement_date || null,
      cover_image_external_id: form.value.cover_image_external_id || null,
    }
    if (editing.value) {
      const updated = await updateServiceAchievement(props.serviceId, editing.value.id, payload)
      items.value = byDateDesc(items.value.map(item => (item.id === updated.id ? updated : item)))
      notice.value = { type: 'success', text: `Réalisation « ${updated.title} » mise à jour.` }
    }
    else {
      const created = await createServiceAchievement(props.serviceId, payload)
      items.value = byDateDesc([...items.value, created])
      emit('count', items.value.length)
      notice.value = { type: 'success', text: `Réalisation « ${created.title} » ajoutée.` }
    }
    if (editing.value) {
      const next = new Set(brokenImages.value)
      next.delete(editing.value.id)
      brokenImages.value = next
    }
    saving.value = false
    closeForm(true)
  }
  catch (e) {
    console.error('Erreur enregistrement réalisation :', e)
    formError.value = errorMessage(e, 'L\'enregistrement a échoué. Vérifiez les champs puis réessayez.')
  }
  finally {
    saving.value = false
  }
}

// =============================================================================
// Suppression
// =============================================================================

const deleting = ref<ServiceAchievementRead | null>(null)
const deleteBusy = ref(false)
const deleteError = ref<string | null>(null)

function askDelete(item: ServiceAchievementRead) {
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
    await deleteServiceAchievement(props.serviceId, target.id)
    items.value = items.value.filter(item => item.id !== target.id)
    emit('count', items.value.length)
    notice.value = { type: 'success', text: `Réalisation « ${target.title} » supprimée.` }
    deleteBusy.value = false
    closeDelete()
  }
  catch (e) {
    console.error('Erreur suppression réalisation :', e)
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
      icon="trophy"
      title="Réalisations"
      description="Les résultats marquants du service, du plus récent au plus ancien."
      add-label="Ajouter une réalisation"
      tone="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      :heading-id="headingId"
      :count="loaded ? items.length : null"
      :add-disabled="!loaded"
      @add="openForm()"
    />

    <AdminOrganisationServiceItemNotice :notice="notice" @dismiss="notice = null" />

    <!-- Chargement -->
    <div
      v-if="loading && !loaded"
      class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Chargement des réalisations"
    >
      <div
        v-for="n in 3"
        :key="n"
        class="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="aspect-video bg-gray-200 dark:bg-gray-700" />
        <div class="space-y-2 p-4">
          <div class="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div class="h-3 w-full rounded bg-gray-100 dark:bg-gray-700/60" />
        </div>
      </div>
      <span class="sr-only">Chargement des réalisations…</span>
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
      icon="trophy"
      title="Aucune réalisation enregistrée"
      text="Valorisez ce que le service a accompli : un projet livré, une certification obtenue, un événement réussi…"
      action-label="Ajouter la première réalisation"
      tone="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      @action="openForm()"
    />

    <!-- Cartes -->
    <ul v-else-if="loaded" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" :aria-labelledby="headingId">
      <li
        v-for="achievement in items"
        :key="achievement.id"
        class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            v-if="coverUrl(achievement)"
            :src="coverUrl(achievement) ?? undefined"
            alt=""
            loading="lazy"
            class="h-full w-full object-cover"
            @error="markBroken(achievement.id)"
          >
          <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-50 to-gray-100 dark:from-purple-900/20 dark:to-gray-800">
            <font-awesome-icon :icon="['fas', 'trophy']" class="h-8 w-8 text-purple-300 dark:text-purple-700" aria-hidden="true" />
          </div>
          <span
            v-if="achievement.type"
            class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-medium text-purple-700 shadow-sm dark:bg-gray-900/90 dark:text-purple-300"
          >
            {{ achievement.type }}
          </span>
        </div>

        <div class="flex flex-1 flex-col p-4">
          <p class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <font-awesome-icon :icon="['fas', 'calendar-day']" class="h-3 w-3" aria-hidden="true" />
            <time v-if="achievement.achievement_date" :datetime="achievement.achievement_date.slice(0, 10)">
              {{ formatDate(achievement.achievement_date) }}
            </time>
            <span v-else class="italic">Sans date</span>
          </p>
          <div class="mt-1.5 flex flex-wrap items-center gap-2">
            <h3 class="break-words font-semibold text-gray-900 dark:text-white">
              {{ achievement.title }}
            </h3>
            <AdminOrganisationServiceItemI18nBadges :item="achievement" />
          </div>
          <AdminOrganisationServiceItemExcerpt
            class="mt-1"
            :html="achievement.description_html"
            :md="achievement.description_md"
            :lines="3"
          />
          <div class="mt-auto flex items-center justify-end gap-1 pt-3">
            <button
              type="button"
              :class="[actionButtonClass, 'hover:text-blue-600 dark:hover:text-blue-400']"
              :aria-label="`Modifier « ${achievement.title} »`"
              title="Modifier"
              @click="openForm(achievement)"
            >
              <font-awesome-icon :icon="['fas', 'pen']" class="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              :class="[actionButtonClass, 'hover:text-red-600 dark:hover:text-red-400']"
              :aria-label="`Supprimer « ${achievement.title} »`"
              title="Supprimer"
              @click="askDelete(achievement)"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Formulaire -->
    <AdminOrganisationServiceItemModal
      :open="formOpen"
      :title="editing ? 'Modifier la réalisation' : 'Nouvelle réalisation'"
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
          :translate="translateServiceAchievement"
          title-placeholder="Ex. : Mise en place du guichet numérique"
          description-placeholder="Décrivez la réalisation, son contexte et son impact…"
          :title-error="titleError"
          :disabled="saving"
        />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label :for="ids.type" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              :id="ids.type"
              v-model="form.type"
              :disabled="saving"
              :class="[fieldClass, 'border-gray-300 dark:border-gray-600']"
            >
              <option value="">Non précisé</option>
              <option v-for="type in typeOptions" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <div>
            <label :for="ids.date" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date <span class="text-red-600 dark:text-red-400" aria-hidden="true">*</span>
              <span class="sr-only">(obligatoire)</span>
            </label>
            <input
              :id="ids.date"
              v-model="form.achievement_date"
              type="date"
              required
              aria-required="true"
              :aria-invalid="dateError ? 'true' : undefined"
              :aria-describedby="dateError ? ids.dateError : undefined"
              :disabled="saving"
              :class="[fieldClass, dateError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600']"
            >
            <p v-if="dateError" :id="ids.dateError" class="mt-1 text-xs text-red-600 dark:text-red-400">
              {{ dateError }}
            </p>
          </div>
        </div>

        <AdminOrganisationServiceItemCoverImageField
          v-model="form.cover_image_external_id"
          v-model:uploading="uploadingImage"
          folder="achievements"
          hint="Affichée sur la carte de la réalisation (format 16:9, recadrage proposé après le choix du fichier)."
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
          :disabled="saving || uploadingImage"
        >
          <font-awesome-icon v-if="saving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" aria-hidden="true" />
          {{ saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter la réalisation' }}
        </button>
      </template>
    </AdminOrganisationServiceItemModal>

    <!-- Suppression -->
    <AdminOrganisationServiceItemDeleteModal
      :open="!!deleting"
      item-label="la réalisation"
      :item-title="deleting?.title"
      :busy="deleteBusy"
      :error="deleteError"
      @close="closeDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>
