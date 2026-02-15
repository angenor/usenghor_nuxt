<script setup lang="ts">
import type { EventPublic } from '~/composables/usePublicEventsApi'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { getEventBySlug, getUpcomingEvents, registerToEvent } = usePublicEventsApi()
const { getCampusById, getFlagEmoji } = useMockData()
const { getMediaUrl, getImageVariantUrl } = useMediaApi()

// Helper pour obtenir l'URL de l'image de couverture selon la variante souhaitée
function getCoverImageUrl(item: EventPublic, variant: 'low' | 'medium' | 'original' = 'medium'): string {
  if ((item as any).cover_image_external_id) {
    const originalUrl = getMediaUrl((item as any).cover_image_external_id)
    return originalUrl ? getImageVariantUrl(originalUrl, variant) : 'https://picsum.photos/seed/default-event/600/400'
  }
  return item.cover_image || 'https://picsum.photos/seed/default-event/600/400'
}

// Get the event
const slug = computed(() => route.params.id as string)
const event = ref<EventPublic | null>(null)
const relatedEventsData = ref<EventPublic[]>([])
const isLoading = ref(true)

// Charger l'événement depuis l'API
onMounted(async () => {
  try {
    event.value = await getEventBySlug(slug.value)

    if (!event.value) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found'
      })
    }

    // Charger les événements liés (événements à venir, excluant le courant)
    const upcomingEvents = await getUpcomingEvents(10)
    relatedEventsData.value = upcomingEvents
      .filter(e => e.id !== event.value!.id)
      .slice(0, 3)
  } catch (error) {
    console.error('Erreur lors du chargement de l\'événement:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found'
    })
  } finally {
    isLoading.value = false
  }
})

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
useSeoMeta({
  title: () => `${getLocalizedTitle.value} | ${t('actualites.events.title')}`,
  description: () => event.value?.description || '',
  ogImage: () => event.value ? getCoverImageUrl(event.value) : 'https://picsum.photos/seed/og-event/1200/630'
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

// === INSCRIPTION ===
const showRegistrationModal = ref(false)
const isRegistering = ref(false)
const registrationSuccess = ref(false)
const registrationError = ref<string | null>(null)
const registrationForm = ref({
  last_name: '',
  first_name: '',
  email: '',
  phone: '',
  organization: '',
})

// Peut-on s'inscrire ? (événement à venir + inscription requise)
const canRegister = computed(() => {
  if (!event.value) return false
  return event.value.registration_required && !isPastEvent.value
})

async function submitRegistration() {
  if (!event.value) return
  isRegistering.value = true
  registrationError.value = null

  try {
    await registerToEvent(event.value.id, {
      last_name: registrationForm.value.last_name || null,
      first_name: registrationForm.value.first_name || null,
      email: registrationForm.value.email,
      phone: registrationForm.value.phone || null,
      organization: registrationForm.value.organization || null,
    })
    registrationSuccess.value = true
  }
  catch (err: any) {
    console.error('Erreur inscription:', err)
    registrationError.value = err?.data?.detail || t('actualites.detail.event.registration.error')
  }
  finally {
    isRegistering.value = false
  }
}

function closeRegistrationModal() {
  showRegistrationModal.value = false
  if (registrationSuccess.value) {
    registrationSuccess.value = false
    registrationForm.value = { last_name: '', first_name: '', email: '', phone: '', organization: '' }
  }
  registrationError.value = null
}

// Parser le contenu EditorJS
const parsedContent = computed(() => {
  if (!event.value?.content) return null
  try {
    return JSON.parse(event.value.content)
  }
  catch {
    return null
  }
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
    <!-- Hero Section (PageHero style) -->
    <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <img
          :src="getCoverImageUrl(event, 'original')"
          :alt="getLocalizedTitle"
          class="w-full h-full object-cover"
        >
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
        </div>
      </div>

    </section>

    <!-- Content -->
    <div class="bg-grid-pattern max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Featured image -->
          <div class="overflow-hidden rounded-xl mb-8 shadow-lg">
            <img
              :src="getCoverImageUrl(event, 'medium')"
              :alt="getLocalizedTitle"
              class="w-full h-auto object-cover"
            >
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

            <!-- Contenu riche EditorJS -->
            <div v-if="parsedContent" class="mt-8">
              <EditorJSRenderer :data="parsedContent" />
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
                    :src="getCoverImageUrl(item, 'low')"
                    :alt="getLocalizedTitleFor(item)"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  >

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

        <!-- Sidebar -->
        <aside class="lg:w-1/3 space-y-6">
          <!-- Carte d'inscription -->
          <div
            v-if="event.registration_required"
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
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
                v-if="event.registration_link"
                :href="event.registration_link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700"
              >
                <font-awesome-icon icon="fa-solid fa-arrow-up-right-from-square" class="h-4 w-4" />
                {{ t('actualites.detail.event.registration.externalLink') }}
              </a>

              <!-- Formulaire interne -->
              <button
                v-else
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700"
                @click="showRegistrationModal = true"
              >
                <font-awesome-icon icon="fa-solid fa-pen-to-square" class="h-4 w-4" />
                {{ t('actualites.detail.event.registration.register') }}
              </button>
            </template>
          </div>

          <!-- Lien visioconférence -->
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

          <ActualitesSidebar :show-events="false" />
        </aside>
      </div>
    </div>
    <!-- Modal d'inscription -->
    <Teleport to="body">
      <div
        v-if="showRegistrationModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="fixed inset-0 bg-black/60 transition-opacity" @click="closeRegistrationModal" />
        <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <!-- Succès -->
          <div v-if="registrationSuccess" class="text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <font-awesome-icon icon="fa-solid fa-check" class="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {{ t('actualites.detail.event.registration.successTitle') }}
            </h3>
            <p class="mb-6 text-gray-500 dark:text-gray-400">
              {{ t('actualites.detail.event.registration.successMessage') }}
            </p>
            <button
              class="rounded-lg bg-brand-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue-700"
              @click="closeRegistrationModal"
            >
              {{ t('actualites.detail.event.registration.close') }}
            </button>
          </div>

          <!-- Formulaire -->
          <template v-else>
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ t('actualites.detail.event.registration.formTitle') }}
              </h3>
              <button
                class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                @click="closeRegistrationModal"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5" />
              </button>
            </div>

            <!-- Erreur -->
            <div
              v-if="registrationError"
              class="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
            >
              <div class="flex items-center gap-2">
                <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-4 w-4" />
                {{ registrationError }}
              </div>
            </div>

            <form class="space-y-4" @submit.prevent="submitRegistration">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('actualites.detail.event.registration.lastName') }}
                  </label>
                  <input
                    v-model="registrationForm.last_name"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ t('actualites.detail.event.registration.firstName') }}
                  </label>
                  <input
                    v-model="registrationForm.first_name"
                    type="text"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('actualites.detail.event.registration.email') }} *
                </label>
                <input
                  v-model="registrationForm.email"
                  type="email"
                  required
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('actualites.detail.event.registration.phone') }}
                </label>
                <input
                  v-model="registrationForm.phone"
                  type="tel"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ t('actualites.detail.event.registration.organization') }}
                </label>
                <input
                  v-model="registrationForm.organization"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                type="submit"
                :disabled="isRegistering"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-700 disabled:opacity-50"
              >
                <font-awesome-icon v-if="isRegistering" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
                <font-awesome-icon v-else icon="fa-solid fa-paper-plane" class="h-4 w-4" />
                {{ isRegistering ? t('actualites.detail.event.registration.submitting') : t('actualites.detail.event.registration.submit') }}
              </button>
            </form>
          </template>
        </div>
      </div>
    </Teleport>
    </div>
  </div>
</template>
