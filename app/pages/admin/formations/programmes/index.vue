<script setup lang="ts">
import type { ProgramCreatePayload, ProgramRead, ProgramType, ProgramFieldRead, PublicationStatus, ImageVariants } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

const {
  listPrograms,
  createProgram,
  deleteProgram,
  duplicateProgram,
  programTypeLabels,
  programTypeColors,
  formatDuration,
  isPublished,
} = useProgramsApi()

const {
  uploadMediaVariants,
} = useMediaApi()

const {
  listFields,
} = useProgramFieldsApi()

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

onMounted(loadProgramFields)

// === STATE ===
const loading = ref(true)
const error = ref<string | null>(null)
const programs = ref<ProgramRead[]>([])
const totalItems = ref(0)
const totalPages = ref(1)

// Filtres
const searchQuery = ref('')
const filterType = ref<ProgramType | 'all'>('all')
const filterStatus = ref<PublicationStatus | 'all'>('all')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Tri
const sortBy = ref<'title' | 'type' | 'status'>('title')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Sélection
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const deletingProgram = ref<ProgramRead | null>(null)
const isSubmitting = ref(false)

// Form state
const programForm = ref({
  code: '',
  title: '',
  subtitle: '',
  slug: '',
  type: 'master' as ProgramType,
  description: '',
  duration_months: 24,
  credits: 120,
  degree_awarded: '',
  required_degree: '',
  status: 'draft' as PublicationStatus,
  is_featured: false,
  cover_image: '',
  cover_image_external_id: null as string | null,
  field_id: null as string | null,
})

// État de l'upload d'image
const pendingCoverFile = ref<File | null>(null)
const showCoverEditor = ref(false)
const isUploadingCover = ref(false)

// === DATA LOADING ===
async function loadPrograms() {
  loading.value = true
  error.value = null
  try {
    const response = await listPrograms({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      type: filterType.value,
      status: filterStatus.value,
    })
    programs.value = response.items
    totalItems.value = response.total
    totalPages.value = response.pages
  }
  catch (e) {
    error.value = 'Erreur lors du chargement des programmes'
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

// Watch filters with debounce
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([searchQuery, filterType, filterStatus], () => {
  currentPage.value = 1 // Reset to first page on filter change
  if (debounceTimer)
    clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadPrograms, 300)
})

watch(currentPage, loadPrograms)

onMounted(loadPrograms)

// === COMPUTED ===
// Stats (calculées depuis les données chargées - approximatif car paginé)
const stats = computed(() => ({
  total: totalItems.value,
  published: programs.value.filter(p => isPublished(p.status)).length,
  draft: programs.value.filter(p => !isPublished(p.status)).length,
  masters: programs.value.filter(p => p.type === 'master').length,
  doctorats: programs.value.filter(p => p.type === 'doctorate').length,
}))

// Programmes triés localement (pagination côté serveur)
const sortedPrograms = computed(() => {
  const result = [...programs.value]
  result.sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  return result
})

// === METHODS ===
// Génération de slug unique (titre + suffixe)
function generateSlug(title: string) {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  // Ajouter un suffixe unique
  const suffix = Date.now().toString(36).slice(-4)
  return `${base}-${suffix}`
}

// Génération de code unique (préfixe du titre + suffixe numérique)
function generateCode(title: string) {
  const prefix = title
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[^A-Z0-9]+/g, '')
    .substring(0, 6)
  // Ajouter un suffixe numérique unique basé sur le timestamp
  const suffix = Date.now().toString(36).slice(-4).toUpperCase()
  return `${prefix}-${suffix}`
}

// Watchers pour auto-génération
watch(() => programForm.value.title, (newTitle) => {
  programForm.value.slug = generateSlug(newTitle)
  programForm.value.code = generateCode(newTitle)
})

// Réinitialiser field_id si le type change (hors certificat)
watch(() => programForm.value.type, (newType) => {
  if (newType !== 'certificate') {
    programForm.value.field_id = null
  }
})

// Gestion de la sélection
function toggleSelectAll() {
  if (selectAll.value) {
    selectedIds.value = sortedPrograms.value.map(p => p.id)
  }
  else {
    selectedIds.value = []
  }
}

