<script setup lang="ts">
import type { Alumnus } from '~/composables/useMockData'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  getAllAlumni,
  getFeaturedAlumni,
  getAlumniStats,
  getAlumniGraduationYears,
  getAlumniCountries,
  getDepartmentById
} = useMockData()

// SEO
useSeoMeta({
  title: () => t('alumni.seo.title'),
  description: () => t('alumni.seo.description')
})

// Get data
const allAlumni = computed(() => getAllAlumni())
const featuredAlumni = computed(() => getFeaturedAlumni())
const alumniStats = computed(() => getAlumniStats())
const graduationYears = computed(() => getAlumniGraduationYears())
const countries = computed(() => getAlumniCountries())

// Department list for filters
const departments = [
  { id: 'all', label: 'alumni.filters.all' },
  { id: 'dept-culture', label: 'alumni.departments.culture' },
  { id: 'dept-environnement', label: 'alumni.departments.environnement' },
  { id: 'dept-management', label: 'alumni.departments.management' },
  { id: 'dept-sante', label: 'alumni.departments.sante' }
]

// Filters
const route = useRoute()
const router = useRouter()

const getInitialDepartment = () => {
  const dept = route.query.department as string
  if (dept && departments.some(d => d.id === dept)) return dept
  return 'all'
}

const getInitialYear = () => {
  const year = route.query.year as string
  if (year && graduationYears.value.includes(Number(year))) return year
  return 'all'
}

const getInitialCountry = () => {
  const country = route.query.country as string
  if (country && countries.value.includes(country)) return country
  return 'all'
}

const selectedDepartment = ref(getInitialDepartment())
const selectedYear = ref(getInitialYear())
const selectedCountry = ref(getInitialCountry())

// Update URL when filters change
watch([selectedDepartment, selectedYear, selectedCountry], () => {
  const query: Record<string, string> = {}
  if (selectedDepartment.value !== 'all') query.department = selectedDepartment.value
  if (selectedYear.value !== 'all') query.year = selectedYear.value
  if (selectedCountry.value !== 'all') query.country = selectedCountry.value
  router.replace({ query })
})

// Filtered alumni (non-featured)
const filteredAlumni = computed(() => {
  let alumni = allAlumni.value.filter(a => !a.is_featured)

  if (selectedDepartment.value !== 'all') {
    alumni = alumni.filter(a => a.department_id === selectedDepartment.value)
  }

  if (selectedYear.value !== 'all') {
    alumni = alumni.filter(a => a.graduation_year === Number(selectedYear.value))
  }

  if (selectedCountry.value !== 'all') {
    alumni = alumni.filter(a => a.country === selectedCountry.value)
  }

  return alumni
})

// Show more functionality
const showAll = ref(false)
const visibleAlumni = computed(() => {
  if (showAll.value) return filteredAlumni.value
  return filteredAlumni.value.slice(0, 6)
})

// Localization helpers
const getLocalizedPosition = (alumnus: Alumnus) => {
  if (locale.value === 'en' && alumnus.current_position_en) return alumnus.current_position_en
  if (locale.value === 'ar' && alumnus.current_position_ar) return alumnus.current_position_ar
  return alumnus.current_position_fr
}

const getLocalizedTestimonial = (alumnus: Alumnus) => {
  if (locale.value === 'en' && alumnus.testimonial_en) return alumnus.testimonial_en
  if (locale.value === 'ar' && alumnus.testimonial_ar) return alumnus.testimonial_ar
  return alumnus.testimonial_fr
}

const getDepartmentName = (deptId: string) => {
  const dept = getDepartmentById(deptId)
  if (!dept) return ''
  if (locale.value === 'en') return dept.name_en
  if (locale.value === 'ar') return dept.name_ar
  return dept.name_fr
}

// Stats display
const stats = computed(() => [
  { value: '4000+', label: t('alumni.stats.alumni') },
  { value: `${alumniStats.value.countries}+`, label: t('alumni.stats.countries') },
  { value: `${alumniStats.value.industries}`, label: t('alumni.stats.sectors') },
  { value: '30+', label: t('alumni.stats.promotions') }
])

