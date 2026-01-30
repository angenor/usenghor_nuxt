<script setup lang="ts">
import type { ProgramWithDetails } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProgramById,
  deleteProgram,
  toggleProgramStatus,
  duplicateProgram,
  programTypeLabels,
  programTypeColors,
  publicationStatusLabels,
  formatDuration,
  isPublished,
} = useProgramsApi()

// États
const loading = ref(true)
const actionLoading = ref(false)
const program = ref<ProgramWithDetails | null>(null)

// Chargement du programme
async function loadProgram() {
  loading.value = true
  try {
    program.value = await getProgramById(route.params.id as string)
  } catch (e) {
    console.error('Erreur lors du chargement du programme:', e)
    alert('Programme non trouvé')
    router.replace('/admin/formations/programmes')
  } finally {
    loading.value = false
  }
}

onMounted(loadProgram)

// Compétences et débouchés (inclus dans ProgramWithDetails)
const skills = computed(() => program.value?.skills || [])
const careerOpportunities = computed(() => program.value?.career_opportunities || [])

// Modal suppression
const showDeleteModal = ref(false)

async function confirmDelete() {
  if (!program.value) return
  actionLoading.value = true
  try {
    await deleteProgram(program.value.id)
    router.push('/admin/formations/programmes')
  } catch (e) {
    console.error('Erreur lors de la suppression:', e)
    alert('Impossible de supprimer le programme')
  } finally {
    actionLoading.value = false
    showDeleteModal.value = false
  }
}

// Toggle publication
async function togglePublished() {
  if (!program.value) return
  actionLoading.value = true
  try {
    const updated = await toggleProgramStatus(program.value.id)
    program.value = { ...program.value, status: updated.status }
  } catch (e) {
    console.error('Erreur lors du changement de statut:', e)
    alert('Impossible de modifier le statut')
  } finally {
    actionLoading.value = false
  }
}

// Duplication
const showDuplicateModal = ref(false)
const duplicateForm = ref({
  new_code: '',
  new_title: '',
  new_slug: '',
})

function openDuplicateModal() {
  if (!program.value) return
  duplicateForm.value = {
    new_code: `${program.value.code}-COPY`,
    new_title: `${program.value.title} (copie)`,
    new_slug: `${program.value.slug}-copie`,
  }
  showDuplicateModal.value = true
}

async function confirmDuplicate() {
  if (!program.value) return
  actionLoading.value = true
  try {
    const result = await duplicateProgram(program.value.id, duplicateForm.value)
    router.push(`/admin/formations/programmes/${result.id}/edit`)
  } catch (e) {
    console.error('Erreur lors de la duplication:', e)
    alert('Impossible de dupliquer le programme')
  } finally {
    actionLoading.value = false
    showDuplicateModal.value = false
  }
}

// Utilitaires
function getStatusColor(published: boolean) {
  return published
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
}
</script>

