<script setup lang="ts">
import type { Project } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getProjectByIdAdmin,
  getAllProjectCategories,
  projectStatusLabels,
  projectStatusColors,
  projectPublicationStatusLabels,
  projectPublicationStatusColors,
  getFlagEmoji
} = useMockData()

// Données
const projectId = computed(() => route.params.id as string)
const project = computed(() => getProjectByIdAdmin(projectId.value))
const categories = computed(() => getAllProjectCategories())

// Navigation
const goBack = () => router.push('/admin/projets/liste')
const goToEdit = () => router.push(`/admin/projets/liste/${projectId.value}/edit`)

// Helpers
const getCategoryNames = (categoryIds: string[]) => {
  return categoryIds
    .map(id => categories.value.find(c => c.id === id)?.name)
    .filter(Boolean)
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatBudget = (budget: number | undefined, currency: string) => {
  if (!budget) return '-'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 0
  }).format(budget)
}

// Actions
const deleteProject = async () => {
  if (!project.value) return
  if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.value.title_fr}" ?`)) {
    console.log('Deleting project:', project.value.id)
    router.push('/admin/projets/liste')
  }
}

const togglePublish = async () => {
  if (!project.value) return
  const newStatus = project.value.publication_status === 'published' ? 'draft' : 'published'
  console.log('Changing publication status to:', newStatus)
}
</script>

<template>
  <div v-if="project" class="space-y-6">
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
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ project.title_fr }}
            </h1>
            <span v-if="project.featured" class="text-yellow-500" title="Mis en avant">
              <font-awesome-icon :icon="['fas', 'star']" class="h-5 w-5" />
            </span>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span :class="['inline-flex rounded-full px-3 py-1 text-sm font-medium', projectStatusColors[project.status]]">
              {{ projectStatusLabels[project.status] }}
            </span>
            <span :class="['inline-flex rounded-full px-3 py-1 text-sm font-medium', projectPublicationStatusColors[project.publication_status]]">
              {{ projectPublicationStatusLabels[project.publication_status] }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          @click="deleteProject"
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
            :alt="project.cover_image_alt || project.title_fr"
            class="h-64 w-full object-cover"
          />
        </div>

        <!-- Résumé -->
        <div v-if="project.summary_fr" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'align-left']" class="h-5 w-5 text-gray-400" />
            Résumé
          </h2>
          <p class="text-gray-600 dark:text-gray-300">{{ project.summary_fr }}</p>
          <div v-if="project.summary_en" class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <p class="text-sm text-gray-500">
              <span class="font-medium">EN:</span> {{ project.summary_en }}
            </p>
          </div>
        </div>

        <!-- Description détaillée -->
        <div v-if="project.description_fr" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'file-lines']" class="h-5 w-5 text-indigo-500" />
            Description détaillée
          </h2>
          <EditorJSRenderer :data="project.description_fr" />
        </div>

        <!-- Partenaires -->
        <div v-if="project.partners.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'handshake']" class="h-5 w-5 text-purple-500" />
            Partenaires ({{ project.partners.length }})
          </h2>
          <div class="space-y-4">
            <div
              v-for="partner in project.partners"
              :key="partner.id"
              class="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <img
                v-if="partner.logo"
                :src="partner.logo"
                :alt="partner.name"
                class="h-12 w-12 rounded object-contain"
              />
              <div v-else class="flex h-12 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                <font-awesome-icon :icon="['fas', 'building']" class="text-gray-400" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">{{ partner.name }}</div>
                <div v-if="partner.role" class="text-sm text-gray-500">{{ partner.role }}</div>
              </div>
              <a
                v-if="partner.website"
                :href="partner.website"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-700"
              >
                <font-awesome-icon :icon="['fas', 'external-link']" />
              </a>
            </div>
          </div>
        </div>

        <!-- Pays concernés -->
        <div v-if="project.countries.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'globe']" class="h-5 w-5 text-teal-500" />
            Pays concernés ({{ project.countries.length }})
          </h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="country in project.countries"
              :key="country.id"
              class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700"
            >
              <span v-if="country.code !== 'UN'">{{ getFlagEmoji(country.code) }}</span>
              <font-awesome-icon v-else :icon="['fas', 'globe']" class="h-3 w-3 text-gray-400" />
              {{ country.name }}
            </span>
          </div>
        </div>

        <!-- Galerie -->
        <div v-if="project.gallery && project.gallery.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'images']" class="h-5 w-5 text-pink-500" />
            Galerie ({{ project.gallery.length }})
          </h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <img
              v-for="(image, index) in project.gallery"
              :key="index"
              :src="image"
              :alt="`Image ${index + 1}`"
              class="h-32 w-full rounded-lg object-cover"
            />
          </div>
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
            <div v-if="project.website">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Site web</dt>
              <dd class="mt-1">
                <a
                  :href="project.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-blue-600 hover:underline"
                >
                  {{ project.website }}
                </a>
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
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Catégories</dt>
              <dd class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="catName in getCategoryNames(project.category_ids)"
                  :key="catName"
                  class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {{ catName }}
                </span>
              </dd>
            </div>
            <div v-if="project.department_name">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Département</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ project.department_name }}</dd>
            </div>
            <div v-if="project.manager_name">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Chef de projet</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ project.manager_name }}</dd>
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
            <div v-if="project.beneficiaries">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Bénéficiaires</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-white">{{ project.beneficiaries }}</dd>
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
            <div v-if="project.published_at">
              <dt class="font-medium text-gray-500 dark:text-gray-400">Publié le</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ formatDateTime(project.published_at) }}</dd>
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
      Le projet demandé n'existe pas ou a été supprimé.
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
