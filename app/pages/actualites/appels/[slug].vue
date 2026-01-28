<script setup lang="ts">
import type { ApplicationCallPublicWithDetails, CallType } from '~/types/api'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { getCallBySlug, listOngoingCalls } = usePublicCallsApi()

// State
const call = ref<ApplicationCallPublicWithDetails | null>(null)
const relatedCalls = ref<ApplicationCallPublicWithDetails[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Get the slug from route
const slug = computed(() => route.params.slug as string)

// Fetch call data
async function fetchCall() {
  loading.value = true
  error.value = null
  try {
    call.value = await getCallBySlug(slug.value)
  } catch (e) {
    error.value = t('actualites.detail.call.notFound')
    console.error('Error fetching call:', e)
  } finally {
    loading.value = false
  }
}

// Fetch related calls
async function fetchRelatedCalls() {
  try {
    const ongoing = await listOngoingCalls()
    relatedCalls.value = ongoing
      .filter(c => c.slug !== slug.value)
      .slice(0, 3) as ApplicationCallPublicWithDetails[]
  } catch (e) {
    console.error('Error fetching related calls:', e)
  }
}

// Initial fetch
onMounted(() => {
  fetchCall()
  fetchRelatedCalls()
})

// Watch for slug changes
watch(slug, () => {
  fetchCall()
  fetchRelatedCalls()
})

// SEO
useSeoMeta({
  title: () => call.value ? `${call.value.title} | ${t('actualites.calls.title')}` : t('actualites.calls.title'),
  description: () => call.value?.description || t('actualites.calls.subtitle'),
  ogImage: () => call.value?.cover_image_external_id
    ? `https://picsum.photos/seed/${call.value.id}/1200/630`
    : 'https://picsum.photos/seed/og-call/1200/630'
})

// Mapping des types API vers les clés i18n
const typeToI18nKey: Record<CallType, string> = {
  application: 'candidature',
  scholarship: 'bourse',
  project: 'projet',
  recruitment: 'recrutement',
  training: 'formation',
}

// Format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  )
}

const formatShortDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'short' }
  )
}

// Check if deadline has passed
const isDeadlinePassed = computed(() => {
  if (!call.value?.deadline) return false
  return new Date(call.value.deadline) < new Date()
})

