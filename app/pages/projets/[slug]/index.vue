<script setup lang="ts">
import type { ProjectCallRead } from '~/types/api'
import type { ProjectPublicDisplay } from '~/composables/usePublicProjectsApi'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  getProjectBySlug,
  formatDate,
  formatBudget,
  projectCallStatusLabels,
} = usePublicProjectsApi()

// ============================================================================
// État
// ============================================================================

const isLoading = ref(true)
const error = ref<string | null>(null)
const project = ref<ProjectPublicDisplay | null>(null)

// Get the project slug
const slug = computed(() => route.params.slug as string)

// Active tab from hash (default to 'presentation')
const activeTab = ref('presentation')

// Watch route hash changes
const updateTabFromHash = () => {
  const hash = route.hash?.replace('#', '') || 'presentation'
  const validTabs = ['presentation', 'appels', 'actualites', 'partenaires', 'mediatheque']
  activeTab.value = validTabs.includes(hash) ? hash : 'presentation'
}

// ============================================================================
// Chargement des données
// ============================================================================

async function loadProject() {
  isLoading.value = true
  error.value = null

  try {
    const data = await getProjectBySlug(slug.value)
    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      })
    }
    project.value = data
  }
  catch (err: unknown) {
    const fetchError = err as { statusCode?: number }
    if (fetchError.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      })
    }
    console.error('Erreur lors du chargement du projet:', err)
    error.value = 'Une erreur est survenue lors du chargement du projet.'
  }
  finally {
    isLoading.value = false
  }
}

// Initialize and watch for hash changes
onMounted(async () => {
  updateTabFromHash()
  await loadProject()
})

watch(() => route.hash, () => {
  updateTabFromHash()
})

// ============================================================================
// Computed & Helpers
// ============================================================================

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!project.value) return ''
  // Le backend utilise un seul titre (pas de multilangue pour l'instant)
  return project.value.title
})

const getLocalizedDescription = computed(() => {
  if (!project.value) return ''
  return project.value.description || project.value.summary || ''
})

