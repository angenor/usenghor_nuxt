<script setup lang="ts">
import type { ProgramCreatePayload, ProgramType, ProgramFieldRead, PublicationStatus, ImageVariants } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

const {
  createProgram,
  programTypeLabels,
} = useProgramsApi()

const {
  uploadMediaVariants,
} = useMediaApi()

const {
  listFields,
} = useProgramFieldsApi()

// Données de référence (campus, secteurs, services)
const {
  getCampuses,
  getDepartments,
  getServices,
  campuses: allCampuses,
  departments: allDepartments,
  services: allServices,
} = useReferenceData()

// Champs disciplinaires (pour les certificats)
const programFields = ref<ProgramFieldRead[]>([])

async function loadProgramFields() {
  try {
    const response = await listFields({ limit: 100 })
    programFields.value = response.items.sort((a, b) => a.display_order - b.display_order)
  }
  catch (e) {
    console.error('Erreur chargement champs:', e)
  }
}

onMounted(() => {
  loadProgramFields()
  getCampuses()
  getDepartments()
  getServices()
})

// Services filtrés par secteur
const filteredServices = computed(() => {
  if (!form.value.sector_id) return []
  return allServices.value.filter(s => s.sector_id === form.value.sector_id)
})

// === FORM STATE ===
const isSubmitting = ref(false)

const form = ref({
  code: '',
  title: '',
  subtitle: '',
  slug: '',
  type: 'master' as ProgramType,
  description_md: '',
  description_html: '',
  duration_months: 24,
  credits: 120,
  degree_awarded: 'Master professionnel',
  required_degree: 'Bac+4 minimum',
  status: 'draft' as PublicationStatus,
  is_featured: false,
  cover_image: '',
  cover_image_external_id: null as string | null,
  campus_id: '',
  sector_id: '',
  service_id: '',
  field_id: null as string | null,
  objectives: [] as string[],
  target_audience: [] as string[],
  format: '',
})

// Options du format
const formatOptions = [
  { value: 'presential', label: 'Présentiel' },
  { value: 'distance', label: 'Distanciel' },
  { value: 'hybrid', label: 'Hybride' },
  { value: 'elearning', label: 'E-learning' },
]

// === GESTION DES OBJECTIFS ===
const newObjective = ref('')
const addObjective = () => {
  const value = newObjective.value.trim()
  if (value && !form.value.objectives.includes(value)) {
    form.value.objectives.push(value)
  }
  newObjective.value = ''
}
const removeObjective = (index: number) => {
  form.value.objectives.splice(index, 1)
}

// === GESTION DU PUBLIC CIBLE ===
const newTargetAudience = ref('')
const addTargetAudience = () => {
  const value = newTargetAudience.value.trim()
  if (value && !form.value.target_audience.includes(value)) {
    form.value.target_audience.push(value)
  }
  newTargetAudience.value = ''
}
const removeTargetAudience = (index: number) => {
  form.value.target_audience.splice(index, 1)
}

// === MODALITÉS D'ÉVALUATION ===
const evaluationMethods = ref<string[]>([])
const newEvaluationMethod = ref('')

function addEvaluationMethod() {
  const value = newEvaluationMethod.value.trim()
  if (value && !evaluationMethods.value.includes(value)) {
    evaluationMethods.value.push(value)
    newEvaluationMethod.value = ''
  }
}

function removeEvaluationMethod(index: number) {
  evaluationMethods.value.splice(index, 1)
}

// === SLUG ET CODE AUTO ===
function generateSlug(title: string) {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const suffix = Date.now().toString(36).slice(-4)
  return `${base}-${suffix}`
}

function generateCode(title: string) {
  const prefix = title
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^A-Z0-9]+/g, '')
    .substring(0, 6)
  const suffix = Date.now().toString(36).slice(-4).toUpperCase()
  return `${prefix}-${suffix}`
}

watch(() => form.value.title, (newTitle) => {
  form.value.slug = generateSlug(newTitle)
  form.value.code = generateCode(newTitle)
})

// Réinitialiser field_id si le type change (hors certificat)
watch(() => form.value.type, (newType) => {
  if (newType !== 'certificate') {
    form.value.field_id = null
  }
})

// === IMAGE DE COUVERTURE ===
const pendingCoverFile = ref<File | null>(null)
const showCoverEditor = ref(false)
const isUploadingCover = ref(false)

function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    pendingCoverFile.value = input.files[0]
    showCoverEditor.value = true
  }
  input.value = ''
}

async function saveEditedCover(variants: ImageVariants) {
  isUploadingCover.value = true
  try {
    const originalName = pendingCoverFile.value?.name || 'cover.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    const response = await uploadMediaVariants(variants, baseName, {
      folder: 'programs/covers',
    })

    form.value.cover_image_external_id = response.original.id
    form.value.cover_image = URL.createObjectURL(variants.medium)
    showCoverEditor.value = false
    pendingCoverFile.value = null
  }
  catch (e) {
    console.error('Erreur lors de l\'upload de l\'image:', e)
    alert('Erreur lors de l\'upload de l\'image')
  }
  finally {
    isUploadingCover.value = false
  }
}

