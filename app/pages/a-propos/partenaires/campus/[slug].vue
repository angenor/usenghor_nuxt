<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getCampusBySlug, getFlagEmoji } = useMockData()

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

// Active tab
const activeTab = ref('partners')
</script>

<template>
  <div v-if="campus">
    <!-- Hero -->
    <CampusCampusHero :campus="campus" />

    <!-- Back Link -->
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <NuxtLink
          :to="localePath('/a-propos/partenaires')"
          class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
          {{ t('partners.back') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <CampusCampusTabs v-model="activeTab" />

    <!-- Tab Content -->
    <div class="bg-gray-50 dark:bg-gray-950 min-h-[400px]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Partners Tab -->
        <CampusCampusPartners
          v-if="activeTab === 'partners'"
          :campus-id="campus.id"
        />

        <!-- Team Tab -->
        <CampusCampusTeam
          v-else-if="activeTab === 'team'"
          :campus-id="campus.id"
        />

        <!-- Calls Tab -->
        <CampusCampusCalls
          v-else-if="activeTab === 'calls'"
          :campus-id="campus.id"
        />

        <!-- Events Tab -->
        <CampusCampusEvents
          v-else-if="activeTab === 'events'"
          :campus-id="campus.id"
        />

        <!-- News Tab -->
        <CampusCampusNews
          v-else-if="activeTab === 'news'"
          :campus-id="campus.id"
        />

        <!-- Media Tab -->
        <CampusCampusMedia
          v-else-if="activeTab === 'media'"
          :campus-id="campus.id"
        />
      </div>
    </div>
  </div>
</template>
