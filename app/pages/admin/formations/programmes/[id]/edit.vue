<script setup lang="ts">
import type { ProgramType, ProgramWithDetails, PublicationStatus, ProgramSkillRead, ProgramCareerOpportunityRead, ImageVariants } from '~/types/api'
import type { OutputData } from '@editorjs/editorjs'

// Convertir une string (potentiellement JSON ou texte brut) en OutputData
const parseEditorContent = (content: string | null | undefined): OutputData | undefined => {
  if (!content) return undefined
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: content } }],
        version: '2.28.0'
      }
    }
  }
  return undefined
}

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProgramById,
  updateProgram,
  programTypeLabels,
  publicationStatusLabels,
} = useProgramsApi()

const {
  listSkills,
  createSkill,
  updateSkill: apiUpdateSkill,
  deleteSkill: apiDeleteSkill,
  reorderSkills,
} = useProgramSkillsApi()

const {
  listCareerOpportunities,
  createCareerOpportunity,
  updateCareerOpportunity: apiUpdateCareerOpportunity,
  deleteCareerOpportunity: apiDeleteCareerOpportunity,
  reorderCareerOpportunities,
} = useCareerOpportunitiesApi()

const {
  uploadMediaVariants,
  getMediaUrl,
} = useMediaApi()

// États
const loading = ref(true)
const isSubmitting = ref(false)
const program = ref<ProgramWithDetails | null>(null)

// État du formulaire
const form = ref<{
  code: string
  title: string
  subtitle: string
  slug: string
  description: OutputData | undefined
  teaching_methods: string
  cover_image: string
  cover_image_external_id: string | null
  type: ProgramType
  duration_months: number | null
  credits: number | null
  degree_awarded: string
  required_degree: string
  status: PublicationStatus
  is_featured: boolean
}>({
  code: '',
  title: '',
  subtitle: '',
  slug: '',
  description: undefined,
  teaching_methods: '',
  cover_image: '',
  cover_image_external_id: null,
  type: 'master',
  duration_months: null,
  credits: null,
  degree_awarded: '',
  required_degree: '',
  status: 'draft',
  is_featured: false,
})

// État de l'upload d'image
const pendingCoverFile = ref<File | null>(null)
const showCoverEditor = ref(false)
const isUploadingCover = ref(false)

// État des compétences
const skills = ref<ProgramSkillRead[]>([])
const loadingSkills = ref(false)
const isSubmittingSkill = ref(false)
const showAddSkillModal = ref(false)
const showEditSkillModal = ref(false)
const showDeleteSkillModal = ref(false)
const editingSkill = ref<ProgramSkillRead | null>(null)
const deletingSkill = ref<ProgramSkillRead | null>(null)
const newSkill = ref({ title: '', description: '' })
const draggedSkillIndex = ref<number | null>(null)

// État des débouchés
const careerOpportunities = ref<ProgramCareerOpportunityRead[]>([])
const loadingCareerOpportunities = ref(false)
const isSubmittingCareerOpportunity = ref(false)
const showAddCareerOpportunityModal = ref(false)
const showEditCareerOpportunityModal = ref(false)
const showDeleteCareerOpportunityModal = ref(false)
const editingCareerOpportunity = ref<ProgramCareerOpportunityRead | null>(null)
const deletingCareerOpportunity = ref<ProgramCareerOpportunityRead | null>(null)
const newCareerOpportunity = ref({ title: '', description: '' })
const draggedCareerOpportunityIndex = ref<number | null>(null)

// Chargement du programme
async function loadProgram() {
  loading.value = true
  try {
    program.value = await getProgramById(route.params.id as string)
    // Charger les données dans le formulaire
    form.value = {
      code: program.value.code,
      title: program.value.title,
      subtitle: program.value.subtitle || '',
      slug: program.value.slug,
      description: parseEditorContent(program.value.description),
      teaching_methods: program.value.teaching_methods || '',
      cover_image_external_id: program.value.cover_image_external_id || null,
      cover_image: program.value.cover_image_external_id
        ? (getMediaUrl(program.value.cover_image_external_id) || '')
        : '',
      type: program.value.type,
      duration_months: program.value.duration_months,
      credits: program.value.credits,
      degree_awarded: program.value.degree_awarded || '',
      required_degree: program.value.required_degree || '',
      status: program.value.status,
      is_featured: program.value.is_featured || false,
    }
  } catch (e) {
    console.error('Erreur lors du chargement du programme:', e)
    alert('Programme non trouvé')
    router.replace('/admin/formations/programmes')
  } finally {
    loading.value = false
  }
}

