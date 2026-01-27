<script setup lang="ts">
import type { OutputData } from '@editorjs/editorjs'
import type { ProjectCallRead, ProjectCallStatus } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getCallById,
  getProjectById,
  deleteCall: deleteCallApi,
  updateCall,
  projectCallTypeLabels,
  projectCallStatusLabels,
  projectCallStatusColors,
} = useProjectsApi()

// État
const call = ref<ProjectCallRead | null>(null)
const projectName = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const isProcessing = ref(false)

// Charger les données
const callId = computed(() => route.params.id as string)

onMounted(async () => {
  try {
    call.value = await getCallById(callId.value)

    // Charger le nom du projet parent
    if (call.value.project_id) {
      try {
        const project = await getProjectById(call.value.project_id)
        projectName.value = project.title
      }
      catch {
        projectName.value = null
      }
    }
  }
  catch (err: any) {
    console.error('Erreur chargement appel:', err)
    error.value = err.message || 'Appel non trouvé'
  }
  finally {
    isLoading.value = false
  }
})

// === ACTIONS ===
const changeStatus = async (newStatus: ProjectCallStatus) => {
  if (!call.value) return

  isProcessing.value = true
  try {
    call.value = await updateCall(call.value.id, { status: newStatus })
  }
  catch (err: any) {
    console.error('Erreur changement statut:', err)
    alert('Erreur lors du changement de statut')
  }
  finally {
    isProcessing.value = false
  }
}

const deleteCall = async () => {
  if (!call.value) return
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet appel ?')) return

  isProcessing.value = true
  try {
    await deleteCallApi(call.value.id)
    router.push('/admin/projets/appels')
  }
  catch (err: any) {
    console.error('Erreur suppression:', err)
    alert('Erreur lors de la suppression')
  }
  finally {
    isProcessing.value = false
  }
}

const goBack = () => {
  router.push('/admin/projets/appels')
}

