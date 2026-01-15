<script setup lang="ts">
import type { Formation, FormationType } from '@bank/mock-data/formations'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getFormationBySlug, getRelatedFormations, getDepartmentById } = useMockData()

// Mapping from URL slug to FormationType
const typeSlugToFormationType: Record<string, FormationType> = {
  'masters': 'master',
  'doctorats': 'doctorat',
  'diplomes-universitaires': 'du',
  'certifiantes': 'certifiante'
}

// Mapping FormationType to URL slug
const formationTypeToSlug: Record<FormationType, string> = {
  'master': 'masters',
  'doctorat': 'doctorats',
  'du': 'diplomes-universitaires',
  'certifiante': 'certifiantes'
}

// Valid types for route validation
const validTypes = ['masters', 'doctorats', 'diplomes-universitaires', 'certifiantes']

// Get current type and slug from route
const typeSlug = computed(() => route.params.type as string)
const slug = computed(() => route.params.slug as string)
const isValidType = computed(() => validTypes.includes(typeSlug.value))

// Get formation
const formation = computed(() => getFormationBySlug(slug.value))

// Validate formation exists and type matches
onMounted(() => {
  if (!isValidType.value || !formation.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Formation not found'
    })
  }
  // Check if type matches
  const expectedTypeSlug = formationTypeToSlug[formation.value.formation_type]
  if (expectedTypeSlug !== typeSlug.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Formation not found'
    })
  }
})

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!formation.value) return ''
  if (locale.value === 'en' && formation.value.title_en) return formation.value.title_en
  if (locale.value === 'ar' && formation.value.title_ar) return formation.value.title_ar
  return formation.value.title_fr
})

const getLocalizedDescription = computed(() => {
  if (!formation.value) return ''
  if (locale.value === 'en' && formation.value.short_description_en) return formation.value.short_description_en
  return formation.value.short_description_fr
})

