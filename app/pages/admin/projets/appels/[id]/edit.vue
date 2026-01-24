<script setup lang="ts">
import type { ProjectCall, ProjectCallType, ProjectCallStatus } from '~/composables/useMockData'
import type { OutputData } from '@editorjs/editorjs'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProjectCallById,
  getAllProjects,
  projectCallTypeLabels,
  projectCallStatusLabels,
  projectCallStatusColors
} = useMockData()

// Projets disponibles pour le select
const projects = computed(() => getAllProjects())

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const description = ref<OutputData | undefined>(undefined)
const conditions = ref<OutputData | undefined>(undefined)

// État du formulaire
const form = ref<Partial<ProjectCall>>({})
const isLoading = ref(true)
const notFound = ref(false)

// Charger les données
onMounted(() => {
  const callId = route.params.id as string
  const call = getProjectCallById(callId)

  if (call) {
    form.value = JSON.parse(JSON.stringify(call))
    // Convertir la deadline pour le format datetime-local
    if (form.value.deadline) {
      form.value.deadline = form.value.deadline.slice(0, 16)
    }
    // Charger le contenu EditorJS
    description.value = call.description_rich as OutputData | undefined
    conditions.value = call.conditions as OutputData | undefined
  } else {
    notFound.value = true
  }
  isLoading.value = false
})

// Mise à jour du titre du projet quand on change de projet
watch(() => form.value.project_id, (projectId) => {
  if (projectId) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      form.value.project_title = project.title_fr
    }
  }
})

// === SAUVEGARDE ===
const isSaving = ref(false)

const saveForm = async () => {
  // Validation basique
  if (!form.value.project_id) {
    alert('Veuillez sélectionner un projet parent')
    return
  }
  if (!form.value.title?.trim()) {
    alert('Veuillez saisir un titre')
    return
  }

  isSaving.value = true
  try {
    const callData = {
      ...form.value,
      description_rich: description.value,
      conditions: conditions.value,
      updated_at: new Date().toISOString()
    }

    console.log('Updating project call:', callData)
    // En production: PUT /api/admin/project-calls/{id}
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/admin/projets/appels')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push('/admin/projets/appels')
}

// === FORMATAGE ===
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-blue-500" />
    </div>

    <!-- Non trouvé -->
    <div v-else-if="notFound" class="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mb-4 text-5xl text-yellow-500" />
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        Appel non trouvé
      </h2>
      <p class="mb-4 text-gray-500 dark:text-gray-400">
        L'appel demandé n'existe pas ou a été supprimé.
      </p>
      <NuxtLink
        to="/admin/projets/appels"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        Retour à la liste
      </NuxtLink>
    </div>

    <!-- Contenu -->
    <template v-else>
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
              Modifier l'appel
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ form.title }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span :class="['inline-flex rounded-full px-3 py-1 text-sm font-medium', projectCallStatusColors[form.status as ProjectCallStatus]]">
            {{ projectCallStatusLabels[form.status as ProjectCallStatus] }}
          </span>
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
            Enregistrer
          </button>
        </div>
      </div>

      <!-- Métadonnées -->
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <div class="flex flex-wrap gap-6 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">ID :</span>
            <span class="ml-1 font-mono text-gray-700 dark:text-gray-300">{{ form.id }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Créé le :</span>
            <span class="ml-1 text-gray-700 dark:text-gray-300">{{ formatDate(form.created_at) }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Modifié le :</span>
            <span class="ml-1 text-gray-700 dark:text-gray-300">{{ formatDate(form.updated_at) }}</span>
          </div>
        </div>
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
              Modifiez les caractéristiques de l'appel
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
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Sélectionnez un projet</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.title_fr }}
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
            <p class="mt-1 text-xs text-gray-500">
              Vous pouvez rouvrir un appel clôturé en changeant son statut
            </p>
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

          <!-- Description courte -->
          <div class="sm:col-span-2">
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description courte
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Brève description de l'appel (affichée dans les listes)"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
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
        :multilingual="false"
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
        :multilingual="false"
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
            Enregistrer
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
