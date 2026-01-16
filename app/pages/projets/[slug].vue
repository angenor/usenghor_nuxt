<script setup lang="ts">
import type { Project } from '~/composables/useMockData'
import { getFlagEmoji } from '@bank/mock-data/projets'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getProjectBySlug, getAllProjects } = useMockData()

// Get the project
const slug = computed(() => route.params.slug as string)
const project = computed(() => getProjectBySlug(slug.value))

// 404 if not found
onMounted(() => {
  if (!project.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Project not found'
    })
  }
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

const getLocalizedContent = computed(() => {
  if (!project.value) return ''
  if (locale.value === 'en') return project.value.content_en
  if (locale.value === 'ar') return project.value.content_ar
  return project.value.content_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('projets.hero.title')}`,
  description: () => getLocalizedDescription.value,
  ogImage: () => project.value?.image || 'https://picsum.photos/seed/og-project/1200/630'
})

// Format dates
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { month: 'long', year: 'numeric' }
  )
}

// Period string
const periodString = computed(() => {
  if (!project.value) return ''
  const start = formatDate(project.value.start_date)
  if (project.value.end_date) {
    return `${start} - ${formatDate(project.value.end_date)}`
  }
  return `${start} - ${t('projets.detail.ongoing')}`
})

// Status badge classes
const statusClasses = computed(() => {
  if (!project.value) return ''
  switch (project.value.status) {
    case 'active':
      return 'bg-green-600 text-white'
    case 'completed':
      return 'bg-gray-600 text-white'
    case 'upcoming':
      return 'bg-blue-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
})

// Related projects (same category, excluding current)
const relatedProjects = computed(() => {
  if (!project.value) return []
  return getAllProjects()
    .filter(p => p.category === project.value!.category && p.id !== project.value!.id)
    .slice(0, 3)
})

// Get localized title for related projects
const getLocalizedTitleFor = (p: Project) => {
  if (locale.value === 'en') return p.title_en
  if (locale.value === 'ar') return p.title_ar
  return p.title_fr
}

// Render markdown content
const renderedContent = computed(() => {
  let content = getLocalizedContent.value

  // Process markdown in correct order
  content = content
    // Headers (order matters: h3 before h2)
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">$1</h2>')
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
    // List items
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700 dark:text-gray-300 mb-1">$1</li>')
    // Wrap consecutive list items in ul
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside mb-4 space-y-1">$&</ul>')
    // Paragraphs (double newlines)
    .replace(/\n\n(?!<)/g, '</p><p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">')
    // Single newlines within paragraphs
    .replace(/\n(?!<)/g, '<br>')

  // Wrap in paragraph if doesn't start with a tag
  if (!content.startsWith('<')) {
    content = '<p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">' + content + '</p>'
  }

  return content
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('projets.hero.title'), to: '/projets' },
  { label: getLocalizedTitle.value }
])
</script>

<template>
  <div v-if="project">
    <!-- Hero Section (universal background) -->
    <PageHero
      :title="getLocalizedTitle"
      :subtitle="t(`projets.categories.${project.category}`)"
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
                :src="project.image"
                :alt="getLocalizedTitle"
                class="w-full h-full object-cover"
              />
              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <!-- Badges on image -->
              <div class="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                <!-- Category badge -->
                <span class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full shadow-lg backdrop-blur-sm">
                  {{ t(`projets.categories.${project.category}`) }}
                </span>

                <!-- Status badge -->
                <span
                  class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full shadow-lg backdrop-blur-sm"
                  :class="statusClasses"
                >
                  {{ t(`projets.status.${project.status}`) }}
                </span>

                <!-- Featured badge -->
                <span
                  v-if="project.featured"
                  class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-brand-red-500 to-brand-red-600 text-white rounded-full shadow-lg"
                >
                  <font-awesome-icon icon="fa-solid fa-star" class="w-4 h-4" />
                  {{ t('projets.featured.badge') }}
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

            <!-- Countries -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-globe" class="w-4 h-4" />
                {{ t('projets.detail.countries') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                <template v-if="project.countries.length > 3">
                  {{ project.countries.length }} pays
                </template>
                <template v-else>
                  <span v-for="(country, idx) in project.countries" :key="country.code">
                    <span v-if="country.code !== 'UN'">{{ getFlagEmoji(country.code) }}</span> {{ country.name }}<span v-if="idx < project.countries.length - 1">, </span>
                  </span>
                </template>
              </div>
            </div>

            <!-- Budget -->
            <div v-if="project.budget" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-euro-sign" class="w-4 h-4" />
                {{ t('projets.detail.budget') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ project.budget }}
              </div>
            </div>

            <!-- Beneficiaries -->
            <div v-if="project.beneficiaries" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-users" class="w-4 h-4" />
                {{ t('projets.detail.beneficiaries') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ project.beneficiaries }}
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
            <div v-html="renderedContent"></div>
          </div>

          <!-- Gallery -->
          <div v-if="project.gallery && project.gallery.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-images" class="text-brand-blue-500" />
              {{ t('projets.detail.gallery') }}
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <img
                v-for="(img, index) in project.gallery"
                :key="index"
                :src="img"
                :alt="`${getLocalizedTitle} - ${index + 1}`"
                class="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                loading="lazy"
              >
            </div>
          </div>

          <!-- Partners -->
          <div v-if="project.partners.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-handshake" class="text-brand-blue-500" />
              {{ t('projets.detail.partners') }}
            </h3>
            <div class="flex flex-wrap items-center gap-6">
              <template v-for="partner in project.partners" :key="partner.name">
                <a
                  v-if="partner.website"
                  :href="partner.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
                  :title="partner.name"
                >
                  <img
                    v-if="partner.logo"
                    :src="partner.logo"
                    :alt="partner.name"
                    class="h-10 w-auto max-w-[120px] object-contain"
                  >
                  <span v-else class="text-gray-700 dark:text-gray-300 font-medium">{{ partner.name }}</span>
                </a>
                <div
                  v-else
                  class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <img
                    v-if="partner.logo"
                    :src="partner.logo"
                    :alt="partner.name"
                    class="h-10 w-auto max-w-[120px] object-contain"
                  >
                  <span v-else class="text-gray-700 dark:text-gray-300 font-medium">{{ partner.name }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Countries list -->
          <div v-if="project.countries.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-globe-africa" class="text-brand-blue-500" />
              {{ t('projets.detail.countries') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="country in project.countries"
                :key="country.code"
                class="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue-50 dark:bg-brand-blue-900/20 text-brand-blue-700 dark:text-brand-blue-400 rounded-full text-sm"
              >
                <span v-if="country.code !== 'UN'" class="text-lg">{{ getFlagEmoji(country.code) }}</span>
                <font-awesome-icon v-else icon="fa-solid fa-globe" class="w-4 h-4" />
                {{ country.name }}
              </span>
            </div>
          </div>

          <!-- Back button -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
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
          <div class="sticky top-24 space-y-6">
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

            <!-- Other projects -->
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
