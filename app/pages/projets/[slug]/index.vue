<script setup lang="ts">
import type { ApplicationCallPublic } from '~/types/api'
import type { ProjectPublicDisplay } from '~/composables/usePublicProjectsApi'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { siteUrl } = useRuntimeConfig().public
const {
  getProjectBySlug,
  formatDate,
  formatBudget,
} = usePublicProjectsApi()
const { listCallsByProject, callTypeLabels, callStatusLabels, callStatusColors } = usePublicCallsApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(project: ProjectPublicDisplay, variant: 'low' | 'medium' | 'original' = 'medium'): string | null {
  if ((project as any).cover_image_external_id) {
    const originalUrl = getMediaUrl((project as any).cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : null
  }
  return project.cover_image || null
}

// ============================================================================
// État
// ============================================================================

const error = ref<string | null>(null)

// Get the project slug
const slug = computed(() => route.params.slug as string)

// Active tab from hash (default to 'presentation')
const activeTab = ref('presentation')

// Watch route hash changes
const updateTabFromHash = () => {
  const hash = route.hash?.replace('#', '') || 'presentation'
  const validTabs = ['presentation', 'appels', 'actualites', 'partenaires', 'mediatheque']
  activeTab.value = validTabs.includes(hash) ? hash : 'presentation'
}

// ============================================================================
// Chargement des données (SSR + client)
// ============================================================================

const { data: project, status } = await useAsyncData(
  `project-${slug.value}`,
  () => getProjectBySlug(slug.value)
)

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
  })
}

const isLoading = computed(() => status.value === 'pending')

// Charger les données secondaires côté client
onMounted(async () => {
  updateTabFromHash()
  if (project.value?.id) {
    try {
      projectCalls.value = await listCallsByProject(project.value.id)
    } catch {
      console.error('Erreur lors du chargement des appels du projet')
    }
  }
})

watch(() => route.hash, () => {
  updateTabFromHash()
})

// ============================================================================
// Computed & Helpers
// ============================================================================

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!project.value) return ''
  // Le backend utilise un seul titre (pas de multilangue pour l'instant)
  return project.value.title
})

const getLocalizedDescription = computed(() => {
  if (!project.value) return ''
  return project.value.description || project.value.summary || ''
})

const getLocalizedSummary = computed(() => {
  if (!project.value) return ''
  return project.value.summary || ''
})

