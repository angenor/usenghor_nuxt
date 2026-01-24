<script setup lang="ts">
import type { ProgramCareerOpportunity, Formation } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  formations,
  getCareerOpportunitiesByProgram,
  getAllCareerOpportunities,
  getProgramsWithCareerOpportunities,
  generateCareerOpportunityId
} = useMockData()

// === STATE ===
const selectedProgramId = ref<string | null>(null)
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingCareer = ref<ProgramCareerOpportunity | null>(null)
const deletingCareer = ref<ProgramCareerOpportunity | null>(null)

// Form state
const newCareer = ref({
  title: '',
  description: ''
})

// === COMPUTED ===
// Liste des programmes (masters et doctorats principalement)
const availablePrograms = computed(() => {
  return formations.value
    .filter(f => f.formation_type === 'master' || f.formation_type === 'doctorat')
    .sort((a, b) => a.title_fr.localeCompare(b.title_fr))
})

// Programmes filtrés par recherche
const filteredPrograms = computed(() => {
  if (!searchQuery.value) return availablePrograms.value
  const query = searchQuery.value.toLowerCase()
  return availablePrograms.value.filter(p =>
    p.title_fr.toLowerCase().includes(query) ||
    p.title_en?.toLowerCase().includes(query)
  )
})

// Programme sélectionné
const selectedProgram = computed(() => {
  if (!selectedProgramId.value) return null
  return formations.value.find(f => f.id === selectedProgramId.value) || null
})

// Débouchés du programme sélectionné
const careerOpportunities = computed(() => {
  if (!selectedProgramId.value) return []
  return getCareerOpportunitiesByProgram(selectedProgramId.value)
})

// Stats
const totalCareersCount = computed(() => getAllCareerOpportunities().length)
const programsWithCareersCount = computed(() => getProgramsWithCareerOpportunities().length)

// === METHODS ===
const selectProgram = (programId: string) => {
  selectedProgramId.value = programId
  searchQuery.value = ''
}

const openAddModal = () => {
  newCareer.value = { title: '', description: '' }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newCareer.value = { title: '', description: '' }
}

const openEditModal = (career: ProgramCareerOpportunity) => {
  editingCareer.value = { ...career }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCareer.value = null
}

const openDeleteModal = (career: ProgramCareerOpportunity) => {
  deletingCareer.value = career
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingCareer.value = null
}

// Actions (mock - en prod, appeler l'API)
const addCareer = () => {
  if (!newCareer.value.title.trim() || !selectedProgramId.value) return

  // En production: POST /api/admin/programs/{program_id}/career-opportunities
  console.log('Adding career opportunity:', {
    id: generateCareerOpportunityId(),
    program_id: selectedProgramId.value,
    title: newCareer.value.title,
    description: newCareer.value.description,
    display_order: careerOpportunities.value.length + 1
  })

  closeAddModal()
}

const updateCareer = () => {
  if (!editingCareer.value) return

  // En production: PUT /api/admin/career-opportunities/{id}
  console.log('Updating career opportunity:', editingCareer.value)

  closeEditModal()
}

const deleteCareer = () => {
  if (!deletingCareer.value) return

  // En production: DELETE /api/admin/career-opportunities/{id}
  console.log('Deleting career opportunity:', deletingCareer.value.id)

  closeDeleteModal()
}

// Drag & Drop
const draggedIndex = ref<number | null>(null)

const onDragStart = (index: number) => {
  draggedIndex.value = index
}

const onDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
}

const onDrop = (e: DragEvent, targetIndex: number) => {
  e.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) return

  // En production: PUT /api/admin/programs/{program_id}/career-opportunities/reorder
  console.log('Reordering:', { from: draggedIndex.value, to: targetIndex })

  draggedIndex.value = null
}

const onDragEnd = () => {
  draggedIndex.value = null
}

// Couleurs des badges par type de formation
const getFormationTypeColor = (type: Formation['formation_type']) => {
  const colors = {
    master: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    doctorat: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    du: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    certifiante: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  }
  return colors[type] || colors.master
}

