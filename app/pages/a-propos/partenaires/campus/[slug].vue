<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { getCampusBySlug, getCoverImageUrl, getCampusFlagEmoji } = usePublicCampusApi()

// Valid tabs (in display order)
const validTabs = ['calls', 'events', 'news', 'partners', 'team', 'media']

// Get campus code from slug
const slug = computed(() => route.params.slug as string)

// Fetch campus data from API
const { data: campus, pending, error } = await useAsyncData(
  `campus-${slug.value}`,
  () => getCampusBySlug(slug.value),
  { server: true }
)

// 404 if campus not found
if (error.value || (!pending.value && !campus.value)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Campus not found'
  })
}

// SEO
useSeoMeta({
  title: () => `${campus.value?.name || ''} | ${t('partners.seo.title')}`,
  description: () => campus.value?.description || t('partners.seo.description'),
  ogTitle: () => `${campus.value?.name || ''} | ${t('partners.seo.title')}`,
  ogDescription: () => campus.value?.description || t('partners.seo.description'),
  ogImage: () => campus.value ? getCoverImageUrl(campus.value) : 'https://picsum.photos/seed/og-campus/1200/630'
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.about'), to: localePath('/a-propos') },
  { label: t('partners.hero.title'), to: localePath('/a-propos/partenaires') },
  { label: campus.value?.name || '' }
])

// Active tab based on URL hash (default: calls)
const activeTab = computed(() => {
  const hash = route.hash?.replace('#', '') || 'calls'
  return validTabs.includes(hash) ? hash : 'calls'
})
</script>

<template>
  <div v-if="campus" class="bg-grid-pattern">
    <!-- Campus NavBar -->
    <CampusNavBar
      :campus-name="campus.name"
      :country-flag="getCampusFlagEmoji(campus)"
    />

    <!-- Hero -->
    <CampusHero :campus="campus" />

    <!-- Tabs Navigation -->
    <CampusTabs :active-tab="activeTab" />

    <!-- Tab Content -->
    <div class="bg-gray-50 dark:bg-gray-950 min-h-[400px] bg-grid-pattern">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Calls Tab (default) -->
        <CampusCalls
          v-if="activeTab === 'calls'"
          :campus-id="campus.id"
        />

        <!-- Events Tab -->
        <CampusEvents
          v-else-if="activeTab === 'events'"
          :campus-id="campus.id"
        />

        <!-- News Tab -->
        <CampusNews
          v-else-if="activeTab === 'news'"
          :campus-id="campus.id"
        />

        <!-- Partners Tab -->
        <CampusPartners
          v-else-if="activeTab === 'partners'"
          :campus-id="campus.id"
        />

        <!-- Team Tab -->
        <CampusTeam
          v-else-if="activeTab === 'team'"
          :campus-id="campus.id"
        />

        <!-- Media Tab -->
        <CampusMedia
          v-else-if="activeTab === 'media'"
          :campus-id="campus.id"
        />
      </div>
    </div>
  </div>

  <!-- Loading state -->
  <div v-else-if="pending" class="flex justify-center items-center min-h-[400px]">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-500"></div>
  </div>
</template>
