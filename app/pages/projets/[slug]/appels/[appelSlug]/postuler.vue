<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getProjectBySlug, getProjectCallBySlug } = useMockData()

// Get params
const projectSlug = computed(() => route.params.slug as string)
const appelSlug = computed(() => route.params.appelSlug as string)

// Get project and call
const project = computed(() => getProjectBySlug(projectSlug.value))
const call = computed(() => getProjectCallBySlug(projectSlug.value, appelSlug.value))

// 404 if not found
if (!project.value || !call.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Call not found'
  })
}

// Redirect if call is closed
onMounted(() => {
  if (call.value && call.value.status !== 'open') {
    router.replace(localePath(`/projets/${projectSlug.value}/appels/${appelSlug.value}`))
  }
})

// Success state
const isSubmitted = ref(false)

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!call.value) return ''
  if (locale.value === 'en' && call.value.title_en) return call.value.title_en
  if (locale.value === 'ar' && call.value.title_ar) return call.value.title_ar
  return call.value.title_fr
})

const getProjectTitle = computed(() => {
  if (!project.value) return ''
  if (locale.value === 'en') return project.value.title_en
  if (locale.value === 'ar') return project.value.title_ar
  return project.value.title_fr
})

// SEO
useSeoMeta({
  title: () => `${t('projets.postuler.title')} - ${getLocalizedTitle.value}`,
  description: () => `${t('projets.postuler.subtitle')} - ${getLocalizedTitle.value}`
})

// Format deadline
const formatDeadline = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Handle form submission
const handleSubmitted = () => {
  isSubmitted.value = true
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('projets.hero.title'), to: '/projets' },
  { label: getProjectTitle.value, to: `/projets/${projectSlug.value}` },
  { label: getLocalizedTitle.value, to: `/projets/${projectSlug.value}/appels/${appelSlug.value}` },
  { label: t('projets.postuler.title') }
])
</script>

<template>
  <div v-if="project && call">
    <!-- Hero Section -->
    <PageHero
      :title="t('projets.postuler.title')"
      :subtitle="getLocalizedTitle"
      image="/images/bg/backgroud_senghor2.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Success state -->
      <div
        v-if="isSubmitted"
        class="text-center py-12 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
      >
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <font-awesome-icon icon="fa-solid fa-check" class="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 class="text-2xl font-bold text-green-800 dark:text-green-300 mb-4">
          {{ t('projets.postuler.success.title') }}
        </h2>
        <p class="text-green-700 dark:text-green-400 mb-8 max-w-md mx-auto">
          {{ t('projets.postuler.success.message') }}
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            :to="localePath(`/projets/${projectSlug}`)"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
            {{ t('projets.appels.back') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/projets')"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            {{ t('projets.list.title') }}
          </NuxtLink>
        </div>
      </div>

      <!-- Form -->
      <template v-else>
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Form section -->
          <div class="flex-1">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('projets.postuler.subtitle') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                {{ getLocalizedTitle }}
              </p>

              <PostulerForm
                :call-title="getLocalizedTitle"
                :project-title="getProjectTitle"
                @submitted="handleSubmitted"
              />
            </div>
          </div>

          <!-- Info sidebar -->
          <div class="lg:w-80 space-y-6">
            <!-- Deadline card -->
            <div class="bg-brand-blue-50 dark:bg-brand-blue-900/20 rounded-xl p-6 border border-brand-blue-200 dark:border-brand-blue-800">
              <h3 class="font-bold text-brand-blue-900 dark:text-brand-blue-300 mb-3 flex items-center gap-2">
                <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4" />
                {{ t('projets.appels.deadline') }}
              </h3>
              <p class="text-brand-blue-700 dark:text-brand-blue-400 font-semibold">
                {{ formatDeadline(call.deadline) }}
              </p>
            </div>

            <!-- Back link -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <NuxtLink
                :to="localePath(`/projets/${projectSlug}/appels/${appelSlug}`)"
                class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
                {{ t('projets.postuler.back') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