onMounted(loadProgram)

// === GESTION DES COMPÉTENCES ===
async function loadSkills() {
  if (!program.value) return
  loadingSkills.value = true
  try {
    const response = await listSkills({ program_id: program.value.id, limit: 100 })
    skills.value = response.items.sort((a, b) => a.display_order - b.display_order)
  } catch (e) {
    console.error('Erreur lors du chargement des compétences:', e)
  } finally {
    loadingSkills.value = false
  }
}

// Charger les compétences et débouchés après le programme
watch(program, (newProgram) => {
  if (newProgram) {
    loadSkills()
    loadCareerOpportunities()
  }
})

// Modales compétences
const openAddSkillModal = () => {
  newSkill.value = { title: '', description: '' }
  showAddSkillModal.value = true
}

const closeAddSkillModal = () => {
  showAddSkillModal.value = false
  newSkill.value = { title: '', description: '' }
}

const openEditSkillModal = (skill: ProgramSkillRead) => {
  editingSkill.value = { ...skill }
  showEditSkillModal.value = true
}

const closeEditSkillModal = () => {
  showEditSkillModal.value = false
  editingSkill.value = null
}

const openDeleteSkillModal = (skill: ProgramSkillRead) => {
  deletingSkill.value = skill
  showDeleteSkillModal.value = true
}

const closeDeleteSkillModal = () => {
  showDeleteSkillModal.value = false
  deletingSkill.value = null
}

// CRUD Compétences
const addSkill = async () => {
  if (!newSkill.value.title.trim() || !program.value) return

  isSubmittingSkill.value = true
  try {
    await createSkill({
      program_id: program.value.id,
      title: newSkill.value.title,
      description: newSkill.value.description || undefined,
      display_order: skills.value.length + 1,
    })
    closeAddSkillModal()
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la création de la compétence:', e)
    alert('Erreur lors de la création de la compétence')
  } finally {
    isSubmittingSkill.value = false
  }
}

const updateSkillHandler = async () => {
  if (!editingSkill.value) return

  isSubmittingSkill.value = true
  try {
    await apiUpdateSkill(editingSkill.value.id, {
      title: editingSkill.value.title,
      description: editingSkill.value.description || undefined,
    })
    closeEditSkillModal()
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la mise à jour de la compétence:', e)
    alert('Erreur lors de la mise à jour de la compétence')
  } finally {
    isSubmittingSkill.value = false
  }
}

const deleteSkillHandler = async () => {
  if (!deletingSkill.value) return

  isSubmittingSkill.value = true
  try {
    await apiDeleteSkill(deletingSkill.value.id)
    closeDeleteSkillModal()
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la suppression de la compétence:', e)
    alert('Erreur lors de la suppression de la compétence')
  } finally {
    isSubmittingSkill.value = false
  }
}

// Drag & Drop compétences
const onSkillDragStart = (index: number) => {
  draggedSkillIndex.value = index
}

const onSkillDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onSkillDrop = async (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  if (draggedSkillIndex.value === null || draggedSkillIndex.value === targetIndex) return

  const newSkills = [...skills.value]
  const [draggedSkill] = newSkills.splice(draggedSkillIndex.value, 1)
  newSkills.splice(targetIndex, 0, draggedSkill)
  skills.value = newSkills

  const skillIds = newSkills.map(s => s.id)
  try {
    await reorderSkills(skillIds)
    await loadSkills()
  } catch (e) {
    console.error('Erreur lors de la réorganisation:', e)
    await loadSkills()
  } finally {
    draggedSkillIndex.value = null
  }
}

const onSkillDragEnd = () => {
  draggedSkillIndex.value = null
}

// === GESTION DES DÉBOUCHÉS ===
async function loadCareerOpportunities() {
  if (!program.value) return
  loadingCareerOpportunities.value = true
  try {
    const response = await listCareerOpportunities({ program_id: program.value.id, limit: 100 })
    careerOpportunities.value = response.items.sort((a, b) => a.display_order - b.display_order)
  } catch (e) {
    console.error('Erreur lors du chargement des débouchés:', e)
  } finally {
    loadingCareerOpportunities.value = false
  }
}

