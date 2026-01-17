<script setup lang="ts">
import type { Formation } from '~/composables/useMockData'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getFormationsFeatured } = useMockData()

const { elementRef: headerRef } = useScrollAnimation({ animation: 'fadeInDown' })
const { elementRef: cardsRef } = useScrollAnimation({ animation: 'fadeInUp', threshold: 0.1 })

// Get 4 featured formations
const featuredFormations = computed(() => getFormationsFeatured().slice(0, 4))

// Mapping type to URL slug
const typeToSlug: Record<string, string> = {
  master: 'masters',
  doctorat: 'doctorats',
  du: 'diplomes-universitaires',
  certifiante: 'certifiantes'
}

// Type badge colors
const typeBgColors: Record<string, string> = {
  master: 'bg-brand-blue-500',
  doctorat: 'bg-brand-red-600',
  du: 'bg-brand-blue-600',
  certifiante: 'bg-brand-red-500'
}

// Get localized title
const getLocalizedTitle = (formation: Formation) => {
  if (locale.value === 'en' && formation.title_en) return formation.title_en
  if (locale.value === 'ar' && formation.title_ar) return formation.title_ar
  return formation.title_fr
}

// Get localized description
const getLocalizedDescription = (formation: Formation) => {
  if (locale.value === 'en' && formation.short_description_en) return formation.short_description_en
  return formation.short_description_fr
}

// Get localized duration
const getLocalizedDuration = (formation: Formation) => {
  if (locale.value === 'en' && formation.duration_en) return formation.duration_en
  return formation.duration_fr
}

// Detail page URL
const getDetailUrl = (formation: Formation) => {
  const typeSlug = typeToSlug[formation.formation_type]
  return localePath(`/formations/${typeSlug}/${formation.slug}`)
}

// Image URL with fallback
const getImageUrl = (formation: Formation) => {
  return formation.image || `https://picsum.photos/seed/${formation.slug}/800/600`
}
</script>

<template>
  <section class="relative py-16 lg:py-24 bg-gray-100 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
    <!-- Header -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
      <div ref="headerRef" class="text-center mb-12 lg:mb-16">
        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-graduation-cap" class="w-3.5 h-3.5 mr-2" />
          {{ t('formations.index.featured.badge') }}
        </span>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {{ t('formations.index.featured.title') }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('formations.index.subtitle') }}
        </p>
      </div>

      <!-- Formations Grid - flex layout like original design -->
      <div ref="cardsRef" class="px-5 grid sm:grid-cols-2 xl:flex items-center justify-center gap-8 lg:gap-16 xl:gap-20 mb-16">
        <article
          v-for="formation in featuredFormations"
          :key="formation.id"
          class="group"
        >
          <div class="relative">
            <!-- Image -->
            <img
              :src="getImageUrl(formation)"
              :alt="getLocalizedTitle(formation)"
              class="w-full aspect-[3/2] lg:aspect-[3/4] h-44 lg:h-[26rem] xl:h-[24rem] object-cover shadow-lg"
            />

            <!-- Application open badge -->
            <span
              v-if="formation.application_open"
              class="absolute top-3 left-3 px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-full flex items-center gap-1.5 z-10 shadow-md"
            >
              <span class="w-2 h-2 bg-white rounded-full animate-pulse" />
              {{ t('formations.card.applicationOpen') }}
            </span>

            <!-- Overlay Card - positioned to the right of image on lg+ -->
            <div class="lg:rounded-l-[30px] lg:rounded-t-[30px] bg-white dark:bg-gray-800 lg:absolute bottom-6 -right-10 xl:-right-8 lg:w-[16rem] xl:w-[14rem] px-6 xl:px-5 py-5 lg:h-80 xl:h-72 shadow-lg transition-all duration-300 group-hover:shadow-xl">
              <!-- Duration -->
              <span class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <font-awesome-icon icon="fa-solid fa-clock" class="w-3.5 h-3.5 text-amber-500" />
                {{ getLocalizedDuration(formation) }}
              </span>

              <!-- Title -->
              <h3 class="text-xl xl:text-lg font-bold leading-tight mt-1.5 mb-2.5 text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                {{ getLocalizedTitle(formation) }}
              </h3>

              <!-- Campus -->
              <span class="inline-block text-amber-500 dark:text-amber-400 text-sm capitalize hover:underline">
                {{ t(`formations.campus.${formation.campus}`) }}
              </span>

              <!-- Description -->
              <p class="text-gray-700 dark:text-gray-300 my-5 xl:my-3 leading-relaxed text-sm line-clamp-3 xl:line-clamp-2">
                {{ getLocalizedDescription(formation) }}
              </p>

              <!-- Read more link -->
              <NuxtLink
                :to="getDetailUrl(formation)"
                class="flex justify-end items-center uppercase text-amber-600 dark:text-amber-400 font-semibold text-sm hover:text-amber-500 transition-colors"
              >
                <span class="mr-4 block w-10 h-0.5 bg-amber-600 dark:bg-amber-400 transition-all group-hover:w-14"></span>
                {{ t('formations.card.viewDetails') }}
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- CTA Button -->
      <div class="text-center relative z-10">
        <NuxtLink
          :to="localePath('/carrieres') + '#etudiants'"
          class="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {{ t('formations.index.viewAll') }}
          <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- Decorative bottom shape -->
    <div class="bg-gray-200 dark:bg-gray-800 absolute bottom-0 w-full h-[25vh] rounded-tr-[14rem]"></div>
  </section>
</template>
