<script setup lang="ts">
import type { EventPublic } from '~/composables/usePublicEventsApi'
import type { PublicAlbumWithMedia } from '~/types/api/media'
import type { NewsDisplay } from '~/types/news'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getEventBySlug, getUpcomingEvents, getEventAlbums } = usePublicEventsApi()
const { getAllPublishedNews } = usePublicNewsApi()
const { getCampaignsByEntity } = usePublicSurveyApi()
const { getCampusById, getFlagEmoji } = useMockData()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()
const { siteUrl } = useRuntimeConfig().public

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(item: EventPublic, variant: 'low' | 'medium' | 'original' = 'medium'): string | null {
  if ((item as any).cover_image_external_id) {
    const originalUrl = getMediaUrl((item as any).cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : null
  }
  return item.cover_image || null
}

// Get the event
const slug = computed(() => route.params.id as string)
const relatedEventsData = ref<EventPublic[]>([])
const associatedCampaigns = ref<any[]>([])
const eventAlbums = ref<PublicAlbumWithMedia[]>([])
const eventNews = ref<NewsDisplay[]>([])
const activeTab = ref<'details' | 'actualites' | 'mediatheque'>('details')

// Charger l'événement depuis l'API (SSR + client)
const { data: event, status } = await useAsyncData(
  `event-${slug.value}`,
  () => getEventBySlug(slug.value)
)

if (!event.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Event not found'
  })
}

const isLoading = computed(() => status.value === 'pending')

// Charger les données secondaires côté client
onMounted(async () => {
  if (event.value) {
    try {
      const upcomingEvents = await getUpcomingEvents(10)
      relatedEventsData.value = upcomingEvents
        .filter(e => e.id !== event.value!.id)
        .slice(0, 3)
    } catch { /* pas d'événements liés */ }

    try {
      associatedCampaigns.value = await getCampaignsByEntity('event', event.value.id)
    } catch { /* pas de formulaire associé */ }

    try {
      eventAlbums.value = await getEventAlbums(event.value.slug)
    } catch { /* pas d'albums */ }

    try {
      eventNews.value = await getAllPublishedNews({ event_id: event.value.id, limit: 50 })
    } catch { /* pas d'actualités */ }
  }
})

const hasMediaLibrary = computed(() => eventAlbums.value.length > 0)
const hasRelatedNews = computed(() => eventNews.value.length > 0)
const hasTabs = computed(() => hasMediaLibrary.value || hasRelatedNews.value)

// Get campus info - note: backend ne stocke pas campus_id pour événements
const campus = computed(() => null)
const campusFlag = computed(() => '')
const campusName = computed(() => '')

// Localization helpers
const getLocalizedTitle = computed(() => {
  if (!event.value) return ''
  return event.value.title
})

const getLocalizedLocation = computed(() => {
  if (!event.value) return ''
  if (event.value.is_online) return t('actualites.events.online')
  return event.value.venue || event.value.city || t('actualites.events.noLocation')
})

// SEO
const localeMap: Record<string, string> = { fr: 'fr_FR', en: 'en_US', ar: 'ar_SA' }

useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('actualites.events.title')}`,
  ogTitle: () => `${getLocalizedTitle.value} | ${t('actualites.events.title')}`,
  description: () => event.value?.description || '',
  ogDescription: () => event.value?.description || '',
  ogType: 'article',
  ogUrl: () => `${siteUrl}${route.fullPath}`,
  ogImage: () => (event.value as any)?.cover_image_external_id
    ? `${siteUrl}/api/public/media/${(event.value as any).cover_image_external_id}/download?variant=medium`
    : undefined,
  ogLocale: () => localeMap[locale.value] || 'fr_FR',
  ogLocaleAlternate: () => Object.values(localeMap).filter(l => l !== (localeMap[locale.value] || 'fr_FR')),
  twitterTitle: () => `${getLocalizedTitle.value} | ${t('actualites.events.title')}`,
  twitterDescription: () => event.value?.description || '',
  twitterImage: () => (event.value as any)?.cover_image_external_id
    ? `${siteUrl}/api/public/media/${(event.value as any).cover_image_external_id}/download?variant=medium`
    : undefined,
})

// Format date
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Check if event is past
const isPastEvent = computed(() => {
  if (!event.value) return false
  const endDate = event.value.end_date ? new Date(event.value.end_date) : new Date(event.value.start_date)
  return endDate < new Date()
})

// Extraire l'ID YouTube d'un lien pour l'embed
const youtubeEmbedUrl = computed(() => {
  const link = (event.value as any)?.youtube_link
  if (!link || !isPastEvent.value) return null
  const match = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1` : null
})