// Modales débouchés
const openAddCareerOpportunityModal = () => {
  newCareerOpportunity.value = { title: '', description: '' }
  showAddCareerOpportunityModal.value = true
}

const closeAddCareerOpportunityModal = () => {
  showAddCareerOpportunityModal.value = false
  newCareerOpportunity.value = { title: '', description: '' }
}

const openEditCareerOpportunityModal = (opportunity: ProgramCareerOpportunityRead) => {
  editingCareerOpportunity.value = { ...opportunity }
  showEditCareerOpportunityModal.value = true
}

const closeEditCareerOpportunityModal = () => {
  showEditCareerOpportunityModal.value = false
  editingCareerOpportunity.value = null
}

const openDeleteCareerOpportunityModal = (opportunity: ProgramCareerOpportunityRead) => {
  deletingCareerOpportunity.value = opportunity
  showDeleteCareerOpportunityModal.value = true
}

const closeDeleteCareerOpportunityModal = () => {
  showDeleteCareerOpportunityModal.value = false
  deletingCareerOpportunity.value = null
}

// CRUD Débouchés
const addCareerOpportunity = async () => {
  if (!newCareerOpportunity.value.title.trim() || !program.value) return

  isSubmittingCareerOpportunity.value = true
  try {
    await createCareerOpportunity({
      program_id: program.value.id,
      title: newCareerOpportunity.value.title,
      description: newCareerOpportunity.value.description || undefined,
      display_order: careerOpportunities.value.length + 1,
    })
    closeAddCareerOpportunityModal()
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la création du débouché:', e)
    alert('Erreur lors de la création du débouché')
  } finally {
    isSubmittingCareerOpportunity.value = false
  }
}

const updateCareerOpportunityHandler = async () => {
  if (!editingCareerOpportunity.value) return

  isSubmittingCareerOpportunity.value = true
  try {
    await apiUpdateCareerOpportunity(editingCareerOpportunity.value.id, {
      title: editingCareerOpportunity.value.title,
      description: editingCareerOpportunity.value.description || undefined,
    })
    closeEditCareerOpportunityModal()
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la mise à jour du débouché:', e)
    alert('Erreur lors de la mise à jour du débouché')
  } finally {
    isSubmittingCareerOpportunity.value = false
  }
}

const deleteCareerOpportunityHandler = async () => {
  if (!deletingCareerOpportunity.value) return

  isSubmittingCareerOpportunity.value = true
  try {
    await apiDeleteCareerOpportunity(deletingCareerOpportunity.value.id)
    closeDeleteCareerOpportunityModal()
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la suppression du débouché:', e)
    alert('Erreur lors de la suppression du débouché')
  } finally {
    isSubmittingCareerOpportunity.value = false
  }
}

// Drag & Drop débouchés
const onCareerOpportunityDragStart = (index: number) => {
  draggedCareerOpportunityIndex.value = index
}

const onCareerOpportunityDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onCareerOpportunityDrop = async (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  if (draggedCareerOpportunityIndex.value === null || draggedCareerOpportunityIndex.value === targetIndex) return

  const newOpportunities = [...careerOpportunities.value]
  const [draggedOpportunity] = newOpportunities.splice(draggedCareerOpportunityIndex.value, 1)
  newOpportunities.splice(targetIndex, 0, draggedOpportunity)
  careerOpportunities.value = newOpportunities

  const opportunityIds = newOpportunities.map(o => o.id)
  try {
    await reorderCareerOpportunities(opportunityIds)
    await loadCareerOpportunities()
  } catch (e) {
    console.error('Erreur lors de la réorganisation:', e)
    await loadCareerOpportunities()
  } finally {
    draggedCareerOpportunityIndex.value = null
  }
}

const onCareerOpportunityDragEnd = () => {
  draggedCareerOpportunityIndex.value = null
}

// === GESTION DE L'IMAGE DE COUVERTURE ===
function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    pendingCoverFile.value = input.files[0]
    showCoverEditor.value = true
  }
  // Reset input pour permettre de resélectionner le même fichier
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

// Génération de slug
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// États de modification
const hasChanges = ref(false)
const showDiscardModal = ref(false)

// Détecter les changements du formulaire
watch(form, () => {
  hasChanges.value = true
}, { deep: true })

