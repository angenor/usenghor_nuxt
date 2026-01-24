<script setup lang="ts">
import type { ApplicationCall, CallType, PublicationStatus, EligibilityCriteria, CallCoverage, RequiredDocument, CallScheduleItem } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getApplicationCallById,
  callTypeLabels,
  generateCriteriaId,
  generateCoverageId,
  generateDocumentId,
  generateScheduleId
} = useMockData()

// Récupérer l'appel existant
const existingCall = computed(() => getApplicationCallById(route.params.id as string))

// Onglet actif
const activeTab = ref<'general' | 'dates' | 'eligibility' | 'coverage' | 'documents' | 'schedule' | 'options'>('general')

// État du formulaire
const form = ref<Partial<ApplicationCall>>({
  title: '',
  slug: '',
  description: '',
  type: 'application',
  status: 'upcoming',
  opening_date: '',
  deadline: '',
  program_start_date: '',
  program_end_date: '',
  target_audience: '',
  registration_fee: undefined,
  currency: 'EUR',
  use_internal_form: true,
  external_form_url: '',
  publication_status: 'draft',
  eligibility_criteria: [],
  coverage: [],
  required_documents: [],
  schedule: []
})

// Initialiser le formulaire avec les données existantes
onMounted(() => {
  if (existingCall.value) {
    form.value = {
      ...existingCall.value,
      opening_date: existingCall.value.opening_date?.split('T')[0] || '',
      deadline: existingCall.value.deadline?.split('T')[0] || '',
      program_start_date: existingCall.value.program_start_date?.split('T')[0] || '',
      program_end_date: existingCall.value.program_end_date?.split('T')[0] || '',
      eligibility_criteria: [...(existingCall.value.eligibility_criteria || [])],
      coverage: [...(existingCall.value.coverage || [])],
      required_documents: [...(existingCall.value.required_documents || [])],
      schedule: [...(existingCall.value.schedule || [])]
    }
  }
})

// Auto-génération du slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

watch(() => form.value.title, (newTitle) => {
  if (newTitle && !existingCall.value) {
    form.value.slug = generateSlug(newTitle)
  }
})

// Navigation
const goBack = () => {
  router.push(`/admin/candidatures/appels/${route.params.id}`)
}

// === GESTION DES CRITÈRES D'ÉLIGIBILITÉ ===
const newCriterion = ref({ criterion: '', is_mandatory: true })

const addCriterion = () => {
  if (!newCriterion.value.criterion.trim()) return
  const criteria = form.value.eligibility_criteria || []
  criteria.push({
    id: generateCriteriaId(),
    call_id: form.value.id || '',
    criterion: newCriterion.value.criterion,
    is_mandatory: newCriterion.value.is_mandatory,
    display_order: criteria.length + 1
  })
  form.value.eligibility_criteria = criteria
  newCriterion.value = { criterion: '', is_mandatory: true }
}

const removeCriterion = (index: number) => {
  form.value.eligibility_criteria?.splice(index, 1)
}

// === GESTION DES PRISES EN CHARGE ===
const newCoverage = ref({ item: '', description: '' })

const addCoverage = () => {
  if (!newCoverage.value.item.trim()) return
  const coverage = form.value.coverage || []
  coverage.push({
    id: generateCoverageId(),
    call_id: form.value.id || '',
    item: newCoverage.value.item,
    description: newCoverage.value.description || undefined,
    display_order: coverage.length + 1
  })
  form.value.coverage = coverage
  newCoverage.value = { item: '', description: '' }
}

const removeCoverage = (index: number) => {
  form.value.coverage?.splice(index, 1)
}

// === GESTION DES DOCUMENTS ===
const newDocument = ref({
  document_name: '',
  description: '',
  is_mandatory: true,
  accepted_formats: 'pdf',
  max_size_mb: 5
})

const addDocument = () => {
  if (!newDocument.value.document_name.trim()) return
  const documents = form.value.required_documents || []
  documents.push({
    id: generateDocumentId(),
    call_id: form.value.id || '',
    document_name: newDocument.value.document_name,
    description: newDocument.value.description || undefined,
    is_mandatory: newDocument.value.is_mandatory,
    accepted_formats: newDocument.value.accepted_formats || undefined,
    max_size_mb: newDocument.value.max_size_mb || undefined,
    display_order: documents.length + 1
  })
  form.value.required_documents = documents
  newDocument.value = {
    document_name: '',
    description: '',
    is_mandatory: true,
    accepted_formats: 'pdf',
    max_size_mb: 5
  }
}

const removeDocument = (index: number) => {
  form.value.required_documents?.splice(index, 1)
}

// === GESTION DU CALENDRIER ===
const newScheduleItem = ref({
  step: '',
  start_date: '',
  end_date: '',
  description: ''
})

const addScheduleItem = () => {
  if (!newScheduleItem.value.step.trim()) return
  const schedule = form.value.schedule || []
  schedule.push({
    id: generateScheduleId(),
    call_id: form.value.id || '',
    step: newScheduleItem.value.step,
    start_date: newScheduleItem.value.start_date || undefined,
    end_date: newScheduleItem.value.end_date || undefined,
    description: newScheduleItem.value.description || undefined,
    display_order: schedule.length + 1
  })
  form.value.schedule = schedule
  newScheduleItem.value = { step: '', start_date: '', end_date: '', description: '' }
}

