<script setup lang="ts">
import type { Project } from '~/composables/useMockData'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getProjectBySlug, getAllProjects, getProjectCalls, getProjectNews } = useMockData()

// Get the project
const slug = computed(() => route.params.slug as string)
const project = computed(() => getProjectBySlug(slug.value))

// 404 if not found
if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found'
  })
}

// Active tab from hash (default to 'presentation')
const activeTab = ref('presentation')

// Watch route hash changes
const updateTabFromHash = () => {
  const hash = route.hash?.replace('#', '') || 'presentation'
  const validTabs = ['presentation', 'appels', 'actualites', 'partenaires', 'mediatheque']
  activeTab.value = validTabs.includes(hash) ? hash : 'presentation'
}

// Initialize and watch for hash changes
onMounted(() => {
  updateTabFromHash()
})

watch(() => route.hash, () => {
  updateTabFromHash()
})

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!project.value) return ''
  if (locale.value === 'en') return project.value.title_en
  if (locale.value === 'ar') return project.value.title_ar
  return project.value.title_fr
})

const getLocalizedDescription = computed(() => {
  if (!project.value) return ''
  if (locale.value === 'en') return project.value.description_en
  if (locale.value === 'ar') return project.value.description_ar
  return project.value.description_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('projets.hero.title')}`,
  description: () => getLocalizedDescription.value,
  ogImage: () => project.value?.image || 'https://picsum.photos/seed/og-project/1200/630'
})

// Related projects (same category, excluding current)
const relatedProjects = computed(() => {
  if (!project.value) return []
  return getAllProjects()
    .filter(p => p.category === project.value!.category && p.id !== project.value!.id)
    .slice(0, 3)
})

// Open calls for this project (limit to 2 for sidebar)
const openCalls = computed(() => {
  if (!project.value) return []
  return getProjectCalls(project.value.id).slice(0, 2)
})

// Recent news for this project (limit to 2 for sidebar)
const recentNews = computed(() => {
  if (!project.value) return []
  return getProjectNews(project.value.id).slice(0, 2)
})

// Localized call title helper
const getLocalizedCallTitle = (call: any) => {
  if (locale.value === 'en' && call.title_en) return call.title_en
  if (locale.value === 'ar' && call.title_ar) return call.title_ar
  return call.title_fr
}

// Localized news title helper
const getLocalizedNewsTitle = (news: any) => {
  if (locale.value === 'en' && news.title_en) return news.title_en
  if (locale.value === 'ar' && news.title_ar) return news.title_ar
  return news.title_fr
}

// Format deadline
const formatDeadline = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}

// Get localized title for related projects
const getLocalizedTitleFor = (p: Project) => {
  if (locale.value === 'en') return p.title_en
  if (locale.value === 'ar') return p.title_ar
  return p.title_fr
}

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('projets.hero.title'), to: '/projets' },
  { label: getLocalizedTitle.value }
])
</script>

<template>
  <div v-if="project">
    <!-- Hero Section -->
    <PageHero
      :title="getLocalizedTitle"
      :subtitle="t(`projets.categories.${project.category}`)"
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
          <ProjetPresentation
            v-if="activeTab === 'presentation'"
            :project="project"
          />

          <!-- Tab: Appels -->
          <ProjetAppels
            v-if="activeTab === 'appels'"
            :project-id="project.id"
            :project-slug="project.slug"
          />

          <!-- Tab: Actualités -->
          <ProjetActualites
            v-if="activeTab === 'actualites'"
            :project-id="project.id"
          />

          <!-- Tab: Partenaires -->
          <ProjetPartenaires
            v-if="activeTab === 'partenaires'"
            :project="project"
          />

          <!-- Tab: Médiathèque -->
          <ProjetMediatheque
            v-if="activeTab === 'mediatheque'"
            :project-id="project.id"
          />

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

          <!-- Related projects -->
          <section v-if="relatedProjects.length > 0" class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('projets.detail.relatedProjects') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NuxtLink
                v-for="item in relatedProjects"
                :key="item.id"
                :to="localePath(`/projets/${item.slug}`)"
                class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div class="overflow-hidden h-32">
                  <img
                    :src="item.image"
                    :alt="getLocalizedTitleFor(item)"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>

                <div class="p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="inline-block px-2 py-0.5 text-xs font-medium text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded">
                      {{ t(`projets.categories.${item.category}`) }}
                    </span>
                  </div>

                  <h3 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {{ getLocalizedTitleFor(item) }}
                  </h3>
                </div>
              </NuxtLink>
            </div>
          </section>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-1/3">
          <div class="sticky top-32 space-y-6">
            <!-- Project summary card -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {{ getLocalizedTitle }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {{ getLocalizedDescription }}
              </p>
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('projets.filters.status') }}</span>
                  <span
                    class="font-medium"
                    :class="{
                      'text-green-600 dark:text-green-400': project.status === 'active',
                      'text-gray-600 dark:text-gray-400': project.status === 'completed',
                      'text-blue-600 dark:text-blue-400': project.status === 'upcoming'
                    }"
                  >
                    {{ t(`projets.status.${project.status}`) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('projets.filters.category') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ t(`projets.categories.${project.category}`) }}
                  </span>
                </div>
                <div v-if="project.beneficiaries" class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400">{{ t('projets.detail.beneficiaries') }}</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ project.beneficiaries }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Open Calls -->
            <div v-if="openCalls.length > 0" class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
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
                <NuxtLink
                  v-for="call in openCalls"
                  :key="call.id"
                  :to="localePath(`/projets/${project.slug}/appels/${call.slug}`)"
                  class="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 line-clamp-2">
                      {{ getLocalizedCallTitle(call) }}
                    </h4>
                    <span class="flex-shrink-0 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      {{ t('projets.appels.statusOpen') }}
                    </span>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                    {{ t('projets.appels.deadline') }}: {{ formatDeadline(call.deadline) }}
                  </p>
                </NuxtLink>
              </div>
            </div>

            <!-- Recent News -->
            <div v-if="recentNews.length > 0" class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <font-awesome-icon icon="fa-solid fa-newspaper" class="w-4 h-4 text-brand-blue-600" />
                  {{ t('projets.actualites.title') }}
                </h3>
                <NuxtLink
                  :to="{ hash: '#actualites' }"
                  class="text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
                >
                  {{ t('projets.list.showMore') }}
                </NuxtLink>
              </div>
              <div class="space-y-3">
                <div
                  v-for="news in recentNews"
                  :key="news.id"
                  class="flex items-start gap-3"
                >
                  <img
                    :src="news.image"
                    :alt="getLocalizedNewsTitle(news)"
                    class="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {{ getLocalizedNewsTitle(news) }}
                    </h4>
                    <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {{ new Date(news.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                    </p>
                  </div>
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
</template>