// Soumettre le formulaire
const submitForm = async () => {
  if (!program.value) return

  isSubmitting.value = true
  try {
    // Convertir la description OutputData en JSON string pour l'API
    const descriptionJson = form.value.description && form.value.description.blocks?.length
      ? JSON.stringify(form.value.description)
      : null

    await updateProgram(program.value.id, {
      code: form.value.code,
      title: form.value.title,
      subtitle: form.value.subtitle || null,
      slug: form.value.slug,
      description: descriptionJson,
      teaching_methods: form.value.teaching_methods || null,
      cover_image_external_id: form.value.cover_image_external_id,
      type: form.value.type,
      duration_months: form.value.duration_months,
      credits: form.value.credits,
      degree_awarded: form.value.degree_awarded || null,
      required_degree: form.value.required_degree || null,
      status: form.value.status,
      is_featured: form.value.is_featured,
    })

    hasChanges.value = false
    router.push(`/admin/formations/programmes/${program.value.id}`)
  } catch (error: unknown) {
    console.error('Erreur lors de la mise à jour:', error)
    const fetchError = error as { data?: { detail?: string } }
    const detail = fetchError.data?.detail || 'Impossible de mettre à jour le programme'
    alert(detail)
  } finally {
    isSubmitting.value = false
  }
}

// Annuler
const handleCancel = () => {
  if (hasChanges.value) {
    showDiscardModal.value = true
  } else {
    router.push(`/admin/formations/programmes/${program.value?.id}`)
  }
}

const confirmDiscard = () => {
  showDiscardModal.value = false
  router.push(`/admin/formations/programmes/${program.value?.id}`)
}

// Régénérer le slug
const regenerateSlug = () => {
  form.value.slug = generateSlug(form.value.title)
}

// Options pour les selects
const programTypes: { value: ProgramType; label: string }[] = [
  { value: 'master', label: 'Master' },
  { value: 'doctorate', label: 'Doctorat' },
  { value: 'university_diploma', label: 'Diplôme d\'Université (DU)' },
  { value: 'certificate', label: 'Formation certifiante' },
]

const publicationStatuses: { value: PublicationStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'archived', label: 'Archivé' },
]
</script>