const removeScheduleItem = (index: number) => {
  form.value.schedule?.splice(index, 1)
}

// === SAUVEGARDE ===
const isSaving = ref(false)

const saveForm = async () => {
  isSaving.value = true
  try {
    console.log('Saving form:', form.value)
    // En production: PUT /api/admin/application-calls/{id}
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push(`/admin/candidatures/appels/${route.params.id}`)
  } finally {
    isSaving.value = false
  }
}

const saveDraft = async () => {
  form.value.publication_status = 'draft'
  await saveForm()
}

const saveAndPublish = async () => {
  form.value.publication_status = 'published'
  await saveForm()
}

// Onglets
const tabs = [
  { id: 'general', label: 'Informations générales', icon: 'fa-solid fa-info-circle' },
  { id: 'dates', label: 'Dates et tarifs', icon: 'fa-solid fa-calendar' },
  { id: 'eligibility', label: 'Éligibilité', icon: 'fa-solid fa-check-circle' },
  { id: 'coverage', label: 'Prises en charge', icon: 'fa-solid fa-hand-holding-heart' },
  { id: 'documents', label: 'Documents', icon: 'fa-solid fa-file-alt' },
  { id: 'schedule', label: 'Calendrier', icon: 'fa-solid fa-clock' },
  { id: 'options', label: 'Options', icon: 'fa-solid fa-cog' }
] as const
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <button
          class="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 w-4" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier l'appel
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ existingCall?.title || 'Nouvel appel' }}
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="isSaving"
          @click="saveDraft"
        >
          <font-awesome-icon icon="fa-solid fa-save" class="h-4 w-4" />
          Enregistrer
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          :disabled="isSaving"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-globe" class="h-4 w-4" />
          Publier
        </button>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="admin-scrollbar -mb-px flex gap-4 overflow-x-auto" data-lenis-prevent>
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors"
          :class="activeTab === tab.id
            ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          @click="activeTab = tab.id"
        >
          <font-awesome-icon :icon="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <!-- Onglet: Informations générales -->
      <div v-show="activeTab === 'general'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Titre *
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="Ex: Appel à candidatures Master 2025-2026"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug *
            </label>
            <input
              v-model="form.slug"
              type="text"
              required
              placeholder="appel-candidatures-master-2025-2026"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p class="mt-1 text-xs text-gray-500">Auto-généré depuis le titre</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type *
            </label>
            <select
              v-model="form.type"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="application">Candidature</option>
              <option value="scholarship">Bourse</option>
              <option value="project">Projet</option>
              <option value="recruitment">Recrutement</option>
              <option value="training">Formation</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Public cible
            </label>
            <input
              v-model="form.target_audience"
              type="text"
              placeholder="Ex: Cadres africains titulaires d'un Bac+4"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="5"
              placeholder="Description détaillée de l'appel..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Onglet: Dates et tarifs -->
      <div v-show="activeTab === 'dates'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date d'ouverture
            </label>
            <input
              v-model="form.opening_date"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date limite de candidature *
            </label>
            <input
              v-model="form.deadline"
              type="date"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de début du programme
            </label>
            <input
              v-model="form.program_start_date"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de fin du programme
            </label>
            <input
              v-model="form.program_end_date"
              type="date"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Frais d'inscription
            </label>
            <input
              v-model.number="form.registration_fee"
              type="number"
              min="0"
              placeholder="0"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Devise
            </label>
            <select
              v-model="form.currency"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar américain</option>
              <option value="XOF">XOF - Franc CFA</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Onglet: Éligibilité -->
      <div v-show="activeTab === 'eligibility'" class="space-y-6">
        <div>
          <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Critères d'éligibilité
          </h3>

          <!-- Liste des critères -->
          <div v-if="form.eligibility_criteria && form.eligibility_criteria.length > 0" class="mb-4 space-y-2">
            <div
              v-for="(criterion, index) in form.eligibility_criteria"
              :key="criterion.id"
              class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {{ index + 1 }}
              </span>
              <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {{ criterion.criterion }}
              </span>
              <span
                v-if="criterion.is_mandatory"
                class="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400"
              >
                Obligatoire
              </span>
              <span
                v-else
                class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                Optionnel
              </span>
              <button
                class="text-red-500 hover:text-red-700"
                @click="removeCriterion(index)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Ajouter un critère -->
          <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <div class="space-y-3">
              <input
                v-model="newCriterion.criterion"
                type="text"
                placeholder="Texte du critère..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @keyup.enter="addCriterion"
              />
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2">
                  <input
                    v-model="newCriterion.is_mandatory"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Obligatoire</span>
                </label>
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  @click="addCriterion"
                >
                  <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet: Prises en charge -->
      <div v-show="activeTab === 'coverage'" class="space-y-6">
        <div>
          <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Éléments pris en charge
          </h3>

          <!-- Liste des prises en charge -->
          <div v-if="form.coverage && form.coverage.length > 0" class="mb-4 space-y-2">
            <div
              v-for="(item, index) in form.coverage"
              :key="item.id"
              class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <font-awesome-icon icon="fa-solid fa-check" class="h-3 w-3" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-700 dark:text-gray-300">{{ item.item }}</p>
                <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">{{ item.description }}</p>
              </div>
              <button
                class="text-red-500 hover:text-red-700"
                @click="removeCoverage(index)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Ajouter une prise en charge -->
          <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <div class="space-y-3">
              <input
                v-model="newCoverage.item"
                type="text"
                placeholder="Élément (ex: Frais de scolarité)"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                v-model="newCoverage.description"
                type="text"
                placeholder="Description (optionnel)"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <div class="flex justify-end">
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  @click="addCoverage"
                >
                  <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet: Documents -->
      <div v-show="activeTab === 'documents'" class="space-y-6">
        <div>
          <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Documents requis
          </h3>

          <!-- Liste des documents -->
          <div v-if="form.required_documents && form.required_documents.length > 0" class="mb-4 space-y-2">
            <div
              v-for="(doc, index) in form.required_documents"
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
                      <span v-if="doc.is_mandatory" class="text-red-500">*</span>
                    </p>
                    <p v-if="doc.description" class="text-sm text-gray-500 dark:text-gray-400">{{ doc.description }}</p>
                    <div class="mt-1 flex gap-2 text-xs text-gray-400">
                      <span v-if="doc.accepted_formats">{{ doc.accepted_formats.toUpperCase() }}</span>
                      <span v-if="doc.max_size_mb">Max {{ doc.max_size_mb }} Mo</span>
                    </div>
                  </div>
                </div>
                <button
                  class="text-red-500 hover:text-red-700"
                  @click="removeDocument(index)"
                >
                  <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Ajouter un document -->
          <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <input
                  v-model="newDocument.document_name"
                  type="text"
                  placeholder="Nom du document *"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="sm:col-span-2">
                <input
                  v-model="newDocument.description"
                  type="text"
                  placeholder="Description (optionnel)"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <input
                  v-model="newDocument.accepted_formats"
                  type="text"
                  placeholder="Formats (ex: pdf,doc,docx)"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <input
                  v-model.number="newDocument.max_size_mb"
                  type="number"
                  min="1"
                  placeholder="Taille max (Mo)"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="flex items-center justify-between sm:col-span-2">
                <label class="flex items-center gap-2">
                  <input
                    v-model="newDocument.is_mandatory"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Obligatoire</span>
                </label>
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  @click="addDocument"
                >
                  <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet: Calendrier -->
      <div v-show="activeTab === 'schedule'" class="space-y-6">
        <div>
          <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Étapes du calendrier
          </h3>

          <!-- Liste des étapes -->
          <div v-if="form.schedule && form.schedule.length > 0" class="mb-4 space-y-2">
            <div
              v-for="(item, index) in form.schedule"
              :key="item.id"
              class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <p class="font-medium text-gray-700 dark:text-gray-300">{{ item.step }}</p>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="item.start_date">{{ item.start_date }}</span>
                  <span v-if="item.start_date && item.end_date"> - </span>
                  <span v-if="item.end_date">{{ item.end_date }}</span>
                </div>
                <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">{{ item.description }}</p>
              </div>
              <button
                class="text-red-500 hover:text-red-700"
                @click="removeScheduleItem(index)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Ajouter une étape -->
          <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <input
                  v-model="newScheduleItem.step"
                  type="text"
                  placeholder="Nom de l'étape *"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">Date de début</label>
                <input
                  v-model="newScheduleItem.start_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">Date de fin</label>
                <input
                  v-model="newScheduleItem.end_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="sm:col-span-2">
                <input
                  v-model="newScheduleItem.description"
                  type="text"
                  placeholder="Description (optionnel)"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="flex justify-end sm:col-span-2">
                <button
                  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  @click="addScheduleItem"
                >
                  <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet: Options -->
      <div v-show="activeTab === 'options'" class="space-y-6">
        <div class="grid gap-6 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Options de candidature
            </h3>
          </div>

          <div class="sm:col-span-2">
            <label class="flex items-center gap-3">
              <input
                v-model="form.use_internal_form"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Utiliser le formulaire interne</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Les candidats rempliront leur dossier sur la plateforme
                </p>
              </div>
            </label>
          </div>

          <div v-if="!form.use_internal_form" class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL du formulaire externe
            </label>
            <input
              v-model="form.external_form_url"
              type="url"
              placeholder="https://..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              v-model="form.publication_status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer actions (sticky) -->
    <div class="sticky bottom-0 -mx-4 -mb-4 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:-mx-6 sm:px-6">
      <div class="flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          :disabled="isSaving"
          @click="saveDraft"
        >
          <font-awesome-icon icon="fa-solid fa-save" class="h-4 w-4" />
          Enregistrer
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          :disabled="isSaving"
          @click="saveAndPublish"
        >
          <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-globe" class="h-4 w-4" />
          Publier
        </button>
      </div>
    </div>
  </div>
</template>
