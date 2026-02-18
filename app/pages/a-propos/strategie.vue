<script setup lang="ts">
const { t } = useI18n()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('strategy')
const { getMediaUrl } = useMediaApi()

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()
})

// SEO
useSeoMeta({
  title: () => t('strategy.seo.title'),
  description: () => t('strategy.seo.description'),
  ogTitle: () => t('strategy.seo.title'),
  ogDescription: () => t('strategy.seo.description')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/a-propos' },
  { label: t('about.tabs.strategy') }
])

// Helper to get objectives array from editorial content
const getObjectives = (axisKey: string) => [
  getContent(`strategy.axes.items.${axisKey}.objective1`),
  getContent(`strategy.axes.items.${axisKey}.objective2`),
  getContent(`strategy.axes.items.${axisKey}.objective3`)
]

// Strategic Axes Data
const strategicAxes = computed(() => [
  {
    id: 'a1',
    code: getContent('strategy.axes.items.a1.code'),
    icon: 'graduation-cap',
    color: 'amber' as const,
    title: getContent('strategy.axes.items.a1.title'),
    description: getContent('strategy.axes.items.a1.description'),
    objectives: getObjectives('a1')
  },
  {
    id: 'a2',
    code: getContent('strategy.axes.items.a2.code'),
    icon: 'building',
    color: 'blue' as const,
    title: getContent('strategy.axes.items.a2.title'),
    description: getContent('strategy.axes.items.a2.description'),
    objectives: getObjectives('a2')
  },
  {
    id: 'a3',
    code: getContent('strategy.axes.items.a3.code'),
    icon: 'globe',
    color: 'emerald' as const,
    title: getContent('strategy.axes.items.a3.title'),
    description: getContent('strategy.axes.items.a3.description'),
    objectives: getObjectives('a3')
  }
])

// Target Indicators for 2030
const targetIndicators = computed(() => [
  { value: '500', suffix: '+', label: getContent('strategy.indicators.items.students') },
  { value: '25', suffix: '', label: getContent('strategy.indicators.items.programs') },
  { value: '50', suffix: '%', label: getContent('strategy.indicators.items.women') },
  { value: '90', suffix: '%', label: getContent('strategy.indicators.items.insertion') }
])

</script>

<template>
  <div class="bg-grid-pattern">
    <!-- Hero -->
    <PageHero
      :title="getContent('strategy.hero.title')"
      :subtitle="getContent('strategy.hero.subtitle')"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Strategic Plan Section -->
    <StrategyStrategicPlanSection
      :title="getContent('strategy.plan.title')"
      :summary="getContent('strategy.plan.summary')"
      :cover-image="getMediaUrl(getRawContent('strategy.plan.image') ?? '', 'medium') || undefined"
      :pdf-url="getMediaUrl(getRawContent('strategy.plan.download_url') ?? '') || getRawContent('strategy.plan.download_url') || '/documents/plan-strategique-2024-2030.pdf'"
      :pdf-label="getContent('strategy.plan.download')"
    />

    <!-- Strategic Axes Section -->
    <StrategyStrategicAxesSection
      :title="getContent('strategy.axes.title')"
      :subtitle="getContent('strategy.axes.subtitle')"
      :axes="strategicAxes"
    />

    <!-- Target Indicators Section -->
    <!-- <StrategyTargetIndicatorsSection
      :title="getContent('strategy.indicators.title')"
      :subtitle="getContent('strategy.indicators.subtitle')"
      :indicators="targetIndicators"
      background-image="/images/bg/bg_stats_section.jpeg"
    /> -->

  </div>
</template>
