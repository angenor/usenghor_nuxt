<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const { createCampaign } = useAdminSurveyApi()

const loading = ref(false)
const error = ref<string | null>(null)

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

const form = reactive({
  slug: '',
  title_fr: '',
  title_en: '',
  title_ar: '',
  description_fr: '',
  description_en: '',
  description_ar: '',
  confirmation_email_enabled: false,
  closes_at: '',
})

const questions = ref<SurveyQuestion[]>([])

// Génération automatique du slug
watch(() => form.title_fr, (val) => {
  if (val) {
    form.slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
})

const isValid = computed(() => {
  return form.slug.length > 0 && form.title_fr.length > 0 && questions.value.length > 0
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
        element.choices = q.choices.map(c => ({
          value: c.value,
          text: c.text,
        }))
      }
      if (q.type === 'rating' && q.rateCount) {
        element.rateCount = q.rateCount
      }
      return element
    }),
  }
}

async function submitForm() {
  if (!isValid.value) return
  loading.value = true
  error.value = null

  try {
    const payload: Record<string, any> = {
      slug: form.slug,
      title_fr: form.title_fr,
      title_en: form.title_en || undefined,
      title_ar: form.title_ar || undefined,
      description_fr: form.description_fr || undefined,
      description_en: form.description_en || undefined,
      description_ar: form.description_ar || undefined,
      survey_json: buildSurveyJson(),
      confirmation_email_enabled: form.confirmation_email_enabled,
    }
    if (form.closes_at) {
      payload.closes_at = new Date(form.closes_at).toISOString()
    }

    const result = await createCampaign(payload)
    router.push(`/admin/campagnes/${result.id}/edit`)
  } catch (e: any) {
    error.value = e?.data?.detail || e?.message || 'Erreur lors de la création'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 p-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle campagne</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Créez un formulaire de sondage et configurez ses questions
        </p>
      </div>
      <NuxtLink
        to="/admin/campagnes"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Retour à la liste
      </NuxtLink>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Informations générales -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Informations générales</h2>

      <div class="space-y-4">
        <!-- Slug -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Slug (URL)</label>
          <input
            v-model="form.slug"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="ex: enquete-satisfaction-2026"
          >
          <p class="mt-1 text-xs text-gray-500">Identifiant unique pour le lien public</p>
        </div>

        <!-- Titre trilingue -->
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

        <!-- Description trilingue -->
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

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de clôture automatique</label>
          <input
            v-model="form.closes_at"
            type="datetime-local"
            class="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
          <p class="mt-1 text-xs text-gray-500">Laissez vide pour une campagne sans date de fin</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3">
      <NuxtLink
        to="/admin/campagnes"
        class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Annuler
      </NuxtLink>
      <button
        type="button"
        :disabled="!isValid || loading"
        class="rounded-lg bg-brand-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="submitForm"
      >
        {{ loading ? 'Création...' : 'Créer le brouillon' }}
      </button>
    </div>
  </div>
</template>
