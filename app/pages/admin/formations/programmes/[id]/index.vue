<script setup lang="ts">
import type { Formation } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  formations,
  getDepartmentById,
  getSkillsByProgram,
  getCareerOpportunitiesByProgram
} = useMockData()

// Récupérer le programme
const program = computed(() => {
  return formations.value.find(f => f.id === route.params.id)
})

// Rediriger si le programme n'existe pas
watchEffect(() => {
  if (!program.value && route.params.id) {
    router.replace('/admin/formations/programmes')
  }
})

// Compétences et débouchés
const skills = computed(() => program.value ? getSkillsByProgram(program.value.id) : [])
const careerOpportunities = computed(() => program.value ? getCareerOpportunitiesByProgram(program.value.id) : [])

// Modal suppression
const showDeleteModal = ref(false)

const confirmDelete = () => {
  if (!program.value) return
  console.log('Deleting program:', program.value.id)
  // En production: DELETE /api/admin/programs/{id}
  router.push('/admin/formations/programmes')
}

// Utilitaires
const getTypeLabel = (type: Formation['formation_type']) => {
  const labels = {
    master: 'Master',
    doctorat: 'Doctorat',
    du: 'DU',
    certifiante: 'Certificat'
  }
  return labels[type] || type
}

const getTypeColor = (type: Formation['formation_type']) => {
  const colors = {
    master: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    doctorat: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    du: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    certifiante: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  }
  return colors[type] || colors.master
}

const getCampusLabel = (campus: Formation['campus']) => {
  const labels = {
    alexandrie: 'Alexandrie',
    externalise: 'Externalisé',
    en_ligne: 'En ligne'
  }
  return labels[campus] || campus
}

const getCampusColor = (campus: Formation['campus']) => {
  const colors = {
    alexandrie: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    externalise: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    en_ligne: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
  }
  return colors[campus] || colors.alexandrie
}

// Actions rapides
const togglePublished = () => {
  if (!program.value) return
  console.log('Toggle published:', program.value.id, !program.value.is_published)
  // En production: PATCH /api/admin/programs/{id} { is_published: !current }
}

const toggleFeatured = () => {
  if (!program.value) return
  console.log('Toggle featured:', program.value.id, !program.value.is_featured)
  // En production: PATCH /api/admin/programs/{id} { is_featured: !current }
}

const toggleApplicationOpen = () => {
  if (!program.value) return
  console.log('Toggle application_open:', program.value.id, !program.value.application_open)
  // En production: PATCH /api/admin/programs/{id} { application_open: !current }
}

const duplicateProgram = () => {
  if (!program.value) return
  console.log('Duplicating program:', program.value.id)
  // En production: POST /api/admin/programs/{id}/duplicate
  // Puis rediriger vers la page d'édition du nouveau programme
}
</script>

<template>
  <div v-if="program" class="space-y-6">
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
            <span class="text-gray-900 dark:text-white">{{ program.title_fr }}</span>
          </nav>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {{ program.title_fr }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          title="Dupliquer"
          @click="duplicateProgram"
        >
          <font-awesome-icon icon="fa-solid fa-copy" class="w-4 h-4" />
          <span class="hidden sm:inline">Dupliquer</span>
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
          title="Supprimer"
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
          <div
            v-if="program.image"
            class="h-64 w-full bg-cover bg-center"
            :style="{ backgroundImage: `url(${program.image})` }"
          ></div>
          <div v-else class="flex h-48 w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-16 h-16 text-gray-300 dark:text-gray-500" />
          </div>

          <div class="p-6">
            <!-- Badges -->
            <div class="mb-4 flex flex-wrap gap-2">
              <span :class="getTypeColor(program.formation_type)" class="rounded-full px-3 py-1 text-sm font-medium">
                {{ getTypeLabel(program.formation_type) }}
              </span>
              <span :class="getCampusColor(program.campus)" class="rounded-full px-3 py-1 text-sm font-medium">
                {{ getCampusLabel(program.campus) }}
              </span>
              <span
                :class="program.is_published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'"
                class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
              >
                <span class="h-2 w-2 rounded-full" :class="program.is_published ? 'bg-green-500' : 'bg-yellow-500'"></span>
                {{ program.is_published ? 'Publié' : 'Brouillon' }}
              </span>
              <span
                v-if="program.is_featured"
                class="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              >
                <font-awesome-icon icon="fa-solid fa-star" class="w-3 h-3" />
                Mis en avant
              </span>
              <span
                v-if="program.application_open"
                class="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400"
              >
                <font-awesome-icon icon="fa-solid fa-door-open" class="w-3 h-3" />
                Candidatures ouvertes
              </span>
            </div>

            <!-- Titre anglais -->
            <p v-if="program.title_en" class="mb-4 text-lg italic text-gray-500 dark:text-gray-400">
              {{ program.title_en }}
            </p>

            <!-- Description -->
            <div class="prose prose-gray max-w-none dark:prose-invert">
              <p class="text-gray-600 dark:text-gray-300">
                {{ program.short_description_fr }}
              </p>
              <p v-if="program.short_description_en" class="mt-4 text-sm italic text-gray-500 dark:text-gray-400">
                {{ program.short_description_en }}
              </p>
            </div>
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
            <NuxtLink
              to="/admin/formations/competences"
              class="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Gérer les compétences
            </NuxtLink>
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
            <NuxtLink
              to="/admin/formations/debouches"
              class="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Gérer les débouchés
            </NuxtLink>
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
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Département</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {{ getDepartmentById(program.department_id)?.name_fr || '-' }}
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Durée</dt>
              <dd class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {{ program.duration_fr || '-' }}
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
                {{ program.diploma_fr || '-' }}
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
              class="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors"
              :class="program.is_published
                ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'"
              @click="togglePublished"
            >
              <span class="flex items-center gap-2">
                <font-awesome-icon :icon="program.is_published ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'" class="w-4 h-4" />
                {{ program.is_published ? 'Publié' : 'Non publié' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Cliquer pour {{ program.is_published ? 'dépublier' : 'publier' }}
              </span>
            </button>

            <button
              class="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors"
              :class="program.is_featured
                ? 'border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'"
              @click="toggleFeatured"
            >
              <span class="flex items-center gap-2">
                <font-awesome-icon :icon="program.is_featured ? 'fa-solid fa-star' : 'fa-regular fa-star'" class="w-4 h-4" />
                {{ program.is_featured ? 'Mis en avant' : 'Non mis en avant' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Cliquer pour {{ program.is_featured ? 'retirer' : 'mettre en avant' }}
              </span>
            </button>

            <button
              class="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors"
              :class="program.application_open
                ? 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700'"
              @click="toggleApplicationOpen"
            >
              <span class="flex items-center gap-2">
                <font-awesome-icon :icon="program.application_open ? 'fa-solid fa-door-open' : 'fa-solid fa-door-closed'" class="w-4 h-4" />
                {{ program.application_open ? 'Candidatures ouvertes' : 'Candidatures fermées' }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                Cliquer pour {{ program.application_open ? 'fermer' : 'ouvrir' }}
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
            {{ program.title_fr }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
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

  <!-- État de chargement / non trouvé -->
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
