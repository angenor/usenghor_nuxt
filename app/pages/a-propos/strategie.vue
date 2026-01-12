<script setup lang="ts">
const { t } = useI18n()

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

// Helper to get objectives array from i18n keys
const getObjectives = (axisKey: string) => [
  t(`strategy.axes.items.${axisKey}.objective1`),
  t(`strategy.axes.items.${axisKey}.objective2`),
  t(`strategy.axes.items.${axisKey}.objective3`)
]

// Strategic Axes Data
const strategicAxes = computed(() => [
  {
    id: 'a1',
    code: t('strategy.axes.items.a1.code'),
    icon: 'graduation-cap',
    color: 'amber' as const,
    title: t('strategy.axes.items.a1.title'),
    description: t('strategy.axes.items.a1.description'),
    objectives: getObjectives('a1')
  },
  {
    id: 'a2',
    code: t('strategy.axes.items.a2.code'),
    icon: 'building',
    color: 'blue' as const,
    title: t('strategy.axes.items.a2.title'),
    description: t('strategy.axes.items.a2.description'),
    objectives: getObjectives('a2')
  },
  {
    id: 'a3',
    code: t('strategy.axes.items.a3.code'),
    icon: 'globe',
    color: 'emerald' as const,
    title: t('strategy.axes.items.a3.title'),
    description: t('strategy.axes.items.a3.description'),
    objectives: getObjectives('a3')
  }
])

// Target Indicators for 2030
const targetIndicators = computed(() => [
  { value: '500', suffix: '+', label: t('strategy.indicators.items.students') },
  { value: '25', suffix: '', label: t('strategy.indicators.items.programs') },
  { value: '50', suffix: '%', label: t('strategy.indicators.items.women') },
  { value: '90', suffix: '%', label: t('strategy.indicators.items.insertion') }
])

// Fundraising Projects
const fundraisingProjects = computed(() => [
  {
    id: 'scholarships',
    icon: 'graduation-cap',
    title: t('strategy.fundraising.projects.scholarships.title'),
    description: t('strategy.fundraising.projects.scholarships.description'),
    amount: t('strategy.fundraising.projects.scholarships.amount')
  },
  {
    id: 'campus',
    icon: 'building',
    title: t('strategy.fundraising.projects.campus.title'),
    description: t('strategy.fundraising.projects.campus.description'),
    amount: t('strategy.fundraising.projects.campus.amount')
  },
  {
    id: 'research',
    icon: 'flask',
    title: t('strategy.fundraising.projects.research.title'),
    description: t('strategy.fundraising.projects.research.description'),
    amount: t('strategy.fundraising.projects.research.amount')
  },
  {
    id: 'library',
    icon: 'book',
    title: t('strategy.fundraising.projects.library.title'),
    description: t('strategy.fundraising.projects.library.description'),
    amount: t('strategy.fundraising.projects.library.amount')
  }
])
</script>

<template>
  <div>
    <!-- Hero -->
    <PageHero
      :title="t('strategy.hero.title')"
      :subtitle="t('strategy.hero.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Strategic Plan Section -->
    <StrategyStrategicPlanSection
      :title="t('strategy.plan.title')"
      :summary="t('strategy.plan.summary')"
      cover-image="https://picsum.photos/seed/strategic-plan-cover/800/600"
      pdf-url="/documents/plan-strategique-2024-2030.pdf"
      :pdf-label="t('strategy.plan.download')"
    />

    <!-- Strategic Axes Section -->
    <StrategyStrategicAxesSection
      :title="t('strategy.axes.title')"
      :subtitle="t('strategy.axes.subtitle')"
      :axes="strategicAxes"
    />

    <!-- Target Indicators Section -->
    <!-- <StrategyTargetIndicatorsSection
      :title="t('strategy.indicators.title')"
      :subtitle="t('strategy.indicators.subtitle')"
      :indicators="targetIndicators"
      background-image="/images/bg/bg_stats_section.jpeg"
    /> -->

    <!-- Fundraising Section -->
    <StrategyFundraisingSection
      :title="t('strategy.fundraising.title')"
      :subtitle="t('strategy.fundraising.subtitle')"
      :projects="fundraisingProjects"
      :cta-title="t('strategy.fundraising.cta.title')"
      :cta-text="t('strategy.fundraising.cta.text')"
      :cta-button="t('strategy.fundraising.cta.button')"
      cta-link="/contact"
    />
  </div>
</template>
