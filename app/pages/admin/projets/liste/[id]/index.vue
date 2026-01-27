<script setup lang="ts">
import type { ProjectDisplay } from '~/composables/useProjectsApi'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProjectById,
  deleteProject: deleteProjectApi,
  publishProject,
  unpublishProject,
  projectStatusLabels,
  projectStatusColors,
  publicationStatusLabels,
  publicationStatusColors,
  formatDate,
  formatBudget,
} = useProjectsApi()

const { departments } = useReferenceData()

// État
const project = ref<ProjectDisplay | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isProcessing = ref(false)

// Chargement
const projectId = computed(() => route.params.id as string)

onMounted(async () => {
  try {
    project.value = await getProjectById(projectId.value)
  }
  catch (err: any) {
    console.error('Erreur chargement projet:', err)
    error.value = err.message || 'Projet non trouvé'
  }
  finally {
    isLoading.value = false
  }
})

// Navigation
const goBack = () => router.push('/admin/projets/liste')
const goToEdit = () => router.push(`/admin/projets/liste/${projectId.value}/edit`)

// Helpers
const getDepartmentName = (deptId: string | null) => {
  if (!deptId) return null
  const dept = departments.value?.find((d: any) => d.id === deptId)
  return dept?.name || null
}

const formatDateTime = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Actions
const handleDelete = async () => {
  if (!project.value) return
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.value.title}" ?`)) return

  isProcessing.value = true
  try {
    await deleteProjectApi(project.value.id)
    router.push('/admin/projets/liste')
  }
  catch (err: any) {
    console.error('Erreur suppression:', err)
    alert('Erreur lors de la suppression')
  }
  finally {
    isProcessing.value = false
  }
}

const togglePublish = async () => {
  if (!project.value) return

  isProcessing.value = true
  try {
    if (project.value.publication_status === 'published') {
      project.value = await unpublishProject(project.value.id)
    }
    else {
      project.value = await publishProject(project.value.id)
    }
  }
  catch (err: any) {
    console.error('Erreur publication:', err)
    alert('Erreur lors du changement de statut')
  }
  finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <!-- Chargement -->
  <div v-if="isLoading" class="flex items-center justify-center py-16">
    <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-4xl text-blue-600" />
  </div>

  <!-- Contenu -->
  <div v-else-if="project" class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-4">
        <button
          class="mt-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ project.title }}
          </h1>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span :class="['inline-flex rounded-full px-3 py-1 text-sm font-medium', projectStatusColors[project.status]]">
              {{ projectStatusLabels[project.status] }}
            </span>
            <span :class="['inline-flex rounded-full px-3 py-1 text-sm font-medium', publicationStatusColors[project.publication_status]]">
              {{ publicationStatusLabels[project.publication_status] }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          :disabled="isProcessing"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="togglePublish"
        >
          <font-awesome-icon :icon="['fas', project.publication_status === 'published' ? 'eye-slash' : 'eye']" />
          {{ project.publication_status === 'published' ? 'Dépublier' : 'Publier' }}
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="goToEdit"
        >
          <font-awesome-icon :icon="['fas', 'edit']" />
          Modifier
        </button>
        <button
          :disabled="isProcessing"
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          @click="handleDelete"
        >
          <font-awesome-icon :icon="['fas', 'trash']" />
          Supprimer
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Colonne principale -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Image de couverture -->
        <div v-if="project.cover_image" class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <img
            :src="project.cover_image"
            :alt="project.title"
            class="h-64 w-full object-cover"
          />
        </div>

        <!-- Résumé -->
        <div v-if="project.summary" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'align-left']" class="h-5 w-5 text-gray-400" />
            Résumé
          </h2>
          <p class="text-gray-600 dark:text-gray-300">{{ project.summary }}</p>
        </div>

        <!-- Description détaillée -->
        <div v-if="project.description" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'file-lines']" class="h-5 w-5 text-indigo-500" />
            Description détaillée
          </h2>
          <div class="prose prose-sm max-w-none text-gray-600 dark:prose-invert dark:text-gray-300" v-html="project.description" />
        </div>

        <!-- Bénéficiaires -->
        <div v-if="project.beneficiaries" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'users']" class="h-5 w-5 text-teal-500" />
            Bénéficiaires
          </h2>
          <p class="text-gray-600 dark:text-gray-300">{{ project.beneficiaries }}</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Informations -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="h-5 w-5 text-blue-500" />
            Informations
          </h2>
          <dl class="space-y-4">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                <code class="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">{{ project.slug }}</code>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Classification -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'tags']" class="h-5 w-5 text-orange-500" />
            Classification
          </h2>
          <dl class="space-y-4">
            <div v-if="project.categories && project.categories.length > 0">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Catégories</dt>
              <dd class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="cat in project.categories"
                  :key="cat.id"
                  class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {{ cat.name }}
                </span>
              </dd>
            </div>
            <div v-if="getDepartmentName(project.department_external_id)">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Département</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ getDepartmentName(project.department_external_id) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Dates et budget -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'calendar']" class="h-5 w-5 text-green-500" />
            Dates et budget
          </h2>
          <dl class="space-y-4">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de début</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(project.start_date) }}</dd>
            </div>
            <div v-if="project.end_date">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de fin</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ formatDate(project.end_date) }}</dd>
            </div>
            <div v-if="project.budget">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</dt>
              <dd class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {{ formatBudget(project.budget, project.currency) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Métadonnées -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-gray-400" />
            Métadonnées
          </h2>
          <dl class="space-y-4 text-sm">
            <div>
              <dt class="font-medium text-gray-500 dark:text-gray-400">Créé le</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ formatDateTime(project.created_at) }}</dd>
            </div>
            <div>
              <dt class="font-medium text-gray-500 dark:text-gray-400">Modifié le</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ formatDateTime(project.updated_at) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>

  <!-- 404 - Projet non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-16">
    <font-awesome-icon :icon="['fas', 'folder-open']" class="h-16 w-16 text-gray-300 dark:text-gray-600" />
    <h1 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Projet non trouvé</h1>
    <p class="mt-2 text-gray-500 dark:text-gray-400">
      {{ error || "Le projet demandé n'existe pas ou a été supprimé." }}
    </p>
    <NuxtLink
      to="/admin/projets/liste"
      class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
      Retour à la liste
    </NuxtLink>
  </div>
</template>
