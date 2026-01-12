<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getCampusBySlug, getFlagEmoji } = useMockData()

// Valid tabs (in display order)
const validTabs = ['calls', 'events', 'news', 'partners', 'team', 'media']

// Get campus from slug
const slug = computed(() => route.params.slug as string)
const campus = computed(() => getCampusBySlug(slug.value))

// 404 if campus not found
if (!campus.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Campus not found'
  })
}

// Get localized name
const getLocalizedName = computed(() => {
  if (!campus.value) return ''
  if (locale.value === 'ar' && campus.value.name_ar) return campus.value.name_ar
  if (locale.value === 'en' && campus.value.name_en) return campus.value.name_en
  return campus.value.name_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedName.value} | ${t('partners.seo.title')}`,
  description: () => campus.value?.description_fr || t('partners.seo.description'),
  ogTitle: () => `${getLocalizedName.value} | ${t('partners.seo.title')}`,
  ogDescription: () => campus.value?.description_fr || t('partners.seo.description'),
  ogImage: () => campus.value?.image || 'https://picsum.photos/seed/og-campus/1200/630'
})

// Breadcrumb
const breadcrumb = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.about'), to: localePath('/a-propos') },
  { label: t('partners.hero.title'), to: localePath('/a-propos/partenaires') },
  { label: getLocalizedName.value }
])

// Active tab based on URL hash (default: calls)
const activeTab = computed(() => {
  const hash = route.hash?.replace('#', '') || 'calls'
  return validTabs.includes(hash) ? hash : 'calls'
})
</script>

<template>
  <div v-if="campus">
    <!-- Campus NavBar -->
    <CampusNavBar
      :campus-name="getLocalizedName"
      :country-flag="getFlagEmoji(campus.country)"
    />

    <!-- Hero -->
    <CampusHero :campus="campus" />

    <!-- Tabs Navigation -->
    <CampusTabs :active-tab="activeTab" />

    <!-- Tab Content -->
    <div class="bg-gray-50 dark:bg-gray-950 min-h-[400px]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Partners Tab -->
        <CampusPartners
          v-if="activeTab === 'partners'"
          :campus-id="campus.id"
        />

        <!-- Team Tab -->
        <CampusTeam
          v-else-if="activeTab === 'team'"
          :campus-id="campus.id"
        />

        <!-- Calls Tab -->
        <CampusCalls
          v-else-if="activeTab === 'calls'"
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

        <!-- Media Tab -->
        <CampusMedia
          v-else-if="activeTab === 'media'"
          :campus-id="campus.id"
        />
      </div>
    </div>
  </div>
</template>
