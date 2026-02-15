<script setup lang="ts">
const { t, tm } = useI18n()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('careers')
const { getMediaUrl } = useMediaApi()

onMounted(() => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()
})

// Benefits "Pourquoi nous rejoindre" avec override éditorial
const teacherBenefits = computed(() => {
  const i18nItems = tm('careers.teachers.benefits.items') as any[]
  return [1, 2, 3, 4].map((n, i) => ({
    icon: getRawContent(`careers.teachers.benefits.item${n}.icon`) ?? i18nItems[i]?.icon ?? '',
    title: getRawContent(`careers.teachers.benefits.item${n}.title`) ?? i18nItems[i]?.title ?? '',
    text: getRawContent(`careers.teachers.benefits.item${n}.text`) ?? i18nItems[i]?.text ?? '',
  }))
})

// SEO
useSeoMeta({
  title: () => t('careers.seo.title'),
  description: () => t('careers.seo.description'),
  ogTitle: () => t('careers.seo.title'),
  ogDescription: () => t('careers.seo.description')
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('about.tabs.careers') }
])
</script>

<template>
  <div class="bg-grid-pattern">
    <!-- Hero -->
    <PageHero
      :title="getContent('careers.hero.title')"
      :subtitle="getContent('careers.hero.subtitle')"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Opportunities Cards -->
    <CareersOpportunitiesSection />

    <!-- Teachers Section -->
    <CareersTeachersSection
      :image="getMediaUrl(getRawContent('careers.teachers.image') ?? '') || undefined"
      :benefit-items="teacherBenefits"
    />

    <!-- Students Section -->
    <CareersStudentsSection :image="getMediaUrl(getRawContent('careers.students.image') ?? '') || undefined" />

    <!-- Partners Section -->
    <CareersPartnersSection />
  </div>
</template>
