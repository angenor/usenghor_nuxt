<script setup lang="ts">
import type { Alumnus } from '~/composables/useMockData'
import type { Testimonial, TestimonialData } from '~/types/api'
import { TESTIMONIAL_KEY_PREFIX } from '~/composables/editorial-values-config'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  getAllAlumni,
  getAlumniStats,
  getAlumniGraduationYears,
  getAlumniCountries,
  getDepartmentById
} = useMockData()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('alumni')

// Chiffres-clés depuis l'admin
const { getFigure, loadKeyFigures } = useKeyFigures()

// API publique pour les témoignages
const { getContentsByCategory } = usePublicEditorialApi()

// Témoignages depuis le backend
const testimonials = ref<Testimonial[]>([])
const isLoadingTestimonials = ref(true)

async function loadTestimonials() {
  isLoadingTestimonials.value = true
  try {
    const contents = await getContentsByCategory('values')
    testimonials.value = contents
      .filter(c => c.key.startsWith(TESTIMONIAL_KEY_PREFIX) && c.value_type === 'json' && c.value)
      .map((c) => {
        const data = JSON.parse(c.value!) as TestimonialData
        return { ...data, id: c.key, created_at: '', updated_at: '' } as Testimonial
      })
      .filter(t => t.is_active)
      .sort((a, b) => a.display_order - b.display_order)
  }
  catch (err) {
    console.error('Erreur chargement témoignages:', err)
  }
  finally {
    isLoadingTestimonials.value = false
  }
}

const featuredTestimonials = computed(() =>
  testimonials.value.filter(t => t.is_featured),
)

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-alumni', () => loadContent())

onMounted(() => {
  // Charger les chiffres clés et témoignages (client-side)
  loadKeyFigures()
  loadTestimonials()
})

// SEO
useSeoMeta({
  title: () => t('alumni.seo.title'),
  description: () => t('alumni.seo.description')
})

// Get data
const allAlumni = computed(() => getAllAlumni())
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
const getLocalizedPosition = (item: Alumnus | Testimonial) => {
  if (locale.value === 'en' && item.current_position_en) return item.current_position_en
  if (locale.value === 'ar' && item.current_position_ar) return item.current_position_ar
  return item.current_position_fr
}

const getLocalizedTestimonialText = (item: Testimonial) => {
  if (locale.value === 'en' && item.testimonial_en) return item.testimonial_en
  if (locale.value === 'ar' && item.testimonial_ar) return item.testimonial_ar
  return item.testimonial_fr
}

const getDepartmentName = (deptId: string) => {
  const dept = getDepartmentById(deptId)
  if (!dept) return ''
  if (locale.value === 'en') return dept.name_en
  if (locale.value === 'ar') return dept.name_ar
  return dept.name_fr
}

// Stats display - valeurs depuis l'admin avec fallback
const stats = computed(() => [
  { value: getFigure('stats_alumni', '4200+'), label: getContent('alumni.stats.alumni.label', 'alumni.stats.alumni') },
  { value: getFigure('stats_alumni_countries', `${alumniStats.value.countries}+`), label: getContent('alumni.stats.countries.label', 'alumni.stats.countries') },
  { value: getFigure('stats_alumni_sectors', `${alumniStats.value.industries}`), label: getContent('alumni.stats.sectors.label', 'alumni.stats.sectors') },
  { value: getFigure('stats_promotions', '30+'), label: getContent('alumni.stats.promotions.label', 'alumni.stats.promotions') }
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
            {{ getContent('alumni.hero.badge') }}
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ getContent('alumni.hero.title') }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            {{ getContent('alumni.hero.subtitle') }}
          </p>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <svg class="w-full h-12 md:h-16 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
        </svg>
      </div>
    </section>

    <!-- Stats Section -->
    <section id="reseau" class="py-16 bg-white dark:bg-gray-950 bg-grid-pattern scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ getContent('alumni.stats.title') }}
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
    <section id="temoignages" v-if="isLoadingTestimonials || featuredTestimonials.length > 0" class="py-16 bg-gray-50 dark:bg-gray-900 bg-grid-pattern scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ getContent('alumni.testimonials.title') }}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            {{ getContent('alumni.testimonials.subtitle') }}
          </p>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoadingTestimonials" class="grid md:grid-cols-2 gap-8">
          <div v-for="n in 2" :key="n" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-pulse">
            <div class="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
            <div class="space-y-3 mb-6">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            </div>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="grid md:grid-cols-2 gap-8">
          <article
            v-for="testimonial in featuredTestimonials"
            :key="testimonial.id"
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
                "{{ getLocalizedTestimonialText(testimonial) }}"
              </blockquote>

              <!-- Alumni info -->
              <div class="flex items-center gap-4">
                <img
                  v-if="testimonial.photo"
                  :src="testimonial.photo"
                  :alt="`${testimonial.first_name} ${testimonial.last_name}`"
                  class="w-16 h-16 rounded-full object-cover ring-2 ring-brand-blue-400"
                  loading="lazy"
                >
                <div v-else class="w-16 h-16 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center ring-2 ring-brand-blue-400">
                  <font-awesome-icon icon="fa-solid fa-user" class="w-8 h-8 text-brand-blue-400" />
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 dark:text-white">
                    {{ testimonial.civility }} {{ testimonial.first_name }} {{ testimonial.last_name }}
                  </h3>
                  <p class="text-brand-blue-600 dark:text-brand-blue-400 font-medium">
                    {{ getLocalizedPosition(testimonial) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ testimonial.organization }} • {{ testimonial.country }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ testimonial.promotion }}
                  </p>
                </div>
              </div>

              <!-- LinkedIn link -->
              <a
                v-if="testimonial.linkedin"
                :href="testimonial.linkedin"
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
    <section id="annuaire" class="py-16 bg-white dark:bg-gray-950 bg-grid-pattern scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {{ getContent('alumni.list.title') }}
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
          {{ getContent('alumni.cta.title') }}
        </h2>
        <p class="text-lg text-brand-blue-100 mb-8">
          {{ getContent('alumni.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/contact')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue-600 font-semibold rounded-lg hover:bg-brand-blue-50 transition-colors shadow-lg"
        >
          {{ getContent('alumni.cta.button') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
