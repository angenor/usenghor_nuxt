<script setup lang="ts">
const route = useRoute()
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

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!call.value) return ''
  if (locale.value === 'en' && call.value.title_en) return call.value.title_en
  if (locale.value === 'ar' && call.value.title_ar) return call.value.title_ar
  return call.value.title_fr
})

const getLocalizedDescription = computed(() => {
  if (!call.value) return ''
  if (locale.value === 'en' && call.value.description_en) return call.value.description_en
  if (locale.value === 'ar' && call.value.description_ar) return call.value.description_ar
  return call.value.description_fr
})

const getProjectTitle = computed(() => {
  if (!project.value) return ''
  if (locale.value === 'en') return project.value.title_en
  if (locale.value === 'ar') return project.value.title_ar
  return project.value.title_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${getProjectTitle.value}`,
  description: () => getLocalizedDescription.value
})

// Format deadline
const formatDeadline = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Check if call is open
const isOpen = computed(() => call.value?.status === 'open')

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('projets.hero.title'), to: '/projets' },
  { label: getProjectTitle.value, to: `/projets/${projectSlug.value}` },
  { label: t('projets.tabs.appels'), to: `/projets/${projectSlug.value}#appels` },
  { label: getLocalizedTitle.value }
])
</script>

<template>
  <div v-if="project && call">
    <!-- Hero Section -->
    <PageHero
      :title="getLocalizedTitle"
      :subtitle="getProjectTitle"
      image="/images/bg/backgroud_senghor2.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Cover image -->
          <div class="relative rounded-xl overflow-hidden shadow-lg mb-8">
            <img
              :src="call.image"
              :alt="getLocalizedTitle"
              class="w-full h-64 md:h-80 object-cover"
            />
            <!-- Partner logos overlay -->
            <div v-if="call.partner_logos && call.partner_logos.length > 0" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <div class="flex items-center justify-end gap-3 flex-wrap">
                <img
                  v-for="(logo, index) in call.partner_logos.slice(0, 4)"
                  :key="index"
                  :src="logo"
                  alt="Partner logo"
                  class="h-10 w-auto bg-white rounded-lg p-1"
                />
              </div>
            </div>
          </div>

          <!-- Status badge -->
          <div class="mb-6">
            <span
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': call.status === 'open',
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400': call.status === 'closed'
              }"
            >
              <span
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-green-500': call.status === 'open',
                  'bg-gray-500': call.status === 'closed'
                }"
              ></span>
              {{ call.status === 'open' ? t('projets.appels.statusOpen') : t('projets.appels.statusClosed') }}
            </span>
          </div>

          <!-- Description -->
          <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
            <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {{ getLocalizedDescription }}
            </p>
          </div>

          <!-- Details cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Deadline -->
            <div class="bg-brand-blue-50 dark:bg-brand-blue-900/20 rounded-xl p-6 border border-brand-blue-200 dark:border-brand-blue-800">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-calendar" class="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <h3 class="font-bold text-brand-blue-900 dark:text-brand-blue-300">
                  {{ t('projets.appels.deadline') }}
                </h3>
              </div>
              <p class="text-brand-blue-700 dark:text-brand-blue-400 font-semibold text-lg">
                {{ formatDeadline(call.deadline) }}
              </p>
            </div>

            <!-- Type -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-tag" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 class="font-bold text-gray-900 dark:text-white">
                  {{ t('projets.appels.type') }}
                </h3>
              </div>
              <p class="text-gray-700 dark:text-gray-300 font-medium">
                {{ t(`projets.appels.types.${call.type}`) }}
              </p>
            </div>
          </div>

          <!-- Requirements section -->
          <div v-if="call.requirements && call.requirements.length > 0" class="mb-8">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-list-check" class="w-5 h-5 text-brand-blue-600" />
              {{ t('projets.appels.requirements') }}
            </h2>
            <ul class="space-y-3">
              <li
                v-for="(req, index) in call.requirements"
                :key="index"
                class="flex items-start gap-3 text-gray-600 dark:text-gray-300"
              >
                <font-awesome-icon icon="fa-solid fa-check" class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                <span>{{ req }}</span>
              </li>
            </ul>
          </div>

          <!-- Apply CTA -->
          <div v-if="isOpen" class="bg-gradient-to-r from-brand-blue-600 to-brand-blue-700 rounded-2xl p-8 text-center">
            <h2 class="text-2xl font-bold text-white mb-4">
              {{ t('projets.appels.ctaTitle') }}
            </h2>
            <p class="text-brand-blue-100 mb-6 max-w-md mx-auto">
              {{ t('projets.appels.ctaDescription') }}
            </p>
            <NuxtLink
              :to="localePath(`/projets/${projectSlug}/appels/${appelSlug}/postuler`)"
              class="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue-600 font-bold rounded-xl hover:bg-brand-blue-50 transition-colors shadow-lg"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-5 h-5" />
              {{ t('projets.appels.postuler') }}
            </NuxtLink>
          </div>

          <!-- Closed notice -->
          <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-lock" class="w-8 h-8 text-gray-400" />
            </div>
            <h2 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {{ t('projets.appels.closedTitle') }}
            </h2>
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('projets.appels.closedDescription') }}
            </p>
          </div>

          <!-- Back link -->
          <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              :to="localePath(`/projets/${projectSlug}#appels`)"
              class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('projets.appels.back') }}
            </NuxtLink>
          </div>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-1/3">
          <div class="sticky top-32 space-y-6">
            <!-- Project card -->
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {{ t('projets.appels.project') }}
              </h3>
              <NuxtLink
                :to="localePath(`/projets/${projectSlug}`)"
                class="group flex items-center gap-3"
              >
                <img
                  :src="project.image"
                  :alt="getProjectTitle"
                  class="w-12 h-12 rounded-lg object-cover"
                />
                <span class="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  {{ getProjectTitle }}
                </span>
              </NuxtLink>
            </div>

            <!-- Quick info -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 class="font-bold text-gray-900 dark:text-white mb-4">
                {{ t('projets.appels.quickInfo') }}
              </h3>
              <div class="space-y-4 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('projets.appels.status') }}</span>
                  <span
                    class="font-medium"
                    :class="{
                      'text-green-600 dark:text-green-400': call.status === 'open',
                      'text-gray-600 dark:text-gray-400': call.status === 'closed'
                    }"
                  >
                    {{ call.status === 'open' ? t('projets.appels.statusOpen') : t('projets.appels.statusClosed') }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('projets.appels.type') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ t(`projets.appels.types.${call.type}`) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('projets.appels.deadline') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ formatDeadline(call.deadline) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Share -->
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 class="font-bold text-gray-900 dark:text-white mb-4">
                {{ t('projets.appels.share') }}
              </h3>
              <div class="flex items-center gap-3">
                <button
                  class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center"
                  aria-label="Share on Facebook"
                >
                  <font-awesome-icon icon="fa-brands fa-facebook-f" class="w-4 h-4" />
                </button>
                <button
                  class="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors flex items-center justify-center"
                  aria-label="Share on Twitter"
                >
                  <font-awesome-icon icon="fa-brands fa-twitter" class="w-4 h-4" />
                </button>
                <button
                  class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center"
                  aria-label="Share on LinkedIn"
                >
                  <font-awesome-icon icon="fa-brands fa-linkedin-in" class="w-4 h-4" />
                </button>
                <button
                  class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                  aria-label="Copy link"
                >
                  <font-awesome-icon icon="fa-solid fa-link" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
