<script setup lang="ts">
import type { ProgramSemesterData, ProgramCourse, Formation } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  formations,
  getSemestersByProgram,
  getCoursesBySemester,
  getSemesterTotalCredits,
  getSemesterTotalHours,
  getProgramsWithSemesters,
  generateSemesterId,
  generateCourseId
} = useMockData()

// === STATE ===
const selectedProgramId = ref<string | null>(null)
const searchQuery = ref('')
const expandedSemesters = ref<string[]>([])

// Modals state
const showAddSemesterModal = ref(false)
const showEditSemesterModal = ref(false)
const showDeleteSemesterModal = ref(false)
const showAddCourseModal = ref(false)
const showEditCourseModal = ref(false)
const showDeleteCourseModal = ref(false)

// Editing state
const editingSemester = ref<ProgramSemesterData | null>(null)
const deletingSemester = ref<ProgramSemesterData | null>(null)
const editingCourse = ref<ProgramCourse | null>(null)
const deletingCourse = ref<ProgramCourse | null>(null)
const targetSemesterIdForCourse = ref<string | null>(null)

// Form state
const newSemester = ref({
  number: 1,
  title: '',
  credits: 30
})

const newCourse = ref({
  code: '',
  title: '',
  description: '',
  credits: 3,
  lecture_hours: 20,
  tutorial_hours: 10,
  practical_hours: 0,
  coefficient: 1
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

// Semestres du programme sélectionné
const semesters = computed(() => {
  if (!selectedProgramId.value) return []
  return getSemestersByProgram(selectedProgramId.value)
})

// Stats
const totalSemestersCount = computed(() => {
  let count = 0
  availablePrograms.value.forEach(p => {
    count += getSemestersByProgram(p.id).length
  })
  return count
})

const programsWithSemestersCount = computed(() => getProgramsWithSemesters().length)

// === METHODS ===
const selectProgram = (programId: string) => {
  selectedProgramId.value = programId
  searchQuery.value = ''
  // Expand all semesters by default
  expandedSemesters.value = getSemestersByProgram(programId).map(s => s.id)
}

const toggleSemester = (semesterId: string) => {
  const index = expandedSemesters.value.indexOf(semesterId)
  if (index > -1) {
    expandedSemesters.value.splice(index, 1)
  } else {
    expandedSemesters.value.push(semesterId)
  }
}

const isSemesterExpanded = (semesterId: string) => {
  return expandedSemesters.value.includes(semesterId)
}

// === SEMESTER MODALS ===
const openAddSemesterModal = () => {
  const existingSemesters = semesters.value
  const maxNumber = existingSemesters.length > 0
    ? Math.max(...existingSemesters.map(s => s.number))
    : 0
  newSemester.value = {
    number: maxNumber + 1,
    title: '',
    credits: 30
  }
  showAddSemesterModal.value = true
}

const closeAddSemesterModal = () => {
  showAddSemesterModal.value = false
}

const openEditSemesterModal = (semester: ProgramSemesterData) => {
  editingSemester.value = { ...semester }
  showEditSemesterModal.value = true
}

const closeEditSemesterModal = () => {
  showEditSemesterModal.value = false
  editingSemester.value = null
}

const openDeleteSemesterModal = (semester: ProgramSemesterData) => {
  deletingSemester.value = semester
  showDeleteSemesterModal.value = true
}

const closeDeleteSemesterModal = () => {
  showDeleteSemesterModal.value = false
  deletingSemester.value = null
}

// === COURSE MODALS ===
const openAddCourseModal = (semesterId: string) => {
  targetSemesterIdForCourse.value = semesterId
  const existingCourses = getCoursesBySemester(semesterId)
  newCourse.value = {
    code: '',
    title: '',
    description: '',
    credits: 3,
    lecture_hours: 20,
    tutorial_hours: 10,
    practical_hours: 0,
    coefficient: 1
  }
  showAddCourseModal.value = true
}

const closeAddCourseModal = () => {
  showAddCourseModal.value = false
  targetSemesterIdForCourse.value = null
}

const openEditCourseModal = (course: ProgramCourse) => {
  editingCourse.value = { ...course }
  showEditCourseModal.value = true
}

const closeEditCourseModal = () => {
  showEditCourseModal.value = false
  editingCourse.value = null
}

const openDeleteCourseModal = (course: ProgramCourse) => {
  deletingCourse.value = course
  showDeleteCourseModal.value = true
}

const closeDeleteCourseModal = () => {
  showDeleteCourseModal.value = false
  deletingCourse.value = null
}

// === ACTIONS ===
const addSemester = () => {
  if (!selectedProgramId.value) return

  // En production: POST /api/admin/programs/{program_id}/semesters
  console.log('Adding semester:', {
    id: generateSemesterId(selectedProgramId.value, newSemester.value.number),
    program_id: selectedProgramId.value,
    number: newSemester.value.number,
    title: newSemester.value.title,
    credits: newSemester.value.credits,
    display_order: semesters.value.length + 1
  })

  closeAddSemesterModal()
}

const updateSemester = () => {
  if (!editingSemester.value) return

  // En production: PUT /api/admin/semesters/{id}
  console.log('Updating semester:', editingSemester.value)

  closeEditSemesterModal()
}

const deleteSemester = () => {
  if (!deletingSemester.value) return

  // En production: DELETE /api/admin/semesters/{id}
  console.log('Deleting semester:', deletingSemester.value.id)

  closeDeleteSemesterModal()
}

const addCourse = () => {
  if (!targetSemesterIdForCourse.value || !newCourse.value.title.trim()) return

  const existingCourses = getCoursesBySemester(targetSemesterIdForCourse.value)

  // En production: POST /api/admin/semesters/{semester_id}/courses
  console.log('Adding course:', {
    id: generateCourseId(targetSemesterIdForCourse.value, existingCourses.length + 1),
    semester_id: targetSemesterIdForCourse.value,
    ...newCourse.value,
    display_order: existingCourses.length + 1
  })

  closeAddCourseModal()
}

const updateCourse = () => {
  if (!editingCourse.value) return

  // En production: PUT /api/admin/courses/{id}
  console.log('Updating course:', editingCourse.value)

  closeEditCourseModal()
}

const deleteCourse = () => {
  if (!deletingCourse.value) return

  // En production: DELETE /api/admin/courses/{id}
  console.log('Deleting course:', deletingCourse.value.id)

  closeDeleteCourseModal()
}

// === HELPERS ===
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

const getSemesterDisplayName = (semester: ProgramSemesterData) => {
  if (semester.title) {
    return `Semestre ${semester.number} - ${semester.title}`
  }
  return `Semestre ${semester.number}`
}

const getCoursesCountForSemester = (semesterId: string) => {
  return getCoursesBySemester(semesterId).length
}

const getTotalHoursForCourse = (course: ProgramCourse) => {
  return course.lecture_hours + course.tutorial_hours + course.practical_hours
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Semestres et Cours
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez la maquette pédagogique de chaque programme de formation
        </p>
      </div>

      <!-- Stats -->
      <div class="flex gap-4">
        <div class="rounded-lg bg-white px-4 py-2 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Total semestres</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ totalSemestersCount }}</p>
        </div>
        <div class="rounded-lg bg-white px-4 py-2 shadow dark:bg-gray-800">
          <p class="text-xs text-gray-500 dark:text-gray-400">Programmes</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ programsWithSemestersCount }}</p>
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
            <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              <div class="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                  {{ getSemestersByProgram(program.id).length }} semestres
                </span>
                <span v-if="program.credits" class="flex items-center gap-1">
                  <font-awesome-icon icon="fa-solid fa-award" class="w-3 h-3" />
                  {{ program.credits }} ECTS
                </span>
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

      <!-- Liste des semestres et cours -->
      <div class="lg:col-span-2">
        <div class="rounded-lg bg-white shadow dark:bg-gray-800">
          <!-- Header du panel -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-white">
                {{ selectedProgram ? selectedProgram.title_fr : 'Maquette pédagogique' }}
              </h2>
              <p v-if="selectedProgram" class="text-sm text-gray-500 dark:text-gray-400">
                {{ semesters.length }} semestre{{ semesters.length > 1 ? 's' : '' }}
                <span v-if="selectedProgram.credits"> - {{ selectedProgram.credits }} crédits ECTS</span>
              </p>
            </div>

            <button
              v-if="selectedProgram"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              @click="openAddSemesterModal"
            >
              <font-awesome-icon icon="fa-solid fa-plus" />
              Ajouter un semestre
            </button>
          </div>

          <!-- Contenu -->
          <div class="admin-scrollbar max-h-[700px] overflow-y-scroll p-4 pr-2" data-lenis-prevent>
            <!-- État vide - aucun programme sélectionné -->
            <div
              v-if="!selectedProgram"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                <font-awesome-icon icon="fa-solid fa-graduation-cap" class="text-3xl text-gray-400" />
              </div>
              <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                Sélectionnez un programme
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Choisissez un programme dans la liste pour voir et gérer sa maquette pédagogique
              </p>
            </div>

            <!-- État vide - pas de semestres -->
            <div
              v-else-if="semesters.length === 0"
              class="flex flex-col items-center justify-center py-12 text-center"
            >
              <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                <font-awesome-icon icon="fa-solid fa-calendar" class="text-3xl text-gray-400" />
              </div>
              <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                Aucun semestre défini
              </h3>
              <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Ce programme n'a pas encore de semestres configurés
              </p>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                @click="openAddSemesterModal"
              >
                <font-awesome-icon icon="fa-solid fa-plus" />
                Créer le premier semestre
              </button>
            </div>

            <!-- Accordéon des semestres -->
            <div v-else class="space-y-4">
              <div
                v-for="semester in semesters"
                :key="semester.id"
                class="rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <!-- Header du semestre (accordéon) -->
                <div
                  class="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  @click="toggleSemester(semester.id)"
                >
                  <div class="flex items-center gap-3">
                    <font-awesome-icon
                      icon="fa-solid fa-chevron-right"
                      class="w-4 h-4 text-gray-400 transition-transform"
                      :class="{ 'rotate-90': isSemesterExpanded(semester.id) }"
                    />
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">
                        {{ getSemesterDisplayName(semester) }}
                      </h3>
                      <div class="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{{ getCoursesCountForSemester(semester.id) }} cours</span>
                        <span>{{ getSemesterTotalCredits(semester.id) }} crédits</span>
                        <span>{{ getSemesterTotalHours(semester.id).total }}h total</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2" @click.stop>
                    <button
                      class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-green-600 dark:hover:bg-gray-600 dark:hover:text-green-400"
                      title="Ajouter un cours"
                      @click="openAddCourseModal(semester.id)"
                    >
                      <font-awesome-icon icon="fa-solid fa-plus" />
                    </button>
                    <button
                      class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                      title="Modifier le semestre"
                      @click="openEditSemesterModal(semester)"
                    >
                      <font-awesome-icon icon="fa-solid fa-pen" />
                    </button>
                    <button
                      class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                      title="Supprimer le semestre"
                      @click="openDeleteSemesterModal(semester)"
                    >
                      <font-awesome-icon icon="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>

                <!-- Contenu du semestre (tableau des cours) -->
                <div
                  v-show="isSemesterExpanded(semester.id)"
                  class="border-t border-gray-200 dark:border-gray-700"
                >
                  <div class="p-4">
                    <!-- Tableau des cours -->
                    <div v-if="getCoursesBySemester(semester.id).length > 0" class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-gray-200 text-left dark:border-gray-700">
                            <th class="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Code</th>
                            <th class="pb-3 pr-4 font-medium text-gray-500 dark:text-gray-400">Titre</th>
                            <th class="pb-3 pr-4 text-center font-medium text-gray-500 dark:text-gray-400">Crédits</th>
                            <th class="pb-3 pr-4 text-center font-medium text-gray-500 dark:text-gray-400">CM</th>
                            <th class="pb-3 pr-4 text-center font-medium text-gray-500 dark:text-gray-400">TD</th>
                            <th class="pb-3 pr-4 text-center font-medium text-gray-500 dark:text-gray-400">TP</th>
                            <th class="pb-3 pr-4 text-center font-medium text-gray-500 dark:text-gray-400">Total</th>
                            <th class="pb-3 text-center font-medium text-gray-500 dark:text-gray-400">Coef.</th>
                            <th class="pb-3 pl-4 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="course in getCoursesBySemester(semester.id)"
                            :key="course.id"
                            class="border-b border-gray-100 last:border-0 dark:border-gray-700/50"
                          >
                            <td class="py-3 pr-4 text-gray-500 dark:text-gray-400">
                              {{ course.code || '-' }}
                            </td>
                            <td class="py-3 pr-4">
                              <div class="font-medium text-gray-900 dark:text-white">{{ course.title }}</div>
                              <div v-if="course.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                {{ course.description }}
                              </div>
                            </td>
                            <td class="py-3 pr-4 text-center text-gray-900 dark:text-white">
                              {{ course.credits || '-' }}
                            </td>
                            <td class="py-3 pr-4 text-center text-gray-500 dark:text-gray-400">
                              {{ course.lecture_hours }}h
                            </td>
                            <td class="py-3 pr-4 text-center text-gray-500 dark:text-gray-400">
                              {{ course.tutorial_hours }}h
                            </td>
                            <td class="py-3 pr-4 text-center text-gray-500 dark:text-gray-400">
                              {{ course.practical_hours }}h
                            </td>
                            <td class="py-3 pr-4 text-center font-medium text-gray-900 dark:text-white">
                              {{ getTotalHoursForCourse(course) }}h
                            </td>
                            <td class="py-3 text-center text-gray-500 dark:text-gray-400">
                              {{ course.coefficient || '-' }}
                            </td>
                            <td class="py-3 pl-4 text-right">
                              <div class="flex justify-end gap-1">
                                <button
                                  class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                                  title="Modifier"
                                  @click="openEditCourseModal(course)"
                                >
                                  <font-awesome-icon icon="fa-solid fa-pen" class="w-3 h-3" />
                                </button>
                                <button
                                  class="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-400"
                                  title="Supprimer"
                                  @click="openDeleteCourseModal(course)"
                                >
                                  <font-awesome-icon icon="fa-solid fa-trash" class="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr class="border-t-2 border-gray-200 font-medium dark:border-gray-600">
                            <td colspan="2" class="py-3 pr-4 text-gray-700 dark:text-gray-300">Total</td>
                            <td class="py-3 pr-4 text-center text-gray-900 dark:text-white">
                              {{ getSemesterTotalCredits(semester.id) }}
                            </td>
                            <td class="py-3 pr-4 text-center text-gray-500 dark:text-gray-400">
                              {{ getSemesterTotalHours(semester.id).lecture }}h
                            </td>
                            <td class="py-3 pr-4 text-center text-gray-500 dark:text-gray-400">
                              {{ getSemesterTotalHours(semester.id).tutorial }}h
                            </td>
                            <td class="py-3 pr-4 text-center text-gray-500 dark:text-gray-400">
                              {{ getSemesterTotalHours(semester.id).practical }}h
                            </td>
                            <td class="py-3 pr-4 text-center font-bold text-gray-900 dark:text-white">
                              {{ getSemesterTotalHours(semester.id).total }}h
                            </td>
                            <td colspan="2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <!-- État vide - pas de cours -->
                    <div v-else class="py-8 text-center">
                      <font-awesome-icon icon="fa-solid fa-book" class="mb-2 text-2xl text-gray-400" />
                      <p class="text-sm text-gray-500 dark:text-gray-400">Aucun cours dans ce semestre</p>
                      <button
                        class="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        @click="openAddCourseModal(semester.id)"
                      >
                        <font-awesome-icon icon="fa-solid fa-plus" class="w-3 h-3" />
                        Ajouter un cours
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter Semestre -->
    <Teleport to="body">
      <div
        v-if="showAddSemesterModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddSemesterModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un semestre
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddSemesterModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="addSemester">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Numéro *
                </label>
                <input
                  v-model.number="newSemester.number"
                  type="number"
                  min="1"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Crédits ECTS
                </label>
                <input
                  v-model.number="newSemester.credits"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre (optionnel)
              </label>
              <input
                v-model="newSemester.title"
                type="text"
                placeholder="Ex: Fondamentaux, Stage et Mémoire..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeAddSemesterModal"
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

    <!-- Modal Modifier Semestre -->
    <Teleport to="body">
      <div
        v-if="showEditSemesterModal && editingSemester"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditSemesterModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le semestre
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditSemesterModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="updateSemester">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Numéro *
                </label>
                <input
                  v-model.number="editingSemester.number"
                  type="number"
                  min="1"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Crédits ECTS
                </label>
                <input
                  v-model.number="editingSemester.credits"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre (optionnel)
              </label>
              <input
                v-model="editingSemester.title"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeEditSemesterModal"
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

    <!-- Modal Supprimer Semestre -->
    <Teleport to="body">
      <div
        v-if="showDeleteSemesterModal && deletingSemester"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteSemesterModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le semestre
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce semestre et tous ses cours ?
          </p>
          <div class="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
            <p class="font-medium text-gray-900 dark:text-white">
              {{ getSemesterDisplayName(deletingSemester) }}
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ getCoursesCountForSemester(deletingSemester.id) }} cours seront également supprimés
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteSemesterModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="deleteSemester"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Ajouter Cours -->
    <Teleport to="body">
      <div
        v-if="showAddCourseModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddCourseModal"
      >
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un cours
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddCourseModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="addCourse">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code (optionnel)
                </label>
                <input
                  v-model="newCourse.code"
                  type="text"
                  placeholder="Ex: MGT701"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Crédits ECTS
                </label>
                <input
                  v-model.number="newCourse.credits"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre *
              </label>
              <input
                v-model="newCourse.title"
                type="text"
                required
                placeholder="Ex: Introduction au management"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="newCourse.description"
                rows="2"
                placeholder="Brève description du cours..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heures CM
                </label>
                <input
                  v-model.number="newCourse.lecture_hours"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heures TD
                </label>
                <input
                  v-model.number="newCourse.tutorial_hours"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heures TP
                </label>
                <input
                  v-model.number="newCourse.practical_hours"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Coefficient
                </label>
                <input
                  v-model.number="newCourse.coefficient"
                  type="number"
                  min="0"
                  step="0.5"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeAddCourseModal"
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

    <!-- Modal Modifier Cours -->
    <Teleport to="body">
      <div
        v-if="showEditCourseModal && editingCourse"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditCourseModal"
      >
        <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier le cours
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditCourseModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="updateCourse">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code (optionnel)
                </label>
                <input
                  v-model="editingCourse.code"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Crédits ECTS
                </label>
                <input
                  v-model.number="editingCourse.credits"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre *
              </label>
              <input
                v-model="editingCourse.title"
                type="text"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mt-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description (optionnel)
              </label>
              <textarea
                v-model="editingCourse.description"
                rows="2"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heures CM
                </label>
                <input
                  v-model.number="editingCourse.lecture_hours"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heures TD
                </label>
                <input
                  v-model.number="editingCourse.tutorial_hours"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Heures TP
                </label>
                <input
                  v-model.number="editingCourse.practical_hours"
                  type="number"
                  min="0"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Coefficient
                </label>
                <input
                  v-model.number="editingCourse.coefficient"
                  type="number"
                  min="0"
                  step="0.5"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeEditCourseModal"
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

    <!-- Modal Supprimer Cours -->
    <Teleport to="body">
      <div
        v-if="showDeleteCourseModal && deletingCourse"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteCourseModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le cours
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce cours ?
          </p>
          <div class="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
            <p class="font-medium text-gray-900 dark:text-white">
              {{ deletingCourse.code ? `${deletingCourse.code} - ` : '' }}{{ deletingCourse.title }}
            </p>
            <p v-if="deletingCourse.credits" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ deletingCourse.credits }} crédits ECTS
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteCourseModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="deleteCourse"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