const getLocalizedDuration = computed(() => {
  if (!formation.value) return ''
  if (locale.value === 'en' && formation.value.duration_en) return formation.value.duration_en
  return formation.value.duration_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('formations.hero.title')}`,
  description: () => getLocalizedDescription.value,
  ogImage: () => formation.value?.image || 'https://picsum.photos/seed/og-formation/1200/630'
})

// Type configuration
const typeConfig = computed(() => {
  const configs: Record<string, { icon: string; color: string; bgColor: string }> = {
    master: {
      icon: 'fa-solid fa-graduation-cap',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-500'
    },
    doctorat: {
      icon: 'fa-solid fa-book-open',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-600'
    },
    du: {
      icon: 'fa-solid fa-award',
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-500'
    },
    certifiante: {
      icon: 'fa-solid fa-certificate',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500'
    }
  }
  return formation.value ? configs[formation.value.formation_type] : configs.master
})

// Campus badge classes
const campusBgColors: Record<string, string> = {
  alexandrie: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  externalise: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  en_ligne: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

// Department
const department = computed(() => {
  if (!formation.value) return null
  return getDepartmentById(formation.value.department_id)
})

const getLocalizedDepartmentName = computed(() => {
  if (!department.value) return ''
  if (locale.value === 'en' && department.value.name_en) return department.value.name_en
  if (locale.value === 'ar' && department.value.name_ar) return department.value.name_ar
  return department.value.name_fr
})

// Format dates
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Related formations
const relatedFormations = computed(() => {
  if (!formation.value) return []
  return getRelatedFormations(formation.value, 3)
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.training'), to: '/carrieres#etudiants' },
  { label: t(`formations.types.${typeSlug.value}`), to: `/formations/${typeSlug.value}` },
  { label: getLocalizedTitle.value }
])

// Get URL for related formation
const getFormationUrl = (f: Formation) => {
  const fTypeSlug = formationTypeToSlug[f.formation_type]
  return localePath(`/formations/${fTypeSlug}/${f.slug}`)
}

// Get localized title for related
const getLocalizedTitleFor = (f: Formation) => {
  if (locale.value === 'en' && f.title_en) return f.title_en
  if (locale.value === 'ar' && f.title_ar) return f.title_ar
  return f.title_fr
}

// Accordion state for semesters
const openSemesters = ref<Set<number>>(new Set([7])) // Open first semester by default

const toggleSemester = (num: number) => {
  if (openSemesters.value.has(num)) {
    openSemesters.value.delete(num)
  } else {
    openSemesters.value.add(num)
  }
  // Force reactivity
  openSemesters.value = new Set(openSemesters.value)
}
</script>

<template>
  <div v-if="formation">
    <!-- Hero Section (universal background) -->
    <PageHero
      :title="getLocalizedTitle"
      :subtitle="t(`formations.typeDescriptions.${formationTypeToSlug[formation.formation_type]}`)"
      image="/images/bg/backgroud_senghor2.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Cover Image (dans la section article uniquement) -->
          <div class="mb-8">
            <!-- Image avec badges -->
            <div class="relative h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-lg">
              <img
                :src="formation.image || `https://picsum.photos/seed/${formation.slug}/1920/1080`"
                :alt="getLocalizedTitle"
                class="w-full h-full object-cover"
              />
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <!-- Badges on image -->
              <div class="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                <!-- Type badge -->
                <span
                  class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white rounded-full shadow-lg backdrop-blur-sm"
                  :class="typeConfig.bgColor"
                >
                  <font-awesome-icon :icon="typeConfig.icon" class="w-4 h-4" />
                  {{ t(`formations.types.${formation.formation_type}`) }}
                </span>

                <!-- Campus badge -->
                <span
                  class="inline-block px-3 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm bg-white/90 dark:bg-gray-900/90"
                  :class="campusBgColors[formation.campus]"
                >
                  {{ t(`formations.campus.${formation.campus}`) }}
                </span>

                <!-- Application status -->
                <span
                  v-if="formation.application_open"
                  class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-green-500 text-white rounded-full shadow-lg"
                >
                  <span class="w-2 h-2 bg-white rounded-full animate-pulse" />
                  {{ t('formations.card.applicationOpen') }}
                </span>
              </div>
            </div>

            <!-- Description en dessous -->
            <p class="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ getLocalizedDescription }}
            </p>
          </div>

          <!-- Info cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <!-- Duration -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4" />
                {{ t('formations.detail.duration') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white">
                {{ getLocalizedDuration }}
              </div>
            </div>

            <!-- Credits -->
            <div v-if="formation.credits" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-award" class="w-4 h-4" />
                {{ t('formations.detail.credits') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white">
                {{ formation.credits }} ECTS
              </div>
            </div>

            <!-- Diploma -->
            <div v-if="formation.diploma_fr" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-scroll" class="w-4 h-4" />
                {{ t('formations.detail.diploma') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ formation.diploma_fr }}
              </div>
            </div>

            <!-- Department -->
            <div v-if="department" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-building-columns" class="w-4 h-4" />
                {{ t('formations.detail.department') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ getLocalizedDepartmentName }}
              </div>
            </div>
          </div>

          <!-- Program / Curriculum -->
          <div v-if="formation.program && formation.program.length > 0" class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {{ t('formations.detail.program') }}
            </h2>

            <div class="space-y-4">
              <div
                v-for="semester in formation.program"
                :key="semester.number"
                class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
              >
                <!-- Semester header -->
                <div
                  class="bg-gray-50 dark:bg-gray-800 px-5 py-4 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  @click="toggleSemester(semester.number)"
                >
                  <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span
                      class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      :class="typeConfig.bgColor + ' text-white'"
                    >
                      S{{ semester.number }}
                    </span>
                    {{ semester.title }}
                  </h3>
                  <font-awesome-icon
                    :icon="openSemesters.has(semester.number) ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                    class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform"
                  />
                </div>

                <!-- Semester modules -->
                <div
                  v-show="openSemesters.has(semester.number)"
                  class="bg-white dark:bg-gray-900 px-5 py-4"
                >
                  <ul class="space-y-2">
                    <li
                      v-for="(module, idx) in semester.modules"
                      :key="idx"
                      class="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-check"
                        class="w-4 h-4 text-amber-500 mt-1 flex-shrink-0"
                      />
                      <span>
                        {{ module.name }}
                        <span v-if="module.credits" class="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          ({{ module.credits }} {{ t('formations.card.credits') }})
                        </span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Application info -->
          <div v-if="formation.application_open" class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 mb-8 border border-amber-200 dark:border-amber-800">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-file-pen" class="text-amber-500" />
              {{ t('formations.detail.admission') }}
            </h3>

            <div class="space-y-3">
              <div v-if="formation.application_deadline" class="flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-calendar-days" class="w-5 h-5 text-red-500" />
                <span class="text-gray-700 dark:text-gray-300">
                  <strong>{{ t('formations.detail.applicationDeadline') }} :</strong>
                  <span class="text-red-600 dark:text-red-400 font-semibold ml-2">{{ formatDate(formation.application_deadline) }}</span>
                </span>
              </div>

              <div v-if="formation.start_date" class="flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-calendar-check" class="w-5 h-5 text-green-500" />
                <span class="text-gray-700 dark:text-gray-300">
                  <strong>{{ t('formations.detail.startDate') }} :</strong>
                  <span class="font-semibold ml-2">{{ formatDate(formation.start_date) }}</span>
                </span>
              </div>
            </div>

            <NuxtLink
              :to="localePath('/candidatures') + `?formation=${formation.slug}`"
              class="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-4 h-4" />
              {{ t('formations.detail.apply') }}
            </NuxtLink>
          </div>

          <!-- Back button -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              :to="localePath(`/formations/${typeSlug}`)"
              class="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('formations.detail.back') }}
            </NuxtLink>
          </div>

          <!-- Related formations -->
          <section v-if="relatedFormations.length > 0" class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('formations.detail.relatedFormations') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></span>
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NuxtLink
                v-for="related in relatedFormations"
                :key="related.id"
                :to="getFormationUrl(related)"
                class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div class="overflow-hidden h-32">
                  <img
                    :src="related.image || `https://picsum.photos/seed/${related.slug}/400/200`"
                    :alt="getLocalizedTitleFor(related)"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>

                <div class="p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="inline-block px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded">
                      {{ t(`formations.types.${related.formation_type}`) }}
                    </span>
                  </div>

                  <h3 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {{ getLocalizedTitleFor(related) }}
                  </h3>
                </div>
              </NuxtLink>
            </div>
          </section>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-1/3">
          <div class="sticky top-24 space-y-6">
            <!-- Formation summary card -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {{ getLocalizedTitle }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {{ getLocalizedDescription }}
              </p>
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.duration') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ getLocalizedDuration }}
                  </span>
                </div>
                <div v-if="formation.credits" class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.credits') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ formation.credits }} ECTS
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('formations.filters.campus') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ t(`formations.campus.${formation.campus}`) }}
                  </span>
                </div>
              </div>

              <div v-if="formation.application_open" class="mt-6">
                <NuxtLink
                  :to="localePath('/candidatures') + `?formation=${formation.slug}`"
                  class="block w-full text-center px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                >
                  {{ t('formations.detail.apply') }}
                </NuxtLink>
              </div>

              <!-- Download PDF button -->
              <div class="mt-4">
                <a
                  v-if="formation.pdf_url"
                  :href="formation.pdf_url"
                  target="_blank"
                  class="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-5 h-5 text-red-500" />
                  {{ t('formations.detail.downloadProgram') }}
                </a>
                <a
                  v-else
                  href="#"
                  class="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-medium rounded-lg cursor-not-allowed border border-gray-100 dark:border-gray-700"
                  @click.prevent
                >
                  <font-awesome-icon icon="fa-solid fa-file-pdf" class="w-5 h-5" />
                  {{ t('formations.detail.downloadProgram') }}
                  <span class="text-xs">({{ t('formations.card.deadline') }})</span>
                </a>
              </div>
            </div>

            <!-- Back to list -->
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {{ t(`formations.types.${typeSlug}`) }}
              </h3>
              <NuxtLink
                :to="localePath(`/formations/${typeSlug}`)"
                class="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors"
              >
                {{ t('formations.detail.back') }}
                <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
