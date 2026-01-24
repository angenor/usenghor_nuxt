<script setup lang="ts">
import type { ProjectCall, ProjectCallStatus } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProjectCallById,
  projectCallTypeLabels,
  projectCallTypeColors,
  projectCallStatusLabels,
  projectCallStatusColors
} = useMockData()

// État
const call = ref<ProjectCall | null>(null)
const isLoading = ref(true)
const notFound = ref(false)

// Charger les données
onMounted(() => {
  const callId = route.params.id as string
  const foundCall = getProjectCallById(callId)

  if (foundCall) {
    call.value = foundCall
  } else {
    notFound.value = true
  }
  isLoading.value = false
})

// === ACTIONS ===
const changeStatus = (newStatus: ProjectCallStatus) => {
  if (call.value) {
    console.log(`Changing status to ${newStatus}`)
    // En production: POST /api/admin/project-calls/{id}/status
  }
}

const deleteCall = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet appel ?')) {
    console.log('Deleting call:', call.value?.id)
    // En production: DELETE /api/admin/project-calls/{id}
    router.push('/admin/projets/appels')
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

const formatShortDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const isDeadlinePassed = (deadline: string | undefined) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

const getDaysUntilDeadline = (deadline: string | undefined) => {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
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
    <template v-else-if="call">
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
              <span :class="['inline-flex rounded-full px-2 py-1 text-xs font-medium', projectCallTypeColors[call.type]]">
                {{ projectCallTypeLabels[call.type] }}
              </span>
              <span :class="['inline-flex rounded-full px-2 py-1 text-xs font-medium', projectCallStatusColors[call.status]]">
                {{ projectCallStatusLabels[call.status] }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ call.title }}
            </h1>
            <p v-if="call.project_title" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              <font-awesome-icon :icon="['fas', 'folder']" class="mr-1" />
              Projet : {{ call.project_title }}
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
            class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
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
                class="mt-1 w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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

      <!-- Description courte -->
      <div v-if="call.description" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'align-left']" class="text-gray-400" />
          Description
        </h2>
        <p class="text-gray-600 dark:text-gray-300">
          {{ call.description }}
        </p>
      </div>

      <!-- Description détaillée (EditorJS) -->
      <div v-if="call.description_rich" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'file-lines']" class="text-blue-500" />
          Description détaillée
        </h2>
        <div class="prose prose-sm max-w-none dark:prose-invert">
          <EditorJSRenderer :data="call.description_rich" />
        </div>
      </div>

      <!-- Conditions de participation (EditorJS) -->
      <div v-if="call.conditions" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <font-awesome-icon :icon="['fas', 'clipboard-check']" class="text-green-500" />
          Conditions de participation
        </h2>
        <div class="prose prose-sm max-w-none dark:prose-invert">
          <EditorJSRenderer :data="call.conditions" />
        </div>
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