// === FORMATAGE ===
const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatShortDate = (date: string | null | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const isDeadlinePassed = (deadline: string | null | undefined) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const getDaysUntilDeadline = (deadline: string | null | undefined) => {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Parser le contenu JSON en OutputData pour l'éditeur
const parsedDescription = computed<OutputData | null>(() => {
  if (!call.value?.description) return null
  try {
    return JSON.parse(call.value.description) as OutputData
  }
  catch {
    return null
  }
})

const parsedConditions = computed<OutputData | null>(() => {
  if (!call.value?.conditions) return null
  try {
    return JSON.parse(call.value.conditions) as OutputData
  }
  catch {
    return null
  }
})

// URL de l'image de couverture (chargée de manière asynchrone)
const coverImageUrl = ref<string | null>(null)

const { getMediaUrlById } = useMediaApi()

// Charger l'URL de l'image quand call change
watch(
  () => call.value?.cover_image_external_id,
  async (imageId) => {
    if (imageId) {
      coverImageUrl.value = await getMediaUrlById(imageId)
    }
    else {
      coverImageUrl.value = null
    }
  },
  { immediate: true },
)

// Couleurs par type
const projectCallTypeColors: Record<string, string> = {
  application: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  scholarship: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  project: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  recruitment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  training: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-blue-500" />
    </div>

    <!-- Erreur / Non trouvé -->
    <div v-else-if="error || !call" class="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mb-4 text-5xl text-yellow-500" />
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        Appel non trouvé
      </h2>
      <p class="mb-4 text-gray-500 dark:text-gray-400">
        {{ error || "L'appel demandé n'existe pas ou a été supprimé." }}
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
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          <button
            class="mt-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            @click="goBack"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
          </button>
          <div>
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span v-if="call.type" :class="['inline-flex rounded-full px-2 py-1 text-xs font-medium', projectCallTypeColors[call.type]]">
                {{ projectCallTypeLabels[call.type] }}
              </span>
              <span :class="['inline-flex rounded-full px-2 py-1 text-xs font-medium', projectCallStatusColors[call.status]]">
                {{ projectCallStatusLabels[call.status] }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ call.title }}
            </h1>
            <p v-if="projectName" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'folder']" class="mr-1" />
              Projet : {{ projectName }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/admin/projets/appels/${call.id}/edit`"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <font-awesome-icon :icon="['fas', 'edit']" />
            Modifier
          </NuxtLink>
          <button
            :disabled="isProcessing"
            class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            @click="deleteCall"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
            Supprimer
          </button>
        </div>
      </div>

      <!-- Informations clés -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Date limite -->
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <font-awesome-icon :icon="['fas', 'clock']" class="text-orange-500" />
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Date limite</div>
              <div :class="['font-semibold', isDeadlinePassed(call.deadline) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white']">
                {{ formatShortDate(call.deadline) }}
              </div>
              <div v-if="call.deadline && !isDeadlinePassed(call.deadline)" class="text-xs text-green-600 dark:text-green-400">
                {{ getDaysUntilDeadline(call.deadline) }} jour(s) restant(s)
              </div>
              <div v-else-if="call.deadline && isDeadlinePassed(call.deadline)" class="text-xs text-red-600 dark:text-red-400">
                Expiré
              </div>
            </div>
          </div>
        </div>

        <!-- Statut -->
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon :icon="['fas', 'flag']" class="text-blue-500" />
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-500 dark:text-gray-400">Statut</div>
              <select
                :value="call.status"
                :disabled="isProcessing"
                class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @change="changeStatus(($event.target as HTMLSelectElement).value as ProjectCallStatus)"
              >
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="closed">Clôturé</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Créé le -->
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon :icon="['fas', 'calendar-plus']" class="text-green-500" />
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Créé le</div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ formatShortDate(call.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Modifié le -->
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <font-awesome-icon :icon="['fas', 'calendar-check']" class="text-purple-500" />
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Modifié le</div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ formatShortDate(call.updated_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image de couverture -->
      <div v-if="coverImageUrl" class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <img
          :src="coverImageUrl"
          :alt="call.title"
          class="h-64 w-full object-cover"
        />
      </div>

      <!-- Description détaillée (EditorJS) -->
      <div v-if="parsedDescription" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'file-lines']" class="text-blue-500" />
          Description détaillée
        </h2>
        <div class="prose prose-sm max-w-none dark:prose-invert">
          <EditorJSRenderer :data="parsedDescription" />
        </div>
      </div>
      <!-- Fallback texte brut si description n'est pas du JSON -->
      <div v-else-if="call.description" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'align-left']" class="text-gray-400" />
          Description
        </h2>
        <p class="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
          {{ call.description }}
        </p>
      </div>

      <!-- Conditions de participation (EditorJS) -->
      <div v-if="parsedConditions" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'clipboard-check']" class="text-green-500" />
          Conditions de participation
        </h2>
        <div class="prose prose-sm max-w-none dark:prose-invert">
          <EditorJSRenderer :data="parsedConditions" />
        </div>
      </div>
      <!-- Fallback texte brut si conditions n'est pas du JSON -->
      <div v-else-if="call.conditions" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'clipboard-check']" class="text-green-500" />
          Conditions de participation
        </h2>
        <p class="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
          {{ call.conditions }}
        </p>
      </div>

      <!-- Métadonnées techniques -->
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Informations techniques
        </h3>
        <div class="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span class="text-gray-500 dark:text-gray-400">ID :</span>
            <span class="ml-2 font-mono text-gray-700 dark:text-gray-300">{{ call.id }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Projet ID :</span>
            <span class="ml-2 font-mono text-gray-700 dark:text-gray-300">{{ call.project_id }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Créé le :</span>
            <span class="ml-2 text-gray-700 dark:text-gray-300">{{ formatDate(call.created_at) }}</span>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Modifié le :</span>
            <span class="ml-2 text-gray-700 dark:text-gray-300">{{ formatDate(call.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Retour à la liste
        </button>
        <NuxtLink
          :to="`/admin/projets/appels/${call.id}/edit`"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <font-awesome-icon :icon="['fas', 'edit']" />
          Modifier cet appel
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
