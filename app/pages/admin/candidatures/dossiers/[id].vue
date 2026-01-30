<script setup lang="ts">
import type { ApplicationWithDetails, ApplicationStatus, ApplicationDocumentRead } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()

const {
  getApplicationById,
  updateApplicationStatus,
  validateDocument: apiValidateDocument,
  applicationStatusLabels,
  salutationLabels,
  maritalStatusLabels,
  employmentStatusLabels,
  experienceDurationLabels,
} = useApplicationsApi()

// === STATE ===
const loading = ref(true)
const error = ref<string | null>(null)
const application = ref<ApplicationWithDetails | null>(null)

// Onglet actif
const activeTab = ref<'personal' | 'professional' | 'academic' | 'documents' | 'evaluation'>('personal')

// Modals
const showStatusModal = ref(false)
const showDocumentModal = ref(false)
const selectedDocument = ref<ApplicationDocumentRead | null>(null)

// Formulaires
const newStatus = ref<ApplicationStatus>('submitted')
const reviewNotes = ref('')
const reviewScore = ref<number | null>(null)
const documentValidation = ref<{ is_valid: boolean; comment: string }>({ is_valid: true, comment: '' })

// === FETCH ===
async function fetchApplication() {
  loading.value = true
  error.value = null

  try {
    const data = await getApplicationById(route.params.id as string)
    application.value = data
  } catch {
    error.value = 'Candidature non trouvée'
  } finally {
    loading.value = false
  }
}

onMounted(fetchApplication)

// === COMPUTED ===
const tabs = [
  { id: 'personal', label: 'Informations personnelles', icon: 'fa-solid fa-user' },
  { id: 'professional', label: 'Situation professionnelle', icon: 'fa-solid fa-briefcase' },
  { id: 'academic', label: 'Parcours académique', icon: 'fa-solid fa-graduation-cap' },
  { id: 'documents', label: 'Documents', icon: 'fa-solid fa-file-lines' },
  { id: 'evaluation', label: 'Évaluation', icon: 'fa-solid fa-clipboard-check' },
]

const documentsValidated = computed(() => {
  if (!application.value?.documents) return 0
  return application.value.documents.filter(d => d.is_valid === true).length
})

const documentsTotal = computed(() => {
  return application.value?.documents?.length || 0
})

// === METHODS ===
const getStatusColor = (status: ApplicationStatus) => {
  const colors: Record<ApplicationStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    accepted: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    waitlisted: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    incomplete: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
}

