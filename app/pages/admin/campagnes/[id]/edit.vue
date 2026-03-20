<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const router = useRouter()
const { getCampaign, updateCampaign, publishCampaign, pauseCampaign, closeCampaign, getAssociations, createAssociation, deleteAssociation } = useAdminSurveyApi()
const { getEvents, getCalls, getPrograms } = useReferenceData()

const campaignId = route.params.id as string
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

interface QuestionChoice {
  value: string
  text: { fr: string; en?: string; ar?: string }
}

interface SurveyQuestion {
  type: string
  name: string
  title: { fr: string; en?: string; ar?: string }
  isRequired: boolean
  choices?: QuestionChoice[]
  inputType?: string
  rateCount?: number
  validators?: Array<{ type: string; [key: string]: any }>
}

const campaign = ref<any>(null)

const form = reactive({
  slug: '',
  title_fr: '',
  title_en: '',
  title_ar: '',
  description_fr: '',
  description_en: '',
  description_ar: '',
  confirmation_email_enabled: false,
  confirmation_email_field: '',
  closes_at: '',
})

const questions = ref<SurveyQuestion[]>([])

onMounted(async () => {
  try {
    const data = await getCampaign(campaignId)
    campaign.value = data

    form.slug = data.slug
    form.title_fr = data.title_fr
    form.title_en = data.title_en || ''
    form.title_ar = data.title_ar || ''
    form.description_fr = data.description_fr || ''
    form.description_en = data.description_en || ''
    form.description_ar = data.description_ar || ''
    form.confirmation_email_enabled = data.confirmation_email_enabled
    form.confirmation_email_field = data.confirmation_email_field || ''
    form.closes_at = data.closes_at ? data.closes_at.slice(0, 16) : ''

    // Charger les questions depuis le survey_json
    const surveyDef = data.survey_json || {}
    const elements = surveyDef.elements || []
    questions.value = elements.map((el: any) => ({
      type: el.type,
      name: el.name,
      title: typeof el.title === 'string' ? { fr: el.title } : (el.title || { fr: '' }),
      isRequired: el.isRequired || false,
      choices: el.choices?.map((c: any) => ({
        value: typeof c === 'string' ? c : c.value,
        text: typeof c === 'string' ? { fr: c } : (c.text || { fr: c.value }),
      })),
      inputType: el.inputType,
      rateCount: el.rateCount,
    }))
    // Charger les associations
    await loadAssociations()
    await loadEntityOptions()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors du chargement'
  } finally {
    loading.value = false
  }
})

const isValid = computed(() => {
  return form.slug.length > 0 && form.title_fr.length > 0
})

function buildSurveyJson(): Record<string, any> {
  return {
    elements: questions.value.map(q => {
      const element: Record<string, any> = {
        type: q.type,
        name: q.name,
        title: q.title,
        isRequired: q.isRequired,
      }
      if (q.inputType) element.inputType = q.inputType
      if (q.choices && q.choices.length > 0) {
        element.choices = q.choices.map(c => ({ value: c.value, text: c.text }))
      }
      if (q.type === 'rating' && q.rateCount) {
        element.rateCount = q.rateCount
      }
      return element
    }),
  }
}

