<script setup lang="ts">
import type { ApplicationCallPublicWithDetails } from '~/types/api'
import type { ProgramPublic } from '~/composables/usePublicProgramsApi'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const { getCallBySlug } = usePublicCallsApi()
const { listPrograms, publicProgramTypeLabels } = usePublicProgramsApi()

// State
const call = ref<ApplicationCallPublicWithDetails | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const submitting = ref(false)
const submitted = ref(false)

// Programs state
const programs = ref<ProgramPublic[]>([])
const loadingPrograms = ref(false)

// Get the slug from route
const slug = computed(() => route.params.slug as string)

// Form state
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  nationality: '',
  date_of_birth: '',
  address: '',
  city: '',
  country: '',
  motivation: '',
  program_external_id: '', // Selected formation
  // Documents will be handled separately
})

// Check if call is open
const isCallOpen = computed(() => {
  if (!call.value) return false
  if (call.value.status !== 'ongoing') return false
  if (call.value.deadline) {
    return new Date(call.value.deadline) > new Date()
  }
  return true
})

// Get the linked program details
const linkedProgram = computed(() => {
  if (!call.value?.program_external_id || programs.value.length === 0) return null
  return programs.value.find(p => p.id === call.value!.program_external_id) || null
})

// Fetch call data
async function fetchCall() {
  loading.value = true
  error.value = null
  try {
    call.value = await getCallBySlug(slug.value)
    if (!call.value) {
      error.value = t('candidatures.notFound')
    } else if (call.value.program_external_id) {
      // Pre-select the linked formation
      form.value.program_external_id = call.value.program_external_id
    }
  } catch (e) {
    error.value = t('candidatures.notFound')
    console.error('Error fetching call:', e)
  } finally {
    loading.value = false
  }
}

// Fetch programs for the selector
async function fetchPrograms() {
  loadingPrograms.value = true
  try {
    const response = await listPrograms({ limit: 100 })
    programs.value = response.items
  } catch (e) {
    console.error('Error fetching programs:', e)
  } finally {
    loadingPrograms.value = false
  }
}

// Submit application
async function submitApplication() {
  if (!call.value || !isCallOpen.value) return

  submitting.value = true
  error.value = null

  try {
    // TODO: Implement actual submission to backend
    // For now, simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    submitted.value = true
  } catch (e) {
    error.value = t('candidatures.submitError')
    console.error('Error submitting application:', e)
  } finally {
    submitting.value = false
  }
}

// Initial fetch
onMounted(() => {
  fetchCall()
  fetchPrograms()
})

// Watch for slug changes
watch(slug, () => {
  fetchCall()
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home') || 'Accueil', to: '/' },
  { label: t('nav.calls') || 'Appels', to: '/actualites/appels' },
  { label: call.value?.title || t('candidatures.apply') || 'Postuler' }
])

// SEO
useSeoMeta({
  title: () => call.value ? `${t('candidatures.applyTo')} ${call.value.title}` : t('candidatures.apply'),
  description: () => call.value?.description || t('candidatures.applyDescription'),
})
</script>

