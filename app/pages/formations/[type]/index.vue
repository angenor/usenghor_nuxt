<script setup lang="ts">
import type { FormationType } from '@bank/mock-data/formations'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { getFormationsByType } = useMockData()

// Mapping from URL slug to FormationType
const typeSlugToFormationType: Record<string, FormationType> = {
  'masters': 'master',
  'doctorats': 'doctorat',
  'diplomes-universitaires': 'du',
  'certifiantes': 'certifiante'
}

// Valid types for route validation
const validTypes = ['masters', 'doctorats', 'diplomes-universitaires', 'certifiantes']

// Get current type from route
const typeSlug = computed(() => route.params.type as string)
const formationType = computed(() => typeSlugToFormationType[typeSlug.value])
const isValidType = computed(() => validTypes.includes(typeSlug.value))

// 404 if invalid type
onMounted(() => {
  if (!isValidType.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Formation type not found'
    })
  }
})

// SEO
useSeoMeta({
  title: () => t('formations.seo.titleType', { type: t(`formations.types.${typeSlug.value}`) }),
  description: () => t('formations.seo.descriptionType', { type: t(`formations.types.${typeSlug.value}`) })
})

// Filters
const validCampuses = ['all', 'alexandrie', 'externalise', 'en_ligne'] as const
const selectedCampus = ref<typeof validCampuses[number]>('all')
const showOnlyOpenApplications = ref(false)

// Get formations by type
const allFormations = computed(() => {
  if (!formationType.value) return []
  return getFormationsByType(formationType.value)
})

// Filtered formations
const filteredFormations = computed(() => {
  let result = allFormations.value

  if (selectedCampus.value !== 'all') {
    result = result.filter(f => f.campus === selectedCampus.value)
  }

  if (showOnlyOpenApplications.value) {
    result = result.filter(f => f.application_open)
  }

  return result
})

// Campus filter options
const campusFilters = [
  { value: 'all', label: 'formations.filters.all' },
  { value: 'alexandrie', label: 'formations.campus.alexandrie' },
  { value: 'externalise', label: 'formations.campus.externalise' },
  { value: 'en_ligne', label: 'formations.campus.en_ligne' }
]

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.training'), to: '/carrieres#etudiants' },
  { label: t(`formations.types.${typeSlug.value}`) }
])
</script>

<template>
  <div v-if="isValidType">
    <!-- Hero -->
    <PageHero
      :title="t(`formations.types.${typeSlug}`)"
      :subtitle="t(`formations.typeDescriptions.${typeSlug}`)"
      image="/images/bg/backgroud_senghor2.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Filters & Content -->
    <section class="py-12 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Filters -->
        <div class="mb-10 space-y-6">
          <!-- Campus filters -->
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">{{ t('formations.filters.campus') }} :</span>
            <div class="inline-flex flex-wrap gap-2 mt-2">
              <button
                v-for="filter in campusFilters"
                :key="filter.value"
                @click="selectedCampus = filter.value as any"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                :class="selectedCampus === filter.value
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
              >
                {{ t(filter.label) }}
              </button>
            </div>
          </div>

          <!-- Application status toggle -->
          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="showOnlyOpenApplications"
                type="checkbox"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
              <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('formations.filters.applicationOpen') }}
              </span>
            </label>
          </div>
        </div>

        <!-- Formations Grid -->
        <div v-if="filteredFormations.length > 0" class="grid md:grid-cols-2 gap-8">
          <CardFormation
            v-for="formation in filteredFormations"
            :key="formation.id"
            :formation="formation"
            :show-type="false"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <font-awesome-icon icon="fa-solid fa-folder-open" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('formations.empty.title') }}</h3>
          <p class="text-gray-500 dark:text-gray-400">
            {{ t('formations.empty.description') }}
          </p>
        </div>

        <!-- Back link -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <NuxtLink
            :to="localePath('/carrieres') + '#etudiants'"
            class="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
            {{ t('formations.detail.back') }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-amber-500 to-amber-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ t('formations.cta.title') }}
        </h2>
        <p class="text-lg text-amber-100 mb-8">
          {{ t('formations.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/actualites/appels')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors shadow-lg"
        >
          {{ t('formations.cta.button') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
