<script setup lang="ts">
import type { ApplicationCallWithDetails } from '~/types/api'
import {
  callTypeLabels,
  callTypeColors,
  callStatusLabels,
  callStatusColors,
  publicationStatusLabels,
  publicationStatusColors,
} from '~/composables/useApplicationCallsApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const route = useRoute()
const router = useRouter()

const {
  getCallById,
  togglePublication,
  updateCallStatus,
  createCall: apiCreateCall,
} = useApplicationCallsApi()

// === STATE ===
const call = ref<ApplicationCallWithDetails | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const actionLoading = ref(false)

// === FETCH ===
async function fetchCall() {
  loading.value = true
  error.value = null
  try {
    call.value = await getCallById(route.params.id as string)
  } catch {
    error.value = 'Erreur lors du chargement de l\'appel'
  } finally {
    loading.value = false
  }
}

onMounted(fetchCall)

// === NAVIGATION ===
const goBack = () => {
  router.push('/admin/candidatures/appels')
}

const editCall = () => {
  router.push(`/admin/candidatures/appels/${route.params.id}/edit`)
}

const duplicateCall = async () => {
  if (!call.value) return
  actionLoading.value = true
  try {
    const original = call.value
    const result = await apiCreateCall({
      title: `${original.title} (copie)`,
      slug: `${original.slug}-copie-${Date.now()}`,
      description: original.description,
      type: original.type,
      status: 'upcoming',
      opening_date: original.opening_date,
      deadline: original.deadline,
      program_start_date: original.program_start_date,
      program_end_date: original.program_end_date,
      target_audience: original.target_audience,
      registration_fee: original.registration_fee,
      currency: original.currency,
      use_internal_form: original.use_internal_form,
      external_form_url: original.external_form_url,
      publication_status: 'draft',
    })
    router.push(`/admin/candidatures/appels/${result.id}`)
  } catch {
    error.value = 'Erreur lors de la duplication'
  } finally {
    actionLoading.value = false
  }
}