async function saveForm() {
  if (!isValid.value) return
  saving.value = true
  error.value = null
  successMessage.value = null

  try {
    const payload: Record<string, any> = {
      slug: form.slug,
      title_fr: form.title_fr,
      title_en: form.title_en || null,
      title_ar: form.title_ar || null,
      description_fr: form.description_fr || null,
      description_en: form.description_en || null,
      description_ar: form.description_ar || null,
      survey_json: buildSurveyJson(),
      confirmation_email_enabled: form.confirmation_email_enabled,
      confirmation_email_field: form.confirmation_email_field || null,
      closes_at: form.closes_at ? new Date(form.closes_at).toISOString() : null,
    }

    const updated = await updateCampaign(campaignId, payload)
    campaign.value = updated
    successMessage.value = 'Campagne sauvegardée'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  try {
    error.value = null
    // Sauvegarder d'abord
    await saveForm()
    const updated = await publishCampaign(campaignId)
    campaign.value = updated
    successMessage.value = 'Campagne publiée'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la publication'
  }
}

async function handlePause() {
  try {
    error.value = null
    const updated = await pauseCampaign(campaignId)
    campaign.value = updated
    successMessage.value = 'Campagne mise en pause'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la mise en pause'
  }
}

async function handleClose() {
  if (!confirm('Êtes-vous sûr de vouloir clôturer cette campagne ? Cette action est irréversible.')) return
  try {
    error.value = null
    const updated = await closeCampaign(campaignId)
    campaign.value = updated
    successMessage.value = 'Campagne clôturée'
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la clôture'
  }
}

const publicUrl = computed(() => {
  if (!form.slug) return ''
  return `/formulaires/${form.slug}`
})

// =============================================================================
// ASSOCIATIONS
// =============================================================================

const associations = ref<any[]>([])
const entityTypes = [
  { value: 'event', label: 'Événement' },
  { value: 'application_call', label: 'Appel à candidature' },
  { value: 'program', label: 'Programme' },
]
const newAssocEntityType = ref('event')
const newAssocEntityId = ref('')
const entityOptions = ref<Array<{ id: string; title: string }>>([])
const associationsLoading = ref(false)

async function loadAssociations() {
  try {
    associations.value = await getAssociations(campaignId)
  } catch { /* ignore */ }
}

async function loadEntityOptions() {
  entityOptions.value = []
  try {
    if (newAssocEntityType.value === 'event') {
      entityOptions.value = (await getEvents()).map(e => ({ id: e.id, title: e.title }))
    } else if (newAssocEntityType.value === 'application_call') {
      entityOptions.value = (await getCalls()).map(c => ({ id: c.id, title: c.title }))
    } else if (newAssocEntityType.value === 'program') {
      entityOptions.value = (await getPrograms()).map(p => ({ id: p.id, title: p.title }))
    }
  } catch { /* ignore */ }
}

watch(newAssocEntityType, () => {
  newAssocEntityId.value = ''
  loadEntityOptions()
})

async function addAssociation() {
  if (!newAssocEntityId.value) return
  associationsLoading.value = true
  try {
    await createAssociation(campaignId, newAssocEntityType.value, newAssocEntityId.value)
    newAssocEntityId.value = ''
    await loadAssociations()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de l\'association'
  } finally {
    associationsLoading.value = false
  }
}

async function removeAssociation(associationId: string) {
  try {
    await deleteAssociation(campaignId, associationId)
    await loadAssociations()
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la suppression'
  }
}

function getEntityTypeLabel(type: string): string {
  return entityTypes.find(t => t.value === type)?.label || type
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 p-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-200 border-t-brand-blue-600" />
    </div>

    <template v-else-if="campaign">
      <!-- En-tête -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Modifier la campagne</h1>
          <div class="mt-1 flex items-center gap-2">
            <SurveyCampaignStatusBadge :status="campaign.status" />
            <a
              v-if="campaign.status === 'active'"
              :href="publicUrl"
              target="_blank"
              class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Voir le formulaire public →
            </a>
          </div>
        </div>
        <NuxtLink
          to="/admin/campagnes"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Retour à la liste
        </NuxtLink>
      </div>

      <!-- Messages -->
      <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
        {{ error }}
      </div>
      <div v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
        {{ successMessage }}
      </div>

      <!-- Informations générales -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Informations générales</h2>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Slug (URL)</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre FR *</label>
              <input
                v-model="form.title_fr"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre EN</label>
              <input
                v-model="form.title_en"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre AR</label>
              <input
                v-model="form.title_ar"
                type="text"
                dir="rtl"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description FR</label>
              <textarea
                v-model="form.description_fr"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description EN</label>
              <textarea
                v-model="form.description_en"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description AR</label>
              <textarea
                v-model="form.description_ar"
                rows="3"
                dir="rtl"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Questions du formulaire -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Questions du formulaire</h2>
        <SurveyQuestionList v-model="questions" />
      </div>

      <!-- Options -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Options</h2>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <input
              id="confirmEmail"
              v-model="form.confirmation_email_enabled"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-blue-600"
            >
            <label for="confirmEmail" class="text-sm text-gray-700 dark:text-gray-300">
              Envoyer un email de confirmation au répondant
            </label>
          </div>

          <div v-if="form.confirmation_email_enabled">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Champ email du formulaire</label>
            <select
              v-model="form.confirmation_email_field"
              class="w-64 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner le champ email...</option>
              <option v-for="q in questions" :key="q.name" :value="q.name">
                {{ q.title.fr || q.name }} ({{ q.name }})
              </option>
            </select>
            <p v-if="!form.confirmation_email_field && questions.length > 0" class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              Sélectionnez le champ qui contient l'email du répondant
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de clôture automatique</label>
            <input
              v-model="form.closes_at"
              type="datetime-local"
              class="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </div>
        </div>
      </div>

      <!-- Associations -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Associations</h2>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Liez cette campagne à un événement, un appel à candidature ou un programme pour l'afficher sur la page correspondante.
        </p>

        <!-- Formulaire d'ajout -->
        <div class="mb-4 flex items-end gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              v-model="newAssocEntityType"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="et in entityTypes" :key="et.value" :value="et.value">{{ et.label }}</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Élément</label>
            <select
              v-model="newAssocEntityId"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner...</option>
              <option v-for="opt in entityOptions" :key="opt.id" :value="opt.id">{{ opt.title }}</option>
            </select>
          </div>
          <button
            type="button"
            :disabled="!newAssocEntityId || associationsLoading"
            class="rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
            @click="addAssociation"
          >
            Associer
          </button>
        </div>

        <!-- Liste des associations -->
        <div v-if="associations.length > 0" class="space-y-2">
          <div
            v-for="assoc in associations"
            :key="assoc.id"
            class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700"
          >
            <div>
              <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {{ getEntityTypeLabel(assoc.entity_type) }}
              </span>
              <span class="ml-2 text-sm text-gray-800 dark:text-gray-200">{{ assoc.entity_id }}</span>
            </div>
            <button
              type="button"
              class="text-sm text-red-500 hover:text-red-700"
              @click="removeAssociation(assoc.id)"
            >
              Retirer
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Aucune association.</p>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <!-- Actions de cycle de vie -->
          <button
            v-if="campaign.status === 'draft' || campaign.status === 'paused'"
            type="button"
            class="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            @click="handlePublish"
          >
            Publier
          </button>
          <button
            v-if="campaign.status === 'active'"
            type="button"
            class="rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-yellow-600"
            @click="handlePause"
          >
            Mettre en pause
          </button>
          <button
            v-if="campaign.status === 'active' || campaign.status === 'paused'"
            type="button"
            class="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
            @click="handleClose"
          >
            Clôturer
          </button>

          <NuxtLink
            v-if="campaign.status !== 'draft'"
            :to="`/admin/campagnes/${campaignId}/resultats`"
            class="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Voir les résultats
          </NuxtLink>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink
            to="/admin/campagnes"
            class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Annuler
          </NuxtLink>
          <button
            type="button"
            :disabled="!isValid || saving"
            class="rounded-lg bg-brand-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="saveForm"
          >
            {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Erreur de chargement -->
    <div v-else class="py-20 text-center">
      <p class="text-gray-500 dark:text-gray-400">{{ error || 'Campagne introuvable' }}</p>
    </div>
  </div>
</template>
