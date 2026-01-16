<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getCallById, getAllOpenCalls, getCampusById, getFlagEmoji } = useMockData()

// Get the call
const id = computed(() => route.params.id as string)
const call = computed(() => getCallById(id.value))

// 404 if not found - use onMounted to check after hydration
onMounted(() => {
  if (!call.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Call not found'
    })
  }
})

// Get campus info
const campus = computed(() => call.value ? getCampusById(call.value.campus_id) : null)
const campusFlag = computed(() => campus.value ? getFlagEmoji(campus.value.country) : '')
const campusName = computed(() => {
  if (!campus.value) return ''
  if (locale.value === 'en' && campus.value.name_en) return campus.value.name_en
  if (locale.value === 'ar' && campus.value.name_ar) return campus.value.name_ar
  return campus.value.name_fr
})

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!call.value) return ''
  if (locale.value === 'en' && call.value.title_en) return call.value.title_en
  if (locale.value === 'ar' && call.value.title_ar) return call.value.title_ar
  return call.value.title_fr
})

const getLocalizedDescription = computed(() => {
  if (!call.value) return ''
  if (locale.value === 'en' && call.value.description_en) return call.value.description_en
  if (locale.value === 'ar' && call.value.description_ar) return call.value.description_ar
  return call.value.description_fr
})

