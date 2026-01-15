<script setup lang="ts">
import type { FormationType } from '@bank/mock-data/formations'

const route = useRoute()
const { t, locale } = useI18n()
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

// Other formation types for sidebar
const otherTypes = computed(() => {
  return validTypes
    .filter(slug => slug !== typeSlug.value)
    .map(slug => ({
      slug,
      label: t(`formations.types.${slug}`),
      formations: getFormationsByType(typeSlugToFormationType[slug]).slice(0, 3),
      count: getFormationsByType(typeSlugToFormationType[slug]).length,
      icon: slug === 'masters' ? 'fa-graduation-cap'
        : slug === 'doctorats' ? 'fa-user-graduate'
        : slug === 'diplomes-universitaires' ? 'fa-certificate'
        : 'fa-award',
      color: slug === 'masters' ? 'bg-indigo-500'
        : slug === 'doctorats' ? 'bg-purple-600'
        : slug === 'diplomes-universitaires' ? 'bg-teal-500'
        : 'bg-rose-500'
    }))
})

// Get localized title for formation
const getLocalizedTitle = (f: any) => {
  if (locale.value === 'en' && f.title_en) return f.title_en
  if (locale.value === 'ar' && f.title_ar) return f.title_ar
  return f.title_fr
}

// Get thumbnail version of image (100x100)
const getThumbnail = (f: any) => {
  if (!f.image) return `https://picsum.photos/seed/${f.slug}/100/100`
  // Convert large image URL to thumbnail size
  return f.image.replace(/\/\d+\/\d+$/, '/100/100')
}
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
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main Content -->
          <div class="flex-1">
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
            <div v-if="filteredFormations.length > 0" class="grid md:grid-cols-2 gap-6">
              <CardsCardFormation
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

          <!-- Sidebar - Other Formation Types -->
          <aside class="lg:w-80 flex-shrink-0">
            <div class="sticky top-24 space-y-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <font-awesome-icon icon="fa-solid fa-compass" class="w-5 h-5 text-amber-500" />
                {{ t('formations.sidebar.otherTypes') }}
              </h3>

              <!-- Other types cards -->
              <div
                v-for="type in otherTypes"
                :key="type.slug"
                class="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden"
              >
                <!-- Type header -->
                <NuxtLink
                  :to="localePath(`/formations/${type.slug}`)"
                  class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      :class="type.color"
                    >
                      <font-awesome-icon :icon="`fa-solid ${type.icon}`" class="w-4 h-4" />
                    </span>
                    <span class="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {{ type.label }}
                    </span>
                  </div>
                  <span class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full flex-shrink-0">
                    {{ type.count }}
                  </span>
                </NuxtLink>

                <!-- Sample formations with thumbnails -->
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                  <NuxtLink
                    v-for="formation in type.formations"
                    :key="formation.id"
                    :to="localePath(`/formations/${type.slug}/${formation.slug}`)"
                    class="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <!-- Thumbnail -->
                    <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      <img
                        :src="getThumbnail(formation)"
                        :alt="getLocalizedTitle(formation)"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <!-- Title -->
                    <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
                      {{ getLocalizedTitle(formation) }}
                    </span>
                  </NuxtLink>
                </div>

                <!-- View all link -->
                <NuxtLink
                  :to="localePath(`/formations/${type.slug}`)"
                  class="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {{ t('formations.sidebar.viewAll') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                </NuxtLink>
              </div>
            </div>
          </aside>
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
