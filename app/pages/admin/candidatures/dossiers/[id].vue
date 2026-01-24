<script setup lang="ts">
import type { Application, ApplicationStatus } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getApplicationById,
  getAllReviewers,
  applicationStatusLabels,
  applicationStatusColors,
  salutationLabels,
  maritalStatusLabels,
  employmentStatusLabels,
  experienceDurationLabels
} = useMockData()

// === STATE ===
const applicationId = computed(() => route.params.id as string)
const application = computed(() => getApplicationById(applicationId.value))
const allReviewers = computed(() => getAllReviewers())

// Onglet actif
const activeTab = ref<'personal' | 'professional' | 'academic' | 'documents' | 'evaluation'>('personal')

// Modals
const showStatusModal = ref(false)
const showAssignModal = ref(false)
const showDocumentModal = ref(false)
const selectedDocument = ref<Application['documents'][number] | null>(null)

// Formulaires
const newStatus = ref<ApplicationStatus>('submitted')
const newReviewerId = ref('')
const reviewNotes = ref('')
const reviewScore = ref<number | null>(null)
const documentValidation = ref<{ is_valid: boolean; comment: string }>({ is_valid: true, comment: '' })

// === COMPUTED ===
const tabs = [
  { id: 'personal', label: 'Informations personnelles', icon: 'fa-solid fa-user' },
  { id: 'professional', label: 'Situation professionnelle', icon: 'fa-solid fa-briefcase' },
  { id: 'academic', label: 'Parcours académique', icon: 'fa-solid fa-graduation-cap' },
  { id: 'documents', label: 'Documents', icon: 'fa-solid fa-file-lines' },
  { id: 'evaluation', label: 'Évaluation', icon: 'fa-solid fa-clipboard-check' }
]