// SEO
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('projets.hero.title')}`,
  ogTitle: () => `${getLocalizedTitle.value} | ${t('projets.hero.title')}`,
  description: () => getLocalizedSummary.value,
  ogDescription: () => getLocalizedSummary.value,
  ogUrl: () => `${siteUrl}${route.fullPath}`,
  ogImage: () => (project.value as any)?.cover_image_external_id
    ? `${siteUrl}/api/public/media/${(project.value as any).cover_image_external_id}/download?variant=medium`
    : undefined,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
  twitterTitle: () => `${getLocalizedTitle.value} | ${t('projets.hero.title')}`,
  twitterDescription: () => getLocalizedSummary.value,
  twitterImage: () => (project.value as any)?.cover_image_external_id
    ? `${siteUrl}/api/public/media/${(project.value as any).cover_image_external_id}/download?variant=medium`
    : undefined,
})

// First category name
const firstCategoryName = computed(() => {
  if (!project.value?.categories || project.value.categories.length === 0) return ''
  return project.value.categories[0]?.name || ''
})

// Appels à candidature associés à ce projet
const projectCalls = ref<ApplicationCallPublic[]>([])

const openCalls = computed(() =>
  projectCalls.value.filter(c => c.status === 'ongoing' || c.status === 'upcoming'),
)

// Format deadline
const formatDeadline = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
}

// Helpers pour l'affichage des appels (style /actualites/appels)
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const getCallImage = (call: ApplicationCallPublic): string | null => {
  if (call.cover_image_external_id) {
    return `/api/public/media/${call.cover_image_external_id}/download?variant=medium`
  }
  return null
}

const daysUntilDeadline = (deadlineStr: string | null) => {
  if (!deadlineStr) return 0
  const deadline = new Date(deadlineStr)
  const diffTime = deadline.getTime() - Date.now()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Period string
const periodString = computed(() => {
  if (!project.value) return ''
  const start = formatDate(project.value.start_date, locale.value)
  if (project.value.end_date) {
    return `${start} - ${formatDate(project.value.end_date, locale.value)}`
  }
  return `${start} - ${t('projets.detail.ongoing')}`
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('projets.hero.title'), to: '/projets' },
  { label: getLocalizedTitle.value },
])
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center py-12 px-4">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-400 mb-4" />
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('common.error') }}</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
        <button
          class="px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 transition-colors"
          @click="loadProject"
        >
          {{ t('common.retry') }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="project">
      <!-- Hero Section -->
      <PageHero
        :title="getLocalizedTitle"
        :subtitle="firstCategoryName"
        image="/images/bg/backgroud_senghor2.jpg"
        :breadcrumb="breadcrumb"
      />

      <!-- Tabs Navigation -->
      <ProjetTabs :active-tab="activeTab" />

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-12">
          <!-- Main content -->
          <article class="lg:w-2/3">
            <!-- Tab: Présentation -->
            <div v-if="activeTab === 'presentation'" class="py-8">
              <!-- Cover Image with badges -->
              <div class="mb-8">
                <div class="relative h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    v-if="getCoverImageUrl(project)"
                    :src="getCoverImageUrl(project)!"
                    :alt="getLocalizedTitle"
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-diagram-project" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <!-- Gradient overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <!-- Badges on image -->
                  <div class="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                    <!-- Category badge -->
                    <span
                      v-if="firstCategoryName"
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full shadow-lg backdrop-blur-sm"
                    >
                      {{ firstCategoryName }}
                    </span>

                    <!-- Status badge -->
                    <span
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full shadow-lg backdrop-blur-sm"
                      :class="{
                        'bg-green-600 text-white': project.status === 'ongoing',
                        'bg-blue-600 text-white': project.status === 'completed',
                        'bg-yellow-600 text-white': project.status === 'planned',
                        'bg-red-600 text-white': project.status === 'suspended',
                      }"
                    >
                      {{ t(`projets.status.${project.status}`) }}
                    </span>
                  </div>
                </div>

                <!-- Description -->
                <p class="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ getLocalizedSummary }}
                </p>
              </div>

              <!-- Info cards -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <!-- Period -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
                    {{ t('projets.detail.period') }}
                  </div>
                  <div class="font-bold text-gray-900 dark:text-white text-sm">
                    {{ periodString }}
                  </div>
                </div>

                <!-- Budget -->
                <div v-if="project.budget" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <font-awesome-icon icon="fa-solid fa-euro-sign" class="w-4 h-4" />
                    {{ t('projets.detail.budget') }}
                  </div>
                  <div class="font-bold text-gray-900 dark:text-white text-sm">
                    {{ formatBudget(project.budget, project.currency) }}
                  </div>
                </div>

              </div>

              <!-- Bénéficiaires -->
              <div v-if="project.beneficiaries?.length" class="mb-8">
                <div class="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-5">
                  <div class="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3">
                    <font-awesome-icon icon="fa-solid fa-users" class="w-5 h-5 text-brand-blue-500" />
                    {{ t('projets.detail.beneficiaries') }}
                  </div>
                  <ul class="space-y-3">
                    <li
                      v-for="b in project.beneficiaries"
                      :key="b"
                      class="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <font-awesome-icon
                        icon="fa-solid fa-users"
                        class="w-5 h-5 text-brand-blue-500 mt-0.5 flex-shrink-0"
                      />
                      <span>{{ b }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- Content -->
              <div v-if="project.description_html" class="prose prose-lg dark:prose-invert max-w-none mb-8">
                <RichTextRenderer :html="project.description_html" />
              </div>
            </div>

            <!-- Tab: Appels -->
            <div v-if="activeTab === 'appels'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-bullhorn" class="text-brand-blue-500" />
                {{ t('projets.appels.title') }}
              </h2>

              <!-- Liste des appels -->
              <div v-if="projectCalls.length > 0" class="space-y-6">
                <NuxtLink
                  v-for="call in projectCalls"
                  :key="call.id"
                  :to="localePath(`/actualites/appels/${call.slug}`)"
                  class="group rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border block"
                  :class="call.status === 'closed'
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 opacity-80 hover:opacity-100'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'"
                >
                  <div class="flex flex-col md:flex-row">
                    <!-- Image -->
                    <div class="md:w-1/3 overflow-hidden relative">
                      <img
                        v-if="getCallImage(call)"
                        :src="getCallImage(call)!"
                        :alt="call.title"
                        class="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        :class="call.status === 'closed' ? 'grayscale group-hover:grayscale-0' : ''"
                        loading="lazy"
                      >
                      <div v-else class="w-full h-48 md:h-full min-h-[140px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                      <!-- Closed overlay -->
                      <div
                        v-if="call.status === 'closed'"
                        class="absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40 flex items-center justify-center"
                      >
                        <span class="px-3 py-1.5 bg-gray-700 dark:bg-gray-600 text-white text-sm font-semibold rounded-full">
                          {{ callStatusLabels.closed }}
                        </span>
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="md:w-2/3 p-6">
                      <div class="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                          :class="call.status === 'closed'
                            ? 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700'
                            : 'text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30'"
                        >
                          {{ callTypeLabels[call.type] }}
                        </span>
                        <span
                          v-if="call.status === 'ongoing' && call.deadline && daysUntilDeadline(call.deadline) <= 7 && daysUntilDeadline(call.deadline) > 0"
                          class="inline-block px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded animate-pulse"
                        >
                          {{ daysUntilDeadline(call.deadline) }} jours restants
                        </span>
                        <span
                          v-else-if="call.status === 'ongoing'"
                          class="inline-block px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded"
                        >
                          {{ callStatusLabels.ongoing }}
                        </span>
                        <span
                          v-else-if="call.status === 'upcoming'"
                          class="inline-block px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 rounded"
                        >
                          {{ callStatusLabels.upcoming }}
                        </span>
                      </div>

                      <h3
                        class="text-xl font-bold leading-tight transition-colors"
                        :class="call.status === 'closed'
                          ? 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                          : 'text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400'"
                      >
                        {{ call.title }}
                      </h3>

                      <p
                        v-if="call.description_html"
                        class="mt-3 line-clamp-3"
                        :class="call.status === 'closed' ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'"
                      >
                        {{ extractPlainText(call.description_html) }}
                      </p>

                      <div class="flex items-center justify-between mt-6 pt-4 border-t" :class="call.status === 'closed' ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'">
                        <div v-if="call.deadline" class="text-sm">
                          <span class="text-gray-500 dark:text-gray-400">{{ t('projets.appels.deadline') }} :</span>
                          <span
                            class="ml-1 font-semibold"
                            :class="call.status === 'closed' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-red-600 dark:text-red-400'"
                          >
                            {{ formatDeadline(call.deadline) }}
                          </span>
                        </div>

                        <span
                          class="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg"
                          :class="call.status === 'closed'
                            ? 'bg-gray-500 text-white'
                            : 'bg-brand-blue-600 text-white'"
                        >
                          {{ call.status === 'closed' ? 'Voir l\'archive' : 'En savoir plus' }}
                          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </NuxtLink>
              </div>

              <!-- Empty state -->
              <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-inbox" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.appels.noAppels') }}</p>
              </div>
            </div>

            <!-- Tab: Actualités -->
            <div v-if="activeTab === 'actualites'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="text-brand-blue-500" />
                {{ t('projets.actualites.title') }}
              </h2>

              <!-- Empty state -->
              <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.actualites.noActualites') }}</p>
              </div>
            </div>

            <!-- Tab: Partenaires -->
            <div v-if="activeTab === 'partenaires'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-handshake" class="text-brand-blue-500" />
                {{ t('projets.detail.partners') }}
              </h2>

              <!-- Empty state -->
              <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-handshake" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.partenaires.noPartenaires') }}</p>
              </div>
            </div>

            <!-- Tab: Médiathèque -->
            <div v-if="activeTab === 'mediatheque'" class="py-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <font-awesome-icon icon="fa-solid fa-photo-film" class="text-brand-blue-500" />
                {{ t('projets.mediatheque.title') }}
              </h2>

              <!-- Empty state -->
              <div class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <font-awesome-icon icon="fa-solid fa-photo-film" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400">{{ t('projets.mediatheque.noMedia') }}</p>
              </div>
            </div>

            <!-- Back button -->
            <div class="pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
              <NuxtLink
                :to="localePath('/projets')"
                class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
                {{ t('projets.detail.back') }}
              </NuxtLink>
            </div>
          </article>

          <!-- Sidebar -->
          <aside class="lg:w-1/3">
            <div class="sticky top-32 space-y-6">
              <!-- Project summary card -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {{ getLocalizedTitle }}
                </h3>
                <div class="space-y-3 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.filters.status') }}</span>
                    <span
                      class="font-medium"
                      :class="{
                        'text-green-600 dark:text-green-400': project.status === 'ongoing',
                        'text-blue-600 dark:text-blue-400': project.status === 'completed',
                        'text-yellow-600 dark:text-yellow-400': project.status === 'planned',
                        'text-red-600 dark:text-red-400': project.status === 'suspended',
                      }"
                    >
                      {{ t(`projets.status.${project.status}`) }}
                    </span>
                  </div>
                  <div v-if="firstCategoryName" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.filters.category') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ firstCategoryName }}
                    </span>
                  </div>
                  <div v-if="project.beneficiaries?.length">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('projets.detail.beneficiaries') }}</span>
                    <div class="mt-1.5 flex flex-wrap gap-1.5">
                      <span
                        v-for="b in project.beneficiaries"
                        :key="b"
                        class="inline-flex items-center px-2 py-0.5 rounded-md text-xs border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                      >
                        {{ b }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Open Calls -->
              <div
                v-if="openCalls.length > 0"
                class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-4 h-4 text-brand-blue-600" />
                    {{ t('projets.appels.title') }}
                  </h3>
                  <NuxtLink
                    :to="{ hash: '#appels' }"
                    class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
                  >
                    {{ t('projets.list.showMore') }}
                  </NuxtLink>
                </div>
                <div class="space-y-3">
                  <div
                    v-for="call in openCalls.slice(0, 2)"
                    :key="call.id"
                    class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {{ call.title }}
                      </h4>
                      <span
                        class="flex-shrink-0 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                        :class="callStatusColors[call.status]"
                      >
                        {{ callStatusLabels[call.status] }}
                      </span>
                    </div>
                    <p v-if="call.deadline" class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                      {{ t('projets.appels.deadline') }}: {{ formatDeadline(call.deadline) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quick navigation -->
              <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {{ t('projets.list.title') }}
                </h3>
                <NuxtLink
                  :to="localePath('/projets')"
                  class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
                >
                  {{ t('projets.detail.back') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
