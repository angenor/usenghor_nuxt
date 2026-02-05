<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import type { CallType, PublicationStatus, CallEligibilityCriteriaCreate, CallCoverageCreate, CallRequiredDocumentCreate, CallScheduleCreate, ImageVariants } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

const {
  createCall: apiCreateCall,
  addCriterion: apiAddCriterion,
  addCoverage: apiAddCoverage,
  addRequiredDocument: apiAddRequiredDocument,
  addScheduleItem: apiAddScheduleItem,
} = useApplicationCallsApi()

const {
  uploadMediaVariants,
} = useMediaApi()

const { listCampuses } = useCampusApi()
const { listPrograms, programTypeLabels } = useProgramsApi()

// Charger les campus pour le sélecteur
interface CampusOption {
  id: string
  name: string
  code: string
}
const campusOptions = ref<CampusOption[]>([])
const loadingCampuses = ref(false)

// Charger les formations pour le sélecteur
interface ProgramOption {
  id: string
  title: string
  code: string
  type: string
}
const programOptions = ref<ProgramOption[]>([])
const loadingPrograms = ref(false)

onMounted(async () => {
  // Charger les campus
  loadingCampuses.value = true
  try {
    const response = await listCampuses({ page: 1, limit: 100 })
    campusOptions.value = response.items.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
    }))
  } catch {
    console.error('Erreur lors du chargement des campus')
  } finally {
    loadingCampuses.value = false
  }

  // Charger les formations
  loadingPrograms.value = true
  try {
    const response = await listPrograms({ page: 1, limit: 100, status: 'published' })
    programOptions.value = response.items.map(p => ({
      id: p.id,
      title: p.title,
      code: p.code,
      type: p.type,
    }))
  } catch {
    console.error('Erreur lors du chargement des formations')
  } finally {
    loadingPrograms.value = false
  }
})

// Onglet actif
const activeTab = ref<'general' | 'dates' | 'eligibility' | 'coverage' | 'documents' | 'schedule' | 'options'>('general')

// Types locaux pour le formulaire (sans id/call_id, le backend les génère)
interface LocalCriterion extends CallEligibilityCriteriaCreate { _key: number }
interface LocalCoverage extends CallCoverageCreate { _key: number }
interface LocalDocument extends CallRequiredDocumentCreate { _key: number }
interface LocalScheduleItem extends CallScheduleCreate { _key: number }

let nextKey = 0
const genKey = () => ++nextKey

// État du formulaire
const form = ref({
  title: '',
  slug: '',
  description: undefined as OutputData | undefined,
  type: 'application' as CallType,
  status: 'upcoming' as const,
  campus_external_id: '' as string,
  program_external_id: '' as string,
  opening_date: '',
  deadline: '',
  program_start_date: '',
  program_end_date: '',
  target_audience: '',
  registration_fee: undefined as number | undefined,
  currency: 'EUR',
  use_internal_form: true,
  external_form_url: '',
  publication_status: 'draft' as PublicationStatus,
  cover_image: '',
  cover_image_external_id: null as string | null,
})

// État de l'upload d'image
const pendingCoverFile = ref<File | null>(null)
const showCoverEditor = ref(false)
const isUploadingCover = ref(false)

// Sous-entités locales (seront POST après création de l'appel)
const criteria = ref<LocalCriterion[]>([])
const coverageItems = ref<LocalCoverage[]>([])
const documents = ref<LocalDocument[]>([])
const scheduleItems = ref<LocalScheduleItem[]>([])

const error = ref<string | null>(null)

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
  if (newTitle) {
    form.value.slug = generateSlug(newTitle)
  }
})

// Navigation
const goBack = () => {
  router.push('/admin/candidatures/appels')
}

