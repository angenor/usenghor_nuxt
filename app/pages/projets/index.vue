<script setup lang="ts">
import type { ProjectCategoryRead, ProjectStatus } from '~/types/api'
import type { ProjectPublicDisplay } from '~/composables/usePublicProjectsApi'
import type { PartnerPublic } from '~/composables/usePublicPartnersApi'
import type { NewsDisplay } from '~/types/news'

const { t, locale } = useI18n()
const { localized } = useLocalizedField()
const { public: { siteUrl } } = useRuntimeConfig()
const localePath = useLocalePath()
const {
  listProjects,
  getCategories,
} = usePublicProjectsApi()
const { getAllPublishedNews } = usePublicNewsApi()
const { getProjectsPartners } = usePublicPartnersApi()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

const route = useRoute()
const router = useRouter()

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(project: ProjectPublicDisplay, variant: 'low' | 'medium' | 'original' = 'low'): string | null {
  if ((project as any).cover_image_external_id) {
    const originalUrl = getMediaUrl((project as any).cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : null
  }
  return project.cover_image || null
}

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('projects')

// Chiffres-clés depuis l'admin
const { getFigure, loadKeyFigures } = useKeyFigures()

// SEO
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => t('projets.seo.title'),
  description: () => t('projets.seo.description'),
  ogTitle: () => t('projets.seo.title'),
  ogDescription: () => t('projets.seo.description'),
  ogUrl: () => siteUrl + route.fullPath,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
})

// ============================================================================
// État
// ============================================================================

const isLoading = ref(true)
const error = ref<string | null>(null)
const projects = ref<ProjectPublicDisplay[]>([])
const categories = ref<ProjectCategoryRead[]>([])
const totalProjects = ref(0)

// Actualités associées à l'ensemble des projets
const projectNews = ref<NewsDisplay[]>([])

async function loadProjectNews() {
  try {
    const allNews = await getAllPublishedNews({ limit: 100 })
    // On ne garde que les actualités rattachées à un projet (association faite en backoffice)
    projectNews.value = allNews.filter(n => !!n.project_id)
  }
  catch (err) {
    console.error('Erreur lors du chargement des actualités des projets:', err)
  }
}

// Partenaires associés à l'ensemble des projets
const projectPartners = ref<PartnerPublic[]>([])

async function loadProjectPartners() {
  try {
    projectPartners.value = await getProjectsPartners()
  }
  catch (err) {
    console.error('Erreur lors du chargement des partenaires des projets:', err)
  }
}

// Navigation par ancres (tab bar)
const anchorSections = computed(() => {
  const sections = [
    { id: 'presentation', label: t('projets.anchors.presentation'), icon: 'fa-solid fa-circle-info' },
    { id: 'projets', label: t('projets.anchors.projects'), icon: 'fa-solid fa-diagram-project' },
  ]
  if (projectNews.value.length > 0) {
    sections.push({ id: 'actualites', label: t('projets.anchors.news'), icon: 'fa-solid fa-newspaper' })
  }
  if (projectPartners.value.length > 0) {
    sections.push({ id: 'partenaires', label: t('projets.anchors.partners'), icon: 'fa-solid fa-handshake' })
  }
  return sections
})

