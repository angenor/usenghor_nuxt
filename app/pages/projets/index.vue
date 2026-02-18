<script setup lang="ts">
import type { ProjectCategoryRead, ProjectStatus } from '~/types/api'
import type { ProjectPublicDisplay } from '~/composables/usePublicProjectsApi'

const { t } = useI18n()
const localePath = useLocalePath()
const {
  listProjects,
  getCategories,
} = usePublicProjectsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(project: ProjectPublicDisplay, variant: 'low' | 'medium' | 'original' = 'low'): string | null {
  if ((project as any).cover_image_external_id) {
    const originalUrl = getMediaUrl((project as any).cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : null
  }
  return project.cover_image || null
}

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('projects')

// Chiffres-clés depuis l'admin
const { getFigure, loadKeyFigures } = useKeyFigures()

// SEO
useSeoMeta({
  title: () => t('projets.seo.title'),
  description: () => t('projets.seo.description'),
})

// ============================================================================
// État
// ============================================================================

const isLoading = ref(true)
const error = ref<string | null>(null)
const projects = ref<ProjectPublicDisplay[]>([])
const categories = ref<ProjectCategoryRead[]>([])
const totalProjects = ref(0)

// Filters
const validStatuses = ['all', 'planned', 'ongoing', 'completed', 'suspended'] as const

const route = useRoute()
const router = useRouter()

const getInitialCategory = () => {
  const cat = route.query.category as string
  if (cat && (cat === 'all' || categories.value.some(c => c.slug === cat))) {
    return cat
  }
  return 'all'
}

const getInitialStatus = () => {
  const status = route.query.status as string
  if (status && validStatuses.includes(status as typeof validStatuses[number])) {
    return status as typeof validStatuses[number]
  }
  return 'all'
}

const selectedCategory = ref<string>('all')
const selectedStatus = ref<typeof validStatuses[number]>('all')

// Update URL when filters change
watch([selectedCategory, selectedStatus], () => {
  const query: Record<string, string> = {}
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (selectedStatus.value !== 'all') query.status = selectedStatus.value
  router.replace({ query })
})

// ============================================================================
// Chargement des données
// ============================================================================

async function loadData() {
  isLoading.value = true
  error.value = null

  try {
    // Charger les catégories d'abord
    categories.value = await getCategories()

    // Initialiser les filtres depuis l'URL après chargement des catégories
    selectedCategory.value = getInitialCategory()
    selectedStatus.value = getInitialStatus()

    // Charger tous les projets
    const response = await listProjects({
      page: 1,
      limit: 100,
      status: selectedStatus.value !== 'all' ? selectedStatus.value as ProjectStatus : undefined,
      category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    })

    projects.value = response.items
    totalProjects.value = response.total
  }
  catch (err) {
    console.error('Erreur lors du chargement des projets:', err)
    error.value = 'Une erreur est survenue lors du chargement des projets.'
  }
  finally {
    isLoading.value = false
  }
}

// Recharger quand les filtres changent
watch([selectedCategory, selectedStatus], async () => {
  await loadData()
}, { immediate: false })

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-projects', () => loadContent())

onMounted(async () => {
  // Charger les chiffres-clés (non-bloquant)
  loadKeyFigures()
  // Charger les données
  await loadData()
})

// ============================================================================
// Computed & Helpers
// ============================================================================

// Show more functionality
const showAll = ref(false)
const visibleProjects = computed(() => {
  if (showAll.value) return projects.value
  return projects.value.slice(0, 4)
})

// Helper to get first category name
const getFirstCategoryName = (project: ProjectPublicDisplay) => {
  if (!project.categories || project.categories.length === 0) return ''
  return project.categories[0]?.name || ''
}

// Localization helpers
const getLocalizedTitle = (project: ProjectPublicDisplay) => {
  // Le backend renvoie un seul titre, pas de multilangue pour l'instant
  return project.title
}

const getLocalizedDescription = (project: ProjectPublicDisplay) => {
  return project.summary || ''
}

// Stats - valeurs depuis l'admin avec fallback
const stats = computed(() => [
  {
    value: projects.value.filter(p => p.status === 'ongoing').length,
    label: getContent('projects.intro.stats.projects.label', 'projets.intro.stats.projects'),
  },
  {
    value: getFigure('stats_project_countries', '15+'),
    label: getContent('projects.intro.stats.countries.label', 'projets.intro.stats.countries'),
  },
  {
    value: getFigure('stats_project_beneficiaries', '10K+'),
    label: getContent('projects.intro.stats.beneficiaries.label', 'projets.intro.stats.beneficiaries'),
  },
])
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <span class="inline-block px-4 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full mb-6">
            {{ getContent('projects.hero.badge', 'projets.hero.badge') }}
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ getContent('projects.hero.title', 'projets.hero.title') }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            {{ getContent('projects.hero.subtitle', 'projets.hero.subtitle') }}
          </p>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <svg class="w-full h-12 md:h-16 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
        </svg>
      </div>
    </section>

    <!-- Introduction Section -->
    <section class="py-16 bg-white dark:bg-gray-950 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ getContent('projects.intro.title', 'projets.intro.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            {{ getContent('projects.intro.description', 'projets.intro.description') }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-bold text-brand-blue-600 dark:text-brand-blue-400 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading state -->
    <section v-if="isLoading" class="py-16 bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600" />
        </div>
      </div>
    </section>

    <!-- Error state -->
    <section v-else-if="error" class="py-16 bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-400 mb-4" />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('common.error') }}</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
          <button
            class="px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 transition-colors"
            @click="loadData"
          >
            {{ t('common.retry') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <template v-else>
      <!-- All Projects -->
      <section class="py-16 bg-white dark:bg-gray-950 bg-grid-pattern">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {{ getContent('projects.list.title', 'projets.list.title') }}
          </h2>

          <!-- Projects Grid -->
          <div v-if="visibleProjects.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NuxtLink
              v-for="project in visibleProjects"
              :key="project.id"
              :to="localePath(`/projets/${project.slug}`)"
              class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div class="aspect-video overflow-hidden">
                <img
                  v-if="getCoverImageUrl(project)"
                  :src="getCoverImageUrl(project)!"
                  :alt="getLocalizedTitle(project)"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                >
                <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-diagram-project" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div class="p-5">
                <div class="flex items-center gap-2 mb-3">
                  <span v-if="getFirstCategoryName(project)" class="inline-block px-2 py-0.5 text-xs font-medium text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded">
                    {{ getFirstCategoryName(project) }}
                  </span>
                  <span
                    class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                    :class="{
                      'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30': project.status === 'ongoing',
                      'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30': project.status === 'completed',
                      'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30': project.status === 'planned',
                      'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30': project.status === 'suspended',
                    }"
                  >
                    {{ t(`projets.status.${project.status}`) }}
                  </span>
                </div>

                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors line-clamp-2">
                  {{ getLocalizedTitle(project) }}
                </h3>

                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {{ getLocalizedDescription(project) }}
                </p>
              </div>
            </NuxtLink>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-folder-open" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('projets.empty.title') }}</h3>
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('projets.empty.description') }}
            </p>
          </div>

          <!-- Show more button -->
          <div v-if="projects.length > 4" class="text-center mt-10">
            <button
              class="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              @click="showAll = !showAll"
            >
              {{ showAll ? t('projets.list.showLess') : t('projets.list.showMore') }}
              <font-awesome-icon
                :icon="showAll ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>
      </section>
    </template>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-brand-blue-500 to-brand-blue-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ getContent('projects.cta.title', 'projets.cta.title') }}
        </h2>
        <p class="text-lg text-brand-blue-100 mb-8">
          {{ getContent('projects.cta.description', 'projets.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/contact')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue-600 font-semibold rounded-lg hover:bg-brand-blue-50 transition-colors shadow-lg"
        >
          {{ getContent('projects.cta.button', 'projets.cta.button') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