// === GESTION DE L'IMAGE DE COUVERTURE ===
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
      folder: 'calls/covers',
    })

    form.value.cover_image_external_id = response.original.id
    form.value.cover_image = URL.createObjectURL(variants.medium)
    showCoverEditor.value = false
    pendingCoverFile.value = null
  } catch (e) {
    console.error('Erreur lors de l\'upload de l\'image:', e)
    alert('Erreur lors de l\'upload de l\'image')
  } finally {
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

// === GESTION DES CRITÈRES D'ÉLIGIBILITÉ ===
const newCriterion = ref({ criterion: '', is_mandatory: true })

const addCriterion = () => {
  if (!newCriterion.value.criterion.trim()) return
  criteria.value.push({
    _key: genKey(),
    criterion: newCriterion.value.criterion,
    is_mandatory: newCriterion.value.is_mandatory,
    display_order: criteria.value.length + 1,
  })
  newCriterion.value = { criterion: '', is_mandatory: true }
}

const removeCriterion = (index: number) => {
  criteria.value.splice(index, 1)
}

// === GESTION DES PRISES EN CHARGE ===
const newCoverage = ref({ item: '', description: '' })

const addCoverage = () => {
  if (!newCoverage.value.item.trim()) return
  coverageItems.value.push({
    _key: genKey(),
    item: newCoverage.value.item,
    description: newCoverage.value.description || null,
    display_order: coverageItems.value.length + 1,
  })
  newCoverage.value = { item: '', description: '' }
}

const removeCoverage = (index: number) => {
  coverageItems.value.splice(index, 1)
}

// === GESTION DES DOCUMENTS ===
const newDocument = ref({
  document_name: '',
  description: '',
  is_mandatory: true,
  accepted_formats: 'pdf',
  max_size_mb: 5,
})

const addDocument = () => {
  if (!newDocument.value.document_name.trim()) return
  documents.value.push({
    _key: genKey(),
    document_name: newDocument.value.document_name,
    description: newDocument.value.description || null,
    is_mandatory: newDocument.value.is_mandatory,
    accepted_formats: newDocument.value.accepted_formats || null,
    max_size_mb: newDocument.value.max_size_mb || null,
    display_order: documents.value.length + 1,
  })
  newDocument.value = {
    document_name: '',
    description: '',
    is_mandatory: true,
    accepted_formats: 'pdf',
    max_size_mb: 5,
  }
}

const removeDocument = (index: number) => {
  documents.value.splice(index, 1)
}

// === GESTION DU CALENDRIER ===
const newScheduleItem = ref({
  step: '',
  start_date: '',
  end_date: '',
  description: '',
})

const addScheduleItemLocal = () => {
  if (!newScheduleItem.value.step.trim()) return
  scheduleItems.value.push({
    _key: genKey(),
    step: newScheduleItem.value.step,
    start_date: newScheduleItem.value.start_date || null,
    end_date: newScheduleItem.value.end_date || null,
    description: newScheduleItem.value.description || null,
    display_order: scheduleItems.value.length + 1,
  })
  newScheduleItem.value = { step: '', start_date: '', end_date: '', description: '' }
}

const removeScheduleItem = (index: number) => {
  scheduleItems.value.splice(index, 1)
}

// === SAUVEGARDE ===
const isSaving = ref(false)

const saveForm = async () => {
  if (!form.value.title.trim() || !form.value.slug.trim()) {
    error.value = 'Le titre et le slug sont obligatoires'
    activeTab.value = 'general'
    return
  }

  isSaving.value = true
  error.value = null

  try {
    // 1) Créer l'appel
    const result = await apiCreateCall({
      title: form.value.title,
      slug: form.value.slug,
      description: form.value.description ? JSON.stringify(form.value.description) : null,
      type: form.value.type,
      status: form.value.status,
      campus_external_id: form.value.campus_external_id || null,
      program_external_id: form.value.program_external_id || null,
      cover_image_external_id: form.value.cover_image_external_id,
      opening_date: form.value.opening_date || null,
      deadline: form.value.deadline || null,
      program_start_date: form.value.program_start_date || null,
      program_end_date: form.value.program_end_date || null,
      target_audience: form.value.target_audience || null,
      registration_fee: form.value.registration_fee || null,
      currency: form.value.currency,
      use_internal_form: form.value.use_internal_form,
      external_form_url: form.value.external_form_url || null,
      publication_status: form.value.publication_status,
    })

    const callId = result.id

    // 2) Créer les sous-entités en parallèle
    const promises: Promise<unknown>[] = []

    for (const c of criteria.value) {
      promises.push(apiAddCriterion(callId, {
        criterion: c.criterion,
        is_mandatory: c.is_mandatory,
        display_order: c.display_order,
      }))
    }

    for (const c of coverageItems.value) {
      promises.push(apiAddCoverage(callId, {
        item: c.item,
        description: c.description,
        display_order: c.display_order,
      }))
    }

    for (const d of documents.value) {
      promises.push(apiAddRequiredDocument(callId, {
        document_name: d.document_name,
        description: d.description,
        is_mandatory: d.is_mandatory,
        accepted_formats: d.accepted_formats,
        max_size_mb: d.max_size_mb,
        display_order: d.display_order,
      }))
    }

    for (const s of scheduleItems.value) {
      promises.push(apiAddScheduleItem(callId, {
        step: s.step,
        start_date: s.start_date,
        end_date: s.end_date,
        description: s.description,
        display_order: s.display_order,
      }))
    }

    await Promise.all(promises)

    // 3) Rediriger vers le détail
    router.push(`/admin/candidatures/appels/${callId}`)
  } catch {
    error.value = 'Erreur lors de la création de l\'appel'
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
  { id: 'options', label: 'Options', icon: 'fa-solid fa-cog' },
] as const
</script>

<template>
  <div class="space-y-6 pb-32">
    <!-- Error -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

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
            Nouvel appel à candidatures
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créez un nouvel appel à candidatures, bourse ou recrutement
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
    <div class="overflow-visible rounded-lg bg-white p-6 shadow dark:bg-gray-800">
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
              Statut de l'appel *
            </label>
            <select
              v-model="form.status"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="upcoming">À venir</option>
              <option value="ongoing">En cours</option>
              <option value="closed">Fermé</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              "En cours" permet aux candidats de postuler
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Campus associé
            </label>
            <select
              v-model="form.campus_external_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="loadingCampuses"
            >
              <option value="">Aucun campus (siège)</option>
              <option v-for="campus in campusOptions" :key="campus.id" :value="campus.id">
                {{ campus.name }} ({{ campus.code }})
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Laissez vide pour un appel du siège principal</p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Formation associée
            </label>
            <select
              v-model="form.program_external_id"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              :disabled="loadingPrograms"
            >
              <option value="">Aucune formation liée</option>
              <option v-for="program in programOptions" :key="program.id" :value="program.id">
                {{ program.title }} ({{ programTypeLabels[program.type as keyof typeof programTypeLabels] }} - {{ program.code }})
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Cette formation sera présélectionnée dans le formulaire de candidature</p>
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

          <!-- Image de couverture -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture
            </label>
            <div class="space-y-2">
              <!-- Prévisualisation -->
              <div v-if="form.cover_image" class="relative">
                <img
                  :src="form.cover_image"
                  alt="Image de couverture"
                  class="h-40 w-full rounded-lg object-cover"
                />
                <div class="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <label class="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100">
                    <font-awesome-icon icon="fa-solid fa-pen" class="mr-2 h-4 w-4" />
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
                    class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    @click="removeCoverImage"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="mr-2 h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>

              <!-- Upload -->
              <label
                v-else
                class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-500"
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

          <div class="sm:col-span-2">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <ClientOnly>
              <AdminRichTextEditor
                v-model="form.description"
                :show-card="false"
                placeholder="Description détaillée de l'appel..."
                :min-height="200"
              />
              <template #fallback>
                <div class="flex h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
                </div>
              </template>
            </ClientOnly>
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

          <div v-if="criteria && criteria.length > 0" class="mb-4 space-y-2">
            <div
              v-for="(criterion, index) in criteria"
              :key="criterion._key"
              class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {{ index + 1 }}
              </span>
              <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ criterion.criterion }}</span>
              <span
                v-if="criterion.is_mandatory"
                class="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400"
              >Obligatoire</span>
              <span v-else class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">Optionnel</span>
              <button class="text-red-500 hover:text-red-700" @click="removeCriterion(index)">
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>

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
                  <input v-model="newCriterion.is_mandatory" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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

          <div v-if="coverageItems && coverageItems.length > 0" class="mb-4 space-y-2">
            <div
              v-for="(item, index) in coverageItems"
              :key="item._key"
              class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <font-awesome-icon icon="fa-solid fa-check" class="h-3 w-3" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-700 dark:text-gray-300">{{ item.item }}</p>
                <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">{{ item.description }}</p>
              </div>
              <button class="text-red-500 hover:text-red-700" @click="removeCoverage(index)">
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <div class="space-y-3">
              <input v-model="newCoverage.item" type="text" placeholder="Élément (ex: Frais de scolarité)" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <input v-model="newCoverage.description" type="text" placeholder="Description (optionnel)" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <div class="flex justify-end">
                <button class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700" @click="addCoverage">
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

          <div v-if="documents && documents.length > 0" class="mb-4 space-y-2">
            <div v-for="(doc, index) in documents" :key="doc._key" class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
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
                <button class="text-red-500 hover:text-red-700" @click="removeDocument(index)">
                  <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <input v-model="newDocument.document_name" type="text" placeholder="Nom du document *" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div class="sm:col-span-2">
                <input v-model="newDocument.description" type="text" placeholder="Description (optionnel)" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <input v-model="newDocument.accepted_formats" type="text" placeholder="Formats (ex: pdf,doc,docx)" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <input v-model.number="newDocument.max_size_mb" type="number" min="1" placeholder="Taille max (Mo)" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div class="flex items-center justify-between sm:col-span-2">
                <label class="flex items-center gap-2">
                  <input v-model="newDocument.is_mandatory" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Obligatoire</span>
                </label>
                <button class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700" @click="addDocument">
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

          <div v-if="scheduleItems && scheduleItems.length > 0" class="mb-4 space-y-2">
            <div v-for="(item, index) in scheduleItems" :key="item._key" class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{{ index + 1 }}</span>
              <div class="flex-1">
                <p class="font-medium text-gray-700 dark:text-gray-300">{{ item.step }}</p>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="item.start_date">{{ item.start_date }}</span>
                  <span v-if="item.start_date && item.end_date"> - </span>
                  <span v-if="item.end_date">{{ item.end_date }}</span>
                </div>
                <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">{{ item.description }}</p>
              </div>
              <button class="text-red-500 hover:text-red-700" @click="removeScheduleItem(index)">
                <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <input v-model="newScheduleItem.step" type="text" placeholder="Nom de l'étape *" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">Date de début</label>
                <input v-model="newScheduleItem.start_date" type="date" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-500">Date de fin</label>
                <input v-model="newScheduleItem.end_date" type="date" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div class="sm:col-span-2">
                <input v-model="newScheduleItem.description" type="text" placeholder="Description (optionnel)" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div class="flex justify-end sm:col-span-2">
                <button class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700" @click="addScheduleItemLocal">
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
              <input v-model="form.use_internal_form" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <span class="font-medium text-gray-700 dark:text-gray-300">Utiliser le formulaire interne</span>
                <p class="text-sm text-gray-500 dark:text-gray-400">Les candidats rempliront leur dossier sur la plateforme</p>
              </div>
            </label>
          </div>

          <div v-if="!form.use_internal_form" class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">URL du formulaire externe</label>
            <input v-model="form.external_form_url" type="url" placeholder="https://..." class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut de publication</label>
            <select v-model="form.publication_status" class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="sticky bottom-0 -mx-4 -mb-4 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:-mx-6 sm:px-6">
      <div class="flex justify-end gap-3">
        <button class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" @click="goBack">
          Annuler
        </button>
        <button class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" :disabled="isSaving" @click="saveDraft">
          <font-awesome-icon icon="fa-solid fa-save" class="h-4 w-4" />
          Enregistrer
        </button>
        <button class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50" :disabled="isSaving" @click="saveAndPublish">
          <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-globe" class="h-4 w-4" />
          Publier
        </button>
      </div>
    </div>

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