// Days until deadline
const daysUntilDeadline = computed(() => {
  if (!call.value?.deadline) return 0
  const deadline = new Date(call.value.deadline)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Type badge colors
const typeBadgeColors: Record<CallType, string> = {
  application: 'bg-brand-blue-600',
  scholarship: 'bg-purple-600',
  project: 'bg-green-600',
  recruitment: 'bg-orange-600',
  training: 'bg-cyan-600',
}

// Get type label for i18n
const getTypeLabel = (type: CallType) => {
  const key = typeToI18nKey[type]
  return t(`actualites.calls.filters.${key}`)
}

// Get placeholder image
const getCallImage = (callData: ApplicationCallPublicWithDetails) => {
  if (callData.cover_image_external_id) {
    // TODO: Construct actual image URL from media service
    return `https://picsum.photos/seed/${callData.id}/800/450`
  }
  return `https://picsum.photos/seed/${callData.slug}/800/450`
}

const getHeroImage = (callData: ApplicationCallPublicWithDetails) => {
  if (callData.cover_image_external_id) {
    return `https://picsum.photos/seed/${callData.id}/1920/600`
  }
  return `https://picsum.photos/seed/${callData.slug}-hero/1920/600`
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center py-32">
    <div class="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue-600 border-t-transparent"></div>
  </div>

  <!-- Error -->
  <div v-else-if="error || !call" class="max-w-2xl mx-auto px-4 py-32 text-center">
    <div class="mb-6 rounded-full bg-red-100 dark:bg-red-900/30 p-6 inline-block">
      <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-12 h-12 text-red-500" />
    </div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      {{ t('actualites.detail.call.notFound') }}
    </h1>
    <p class="text-gray-500 dark:text-gray-400 mb-8">
      {{ t('actualites.detail.call.notFoundDescription') || "L'appel que vous recherchez n'existe pas ou a été supprimé." }}
    </p>
    <NuxtLink
      :to="localePath('/actualites/appels')"
      class="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue-600 text-white font-medium rounded-lg hover:bg-brand-blue-700 transition-colors"
    >
      <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
      {{ t('actualites.detail.call.backToCalls') }}
    </NuxtLink>
  </div>

  <div v-else>
    <!-- Hero Section -->
    <section class="relative h-[50vh] min-h-[400px] max-h-[500px] overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0">
        <img
          :src="getHeroImage(call)"
          :alt="call.title"
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
                <span class="text-brand-blue-400 font-medium truncate max-w-xs">{{ call.title }}</span>
              </li>
            </ol>
          </nav>

          <!-- Badges -->
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span
              class="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
              :class="typeBadgeColors[call.type]"
            >
              {{ getTypeLabel(call.type) }}
            </span>
            <span
              v-if="call.status === 'ongoing'"
              class="inline-block px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full"
            >
              {{ t('actualites.detail.call.statusOpen') }}
            </span>
            <span
              v-else-if="call.status === 'upcoming'"
              class="inline-block px-3 py-1 text-sm font-medium bg-yellow-600 text-white rounded-full"
            >
              {{ t('actualites.calls.status.upcoming') || 'À venir' }}
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
            {{ call.title }}
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
              :src="getCallImage(call)"
              :alt="call.title"
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
                v-if="!isDeadlinePassed && daysUntilDeadline <= 14 && daysUntilDeadline > 0"
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

            <!-- Opening date -->
            <div v-if="call.opening_date" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-door-open" class="w-4 h-4" />
                {{ t('actualites.detail.call.openingDate') || 'Ouverture' }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white">
                {{ formatDate(call.opening_date) }}
              </div>
            </div>

            <!-- Type -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                <font-awesome-icon icon="fa-solid fa-tag" class="w-4 h-4" />
                {{ t('actualites.detail.call.type') }}
              </div>
              <div class="font-bold text-gray-900 dark:text-white">
                {{ getTypeLabel(call.type) }}
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
                :class="call.status === 'ongoing' ? 'text-green-600 dark:text-green-400' : call.status === 'upcoming' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'"
              >
                {{ call.status === 'ongoing' ? t('actualites.detail.call.statusOpen') : call.status === 'upcoming' ? (t('actualites.calls.status.upcoming') || 'À venir') : t('actualites.detail.call.statusClosed') }}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="prose prose-lg dark:prose-invert max-w-none mb-8">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {{ call.description }}
            </p>
          </div>

          <!-- Target audience -->
          <div v-if="call.target_audience" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-users" class="text-brand-blue-500" />
              {{ t('actualites.detail.call.targetAudience') || 'Public cible' }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              {{ call.target_audience }}
            </p>
          </div>

          <!-- Eligibility Criteria -->
          <div v-if="call.eligibility_criteria && call.eligibility_criteria.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-list-check" class="text-brand-blue-500" />
              {{ t('actualites.detail.call.eligibilityCriteria') || "Critères d'éligibilité" }}
            </h3>
            <div class="space-y-3">
              <div
                v-for="criterion in call.eligibility_criteria"
                :key="criterion.id"
                class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div
                  class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  :class="criterion.is_mandatory ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'"
                >
                  <font-awesome-icon
                    :icon="criterion.is_mandatory ? 'fa-solid fa-asterisk' : 'fa-solid fa-check'"
                    class="w-3 h-3"
                  />
                </div>
                <div>
                  <p class="text-gray-700 dark:text-gray-300">{{ criterion.criterion }}</p>
                  <span v-if="criterion.is_mandatory" class="text-xs text-red-600 dark:text-red-400 font-medium">
                    Obligatoire
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Coverage -->
          <div v-if="call.coverage && call.coverage.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-gift" class="text-brand-blue-500" />
              {{ t('actualites.detail.call.coverage') || 'Prises en charge' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="item in call.coverage"
                :key="item.id"
                class="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
              >
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <font-awesome-icon icon="fa-solid fa-check" class="w-3 h-3" />
                </div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ item.item }}</p>
                  <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Required Documents -->
          <div v-if="call.required_documents && call.required_documents.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-file-alt" class="text-brand-blue-500" />
              {{ t('actualites.detail.call.requiredDocuments') || 'Documents requis' }}
            </h3>
            <div class="space-y-3">
              <div
                v-for="doc in call.required_documents"
                :key="doc.id"
                class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-400 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-file" class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ doc.document_name }}
                        <span v-if="doc.is_mandatory" class="text-red-600 ml-1">*</span>
                      </p>
                      <p v-if="doc.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ doc.description }}</p>
                      <div class="flex flex-wrap gap-2 mt-2">
                        <span v-if="doc.accepted_formats" class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          {{ doc.accepted_formats.toUpperCase() }}
                        </span>
                        <span v-if="doc.max_size_mb" class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                          Max {{ doc.max_size_mb }} Mo
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    v-if="doc.is_mandatory"
                    class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-medium"
                  >
                    Obligatoire
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div v-if="call.schedule && call.schedule.length > 0" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-calendar-alt" class="text-brand-blue-500" />
              {{ t('actualites.detail.call.schedule') || 'Calendrier' }}
            </h3>
            <div class="relative">
              <!-- Timeline line -->
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div class="space-y-4">
                <div
                  v-for="(step, index) in call.schedule"
                  :key="step.id"
                  class="relative flex gap-4 pl-2"
                >
                  <!-- Timeline dot -->
                  <div class="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 border-brand-blue-600 bg-white dark:bg-gray-900 flex items-center justify-center">
                    <span class="text-xs font-bold text-brand-blue-600">{{ index + 1 }}</span>
                  </div>
                  <div class="flex-1 pb-4">
                    <p class="font-medium text-gray-900 dark:text-white">{{ step.step }}</p>
                    <div class="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span v-if="step.start_date">
                        <font-awesome-icon icon="fa-solid fa-calendar" class="w-3 h-3 mr-1" />
                        {{ formatDate(step.start_date) }}
                      </span>
                      <span v-if="step.end_date && step.start_date !== step.end_date">
                        - {{ formatDate(step.end_date) }}
                      </span>
                    </div>
                    <p v-if="step.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {{ step.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Registration fee -->
          <div v-if="call.registration_fee" class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <font-awesome-icon icon="fa-solid fa-coins" class="text-brand-blue-500" />
              {{ t('actualites.detail.call.registrationFee') || "Frais d'inscription" }}
            </h3>
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {{ call.registration_fee }} {{ call.currency }}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div class="mb-8">
            <a
              v-if="call.external_form_url && call.status === 'ongoing'"
              :href="call.external_form_url"
              target="_blank"
              class="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-5 h-5" />
              {{ t('actualites.detail.call.apply') }}
              <font-awesome-icon icon="fa-solid fa-external-link" class="w-4 h-4" />
            </a>
            <NuxtLink
              v-else-if="call.use_internal_form && call.status === 'ongoing'"
              :to="localePath(`/candidatures/postuler/${call.slug}`)"
              class="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-lg font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              <font-awesome-icon icon="fa-solid fa-paper-plane" class="w-5 h-5" />
              {{ t('actualites.detail.call.apply') }}
            </NuxtLink>
            <div
              v-else-if="call.status === 'closed'"
              class="inline-flex items-center gap-3 px-8 py-4 bg-gray-400 text-white text-lg font-bold rounded-xl cursor-not-allowed"
            >
              <font-awesome-icon icon="fa-solid fa-lock" class="w-5 h-5" />
              {{ t('actualites.detail.call.closed') }}
            </div>
            <div
              v-else-if="call.status === 'upcoming'"
              class="inline-flex items-center gap-3 px-8 py-4 bg-yellow-500 text-white text-lg font-bold rounded-xl cursor-not-allowed"
            >
              <font-awesome-icon icon="fa-solid fa-clock" class="w-5 h-5" />
              {{ t('actualites.calls.status.upcoming') || 'À venir' }}
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
                <NuxtLink :to="localePath(`/actualites/appels/${item.slug}`)">
                  <div class="overflow-hidden h-32">
                    <img
                      :src="`https://picsum.photos/seed/${item.slug}/400/200`"
                      :alt="item.title"
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
                        {{ getTypeLabel(item.type) }}
                      </span>
                    </div>

                    <h3 class="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400 transition-colors">
                      {{ item.title }}
                    </h3>

                    <div v-if="item.deadline" class="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
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
