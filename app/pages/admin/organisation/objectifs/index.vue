<script setup lang="ts">
import type {
  ServiceObjective,
  ServiceAchievement,
  ServiceProject,
  ServiceProjectStatus,
  ServiceWithData
} from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  services,
  getServicesWithData,
  getServicesGroupedByCategory,
  getServiceObjectives,
  getServiceAchievements,
  getServiceProjects,
  getServiceOverview,
  getServiceObjectivesStats,
  serviceProjectStatusLabels,
  serviceProjectStatusColors,
  achievementTypes,
  generateServiceObjectiveId,
  generateServiceAchievementId,
  generateServiceProjectId
} = useMockData()

// === STATE ===
const selectedServiceId = ref<string | null>(null)
const activeTab = ref<'overview' | 'objectives' | 'achievements' | 'projects'>('overview')

// Modals
const showObjectiveModal = ref(false)
const showAchievementModal = ref(false)
const showProjectModal = ref(false)
const showDeleteModal = ref(false)

const editingObjective = ref<ServiceObjective | null>(null)
const editingAchievement = ref<ServiceAchievement | null>(null)
const editingProject = ref<ServiceProject | null>(null)
const deletingItem = ref<{ type: 'objective' | 'achievement' | 'project'; item: any } | null>(null)

// Form states
const objectiveForm = ref({
  title: '',
  description: '',
  display_order: 1
})

const achievementForm = ref({
  title: '',
  description: '',
  type: '',
  cover_image: '',
  achievement_date: ''
})

const projectForm = ref({
  title: '',
  description: '',
  cover_image: '',
  progress: 0,
  status: 'planned' as ServiceProjectStatus,
  start_date: '',
  expected_end_date: ''
})

// === COMPUTED ===
const globalStats = computed(() => getServiceObjectivesStats())

const servicesGrouped = computed(() => getServicesGroupedByCategory())

const servicesWithData = computed(() => getServicesWithData())

const selectedService = computed(() => {
  if (!selectedServiceId.value) return null
  return servicesWithData.value.find(s => s.id === selectedServiceId.value)
})

const serviceOverview = computed(() => {
  if (!selectedServiceId.value) return null
  return getServiceOverview(selectedServiceId.value)
})

const serviceObjectives = computed(() => {
  if (!selectedServiceId.value) return []
  return getServiceObjectives(selectedServiceId.value)
})

const serviceAchievements = computed(() => {
  if (!selectedServiceId.value) return []
  return getServiceAchievements(selectedServiceId.value)
})

const serviceProjects = computed(() => {
  if (!selectedServiceId.value) return []
  return getServiceProjects(selectedServiceId.value)
})

// === METHODS ===
const selectService = (serviceId: string) => {
  selectedServiceId.value = serviceId
  activeTab.value = 'overview'
}

const clearSelection = () => {
  selectedServiceId.value = null
  activeTab.value = 'overview'
}

// Format dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// === OBJECTIFS ===
const openObjectiveModal = (objective?: ServiceObjective) => {
  if (objective) {
    editingObjective.value = objective
    objectiveForm.value = {
      title: objective.title,
      description: objective.description || '',
      display_order: objective.display_order
    }
  } else {
    editingObjective.value = null
    objectiveForm.value = {
      title: '',
      description: '',
      display_order: serviceObjectives.value.length + 1
    }
  }
  showObjectiveModal.value = true
}

const saveObjective = () => {
  if (editingObjective.value) {
    console.log('Mise à jour objectif:', { id: editingObjective.value.id, ...objectiveForm.value })
  } else {
    const id = generateServiceObjectiveId()
    console.log('Création objectif:', { id, service_id: selectedServiceId.value, ...objectiveForm.value })
  }
  closeModals()
}