const getFormationTypeLabel = (type: Formation['formation_type']) => {
  const labels = {
    master: 'Master',
    doctorat: 'Doctorat',
    du: 'DU',
    certifiante: 'Certificat'
  }
  return labels[type] || type
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Débouchés par programme
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les opportunités de carrière pour chaque programme de formation
        </p>
      </div>

      <!-- Stats -->
      <div class="flex gap-4">
        <div class="rounded-lg bg-white px-4 py-2 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Total débouchés</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ totalCareersCount }}</p>
        </div>
        <div class="rounded-lg bg-white px-4 py-2 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Programmes</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ programsWithCareersCount }}</p>
        </div>
      </div>
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
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un programme..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <!-- Liste des programmes -->
          <div class="admin-scrollbar max-h-[500px] space-y-2 overflow-y-scroll pr-1" data-lenis-prevent>
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
                  {{ program.title_fr }}
                </span>
                <span
                  class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="getFormationTypeColor(program.formation_type)"
                >
                  {{ getFormationTypeLabel(program.formation_type) }}
                </span>
              </div>
              <p class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {{ program.short_description_fr }}
              </p>
              <div class="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <i class="fa-solid fa-briefcase"></i>
                <span>{{ getCareerOpportunitiesByProgram(program.id).length }} débouchés</span>
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

      <!-- Liste des débouchés -->
      <div class="lg:col-span-2">
        <div class="rounded-lg bg-white shadow dark:bg-gray-800">
          <!-- Header du panel -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-white">
                {{ selectedProgram ? selectedProgram.title_fr : 'Débouchés' }}
              </h2>
              <p v-if="selectedProgram" class="text-sm text-gray-500 dark:text-gray-400">
                {{ careerOpportunities.length }} débouché{{ careerOpportunities.length > 1 ? 's' : '' }} défini{{ careerOpportunities.length > 1 ? 's' : '' }}
              </p>
            </div>

            <button
              v-if="selectedProgram"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              @click="openAddModal"
            >
              <i class="fa-solid fa-plus"></i>
              Ajouter
            </button>
          </div>

          <!-- Contenu -->
          <div class="admin-scrollbar max-h-[600px] overflow-y-scroll p-4 pr-2" data-lenis-prevent>
            <!-- État vide - aucun programme sélectionné -->
            <div
              v-if="!selectedProgram"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                <i class="fa-solid fa-graduation-cap text-3xl text-gray-400"></i>
              </div>
              <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                Sélectionnez un programme
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Choisissez un programme dans la liste pour voir et gérer ses débouchés
              </p>
            </div>

            <!-- État vide - pas de débouchés -->
            <div
              v-else-if="careerOpportunities.length === 0"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                <i class="fa-solid fa-briefcase text-3xl text-gray-400"></i>
              </div>
              <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                Aucun débouché défini
              </h3>
              <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Ce programme n'a pas encore de débouchés associés
              </p>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="openAddModal"
              >
                <i class="fa-solid fa-plus"></i>
                Ajouter le premier débouché
              </button>
            </div>

            <!-- Liste des débouchés -->
            <div v-else class="space-y-3">
              <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">
                <i class="fa-solid fa-grip-vertical mr-1"></i>
                Glissez-déposez pour réorganiser l'ordre des débouchés
              </p>

              <div
                v-for="(career, index) in careerOpportunities"
                :key="career.id"
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
                  <i class="fa-solid fa-grip-vertical"></i>
                </div>

                <!-- Numéro -->
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  {{ index + 1 }}
                </div>

                <!-- Contenu -->
                <div class="min-w-0 flex-1">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ career.title }}
                  </h3>
                  <p v-if="career.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ career.description }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex shrink-0 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="openEditModal(career)"
                  >
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button
                    class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(career)"
                  >
                    <i class="fa-solid fa-trash"></i>
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
              Ajouter un débouché
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddModal"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form @submit.prevent="addCareer">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre du débouché *
              </label>
              <input
                v-model="newCareer.title"
                type="text"
                required
                placeholder="Ex: Directeur de projet"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newCareer.description"
                rows="4"
                placeholder="Détail du métier, secteurs d'activité, types d'employeurs..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Décrivez le métier, les secteurs d'activité, les types d'employeurs et le niveau de responsabilité.
              </p>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeAddModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && editingCareer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le débouché
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditModal"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form @submit.prevent="updateCareer">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre du débouché *
              </label>
              <input
                v-model="editingCareer.title"
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
                v-model="editingCareer.description"
                rows="4"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeEditModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingCareer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <i class="fa-solid fa-triangle-exclamation text-red-600 dark:text-red-400"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le débouché
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce débouché ?
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingCareer.title }}
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
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="deleteCareer"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<!-- Styles scrollbar dans base.css avec classe .admin-scrollbar -->