// Days until event
const daysUntilEvent = computed(() => {
  if (!event.value) return 0
  const eventDate = new Date(event.value.start_date)
  const now = new Date()
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Type badge colors
const typeBadgeColors: Record<string, string> = {
  conference: 'bg-brand-red-600',
  workshop: 'bg-brand-blue-600',
  ceremony: 'bg-brand-blue-500',
  seminar: 'bg-purple-600',
  symposium: 'bg-green-600',
  other: 'bg-gray-600'
}

// Normaliser l'URL du lien d'inscription (ajouter https:// si absent)
const normalizedRegistrationLink = computed(() => {
  const link = event.value?.registration_link
  if (!link) return null
  if (/^https?:\/\//i.test(link)) return link
  return `https://${link}`
})

// Related events (upcoming, excluding current)
const relatedEvents = computed(() => relatedEventsData.value)

// Get localized title for related events
const getLocalizedTitleFor = (item: EventPublic) => {
  return item.title
}

const formatShortDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}

// Lien vers le formulaire survey associé (remplace l'ancien modale d'inscription)
const registrationCampaignLink = computed(() => {
  if (associatedCampaigns.value.length > 0) {
    return `/formulaires/${associatedCampaigns.value[0].slug}`
  }
  return null
})

</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-12 min-h-screen">
      <div class="flex flex-col items-center gap-4">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('actualites.loading') }}</span>
      </div>
    </div>

    <div v-else-if="event">
    <!-- Hero Section (même style que la page index actualités) -->
    <section class="relative py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10 heropattern-topography-brand-blue-500"></div>

      <!-- Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <NuxtLink :to="localePath('/actualites/evenements')" class="text-white/70 hover:text-white transition-colors duration-200">
                {{ t('actualites.events.title') }}
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
            :class="typeBadgeColors[event.type]"
          >
            {{ t(`actualites.events.types.${event.type}`) }}
          </span>
          <span
            v-if="isPastEvent"
            class="inline-block px-3 py-1 text-sm font-medium bg-gray-600 text-white rounded-full"
          >
            {{ t('actualites.detail.event.past') }}
          </span>
          <span
            v-else
            class="inline-block px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full"
          >
            {{ t('actualites.detail.event.upcoming') }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          {{ getLocalizedTitle }}
        </h1>

        <!-- Date sous le titre -->
        <p class="text-lg text-gray-300">
          {{ formatDate(event.start_date) }}
          <span v-if="event.end_date && event.end_date !== event.start_date"> — {{ formatDate(event.end_date) }}</span>
        </p>
      </div>

      <!-- Ligne de séparation -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg
          class="w-full h-12 md:h-16 text-white dark:text-gray-950"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <polygon points="0,40 1200,0 1200,120 0,120" fill="currentColor" />
        </svg>
      </div>
    </section>

    <!-- Onglets (Détails / Actualités / Médiathèque) sticky, au-dessus du contenu -->
    <div v-if="hasTabs" class="sticky top-20 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="-mb-px flex overflow-x-auto scrollbar-hide">
          <button
            class="flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors"
            :class="activeTab === 'details'
              ? 'border-brand-blue-500 text-brand-blue-600 dark:text-brand-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = 'details'"
          >
            <font-awesome-icon icon="fa-solid fa-file-lines" class="h-4 w-4" />
            {{ t('actualites.detail.event.tabs.details') }}
          </button>
          <button
            v-if="hasRelatedNews"
            class="flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors"
            :class="activeTab === 'actualites'
              ? 'border-brand-blue-500 text-brand-blue-600 dark:text-brand-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = 'actualites'"
          >
            <font-awesome-icon icon="fa-solid fa-newspaper" class="h-4 w-4" />
            {{ t('actualites.detail.event.tabs.actualites') }}
            <span
              class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="activeTab === 'actualites'
                ? 'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/40 dark:text-brand-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
            >
              {{ eventNews.length }}
            </span>
          </button>
          <button
            v-if="hasMediaLibrary"
            class="flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors"
            :class="activeTab === 'mediatheque'
              ? 'border-brand-blue-500 text-brand-blue-600 dark:text-brand-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = 'mediatheque'"
          >
            <font-awesome-icon :icon="['fas', 'photo-film']" class="h-4 w-4" />
            {{ t('actualites.detail.event.tabs.mediatheque') }}
            <span
              class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="activeTab === 'mediatheque'
                ? 'bg-brand-blue-100 text-brand-blue-700 dark:bg-brand-blue-900/40 dark:text-brand-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'"
            >
              {{ eventAlbums.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab: Actualités associées -->
    <div v-if="activeTab === 'actualites' && hasRelatedNews" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="item in eventNews"
          :key="item.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
        >
          <NuxtLink :to="localePath(`/actualites/${item.slug}`)" class="block">
            <div class="h-48 overflow-hidden">
              <img
                v-if="item.cover_image_external_id"
                :src="getImageVariantUrl(getMediaUrl(item.cover_image_external_id) || '', 'medium') || ''"
                :alt="item.cover_image_alt || item.title"
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              >
              <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <font-awesome-icon icon="fa-solid fa-newspaper" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div class="p-5">
              <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
                {{ formatDate(item.published_at || item.created_at) }}
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {{ item.title }}
              </h3>
              <p v-if="item.summary" class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                {{ item.summary }}
              </p>
            </div>
          </NuxtLink>
        </article>
      </div>
    </div>

    <!-- Tab: Médiathèque (pleine largeur) -->
    <div v-if="activeTab === 'mediatheque' && hasMediaLibrary" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <MediaLibraryTab :albums="eventAlbums" />
    </div>

    <!-- Content (Détails) -->
    <div v-show="activeTab === 'details'" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Visioconférence mobile (visible uniquement sur mobile, avant le contenu) -->
        <div class="lg:hidden space-y-4">
          <!-- Lien visioconférence mobile -->
          <div
            v-if="event.is_online && event.video_conference_link && !isPastEvent"
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="mb-3 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <font-awesome-icon icon="fa-solid fa-video" class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t('actualites.detail.event.onlineEvent') }}
              </h3>
            </div>
            <a
              :href="event.video_conference_link"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="h-4 w-4" />
              {{ t('actualites.detail.event.joinOnline') }}
            </a>
          </div>
        </div>

        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Featured image / YouTube embed -->
          <div class="overflow-hidden rounded-xl mb-8 shadow-lg">
            <!-- Vidéo YouTube (événement passé + lien renseigné) -->
            <div v-if="youtubeEmbedUrl" class="relative w-full" style="padding-bottom: 56.25%;">
              <iframe
                :src="youtubeEmbedUrl"
                class="absolute inset-0 w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
            <!-- Image de couverture (par défaut) -->
            <img
              v-else-if="getCoverImageUrl(event, 'medium')"
              :src="getCoverImageUrl(event, 'medium')!"
              :alt="getLocalizedTitle"
              class="w-full h-auto object-cover"
            >
            <div v-else class="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <font-awesome-icon icon="fa-solid fa-calendar" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <!-- Info cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <!-- Date -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-calendar" class="w-4 h-4" />
                {{ t('actualites.detail.event.date') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ formatDate(event.start_date) }}
              </div>
              <div
                v-if="!isPastEvent && daysUntilEvent <= 14 && daysUntilEvent > 0"
                class="text-xs mt-1 text-green-600 dark:text-green-400 font-medium"
              >
                {{ daysUntilEvent === 0 ? "Aujourd'hui" : `Dans ${daysUntilEvent} jour${daysUntilEvent > 1 ? 's' : ''}` }}
              </div>
            </div>

            <!-- Location -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-location-dot" class="w-4 h-4" />
                {{ t('actualites.detail.event.location') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ getLocalizedLocation }}
              </div>
            </div>

            <!-- Campus -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-building" class="w-4 h-4" />
                {{ t('actualites.detail.event.campus') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1 text-sm">
                <span>{{ campusFlag }}</span>
                <span>{{ campusName }}</span>
              </div>
            </div>

            <!-- Type -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-tag" class="w-4 h-4" />
                {{ t('actualites.detail.event.type') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white text-sm">
                {{ t(`actualites.events.types.${event.type}`) }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <p v-if="event.description" class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ event.description }}
            </p>

            <!-- Contenu riche -->
            <div v-if="event.content_html" class="mt-8">
              <RichTextRenderer :html="event.content_html" />
            </div>
          </div>

          <!-- Formulaires de sondage associés -->
          <div v-if="associatedCampaigns.length > 0" class="mt-12">
            <div
              v-for="campaign in associatedCampaigns"
              :key="campaign.id"
              class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                {{ campaign[`title_${locale}`] || campaign.title_fr }}
              </h2>
              <p v-if="campaign[`description_${locale}`] || campaign.description_fr" class="mb-4 text-gray-600 dark:text-gray-400">
                {{ campaign[`description_${locale}`] || campaign.description_fr }}
              </p>
              <NuxtLink
                :to="`/formulaires/${campaign.slug}`"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700"
              >
                Remplir le formulaire
              </NuxtLink>
            </div>
          </div>

          <!-- Back button -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700">
            <NuxtLink
              :to="localePath('/actualites/evenements')"
              class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('actualites.detail.event.backToEvents') }}
            </NuxtLink>
          </div>

          <!-- Related events -->
          <section v-if="relatedEvents.length > 0" class="mt-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              <span class="relative inline-block">
                {{ t('actualites.detail.event.relatedEvents') }}
                <span class="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-brand-blue-500 to-brand-blue-300 rounded-full"></span>
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article
                v-for="item in relatedEvents"
                :key="item.id"
                class="group relative overflow-hidden rounded-xl h-56"
              >
                <NuxtLink :to="localePath(`/actualites/evenements/${item.slug}`)">
                  <!-- Background image -->
                  <img
                    v-if="getCoverImageUrl(item, 'low')"
                    :src="getCoverImageUrl(item, 'low')!"
                    :alt="getLocalizedTitleFor(item)"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  >
                  <div v-else class="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-calendar" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>

                  <!-- Gradient overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  <!-- Content -->
                  <div class="absolute inset-0 p-4 flex flex-col justify-end">
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="inline-block px-2 py-0.5 text-xs font-medium text-white rounded"
                        :class="typeBadgeColors[item.type]"
                      >
                        {{ t(`actualites.events.types.${item.type}`) }}
                      </span>
                    </div>

                    <h3 class="text-sm font-bold text-white line-clamp-2 group-hover:underline">
                      {{ getLocalizedTitleFor(item) }}
                    </h3>

                    <div class="flex items-center gap-2 mt-2 text-xs text-gray-200">
                      <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3" />
                      {{ formatShortDate(item.start_date) }}
                    </div>
                  </div>
                </NuxtLink>
              </article>
            </div>
          </section>
        </article>

        <!-- Sidebar (inscription/visio masqués sur mobile car affichés au-dessus) -->
        <aside class="lg:w-1/3 space-y-6">
          <!-- Carte d'inscription (desktop uniquement) -->
          <div
            v-if="event.registration_required"
            class="hidden lg:block rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30">
                <font-awesome-icon icon="fa-solid fa-user-plus" class="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-400" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t('actualites.detail.event.registration.title') }}
              </h3>
            </div>

            <!-- Événement passé -->
            <div v-if="isPastEvent" class="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-700">
              <font-awesome-icon icon="fa-solid fa-clock" class="mb-2 h-6 w-6 text-gray-400" />
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ t('actualites.detail.event.registration.closed') }}
              </p>
            </div>

            <!-- Inscription possible -->
            <template v-else>
              <p v-if="event.max_attendees" class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                {{ t('actualites.detail.event.registration.spots', { count: event.max_attendees }) }}
              </p>

              <!-- Lien externe -->
              <a
                v-if="normalizedRegistrationLink"
                :href="normalizedRegistrationLink"
                target="_blank"
                rel="noopener noreferrer"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="h-4 w-4" />
                {{ t('actualites.detail.event.registration.externalLink') }}
              </a>

              <!-- Formulaire survey associé -->
              <NuxtLink
                v-else-if="registrationCampaignLink"
                :to="registrationCampaignLink"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700"
              >
                <font-awesome-icon icon="fa-solid fa-pen-to-square" class="h-4 w-4" />
                {{ t('actualites.detail.event.registration.register') }}
              </NuxtLink>
            </template>
          </div>

          <!-- Lien visioconférence (desktop uniquement) -->
          <div
            v-if="event.is_online && event.video_conference_link && !isPastEvent"
            class="hidden lg:block rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div class="mb-3 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <font-awesome-icon icon="fa-solid fa-video" class="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ t('actualites.detail.event.onlineEvent') }}
              </h3>
            </div>
            <a
              :href="event.video_conference_link"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="h-4 w-4" />
              {{ t('actualites.detail.event.joinOnline') }}
            </a>
          </div>

          <ActualitesSidebar :show-events="false" />
        </aside>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