// Format de date localisé pour les actualités
const newsDateLocale = computed(() => (locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR'))
function formatNewsDate(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString(newsDateLocale.value, { day: 'numeric', month: 'long', year: 'numeric' })
}

// Filters
const validStatuses = ['all', 'planned', 'ongoing', 'completed', 'suspended'] as const

const getInitialCategory = () => {
  const cat = route.query.category as string
  if (cat && (cat === 'all' || categories.value.some(c => c.slug === cat))) {
    return cat
  }
  return 'all'
}

const getInitialStatus = () => {
  const status = route.query.status as string
  if (status && validStatuses.includes(status as typeof validStatuses[number])) {
    return status as typeof validStatuses[number]
  }
  return 'all'
}

const selectedCategory = ref<string>('all')
const selectedStatus = ref<typeof validStatuses[number]>('all')

// Update URL when filters change
watch([selectedCategory, selectedStatus], () => {
  const query: Record<string, string> = {}
  if (selectedCategory.value !== 'all') query.category = selectedCategory.value
  if (selectedStatus.value !== 'all') query.status = selectedStatus.value
  router.replace({ query })
})

// ============================================================================
// Chargement des données
// ============================================================================

async function loadData() {
  isLoading.value = true
  error.value = null

  try {
    // Charger les catégories d'abord
    categories.value = await getCategories()

    // Initialiser les filtres depuis l'URL après chargement des catégories
    selectedCategory.value = getInitialCategory()
    selectedStatus.value = getInitialStatus()

    // Charger tous les projets
    const response = await listProjects({
      page: 1,
      limit: 100,
      status: selectedStatus.value !== 'all' ? selectedStatus.value as ProjectStatus : undefined,
      category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
    })

    projects.value = response.items
    totalProjects.value = response.total
  }
  catch (err) {
    console.error('Erreur lors du chargement des projets:', err)
    error.value = 'Une erreur est survenue lors du chargement des projets.'
  }
  finally {
    isLoading.value = false
  }
}

// Recharger quand les filtres changent
watch([selectedCategory, selectedStatus], async () => {
  await loadData()
}, { immediate: false })

// Chargement SSR du contenu éditorial
await useAsyncData('editorial-projects', () => loadContent())

onMounted(async () => {
  // Charger les chiffres-clés (non-bloquant)
  loadKeyFigures()
  // Charger les actualités liées aux projets (non-bloquant)
  loadProjectNews()
  // Charger les partenaires liés aux projets (non-bloquant)
  loadProjectPartners()
  // Charger les données
  await loadData()
})

// ============================================================================
// Computed & Helpers
// ============================================================================

// Show more functionality
const showAll = ref(false)
const visibleProjects = computed(() => {
  if (showAll.value) return projects.value
  return projects.value.slice(0, 4)
})

// Helper to get first category name
const getFirstCategoryName = (project: ProjectPublicDisplay) => {
  if (!project.categories || project.categories.length === 0) return ''
  return project.categories[0]?.name || ''
}

// Localization helpers
const getLocalizedTitle = (project: ProjectPublicDisplay) => {
  // Le backend renvoie un seul titre, pas de multilangue pour l'instant
  return project.title
}

// Convertit un contenu HTML (rich text) en texte brut pour un extrait (SSR-safe)
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ') // retire les balises
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, '\'')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const getLocalizedDescription = (project: ProjectPublicDisplay) => {
  // Le backend public renvoie summary_html / description_html (double colonne rich text).
  // On affiche un extrait : résumé si présent, sinon un morceau de la description détaillée.
  const raw = (project as any).summary_html
    || project.description_html
    || (project as any).summary
    || ''
  return raw ? htmlToPlainText(raw) : ''
}

// Stats - valeurs depuis l'admin avec fallback
const stats = computed(() => [
  {
    value: projects.value.filter(p => p.status === 'ongoing').length,
    label: getContent('projects.intro.stats.projects.label', 'projets.intro.stats.projects'),
  },
  {
    value: getFigure('stats_project_countries', '15+'),
    label: getContent('projects.intro.stats.countries.label', 'projets.intro.stats.countries'),
  },
  {
    value: getFigure('stats_project_beneficiaries', '10K+'),
    label: getContent('projects.intro.stats.beneficiaries.label', 'projets.intro.stats.beneficiaries'),
  },
])
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <span class="inline-block px-4 py-1.5 text-sm font-semibold text-brand-blue-900 bg-brand-blue-400 rounded-full mb-6">
            {{ getContent('projects.hero.badge', 'projets.hero.badge') }}
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {{ getContent('projects.hero.title', 'projets.hero.title') }}
          </h1>
          <p class="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            {{ getContent('projects.hero.subtitle', 'projets.hero.subtitle') }}
          </p>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <svg class="w-full h-12 md:h-16 text-white dark:text-gray-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
        </svg>
      </div>
    </section>

    <!-- Tab Bar / Navigation par ancres -->
    <FundraisingAnchorNav
      v-if="!isLoading && !error && anchorSections.length > 0"
      :key="anchorSections.map(s => s.id).join('-')"
      :sections="anchorSections"
    />

    <!-- Introduction Section -->
    <section id="presentation" class="py-16 bg-white dark:bg-gray-950 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-12">
          <h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            <span class="relative inline-block">
              {{ getContent('projects.intro.title', 'projets.intro.title') }}
              <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
            </span>
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            {{ getContent('projects.intro.description', 'projets.intro.description') }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-bold text-brand-blue-600 dark:text-brand-blue-400 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading state -->
    <section v-if="isLoading" class="py-16 bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600" />
        </div>
      </div>
    </section>

    <!-- Error state -->
    <section v-else-if="error" class="py-16 bg-gray-50 dark:bg-gray-900 bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-400 mb-4" />
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('common.error') }}</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
          <button
            class="px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 transition-colors"
            @click="loadData"
          >
            {{ t('common.retry') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <template v-else>
      <!-- All Projects -->
      <section id="projets" class="py-16 bg-white dark:bg-gray-950 bg-grid-pattern">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="mb-14 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            <span class="relative inline-block">
              {{ getContent('projects.list.title', 'projets.list.title') }}
              <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
            </span>
          </h2>

          <!-- Projects List : une occurrence par ligne, image + texte côte à côte -->
          <div v-if="visibleProjects.length > 0" class="space-y-14 lg:space-y-20">
            <article
              v-for="(project, index) in visibleProjects"
              :key="project.id"
              class="group grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <!-- Image -->
              <NuxtLink
                :to="localePath(`/projets/${project.slug}`)"
                class="relative block"
                :class="index % 2 === 1 ? 'lg:order-2' : ''"
              >
                <!-- Décorations derrière l'image -->
                <div class="absolute -right-3 -top-3 h-full w-full rounded-2xl bg-gradient-to-br from-brand-blue-500/20 to-brand-red-500/20 dark:from-brand-blue-500/10 dark:to-brand-red-500/10" />
                <div class="absolute -bottom-3 -left-3 h-full w-full rounded-2xl border-2 border-brand-blue-200 dark:border-brand-blue-800" />

                <div class="relative z-10 aspect-video overflow-hidden rounded-2xl shadow-xl">
                  <img
                    v-if="getCoverImageUrl(project, 'medium')"
                    :src="getCoverImageUrl(project, 'medium')!"
                    :alt="getLocalizedTitle(project)"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <font-awesome-icon icon="fa-solid fa-diagram-project" class="h-14 w-14 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </NuxtLink>

              <!-- Contenu -->
              <div :class="index % 2 === 1 ? 'lg:order-1' : ''">
                <!-- Badges -->
                <div class="mb-4 flex flex-wrap items-center gap-2">
                  <span v-if="getFirstCategoryName(project)" class="inline-block rounded px-2.5 py-1 text-xs font-medium text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30">
                    {{ getFirstCategoryName(project) }}
                  </span>
                  <span
                    class="inline-block rounded px-2.5 py-1 text-xs font-medium"
                    :class="{
                      'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30': project.status === 'ongoing',
                      'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30': project.status === 'completed',
                      'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30': project.status === 'planned',
                      'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30': project.status === 'suspended',
                    }"
                  >
                    {{ t(`projets.status.${project.status}`) }}
                  </span>
                </div>

                <!-- Titre -->
                <h3 class="mb-4 text-2xl font-bold leading-tight text-gray-900 dark:text-white md:text-3xl">
                  <NuxtLink
                    :to="localePath(`/projets/${project.slug}`)"
                    class="transition-colors hover:text-brand-blue-600 dark:hover:text-brand-blue-400"
                  >
                    {{ getLocalizedTitle(project) }}
                  </NuxtLink>
                </h3>

                <!-- Ligne décorative -->
                <div class="mb-5 flex items-center gap-3">
                  <div class="h-1 w-16 rounded-full bg-brand-red-500" />
                  <div class="h-1 w-8 rounded-full bg-brand-blue-300" />
                </div>

                <!-- Description -->
                <p v-if="getLocalizedDescription(project)" class="mb-6 line-clamp-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                  {{ getLocalizedDescription(project) }}
                </p>

                <!-- Bouton En savoir plus -->
                <NuxtLink
                  :to="localePath(`/projets/${project.slug}`)"
                  class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-brand-blue-700"
                >
                  {{ t('common.learnMore') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </NuxtLink>
              </div>
            </article>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-folder-open" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('projets.empty.title') }}</h3>
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('projets.empty.description') }}
            </p>
          </div>

          <!-- Show more button -->
          <div v-if="projects.length > 4" class="text-center mt-10">
            <button
              class="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              @click="showAll = !showAll"
            >
              {{ showAll ? t('projets.list.showLess') : t('projets.list.showMore') }}
              <font-awesome-icon
                :icon="showAll ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>
      </section>
    </template>

    <!-- Actualités liées à l'ensemble des projets -->
    <section
      v-if="projectNews.length > 0"
      id="actualites"
      class="bg-gray-50 py-16 dark:bg-gray-950 md:py-24"
    >
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 class="mb-3 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          <span class="relative inline-block">
            {{ t('projets.news.title') }}
            <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
          </span>
        </h2>
        <p class="mx-auto mb-14 max-w-lg text-center text-gray-500 dark:text-gray-400">
          {{ t('projets.news.subtitle') }}
        </p>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <NuxtLink
            v-for="item in projectNews"
            :key="item.id"
            :to="localePath(`/actualites/${item.slug}`)"
            class="group"
          >
            <!-- Image -->
            <div class="aspect-[16/10] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
              <img
                v-if="item.cover_image"
                :src="item.cover_image"
                :alt="localized(item, 'title')"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              >
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue-100 to-brand-blue-200 dark:from-brand-blue-900 dark:to-brand-blue-800">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="h-10 w-10 text-brand-blue-400/50" />
              </div>
            </div>

            <!-- Contenu -->
            <div class="mt-4">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-for="tag in item.tags"
                  :key="tag.slug"
                  class="text-xs font-medium text-brand-blue-600 dark:text-brand-blue-400"
                >
                  {{ tag.name }}
                </span>
                <span v-if="item.published_at" class="text-xs text-gray-400 dark:text-gray-500">
                  {{ formatNewsDate(item.published_at) }}
                </span>
              </div>
              <h3 class="mt-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-blue-600 dark:text-white dark:group-hover:text-brand-blue-400">
                {{ localized(item, 'title') }}
              </h3>
              <p v-if="localized(item, 'summary')" class="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {{ localized(item, 'summary') }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Partenaires de l'ensemble des projets -->
    <section
      v-if="projectPartners.length > 0"
      id="partenaires"
      class="bg-white py-16 dark:bg-gray-900 md:py-24"
    >
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 class="mb-3 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          <span class="relative inline-block">
            {{ t('projets.partners.title') }}
            <span class="absolute -bottom-2 left-0 h-1 w-1/3 rounded-full bg-gradient-to-r from-brand-blue-500 to-brand-blue-300" />
          </span>
        </h2>
        <p class="mx-auto mb-14 max-w-lg text-center text-gray-500 dark:text-gray-400">
          {{ t('projets.partners.subtitle') }}
        </p>

        <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          <component
            :is="partner.website ? 'a' : 'div'"
            v-for="partner in projectPartners"
            :key="partner.id"
            :href="partner.website || undefined"
            :target="partner.website ? '_blank' : undefined"
            :rel="partner.website ? 'noopener noreferrer' : undefined"
            class="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <!-- Logo -->
            <div class="flex h-24 w-full items-center justify-center">
              <img
                v-if="partner.logo_url"
                :src="partner.logo_url"
                :alt="partner.name"
                class="max-h-20 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              >
              <div v-else class="flex h-20 w-20 items-center justify-center rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30">
                <font-awesome-icon icon="fa-solid fa-handshake" class="h-9 w-9 text-brand-blue-400" />
              </div>
            </div>

            <!-- Nom -->
            <h3 class="mt-4 text-center text-sm font-semibold text-gray-900 transition-colors group-hover:text-brand-blue-600 dark:text-white dark:group-hover:text-brand-blue-400">
              {{ partner.name }}
            </h3>

            <!-- Lien site web -->
            <span
              v-if="partner.website"
              class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-blue-600 dark:text-brand-blue-400"
            >
              <font-awesome-icon icon="fa-solid fa-external-link-alt" class="h-3 w-3" />
              {{ t('partners.card.visitWebsite') }}
            </span>
          </component>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-brand-blue-500 to-brand-blue-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ getContent('projects.cta.title', 'projets.cta.title') }}
        </h2>
        <p class="text-lg text-brand-blue-100 mb-8">
          {{ getContent('projects.cta.description', 'projets.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/contact')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue-600 font-semibold rounded-lg hover:bg-brand-blue-50 transition-colors shadow-lg"
        >
          {{ getContent('projects.cta.button', 'projets.cta.button') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
