<script setup lang="ts">
import type { ProgramPublic, ProgramPublicWithDetails } from '~/composables/usePublicProgramsApi'
import type { ApplicationCallPublic } from '~/types/api'
import type { OutputData } from '@editorjs/editorjs'

// Parser le contenu JSON EditorJS
const parseEditorContent = (content: string | null | undefined): OutputData | null => {
  if (!content) return null
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed as OutputData
    }
  } catch {
    // Si ce n'est pas du JSON valide, créer un bloc paragraphe
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ type: 'paragraph', data: { text: content } }],
        version: '2.28.0'
      }
    }
  }
  return null
}

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
const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  getProgramBySlug,
  getRelatedPrograms,
  formatDuration,
  urlSlugToProgramType,
  programTypeToUrlSlug,
  publicProgramTypeColors,
} = usePublicProgramsApi()

const {
  listCalls,
  callStatusColors,
} = usePublicCallsApi()

// Valid URL types
const validTypes = ['masters', 'doctorat', 'diplomes-universitaires', 'certifiantes']

// Get current type and slug from route
const typeSlug = computed(() => route.params.type as string)
const slug = computed(() => route.params.slug as string)
const isValidType = computed(() => validTypes.includes(typeSlug.value))

// State
const program = ref<ProgramPublicWithDetails | null>(null)
const relatedPrograms = ref<ProgramPublic[]>([])
const associatedCalls = ref<ApplicationCallPublic[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch program data
const fetchProgram = async () => {
  if (!isValidType.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Type de formation invalide',
    })
  }

  loading.value = true
  error.value = null

  try {
    const data = await getProgramBySlug(slug.value)

    // Verify type matches URL
    const expectedTypeSlug = programTypeToUrlSlug[data.type]
    if (expectedTypeSlug !== typeSlug.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formation non trouvée',
      })
    }

    program.value = data

    // Fetch related programs
    relatedPrograms.value = await getRelatedPrograms(data, 3)

    // Fetch associated application calls (only ongoing or upcoming)
    try {
      const callsResponse = await listCalls({
        program_id: data.id,
        limit: 5,
      })
      // Filter to show only ongoing and upcoming calls
      associatedCalls.value = callsResponse.items.filter(
        call => call.status === 'ongoing' || call.status === 'upcoming'
      )
    }
    catch (callErr) {
      console.warn('Could not fetch associated calls:', callErr)
      associatedCalls.value = []
    }
  }
  catch (err: unknown) {
    const fetchError = err as { statusCode?: number; statusMessage?: string; message?: string }
    if (fetchError.statusCode === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Formation non trouvée',
      })
    }
    error.value = fetchError.message || 'Erreur lors du chargement'
    console.error('Error fetching program:', err)
  }
  finally {
    loading.value = false
  }
}

// Fetch on mount
onMounted(() => {
  fetchProgram()
  updateTabFromHash()
})

// Also use useAsyncData for SSR
const { data: programData } = await useAsyncData(
  `program-${slug.value}`,
  async () => {
    try {
      const data = await getProgramBySlug(slug.value)
      // Verify type matches
      const expectedTypeSlug = programTypeToUrlSlug[data.type]
      if (expectedTypeSlug !== typeSlug.value) {
        return null
      }
      return data
    }
    catch {
      return null
    }
  },
)

// Initialize program from SSR data if available
if (programData.value) {
  program.value = programData.value
  loading.value = false
}

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!program.value) return ''
  // Le backend ne supporte pas encore la localisation, on retourne le titre principal
  return program.value.title
})

// Texte brut pour SEO et aperçus
const getLocalizedDescription = computed(() => {
  if (!program.value) return ''
  return extractPlainText(program.value.description)
})

// Description parsée pour EditorJSRenderer
const parsedDescription = computed(() => parseEditorContent(program.value?.description))