// === METHODS ===
const getStatusColor = (status: ApplicationStatus) => {
  const colors: Record<ApplicationStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    accepted: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    waitlisted: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    incomplete: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Actions
const openStatusModal = () => {
  if (application.value) {
    newStatus.value = application.value.status
    reviewNotes.value = application.value.review_notes || ''
    reviewScore.value = application.value.review_score || null
  }
  showStatusModal.value = true
}

const saveStatus = () => {
  console.log('Changement de statut:', {
    status: newStatus.value,
    notes: reviewNotes.value,
    score: reviewScore.value
  })
  showStatusModal.value = false
}

const openAssignModal = () => {
  if (application.value) {
    newReviewerId.value = application.value.reviewer_external_id || ''
  }
  showAssignModal.value = true
}

const saveReviewer = () => {
  console.log('Assignation évaluateur:', newReviewerId.value)
  showAssignModal.value = false
}

const openDocumentModal = (doc: Application['documents'][number]) => {
  selectedDocument.value = doc
  documentValidation.value = {
    is_valid: doc.is_valid ?? true,
    comment: doc.validation_comment || ''
  }
  showDocumentModal.value = true
}

const saveDocumentValidation = () => {
  console.log('Validation document:', {
    document: selectedDocument.value?.id,
    ...documentValidation.value
  })
  showDocumentModal.value = false
}

const downloadDocument = (doc: Application['documents'][number]) => {
  console.log('Téléchargement:', doc.file_url)
}

const exportPDF = () => {
  console.log('Export PDF de la candidature:', applicationId.value)
}

const goBack = () => {
  router.push('/admin/candidatures/dossiers')
}

// Redirect if not found
if (!application.value) {
  navigateTo('/admin/candidatures/dossiers')
}
</script>

<template>
  <div v-if="application" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex items-start gap-4">
        <button
          @click="goBack"
          class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5" />
        </button>
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ application.reference_number }}</h1>
            <span :class="['inline-flex px-3 py-1 text-sm font-medium rounded-full border', getStatusColor(application.status)]">
              {{ applicationStatusLabels[application.status] }}
            </span>
          </div>
          <p class="text-gray-600 dark:text-gray-300">
            {{ salutationLabels[application.salutation!] || '' }}
            {{ application.last_name }} {{ application.first_name }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ application.email }}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          @click="openStatusModal"
          class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-rotate-right" class="w-4 h-4 mr-2" />
          Changer le statut
        </button>
        <button
          @click="openAssignModal"
          class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <font-awesome-icon icon="fa-solid fa-user-plus" class="w-4 h-4 mr-2" />
          Assigner
        </button>
        <button
          @click="exportPDF"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-4 h-4 mr-2" />
          Exporter PDF
        </button>
      </div>
    </div>

    <!-- Info cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Appel</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ application.call?.title || '-' }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Programme</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ application.program?.title || '-' }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Date de soumission</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ formatDateTime(application.submitted_at) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <p class="text-xs text-gray-500 dark:text-gray-400">Évaluateur</p>
        <p class="font-medium text-gray-900 dark:text-white">{{ application.reviewer?.name || 'Non assigné' }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <!-- Tab headers -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex overflow-x-auto admin-scrollbar" data-lenis-prevent>
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id as typeof activeTab"
            :class="[
              'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            ]"
          >
            <font-awesome-icon :icon="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab content -->
      <div class="p-6">
        <!-- Informations personnelles -->
        <div v-if="activeTab === 'personal'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Civilité</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ salutationLabels[application.salutation!] || '-' }}</p>
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
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.birth_city || '-' }}, {{ application.birth_country || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Nationalité</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.nationality || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Situation matrimoniale</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ maritalStatusLabels[application.marital_status!] || '-' }}</p>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Coordonnées</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Pays</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.country || '-' }}</p>
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Statut professionnel</label>
              <p class="mt-1 text-gray-900 dark:text-white">
                {{ employmentStatusLabels[application.employment_status!] || '-' }}
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
              <p class="mt-1 text-gray-900 dark:text-white">{{ experienceDurationLabels[application.experience_duration!] || '-' }}</p>
            </div>
          </div>

          <div v-if="application.has_work_experience" class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Poste actuel</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Pays</label>
                <p class="mt-1 text-gray-900 dark:text-white">{{ application.employer_country || '-' }}</p>
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div v-if="application.degrees && application.degrees.length > 0" class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Liste des diplômes</h3>
            <div class="overflow-x-auto admin-scrollbar" data-lenis-prevent>
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
                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ degree.city }}, {{ degree.country }}</td>
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
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Documents soumis</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ application.documents_validated || 0 }} / {{ application.documents_total || 0 }} documents validés
              </p>
            </div>
          </div>

          <div v-if="application.documents && application.documents.length > 0" class="space-y-4">
            <div
              v-for="doc in application.documents"
              :key="doc.id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex items-center gap-4">
                <div class="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <font-awesome-icon icon="fa-solid fa-file-lines" class="w-6 h-6 text-gray-500 dark:text-gray-400" />
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
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3" />
                  Validé
                </span>
                <span
                  v-else-if="doc.is_valid === false"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" class="w-3 h-3" />
                  Rejeté
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3" />
                  En attente
                </span>
                <div class="flex items-center gap-2">
                  <button
                    @click="downloadDocument(doc)"
                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <font-awesome-icon icon="fa-solid fa-download" class="w-5 h-5" />
                  </button>
                  <button
                    @click="openDocumentModal(doc)"
                    class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Valider/Rejeter"
                  >
                    <font-awesome-icon icon="fa-solid fa-clipboard-check" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucun document soumis
          </div>
        </div>

        <!-- Évaluation -->
        <div v-if="activeTab === 'evaluation'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Évaluateur assigné</label>
              <p class="mt-1 text-gray-900 dark:text-white">{{ application.reviewer?.name || 'Non assigné' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Score</label>
              <p class="mt-1">
                <span v-if="application.review_score" class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ application.review_score.toFixed(1) }}
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
                <span :class="['inline-flex px-3 py-1 text-sm font-medium rounded-full border', getStatusColor(application.status)]">
                  {{ applicationStatusLabels[application.status] }}
                </span>
              </p>
            </div>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes d'évaluation</label>
            <div v-if="application.review_notes" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ application.review_notes }}</p>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400 italic">Aucune note d'évaluation</p>
          </div>

          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Actions rapides</h3>
            <div class="flex flex-wrap gap-3">
              <button
                @click="openStatusModal"
                class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-rotate-right" class="w-4 h-4 mr-2" />
                Changer le statut
              </button>
              <button
                @click="openAssignModal"
                class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <font-awesome-icon icon="fa-solid fa-user-plus" class="w-4 h-4 mr-2" />
                Réassigner
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
        <div class="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Changer le statut</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau statut</label>
              <select
                v-model="newStatus"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option v-for="(label, status) in applicationStatusLabels" :key="status" :value="status">
                  {{ label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score (optionnel)</label>
              <input
                v-model.number="reviewScore"
                type="number"
                min="0"
                max="100"
                step="0.5"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: 85.5"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes d'évaluation</label>
              <textarea
                v-model="reviewNotes"
                rows="4"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Commentaires sur la candidature..."
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showStatusModal = false"
              class="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="saveStatus"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Assignation -->
    <Teleport to="body">
      <div
        v-if="showAssignModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showAssignModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigner un évaluateur</h3>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Évaluateur</label>
            <select
              v-model="newReviewerId"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Aucun (désassigner)</option>
              <option v-for="reviewer in allReviewers" :key="reviewer.id" :value="reviewer.id">
                {{ reviewer.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button
              @click="showAssignModal = false"
              class="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="saveReviewer"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
        <div class="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Valider le document</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ selectedDocument?.document_name }}</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Décision</label>
              <div class="flex gap-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="documentValidation.is_valid"
                    :value="true"
                    type="radio"
                    class="text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Valider</span>
                </label>
                <label class="flex items-center cursor-pointer">
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commentaire (optionnel)</label>
              <textarea
                v-model="documentValidation.comment"
                rows="3"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Raison du rejet ou commentaire..."
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showDocumentModal = false"
              class="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              @click="saveDocumentValidation"
              :class="[
                'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                documentValidation.is_valid
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              ]"
            >
              {{ documentValidation.is_valid ? 'Valider' : 'Rejeter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- Not found -->
  <div v-else class="text-center py-12">
    <div class="mb-4 rounded-full bg-gray-100 dark:bg-gray-700 p-4 inline-flex">
      <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-16 h-16 text-gray-400" />
    </div>
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Candidature non trouvée</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-4">La candidature demandée n'existe pas ou a été supprimée.</p>
    <NuxtLink
      to="/admin/candidatures/dossiers"
      class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5 mr-2" />
      Retour à la liste
    </NuxtLink>
  </div>
</template>