function toggleSelect(id: string) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  }
  else {
    selectedIds.value.splice(index, 1)
  }
}

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

// Tri
function toggleSort(column: typeof sortBy.value) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }
  else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
}

// Reset filtres
function resetFilters() {
  searchQuery.value = ''
  filterType.value = 'all'
  filterStatus.value = 'all'
  currentPage.value = 1
}

// Modals
function openCreateModal() {
  programForm.value = {
    code: '',
    title: '',
    subtitle: '',
    slug: '',
    type: 'master',
    description: '',
    duration_months: 24,
    credits: 120,
    degree_awarded: 'Master professionnel',
    required_degree: 'Bac+4 minimum',
    status: 'draft',
    is_featured: false,
    cover_image: '',
    cover_image_external_id: null,
    field_id: null,
  }
  pendingCoverFile.value = null
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  pendingCoverFile.value = null
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

    programForm.value.cover_image_external_id = response.original.id
    programForm.value.cover_image = URL.createObjectURL(variants.medium)
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
  programForm.value.cover_image = ''
  programForm.value.cover_image_external_id = null
}

function openDeleteModal(program: ProgramRead) {
  deletingProgram.value = program
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deletingProgram.value = null
}

// Navigation
function viewProgram(program: ProgramRead) {
  router.push(`/admin/formations/programmes/${program.id}`)
}

function editProgram(program: ProgramRead) {
  router.push(`/admin/formations/programmes/${program.id}/edit`)
}