<template>
  <!-- État de chargement -->
  <div v-if="loading" class="flex items-center justify-center py-12">
    <div class="text-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="w-8 h-8 animate-spin text-blue-600" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Chargement du programme...</p>
    </div>
  </div>

  <div v-else-if="program" class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <button
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          @click="handleCancel"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5" />
        </button>
        <div>
          <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <NuxtLink to="/admin/formations/programmes" class="hover:text-blue-600 dark:hover:text-blue-400">
              Programmes
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
            <NuxtLink :to="`/admin/formations/programmes/${program.id}`" class="hover:text-blue-600 dark:hover:text-blue-400">
              {{ program.title }}
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
            <span class="text-gray-900 dark:text-white">Modifier</span>
          </nav>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Modifier le programme
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="handleCancel"
        >
          Annuler
        </button>
        <button
          type="submit"
          form="edit-form"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-save" class="w-4 h-4" />
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Formulaire -->
    <form id="edit-form" @submit.prevent="submitForm" class="space-y-6">
      <!-- Informations générales -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-info-circle" class="w-5 h-5 text-blue-500" />
          Informations générales
        </h2>

        <div class="space-y-6">
          <!-- Code et Titre -->
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <label for="code" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Code <span class="text-red-500">*</span>
              </label>
              <input
                id="code"
                v-model="form.code"
                type="text"
                required
                placeholder="MPAGD"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div class="sm:col-span-2">
              <label for="title" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre <span class="text-red-500">*</span>
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                placeholder="Master en..."
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Sous-titre -->
          <div>
            <label for="subtitle" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sous-titre
            </label>
            <input
              id="subtitle"
              v-model="form.subtitle"
              type="text"
              placeholder="Une courte description..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <!-- Slug -->
          <div>
            <label for="slug" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug (URL) <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                id="slug"
                v-model="form.slug"
                type="text"
                required
                placeholder="master-en-..."
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Régénérer depuis le titre"
                @click="regenerateSlug"
              >
                <font-awesome-icon icon="fa-solid fa-rotate" class="w-4 h-4" />
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL: /formations/{{ form.slug || '...' }}
            </p>
          </div>

          <!-- Type -->
          <div class="sm:max-w-xs">
            <label for="type" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type de formation <span class="text-red-500">*</span>
            </label>
            <select
              id="type"
              v-model="form.type"
              required
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="pt in programTypes" :key="pt.value" :value="pt.value">
                {{ pt.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Image de couverture -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-image" class="w-5 h-5 text-indigo-500" />
          Image de couverture
        </h2>

        <div class="space-y-4">
          <!-- Prévisualisation -->
          <div v-if="form.cover_image" class="relative">
            <img
              :src="form.cover_image"
              alt="Image de couverture"
              class="h-48 w-full rounded-lg object-cover"
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
          <div v-else class="relative">
            <label
              class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
            >
              <font-awesome-icon icon="fa-solid fa-cloud-upload-alt" class="mb-3 h-10 w-10 text-gray-400" />
              <p class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
          </div>

          <!-- Indicateur de chargement -->
          <div v-if="isUploadingCover" class="flex items-center gap-2 text-sm text-gray-500">
            <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
            Upload en cours...
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-align-left" class="w-5 h-5 text-green-500" />
          Description
        </h2>

        <div class="space-y-6">
          <div>
            <label for="description" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description complète
            </label>
            <ClientOnly>
              <EditorJS
                v-model="form.description"
                placeholder="Décrivez le programme en détail..."
                :min-height="200"
              />
            </ClientOnly>
          </div>

          <div>
            <label for="teaching_methods" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Méthodes d'enseignement
            </label>
            <textarea
              id="teaching_methods"
              v-model="form.teaching_methods"
              rows="4"
              placeholder="Décrivez les méthodes pédagogiques utilisées..."
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <!-- Détails académiques -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-5 h-5 text-purple-500" />
          Détails académiques
        </h2>

        <div class="space-y-6">
          <!-- Durée et Crédits -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="duration_months" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durée (en mois)
              </label>
              <input
                id="duration_months"
                v-model.number="form.duration_months"
                type="number"
                min="1"
                max="120"
                placeholder="24"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Exemple: 24 mois = 2 ans
              </p>
            </div>
            <div>
              <label for="credits" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Crédits ECTS
              </label>
              <input
                id="credits"
                v-model.number="form.credits"
                type="number"
                min="0"
                max="500"
                placeholder="120"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Diplôme délivré et requis -->
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="degree_awarded" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme délivré
              </label>
              <input
                id="degree_awarded"
                v-model="form.degree_awarded"
                type="text"
                placeholder="Master professionnel"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label for="required_degree" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diplôme requis
              </label>
              <input
                id="required_degree"
                v-model="form.required_degree"
                type="text"
                placeholder="Licence ou équivalent Bac+3"
                class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Options de publication -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-cog" class="w-5 h-5 text-gray-500" />
          Publication
        </h2>

        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="status" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Statut de publication
            </label>
            <select
              id="status"
              v-model="form.status"
              class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option v-for="ps in publicationStatuses" :key="ps.value" :value="ps.value">
                {{ ps.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Seuls les programmes publiés sont visibles sur le site public.
            </p>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mise en avant
            </label>
            <label class="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700">
              <input
                v-model="form.is_featured"
                type="checkbox"
                class="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700"
              >
              <div>
                <span class="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                  <font-awesome-icon icon="fa-solid fa-star" class="h-3.5 w-3.5 text-amber-500" />
                  À la une
                </span>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Afficher sur la page d'accueil
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Compétences -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon icon="fa-solid fa-list-check" class="h-5 w-5 text-amber-500" />
            Compétences visées
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ skills.length }}
            </span>
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            @click="openAddSkillModal"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            Ajouter
          </button>
        </div>

        <!-- Chargement -->
        <div v-if="loadingSkills" class="flex items-center justify-center py-8">
          <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
        </div>

        <!-- Liste vide -->
        <div v-else-if="skills.length === 0" class="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
          <font-awesome-icon icon="fa-solid fa-list-check" class="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Aucune compétence définie pour ce programme.
          </p>
          <button
            type="button"
            class="mt-3 text-sm text-amber-600 hover:underline dark:text-amber-400"
            @click="openAddSkillModal"
          >
            Ajouter la première compétence
          </button>
        </div>

        <!-- Liste des compétences -->
        <div v-else class="space-y-2">
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-grip-vertical" class="mr-1 h-3 w-3" />
            Glissez-déposez pour réorganiser
          </p>

          <div
            v-for="(skill, index) in skills"
            :key="skill.id"
            class="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all dark:border-gray-700 dark:bg-gray-700/50"
            :class="{ 'opacity-50': draggedSkillIndex === index }"
            draggable="true"
            @dragstart="onSkillDragStart(index)"
            @dragover="onSkillDragOver"
            @drop="(e) => onSkillDrop(e, index)"
            @dragend="onSkillDragEnd"
          >
            <!-- Poignée -->
            <div class="cursor-grab text-gray-400 active:cursor-grabbing">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
            </div>

            <!-- Numéro -->
            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              {{ index + 1 }}
            </div>

            <!-- Contenu -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ skill.title }}</p>
              <p v-if="skill.description" class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {{ skill.description }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 gap-1">
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                title="Modifier"
                @click="openEditSkillModal(skill)"
              >
                <font-awesome-icon icon="fa-solid fa-pen" class="h-3 w-3" />
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                title="Supprimer"
                @click="openDeleteSkillModal(skill)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Débouchés -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon icon="fa-solid fa-briefcase" class="h-5 w-5 text-green-500" />
            Débouchés professionnels
            <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {{ careerOpportunities.length }}
            </span>
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            @click="openAddCareerOpportunityModal"
          >
            <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
            Ajouter
          </button>
        </div>

        <!-- Chargement -->
        <div v-if="loadingCareerOpportunities" class="flex items-center justify-center py-8">
          <font-awesome-icon icon="fa-solid fa-spinner" class="h-6 w-6 animate-spin text-gray-400" />
        </div>

        <!-- Liste vide -->
        <div v-else-if="careerOpportunities.length === 0" class="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
          <font-awesome-icon icon="fa-solid fa-briefcase" class="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Aucun débouché défini pour ce programme.
          </p>
          <button
            type="button"
            class="mt-3 text-sm text-green-600 hover:underline dark:text-green-400"
            @click="openAddCareerOpportunityModal"
          >
            Ajouter le premier débouché
          </button>
        </div>

        <!-- Liste des débouchés -->
        <div v-else class="space-y-2">
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-grip-vertical" class="mr-1 h-3 w-3" />
            Glissez-déposez pour réorganiser
          </p>

          <div
            v-for="(opportunity, index) in careerOpportunities"
            :key="opportunity.id"
            class="group flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all dark:border-gray-700 dark:bg-gray-700/50"
            :class="{ 'opacity-50': draggedCareerOpportunityIndex === index }"
            draggable="true"
            @dragstart="onCareerOpportunityDragStart(index)"
            @dragover="onCareerOpportunityDragOver"
            @drop="(e) => onCareerOpportunityDrop(e, index)"
            @dragend="onCareerOpportunityDragEnd"
          >
            <!-- Poignée -->
            <div class="cursor-grab text-gray-400 active:cursor-grabbing">
              <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
            </div>

            <!-- Numéro -->
            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
              {{ index + 1 }}
            </div>

            <!-- Contenu -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ opportunity.title }}</p>
              <p v-if="opportunity.description" class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {{ opportunity.description }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 gap-1">
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                title="Modifier"
                @click="openEditCareerOpportunityModal(opportunity)"
              >
                <font-awesome-icon icon="fa-solid fa-pen" class="h-3 w-3" />
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                title="Supprimer"
                @click="openDeleteCareerOpportunityModal(opportunity)"
              >
                <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Boutons -->
      <div class="flex items-center justify-between rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span v-if="hasChanges" class="text-yellow-600 dark:text-yellow-400">
            <font-awesome-icon icon="fa-solid fa-circle" class="mr-1 w-2 h-2" />
            Modifications non enregistrées
          </span>
          <span v-else class="text-green-600 dark:text-green-400">
            <font-awesome-icon icon="fa-solid fa-check" class="mr-1 w-3 h-3" />
            Aucune modification
          </span>
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="handleCancel"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            <font-awesome-icon v-if="isSubmitting" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
            <font-awesome-icon v-else icon="fa-solid fa-save" class="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </form>

    <!-- Modal de confirmation d'annulation -->
    <Teleport to="body">
      <div
        v-if="showDiscardModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDiscardModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifications non enregistrées
            </h3>
          </div>

          <p class="mb-6 text-gray-600 dark:text-gray-300">
            Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter sans enregistrer ?
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDiscardModal = false"
            >
              Continuer l'édition
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="confirmDiscard"
            >
              Quitter sans enregistrer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Ajouter compétence -->
    <Teleport to="body">
      <div
        v-if="showAddSkillModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddSkillModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter une compétence
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddSkillModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="addSkill">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre de la compétence *
              </label>
              <input
                v-model="newSkill.title"
                type="text"
                required
                placeholder="Ex: Maîtriser les outils de gestion de projet"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newSkill.description"
                rows="3"
                placeholder="Détail de la compétence..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingSkill"
                @click="closeAddSkillModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                :disabled="isSubmittingSkill"
              >
                <font-awesome-icon v-if="isSubmittingSkill" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingSkill ? 'Ajout...' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier compétence -->
    <Teleport to="body">
      <div
        v-if="showEditSkillModal && editingSkill"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditSkillModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier la compétence
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditSkillModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="updateSkillHandler">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre de la compétence *
              </label>
              <input
                v-model="editingSkill.title"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingSkill.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingSkill"
                @click="closeEditSkillModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                :disabled="isSubmittingSkill"
              >
                <font-awesome-icon v-if="isSubmittingSkill" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingSkill ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer compétence -->
    <Teleport to="body">
      <div
        v-if="showDeleteSkillModal && deletingSkill"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteSkillModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer la compétence
            </h3>
          </div>

          <p class="mb-3 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette compétence ?
          </p>
          <p class="mb-3 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingSkill.title }}
          </p>

          <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div class="text-sm text-amber-800 dark:text-amber-300">
                <p class="font-medium">Cette compétence n'est actuellement utilisée nulle part.</p>
                <p class="mt-1 text-amber-700 dark:text-amber-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isSubmittingSkill"
              @click="closeDeleteSkillModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isSubmittingSkill"
              @click="deleteSkillHandler"
            >
              <font-awesome-icon v-if="isSubmittingSkill" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmittingSkill ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Ajouter débouché -->
    <Teleport to="body">
      <div
        v-if="showAddCareerOpportunityModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddCareerOpportunityModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un débouché
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddCareerOpportunityModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="addCareerOpportunity">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre du débouché *
              </label>
              <input
                v-model="newCareerOpportunity.title"
                type="text"
                required
                placeholder="Ex: Chef de projet en développement durable"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newCareerOpportunity.description"
                rows="3"
                placeholder="Détail du débouché..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingCareerOpportunity"
                @click="closeAddCareerOpportunityModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                :disabled="isSubmittingCareerOpportunity"
              >
                <font-awesome-icon v-if="isSubmittingCareerOpportunity" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingCareerOpportunity ? 'Ajout...' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier débouché -->
    <Teleport to="body">
      <div
        v-if="showEditCareerOpportunityModal && editingCareerOpportunity"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditCareerOpportunityModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le débouché
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditCareerOpportunityModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="updateCareerOpportunityHandler">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre du débouché *
              </label>
              <input
                v-model="editingCareerOpportunity.title"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingCareerOpportunity.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmittingCareerOpportunity"
                @click="closeEditCareerOpportunityModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                :disabled="isSubmittingCareerOpportunity"
              >
                <font-awesome-icon v-if="isSubmittingCareerOpportunity" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
                {{ isSubmittingCareerOpportunity ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer débouché -->
    <Teleport to="body">
      <div
        v-if="showDeleteCareerOpportunityModal && deletingCareerOpportunity"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteCareerOpportunityModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le débouché
            </h3>
          </div>

          <p class="mb-3 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce débouché ?
          </p>
          <p class="mb-3 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingCareerOpportunity.title }}
          </p>

          <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <div class="flex items-start gap-2">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div class="text-sm text-amber-800 dark:text-amber-300">
                <p class="mt-1 text-amber-700 dark:text-amber-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isSubmittingCareerOpportunity"
              @click="closeDeleteCareerOpportunityModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isSubmittingCareerOpportunity"
              @click="deleteCareerOpportunityHandler"
            >
              <font-awesome-icon v-if="isSubmittingCareerOpportunity" icon="fa-solid fa-spinner" class="mr-2 h-4 w-4 animate-spin" />
              {{ isSubmittingCareerOpportunity ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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

  <!-- État non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-12">
    <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
      Programme non trouvé
    </h3>
    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
      Ce programme n'existe pas ou a été supprimé.
    </p>
    <NuxtLink
      to="/admin/formations/programmes"
      class="text-sm text-blue-600 hover:underline dark:text-blue-400"
    >
      Retour à la liste des programmes
    </NuxtLink>
  </div>
</template>
