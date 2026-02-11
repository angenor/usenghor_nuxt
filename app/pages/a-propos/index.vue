<script setup lang="ts">
const { t } = useI18n()
const { listContents } = useEditorialApi()

// Contenus éditoriaux avec fallback sur i18n
const { getContent, getRawContent, loadContent } = useEditorialContent('about')

// API Media pour résoudre l'URL de l'image mission
const { getMediaUrl } = useMediaApi()

// SEO
useSeoMeta({
  title: () => t('about.seo.title'),
  description: () => t('about.seo.description'),
  ogTitle: () => t('about.seo.title'),
  ogDescription: () => t('about.seo.description'),
  ogImage: 'https://picsum.photos/seed/og-about/1200/630',
})

// Fallback values for stats (used if editorial API not available)
const statsFallback = ref({
  stats_years: '30+',
  stats_donor_countries: '15',
  stats_alumni: '4200+',
  stats_programs: '50+',
})

// Key figures loaded from editorial API
const keyFigures = ref({
  stats_years: '',
  stats_donor_countries: '',
  stats_alumni: '',
  stats_programs: '',
})

// Load key figures and editorial content on mount
onMounted(async () => {
  // Charger les contenus éditoriaux (non-bloquant)
  loadContent()

  // Charger les chiffres clés
  try {
    const response = await listContents({ value_type: 'number', limit: 50 })
    for (const item of response.items) {
      if (item.value && Object.prototype.hasOwnProperty.call(keyFigures.value, item.key)) {
        // @ts-expect-error dynamic key assignment
        keyFigures.value[item.key] = item.value
      }
    }
  }
  catch {
    console.warn('Chiffres clés non disponibles, utilisation des fallbacks')
  }
})

// Stats data with editorial API values (with fallback)
const stats = computed(() => [
  {
    value: keyFigures.value.stats_years || statsFallback.value.stats_years,
    label: getContent('about.stats.years.label', 'about.stats.years'),
  },
  {
    value: keyFigures.value.stats_donor_countries || statsFallback.value.stats_donor_countries,
    label: getContent('about.stats.countries.label', 'about.stats.countries'),
  },
  {
    value: keyFigures.value.stats_alumni || statsFallback.value.stats_alumni,
    label: getContent('about.stats.alumni.label', 'about.stats.alumni'),
  },
  {
    value: keyFigures.value.stats_programs || statsFallback.value.stats_programs,
    label: getContent('about.stats.programs.label', 'about.stats.programs'),
  },
])

// Values data (engagements)
const values = computed(() => [
  {
    icon: 'star',
    title: getContent('about.engagements.excellence.title'),
    text: getContent('about.engagements.excellence.text'),
  },
  {
    icon: 'shield',
    title: getContent('about.engagements.ethics.title'),
    text: getContent('about.engagements.ethics.text'),
  },
  {
    icon: 'users',
    title: getContent('about.engagements.inclusion.title'),
    text: getContent('about.engagements.inclusion.text'),
  },
  {
    icon: 'lightbulb',
    title: getContent('about.engagements.innovation.title'),
    text: getContent('about.engagements.innovation.text'),
  },
  {
    icon: 'handshake',
    title: getContent('about.engagements.solidarity.title'),
    text: getContent('about.engagements.solidarity.text'),
  },
])

// Hero content
const heroTitle = computed(() => getContent('about.hero.title'))
const heroSubtitle = computed(() => getContent('about.hero.subtitle'))

// Mission content
const missionTitle = computed(() => getContent('about.mission.title'))
const missionContent = computed(() => getContent('about.mission.content'))
const missionImage = computed(() => {
  const imageMediaId = getRawContent('about.mission.image')
  return imageMediaId ? getMediaUrl(imageMediaId) : undefined
})

// Engagements title
const engagementsTitle = computed(() => getContent('about.engagements.title'))

// Charter
const charterDownload = computed(() => getContent('about.charter.download'))

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about') },
])
</script>

<template>
  <div>
    <!-- Hero Section -->
    <PageHero
      :title="heroTitle"
      :subtitle="heroSubtitle"
      image="/images/bg/backgroud_senghor3.jpg"
      :breadcrumb="breadcrumb"
    />

    <!-- Sticky Tabs Navigation -->
    <SectionAboutTabsNav />

    <!-- Mission Section -->
    <SectionAboutMission
      :title="missionTitle"
      :content="missionContent"
      :illustration="missionImage || undefined"
      :cta-links="[
        { label: getContent('about.mission.cta.history', 'about.mission.discover.history'), to: '/a-propos/histoire', icon: 'fa-solid fa-landmark' },
        { label: getContent('about.mission.cta.governance', 'about.mission.discover.governance'), to: '/a-propos/gouvernance', icon: 'fa-solid fa-building-columns' }
      ]"
    />

    <!-- Stats Section -->
    <SectionStats :stats="stats" />

    <!-- Links to other sections -->
    <SectionAboutLinks />

    <!-- Engagements Section -->
    <SectionEngagements
      :title="engagementsTitle"
      :values="values"
      :charter="{ label: charterDownload, url: getMediaUrl(getRawContent('about.charter.download_url') ?? '') || getRawContent('about.charter.download_url') || '/documents/charte-ethique.pdf' }"
    />
  </div>
</template>