<template>
  <div>
    <!-- Hero (shown when call is loaded) -->
    <PageHero
      v-if="call && !loading"
      :title="call.title"
      :subtitle="t('candidatures.applicationForm') || 'Formulaire de candidature'"
      image="/images/bg/backgroud_senghor2.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Main content area -->
    <section class="bg-gray-50 dark:bg-gray-900">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue-600 border-t-transparent"></div>
      </div>

      <!-- Error / Not Found -->
      <div v-else-if="error || !call" class="py-32">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <div class="mb-6 rounded-full bg-red-100 dark:bg-red-900/30 p-6 inline-block">
            <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-12 h-12 text-red-500" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('candidatures.notFound') || "Appel non trouvé" }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mb-8">
            {{ t('candidatures.notFoundDescription') || "L'appel que vous recherchez n'existe pas ou n'est plus disponible." }}
          </p>
          <NuxtLink
            :to="localePath('/actualites/appels')"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 text-white font-medium rounded-lg hover:bg-brand-blue-700 transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
            {{ t('candidatures.backToCalls') || "Retour aux appels" }}
          </NuxtLink>
        </div>
      </div>

      <!-- Call is closed -->
      <div v-else-if="!isCallOpen" class="py-32">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <div class="mb-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-6 inline-block">
            <font-awesome-icon icon="fa-solid fa-lock" class="w-12 h-12 text-yellow-500" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('candidatures.closed') || "Candidatures fermées" }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mb-8">
            {{ t('candidatures.closedDescription') || "Les candidatures pour cet appel sont actuellement fermées." }}
          </p>
          <NuxtLink
            :to="localePath(`/actualites/appels/${call.slug}`)"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 text-white font-medium rounded-lg hover:bg-brand-blue-700 transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
            {{ t('candidatures.backToCall') || "Retour à l'appel" }}
          </NuxtLink>
        </div>
      </div>

      <!-- Submission success -->
      <div v-else-if="submitted" class="py-32">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <div class="mb-6 rounded-full bg-green-100 dark:bg-green-900/30 p-6 inline-block">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="w-12 h-12 text-green-500" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('candidatures.submitted') || "Candidature envoyée !" }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mb-8">
            {{ t('candidatures.submittedDescription') || "Votre candidature a été soumise avec succès. Vous recevrez un email de confirmation." }}
          </p>
          <NuxtLink
            :to="localePath('/actualites/appels')"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 text-white font-medium rounded-lg hover:bg-brand-blue-700 transition-colors"
          >
            {{ t('candidatures.browseOtherCalls') || "Voir d'autres appels" }}
          </NuxtLink>
        </div>
      </div>

      <!-- Application form -->
      <div v-else class="py-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p v-if="call.deadline" class="text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4 mr-1" />
            {{ t('candidatures.deadline') || "Date limite" }} :
            <span class="font-medium text-red-600 dark:text-red-400">
              {{ new Date(call.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </span>
          </p>
        </div>

        <!-- Form -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form @submit.prevent="submitApplication" class="space-y-8">
        <!-- Formation Choice - Fixed (when linked to call) -->
        <div v-if="call.program_external_id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-brand-blue-600" />
            {{ t('candidatures.formationChoice') || "Choix de formation" }}
          </h2>

          <div class="flex items-center gap-4 p-4 rounded-lg bg-brand-blue-50 dark:bg-brand-blue-900/20 border border-brand-blue-200 dark:border-brand-blue-800">
            <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-6 h-6 text-brand-blue-600 dark:text-brand-blue-400" />
            </div>
            <div class="flex-1">
              <!-- Afficher les détails du programme si disponibles -->
              <template v-if="linkedProgram">
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ linkedProgram.title }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ publicProgramTypeLabels[linkedProgram.type] }} - {{ linkedProgram.code }}
                </p>
              </template>
              <!-- Sinon, afficher un message générique -->
              <template v-else>
                <p class="font-semibold text-gray-900 dark:text-white">
                  {{ t('candidatures.linkedFormationForCall') || "Formation associée à cet appel" }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ t('candidatures.formationPreselected') || "La formation est présélectionnée automatiquement" }}
                </p>
              </template>
            </div>
            <div class="flex-shrink-0">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <font-awesome-icon icon="fa-solid fa-check-circle" class="w-4 h-4" />
                {{ t('candidatures.linkedFormation') || "Formation liée" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Formation Choice - Selectable (when no linked formation) -->
        <div v-else-if="programs.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-brand-blue-600" />
            {{ t('candidatures.formationChoice') || "Choix de formation" }}
          </h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('candidatures.selectFormation') || "Formation souhaitée" }} *
            </label>
            <select
              v-model="form.program_external_id"
              required
              :disabled="loadingPrograms"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">{{ t('candidatures.selectFormationPlaceholder') || "-- Sélectionnez une formation --" }}</option>
              <option v-for="program in programs" :key="program.id" :value="program.id">
                {{ program.title }} ({{ publicProgramTypeLabels[program.type] }} - {{ program.code }})
              </option>
            </select>
          </div>
        </div>

        <!-- Personal Information -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-user" class="w-5 h-5 text-brand-blue-600" />
            {{ t('candidatures.personalInfo') || "Informations personnelles" }}
          </h2>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.firstName') || "Prénom" }} *
              </label>
              <input
                v-model="form.first_name"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.lastName') || "Nom" }} *
              </label>
              <input
                v-model="form.last_name"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.email') || "Email" }} *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.phone') || "Téléphone" }} *
              </label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.nationality') || "Nationalité" }} *
              </label>
              <input
                v-model="form.nationality"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.dateOfBirth') || "Date de naissance" }} *
              </label>
              <input
                v-model="form.date_of_birth"
                type="date"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-map-marker-alt" class="w-5 h-5 text-brand-blue-600" />
            {{ t('candidatures.address') || "Adresse" }}
          </h2>

          <div class="grid gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.streetAddress') || "Adresse" }}
              </label>
              <input
                v-model="form.address"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.city') || "Ville" }}
              </label>
              <input
                v-model="form.city"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('candidatures.country') || "Pays" }} *
              </label>
              <input
                v-model="form.country"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Motivation -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-pen" class="w-5 h-5 text-brand-blue-600" />
            {{ t('candidatures.motivation') || "Motivation" }}
          </h2>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('candidatures.motivationLetter') || "Lettre de motivation" }} *
            </label>
            <textarea
              v-model="form.motivation"
              rows="6"
              required
              :placeholder="t('candidatures.motivationPlaceholder') || 'Expliquez votre motivation pour cette candidature...'"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Required Documents -->
        <div v-if="call.required_documents && call.required_documents.length > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-file-alt" class="w-5 h-5 text-brand-blue-600" />
            {{ t('candidatures.requiredDocuments') || "Documents requis" }}
          </h2>

          <div class="space-y-4">
            <div
              v-for="doc in call.required_documents"
              :key="doc.id"
              class="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-file" class="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ doc.document_name }}
                  <span v-if="doc.is_mandatory" class="text-red-500">*</span>
                </p>
                <p v-if="doc.description" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ doc.description }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span v-if="doc.accepted_formats">Formats: {{ doc.accepted_formats.toUpperCase() }}</span>
                  <span v-if="doc.max_size_mb">Max: {{ doc.max_size_mb }} Mo</span>
                </div>
                <input
                  type="file"
                  :required="doc.is_mandatory"
                  :accept="doc.accepted_formats ? `.${doc.accepted_formats.split(',').join(',.')}` : undefined"
                  class="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-blue-50 file:text-brand-blue-700 hover:file:bg-brand-blue-100 dark:file:bg-brand-blue-900/30 dark:file:text-brand-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
          {{ error }}
        </div>

        <!-- Submit button -->
        <div class="flex justify-end gap-4">
          <NuxtLink
            :to="localePath(`/actualites/appels/${call.slug}`)"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ t('common.cancel') || "Annuler" }}
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex items-center gap-2 px-8 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon v-if="submitting" icon="fa-solid fa-spinner" class="w-5 h-5 animate-spin" />
            <font-awesome-icon v-else icon="fa-solid fa-paper-plane" class="w-5 h-5" />
            {{ submitting ? (t('candidatures.submitting') || 'Envoi...') : (t('candidatures.submit') || 'Soumettre ma candidature') }}
          </button>
        </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
