<script setup lang="ts">
import type { ProgramPublic } from '~/composables/usePublicProgramsApi'

// Extraire le texte brut d'un contenu EditorJS (pour les aperçus)
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: { type: string; data: { text?: string } }) => {
          if (block.data?.text) {
            // Supprimer les balises HTML éventuelles
            return block.data.text.replace(/<[^>]*>/g, '')
          }
          return ''
        })
        .filter(Boolean)
        .join(' ')
    }
  } catch {
    // Si ce n'est pas du JSON valide, retourner tel quel
    return content
  }
  return content
}

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const {
  listProgramsByType,
  urlSlugToProgramType,
  programTypeToUrlSlug,
  publicProgramTypeColors,
} = usePublicProgramsApi()

// Valid types for route validation
const validTypes = ['masters', 'doctorats', 'diplomes-universitaires', 'certifiantes']

// Get current type from route
const typeSlug = computed(() => route.params.type as string)
const programType = computed(() => urlSlugToProgramType[typeSlug.value])
const isValidType = computed(() => validTypes.includes(typeSlug.value))

// State
const programs = ref<ProgramPublic[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Other types data for sidebar
const otherTypesData = ref<Record<string, ProgramPublic[]>>({})

// 404 if invalid type
if (!isValidType.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Formation type not found',
  })
}

// Fetch programs
const fetchPrograms = async () => {
  if (!programType.value) return

  loading.value = true
  error.value = null

  try {
    programs.value = await listProgramsByType(programType.value)

    // Fetch other types for sidebar
    for (const slug of validTypes) {
      if (slug !== typeSlug.value) {
        const type = urlSlugToProgramType[slug]
        if (type) {
          otherTypesData.value[slug] = await listProgramsByType(type)
        }
      }
    }
  }
  catch (err: unknown) {
    const fetchError = err as { message?: string }
    error.value = fetchError.message || 'Erreur lors du chargement'
    console.error('Error fetching programs:', err)
  }
  finally {
    loading.value = false
  }
}

// Fetch on mount
onMounted(fetchPrograms)

// SSR data
const { data: programsData } = await useAsyncData(
  `programs-${typeSlug.value}`,
  async () => {
    if (!programType.value) return []
    try {
      return await listProgramsByType(programType.value)
    }
    catch {
      return []
    }
  },
)

// Initialize from SSR
if (programsData.value && programsData.value.length > 0) {
  programs.value = programsData.value
  loading.value = false
}

// SEO
useSeoMeta({
  title: () => t('formations.seo.titleType', { type: t(`formations.types.${typeSlug.value}`) }),
  description: () => t('formations.seo.descriptionType', { type: t(`formations.types.${typeSlug.value}`) }),
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.training'), to: '/carrieres#etudiants' },
  { label: t(`formations.types.${typeSlug.value}`) },
])

// Other formation types for sidebar
const otherTypes = computed(() => {
  return validTypes
    .filter(slug => slug !== typeSlug.value)
    .map((slug) => {
      const typePrograms = otherTypesData.value[slug] || []
      return {
        slug,
        label: t(`formations.types.${slug}`),
        programs: typePrograms.slice(0, 3),
        count: typePrograms.length,
        icon: slug === 'masters'
          ? 'fa-graduation-cap'
          : slug === 'doctorats'
            ? 'fa-user-graduate'
            : slug === 'diplomes-universitaires'
              ? 'fa-certificate'
              : 'fa-award',
        color: slug === 'masters'
          ? 'bg-indigo-500'
          : slug === 'doctorats'
            ? 'bg-purple-600'
            : slug === 'diplomes-universitaires'
              ? 'bg-teal-500'
              : 'bg-rose-500',
      }
    })
})

// Get localized title for program
const getLocalizedTitle = (p: ProgramPublic) => {
  // Backend doesn't support localization yet, return main title
  return p.title
}

// Get thumbnail version of image
const getThumbnail = (p: ProgramPublic) => {
  if (p.cover_image_external_id) {
    return `/api/media/${p.cover_image_external_id}?w=100&h=100`
  }
  return `https://picsum.photos/seed/${p.slug}/100/100`
}

// Get program URL
const getProgramUrl = (p: ProgramPublic) => {
  const pTypeSlug = programTypeToUrlSlug[p.type]
  return localePath(`/formations/${pTypeSlug}/${p.slug}`)
}

// Type config for current type
const typeConfig = computed(() => {
  if (!programType.value) return publicProgramTypeColors.master
  return publicProgramTypeColors[programType.value]
})
</script>

