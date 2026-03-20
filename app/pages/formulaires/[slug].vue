<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const { getSurveyBySlug } = usePublicSurveyApi()

const slug = route.params.slug as string

const loading = ref(true)
const campaign = ref<any>(null)
const errorStatus = ref<number | null>(null)
const submitted = ref(false)
const alreadySubmitted = ref(false)

// Session ID pour dédoublonnage
const sessionId = ref('')

onMounted(async () => {
  // Générer ou récupérer le session ID
  const storageKey = `survey_session_${slug}`
  const existingSession = sessionStorage.getItem(storageKey)
  if (existingSession) {
    sessionId.value = existingSession
    // Vérifier si déjà soumis
    if (sessionStorage.getItem(`survey_submitted_${slug}`)) {
      alreadySubmitted.value = true
    }
  } else {
    sessionId.value = crypto.randomUUID()
    sessionStorage.setItem(storageKey, sessionId.value)
  }

  try {
    campaign.value = await getSurveyBySlug(slug)
  } catch (e: any) {
    errorStatus.value = e?.response?.status || e?.status || 404
  } finally {
    loading.value = false
  }
})

const localizedTitle = computed(() => {
  if (!campaign.value) return ''
  const key = `title_${locale.value}` as string
  return campaign.value[key] || campaign.value.title_fr
})

const localizedDescription = computed(() => {
  if (!campaign.value) return ''
  const key = `description_${locale.value}` as string
  return campaign.value[key] || campaign.value.description_fr
})

function handleComplete(data: Record<string, any>) {
  submitted.value = true
  sessionStorage.setItem(`survey_submitted_${slug}`, 'true')
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-200 border-t-brand-blue-600" />
    </div>

    <!-- Erreur 410 : campagne terminée -->
    <div v-else-if="errorStatus === 410" class="py-20 text-center">
      <div class="mx-auto mb-4 text-6xl text-gray-300">📋</div>
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Formulaire indisponible</h1>
      <p class="text-gray-500 dark:text-gray-400">
        Ce formulaire n'accepte plus de réponses. Il a été clôturé ou mis en pause.
      </p>
    </div>

    <!-- Erreur 404 : campagne introuvable -->
    <div v-else-if="errorStatus" class="py-20 text-center">
      <div class="mx-auto mb-4 text-6xl text-gray-300">🔍</div>
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Formulaire introuvable</h1>
      <p class="text-gray-500 dark:text-gray-400">
        Le formulaire que vous cherchez n'existe pas ou a été supprimé.
      </p>
    </div>

    <!-- Déjà soumis -->
    <div v-else-if="alreadySubmitted" class="py-20 text-center">
      <div class="mx-auto mb-4 text-6xl text-gray-300">📝</div>
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Réponse déjà envoyée</h1>
      <p class="text-gray-500 dark:text-gray-400">
        Vous avez déjà répondu à ce formulaire. Merci pour votre participation !
      </p>
    </div>

    <!-- Confirmation de soumission -->
    <div v-else-if="submitted" class="py-20 text-center">
      <div class="mx-auto mb-4 text-6xl">✅</div>
      <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Merci pour votre réponse !</h1>
      <p class="text-gray-500 dark:text-gray-400">
        Votre réponse a bien été enregistrée.
      </p>
    </div>

    <!-- Formulaire -->
    <template v-else-if="campaign">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ localizedTitle }}</h1>
        <p v-if="localizedDescription" class="mt-2 text-gray-600 dark:text-gray-400">
          {{ localizedDescription }}
        </p>
      </div>

      <SurveyRenderer
        :survey-json="campaign.survey_json"
        :locale="locale"
        :slug="slug"
        :session-id="sessionId"
        @complete="handleComplete"
      />
    </template>
  </div>
</template>
