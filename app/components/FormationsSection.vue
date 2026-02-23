<script setup lang="ts">
import type { ProgramPublic } from '~/composables/usePublicProgramsApi'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const {
  listFeaturedPrograms,
  formatDuration,
  programTypeToUrlSlug,
} = usePublicProgramsApi()

// Contenus éditoriaux avec fallback sur i18n
const { getContent } = useEditorialContent('homepage')

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: cardsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Programmes à la une
const featuredPrograms = ref<ProgramPublic[]>([])
const loading = ref(true)

onMounted(async () => {
  // Charger les programmes à la une depuis l'API (contenus éditoriaux chargés par la page parente via SSR)
  try {
    featuredPrograms.value = await listFeaturedPrograms(4)
  } catch (e) {
    console.error('Erreur lors du chargement des programmes à la une:', e)
  } finally {
    loading.value = false
  }
})

// Type badge colors
const typeBgColors: Record<string, string> = {
  master: 'bg-brand-blue-500',
  doctorate: 'bg-brand-red-600',
  university_diploma: 'bg-brand-blue-600',
  certificate: 'bg-brand-red-500'
}

// Get localized title (pour l'instant, on utilise le titre principal)
const getLocalizedTitle = (program: ProgramPublic) => {
  return program.title
}

// Extract plain text from EditorJS JSON
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .filter((block: { type: string }) => block.type === 'paragraph' || block.type === 'header')
        .map((block: { data: { text: string } }) => {
          const text = block.data?.text || ''
          return text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
        })
        .join(' ')
        .trim()
    }
  } catch {
    // Not JSON, return as-is
  }
  return content
}

// Get localized description
const getLocalizedDescription = (program: ProgramPublic) => {
  return extractPlainText(program.description)
}

// Get localized duration
const getLocalizedDuration = (program: ProgramPublic) => {
  return formatDuration(program.duration_months, locale.value)
}

// Detail page URL
const getDetailUrl = (program: ProgramPublic) => {
  const typeSlug = programTypeToUrlSlug[program.type]
  return localePath(`/formations/${typeSlug}/${program.slug}`)
}

// Image URL (null if no image available)
const getImageUrl = (program: ProgramPublic) => {
  if (program.cover_image_external_id) {
    return `/api/public/media/${program.cover_image_external_id}/download?variant=medium`
  }
  return null
}
</script>

<template>
  <section class="relative py-16 lg:py-24 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
    <!-- Header -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
      <div ref="headerRef" class="text-center mb-12 lg:mb-16">
        <NuxtLink
          :to="localePath('/nousrejoindre') + '#etudiants'"
          class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-700 dark:text-brand-blue-400 mb-4 hover:bg-brand-blue-200 dark:hover:bg-brand-blue-900/50 transition-colors cursor-pointer"
        >
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5 mr-2" />
          {{ getContent('formations.badge', 'formations.index.featured.badge') }}
        </NuxtLink>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="relative inline-block">
            {{ getContent('formations.title', 'formations.index.featured.title') }}
            <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ getContent('formations.subtitle', 'formations.index.subtitle') }}
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="featuredPrograms.length === 0" class="text-center py-20">
        <p class="text-gray-500 dark:text-gray-400">
          {{ t('formations.index.noFeatured') }}
        </p>
      </div>

      <!-- Formations Grid - flex layout like original design -->
      <div v-else ref="cardsRef" class="px-5 grid sm:grid-cols-2 xl:flex items-center justify-center gap-8 lg:gap-16 xl:gap-20 mb-16">
        <article
          v-for="program in featuredPrograms"
          :key="program.id"
          class="group"
        >
          <div class="relative">
            <!-- Image -->
            <img
              v-if="getImageUrl(program)"
              :src="getImageUrl(program)!"
              :alt="getLocalizedTitle(program)"
              class="w-full aspect-[3/2] lg:aspect-[3/4] h-44 lg:h-[26rem] xl:h-[24rem] object-cover shadow-lg"
            />
            <div v-else class="w-full aspect-[3/2] lg:aspect-[3/4] h-44 lg:h-[26rem] xl:h-[24rem] bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg">
              <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>

            <!-- Overlay Card - positioned to the right of image on lg+ -->
            <div class="lg:rounded-l-[30px] lg:rounded-t-[30px] bg-white dark:bg-gray-800 lg:absolute bottom-6 -right-10 xl:-right-8 lg:w-[16rem] xl:w-[14rem] px-6 xl:px-5 py-5 lg:h-80 xl:h-72 shadow-lg transition-all duration-300 group-hover:shadow-xl">
              <!-- Duration -->
              <span class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <font-awesome-icon icon="fa-solid fa-clock" class="w-3.5 h-3.5 text-brand-red-500" />
                {{ getLocalizedDuration(program) }}
              </span>

              <!-- Title -->
              <h3 class="text-xl xl:text-lg font-bold leading-tight mt-1.5 mb-2.5 text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors line-clamp-2">
                {{ getLocalizedTitle(program) }}
              </h3>

              <!-- Type badge -->
              <span
                :class="[typeBgColors[program.type] || 'bg-gray-500']"
                class="inline-block text-white text-xs px-2 py-0.5 rounded capitalize"
              >
                {{ t(`formations.types.${program.type}`) }}
              </span>

              <!-- Description -->
              <p class="text-gray-700 dark:text-gray-300 my-5 xl:my-3 leading-relaxed text-sm line-clamp-3 xl:line-clamp-2">
                {{ getLocalizedDescription(program) }}
              </p>

              <!-- Read more link -->
              <NuxtLink
                :to="getDetailUrl(program)"
                class="flex justify-end items-center uppercase text-brand-blue-600 dark:text-brand-blue-400 font-semibold text-sm hover:text-brand-blue-500 transition-colors"
              >
                <span class="mr-4 block w-10 h-0.5 bg-brand-blue-600 dark:bg-brand-blue-400 transition-all group-hover:w-14"></span>
                {{ t('formations.card.viewDetails') }}
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- CTA Button -->
      <div class="text-center relative z-10">
        <NuxtLink
          :to="localePath('/nousrejoindre') + '#etudiants'"
          class="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {{ getContent('formations.cta', 'formations.index.viewAll') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- Decorative bottom shape - same color as HistorySection to create overlap effect -->
    <div class="bg-white dark:bg-gray-950 absolute bottom-0 w-full h-[25vh] rounded-tr-[14rem]">
      <!-- Grid pattern on bottom shape -->
      <div class="absolute inset-0 rounded-tr-[14rem] bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
    </div>
  </section>
</template>