// SEO
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('actualites.calls.title')}`,
  description: () => getLocalizedDescription.value,
  ogImage: () => call.value?.image || 'https://picsum.photos/seed/og-call/1200/630'
})

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Check if deadline has passed
const isDeadlinePassed = computed(() => {
  if (!call.value) return false
  return new Date(call.value.deadline) < new Date()
})

// Days until deadline
const daysUntilDeadline = computed(() => {
  if (!call.value) return 0
  const deadline = new Date(call.value.deadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Type badge colors
const typeBadgeColors: Record<string, string> = {
  candidature: 'bg-brand-blue-600',
  bourse: 'bg-brand-blue-500',
  projet: 'bg-purple-600',
  recrutement: 'bg-brand-red-600'
}

// Related calls (same type, open, excluding current)
const relatedCalls = computed(() => {
  if (!call.value) return []
  return getAllOpenCalls()
    .filter(c => c.id !== call.value!.id)
    .slice(0, 3)
})

// Get localized title for related calls
const getLocalizedTitleFor = (item: { title_fr: string; title_en?: string; title_ar?: string }) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}
</script>

<template>
  <div v-if="call">
    <!-- Hero Section (PageHero style) -->
    <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <img
          :src="call.image || 'https://picsum.photos/seed/call-hero/1920/600'"
          :alt="getLocalizedTitle"
          class="w-full h-full object-cover"
        >
        <!-- Gradient Overlays -->
        <div class="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/30"></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full flex flex-col justify-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <!-- Breadcrumb -->
          <nav class="mb-6">
            <ol class="flex items-center space-x-2 text-sm">
              <li>
                <NuxtLink :to="localePath('/')" class="text-white/70 hover:text-white transition-colors duration-200">
                  {{ t('nav.home') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40" />
                <NuxtLink :to="localePath('/actualites/appels')" class="text-white/70 hover:text-white transition-colors duration-200">
                  {{ t('actualites.calls.title') }}
                </NuxtLink>
              </li>
              <li class="flex items-center">
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 mx-2 text-white/40" />
                <span class="text-brand-blue-400 font-medium truncate max-w-xs">{{ getLocalizedTitle }}</span>
              </li>
            </ol>
          </nav>

          <!-- Badges -->
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span
              class="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
              :class="typeBadgeColors[call.type]"
            >
              {{ t(`actualites.calls.filters.${call.type}`) }}
            </span>
            <span
              v-if="call.status === 'open'"
              class="inline-block px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full"
            >
              {{ t('actualites.detail.call.statusOpen') }}
            </span>
            <span
              v-else
              class="inline-block px-3 py-1 text-sm font-medium bg-gray-600 text-white rounded-full"
            >
              {{ t('actualites.detail.call.statusClosed') }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {{ getLocalizedTitle }}
          </h1>
        </div>
      </div>

      <!-- Bottom Gradient Fade -->
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
    </section>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Featured image -->
          <div class="overflow-hidden rounded-xl mb-8 shadow-lg">
            <img
              :src="call.image || 'https://picsum.photos/seed/call-detail/800/450'"
              :alt="getLocalizedTitle"
              class="w-full h-auto object-cover"
            >
          </div>

          <!-- Info cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <!-- Deadline -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
                {{ t('actualites.detail.call.deadline') }}
              </div>
              <div
                class="font-bold"
                :class="isDeadlinePassed ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'"
              >
                {{ formatDate(call.deadline) }}
              </div>
              <div
                v-if="!isDeadlinePassed && daysUntilDeadline <= 14"
                class="text-xs mt-1 text-orange-600 dark:text-orange-400 font-medium"
              >
                {{ daysUntilDeadline }} {{ daysUntilDeadline === 1 ? 'jour restant' : 'jours restants' }}
              </div>
              <div
                v-else-if="isDeadlinePassed"
                class="text-xs mt-1 text-gray-500 dark:text-gray-400"
              >
                {{ t('actualites.detail.call.deadlinePassed') }}
              </div>
            </div>

            <!-- Campus -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-building" class="w-4 h-4" />
                {{ t('actualites.detail.call.campus') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                <span>{{ campusFlag }}</span>
                <span>{{ campusName }}</span>
              </div>
            </div>

            <!-- Type -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-tag" class="w-4 h-4" />
                {{ t('actualites.detail.call.type') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white">
                {{ t(`actualites.calls.filters.${call.type}`) }}
              </div>
            </div>

            <!-- Status -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-clock" class="w-4 h-4" />
                {{ t('actualites.detail.call.status') }}
              </div>
              <div
                class="font-bold"
                :class="call.status === 'open' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'"
              >
                {{ call.status === 'open' ? t('actualites.detail.call.statusOpen') : t('actualites.detail.call.statusClosed') }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {{ getLocalizedDescription }}
            </p>
          </div>

          <!-- Partners -->
          <div v-if="call.partner_logos && call.partner_logos.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-handshake" class="text-brand-blue-500" />
              {{ t('actualites.detail.call.partners') }}
            </h3>
            <div class="flex flex-wrap items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <img
                v-for="(logo, index) in call.partner_logos"
                :key="index"
                :src="logo"
                alt="Partner logo"
                class="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                loading="lazy"
              >
            </div>
          </div>

          <!-- CTA Button -->
          <div class="mb-8">
            <a
              v-if="call.url && call.status === 'open'"
              :href="call.url"
              target="_blank"
              class="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-5 h-5" />
              {{ t('actualites.detail.call.apply') }}
              <font-awesome-icon icon="fa-solid fa-external-link" class="w-4 h-4" />
            </a>
            <div
              v-else-if="call.status === 'closed'"
              class="inline-flex items-center gap-3 px-8 py-4 bg-gray-400 text-white text-lg font-bold rounded-xl cursor-not-allowed"
            >
              <font-awesome-icon icon="fa-solid fa-lock" class="w-5 h-5" />
              {{ t('actualites.detail.call.closed') }}
            </div>
          </div>

          <!-- Back button -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              :to="localePath('/actualites/appels')"
              class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('actualites.detail.call.backToCalls') }}
            </NuxtLink>
          </div>

          <!-- Related calls -->
          <section v-if="relatedCalls.length > 0" class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('actualites.detail.call.relatedCalls') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article
                v-for="item in relatedCalls"
                :key="item.id"
                class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <NuxtLink :to="localePath(`/actualites/appels/${item.id}`)">
                  <div class="overflow-hidden h-32">
                    <img
                      :src="item.image || 'https://picsum.photos/seed/related-call/400/200'"
                      :alt="getLocalizedTitleFor(item)"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    >
                  </div>

                  <div class="p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="inline-block px-2 py-0.5 text-xs font-medium text-white rounded"
                        :class="typeBadgeColors[item.type]"
                      >
                        {{ t(`actualites.calls.filters.${item.type}`) }}
                      </span>
                    </div>

                    <h3 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                      {{ getLocalizedTitleFor(item) }}
                    </h3>

                    <div class="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                      {{ t('actualites.calls.deadline') }}: {{ formatShortDate(item.deadline) }}
                    </div>
                  </div>
                </NuxtLink>
              </article>
            </div>
          </section>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-1/3">
          <ActualitesSidebar :show-calls="false" />
        </aside>
      </div>
    </div>
  </div>
</template>