<template>
  <div v-if="isValidType">
    <!-- Hero -->
    <PageHero
      :title="t(`formations.types.${typeSlug}`)"
      :subtitle="t(`formations.typeDescriptions.${typeSlug}`)"
      image="/images/bg/backgroud_senghor2.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Loading state -->
    <section v-if="loading" class="py-16 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-600 border-t-transparent mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400">
              {{ t('common.loading') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Error state -->
    <section v-else-if="error" class="py-16 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-500 mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ t('common.error') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ error }}
          </p>
          <button
            class="px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium rounded-lg transition-colors"
            @click="fetchPrograms"
          >
            {{ t('common.retry') || 'Réessayer' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section v-else class="py-12 bg-white dark:bg-gray-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Main Content -->
          <div class="flex-1">
            <!-- Programs Grid -->
            <div v-if="programs.length > 0" class="grid md:grid-cols-2 gap-6">
              <NuxtLink
                v-for="program in programs"
                :key="program.id"
                :to="getProgramUrl(program)"
                class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <!-- Image -->
                <div class="relative h-48 overflow-hidden">
                  <img
                    :src="program.cover_image_external_id
                      ? `/api/media/${program.cover_image_external_id}`
                      : `https://picsum.photos/seed/${program.slug}/600/400`"
                    :alt="getLocalizedTitle(program)"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                  <!-- Gradient overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <!-- Type badge -->
                  <div class="absolute bottom-3 left-3">
                    <span
                      class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white rounded-full shadow-lg backdrop-blur-sm"
                      :class="typeConfig.bgColor"
                    >
                      <font-awesome-icon :icon="typeConfig.icon" class="w-3 h-3" />
                      {{ t(`formations.types.${program.type}`) }}
                    </span>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-5">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                    {{ getLocalizedTitle(program) }}
                  </h3>

                  <p v-if="program.description" class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {{ extractPlainText(program.description) }}
                  </p>

                  <!-- Meta info -->
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span v-if="program.duration_months" class="flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4" />
                      {{ program.duration_months }} mois
                    </span>
                    <span v-if="program.credits" class="flex items-center gap-1">
                      <font-awesome-icon icon="fa-solid fa-award" class="w-4 h-4" />
                      {{ program.credits }} ECTS
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <font-awesome-icon icon="fa-solid fa-folder-open" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {{ t('formations.empty.title') }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                {{ t('formations.empty.description') }}
              </p>
            </div>

            <!-- Back link -->
            <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <NuxtLink
                :to="localePath('/carrieres') + '#etudiants'"
                class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
                {{ t('formations.detail.back') }}
              </NuxtLink>
            </div>
          </div>

          <!-- Sidebar - Other Formation Types -->
          <aside class="lg:w-80 flex-shrink-0">
            <div class="sticky top-24 space-y-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <font-awesome-icon icon="fa-solid fa-compass" class="w-5 h-5 text-brand-red-500" />
                {{ t('formations.sidebar.otherTypes') }}
              </h3>

              <!-- Other types cards -->
              <div
                v-for="type in otherTypes"
                :key="type.slug"
                class="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden"
              >
                <!-- Type header -->
                <NuxtLink
                  :to="localePath(`/formations/${type.slug}`)"
                  class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      :class="type.color"
                    >
                      <font-awesome-icon :icon="`fa-solid ${type.icon}`" class="w-4 h-4" />
                    </span>
                    <span class="font-semibold text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                      {{ type.label }}
                    </span>
                  </div>
                  <span class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full flex-shrink-0">
                    {{ type.count }}
                  </span>
                </NuxtLink>

                <!-- Sample programs with thumbnails -->
                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                  <NuxtLink
                    v-for="program in type.programs"
                    :key="program.id"
                    :to="getProgramUrl(program)"
                    class="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <!-- Thumbnail -->
                    <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      <img
                        :src="getThumbnail(program)"
                        :alt="getLocalizedTitle(program)"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      >
                    </div>
                    <!-- Title -->
                    <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors line-clamp-2 leading-tight">
                      {{ getLocalizedTitle(program) }}
                    </span>
                  </NuxtLink>
                </div>

                <!-- View all link -->
                <NuxtLink
                  :to="localePath(`/formations/${type.slug}`)"
                  class="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {{ t('formations.sidebar.viewAll') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-3 h-3" />
                </NuxtLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-brand-blue-500 to-brand-blue-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ t('formations.cta.title') }}
        </h2>
        <p class="text-lg text-brand-blue-100 mb-8">
          {{ t('formations.cta.description') }}
        </p>
        <NuxtLink
          :to="localePath('/actualites/appels')"
          class="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue-600 font-semibold rounded-lg hover:bg-brand-blue-50 transition-colors shadow-lg"
        >
          {{ t('formations.cta.button') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