function cancelCoverEditor() {
  showCoverEditor.value = false
  pendingCoverFile.value = null
}

function removeCoverImage() {
  form.value.cover_image = ''
  form.value.cover_image_external_id = null
}

// === CRÉATION ===
async function submitForm() {
  isSubmitting.value = true
  try {
    const payload: ProgramCreatePayload = {
      code: form.value.code,
      title: form.value.title,
      subtitle: form.value.subtitle || null,
      slug: form.value.slug,
      type: form.value.type,
      description_html: form.value.description_html || null,
      description_md: form.value.description_md || null,
      duration_months: form.value.duration_months || null,
      credits: form.value.credits || null,
      degree_awarded: form.value.degree_awarded || null,
      required_degree: form.value.required_degree || null,
      status: form.value.status,
      is_featured: form.value.is_featured,
      cover_image_external_id: form.value.cover_image_external_id,
      campus_external_id: form.value.campus_id || null,
      sector_external_id: form.value.sector_id || null,
      service_external_id: form.value.service_id || null,
      field_id: form.value.type === 'certificate' ? form.value.field_id : null,
      objectives: form.value.objectives.length > 0 ? form.value.objectives : null,
      target_audience: form.value.target_audience.length > 0 ? form.value.target_audience : null,
      format_md: form.value.format || null,
      format_html: form.value.format || null,
      evaluation_methods_html: evaluationMethods.value.length > 0 ? `<ul>${evaluationMethods.value.map(m => `<li>${m}</li>`).join('')}</ul>` : null,
      evaluation_methods_md: evaluationMethods.value.length > 0 ? evaluationMethods.value.map(m => `- ${m}`).join('\n') : null,
    }
    const result = await createProgram(payload)
    router.push(`/admin/formations/programmes/${result.id}/edit`)
  }
  catch (e: unknown) {
    console.error('Erreur création programme:', e)
    const fetchError = e as { data?: { detail?: string } }
    const detail = fetchError.data?.detail || 'Erreur lors de la création du programme'
    alert(detail)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          @click="router.push('/admin/formations/programmes')"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Nouveau programme
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Créez un nouveau programme de formation
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="router.push('/admin/formations/programmes')"
        >
          Annuler
        </button>
        <button
          type="button"
          :disabled="isSubmitting || !form.title"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="submitForm"
        >
          <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-save" class="h-4 w-4" />
          {{ isSubmitting ? 'Création...' : 'Créer le programme' }}
        </button>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent="submitForm">
      <!-- Section: Informations générales -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-info-circle" class="h-5 w-5 text-blue-500" />
          Informations générales
        </h2>

        <div class="space-y-4">
          <!-- Titre et Code -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre *
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="Master en Développement"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code *
              </label>
              <input
                v-model="form.code"
                type="text"
                required
                placeholder="MDEV"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>

          <!-- Slug -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug *
            </label>
            <input
              v-model="form.slug"
              type="text"
              required
              placeholder="master-developpement"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
            <p class="mt-1 text-xs text-gray-500">Auto-généré depuis le titre</p>
          </div>

          <!-- Sous-titre -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sous-titre
            </label>
            <input
              v-model="form.subtitle"
              type="text"
              placeholder="Gestion du développement durable"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </div>

          <!-- Type et Format -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type *
              </label>
              <select
                v-model="form.type"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option v-for="(label, value) in programTypeLabels" :key="value" :value="value">{{ label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Format
              </label>
              <select
                v-model="form.format"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Aucun --</option>
                <option v-for="opt in formatOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Champ disciplinaire (certificats uniquement) -->
          <div v-if="form.type === 'certificate'">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Champ disciplinaire
            </label>
            <select
              v-model="form.field_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option :value="null">-- Aucun --</option>
              <option v-for="field in programFields" :key="field.id" :value="field.id">
                {{ field.name }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Domaine thématique du certificat</p>
          </div>
        </div>
      </div>

      <!-- Section: Associations -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-link" class="h-5 w-5 text-purple-500" />
          Associations
        </h2>

        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campus associé
            </label>
            <select
              v-model="form.campus_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="campus in allCampuses" :key="campus.id" :value="campus.id">
                {{ campus.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Secteur associé
            </label>
            <select
              v-model="form.sector_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service associé
            </label>
            <select
              v-model="form.service_id"
              :disabled="!form.sector_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Aucun</option>
              <option v-for="service in filteredServices" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section: Académique -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="h-5 w-5 text-green-500" />
          Informations académiques
        </h2>

        <div class="space-y-4">
          <!-- Durée et Crédits -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durée (mois)
              </label>
              <input
                v-model.number="form.duration_months"
                type="number"
                min="1"
                placeholder="24"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Crédits ECTS
              </label>
              <input
                v-model.number="form.credits"
                type="number"
                min="0"
                placeholder="120"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>

          <!-- Diplôme et Prérequis -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme délivré
              </label>
              <input
                v-model="form.degree_awarded"
                type="text"
                placeholder="Master professionnel"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme requis
              </label>
              <input
                v-model="form.required_degree"
                type="text"
                placeholder="Bac+4 minimum"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>

          <!-- Objectifs -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Objectifs
            </label>
            <div class="flex gap-2">
              <input
                v-model="newObjective"
                type="text"
                placeholder="Ajouter un objectif..."
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @keydown.enter.prevent="addObjective"
              />
              <button
                type="button"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="addObjective"
              >
                Ajouter
              </button>
            </div>
            <div v-if="form.objectives.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(item, index) in form.objectives"
                :key="index"
                class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-800 dark:border-gray-600 dark:text-gray-200"
              >
                {{ item }}
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="removeObjective(index)"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" class="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Public cible -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Public cible
            </label>
            <div class="flex gap-2">
              <input
                v-model="newTargetAudience"
                type="text"
                placeholder="Ajouter un public cible..."
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @keydown.enter.prevent="addTargetAudience"
              />
              <button
                type="button"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="addTargetAudience"
              >
                Ajouter
              </button>
            </div>
            <div v-if="form.target_audience.length > 0" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(item, index) in form.target_audience"
                :key="index"
                class="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-800 dark:border-gray-600 dark:text-gray-200"
              >
                {{ item }}
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="removeTargetAudience(index)"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" class="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Modalités d'évaluation -->
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Modalités d'évaluation
            </label>
            <div class="space-y-2">
              <div
                v-for="(method, index) in evaluationMethods"
                :key="index"
                class="flex items-center gap-2"
              >
                <span class="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {{ method }}
                </span>
                <button
                  type="button"
                  class="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  @click="removeEvaluationMethod(index)"
                >
                  <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
                </button>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newEvaluationMethod"
                  type="text"
                  placeholder="Ex: Contrôle continu, Examen final..."
                  class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  @keydown.enter.prevent="addEvaluationMethod"
                />
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  @click="addEvaluationMethod"
                >
                  <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Description -->
      <AdminRichTextEditor
        v-model="form.description_md"
        v-model:html-value="form.description_html"
        title="Description"
        description="Description détaillée du programme de formation"
        icon="fa-solid fa-file-lines"
        icon-color="text-indigo-500"
        placeholder="Décrivez le programme en détail..."
        height="300px"
      />

      <!-- Section: Image de couverture -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-image" class="h-5 w-5 text-pink-500" />
          Image de couverture
        </h2>

        <div class="space-y-2">
          <!-- Prévisualisation -->
          <div v-if="form.cover_image" class="relative">
            <img
              :src="form.cover_image"
              alt="Image de couverture"
              class="h-48 w-full rounded-lg object-cover"
            />
            <div class="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <label class="cursor-pointer rounded bg-white px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100">
                Modifier
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleCoverImageUpload"
                />
              </label>
              <button
                type="button"
                class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                @click="removeCoverImage"
              >
                Supprimer
              </button>
            </div>
          </div>

          <!-- Upload -->
          <label
            v-else
            class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-500"
          >
            <font-awesome-icon icon="fa-solid fa-cloud-upload-alt" class="mb-2 h-8 w-8 text-gray-400" />
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Cliquez pour télécharger une image
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG ou WebP (recommandé : 1200x675px, ratio 16:9)
            </p>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleCoverImageUpload"
            />
          </label>

          <!-- Indicateur de chargement -->
          <div v-if="isUploadingCover" class="flex items-center gap-2 text-sm text-gray-500">
            <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
            Upload en cours...
          </div>
        </div>
      </div>

      <!-- Section: Publication -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-eye" class="h-5 w-5 text-amber-500" />
          Publication
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mise en avant
            </label>
            <label class="mt-2 flex cursor-pointer items-center gap-3">
              <input
                v-model="form.is_featured"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700"
              >
              <span class="text-sm text-gray-700 dark:text-gray-300">
                <font-awesome-icon icon="fa-solid fa-star" class="mr-1 h-3 w-3 text-amber-500" />
                À la une
              </span>
            </label>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Afficher sur la page d'accueil
            </p>
          </div>
        </div>
      </div>

      <!-- Boutons de soumission (bas de page) -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="router.push('/admin/formations/programmes')"
        >
          Annuler
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || !form.title"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          {{ isSubmitting ? 'Création...' : 'Créer le programme' }}
        </button>
      </div>
    </form>

    <!-- Modal Éditeur d'image -->
    <Teleport to="body">
      <div
        v-if="showCoverEditor && pendingCoverFile"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      >
        <MediaImageEditor
          :image-file="pendingCoverFile"
          :aspect-ratio="16/9"
          @save="saveEditedCover"
          @cancel="cancelCoverEditor"
        />
      </div>
    </Teleport>
  </div>
</template>