<template>
  <!-- État de chargement -->
  <div v-if="loading" class="flex items-center justify-center py-12">
    <div class="text-center">
      <font-awesome-icon icon="fa-solid fa-spinner" class="w-8 h-8 animate-spin text-blue-600" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Chargement du programme...</p>
    </div>
  </div>

  <div v-else-if="program" class="space-y-6">
    <!-- Breadcrumb & Actions -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/admin/formations/programmes"
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <NuxtLink to="/admin/formations/programmes" class="hover:text-blue-600 dark:hover:text-blue-400">
              Programmes
            </NuxtLink>
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3" />
            <span class="text-gray-900 dark:text-white">{{ program.title }}</span>
          </nav>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {{ program.title }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          title="Dupliquer"
          :disabled="actionLoading"
          @click="openDuplicateModal"
        >
          <font-awesome-icon icon="fa-solid fa-copy" class="w-4 h-4" />
          <span class="hidden sm:inline">Dupliquer</span>
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
          title="Supprimer"
          :disabled="actionLoading"
          @click="showDeleteModal = true"
        >
          <font-awesome-icon icon="fa-solid fa-trash" class="w-4 h-4" />
          <span class="hidden sm:inline">Supprimer</span>
        </button>
        <NuxtLink
          :to="`/admin/formations/programmes/${program.id}/edit`"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <font-awesome-icon icon="fa-solid fa-pen" class="w-4 h-4" />
          Modifier
        </NuxtLink>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Colonne principale (2/3) -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Image & Info -->
        <div class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div class="flex h-48 w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-16 h-16 text-gray-300 dark:text-gray-500" />
          </div>

          <div class="p-6">
            <!-- Badges -->
            <div class="mb-4 flex flex-wrap gap-2">
              <span :class="programTypeColors[program.type]" class="rounded-full px-3 py-1 text-sm font-medium">
                {{ programTypeLabels[program.type] }}
              </span>
              <span
                :class="getStatusColor(isPublished(program.status))"
                class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
              >
                <span class="h-2 w-2 rounded-full" :class="isPublished(program.status) ? 'bg-green-500' : 'bg-yellow-500'"></span>
                {{ publicationStatusLabels[program.status] }}
              </span>
            </div>

            <!-- Sous-titre -->
            <p v-if="program.subtitle" class="mb-4 text-lg text-gray-600 dark:text-gray-300">
              {{ program.subtitle }}
            </p>

            <!-- Description -->
            <div v-if="program.description" class="prose prose-gray max-w-none dark:prose-invert">
              <p class="text-gray-600 dark:text-gray-300">
                {{ program.description }}
              </p>
            </div>
            <p v-else class="text-sm italic text-gray-400 dark:text-gray-500">
              Aucune description
            </p>
          </div>
        </div>

        <!-- Compétences -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-star" class="w-5 h-5 text-yellow-500" />
              Compétences acquises
              <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {{ skills.length }}
              </span>
            </h2>
          </div>

          <div v-if="skills.length > 0" class="space-y-3">
            <div
              v-for="(skill, index) in skills"
              :key="skill.id"
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <div class="flex items-start gap-3">
                <span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {{ index + 1 }}
                </span>
                <div>
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ skill.title }}
                  </h3>
                  <p v-if="skill.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ skill.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-center text-sm italic text-gray-400 dark:text-gray-500">
            Aucune compétence définie pour ce programme.
          </p>
        </div>

        <!-- Débouchés -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-briefcase" class="w-5 h-5 text-blue-500" />
              Débouchés professionnels
              <span class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {{ careerOpportunities.length }}
              </span>
            </h2>
          </div>

          <div v-if="careerOpportunities.length > 0" class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="career in careerOpportunities"
              :key="career.id"
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
            >
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ career.title }}
              </h3>
              <p v-if="career.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ career.description }}
              </p>
            </div>
          </div>
          <p v-else class="text-center text-sm italic text-gray-400 dark:text-gray-500">
            Aucun débouché défini pour ce programme.
          </p>
        </div>

        <!-- Méthodes d'enseignement -->
        <div v-if="program.teaching_methods" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon icon="fa-solid fa-chalkboard-teacher" class="w-5 h-5 text-indigo-500" />
            Méthodes d'enseignement
          </h2>
          <div class="prose prose-gray max-w-none dark:prose-invert">
            <p class="text-gray-600 dark:text-gray-300">
              {{ program.teaching_methods }}
            </p>
          </div>
        </div>
      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-6">
        <!-- Informations -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informations
          </h2>

          <dl class="space-y-4">
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Code</dt>
              <dd class="mt-1 font-mono text-sm font-medium text-gray-900 dark:text-white">
                {{ program.code }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Durée</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDuration(program.duration_months) }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Crédits ECTS</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {{ program.credits || '-' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Diplôme délivré</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {{ program.degree_awarded || '-' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Diplôme requis</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {{ program.required_degree || '-' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Slug</dt>
              <dd class="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">
                {{ program.slug }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">ID</dt>
              <dd class="mt-1 font-mono text-xs text-gray-500 dark:text-gray-500">
                {{ program.id }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Actions rapides -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Actions rapides
          </h2>

          <div class="space-y-3">
            <button
              class="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors disabled:opacity-50"
              :class="isPublished(program.status)
                ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'"
              :disabled="actionLoading"
              @click="togglePublished"
            >
              <span class="flex items-center gap-2">
                <font-awesome-icon :icon="isPublished(program.status) ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'" class="w-4 h-4" />
                {{ isPublished(program.status) ? 'Publié' : 'Non publié' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Cliquer pour {{ isPublished(program.status) ? 'dépublier' : 'publier' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Liens rapides -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Liens
          </h2>

          <div class="space-y-2">
            <NuxtLink
              :to="`/formations/${program.slug}`"
              target="_blank"
              class="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <font-awesome-icon icon="fa-solid fa-external-link-alt" class="w-4 h-4" />
              Voir sur le site public
            </NuxtLink>
            <NuxtLink
              :to="`/admin/formations/programmes/${program.id}/edit`"
              class="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <font-awesome-icon icon="fa-solid fa-pen" class="w-4 h-4" />
              Modifier ce programme
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDeleteModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer le programme
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible.
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ program.title }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="actionLoading"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="actionLoading"
              @click="confirmDelete"
            >
              <font-awesome-icon v-if="actionLoading" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Duplication -->
    <Teleport to="body">
      <div
        v-if="showDuplicateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="showDuplicateModal = false"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <font-awesome-icon icon="fa-solid fa-copy" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Dupliquer le programme
            </h3>
          </div>

          <div class="mb-6 space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveau code
              </label>
              <input
                v-model="duplicateForm.new_code"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveau titre
              </label>
              <input
                v-model="duplicateForm.new_title"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveau slug
              </label>
              <input
                v-model="duplicateForm.new_slug"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="actionLoading"
              @click="showDuplicateModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              :disabled="actionLoading"
              @click="confirmDuplicate"
            >
              <font-awesome-icon v-if="actionLoading" icon="fa-solid fa-spinner" class="w-4 h-4 animate-spin" />
              Dupliquer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- État non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-12">
    <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
      <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
      Programme non trouvé
    </h3>
    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
      Ce programme n'existe pas ou a été supprimé.
    </p>
    <NuxtLink
      to="/admin/formations/programmes"
      class="text-sm text-blue-600 hover:underline dark:text-blue-400"
    >
      Retour à la liste des programmes
    </NuxtLink>
  </div>
</template>
