<script setup lang="ts">
import type { Project } from '~/composables/useMockData'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getAllProjects, getFeaturedProjects } = useMockData()

// SEO
useSeoMeta({
  title: () => t('projets.seo.title'),
  description: () => t('projets.seo.description')
})

// Filters
const validCategories = ['all', 'education', 'culture', 'entrepreneuriat', 'recherche', 'numerique'] as const
const validStatuses = ['all', 'active', 'completed', 'upcoming'] as const

const route = useRoute()
const router = useRouter()

const getInitialCategory = () => {
  const cat = route.query.category as string
  if (cat && validCategories.includes(cat as any)) {
    return cat as typeof validCategories[number]
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

const selectedCategory = ref<typeof validCategories[number]>(getInitialCategory())
const selectedStatus = ref<typeof validStatuses[number]>(getInitialStatus())

// Update URL when filters change
watch([selectedCategory, selectedStatus], () => {
  const query: Record<string, string> = {}
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (selectedStatus.value !== 'all') query.status = selectedStatus.value
  router.replace({ query })
})

// Data
const allProjects = computed(() => getAllProjects())
const featuredProjects = computed(() => getFeaturedProjects())

// Filtered projects (non-featured only)
const filteredProjects = computed(() => {
  let projects = allProjects.value.filter(p => !p.featured)

  if (selectedCategory.value !== 'all') {
    projects = projects.filter(p => p.category === selectedCategory.value)
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

// Filter options
const categoryFilters = [
  { value: 'all', label: 'projets.filters.all' },
  { value: 'education', label: 'projets.categories.education' },
  { value: 'culture', label: 'projets.categories.culture' },
  { value: 'entrepreneuriat', label: 'projets.categories.entrepreneuriat' },
  { value: 'recherche', label: 'projets.categories.recherche' },
  { value: 'numerique', label: 'projets.categories.numerique' }
]

const statusFilters = [
  { value: 'all', label: 'projets.status.all' },
  { value: 'active', label: 'projets.status.active' },
  { value: 'completed', label: 'projets.status.completed' },
  { value: 'upcoming', label: 'projets.status.upcoming' }
]

// Localization helpers
const getLocalizedTitle = (project: Project) => {
  if (locale.value === 'en') return project.title_en
  if (locale.value === 'ar') return project.title_ar
  return project.title_fr
}

const getLocalizedDescription = (project: Project) => {
  if (locale.value === 'en') return project.description_en
  if (locale.value === 'ar') return project.description_ar
  return project.description_fr
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { year: 'numeric' }
  )
}

// Stats
const stats = computed(() => [
  { value: allProjects.value.filter(p => p.status === 'active').length, label: t('projets.intro.stats.projects') },
  { value: '15+', label: t('projets.intro.stats.countries') },
  { value: '10K+', label: t('projets.intro.stats.beneficiaries') }
])
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div class="absolute inset-0 opacity-10 heropattern-topography-amber-500"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <span class="inline-block px-4 py-1.5 text-sm font-semibold text-amber-900 bg-amber-400 rounded-full mb-6">
            {{ t('projets.hero.badge') }}
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ t('projets.hero.title') }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            {{ t('projets.hero.subtitle') }}
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
            {{ t('projets.intro.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            {{ t('projets.intro.description') }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">
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
            {{ t('projets.featured.title') }}
          </h2>
          <span class="inline-block px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 rounded-full uppercase tracking-wide">
            {{ t('projets.featured.badge') }}
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
                :src="project.image"
                :alt="getLocalizedTitle(project)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <!-- Content -->
            <div class="p-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-block px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded">
                  {{ t(`projets.categories.${project.category}`) }}
                </span>
                <span
                  class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                  :class="{
                    'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30': project.status === 'active',
                    'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700': project.status === 'completed',
                    'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30': project.status === 'upcoming'
                  }"
                >
                  {{ t(`projets.status.${project.status}`) }}
                </span>
              </div>

              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {{ getLocalizedTitle(project) }}
              </h3>

              <p class="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {{ getLocalizedDescription(project) }}
              </p>

              <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('projets.detail.startDate') }} {{ formatDate(project.start_date) }}
                </div>
                <span class="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
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
          {{ t('projets.list.title') }}
        </h2>

        <!-- Filters -->
        <div class="mb-10 space-y-6">
          <!-- Category filters -->
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">{{ t('projets.filters.category') }} :</span>
            <div class="inline-flex flex-wrap gap-2 mt-2">
              <button
                v-for="filter in categoryFilters"
                :key="filter.value"
                @click="selectedCategory = filter.value as any"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                :class="selectedCategory === filter.value
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
              >
                {{ t(filter.label) }}
              </button>
            </div>
          </div>

          <!-- Status filters -->
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">{{ t('projets.filters.status') }} :</span>
            <div class="inline-flex flex-wrap gap-2 mt-2">
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
                :src="project.image"
                :alt="getLocalizedTitle(project)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
            </div>

            <div class="p-5">
              <div class="flex items-center gap-2 mb-3">
                <span class="inline-block px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded">
                  {{ t(`projets.categories.${project.category}`) }}
                </span>
                <span
                  class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                  :class="{
                    'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30': project.status === 'active',
                    'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700': project.status === 'completed',
                    'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30': project.status === 'upcoming'
                  }"
                >
                  {{ t(`projets.status.${project.status}`) }}
                </span>
              </div>

              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
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
    <section class="py-16 bg-gradient-to-r from-amber-500 to-amber-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ t('projets.cta.title') }}
        </h2>
        <p class="text-lg text-amber-100 mb-8">
          {{ t('projets.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/contact')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow-lg"
        >
          {{ t('projets.cta.button') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