// Reset filters
const resetFilters = () => {
  selectedDepartment.value = 'all'
  selectedYear.value = 'all'
  selectedCountry.value = 'all'
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <span class="inline-block px-4 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full mb-6">
            {{ t('alumni.hero.badge') }}
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ t('alumni.hero.title') }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            {{ t('alumni.hero.subtitle') }}
          </p>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <svg class="w-full h-12 md:h-16 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('alumni.stats.title') }}
          </h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl md:text-5xl font-bold text-brand-blue-600 dark:text-brand-blue-400 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials / Success Stories -->
    <section v-if="featuredAlumni.length > 0" class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ t('alumni.testimonials.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            {{ t('alumni.testimonials.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <article
            v-for="alumnus in featuredAlumni"
            :key="alumnus.id"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div class="p-8">
              <!-- Quote icon -->
              <font-awesome-icon
                icon="fa-solid fa-quote-left"
                class="w-10 h-10 text-brand-blue-400 dark:text-brand-blue-500 mb-6"
              />

              <!-- Testimonial -->
              <blockquote class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                "{{ getLocalizedTestimonial(alumnus) }}"
              </blockquote>

              <!-- Alumni info -->
              <div class="flex items-center gap-4">
                <img
                  :src="alumnus.photo"
                  :alt="`${alumnus.first_name} ${alumnus.last_name}`"
                  class="w-16 h-16 rounded-full object-cover ring-2 ring-brand-blue-400"
                  loading="lazy"
                >
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white">
                    {{ alumnus.civility }} {{ alumnus.first_name }} {{ alumnus.last_name }}
                  </h3>
                  <p class="text-brand-blue-600 dark:text-brand-blue-400 font-medium">
                    {{ getLocalizedPosition(alumnus) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ alumnus.organization }} • {{ alumnus.country }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ alumnus.promotion }}
                  </p>
                </div>
              </div>

              <!-- LinkedIn link -->
              <a
                v-if="alumnus.linkedin"
                :href="alumnus.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors"
              >
                <font-awesome-icon icon="fa-brands fa-linkedin" class="w-4 h-4" />
                {{ t('alumni.card.viewLinkedin') }}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- All Alumni List -->
    <section class="py-16 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {{ t('alumni.list.title') }}
        </h2>

        <!-- Filters -->
        <div class="mb-10 space-y-6">
          <!-- Department filter -->
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">{{ t('alumni.filters.department') }} :</span>
            <div class="inline-flex flex-wrap gap-2 mt-2">
              <button
                v-for="dept in departments"
                :key="dept.id"
                @click="selectedDepartment = dept.id"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                :class="selectedDepartment === dept.id
                  ? 'bg-brand-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
              >
                {{ t(dept.label) }}
              </button>
            </div>
          </div>

          <!-- Year filter -->
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">{{ t('alumni.filters.year') }} :</span>
            <select
              v-model="selectedYear"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">{{ t('alumni.filters.all') }}</option>
              <option v-for="year in graduationYears" :key="year" :value="String(year)">
                {{ year }}
              </option>
            </select>
          </div>

          <!-- Country filter -->
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">{{ t('alumni.filters.country') }} :</span>
            <select
              v-model="selectedCountry"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-brand-blue-500"
            >
              <option value="all">{{ t('alumni.filters.all') }}</option>
              <option v-for="country in countries" :key="country" :value="country">
                {{ country }}
              </option>
            </select>
          </div>
        </div>

        <!-- Alumni Grid -->
        <div v-if="visibleAlumni.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="alumnus in visibleAlumni"
            :key="alumnus.id"
            class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            <div class="p-6">
              <!-- Photo + Name -->
              <div class="flex items-center gap-4 mb-4">
                <img
                  :src="alumnus.photo"
                  :alt="`${alumnus.first_name} ${alumnus.last_name}`"
                  class="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-brand-blue-400 transition-all"
                  loading="lazy"
                >
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {{ alumnus.civility }} {{ alumnus.first_name }} {{ alumnus.last_name }}
                  </h3>
                  <p class="text-sm text-brand-blue-600 dark:text-brand-blue-400 font-medium">
                    {{ getLocalizedPosition(alumnus) }}
                  </p>
                </div>
              </div>

              <!-- Info -->
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <font-awesome-icon icon="fa-solid fa-building" class="w-4 h-4 text-gray-400" />
                  {{ alumnus.organization }}
                </div>
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <font-awesome-icon icon="fa-solid fa-location-dot" class="w-4 h-4 text-gray-400" />
                  {{ alumnus.country }}
                </div>
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-4 h-4 text-gray-400" />
                  {{ alumnus.promotion }}
                </div>
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <font-awesome-icon icon="fa-solid fa-book" class="w-4 h-4 text-gray-400" />
                  {{ getDepartmentName(alumnus.department_id) }}
                </div>
              </div>

              <!-- LinkedIn -->
              <a
                v-if="alumnus.linkedin"
                :href="alumnus.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors"
              >
                <font-awesome-icon icon="fa-brands fa-linkedin" class="w-4 h-4" />
                {{ t('alumni.card.viewLinkedin') }}
              </a>
            </div>
          </article>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <font-awesome-icon icon="fa-solid fa-users-slash" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('alumni.empty.title') }}</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            {{ t('alumni.empty.description') }}
          </p>
          <button
            @click="resetFilters"
            class="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue-600 text-white font-medium rounded-lg hover:bg-brand-blue-700 transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-rotate-left" class="w-4 h-4" />
            {{ t('alumni.filters.all') }}
          </button>
        </div>

        <!-- Show more button -->
        <div v-if="filteredAlumni.length > 6" class="text-center mt-10">
          <button
            @click="showAll = !showAll"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {{ showAll ? t('alumni.list.showLess') : t('alumni.list.showMore') }}
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
          {{ t('alumni.cta.title') }}
        </h2>
        <p class="text-lg text-brand-blue-100 mb-8">
          {{ t('alumni.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/contact')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue-600 font-semibold rounded-lg hover:bg-brand-blue-50 transition-colors shadow-lg"
        >
          {{ t('alumni.cta.button') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
