<script setup lang="ts">
import type { Project } from '~/composables/useMockData'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getAllProjects, getFeaturedProjects, getAllProjectCategories } = useMockData()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('projects')

// Chiffres-clés depuis l'admin
const { getFigure, loadKeyFigures } = useKeyFigures()

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()
  // Charger les chiffres-clés (non-bloquant)
  loadKeyFigures()
})

// SEO
useSeoMeta({
  title: () => t('projets.seo.title'),
  description: () => t('projets.seo.description')
})

// Filters
const validStatuses = ['all', 'planned', 'ongoing', 'completed', 'suspended'] as const

const route = useRoute()
const router = useRouter()

// Get categories from mock data
const categories = computed(() => getAllProjectCategories())

const getInitialCategory = () => {
  const cat = route.query.category as string
  if (cat && (cat === 'all' || categories.value.some(c => c.slug === cat))) {
    return cat
  }
  return 'all'
}

const getInitialStatus = () => {
  const status = route.query.status as string
  if (status && validStatuses.includes(status as any)) {
    return status as typeof validStatuses[number]
  }
  return 'all'
}

const selectedCategory = ref<string>(getInitialCategory())
const selectedStatus = ref<typeof validStatuses[number]>(getInitialStatus())

// Update URL when filters change
watch([selectedCategory, selectedStatus], () => {
  const query: Record<string, string> = {}
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (selectedStatus.value !== 'all') query.status = selectedStatus.value
  router.replace({ query })
})

// Data - only published projects
const allProjects = computed(() => getAllProjects().filter(p => p.publication_status === 'published'))
const featuredProjects = computed(() => getFeaturedProjects().filter(p => p.publication_status === 'published'))

// Filtered projects (non-featured only)
const filteredProjects = computed(() => {
  let projects = allProjects.value.filter(p => !p.featured)

  if (selectedCategory.value !== 'all') {
    const category = categories.value.find(c => c.slug === selectedCategory.value)
    if (category) {
      projects = projects.filter(p => p.category_ids.includes(category.id))
    }
  }

  if (selectedStatus.value !== 'all') {
    projects = projects.filter(p => p.status === selectedStatus.value)
  }

  return projects
})

// Show more functionality
const showAll = ref(false)
const visibleProjects = computed(() => {
  if (showAll.value) return filteredProjects.value
  return filteredProjects.value.slice(0, 4)
})

// Filter options - dynamic from categories
const categoryFilters = computed(() => [
  { value: 'all', label: t('projets.filters.all') },
  ...categories.value.map(c => ({ value: c.slug, label: c.name }))
])

const statusFilters = [
  { value: 'all', label: 'projets.status.all' },
  { value: 'ongoing', label: 'projets.status.ongoing' },
  { value: 'planned', label: 'projets.status.planned' },
  { value: 'completed', label: 'projets.status.completed' }
]

// Helper to get first category name from IDs
const getFirstCategoryName = (project: Project) => {
  if (!project.category_ids || project.category_ids.length === 0) return ''
  const category = categories.value.find(c => c.id === project.category_ids[0])
  return category?.name || ''
}

// Localization helpers
const getLocalizedTitle = (project: Project) => {
  if (locale.value === 'en') return project.title_en
  if (locale.value === 'ar') return project.title_ar
  return project.title_fr
}

const getLocalizedDescription = (project: Project) => {
  if (locale.value === 'en') return project.summary_en || ''
  if (locale.value === 'ar') return project.summary_ar || ''
  return project.summary_fr || ''
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { year: 'numeric' }
  )
}

// Stats - valeurs depuis l'admin avec fallback (sauf projets actifs = dynamique)
const stats = computed(() => [
  { value: allProjects.value.filter(p => p.status === 'ongoing').length, label: getContent('projects.intro.stats.projects.label', 'projets.intro.stats.projects') },
  { value: getFigure('stats_project_countries', '15+'), label: getContent('projects.intro.stats.countries.label', 'projets.intro.stats.countries') },
  { value: getFigure('stats_project_beneficiaries', '10K+'), label: getContent('projects.intro.stats.beneficiaries.label', 'projets.intro.stats.beneficiaries') }
])
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>
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
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>

    <!-- Introduction Section -->
    <section class="py-16 bg-white dark:bg-gray-950">
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

    <!-- Featured Projects -->
    <section v-if="featuredProjects.length > 0" class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4 mb-10">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ getContent('projects.featured.title', 'projets.featured.title') }}
          </h2>
          <span class="inline-block px-3 py-1 text-xs font-semibold text-brand-blue-800 bg-brand-blue-200 dark:bg-brand-blue-900/50 dark:text-brand-blue-300 rounded-full uppercase tracking-wide">
            {{ getContent('projects.featured.badge', 'projets.featured.badge') }}
          </span>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <NuxtLink
            v-for="project in featuredProjects"
            :key="project.id"
            :to="localePath(`/projets/${project.slug}`)"
            class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <!-- Image -->
            <div class="aspect-video overflow-hidden">
              <img
                :src="project.cover_image"
                :alt="getLocalizedTitle(project)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <!-- Content -->
            <div class="p-6">
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
                    'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30': project.status === 'suspended'
                  }"
                >
                  {{ t(`projets.status.${project.status}`) }}
                </span>
              </div>

              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                {{ getLocalizedTitle(project) }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {{ getLocalizedDescription(project) }}
              </p>

              <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('projets.detail.startDate') }} {{ formatDate(project.start_date) }}
                </div>
                <span class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 font-medium">
                  {{ t('projets.featured.viewProject') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- All Projects -->
    <section class="py-16 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {{ getContent('projects.list.title', 'projets.list.title') }}
        </h2>

        <!-- Filters -->
        <div class="mb-10 space-y-4">
          <!-- Category filters -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in categoryFilters"
              :key="filter.value"
              @click="selectedCategory = filter.value as any"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              :class="selectedCategory === filter.value
                ? 'bg-brand-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              {{ filter.label }}
            </button>
          </div>

          <!-- Status filters -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              @click="selectedStatus = filter.value as any"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              :class="selectedStatus === filter.value
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              {{ t(filter.label) }}
            </button>
          </div>
        </div>

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
                :src="project.cover_image"
                :alt="getLocalizedTitle(project)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
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
                    'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30': project.status === 'suspended'
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
        <div v-if="filteredProjects.length > 4" class="text-center mt-10">
          <button
            @click="showAll = !showAll"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