const getLocalizedSummary = computed(() => {
  if (!project.value) return ''
  return project.value.summary || ''
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('projets.hero.title')}`,
  description: () => getLocalizedSummary.value,
  ogImage: () => project.value?.cover_image || 'https://picsum.photos/seed/og-project/1200/630',
})

// First category name
const firstCategoryName = computed(() => {
  if (!project.value?.categories || project.value.categories.length === 0) return ''
  return project.value.categories[0]?.name || ''
})

// Calls for this project (ongoing + upcoming)
const projectCalls = computed(() => {
  // Note: Le backend devrait retourner les appels avec le projet via get_public_project_by_slug
  // Pour l'instant, on simule une liste vide car le type ProjectReadWithRelations ne contient pas les calls
  return [] as ProjectCallRead[]
})

const openCalls = computed(() =>
  projectCalls.value.filter(c => c.status === 'ongoing' || c.status === 'upcoming'),
)

// Format deadline
const formatDeadline = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' },
  )
}

// Period string
const periodString = computed(() => {
  if (!project.value) return ''
  const start = formatDate(project.value.start_date, locale.value)
  if (project.value.end_date) {
    return `${start} - ${formatDate(project.value.end_date, locale.value)}`
  }
  return `${start} - ${t('projets.detail.ongoing')}`
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('projets.hero.title'), to: '/projets' },
  { label: getLocalizedTitle.value },
])
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center py-12 px-4">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-400 mb-4" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('common.error') }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
        <button
          class="px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 transition-colors"
          @click="loadProject"
        >
          {{ t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="project">
      <!-- Hero Section -->
      <PageHero
        :title="getLocalizedTitle"
        :subtitle="firstCategoryName"
        image="/images/bg/backgroud_senghor2.jpg"
        :breadcrumb="breadcrumb"
      />

      <!-- Tabs Navigation -->
      <ProjetTabs :active-tab="activeTab" />

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-12">
          <!-- Main content -->
          <article class="lg:w-2/3">
            <!-- Tab: Présentation -->
            <div v-if="activeTab === 'presentation'" class="py-8">
              <!-- Cover Image with badges -->
              <div class="mb-8">
                <div class="relative h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    :src="project.cover_image || 'https://picsum.photos/seed/project/1200/600'"
                    :alt="getLocalizedTitle"
                    class="w-full h-full object-cover"
                  >
                  <!-- Gradient overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <!-- Badges on image -->
                  <div class="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                    <!-- Category badge -->
                    <span
                      v-if="firstCategoryName"
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full shadow-lg backdrop-blur-sm"
                    >
                      {{ firstCategoryName }}
                    </span>

                    <!-- Status badge -->
                    <span
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full shadow-lg backdrop-blur-sm"
                      :class="{
                        'bg-green-600 text-white': project.status === 'ongoing',
                        'bg-blue-600 text-white': project.status === 'completed',
                        'bg-yellow-600 text-white': project.status === 'planned',
                        'bg-red-600 text-white': project.status === 'suspended',
                      }"
                    >
                      {{ t(`projets.status.${project.status}`) }}
                    </span>
                  </div>
                </div>

                <!-- Description -->
                <p class="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ getLocalizedSummary }}
                </p>
              </div>

              <!-- Info cards -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <!-- Period -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
                    {{ t('projets.detail.period') }}
                  </div>
                  <div class="font-bold text-gray-900 dark:text-white text-sm">
                    {{ periodString }}
                  </div>
                </div>

                <!-- Budget -->
                <div v-if="project.budget" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <font-awesome-icon icon="fa-solid fa-euro-sign" class="w-4 h-4" />
                    {{ t('projets.detail.budget') }}
                  </div>
                  <div class="font-bold text-gray-900 dark:text-white text-sm">
                    {{ formatBudget(project.budget, project.currency) }}
                  </div>
                </div>

                <!-- Beneficiaries -->
                <div v-if="project.beneficiaries" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <font-awesome-icon icon="fa-solid fa-users" class="w-4 h-4" />
                    {{ t('projets.detail.beneficiaries') }}
                  </div>
                  <div class="font-bold text-gray-900 dark:text-white text-sm">
                    {{ project.beneficiaries }}
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div v-if="project.description" class="prose prose-lg dark:prose-invert max-w-none mb-8">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {{ project.description }}
                </p>
              </div>
            </div>

            <!-- Tab: Appels -->
            <div v-if="activeTab === 'appels'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-brand-blue-500" />
                {{ t('projets.appels.title') }}
              </h2>

              <!-- Empty state -->
              <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-inbox" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.appels.noAppels') }}</p>
              </div>
            </div>

            <!-- Tab: Actualités -->
            <div v-if="activeTab === 'actualites'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="text-brand-blue-500" />
                {{ t('projets.actualites.title') }}
              </h2>

              <!-- Empty state -->
              <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.actualites.noActualites') }}</p>
              </div>
            </div>

            <!-- Tab: Partenaires -->
            <div v-if="activeTab === 'partenaires'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-handshake" class="text-brand-blue-500" />
                {{ t('projets.detail.partners') }}
              </h2>

              <!-- Empty state -->
              <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-handshake" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.partenaires.noPartenaires') }}</p>
              </div>
            </div>

            <!-- Tab: Médiathèque -->
            <div v-if="activeTab === 'mediatheque'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-photo-film" class="text-brand-blue-500" />
                {{ t('projets.mediatheque.title') }}
              </h2>

              <!-- Empty state -->
              <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-photo-film" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.mediatheque.noMedia') }}</p>
              </div>
            </div>

            <!-- Back button -->
            <div class="pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
              <NuxtLink
                :to="localePath('/projets')"
                class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
                {{ t('projets.detail.back') }}
              </NuxtLink>
            </div>
          </article>

          <!-- Sidebar -->
          <aside class="lg:w-1/3">
            <div class="sticky top-32 space-y-6">
              <!-- Project summary card -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {{ getLocalizedTitle }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {{ getLocalizedSummary }}
                </p>
                <div class="space-y-3 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.filters.status') }}</span>
                    <span
                      class="font-medium"
                      :class="{
                        'text-green-600 dark:text-green-400': project.status === 'ongoing',
                        'text-blue-600 dark:text-blue-400': project.status === 'completed',
                        'text-yellow-600 dark:text-yellow-400': project.status === 'planned',
                        'text-red-600 dark:text-red-400': project.status === 'suspended',
                      }"
                    >
                      {{ t(`projets.status.${project.status}`) }}
                    </span>
                  </div>
                  <div v-if="firstCategoryName" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.filters.category') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ firstCategoryName }}
                    </span>
                  </div>
                  <div v-if="project.beneficiaries" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.detail.beneficiaries') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ project.beneficiaries }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Open Calls -->
              <div
                v-if="openCalls.length > 0"
                class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-4 h-4 text-brand-blue-600" />
                    {{ t('projets.appels.title') }}
                  </h3>
                  <NuxtLink
                    :to="{ hash: '#appels' }"
                    class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
                  >
                    {{ t('projets.list.showMore') }}
                  </NuxtLink>
                </div>
                <div class="space-y-3">
                  <div
                    v-for="call in openCalls.slice(0, 2)"
                    :key="call.id"
                    class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {{ call.title }}
                      </h4>
                      <span class="flex-shrink-0 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        {{ projectCallStatusLabels[call.status] }}
                      </span>
                    </div>
                    <p v-if="call.deadline" class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                      {{ t('projets.appels.deadline') }}: {{ formatDeadline(call.deadline) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quick navigation -->
              <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {{ t('projets.list.title') }}
                </h3>
                <NuxtLink
                  :to="localePath('/projets')"
                  class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
                >
                  {{ t('projets.detail.back') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
