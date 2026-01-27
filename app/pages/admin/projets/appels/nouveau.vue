<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import type { ProjectCallType, ProjectCallStatus } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  listProjects,
  createProjectCall,
  projectCallTypeLabels,
  projectCallStatusLabels,
} = useProjectsApi()

// Projets disponibles pour le select
const projects = ref<{ id: string; title: string }[]>([])
const isLoadingProjects = ref(true)

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const description = ref<OutputData | undefined>(undefined)
const conditions = ref<OutputData | undefined>(undefined)

// État du formulaire
const form = reactive({
  project_id: '',
  title: '',
  short_description: '',
  type: 'project' as ProjectCallType,
  status: 'upcoming' as ProjectCallStatus,
  deadline: '',
})

// Charger les projets
onMounted(async () => {
  try {
    const response = await listProjects({ limit: 100 })
    projects.value = response.items.map(p => ({ id: p.id, title: p.title }))
  }
  catch (err) {
    console.error('Erreur chargement projets:', err)
  }
  finally {
    isLoadingProjects.value = false
  }
})

// === SAUVEGARDE ===
const isSaving = ref(false)
const error = ref<string | null>(null)

const saveForm = async () => {
  // Validation basique
  if (!form.project_id) {
    alert('Veuillez sélectionner un projet parent')
    return
  }
  if (!form.title.trim()) {
    alert('Veuillez saisir un titre')
    return
  }

  isSaving.value = true
  error.value = null

  try {
    // Sérialiser le contenu EditorJS en JSON
    const descriptionJson = description.value ? JSON.stringify(description.value) : null
    const conditionsJson = conditions.value ? JSON.stringify(conditions.value) : null

    await createProjectCall(form.project_id, {
      title: form.title,
      description: descriptionJson,
      conditions: conditionsJson,
      type: form.type,
      status: form.status,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    })

    router.push('/admin/projets/appels')
  }
  catch (err: any) {
    console.error('Erreur création appel:', err)
    error.value = err.message || 'Erreur lors de la création de l\'appel'
  }
  finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push('/admin/projets/appels')
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Nouvel appel à projets
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créez un nouvel appel lié à un projet institutionnel
          </p>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          :disabled="isSaving"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="saveForm"
        >
          <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          Créer l'appel
        </button>
      </div>
    </div>

    <!-- Erreur -->
    <div v-if="error" class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
      {{ error }}
    </div>

    <!-- Formulaire -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div class="mb-6 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <font-awesome-icon :icon="['fas', 'bullhorn']" class="text-purple-500" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Informations de l'appel
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Définissez les caractéristiques de l'appel
          </p>
        </div>
      </div>

      <div class="grid gap-6 sm:grid-cols-2">
        <!-- Projet parent -->
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Projet parent <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.project_id"
            :disabled="isLoadingProjects"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">
              {{ isLoadingProjects ? 'Chargement...' : 'Sélectionnez un projet' }}
            </option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.title }}
            </option>
          </select>
        </div>

        <!-- Titre -->
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titre de l'appel <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Ex: Appel à candidatures - Cohorte 2025"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <!-- Type -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type d'appel
          </label>
          <select
            v-model="form.type"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="(label, key) in projectCallTypeLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Statut -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut
          </label>
          <select
            v-model="form.status"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option v-for="(label, key) in projectCallStatusLabels" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Date limite -->
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date limite de soumission
          </label>
          <input
            v-model="form.deadline"
            type="datetime-local"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p class="mt-1 text-xs text-gray-500">Laissez vide si pas de date limite</p>
        </div>
      </div>
    </div>

    <!-- Description détaillée -->
    <AdminRichTextEditor
      v-model="description"
      title="Description détaillée"
      description="Décrivez l'appel en détail : contexte, objectifs, profils recherchés..."
      icon="fa-solid fa-file-lines"
      icon-color="text-blue-500"
      placeholder="Rédigez la description complète de l'appel..."
      :min-height="300"
    />

    <!-- Conditions de participation -->
    <AdminRichTextEditor
      v-model="conditions"
      title="Conditions de participation"
      description="Précisez les critères d'éligibilité et les conditions de participation"
      icon="fa-solid fa-clipboard-check"
      icon-color="text-green-500"
      placeholder="Listez les conditions de participation..."
      :min-height="250"
    />

    <!-- Footer actions -->
    <div class="sticky bottom-0 -mx-4 -mb-4 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:-mx-6 sm:px-6">
      <div class="flex justify-end gap-3">
        <button
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          :disabled="isSaving"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="saveForm"
        >
          <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          Créer l'appel
        </button>
      </div>
    </div>
  </div>
</template>
