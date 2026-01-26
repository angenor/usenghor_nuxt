<script setup lang="ts">
import type { ProgramSkillRead, ProgramRead, ProgramType } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

// API composables
const {
  listSkills,
  createSkill: apiCreateSkill,
  updateSkill: apiUpdateSkill,
  deleteSkill: apiDeleteSkill,
  reorderSkills: apiReorderSkills,
} = useProgramSkillsApi()

const {
  listPrograms,
  programTypeLabels,
  programTypeColors,
} = useProgramsApi()

// === STATE ===
const selectedProgramId = ref<string | null>(null)
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingSkill = ref<ProgramSkillRead | null>(null)
const deletingSkill = ref<ProgramSkillRead | null>(null)

// API state
const loading = ref(false)
const loadingSkills = ref(false)
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const isReordering = ref(false)
const programs = ref<ProgramRead[]>([])
const skills = ref<ProgramSkillRead[]>([])
const totalSkillsCount = ref(0)
const programsWithSkillsCount = ref(0)

// Cache pour le comptage des compétences par programme
const skillCountCache = ref<Record<string, number>>({})

// Form state
const newSkill = ref({
  title: '',
  description: ''
})

// === DATA FETCHING ===
async function fetchPrograms() {
  loading.value = true
  error.value = null
  try {
    // Charger les masters
    const masterResponse = await listPrograms({
      page: 1,
      limit: 100,
      type: 'master',
    })
    // Charger les doctorats
    const doctorateResponse = await listPrograms({
      page: 1,
      limit: 100,
      type: 'doctorate',
    })
    programs.value = [...masterResponse.items, ...doctorateResponse.items]
      .sort((a, b) => a.title.localeCompare(b.title))
  } catch (e) {
    error.value = 'Erreur lors du chargement des programmes'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchSkills() {
  if (!selectedProgramId.value) {
    skills.value = []
    return
  }
  loadingSkills.value = true
  error.value = null
  try {
    const response = await listSkills({
      program_id: selectedProgramId.value,
      limit: 100,
    })
    skills.value = response.items.sort((a, b) => a.display_order - b.display_order)
  } catch (e) {
    error.value = 'Erreur lors du chargement des compétences'
    console.error(e)
  } finally {
    loadingSkills.value = false
  }
}

async function fetchStats() {
  try {
    // Charger toutes les compétences avec pagination (max 100 par page)
    const allSkills: ProgramSkillRead[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await listSkills({ page, limit: 100 })
      allSkills.push(...response.items)
      totalSkillsCount.value = response.total

      // Vérifier s'il y a plus de pages
      hasMore = response.items.length === 100 && allSkills.length < response.total
      page++
    }

    // Calculer le nombre de programmes avec des compétences
    const uniqueProgramIds = new Set(allSkills.map(s => s.program_id))
    programsWithSkillsCount.value = uniqueProgramIds.size

    // Mettre à jour le cache de comptage
    const counts: Record<string, number> = {}
    allSkills.forEach(skill => {
      counts[skill.program_id] = (counts[skill.program_id] || 0) + 1
    })
    skillCountCache.value = counts
  } catch (e) {
    console.error('Erreur lors du chargement des statistiques', e)
  }
}

// === COMPUTED ===
// Liste des programmes disponibles
const availablePrograms = computed(() => {
  return programs.value.filter(p =>
    p.type === 'master' || p.type === 'doctorate'
  )
})

// Programmes filtrés par recherche
const filteredPrograms = computed(() => {
  if (!searchQuery.value) return availablePrograms.value
  const query = searchQuery.value.toLowerCase()
  return availablePrograms.value.filter(p =>
    p.title.toLowerCase().includes(query)
  )
})

// Programme sélectionné
const selectedProgram = computed(() => {
  if (!selectedProgramId.value) return null
  return programs.value.find(p => p.id === selectedProgramId.value) || null
})

// Nombre de compétences pour un programme (depuis le cache)
const getSkillCountForProgram = (programId: string): number => {
  return skillCountCache.value[programId] || 0
}

// === METHODS ===
const selectProgram = (programId: string) => {
  selectedProgramId.value = programId
  searchQuery.value = ''
}

const openAddModal = () => {
  newSkill.value = { title: '', description: '' }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newSkill.value = { title: '', description: '' }
}

const openEditModal = (skill: ProgramSkillRead) => {
  editingSkill.value = { ...skill }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingSkill.value = null
}

const openDeleteModal = (skill: ProgramSkillRead) => {
  deletingSkill.value = skill
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingSkill.value = null
}

// === CRUD ACTIONS ===
const addSkill = async () => {
  if (!newSkill.value.title.trim() || !selectedProgramId.value) return

  isSubmitting.value = true
  error.value = null
  try {
    await apiCreateSkill({
      program_id: selectedProgramId.value,
      title: newSkill.value.title,
      description: newSkill.value.description || undefined,
      display_order: skills.value.length + 1,
    })
    closeAddModal()
    await fetchSkills()
    await fetchStats()
  } catch (e) {
    error.value = 'Erreur lors de la création de la compétence'
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

const updateSkill = async () => {
  if (!editingSkill.value) return

  isSubmitting.value = true
  error.value = null
  try {
    await apiUpdateSkill(editingSkill.value.id, {
      title: editingSkill.value.title,
      description: editingSkill.value.description || undefined,
    })
    closeEditModal()
    await fetchSkills()
  } catch (e) {
    error.value = 'Erreur lors de la mise à jour de la compétence'
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

const deleteSkill = async () => {
  if (!deletingSkill.value) return

  isSubmitting.value = true
  error.value = null
  try {
    await apiDeleteSkill(deletingSkill.value.id)
    closeDeleteModal()
    await fetchSkills()
    await fetchStats()
  } catch (e) {
    error.value = 'Erreur lors de la suppression de la compétence'
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

// === DRAG & DROP ===
const draggedIndex = ref<number | null>(null)

const onDragStart = (index: number) => {
  draggedIndex.value = index
}

const onDragOver = (e: DragEvent, _index: number) => {
  e.preventDefault()
}

const onDrop = async (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) return

  // Mise à jour optimiste de l'UI
  const newSkills = [...skills.value]
  const [draggedSkill] = newSkills.splice(draggedIndex.value, 1)
  newSkills.splice(targetIndex, 0, draggedSkill)
  skills.value = newSkills

  // Obtenir la nouvelle liste ordonnée d'IDs
  const skillIds = newSkills.map(s => s.id)

  isReordering.value = true
  error.value = null
  try {
    await apiReorderSkills(skillIds)
    // Recharger pour avoir les valeurs display_order à jour
    await fetchSkills()
  } catch (e) {
    error.value = 'Erreur lors de la réorganisation des compétences'
    console.error(e)
    // Revenir à l'état précédent en cas d'erreur
    await fetchSkills()
  } finally {
    isReordering.value = false
    draggedIndex.value = null
  }
}

const onDragEnd = () => {
  draggedIndex.value = null
}

// === HELPERS ===
const getFormationTypeColor = (type: ProgramType) => {
  return programTypeColors[type] || programTypeColors.master
}

const getFormationTypeLabel = (type: ProgramType) => {
  return programTypeLabels[type] || type
}

// === WATCHERS & LIFECYCLE ===
watch(selectedProgramId, () => {
  fetchSkills()
})

onMounted(async () => {
  await fetchPrograms()
  await fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Compétences par programme
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les compétences acquises pour chaque programme de formation
        </p>
      </div>

      <!-- Stats -->
      <div class="flex gap-4">
        <div class="rounded-lg bg-white px-4 py-2 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Total compétences</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ totalSkillsCount }}</p>
        </div>
        <div class="rounded-lg bg-white px-4 py-2 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Programmes</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ programsWithSkillsCount }}</p>
        </div>
      </div>
    </div>

    <!-- Erreur globale -->
    <div
      v-if="error"
      class="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400"
    >
      <font-awesome-icon icon="fa-solid fa-exclamation-circle" class="mr-2 h-4 w-4" />
      {{ error }}
      <button class="ml-2 underline" @click="error = null">Fermer</button>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Sélecteur de programme (sidebar) -->
      <div class="lg:col-span-1">
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h2 class="mb-4 font-semibold text-gray-900 dark:text-white">
            Sélectionner un programme
          </h2>

          <!-- Recherche -->
          <div class="relative mb-4">
            <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un programme..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <!-- Chargement -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-gray-400" />
          </div>

          <!-- Liste des programmes -->
          <div v-else class="admin-scrollbar max-h-[500px] space-y-2 overflow-y-scroll pr-1" data-lenis-prevent>
            <button
              v-for="program in filteredPrograms"
              :key="program.id"
              class="w-full rounded-lg border p-3 text-left transition-colors"
              :class="[
                selectedProgramId === program.id
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-700/50'
              ]"
              @click="selectProgram(program.id)"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ program.title }}
                </span>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="getFormationTypeColor(program.type)"
                >
                  {{ getFormationTypeLabel(program.type) }}
                </span>
              </div>
              <p v-if="program.short_description" class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {{ program.short_description }}
              </p>
              <div class="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <font-awesome-icon icon="fa-solid fa-list-check" class="h-3 w-3" />
                <span>{{ getSkillCountForProgram(program.id) }} compétences</span>
              </div>
            </button>

            <p
              v-if="filteredPrograms.length === 0"
              class="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              Aucun programme trouvé
            </p>
          </div>
        </div>
      </div>

      <!-- Liste des compétences -->
      <div class="lg:col-span-2">
        <div class="rounded-lg bg-white shadow dark:bg-gray-800">
          <!-- Header du panel -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-white">
                {{ selectedProgram ? selectedProgram.title : 'Compétences' }}
              </h2>
              <p v-if="selectedProgram" class="text-sm text-gray-500 dark:text-gray-400">
                {{ skills.length }} compétence{{ skills.length > 1 ? 's' : '' }} définies
              </p>
            </div>

            <button
              v-if="selectedProgram"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              :disabled="isSubmitting"
              @click="openAddModal"
            >
              <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
              Ajouter
            </button>
          </div>

          <!-- Contenu -->
          <div class="admin-scrollbar max-h-[600px] overflow-y-scroll p-4 pr-2" data-lenis-prevent>
            <!-- Chargement des compétences -->
            <div v-if="loadingSkills" class="flex items-center justify-center py-12">
              <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-gray-400" />
            </div>

            <!-- État vide - aucun programme sélectionné -->
            <div
              v-else-if="!selectedProgram"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                <font-awesome-icon icon="fa-solid fa-graduation-cap" class="h-8 w-8 text-gray-400" />
              </div>
              <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                Sélectionnez un programme
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Choisissez un programme dans la liste pour voir et gérer ses compétences
              </p>
            </div>

            <!-- État vide - pas de compétences -->
            <div
              v-else-if="skills.length === 0"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                <font-awesome-icon icon="fa-solid fa-list-check" class="h-8 w-8 text-gray-400" />
              </div>
              <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                Aucune compétence définie
              </h3>
              <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Ce programme n'a pas encore de compétences associées
              </p>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="openAddModal"
              >
                <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
                Ajouter la première compétence
              </button>
            </div>

            <!-- Liste des compétences -->
            <div v-else class="space-y-3">
              <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">
                <font-awesome-icon icon="fa-solid fa-grip-vertical" class="mr-1 h-3 w-3" />
                Glissez-déposez pour réorganiser l'ordre des compétences
                <span v-if="isReordering" class="ml-2">
                  <font-awesome-icon icon="fa-solid fa-spinner" class="h-3 w-3 animate-spin" />
                </span>
              </p>

              <div
                v-for="(skill, index) in skills"
                :key="skill.id"
                class="group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all dark:border-gray-700 dark:bg-gray-700/50"
                :class="{ 'opacity-50': draggedIndex === index }"
                draggable="true"
                @dragstart="onDragStart(index)"
                @dragover="(e) => onDragOver(e, index)"
                @drop="(e) => onDrop(e, index)"
                @dragend="onDragEnd"
              >
                <!-- Poignée de drag -->
                <div class="cursor-grab pt-1 text-gray-400 active:cursor-grabbing">
                  <font-awesome-icon icon="fa-solid fa-grip-vertical" class="h-4 w-4" />
                </div>

                <!-- Numéro -->
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {{ index + 1 }}
                </div>

                <!-- Contenu -->
                <div class="min-w-0 flex-1">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ skill.title }}
                  </h3>
                  <p v-if="skill.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ skill.description }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex shrink-0 gap-2">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    title="Modifier"
                    :disabled="isSubmitting"
                    @click="openEditModal(skill)"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="h-3 w-3" />
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    title="Supprimer"
                    :disabled="isSubmitting"
                    @click="openDeleteModal(skill)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter une compétence
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddModal"
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
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmitting"
                @click="closeAddModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSubmitting"
              >
                <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-2"></i>
                {{ isSubmitting ? 'Enregistrement...' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && editingSkill"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier la compétence
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="updateSkill">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre de la compétence *
              </label>
              <input
                v-model="editingSkill.title"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingSkill.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSubmitting"
                @click="closeEditModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                :disabled="isSubmitting"
              >
                <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-2"></i>
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingSkill"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
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

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cette compétence ?
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingSkill.title }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isSubmitting"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isSubmitting"
              @click="deleteSkill"
            >
              <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin mr-2"></i>
              {{ isSubmitting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<!-- Styles scrollbar dans base.css avec classe .admin-scrollbar -->