// Actions CRUD
async function handleCreateProgram() {
  isSubmitting.value = true
  try {
    const payload: ProgramCreatePayload = {
      code: programForm.value.code,
      title: programForm.value.title,
      subtitle: programForm.value.subtitle || null,
      slug: programForm.value.slug,
      type: programForm.value.type,
      description: programForm.value.description || null,
      duration_months: programForm.value.duration_months || null,
      credits: programForm.value.credits || null,
      degree_awarded: programForm.value.degree_awarded || null,
      required_degree: programForm.value.required_degree || null,
      status: programForm.value.status,
      is_featured: programForm.value.is_featured,
      cover_image_external_id: programForm.value.cover_image_external_id,
      field_id: programForm.value.type === 'certificate' ? programForm.value.field_id : null,
    }
    const result = await createProgram(payload)
    closeCreateModal()
    // Rediriger vers la page d'édition du nouveau programme
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

async function handleDeleteProgram() {
  if (!deletingProgram.value)
    return
  isSubmitting.value = true
  try {
    await deleteProgram(deletingProgram.value.id)
    closeDeleteModal()
    await loadPrograms()
  }
  catch (e) {
    console.error('Erreur suppression programme:', e)
    alert('Erreur lors de la suppression du programme')
  }
  finally {
    isSubmitting.value = false
  }
}

async function handleDuplicateProgram(program: ProgramRead) {
  const newCode = `${program.code}-COPY`
  const newTitle = `${program.title} (copie)`
  const newSlug = `${program.slug}-copie`

  try {
    const result = await duplicateProgram(program.id, {
      new_code: newCode,
      new_title: newTitle,
      new_slug: newSlug,
    })
    // Rediriger vers la page d'édition du nouveau programme
    router.push(`/admin/formations/programmes/${result.id}/edit`)
  }
  catch (e) {
    console.error('Erreur duplication programme:', e)
    alert('Erreur lors de la duplication du programme')
  }
}

// Actions en masse
async function bulkPublish() {
  // À implémenter si nécessaire avec un endpoint batch
  console.log('Publishing:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

async function bulkUnpublish() {
  // À implémenter si nécessaire avec un endpoint batch
  console.log('Unpublishing:', selectedIds.value)
  selectedIds.value = []
  selectAll.value = false
}

async function bulkDelete() {
  if (confirm(`Supprimer ${selectedIds.value.length} programme(s) ?`)) {
    // Supprimer un par un
    for (const id of selectedIds.value) {
      try {
        await deleteProgram(id)
      }
      catch (e) {
        console.error('Erreur suppression:', e)
      }
    }
    selectedIds.value = []
    selectAll.value = false
    await loadPrograms()
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Programmes de formation
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les formations (masters, doctorats, DU, certificats)
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="openCreateModal"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Nouveau programme
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Publiés</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.published }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Brouillons</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.draft }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Masters</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.masters }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Doctorats</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.doctorats }}</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Recherche -->
        <div class="relative flex-1 lg:max-w-md">
          <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un programme..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-2">
          <select
            v-model="filterType"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="master">Master</option>
            <option value="doctorate">Doctorat</option>
            <option value="university_diploma">DU</option>
            <option value="certificate">Certificat</option>
          </select>

          <select
            v-model="filterStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="archived">Archivés</option>
          </select>

          <button
            v-if="searchQuery || filterType !== 'all' || filterStatus !== 'all'"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="resetFilters"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Actions en masse -->
      <div
        v-if="selectedIds.length > 0"
        class="mt-4 flex items-center gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
      >
        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
          {{ selectedIds.length }} programme(s) sélectionné(s)
        </span>
        <div class="flex gap-2">
          <button
            class="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
            @click="bulkPublish"
          >
            Publier
          </button>
          <button
            class="rounded bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
            @click="bulkUnpublish"
          >
            Dépublier
          </button>
          <button
            class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            @click="bulkDelete"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <svg class="h-6 w-6 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-gray-600 dark:text-gray-400">Chargement des programmes...</span>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
      <div class="flex items-center gap-3">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-5 w-5 text-red-500" />
        <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
        <button
          class="ml-auto text-sm text-red-600 hover:underline dark:text-red-400"
          @click="loadPrograms"
        >
          Réessayer
        </button>
      </div>
    </div>

    <!-- Tableau -->
    <template v-else>
      <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="w-10 px-4 py-3">
                  <input
                    v-model="selectAll"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    @change="toggleSelectAll"
                  >
                </th>
                <th
                  class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  @click="toggleSort('title')"
                >
                  <span class="flex items-center gap-1">
                    Programme
                    <font-awesome-icon v-if="sortBy === 'title'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                  </span>
                </th>
                <th
                  class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  @click="toggleSort('type')"
                >
                  <span class="flex items-center gap-1">
                    Type
                    <font-awesome-icon v-if="sortBy === 'type'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                  </span>
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Durée
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Crédits
                </th>
                <th
                  class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  @click="toggleSort('status')"
                >
                  <span class="flex items-center gap-1">
                    Statut
                    <font-awesome-icon v-if="sortBy === 'status'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                  </span>
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="program in sortedPrograms"
                :key="program.id"
                class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                :class="{ 'bg-blue-50 dark:bg-blue-900/30': isSelected(program.id) }"
                @click="viewProgram(program)"
              >
                <td class="px-4 py-3" @click.stop>
                  <input
                    type="checkbox"
                    :checked="isSelected(program.id)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    @change="toggleSelect(program.id)"
                  >
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="h-5 w-5 text-gray-400" />
                    </div>
                    <div class="min-w-0">
                      <p class="flex items-center gap-1.5 truncate font-medium text-gray-900 dark:text-white">
                        {{ program.title }}
                        <font-awesome-icon
                          v-if="program.is_featured"
                          icon="fa-solid fa-star"
                          class="h-3.5 w-3.5 text-amber-500"
                          title="À la une"
                        />
                      </p>
                      <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                        {{ program.code }} · {{ program.slug }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                    :class="programTypeColors[program.type]"
                  >
                    {{ programTypeLabels[program.type] }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ formatDuration(program.duration_months) }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ program.credits || '-' }} ECTS
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                    :class="isPublished(program.status)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : program.status === 'archived'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="isPublished(program.status)
                        ? 'bg-green-500'
                        : program.status === 'archived'
                          ? 'bg-gray-500'
                          : 'bg-yellow-500'"
                    />
                    {{ isPublished(program.status) ? 'Publié' : program.status === 'archived' ? 'Archivé' : 'Brouillon' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right" @click.stop>
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                      title="Voir les détails"
                      @click="viewProgram(program)"
                    >
                      <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
                    </button>
                    <button
                      class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      title="Modifier"
                      @click="editProgram(program)"
                    >
                      <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                    </button>
                    <button
                      class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                      title="Dupliquer"
                      @click="handleDuplicateProgram(program)"
                    >
                      <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
                    </button>
                    <button
                      class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                      title="Supprimer"
                      @click="openDeleteModal(program)"
                    >
                      <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalItems) }} sur {{ totalItems }} programmes
          </div>
          <div class="flex items-center gap-2">
            <button
              :disabled="currentPage === 1"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              @click="currentPage--"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-left" class="h-3 w-3" />
            </button>
            <span class="text-sm text-gray-600 dark:text-gray-300">
              Page {{ currentPage }} / {{ totalPages || 1 }}
            </span>
            <button
              :disabled="currentPage >= totalPages"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              @click="currentPage++"
            >
              <font-awesome-icon icon="fa-solid fa-chevron-right" class="h-3 w-3" />
            </button>
          </div>
        </div>

        <!-- État vide -->
        <div
          v-if="sortedPrograms.length === 0 && !loading"
          class="flex flex-col items-center justify-center py-12"
        >
          <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="h-8 w-8 text-gray-400" />
          </div>
          <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
            Aucun programme trouvé
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Essayez de modifier vos filtres ou créez un nouveau programme.
          </p>
        </div>
      </div>
    </template>

    <!-- Modal Créer -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="closeCreateModal"
      >
        <div class="admin-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" data-lenis-prevent>
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Nouveau programme
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeCreateModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="handleCreateProgram">
            <!-- Titre et Code -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre *
                </label>
                <input
                  v-model="programForm.title"
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
                  v-model="programForm.code"
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
                v-model="programForm.slug"
                type="text"
                required
                placeholder="master-developpement"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
              <p class="mt-1 text-xs text-gray-500">Auto-généré depuis le titre</p>
            </div>

            <!-- Type -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type *
              </label>
              <select
                v-model="programForm.type"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="master">Master</option>
                <option value="doctorate">Doctorat</option>
                <option value="university_diploma">Diplôme d'Université (DU)</option>
                <option value="certificate">Certificat</option>
              </select>
            </div>

            <!-- Champ disciplinaire (certificats uniquement) -->
            <div v-if="programForm.type === 'certificate'">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Champ disciplinaire
              </label>
              <select
                v-model="programForm.field_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option :value="null">-- Aucun --</option>
                <option v-for="field in programFields" :key="field.id" :value="field.id">
                  {{ field.name }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500">Domaine thématique du certificat</p>
            </div>

            <!-- Sous-titre -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sous-titre
              </label>
              <input
                v-model="programForm.subtitle"
                type="text"
                placeholder="Gestion du développement durable"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
            </div>

            <!-- Durée et Crédits -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Durée (mois)
                </label>
                <input
                  v-model.number="programForm.duration_months"
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
                  v-model.number="programForm.credits"
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
                  v-model="programForm.degree_awarded"
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
                  v-model="programForm.required_degree"
                  type="text"
                  placeholder="Bac+4 minimum"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
            </div>

            <!-- Image de couverture -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image de couverture
              </label>
              <div class="space-y-2">
                <!-- Prévisualisation -->
                <div v-if="programForm.cover_image" class="relative">
                  <img
                    :src="programForm.cover_image"
                    alt="Image de couverture"
                    class="h-32 w-full rounded-lg object-cover"
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
                  class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-500"
                >
                  <font-awesome-icon icon="fa-solid fa-cloud-upload-alt" class="mb-2 h-6 w-6 text-gray-400" />
                  <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Cliquez pour télécharger
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG ou WebP (ratio 16:9)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleCoverImageUpload"
                  />
                </label>

                <!-- Indicateur de chargement -->
                <div v-if="isUploadingCover" class="flex items-center gap-2 text-xs text-gray-500">
                  <font-awesome-icon icon="fa-solid fa-spinner" class="h-3 w-3 animate-spin" />
                  Upload en cours...
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                v-model="programForm.description"
                rows="3"
                placeholder="Décrivez brièvement la formation..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Statut et À la une -->
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Statut de publication
                </label>
                <select
                  v-model="programForm.status"
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
                    v-model="programForm.is_featured"
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

            <!-- Boutons -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeCreateModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Création...' : 'Créer le programme' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingProgram"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le programme
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible.
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingProgram.title }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isSubmitting"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              @click="handleDeleteProgram"
            >
              {{ isSubmitting ? 'Suppression...' : 'Supprimer' }}
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
</template>
