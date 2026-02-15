<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

// Contenus éditoriaux avec fallback sur i18n
const { getContent, loadContent } = useEditorialContent('team')

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()
})

// SEO
useSeoMeta({
  title: () => t('team.seo.title'),
  description: () => t('team.seo.description'),
  ogTitle: () => t('team.seo.title'),
  ogDescription: () => t('team.seo.description')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('about.tabs.team') }
])

// Animation pour la section CTA
const { elementRef: ctaRef } = useScrollAnimation({ animation: 'zoomIn', threshold: 0.2 })
</script>

<template>
  <div class="bg-grid-pattern">
    <!-- Hero -->
    <PageHero
      :title="getContent('team.hero.title')"
      :subtitle="getContent('team.hero.subtitle')"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Team Section avec filtres et grille -->
    <TeamSection />

    <!-- CTA Section -->
    <section class="py-16 lg:py-24 bg-gray-50 bg-grid-pattern dark:bg-gray-800 transition-colors duration-300">
      <div ref="ctaRef" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="bg-brand-blue-50 dark:bg-brand-blue-900/20 rounded-2xl p-8 lg:p-12 hover:shadow-xl transition-shadow duration-300">
          <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ getContent('team.cta.title') }}
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {{ getContent('team.cta.text') }}
          </p>
          <NuxtLink
            :to="localePath('/carrieres')"
            class="group inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-brand-blue-500/30 hover:-translate-y-0.5"
          >
            <font-awesome-icon icon="fa-solid fa-briefcase" class="w-5 h-5" />
            <span>{{ getContent('team.cta.button') }}</span>
            <font-awesome-icon
              :icon="isRtl ? 'fa-solid fa-arrow-left' : 'fa-solid fa-arrow-right'"
              class="w-4 h-4 transition-transform duration-300"
              :class="isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'"
            />
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