// === RÉALISATIONS ===
const openAchievementModal = (achievement?: ServiceAchievement) => {
  if (achievement) {
    editingAchievement.value = achievement
    achievementForm.value = {
      title: achievement.title,
      description: achievement.description || '',
      type: achievement.type || '',
      cover_image: achievement.cover_image || '',
      achievement_date: achievement.achievement_date
    }
  } else {
    editingAchievement.value = null
    achievementForm.value = {
      title: '',
      description: '',
      type: '',
      cover_image: '',
      achievement_date: new Date().toISOString().split('T')[0]
    }
  }
  showAchievementModal.value = true
}

const saveAchievement = () => {
  if (editingAchievement.value) {
    console.log('Mise à jour réalisation:', { id: editingAchievement.value.id, ...achievementForm.value })
  } else {
    const id = generateServiceAchievementId()
    console.log('Création réalisation:', { id, service_id: selectedServiceId.value, ...achievementForm.value })
  }
  closeModals()
}

// === PROJETS ===
const openProjectModal = (project?: ServiceProject) => {
  if (project) {
    editingProject.value = project
    projectForm.value = {
      title: project.title,
      description: project.description || '',
      cover_image: project.cover_image || '',
      progress: project.progress,
      status: project.status,
      start_date: project.start_date || '',
      expected_end_date: project.expected_end_date || ''
    }
  } else {
    editingProject.value = null
    projectForm.value = {
      title: '',
      description: '',
      cover_image: '',
      progress: 0,
      status: 'planned',
      start_date: '',
      expected_end_date: ''
    }
  }
  showProjectModal.value = true
}

const saveProject = () => {
  if (editingProject.value) {
    console.log('Mise à jour projet:', { id: editingProject.value.id, ...projectForm.value })
  } else {
    const id = generateServiceProjectId()
    console.log('Création projet:', { id, service_id: selectedServiceId.value, ...projectForm.value })
  }
  closeModals()
}

// === SUPPRESSION ===
const openDeleteModal = (type: 'objective' | 'achievement' | 'project', item: any) => {
  deletingItem.value = { type, item }
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (deletingItem.value) {
    console.log('Suppression:', deletingItem.value.type, deletingItem.value.item.id)
  }
  closeModals()
}

const closeModals = () => {
  showObjectiveModal.value = false
  showAchievementModal.value = false
  showProjectModal.value = false
  showDeleteModal.value = false
  editingObjective.value = null
  editingAchievement.value = null
  editingProject.value = null
  deletingItem.value = null
}