// === FORMATAGE ===
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const isDeadlinePassed = (deadline?: string | null) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const getDaysRemaining = (deadline?: string | null) => {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// === ACTIONS ===
const togglePublish = async () => {
  if (!call.value) return
  actionLoading.value = true
  try {
    await togglePublication(call.value.id)
    await fetchCall()
  } catch {
    error.value = 'Erreur lors du changement de publication'
  } finally {
    actionLoading.value = false
  }
}

const closeCall = async () => {
  if (!call.value) return
  actionLoading.value = true
  try {
    await updateCallStatus(call.value.id, 'closed')
    await fetchCall()
  } catch {
    error.value = 'Erreur lors de la fermeture'
  } finally {
    actionLoading.value = false
  }
}

const reopenCall = async () => {
  if (!call.value) return
  actionLoading.value = true
  try {
    await updateCallStatus(call.value.id, 'ongoing')
    await fetchCall()
  } catch {
    error.value = 'Erreur lors de la réouverture'
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center py-12">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>

  <!-- Error -->
  <div v-else-if="error && !call" class="flex flex-col items-center justify-center py-12">
    <div class="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="h-8 w-8 text-red-400" />
    </div>
    <h3 class="mb-2 font-medium text-gray-900 dark:text-white">Erreur</h3>
    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">{{ error }}</p>
    <button
      class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      @click="goBack"
    >
      Retour à la liste
    </button>
  </div>

  <div v-else-if="call" class="space-y-6">
    <!-- Error banner (for action errors) -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-4">
        <button
          class="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 w-4" />
        </button>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ call.title }}
            </h1>
            <span
              class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
              :class="callTypeColors[call.type]"
            >
              {{ callTypeLabels[call.type] }}
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ call.slug }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="duplicateCall"
        >
          <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
          Dupliquer
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="editCall"
        >
          <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
          Modifier
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Colonne principale -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Description -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Description
          </h2>
          <div class="prose prose-sm max-w-none dark:prose-invert">
            <p class="whitespace-pre-line text-gray-600 dark:text-gray-300">
              {{ call.description || 'Aucune description.' }}
            </p>
          </div>
        </div>

        <!-- Critères d'éligibilité -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Critères d'éligibilité
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ call.eligibility_criteria?.length || 0 }} critère(s)
            </span>
          </div>

          <div v-if="call.eligibility_criteria && call.eligibility_criteria.length > 0" class="space-y-3">
            <div
              v-for="criterion in call.eligibility_criteria"
              :key="criterion.id"
              class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div
                class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                :class="criterion.is_mandatory ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'"
              >
                <font-awesome-icon
                  :icon="criterion.is_mandatory ? 'fa-solid fa-asterisk' : 'fa-solid fa-check'"
                  class="h-3 w-3"
                />
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {{ criterion.criterion }}
                </p>
                <span
                  v-if="criterion.is_mandatory"
                  class="mt-1 inline-flex text-xs text-red-600 dark:text-red-400"
                >
                  Obligatoire
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            Aucun critère défini.
          </p>
        </div>

        <!-- Prises en charge -->
        <div v-if="call.coverage && call.coverage.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Prises en charge
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ call.coverage.length }} élément(s)
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in call.coverage"
              :key="item.id"
              class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <font-awesome-icon icon="fa-solid fa-check" class="h-3 w-3" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-700 dark:text-gray-300">
                  {{ item.item }}
                </p>
                <p v-if="item.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents requis -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Documents requis
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ call.required_documents?.length || 0 }} document(s)
            </span>
          </div>

          <div v-if="call.required_documents && call.required_documents.length > 0" class="space-y-3">
            <div
              v-for="doc in call.required_documents"
              :key="doc.id"
              class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <font-awesome-icon icon="fa-solid fa-file" class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-700 dark:text-gray-300">
                      {{ doc.document_name }}
                      <span v-if="doc.is_mandatory" class="ml-1 text-red-600">*</span>
                    </p>
                    <p v-if="doc.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {{ doc.description }}
                    </p>
                    <div class="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span v-if="doc.accepted_formats" class="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                        {{ doc.accepted_formats.toUpperCase() }}
                      </span>
                      <span v-if="doc.max_size_mb" class="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
                        Max {{ doc.max_size_mb }} Mo
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  v-if="doc.is_mandatory"
                  class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400"
                >
                  Obligatoire
                </span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            Aucun document requis défini.
          </p>
        </div>

        <!-- Calendrier -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Calendrier
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ call.schedule?.length || 0 }} étape(s)
            </span>
          </div>

          <div v-if="call.schedule && call.schedule.length > 0" class="relative">
            <!-- Ligne verticale -->
            <div class="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            <div class="space-y-4">
              <div
                v-for="(step, index) in call.schedule"
                :key="step.id"
                class="relative flex gap-4 pl-2"
              >
                <!-- Point sur la ligne -->
                <div
                  class="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-white dark:bg-gray-800"
                >
                  <span class="text-xs font-bold text-blue-600">{{ index + 1 }}</span>
                </div>

                <!-- Contenu -->
                <div class="flex-1 pb-4">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ step.step }}
                  </p>
                  <div class="mt-1 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span v-if="step.start_date">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="mr-1 h-3 w-3" />
                      {{ formatDate(step.start_date) }}
                    </span>
                    <span v-if="step.end_date && step.start_date !== step.end_date">
                      - {{ formatDate(step.end_date) }}
                    </span>
                    <span v-if="!step.start_date && step.end_date">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="mr-1 h-3 w-3" />
                      {{ formatDate(step.end_date) }}
                    </span>
                  </div>
                  <p v-if="step.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ step.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            Aucun calendrier défini.
          </p>
        </div>
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <!-- Statuts -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Statuts
          </h2>

          <div class="space-y-4">
            <!-- Statut de l'appel -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">Statut</span>
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                :class="callStatusColors[call.status]"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="{
                    'bg-green-500': call.status === 'ongoing',
                    'bg-yellow-500': call.status === 'upcoming',
                    'bg-gray-500': call.status === 'closed'
                  }"
                ></span>
                {{ callStatusLabels[call.status] }}
              </span>
            </div>

            <!-- Publication -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500 dark:text-gray-400">Publication</span>
              <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                :class="publicationStatusColors[call.publication_status]"
              >
                {{ publicationStatusLabels[call.publication_status] }}
              </span>
            </div>

          </div>

          <!-- Actions -->
          <div class="mt-6 space-y-2">
            <button
              v-if="call.publication_status === 'draft'"
              class="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              @click="togglePublish"
            >
              <font-awesome-icon icon="fa-solid fa-globe" class="mr-2 h-4 w-4" />
              Publier
            </button>
            <button
              v-else-if="call.publication_status === 'published'"
              class="w-full rounded-lg border border-yellow-600 px-4 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              @click="togglePublish"
            >
              <font-awesome-icon icon="fa-solid fa-eye-slash" class="mr-2 h-4 w-4" />
              Dépublier
            </button>

            <button
              v-if="call.status !== 'closed'"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeCall"
            >
              <font-awesome-icon icon="fa-solid fa-lock" class="mr-2 h-4 w-4" />
              Fermer l'appel
            </button>
            <button
              v-else
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="reopenCall"
            >
              <font-awesome-icon icon="fa-solid fa-lock-open" class="mr-2 h-4 w-4" />
              Rouvrir l'appel
            </button>
          </div>
        </div>

        <!-- Dates -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Dates importantes
          </h2>

          <div class="space-y-4">
            <div v-if="call.opening_date">
              <p class="text-xs text-gray-500 dark:text-gray-400">Ouverture</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(call.opening_date) }}
              </p>
            </div>

            <div v-if="call.deadline">
              <p class="text-xs text-gray-500 dark:text-gray-400">Date limite</p>
              <p
                class="text-sm font-medium"
                :class="isDeadlinePassed(call.deadline) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'"
              >
                {{ formatDateTime(call.deadline) }}
              </p>
              <p
                v-if="!isDeadlinePassed(call.deadline) && getDaysRemaining(call.deadline)"
                class="text-xs text-orange-600 dark:text-orange-400"
              >
                {{ getDaysRemaining(call.deadline) }} jour(s) restant(s)
              </p>
              <p
                v-else-if="isDeadlinePassed(call.deadline)"
                class="text-xs text-red-600 dark:text-red-400"
              >
                Date limite dépassée
              </p>
            </div>

            <div v-if="call.program_start_date">
              <p class="text-xs text-gray-500 dark:text-gray-400">Début du programme</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(call.program_start_date) }}
              </p>
            </div>

            <div v-if="call.program_end_date">
              <p class="text-xs text-gray-500 dark:text-gray-400">Fin du programme</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(call.program_end_date) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Informations complémentaires -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informations
          </h2>

          <div class="space-y-4">
            <div v-if="call.target_audience">
              <p class="text-xs text-gray-500 dark:text-gray-400">Public cible</p>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ call.target_audience }}
              </p>
            </div>

            <div v-if="call.registration_fee">
              <p class="text-xs text-gray-500 dark:text-gray-400">Frais d'inscription</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ call.registration_fee }} {{ call.currency }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Formulaire</p>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ call.use_internal_form ? 'Formulaire interne' : 'Formulaire externe' }}
              </p>
              <a
                v-if="!call.use_internal_form && call.external_form_url"
                :href="call.external_form_url"
                target="_blank"
                class="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                <font-awesome-icon icon="fa-solid fa-external-link" class="h-3 w-3" />
                Voir le formulaire externe
              </a>
            </div>
          </div>
        </div>

        <!-- Métadonnées -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Métadonnées
          </h2>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">ID</span>
              <span class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ call.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Créé le</span>
              <span class="text-gray-700 dark:text-gray-300">{{ formatDate(call.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-gray-400">Modifié le</span>
              <span class="text-gray-700 dark:text-gray-300">{{ formatDate(call.updated_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Liens rapides -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Liens rapides
          </h2>

          <div class="space-y-2">
            <NuxtLink
              :to="`/admin/candidatures/dossiers?call_id=${call.id}`"
              class="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <font-awesome-icon icon="fa-solid fa-folder-open" class="h-4 w-4 text-gray-400" />
              Voir les candidatures
            </NuxtLink>
            <button
              class="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <font-awesome-icon icon="fa-solid fa-chart-pie" class="h-4 w-4 text-gray-400" />
              Statistiques de l'appel
            </button>
            <button
              class="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4 text-gray-400" />
              Aperçu public
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- État non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-12">
    <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="h-8 w-8 text-gray-400" />
    </div>
    <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
      Appel non trouvé
    </h3>
    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
      L'appel que vous recherchez n'existe pas ou a été supprimé.
    </p>
    <button
      class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      @click="goBack"
    >
      Retour à la liste
    </button>
  </div>
</template>
