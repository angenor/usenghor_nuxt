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
  <div class="min-h-screen bg-gray-50/80 dark:bg-gray-900">
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
      <div class="relative z-10 flex items-center px-4 sm:px-6 lg:px-8 pt-20 pb-14 md:pt-28 md:pb-20">
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

    <!-- Contenu principal -->
    <div class="relative mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <!-- Blobs décoratifs en arrière-plan -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div class="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-brand-blue-100/40 blur-3xl dark:bg-brand-blue-900/20" />
        <div class="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-brand-red-50/30 blur-3xl dark:bg-brand-red-900/10" />
      </div>

      <div class="relative">
        <!-- Loading : skeleton -->
        <div v-if="loading">
          <div class="overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-sm dark:bg-gray-800/70 dark:ring-white/10">
            <div class="relative h-1.5 overflow-hidden bg-gray-100 dark:bg-gray-700">
              <div class="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-brand-blue-200/60 to-transparent dark:via-brand-blue-600/30" />
            </div>
            <div class="space-y-5 p-8">
              <div class="h-5 w-2/3 animate-pulse rounded-full bg-gray-200/80 dark:bg-gray-700/80" />
              <div class="space-y-3">
                <div class="h-3 w-1/3 animate-pulse rounded-full bg-gray-200/60 dark:bg-gray-700/60" style="animation-delay: 0.1s" />
                <div class="h-11 w-full animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-700/80" style="animation-delay: 0.15s" />
              </div>
              <div class="space-y-3">
                <div class="h-3 w-1/4 animate-pulse rounded-full bg-gray-200/60 dark:bg-gray-700/60" style="animation-delay: 0.2s" />
                <div class="h-11 w-full animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-700/80" style="animation-delay: 0.25s" />
              </div>
              <div class="space-y-3">
                <div class="h-3 w-2/5 animate-pulse rounded-full bg-gray-200/60 dark:bg-gray-700/60" style="animation-delay: 0.3s" />
                <div class="h-24 w-full animate-pulse rounded-lg bg-gray-200/80 dark:bg-gray-700/80" style="animation-delay: 0.35s" />
              </div>
              <div class="flex justify-end pt-4">
                <div class="h-11 w-36 animate-pulse rounded-lg bg-brand-blue-200/60 dark:bg-brand-blue-800/40" style="animation-delay: 0.4s" />
              </div>
            </div>
          </div>
        </div>

        <!-- Erreur 410 : campagne terminée -->
        <div v-else-if="errorStatus === 410" class="animate__animated animate__fadeInUp py-4">
          <div class="status-card">
            <div class="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
            <div class="px-8 py-12 text-center">
              <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200/50 dark:bg-amber-900/20 dark:ring-amber-700/30">
                <svg class="h-10 w-10 text-amber-500 animate-icon-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Formulaire indisponible</h1>
              <p class="mx-auto max-w-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Ce formulaire n'accepte plus de réponses. Il a été clôturé ou mis en pause.
              </p>
            </div>
          </div>
        </div>

        <!-- Erreur 404 : campagne introuvable -->
        <div v-else-if="errorStatus" class="animate__animated animate__fadeInUp py-4">
          <div class="status-card">
            <div class="h-1.5 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600" />
            <div class="px-8 py-12 text-center">
              <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 ring-1 ring-gray-200/50 dark:bg-gray-700/50 dark:ring-gray-600/30">
                <svg class="h-10 w-10 text-gray-400 dark:text-gray-500 animate-icon-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                </svg>
              </div>
              <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Formulaire introuvable</h1>
              <p class="mx-auto max-w-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Le formulaire que vous cherchez n'existe pas ou a été supprimé.
              </p>
            </div>
          </div>
        </div>

        <!-- Déjà soumis -->
        <div v-else-if="alreadySubmitted" class="animate__animated animate__fadeInUp py-4">
          <div class="status-card">
            <div class="h-1.5 bg-gradient-to-r from-brand-blue-400 via-brand-blue-500 to-brand-blue-600" />
            <div class="px-8 py-12 text-center">
              <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-blue-50 ring-1 ring-brand-blue-200/50 dark:bg-brand-blue-900/20 dark:ring-brand-blue-700/30">
                <svg class="h-10 w-10 text-brand-blue-500 animate-icon-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Réponse déjà envoyée</h1>
              <p class="mx-auto max-w-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Vous avez déjà répondu à ce formulaire. Merci pour votre participation !
              </p>
            </div>
          </div>
        </div>

        <!-- Confirmation de soumission -->
        <div v-else-if="submitted" class="animate__animated animate__fadeInUp py-4">
          <div class="status-card">
            <div class="h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
            <div class="relative overflow-hidden px-8 py-12 text-center">
              <!-- Particules de célébration -->
              <div class="pointer-events-none absolute inset-0" aria-hidden="true">
                <div class="absolute left-[15%] top-6 h-2 w-2 rounded-full bg-emerald-300/40 animate-float-up" />
                <div class="absolute right-[20%] top-10 h-1.5 w-1.5 rounded-full bg-teal-300/30 animate-float-up" style="animation-delay: 0.7s" />
                <div class="absolute left-[40%] top-8 h-1 w-1 rounded-full bg-emerald-400/30 animate-float-up" style="animation-delay: 1.4s" />
                <div class="absolute right-[35%] top-4 h-1.5 w-1.5 rounded-full bg-teal-400/25 animate-float-up" style="animation-delay: 2.1s" />
              </div>

              <div class="relative">
                <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-200/50 dark:bg-emerald-900/20 dark:ring-emerald-700/30">
                  <svg class="h-10 w-10 text-emerald-500 animate-check-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                </div>
                <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Merci pour votre message !</h1>
                <p v-if="campaign?.confirmation_email_enabled" class="mx-auto max-w-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Un mail de confirmation vous a été envoyé via l'email communiqué.
                </p>
                <p v-else class="mx-auto max-w-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Votre réponse a bien été enregistrée.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <template v-else-if="campaign">
          <div class="animate__animated animate__fadeIn overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-sm transition-shadow duration-300 hover:shadow-2xl dark:bg-gray-800/70 dark:ring-white/10">
            <!-- Image de couverture avec dégradé -->
            <div v-if="coverImageUrl" class="relative">
              <img :src="coverImageUrl" :alt="localizedTitle" class="w-full max-h-[320px] object-cover">
              <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/90 to-transparent dark:from-gray-800/90" />
            </div>

            <div class="p-6 md:p-8 lg:p-10">
              <SurveyRenderer
                :survey-json="campaign.survey_json"
                :locale="locale"
                :slug="slug"
                :session-id="sessionId"
                @complete="handleComplete"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Carte de statut (erreurs, soumission, etc.) */
.status-card {
  @apply mx-auto max-w-md overflow-hidden rounded-2xl bg-white/70 shadow-xl ring-1 ring-gray-900/5 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/70 dark:ring-white/10;
}

/* Shimmer pour le skeleton loader */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}

/* Animation d'entrée des icônes (scale + rotation) */
@keyframes icon-in {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.animate-icon-in {
  animation: icon-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Animation du check de succès */
@keyframes check-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-check-in {
  animation: check-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

/* Particules flottantes (célébration) */
@keyframes float-up {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.7; }
  100% { transform: translateY(-80px) scale(0); opacity: 0; }
}

.animate-float-up {
  animation: float-up 3.5s ease-out infinite;
}
</style>