const formatDate = (date?: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateTime = (date?: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Actions
const openStatusModal = () => {
  if (application.value) {
    newStatus.value = application.value.status
    reviewNotes.value = application.value.review_notes || ''
    reviewScore.value = application.value.review_score ? Number(application.value.review_score) : null
  }
  showStatusModal.value = true
}

const saveStatus = async () => {
  if (!application.value) return

  try {
    await updateApplicationStatus(application.value.id, {
      status: newStatus.value,
      review_notes: reviewNotes.value || null,
      review_score: reviewScore.value,
    })
    showStatusModal.value = false
    fetchApplication()
  } catch {
    error.value = 'Erreur lors de la mise à jour du statut'
  }
}

const openDocumentModal = (doc: ApplicationDocumentRead) => {
  selectedDocument.value = doc
  documentValidation.value = {
    is_valid: doc.is_valid ?? true,
    comment: doc.validation_comment || '',
  }
  showDocumentModal.value = true
}

const saveDocumentValidation = async () => {
  if (!selectedDocument.value || !application.value) return

  try {
    await apiValidateDocument(
      application.value.id,
      selectedDocument.value.id,
      documentValidation.value.is_valid,
      documentValidation.value.comment || undefined,
    )
    showDocumentModal.value = false
    fetchApplication()
  } catch {
    error.value = 'Erreur lors de la validation du document'
  }
}

const downloadDocument = (doc: ApplicationDocumentRead) => {
  // TODO: implement document download when media service is ready
  console.log('Téléchargement:', doc.media_external_id)
}

const exportPDF = () => {
  console.log('Export PDF de la candidature:', application.value?.id)
}

const goBack = () => {
  router.push('/admin/candidatures/dossiers')
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center py-12">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
  </div>

  <div v-else-if="application" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex items-start gap-4">
        <button
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-5 w-5" />
        </button>
        <div>
          <div class="mb-2 flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ application.reference_number }}</h1>
            <span :class="['inline-flex rounded-full border px-3 py-1 text-sm font-medium', getStatusColor(application.status)]">
              {{ applicationStatusLabels[application.status] }}
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-300">
            {{ application.salutation ? salutationLabels[application.salutation] + ' ' : '' }}
            {{ application.last_name }} {{ application.first_name }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ application.email }}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="openStatusModal"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-rotate-right" class="mr-2 h-4 w-4" />
          Changer le statut
        </button>
        <button
          class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="exportPDF"
        >
          <font-awesome-icon icon="fa-solid fa-file-pdf" class="mr-2 h-4 w-4" />
          Exporter PDF
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Info cards -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Date de soumission</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ formatDateTime(application.submitted_at) }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Score</p>
        <p class="font-medium text-gray-900 dark:text-white">
          {{ application.review_score ? Number(application.review_score).toFixed(1) : '-' }}
        </p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Date d'évaluation</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ formatDateTime(application.reviewed_at) }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Documents validés</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ documentsValidated }} / {{ documentsTotal }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <!-- Tab headers -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="admin-scrollbar flex overflow-x-auto" data-lenis-prevent>
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'flex whitespace-nowrap items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200',
            ]"
            @click="activeTab = tab.id as typeof activeTab"
          >
            <font-awesome-icon :icon="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab content -->
      <div class="p-6">
        <!-- Informations personnelles -->
        <div v-if="activeTab === 'personal'" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Civilité</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.salutation ? salutationLabels[application.salutation] : '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Nom</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.last_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Prénom</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.first_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Date de naissance</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ formatDate(application.birth_date) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Lieu de naissance</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.birth_city || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Situation matrimoniale</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.marital_status ? maritalStatusLabels[application.marital_status] : '-' }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Coordonnées</h3>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div class="lg:col-span-2">
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.address || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Ville</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.city || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Code postal</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.postal_code || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.phone || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.phone_whatsapp || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.email }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Situation professionnelle -->
        <div v-if="activeTab === 'professional'" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Statut professionnel</label>
              <p class="mt-1 text-gray-900 dark:text-white">
                {{ application.employment_status ? employmentStatusLabels[application.employment_status] : '-' }}
                <span v-if="application.employment_status_other" class="text-gray-500 dark:text-gray-400">
                  ({{ application.employment_status_other }})
                </span>
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Expérience professionnelle</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.has_work_experience ? 'Oui' : 'Non' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Durée d'expérience</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.experience_duration ? experienceDurationLabels[application.experience_duration] : '-' }}</p>
            </div>
          </div>

          <div v-if="application.has_work_experience" class="border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Poste actuel</h3>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Poste / Fonction</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.job_title || application.current_job || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Employeur</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.employer_name || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Ville</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.employer_city || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone employeur</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.employer_phone || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Email employeur</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.employer_email || '-' }}</p>
              </div>
              <div class="lg:col-span-3">
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Adresse employeur</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.employer_address || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Parcours académique -->
        <div v-if="activeTab === 'academic'" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Plus haut diplôme obtenu</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.highest_degree_level || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Titre du diplôme</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.highest_degree_title || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Date d'obtention</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ formatDate(application.degree_date) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Établissement</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.degree_location || '-' }}</p>
            </div>
          </div>

          <div v-if="application.degrees && application.degrees.length > 0" class="border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Liste des diplômes</h3>
            <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Titre</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Année</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Établissement</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Lieu</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Spécialisation</th>
                    <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Mention</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="degree in application.degrees" :key="degree.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ degree.title }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ degree.year || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ degree.institution || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ degree.city || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ degree.specialization || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ degree.honors || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Documents -->
        <div v-if="activeTab === 'documents'" class="space-y-6">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Documents soumis</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ documentsValidated }} / {{ documentsTotal }} documents validés
              </p>
            </div>
          </div>

          <div v-if="application.documents && application.documents.length > 0" class="space-y-4">
            <div
              v-for="doc in application.documents"
              :key="doc.id"
              class="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <div class="flex items-center gap-4">
                <div class="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
                  <font-awesome-icon icon="fa-solid fa-file-lines" class="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ doc.document_name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Ajouté le {{ formatDate(doc.created_at) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span
                  v-if="doc.is_valid === true"
                  class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  <font-awesome-icon icon="fa-solid fa-check" class="h-3 w-3" />
                  Validé
                </span>
                <span
                  v-else-if="doc.is_valid === false"
                  class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
                  Rejeté
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  <font-awesome-icon icon="fa-solid fa-clock" class="h-3 w-3" />
                  En attente
                </span>
                <div class="flex items-center gap-2">
                  <button
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                    title="Télécharger"
                    @click="downloadDocument(doc)"
                  >
                    <font-awesome-icon icon="fa-solid fa-download" class="h-5 w-5" />
                  </button>
                  <button
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                    title="Valider/Rejeter"
                    @click="openDocumentModal(doc)"
                  >
                    <font-awesome-icon icon="fa-solid fa-clipboard-check" class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-gray-500 dark:text-gray-400">
            Aucun document soumis
          </div>
        </div>

        <!-- Évaluation -->
        <div v-if="activeTab === 'evaluation'" class="space-y-6">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Score</label>
              <p class="mt-1">
                <span v-if="application.review_score" class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ Number(application.review_score).toFixed(1) }}
                </span>
                <span v-else class="text-gray-500 dark:text-gray-400">Non évalué</span>
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Date d'évaluation</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ formatDateTime(application.reviewed_at) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Statut actuel</label>
              <p class="mt-1">
                <span :class="['inline-flex rounded-full border px-3 py-1 text-sm font-medium', getStatusColor(application.status)]">
                  {{ applicationStatusLabels[application.status] }}
                </span>
              </p>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
            <label class="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">Notes d'évaluation</label>
            <div v-if="application.review_notes" class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50">
              <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ application.review_notes }}</p>
            </div>
            <p v-else class="italic text-gray-500 dark:text-gray-400">Aucune note d'évaluation</p>
          </div>

          <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
            <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Actions rapides</h3>
            <div class="flex flex-wrap gap-3">
              <button
                class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="openStatusModal"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-rotate-right" class="mr-2 h-4 w-4" />
                Changer le statut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Changement de statut -->
    <Teleport to="body">
      <div
        v-if="showStatusModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showStatusModal = false"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Changer le statut</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau statut</label>
              <select
                v-model="newStatus"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option v-for="(label, status) in applicationStatusLabels" :key="status" :value="status">
                  {{ label }}
                </option>
              </select>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Score (optionnel)</label>
              <input
                v-model.number="reviewScore"
                type="number"
                min="0"
                max="100"
                step="0.5"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: 85.5"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes d'évaluation</label>
              <textarea
                v-model="reviewNotes"
                rows="4"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Commentaires sur la candidature..."
              ></textarea>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showStatusModal = false"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              @click="saveStatus"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Validation document -->
    <Teleport to="body">
      <div
        v-if="showDocumentModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDocumentModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Valider le document</h3>
          <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">{{ selectedDocument?.document_name }}</p>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Décision</label>
              <div class="flex gap-4">
                <label class="flex cursor-pointer items-center">
                  <input
                    v-model="documentValidation.is_valid"
                    :value="true"
                    type="radio"
                    class="text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Valider</span>
                </label>
                <label class="flex cursor-pointer items-center">
                  <input
                    v-model="documentValidation.is_valid"
                    :value="false"
                    type="radio"
                    class="text-red-600 focus:ring-red-500 dark:bg-gray-700"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Rejeter</span>
                </label>
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Commentaire (optionnel)</label>
              <textarea
                v-model="documentValidation.comment"
                rows="3"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Raison du rejet ou commentaire..."
              ></textarea>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDocumentModal = false"
            >
              Annuler
            </button>
            <button
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                documentValidation.is_valid
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700',
              ]"
              @click="saveDocumentValidation"
            >
              {{ documentValidation.is_valid ? 'Valider' : 'Rejeter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- Not found -->
  <div v-else class="py-12 text-center">
    <div class="mb-4 inline-flex rounded-full bg-gray-100 p-4 dark:bg-gray-700">
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="h-16 w-16 text-gray-400" />
    </div>
    <h2 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Candidature non trouvée</h2>
    <p class="mb-4 text-gray-500 dark:text-gray-400">La candidature demandée n'existe pas ou a été supprimée.</p>
    <NuxtLink
      to="/admin/candidatures/dossiers"
      class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      <font-awesome-icon icon="fa-solid fa-arrow-left" class="mr-2 h-5 w-5" />
      Retour à la liste
    </NuxtLink>
  </div>
</template>
