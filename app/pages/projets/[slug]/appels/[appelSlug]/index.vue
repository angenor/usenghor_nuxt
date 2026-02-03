<script setup lang="ts">
/**
 * Page de détail d'un appel de projet
 *
 * Note: Cette page est temporairement simplifiée car l'API publique
 * ne fournit pas encore d'endpoint pour récupérer un appel individuel.
 * Les appels sont listés via /api/public/projects/calls/ongoing et /calls/upcoming
 * mais sans possibilité de récupérer un appel spécifique par ID ou slug.
 */

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getProjectBySlug, getOngoingCalls, getUpcomingCalls } = usePublicProjectsApi()

// Get params
const projectSlug = computed(() => route.params.slug as string)
const appelSlug = computed(() => route.params.appelSlug as string)

// État
const isLoading = ref(true)
const project = ref<Awaited<ReturnType<typeof getProjectBySlug>>>(null)
const call = ref<Awaited<ReturnType<typeof getOngoingCalls>>[0] | null>(null)

// Chargement des données
async function loadData() {
  isLoading.value = true
  try {
    // Charger le projet
    project.value = await getProjectBySlug(projectSlug.value)
    if (!project.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      })
    }

    // Charger tous les appels et chercher celui qui correspond
    const [ongoing, upcoming] = await Promise.all([
      getOngoingCalls(),
      getUpcomingCalls(),
    ])
    const allCalls = [...ongoing, ...upcoming]

    // Chercher l'appel par ID (le slug dans l'URL est en fait l'ID)
    call.value = allCalls.find(c => c.id === appelSlug.value && c.project_id === project.value?.id) || null
  }
  catch (err: unknown) {
    const fetchError = err as { statusCode?: number }
    if (fetchError.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Call not found',
      })
    }
    console.error('Erreur:', err)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(loadData)

// Localization helpers
const getProjectTitle = computed(() => project.value?.title || '')

const getCallTitle = computed(() => call.value?.title || '')

// SEO
useSeoMeta({
  title: () => `${getCallTitle.value} | ${getProjectTitle.value}`,
  description: () => call.value?.description || '',
})

// Format deadline
const formatDeadline = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
}

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('projets.hero.title'), to: '/projets' },
  { label: getProjectTitle.value, to: `/projets/${projectSlug.value}` },
  { label: t('projets.tabs.appels'), to: `/projets/${projectSlug.value}#appels` },
  { label: getCallTitle.value },
])
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600" />
    </div>

    <!-- No call found -->
    <div v-else-if="!call" class="min-h-screen">
      <PageHero
        :title="t('projets.appels.title')"
        :subtitle="getProjectTitle"
        image="/images/bg/backgroud_senghor2.jpg"
        :breadcrumb="breadcrumb"
      />

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <font-awesome-icon icon="fa-solid fa-inbox" class="w-16 h-16 text-gray-400 mb-4" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {{ t('projets.appels.notFound') || 'Appel non trouvé' }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ t('projets.appels.notFoundDescription') || 'Cet appel n\'existe pas ou n\'est plus disponible.' }}
          </p>
          <NuxtLink
            :to="localePath(`/projets/${projectSlug}#appels`)"
            class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
            {{ t('projets.appels.back') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Hero Section -->
      <PageHero
        :title="getCallTitle"
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
            <div class="rounded-xl overflow-hidden shadow-lg mb-8">
              <img
                :src="call.cover_image || 'https://picsum.photos/seed/call/1200/600'"
                :alt="getCallTitle"
                class="w-full h-64 md:h-80 object-cover"
              >
            </div>

            <!-- Status badge -->
            <div class="mb-6">
              <span
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': call.status === 'ongoing',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': call.status === 'upcoming',
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400': call.status === 'closed',
                }"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  :class="{
                    'bg-green-500': call.status === 'ongoing',
                    'bg-blue-500': call.status === 'upcoming',
                    'bg-gray-500': call.status === 'closed',
                  }"
                />
                {{ call.status === 'ongoing' ? t('projets.appels.statusOpen') : call.status === 'upcoming' ? t('projets.appels.statusUpcoming') : t('projets.appels.statusClosed') }}
              </span>
            </div>

            <!-- Description -->
            <CallsDescriptionSection v-if="call.description" :description="call.description" />

            <!-- Details cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <!-- Deadline -->
              <div v-if="call.deadline" class="bg-brand-blue-50 dark:bg-brand-blue-900/20 rounded-xl p-6 border border-brand-blue-200 dark:border-brand-blue-800">
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
              <div v-if="call.type" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
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

            <!-- Conditions -->
            <div v-if="call.conditions" class="mb-8">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <font-awesome-icon icon="fa-solid fa-list-check" class="w-5 h-5 text-brand-blue-600" />
                {{ t('projets.appels.conditions') || 'Conditions' }}
              </h2>
              <div class="prose prose-lg dark:prose-invert max-w-none">
                <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {{ call.conditions }}
                </p>
              </div>
            </div>

            <!-- Closed notice -->
            <div v-if="call.status === 'closed'" class="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
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
                  v-if="project"
                  :to="localePath(`/projets/${projectSlug}`)"
                  class="group flex items-center gap-3"
                >
                  <img
                    :src="project.cover_image || 'https://picsum.photos/seed/project/200/200'"
                    :alt="getProjectTitle"
                    class="w-12 h-12 rounded-lg object-cover"
                  >
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
                        'text-green-600 dark:text-green-400': call.status === 'ongoing',
                        'text-blue-600 dark:text-blue-400': call.status === 'upcoming',
                        'text-gray-600 dark:text-gray-400': call.status === 'closed',
                      }"
                    >
                      {{ call.status === 'ongoing' ? t('projets.appels.statusOpen') : call.status === 'upcoming' ? t('projets.appels.statusUpcoming') : t('projets.appels.statusClosed') }}
                    </span>
                  </div>
                  <div v-if="call.type" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.appels.type') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ t(`projets.appels.types.${call.type}`) }}
                    </span>
                  </div>
                  <div v-if="call.deadline" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.appels.deadline') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ formatDeadline(call.deadline) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
