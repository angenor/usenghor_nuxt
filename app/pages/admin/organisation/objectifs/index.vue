<script setup lang="ts">
import type {
  ProjectStatus,
  ServiceDisplay,
  ServiceWithDetails,
  ServiceObjectiveRead,
  ServiceAchievementRead,
  ServiceProjectRead,
} from '~/composables/useServicesApi'

definePageMeta({
  layout: 'admin'
})

const {
  getAllServices,
  getServiceById,
  createServiceObjective,
  updateServiceObjective,
  deleteServiceObjective,
  createServiceAchievement,
  updateServiceAchievement,
  deleteServiceAchievement,
  createServiceProject,
  updateServiceProject,
  deleteServiceProject,
  projectStatusLabels,
  projectStatusColors,
} = useServicesApi()

// Types de réalisations (libre-texte côté backend, mais liste prédéfinie côté UI)
const achievementTypes = [
  'Innovation', 'Digital', 'Événement', 'Digitalisation',
  'Certification', 'Partenariat', 'Infrastructure', 'Formation', 'Stratégie'
]

// === STATE ===
const loading = ref(false)
const loadingDetails = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const servicesData = ref<ServiceDisplay[]>([])
const selectedServiceDetails = ref<ServiceWithDetails | null>(null)

const selectedServiceId = ref<string | null>(null)
const activeTab = ref<'overview' | 'objectives' | 'achievements' | 'projects'>('overview')

// Modals
const showObjectiveModal = ref(false)
const showAchievementModal = ref(false)
const showProjectModal = ref(false)
const showDeleteModal = ref(false)

const editingObjective = ref<ServiceObjectiveRead | null>(null)
const editingAchievement = ref<ServiceAchievementRead | null>(null)
const editingProject = ref<ServiceProjectRead | null>(null)
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
  cover_image_url: '',
  achievement_date: ''
})

const projectForm = ref({
  title: '',
  description: '',
  progress: 0,
  status: 'planned' as ProjectStatus,
  start_date: '',
  expected_end_date: ''
})

