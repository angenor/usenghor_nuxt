<script setup lang="ts">
import type { ApplicationCallPublicWithDetails } from '~/types/api'
import { useCallDetail } from '~/composables/useCallDetail'

// Extraire le texte brut d'un contenu EditorJS (pour le SEO)
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: { type: string; data: { text?: string } }) => {
          if (block.data?.text) {
            return block.data.text.replace(/<[^>]*>/g, '')
          }
          return ''
        })
        .filter(Boolean)
        .join(' ')
    }
  } catch {
    return content
  }
  return content
}

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { getCallBySlug, listOngoingCalls } = usePublicCallsApi()

// Active tab from hash (default to 'presentation')
const activeTab = ref('presentation')

const updateTabFromHash = () => {
  const hash = route.hash?.replace('#', '') || 'presentation'
  const validTabs = ['presentation', 'actualites', 'mediatheque']
  activeTab.value = validTabs.includes(hash) ? hash : 'presentation'
}

// State
const call = ref<ApplicationCallPublicWithDetails | null>(null)
const relatedCalls = ref<ApplicationCallPublicWithDetails[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Get the slug from route
const slug = computed(() => route.params.slug as string)

// Use composable for shared logic
const {
  typeBadgeColors,
  formatShortDate,
  getTypeLabel,
  getCallImage,
  getHeroImage,
} = useCallDetail(call)

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
  updateTabFromHash()
  fetchCall()
  fetchRelatedCalls()
})

// Watch for slug changes
watch(slug, () => {
  fetchCall()
  fetchRelatedCalls()
})

// Watch route hash changes
watch(() => route.hash, () => {
  updateTabFromHash()
})

// SEO
useSeoMeta({
  title: () => call.value ? `${call.value.title} | ${t('actualites.calls.title')}` : t('actualites.calls.title'),
  description: () => extractPlainText(call.value?.description) || t('actualites.calls.subtitle'),
  ogImage: () => call.value?.cover_image_external_id
    ? `/api/public/media/${call.value.cover_image_external_id}/download`
    : 'https://picsum.photos/seed/og-call/1200/630'
})
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
    <CallsHeroSection
      :call="call"
      :type-badge-color="typeBadgeColors[call.type]"
      :type-label="getTypeLabel(call.type)"
      :hero-image="getHeroImage(call)"
    />

    <!-- Tabs Navigation -->
    <CallsCallTabs :active-tab="activeTab" />

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main content -->
        <article class="lg:w-2/3">
          <!-- Tab: Présentation -->
          <div v-if="activeTab === 'presentation'">
            <!-- Featured image -->
            <div class="overflow-hidden rounded-xl mb-8 shadow-lg">
              <img
                :src="getCallImage(call)"
                :alt="call.title"
                class="w-full h-auto object-cover"
              >
            </div>

            <!-- Type-specific detail component -->
            <CallsDetailApplication v-if="call.type === 'application'" :call="call" />
            <CallsDetailScholarship v-else-if="call.type === 'scholarship'" :call="call" />
            <CallsDetailProject v-else-if="call.type === 'project'" :call="call" />
            <CallsDetailRecruitment v-else-if="call.type === 'recruitment'" :call="call" />
            <CallsDetailTraining v-else-if="call.type === 'training'" :call="call" />

            <!-- Related calls -->
            <CallsRelatedSection
              :related-calls="relatedCalls"
              :type-badge-colors="typeBadgeColors"
              :get-type-label="getTypeLabel"
              :format-short-date="formatShortDate"
            />
          </div>

          <!-- Tab: Actualités -->
          <CallsCallActualites v-if="activeTab === 'actualites'" :call-slug="slug" />

          <!-- Tab: Médiathèque -->
          <CallsCallMediatheque v-if="activeTab === 'mediatheque'" :call-slug="slug" />

          <!-- Back button -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
            <NuxtLink
              :to="localePath('/actualites/appels')"
              class="inline-flex items-center gap-2 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-700 dark:hover:text-brand-blue-300 font-medium transition-colors"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="w-4 h-4" />
              {{ t('actualites.detail.call.backToCalls') }}
            </NuxtLink>
          </div>
        </article>

        <!-- Sidebar -->
        <aside class="lg:w-1/3">
          <ActualitesSidebar :show-calls="false" />
        </aside>
      </div>
    </div>
  </div>
</template>