const getLocalizedDuration = computed(() => {
  if (!program.value) return ''
  return formatDuration(program.value.duration_months, locale.value)
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('formations.hero.title')}`,
  description: () => getLocalizedDescription.value,
  ogImage: () => program.value?.cover_image_external_id
    ? `/api/public/media/${program.value.cover_image_external_id}/download`
    : undefined,
})

// Type configuration
const typeConfig = computed(() => {
  if (!program.value) return publicProgramTypeColors.master
  return publicProgramTypeColors[program.value.type]
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.training'), to: '/carrieres#etudiants' },
  { label: t(`formations.types.${program.value?.type || typeSlug.value}`), to: `/formations/${typeSlug.value}` },
  { label: getLocalizedTitle.value },
])

// Get URL for related program
const getProgramUrl = (p: ProgramPublic) => {
  const pTypeSlug = programTypeToUrlSlug[p.type]
  return localePath(`/formations/${pTypeSlug}/${p.slug}`)
}

// Get localized title for related program
const getLocalizedTitleFor = (p: ProgramPublic) => {
  return p.title
}

// Tab navigation via hash
const activeTab = ref('presentation')

const updateTabFromHash = () => {
  const hash = route.hash?.replace('#', '')
  if (hash && ['presentation', 'actualites', 'mediatheque'].includes(hash)) {
    activeTab.value = hash
  } else {
    activeTab.value = 'presentation'
  }
}

watch(() => route.hash, updateTabFromHash)

// Accordion state for semesters
const openSemesters = ref<Set<number>>(new Set([1])) // Open first semester by default

const toggleSemester = (num: number) => {
  if (openSemesters.value.has(num)) {
    openSemesters.value.delete(num)
  }
  else {
    openSemesters.value.add(num)
  }
  // Force reactivity
  openSemesters.value = new Set(openSemesters.value)
}
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue-600 border-t-transparent mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('common.loading') }}
        </p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <div class="text-center max-w-md mx-auto px-4">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-500 mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('common.error') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ error }}
        </p>
        <NuxtLink
          :to="localePath(`/formations/${typeSlug}`)"
          class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
          {{ t('formations.detail.back') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="program">
      <!-- Hero Section -->
      <PageHero
        :title="getLocalizedTitle"
        :subtitle="t(`formations.typeDescriptions.${typeSlug}`)"
        image="/images/bg/backgroud_senghor2.jpg"
        :breadcrumb="breadcrumb"
      />

      <!-- Tabs -->
      <ProgramsProgramTabs :active-tab="activeTab" />

      <!-- Tab: Actualités -->
      <div v-if="activeTab === 'actualites'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProgramsProgramActualites :program-slug="slug" />
      </div>

      <!-- Tab: Médiathèque -->
      <div v-if="activeTab === 'mediatheque'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProgramsProgramMediatheque :program-slug="slug" />
      </div>

      <!-- Tab: Présentation (existing content) -->
      <div v-if="activeTab === 'presentation'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col lg:flex-row gap-12">
          <!-- Main content -->
          <article class="lg:w-2/3">
            <!-- Cover Image -->
            <div class="mb-8">
              <div class="relative h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-lg">
                <img
                  v-if="program.cover_image_external_id"
                  :src="`/api/public/media/${program.cover_image_external_id}/download`"
                  :alt="getLocalizedTitle"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                >
                  <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
                <!-- Gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <!-- Badges on image -->
                <div class="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
                  <!-- Type badge -->
                  <span
                    class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white rounded-full shadow-lg backdrop-blur-sm"
                    :class="typeConfig.bgColor"
                  >
                    <font-awesome-icon :icon="typeConfig.icon" class="w-4 h-4" />
                    {{ t(`formations.types.${program.type}`) }}
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div v-if="parsedDescription" class="mt-6">
                <EditorJSRenderer :data="parsedDescription" />
              </div>
            </div>

            <!-- Info cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <!-- Duration -->
              <div v-if="program.duration_months" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4" />
                  {{ t('formations.detail.duration') }}
                </div>
                <div class="font-bold text-gray-900 dark:text-white">
                  {{ getLocalizedDuration }}
                </div>
              </div>

              <!-- Credits -->
              <div v-if="program.credits" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <font-awesome-icon icon="fa-solid fa-award" class="w-4 h-4" />
                  {{ t('formations.detail.credits') }}
                </div>
                <div class="font-bold text-gray-900 dark:text-white">
                  {{ program.credits }} ECTS
                </div>
              </div>

              <!-- Diploma -->
              <div v-if="program.degree_awarded" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <font-awesome-icon icon="fa-solid fa-scroll" class="w-4 h-4" />
                  {{ t('formations.detail.diploma') }}
                </div>
                <div class="font-bold text-gray-900 dark:text-white text-sm">
                  {{ program.degree_awarded }}
                </div>
              </div>

              <!-- Required Degree -->
              <div v-if="program.required_degree" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <font-awesome-icon icon="fa-solid fa-user-graduate" class="w-4 h-4" />
                  {{ t('formations.detail.requiredDegree') }}
                </div>
                <div class="font-bold text-gray-900 dark:text-white text-sm">
                  {{ program.required_degree }}
                </div>
              </div>

              <!-- Champ disciplinaire (certificats uniquement) -->
              <div v-if="program.field_name" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <font-awesome-icon icon="fa-solid fa-layer-group" class="w-4 h-4" />
                  {{ t('formations.detail.field') }}
                </div>
                <div class="font-bold text-gray-900 dark:text-white text-sm">
                  {{ program.field_name }}
                </div>
              </div>

              <!-- Service -->
              <div v-if="program.service_name" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <font-awesome-icon icon="fa-solid fa-building" class="w-4 h-4" />
                  {{ t('formations.detail.service') }}
                </div>
                <div class="font-bold text-gray-900 dark:text-white text-sm">
                  {{ program.service_name }}
                </div>
              </div>
            </div>

            <!-- Skills section -->
            <div v-if="program.skills && program.skills.length > 0" class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {{ t('formations.detail.skills') }}
              </h2>
              <ul class="space-y-3">
                <li
                  v-for="skill in program.skills"
                  :key="skill.id"
                  class="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-check-circle"
                    class="w-5 h-5 text-brand-blue-500 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span class="font-medium">{{ skill.title }}</span>
                    <p v-if="skill.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {{ skill.description }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Program / Curriculum -->
            <div v-if="program.semesters && program.semesters.length > 0" class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {{ t('formations.detail.program') }}
              </h2>

              <div class="space-y-4">
                <div
                  v-for="semester in program.semesters"
                  :key="semester.id"
                  class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                  <!-- Semester header -->
                  <div
                    class="bg-gray-50 dark:bg-gray-800 px-5 py-4 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    @click="toggleSemester(semester.number)"
                  >
                    <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <span
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        :class="typeConfig.bgColor"
                      >
                        S{{ semester.number }}
                      </span>
                      {{ semester.title || `Semestre ${semester.number}` }}
                      <span v-if="semester.credits" class="text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({{ semester.credits }} {{ t('formations.card.credits') }})
                      </span>
                    </h3>
                    <font-awesome-icon
                      :icon="openSemesters.has(semester.number) ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"
                      class="w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform"
                    />
                  </div>

                  <!-- Semester courses -->
                  <div
                    v-show="openSemesters.has(semester.number)"
                    class="bg-white dark:bg-gray-900 px-5 py-4"
                  >
                    <ul class="space-y-2">
                      <li
                        v-for="course in semester.courses"
                        :key="course.id"
                        class="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <font-awesome-icon
                          icon="fa-solid fa-check"
                          class="w-4 h-4 text-brand-red-500 mt-1 flex-shrink-0"
                        />
                        <span>
                          {{ course.title }}
                          <span v-if="course.credits" class="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            ({{ course.credits }} {{ t('formations.card.credits') }})
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Career Opportunities -->
            <div v-if="program.career_opportunities && program.career_opportunities.length > 0" class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {{ t('formations.detail.careerOpportunities') }}
              </h2>
              <ul class="space-y-3">
                <li
                  v-for="opportunity in program.career_opportunities"
                  :key="opportunity.id"
                  class="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <font-awesome-icon
                    icon="fa-solid fa-briefcase"
                    class="w-5 h-5 text-brand-red-500 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span class="font-medium">{{ opportunity.title }}</span>
                    <p v-if="opportunity.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {{ opportunity.description }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Teaching Methods -->
            <div v-if="program.teaching_methods" class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {{ t('formations.detail.teachingMethods') }}
              </h2>
              <div class="prose dark:prose-invert max-w-none">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {{ program.teaching_methods }}
                </p>
              </div>
            </div>

            <!-- Back button -->
            <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
              <NuxtLink
                :to="localePath(`/formations/${typeSlug}`)"
                class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
                {{ t('formations.detail.back') }}
              </NuxtLink>
            </div>

          </article>

          <!-- Sidebar -->
          <aside class="lg:w-1/3">
            <div class="sticky top-24 space-y-6">
              <!-- Formation summary card -->
              <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {{ getLocalizedTitle }}
                </h3>
                <p v-if="getLocalizedDescription" class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {{ getLocalizedDescription }}
                </p>
                <div class="space-y-3 text-sm">
                  <div v-if="program.duration_months" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.duration') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ getLocalizedDuration }}
                    </span>
                  </div>
                  <div v-if="program.credits" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.credits') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ program.credits }} ECTS
                    </span>
                  </div>
                  <div v-if="program.field_name" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.field') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ program.field_name }}
                    </span>
                  </div>
                  <div v-if="program.service_name" class="flex items-center justify-between">
                    <span class="text-gray-500 dark:text-gray-400">{{ t('formations.detail.service') }}</span>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ program.service_name }}
                    </span>
                  </div>
                </div>

                <!-- Associated application calls -->
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 class="text-base font-bold text-brand-red-600 dark:text-brand-red-400 mb-4">
                    {{ t('formations.detail.associatedCalls') }}
                  </h4>

                  <!-- Show calls if any -->
                  <div v-if="associatedCalls.length > 0" class="space-y-3">
                    <NuxtLink
                      v-for="call in associatedCalls"
                      :key="call.id"
                      :to="localePath(`/actualites/appels/${call.slug}`)"
                      class="call-card-animated group"
                    >
                      <div class="call-card-content">
                        <div class="flex items-center gap-2 mb-2">
                          <span
                            class="inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                            :class="callStatusColors[call.status]"
                          >
                            {{ t(`formations.detail.callStatus.${call.status}`) }}
                          </span>
                          <font-awesome-icon
                            v-if="call.status === 'ongoing'"
                            icon="fa-solid fa-arrow-right"
                            class="w-3 h-3 text-brand-blue-500 animate-bounce-x"
                          />
                        </div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors line-clamp-2">
                          {{ call.title }}
                        </p>
                        <p v-if="call.deadline" class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <font-awesome-icon icon="fa-solid fa-clock" class="w-3 h-3" />
                          {{ t('formations.detail.deadline') }}: {{ new Date(call.deadline).toLocaleDateString(locale) }}
                        </p>
                      </div>
                    </NuxtLink>
                  </div>

                  <!-- No calls message -->
                  <div v-else class="text-center py-4">
                    <font-awesome-icon icon="fa-solid fa-calendar-xmark" class="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p class="text-sm font-bold text-brand-red-600 dark:text-brand-red-400">
                      {{ t('formations.detail.noOpenCalls') }}
                    </p>
                    <NuxtLink
                      :to="localePath('/actualites/appels')"
                      class="inline-block mt-2 text-sm text-brand-blue-600 dark:text-brand-blue-400 hover:underline"
                    >
                      {{ t('formations.detail.viewAllCalls') }}
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <!-- Back to list -->
              <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {{ t(`formations.types.${program.type}`) }}
                </h3>
                <NuxtLink
                  :to="localePath(`/formations/${typeSlug}`)"
                  class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
                >
                  {{ t('formations.detail.back') }}
                  <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </aside>
        </div>

        <!-- Related formations (après les deux colonnes) -->
        <section v-if="relatedPrograms.length > 0" class="mt-12">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <span class="relative inline-block">
              {{ t('formations.detail.relatedFormations') }}
              <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full" />
            </span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NuxtLink
              v-for="related in relatedPrograms"
              :key="related.id"
              :to="getProgramUrl(related)"
              class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div class="overflow-hidden h-32">
                <img
                  v-if="related.cover_image_external_id"
                  :src="`/api/public/media/${related.cover_image_external_id}/download?variant=low`"
                  :alt="getLocalizedTitleFor(related)"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                >
                <div
                  v-else
                  class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                >
                  <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-block px-2 py-0.5 text-xs font-medium text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30 rounded">
                    {{ t(`formations.types.${related.type}`) }}
                  </span>
                </div>

                <h3 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                  {{ getLocalizedTitleFor(related) }}
                </h3>
              </div>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Carte d'appel avec bordure animée gradient */
.call-card-animated {
  position: relative;
  display: block;
  border-radius: 0.5rem;
  text-decoration: none;
  isolation: isolate;
}

.call-card-animated::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    #1e40af,
    #3b82f6,
    #dc2626,
    #ef4444,
    #1e40af,
    #3b82f6,
    #dc2626,
    #ef4444
  );
  background-size: 400%;
  border-radius: 0.5rem;
  animation: gradient-flow 8s linear infinite;
  z-index: 0;
}

.call-card-animated::after {
  content: '';
  position: absolute;
  inset: -4px;
  background: linear-gradient(
    45deg,
    #1e40af,
    #3b82f6,
    #dc2626,
    #ef4444,
    #1e40af,
    #3b82f6,
    #dc2626,
    #ef4444
  );
  background-size: 400%;
  border-radius: 0.75rem;
  animation: gradient-flow 8s linear infinite;
  filter: blur(12px);
  opacity: 0.5;
  z-index: -1;
}

.call-card-animated:hover::before,
.call-card-animated:hover::after {
  animation-duration: 3s;
}

.call-card-animated:hover::after {
  filter: blur(16px);
  opacity: 0.7;
}

@keyframes gradient-flow {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 400% 0;
  }
  100% {
    background-position: 0 0;
  }
}

.call-card-content {
  position: relative;
  background: white;
  border-radius: calc(0.5rem - 2px);
  padding: 0.75rem;
  margin: 2px;
  z-index: 1;
  transition: background-color 0.3s ease;
}

.dark .call-card-content {
  background: rgb(17 24 39);
}

/* Animation de flèche rebondissante horizontale */
@keyframes bounce-x {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
}

.animate-bounce-x {
  animation: bounce-x 1s ease-in-out infinite;
}
</style>