// === DATA LOADING ===
async function loadServices() {
  loading.value = true
  error.value = null
  try {
    servicesData.value = await getAllServices()
  } catch (e) {
    error.value = 'Erreur lors du chargement des services'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadServiceDetails(serviceId: string) {
  loadingDetails.value = true
  try {
    selectedServiceDetails.value = await getServiceById(serviceId)
  } catch (e) {
    console.error('Erreur chargement service:', e)
  } finally {
    loadingDetails.value = false
  }
}

// Charger les données au montage
onMounted(async () => {
  await loadServices()
})

// Charger les détails quand on sélectionne un service
watch(selectedServiceId, async (id) => {
  if (id) {
    await loadServiceDetails(id)
  } else {
    selectedServiceDetails.value = null
  }
})

// === COMPUTED ===
const globalStats = computed(() => {
  return {
    totalServices: servicesData.value.length,
    totalObjectives: servicesData.value.reduce((sum, s) => sum + s.objectives_count, 0),
    totalAchievements: servicesData.value.reduce((sum, s) => sum + s.achievements_count, 0),
    totalProjects: servicesData.value.reduce((sum, s) => sum + s.projects_count, 0),
  }
})

const servicesGrouped = computed(() => {
  const grouped: Record<string, ServiceDisplay[]> = {}
  for (const service of servicesData.value) {
    const key = service.department?.name || 'Sans département'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(service)
  }
  return grouped
})

const selectedService = computed(() => {
  if (!selectedServiceId.value) return null
  return servicesData.value.find(s => s.id === selectedServiceId.value)
})

const serviceOverview = computed(() => {
  if (!selectedServiceDetails.value) return null
  const details = selectedServiceDetails.value
  return {
    objectives_count: details.objectives?.length || 0,
    achievements_count: details.achievements?.length || 0,
    projects: {
      total: details.projects?.length || 0,
      planned: details.projects?.filter(p => p.status === 'planned').length || 0,
      ongoing: details.projects?.filter(p => p.status === 'ongoing').length || 0,
      completed: details.projects?.filter(p => p.status === 'completed').length || 0,
      suspended: details.projects?.filter(p => p.status === 'suspended').length || 0,
    }
  }
})

const serviceObjectives = computed(() => {
  return selectedServiceDetails.value?.objectives || []
})

const serviceAchievements = computed(() => {
  return selectedServiceDetails.value?.achievements || []
})

const serviceProjects = computed(() => {
  return selectedServiceDetails.value?.projects || []
})

// Labels pour les statuts de projet (alias pour compatibilité template)
const serviceProjectStatusLabels = projectStatusLabels
const serviceProjectStatusColors = projectStatusColors

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
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// === OBJECTIFS ===
const openObjectiveModal = (objective?: ServiceObjectiveRead) => {
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

const saveObjective = async () => {
  if (!selectedServiceId.value) return
  saving.value = true
  try {
    if (editingObjective.value) {
      await updateServiceObjective(
        selectedServiceId.value,
        editingObjective.value.id,
        {
          title: objectiveForm.value.title,
          description: objectiveForm.value.description || null,
          display_order: objectiveForm.value.display_order,
        }
      )
    } else {
      await createServiceObjective(selectedServiceId.value, {
        title: objectiveForm.value.title,
        description: objectiveForm.value.description || null,
        display_order: objectiveForm.value.display_order,
      })
    }
    await loadServiceDetails(selectedServiceId.value)
    await loadServices() // Rafraîchir les compteurs
    closeModals()
  } catch (e) {
    console.error('Erreur sauvegarde objectif:', e)
  } finally {
    saving.value = false
  }
}

// === RÉALISATIONS ===
const openAchievementModal = (achievement?: ServiceAchievementRead) => {
  if (achievement) {
    editingAchievement.value = achievement
    achievementForm.value = {
      title: achievement.title,
      description: achievement.description || '',
      type: achievement.type || '',
      cover_image_url: achievement.cover_image_external_id || '',
      achievement_date: achievement.achievement_date || ''
    }
  } else {
    editingAchievement.value = null
    achievementForm.value = {
      title: '',
      description: '',
      type: '',
      cover_image_url: '',
      achievement_date: new Date().toISOString().split('T')[0]
    }
  }
  showAchievementModal.value = true
}

const saveAchievement = async () => {
  if (!selectedServiceId.value) return
  saving.value = true
  try {
    if (editingAchievement.value) {
      await updateServiceAchievement(
        selectedServiceId.value,
        editingAchievement.value.id,
        {
          title: achievementForm.value.title,
          description: achievementForm.value.description || null,
          type: achievementForm.value.type || null,
          cover_image_external_id: achievementForm.value.cover_image_url || null,
          achievement_date: achievementForm.value.achievement_date || null,
        }
      )
    } else {
      await createServiceAchievement(selectedServiceId.value, {
        title: achievementForm.value.title,
        description: achievementForm.value.description || null,
        type: achievementForm.value.type || null,
        cover_image_external_id: achievementForm.value.cover_image_url || null,
        achievement_date: achievementForm.value.achievement_date || null,
      })
    }
    await loadServiceDetails(selectedServiceId.value)
    await loadServices() // Rafraîchir les compteurs
    closeModals()
  } catch (e) {
    console.error('Erreur sauvegarde réalisation:', e)
  } finally {
    saving.value = false
  }
}

// === PROJETS ===
const openProjectModal = (project?: ServiceProjectRead) => {
  if (project) {
    editingProject.value = project
    projectForm.value = {
      title: project.title,
      description: project.description || '',
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
      progress: 0,
      status: 'planned',
      start_date: '',
      expected_end_date: ''
    }
  }
  showProjectModal.value = true
}

const saveProject = async () => {
  if (!selectedServiceId.value) return
  saving.value = true
  try {
    if (editingProject.value) {
      await updateServiceProject(
        selectedServiceId.value,
        editingProject.value.id,
        {
          title: projectForm.value.title,
          description: projectForm.value.description || null,
          progress: projectForm.value.progress,
          status: projectForm.value.status,
          start_date: projectForm.value.start_date || null,
          expected_end_date: projectForm.value.expected_end_date || null,
        }
      )
    } else {
      await createServiceProject(selectedServiceId.value, {
        title: projectForm.value.title,
        description: projectForm.value.description || null,
        progress: projectForm.value.progress,
        status: projectForm.value.status,
        start_date: projectForm.value.start_date || null,
        expected_end_date: projectForm.value.expected_end_date || null,
      })
    }
    await loadServiceDetails(selectedServiceId.value)
    await loadServices() // Rafraîchir les compteurs
    closeModals()
  } catch (e) {
    console.error('Erreur sauvegarde projet:', e)
  } finally {
    saving.value = false
  }
}

// === SUPPRESSION ===
const openDeleteModal = (type: 'objective' | 'achievement' | 'project', item: any) => {
  deletingItem.value = { type, item }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingItem.value || !selectedServiceId.value) return
  saving.value = true
  try {
    if (deletingItem.value.type === 'objective') {
      await deleteServiceObjective(selectedServiceId.value, deletingItem.value.item.id)
    } else if (deletingItem.value.type === 'achievement') {
      await deleteServiceAchievement(selectedServiceId.value, deletingItem.value.item.id)
    } else if (deletingItem.value.type === 'project') {
      await deleteServiceProject(selectedServiceId.value, deletingItem.value.item.id)
    }
    await loadServiceDetails(selectedServiceId.value)
    await loadServices() // Rafraîchir les compteurs
    closeModals()
  } catch (e) {
    console.error('Erreur suppression:', e)
  } finally {
    saving.value = false
  }
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
    // TODO: Implémenter la mise à jour de l'ordre via API
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

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <font-awesome-icon :icon="['fas', 'spinner']" class="h-5 w-5 animate-spin" />
        <span>Chargement des services...</span>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
      <div class="flex items-center gap-3 text-red-700 dark:text-red-400">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="h-5 w-5" />
        <span>{{ error }}</span>
        <button class="ml-auto text-sm underline" @click="loadServices">Réessayer</button>
      </div>
    </div>

    <!-- Stats globales (quand aucun service sélectionné) -->
    <div v-else-if="!selectedServiceId" class="space-y-6">
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

      <!-- Liste des services par département -->
      <div class="space-y-6">
        <div v-for="(departmentServices, departmentName) in servicesGrouped" :key="departmentName">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            {{ departmentName }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="service in departmentServices"
              :key="service.id"
              class="rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-brand-red-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-red-600"
              @click="selectService(service.id)"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ service.name }}</h3>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ service.department?.name || 'Sans département' }}</p>
                </div>
                <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-4 w-4 text-gray-400" />
              </div>
              <div class="mt-3 flex items-center gap-4 text-sm">
                <span class="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <font-awesome-icon :icon="['fas', 'bullseye']" class="h-3 w-3" />
                  {{ service.objectives_count }}
                </span>
                <span class="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <font-awesome-icon :icon="['fas', 'trophy']" class="h-3 w-3" />
                  {{ service.achievements_count }}
                </span>
                <span class="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <font-awesome-icon :icon="['fas', 'tasks']" class="h-3 w-3" />
                  {{ service.projects_count }}
                </span>
              </div>
            </button>
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
              {{ selectedService?.department?.name || 'Sans département' }}
            </p>
          </div>
        </div>
        <div v-if="loadingDetails" class="flex items-center gap-2 text-sm text-gray-500">
          <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
          <span>Chargement...</span>
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
            <!-- Image de couverture -->
            <div v-if="achievement.cover_image_external_id" class="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img
                :src="achievement.cover_image_external_id"
                :alt="achievement.title"
                class="h-full w-full object-cover"
                @error="($event.target as HTMLImageElement).parentElement!.style.display = 'none'"
              />
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
            class="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
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
              :disabled="!objectiveForm.title || saving"
              @click="saveObjective"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrement...
              </span>
              <span v-else>{{ editingObjective ? 'Enregistrer' : 'Créer' }}</span>
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
                v-model="achievementForm.cover_image_url"
                type="url"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="https://exemple.com/image.jpg"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">URL de l'image à afficher comme couverture</p>
              <!-- Aperçu de l'image -->
              <div v-if="achievementForm.cover_image_url" class="mt-2">
                <img
                  :src="achievementForm.cover_image_url"
                  alt="Aperçu"
                  class="h-32 w-full rounded-lg object-cover"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
              </div>
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
              :disabled="!achievementForm.title || !achievementForm.achievement_date || saving"
              @click="saveAchievement"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrement...
              </span>
              <span v-else>{{ editingAchievement ? 'Enregistrer' : 'Créer' }}</span>
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
              :disabled="!projectForm.title || saving"
              @click="saveProject"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrement...
              </span>
              <span v-else>{{ editingProject ? 'Enregistrer' : 'Créer' }}</span>
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
              :disabled="saving"
              @click="closeModals"
            >
              Annuler
            </button>
            <button
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="saving"
              @click="confirmDelete"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Suppression...
              </span>
              <span v-else>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