// Drag and drop pour réordonner les objectifs
const handleDragStart = (event: DragEvent, index: number) => {
  event.dataTransfer?.setData('text/plain', index.toString())
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  const sourceIndex = parseInt(event.dataTransfer?.getData('text/plain') || '0')
  if (sourceIndex !== targetIndex) {
    console.log('Réordonnement objectifs:', sourceIndex, '->', targetIndex)
  }
}
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Objectifs et Réalisations
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Gestion des objectifs, réalisations et projets internes par service
      </p>
    </div>

    <!-- Stats globales (quand aucun service sélectionné) -->
    <div v-if="!selectedServiceId" class="space-y-6">
      <!-- Statistiques -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <font-awesome-icon :icon="['fas', 'building']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.totalServices }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Services actifs</p>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'bullseye']" class="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.totalObjectives }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Objectifs définis</p>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'trophy']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.totalAchievements }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Réalisations</p>
            </div>
          </div>
        </div>
        <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
              <font-awesome-icon :icon="['fas', 'tasks']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ globalStats.totalProjects }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Projets internes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des services par catégorie -->
      <div class="space-y-6">
        <div v-for="(categoryServices, category) in servicesGrouped" :key="category">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {{ category === 'rectorat' ? 'Rectorat' : category === 'academique' ? 'Services académiques' : 'Services administratifs' }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="service in categoryServices"
              :key="service.id"
              class="rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-brand-red-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-red-600"
              @click="selectService(service.id)"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ service.name }}</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ service.categoryLabel }}</p>
                </div>
                <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-4 w-4 text-gray-400" />
              </div>
              <div class="mt-3 flex items-center gap-4 text-sm">
                <span class="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <font-awesome-icon :icon="['fas', 'bullseye']" class="h-3 w-3" />
                  {{ service.objectivesCount }}
                </span>
                <span class="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <font-awesome-icon :icon="['fas', 'trophy']" class="h-3 w-3" />
                  {{ service.achievementsCount }}
                </span>
                <span class="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <font-awesome-icon :icon="['fas', 'tasks']" class="h-3 w-3" />
                  {{ service.projectsCount }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Réalisations récentes -->
      <div v-if="globalStats.recentAchievements.length > 0" class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-gray-400" />
          Réalisations récentes
        </h2>
        <div class="space-y-3">
          <div
            v-for="achievement in globalStats.recentAchievements"
            :key="achievement.id"
            class="flex items-center gap-4 rounded-lg border border-gray-100 p-3 dark:border-gray-700"
          >
            <div v-if="achievement.cover_image" class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
              <img :src="achievement.cover_image" :alt="achievement.title" class="h-full w-full object-cover" />
            </div>
            <div v-else class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'trophy']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium text-gray-900 dark:text-white">{{ achievement.title }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(achievement.achievement_date) }}</p>
            </div>
            <span v-if="achievement.type" class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {{ achievement.type }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue détaillée d'un service -->
    <div v-else class="space-y-6">
      <!-- Breadcrumb et header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
            @click="clearSelection"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
          </button>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ selectedService?.name }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedService?.categoryLabel }}
            </p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex gap-6">
          <button
            v-for="tab in [
              { key: 'overview', label: 'Vue d\'ensemble', icon: 'chart-pie' },
              { key: 'objectives', label: 'Objectifs', icon: 'bullseye' },
              { key: 'achievements', label: 'Réalisations', icon: 'trophy' },
              { key: 'projects', label: 'Projets', icon: 'tasks' }
            ]"
            :key="tab.key"
            class="flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors"
            :class="activeTab === tab.key
              ? 'border-brand-red-500 text-brand-red-600 dark:text-brand-red-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = tab.key as typeof activeTab"
          >
            <font-awesome-icon :icon="['fas', tab.icon]" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab: Vue d'ensemble -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- Stats du service -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <font-awesome-icon :icon="['fas', 'bullseye']" class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ serviceOverview?.objectives_count || 0 }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Objectifs</p>
              </div>
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                <font-awesome-icon :icon="['fas', 'trophy']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ serviceOverview?.achievements_count || 0 }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Réalisations</p>
              </div>
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                <font-awesome-icon :icon="['fas', 'tasks']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ serviceOverview?.projects.total || 0 }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Projets</p>
              </div>
            </div>
          </div>
          <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <font-awesome-icon :icon="['fas', 'spinner']" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ serviceOverview?.projects.ongoing || 0 }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">En cours</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Objectifs récents -->
        <div v-if="serviceObjectives.length > 0" class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Objectifs du service</h3>
            <button
              class="text-sm text-brand-red-600 hover:underline dark:text-brand-red-400"
              @click="activeTab = 'objectives'"
            >
              Voir tout
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="objective in serviceObjectives.slice(0, 3)"
              :key="objective.id"
              class="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700"
            >
              <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {{ objective.display_order }}
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ objective.title }}</p>
                <p v-if="objective.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {{ objective.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Projets en cours -->
        <div v-if="serviceProjects.filter(p => p.status === 'ongoing').length > 0" class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold text-gray-900 dark:text-white">Projets en cours</h3>
            <button
              class="text-sm text-brand-red-600 hover:underline dark:text-brand-red-400"
              @click="activeTab = 'projects'"
            >
              Voir tout
            </button>
          </div>
          <div class="space-y-3">
            <div
              v-for="project in serviceProjects.filter(p => p.status === 'ongoing').slice(0, 3)"
              :key="project.id"
              class="rounded-lg border border-gray-100 p-4 dark:border-gray-700"
            >
              <div class="flex items-center justify-between">
                <p class="font-medium text-gray-900 dark:text-white">{{ project.title }}</p>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ project.progress }}%</span>
              </div>
              <div class="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-full rounded-full bg-brand-red-500 transition-all"
                  :style="{ width: `${project.progress}%` }"
                />
              </div>
              <p v-if="project.expected_end_date" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Échéance : {{ formatDate(project.expected_end_date) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Objectifs -->
      <div v-if="activeTab === 'objectives'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ serviceObjectives.length }} objectif(s) défini(s)
          </p>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
            @click="openObjectiveModal()"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
            Ajouter un objectif
          </button>
        </div>

        <div class="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div v-if="serviceObjectives.length === 0" class="py-12 text-center">
            <font-awesome-icon :icon="['fas', 'bullseye']" class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p class="mt-4 text-gray-500 dark:text-gray-400">Aucun objectif défini pour ce service</p>
            <button
              class="mt-4 text-sm text-brand-red-600 hover:underline dark:text-brand-red-400"
              @click="openObjectiveModal()"
            >
              Ajouter le premier objectif
            </button>
          </div>
          <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="(objective, index) in serviceObjectives"
              :key="objective.id"
              class="flex items-start gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              draggable="true"
              @dragstart="handleDragStart($event, index)"
              @dragover="handleDragOver"
              @drop="handleDrop($event, index)"
            >
              <button class="mt-1 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-300">
                <font-awesome-icon :icon="['fas', 'grip-vertical']" class="h-4 w-4" />
              </button>
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {{ objective.display_order }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900 dark:text-white">{{ objective.title }}</p>
                <p v-if="objective.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ objective.description }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                  title="Modifier"
                  @click="openObjectiveModal(objective)"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                </button>
                <button
                  class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                  title="Supprimer"
                  @click="openDeleteModal('objective', objective)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Réalisations -->
      <div v-if="activeTab === 'achievements'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ serviceAchievements.length }} réalisation(s)
          </p>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
            @click="openAchievementModal()"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
            Ajouter une réalisation
          </button>
        </div>

        <div v-if="serviceAchievements.length === 0" class="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <font-awesome-icon :icon="['fas', 'trophy']" class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p class="mt-4 text-gray-500 dark:text-gray-400">Aucune réalisation enregistrée</p>
          <button
            class="mt-4 text-sm text-brand-red-600 hover:underline dark:text-brand-red-400"
            @click="openAchievementModal()"
          >
            Ajouter la première réalisation
          </button>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="achievement in serviceAchievements"
            :key="achievement.id"
            class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <div v-if="achievement.cover_image" class="h-40 overflow-hidden">
              <img :src="achievement.cover_image" :alt="achievement.title" class="h-full w-full object-cover" />
            </div>
            <div class="p-4">
              <div class="mb-2 flex items-center justify-between">
                <span v-if="achievement.type" class="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {{ achievement.type }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(achievement.achievement_date) }}
                </span>
              </div>
              <h4 class="font-medium text-gray-900 dark:text-white">{{ achievement.title }}</h4>
              <p v-if="achievement.description" class="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                {{ achievement.description }}
              </p>
              <div class="mt-3 flex items-center gap-2">
                <button
                  class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                  title="Modifier"
                  @click="openAchievementModal(achievement)"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                </button>
                <button
                  class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                  title="Supprimer"
                  @click="openDeleteModal('achievement', achievement)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Projets -->
      <div v-if="activeTab === 'projects'" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ serviceProjects.length }} projet(s) interne(s)
          </p>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
            @click="openProjectModal()"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
            Ajouter un projet
          </button>
        </div>

        <div v-if="serviceProjects.length === 0" class="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <font-awesome-icon :icon="['fas', 'tasks']" class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p class="mt-4 text-gray-500 dark:text-gray-400">Aucun projet interne</p>
          <button
            class="mt-4 text-sm text-brand-red-600 hover:underline dark:text-brand-red-400"
            @click="openProjectModal()"
          >
            Créer le premier projet
          </button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="project in serviceProjects"
            :key="project.id"
            class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="flex">
              <div v-if="project.cover_image" class="hidden h-32 w-40 flex-shrink-0 sm:block">
                <img :src="project.cover_image" :alt="project.title" class="h-full w-full object-cover" />
              </div>
              <div class="flex-1 p-4">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-medium text-gray-900 dark:text-white">{{ project.title }}</h4>
                      <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', serviceProjectStatusColors[project.status]]">
                        {{ serviceProjectStatusLabels[project.status] }}
                      </span>
                    </div>
                    <p v-if="project.description" class="mt-1 text-sm text-gray-500 line-clamp-2 dark:text-gray-400">
                      {{ project.description }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                      title="Modifier"
                      @click="openProjectModal(project)"
                    >
                      <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                    </button>
                    <button
                      class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                      title="Supprimer"
                      @click="openDeleteModal('project', project)"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div class="mt-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Progression</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ project.progress }}%</span>
                  </div>
                  <div class="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="project.status === 'completed' ? 'bg-green-500' : project.status === 'suspended' ? 'bg-gray-400' : 'bg-brand-red-500'"
                      :style="{ width: `${project.progress}%` }"
                    />
                  </div>
                </div>
                <div class="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="project.start_date">
                    <font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-1" />
                    Début : {{ formatDate(project.start_date) }}
                  </span>
                  <span v-if="project.expected_end_date">
                    <font-awesome-icon :icon="['fas', 'flag-checkered']" class="mr-1" />
                    Fin prévue : {{ formatDate(project.expected_end_date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Objectif -->
    <Teleport to="body">
      <div
        v-if="showObjectiveModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingObjective ? 'Modifier l\'objectif' : 'Nouvel objectif' }}
            </h3>
            <button class="rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="closeModals">
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>
          <div class="space-y-4 p-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre *</label>
              <input
                v-model="objectiveForm.title"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Améliorer la satisfaction des étudiants"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                v-model="objectiveForm.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Description détaillée de l'objectif..."
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
              <input
                v-model.number="objectiveForm.display_order"
                type="number"
                min="1"
                class="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!objectiveForm.title"
              @click="saveObjective"
            >
              {{ editingObjective ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Réalisation -->
    <Teleport to="body">
      <div
        v-if="showAchievementModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingAchievement ? 'Modifier la réalisation' : 'Nouvelle réalisation' }}
            </h3>
            <button class="rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="closeModals">
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>
          <div class="space-y-4 p-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre *</label>
              <input
                v-model="achievementForm.title"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Mise en place du nouveau système"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                v-model="achievementForm.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Description de la réalisation..."
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select
                  v-model="achievementForm.type"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sélectionner...</option>
                  <option v-for="type in achievementTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
                <input
                  v-model="achievementForm.achievement_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Image de couverture (URL)</label>
              <input
                v-model="achievementForm.cover_image"
                type="url"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!achievementForm.title || !achievementForm.achievement_date"
              @click="saveAchievement"
            >
              {{ editingAchievement ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Projet -->
    <Teleport to="body">
      <div
        v-if="showProjectModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ editingProject ? 'Modifier le projet' : 'Nouveau projet' }}
            </h3>
            <button class="rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="closeModals">
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>
          <div class="space-y-4 p-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Titre *</label>
              <input
                v-model="projectForm.title"
                type="text"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Digitalisation des processus"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                v-model="projectForm.description"
                rows="3"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Description du projet..."
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                <select
                  v-model="projectForm.status"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="planned">Planifié</option>
                  <option value="ongoing">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Progression (%)</label>
                <input
                  v-model.number="projectForm.progress"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
                <input
                  v-model="projectForm.start_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de fin prévue</label>
                <input
                  v-model="projectForm.expected_end_date"
                  type="date"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Image de couverture (URL)</label>
              <input
                v-model="projectForm.cover_image"
                type="url"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!projectForm.title"
              @click="saveProject"
            >
              {{ editingProject ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Confirmation suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingItem"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeModals"
      >
        <div class="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
          <div class="p-6 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p class="text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer
              <strong class="text-gray-900 dark:text-white">{{ deletingItem.item.title }}</strong> ?
              Cette action est irréversible.
            </p>
          </div>
          <div class="flex items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="confirmDelete"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
