<script setup lang="ts">
const route = useRoute()
const { locale, t } = useI18n()
const { public: { siteUrl } } = useRuntimeConfig()
const { getSurveyBySlug } = usePublicSurveyApi()

const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

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

useSeoMeta({
  title: () => localizedTitle.value || t('formulaires.seo.title'),
  ogTitle: () => localizedTitle.value || t('formulaires.seo.title'),
  description: () => localizedDescription.value || t('formulaires.seo.description'),
  ogDescription: () => localizedDescription.value || t('formulaires.seo.description'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

const coverImageUrl = computed(() => {
  if (!campaign.value?.cover_image_external_id) return null
  return `/api/public/media/${campaign.value.cover_image_external_id}/download`
})

const truncatedDescription = computed(() => {
  const desc = localizedDescription.value
  if (!desc) return ''
  // Limiter à ~4 lignes (~300 caractères)
  if (desc.length > 300) return desc.slice(0, 300).replace(/\s+\S*$/, '') + '...'
  return desc
})

function handleComplete(data: Record<string, any>) {
  submitted.value = true
  sessionStorage.setItem(`survey_submitted_${slug}`, 'true')
}
</script>

<template>
  <div>
    <!-- Hero Section (titre + description + motif SVG, sans image) -->
    <section v-if="campaign && !submitted && !alreadySubmitted && !errorStatus" class="relative overflow-hidden bg-gradient-to-br from-brand-blue-900 to-brand-blue-800 min-h-[220px] md:min-h-[280px]">
      <!-- SVG pattern -->
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cpath d='M0 300c50-80 150-120 300-100s250 80 300 100' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 350c80-60 200-100 300-80s220 60 300 80' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 250c60-40 180-80 300-60s240 40 300 60' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 200c40-30 160-60 300-40s260 30 300 40' fill='none' stroke='%23fff' stroke-width='1'/%3E%3Cpath d='M0 400c70-50 190-90 300-70s230 50 300 70' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E&quot;); background-size: 600px 600px;"
      />

      <UiDecorativeDiese
        :enabled="true"
        position="bottom-right"
        size="2xl"
        :opacity="0.06"
        bg="dark"
      />

      <!-- Contenu -->
      <div class="relative z-10 flex items-center px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div class="mx-auto max-w-4xl text-center">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {{ localizedTitle }}
          </h1>
          <p v-if="truncatedDescription" class="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl mx-auto line-clamp-4">
            {{ truncatedDescription }}
          </p>
        </div>
      </div>

      <!-- SVG diagonal separator -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg
          class="w-full h-12 md:h-16 text-white dark:text-gray-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
        </svg>
      </div>
    </section>

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
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Merci pour votre message !</h1>
        <p v-if="campaign?.confirmation_email_enabled" class="text-gray-500 dark:text-gray-400">
          Un mail de confirmation vous a été envoyé via l'email communiqué.
        </p>
        <p v-else class="text-gray-500 dark:text-gray-400">
          Votre réponse a bien été enregistrée.
        </p>
      </div>

      <!-- Formulaire -->
      <template v-else-if="campaign">
        <!-- Image de l'entité associée -->
        <div v-if="coverImageUrl" class="mb-8 overflow-hidden rounded-xl">
          <img :src="coverImageUrl" :alt="localizedTitle" class="w-full h-auto max-h-[360px] object-cover">
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
  </div>
</template>
