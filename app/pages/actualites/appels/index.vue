<script setup lang="ts">
import type { ApplicationCallPublic, CallType, CallStatus } from '~/types/api'
import { callTypeLabels, callStatusLabels } from '~/composables/usePublicCallsApi'

// Extraire le texte brut d'un contenu EditorJS
const extractPlainText = (content: string | null | undefined): string => {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content)
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block: { type: string; data: { text?: string } }) => {
          if (block.data?.text) {
            // Supprimer les balises HTML éventuelles
            return block.data.text.replace(/<[^>]*>/g, '')
          }
          return ''
        })
        .filter(Boolean)
        .join(' ')
    }
  } catch {
    // Si ce n'est pas du JSON valide, retourner tel quel
    return content
  }
  return content
}

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const { listCalls } = usePublicCallsApi()

// SEO
useSeoMeta({
  title: () => `${t('actualites.calls.title')} | ${t('actualites.seo.title')}`,
  description: () => t('actualites.calls.subtitle')
})

// Mapping des types API vers les clés i18n
const typeToI18nKey: Record<CallType, string> = {
  application: 'candidature',
  scholarship: 'bourse',
  project: 'projet',
  recruitment: 'recrutement',
  training: 'formation',
}

// Mapping des statuts API vers les clés i18n
const statusToI18nKey: Record<CallStatus, string> = {
  ongoing: 'open',
  upcoming: 'upcoming',
  closed: 'closed',
}

// Filters - initialized from query parameters
const validTypes = ['all', 'application', 'scholarship', 'project', 'recruitment', 'training'] as const
const validStatuses = ['all', 'ongoing', 'closed'] as const

const getInitialType = (): 'all' | CallType => {
  const type = route.query.type as string
  if (type && validTypes.includes(type as typeof validTypes[number])) {
    return type as 'all' | CallType
  }
  return 'all'
}

const getInitialStatus = (): 'all' | CallStatus => {
  const status = route.query.status as string
  if (status && validStatuses.includes(status as typeof validStatuses[number])) {
    return status as 'all' | CallStatus
  }
  return 'all'
}

const selectedType = ref<'all' | CallType>(getInitialType())
const selectedStatus = ref<'all' | CallStatus>(getInitialStatus())

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Data
const calls = ref<ApplicationCallPublic[]>([])
const totalCalls = ref(0)
const totalPages = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// Tri des appels : en cours/à venir d'abord (par deadline imminente), puis clos
const sortCalls = (items: ApplicationCallPublic[]): ApplicationCallPublic[] => {
  return [...items].sort((a, b) => {
    // Priorité par statut : ongoing/upcoming avant closed
    const statusOrder: Record<string, number> = { ongoing: 0, upcoming: 1, closed: 2 }
    const statusDiff = (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2)
    if (statusDiff !== 0) return statusDiff

    // Pour les appels en cours/à venir : trier par deadline croissante (le plus imminent en premier)
    // Pour les appels clos : trier par deadline décroissante (le plus récent en premier)
    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity
    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity

    if (a.status === 'closed') {
      return bDeadline - aDeadline // Décroissant pour les clos
    }
    return aDeadline - bDeadline // Croissant pour les en cours/à venir
  })
}

// Fetch calls from API
async function fetchCalls() {
  loading.value = true
  error.value = null
  try {
    const response = await listCalls({
      page: currentPage.value,
      limit: itemsPerPage.value,
      call_type: selectedType.value,
      call_status: selectedStatus.value,
    })
    calls.value = sortCalls(response.items)
    totalCalls.value = response.total
    totalPages.value = response.pages
  } catch (e) {
    error.value = t('actualites.calls.errorLoading')
    console.error('Error fetching calls:', e)
  } finally {
    loading.value = false
  }
}

// Synchroniser les filtres quand les query params changent (navigation intra-page)
watch(() => route.query, (newQuery) => {
  const newType = (newQuery.type as string) || 'all'
  const newStatus = (newQuery.status as string) || 'all'

  if (validTypes.includes(newType as typeof validTypes[number]) && newType !== selectedType.value) {
    selectedType.value = newType as 'all' | CallType
  }
  if (validStatuses.includes(newStatus as typeof validStatuses[number]) && newStatus !== selectedStatus.value) {
    selectedStatus.value = newStatus as 'all' | CallStatus
  }
})

// Update URL when filters change
watch([selectedType, selectedStatus], () => {
  const query: Record<string, string> = {}
  if (selectedType.value !== 'all') query.type = selectedType.value
  if (selectedStatus.value !== 'all') query.status = selectedStatus.value
  router.replace({ query })
  currentPage.value = 1
  fetchCalls()
})

watch(currentPage, fetchCalls)

// Initial fetch
onMounted(fetchCalls)

// Filter options
const typeFilters = [
  { value: 'all', label: 'actualites.calls.filters.all' },
  { value: 'application', label: 'actualites.calls.filters.candidature' },
  { value: 'scholarship', label: 'actualites.calls.filters.bourse' },
  { value: 'project', label: 'actualites.calls.filters.projet' },
  { value: 'recruitment', label: 'actualites.calls.filters.recrutement' },
  { value: 'training', label: 'actualites.calls.filters.formation' },
]

const statusFilters = [
  { value: 'all', label: 'actualites.calls.status.all' },
  { value: 'ongoing', label: 'actualites.calls.status.open' },
  { value: 'closed', label: 'actualites.calls.status.closed' }
]

// Format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Days until deadline
const daysUntilDeadline = (deadlineStr: string | null) => {
  if (!deadlineStr) return 0
  const deadline = new Date(deadlineStr)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Check if deadline is passed
const isDeadlinePassed = (deadline: string | null) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

// Get type label for i18n
const getTypeLabel = (type: CallType) => {
  const key = typeToI18nKey[type]
  return t(`actualites.calls.filters.${key}`)
}

// Get call image from media service or null if no image
const getCallImage = (call: ApplicationCallPublic): string | null => {
  if (call.cover_image_external_id) {
    return `/api/public/media/${call.cover_image_external_id}/download?variant=medium`
  }
  return null
}
</script>

<template>
  <div>
    <!-- Hero -->
    <ActualitesHero
      :title="t('actualites.calls.title')"
      :subtitle="t('actualites.calls.subtitle')"
      :badge="t('actualites.hero.badge')"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Filters -->
      <div class="mb-10 space-y-6">
        <!-- Type filters -->
        <div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">Type :</span>
          <div class="inline-flex flex-wrap gap-2 mt-2">
            <button
              v-for="filter in typeFilters"
              :key="filter.value"
              @click="selectedType = filter.value as 'all' | CallType"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              :class="selectedType === filter.value
                ? 'bg-brand-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              {{ t(filter.label) }}
            </button>
          </div>
        </div>

        <!-- Status filters -->
        <div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">Statut :</span>
          <div class="inline-flex flex-wrap gap-2 mt-2">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              @click="selectedStatus = filter.value as 'all' | CallStatus"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              :class="selectedStatus === filter.value
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
            >
              {{ t(filter.label) }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main content -->
        <div class="lg:w-2/3">
          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-600 border-t-transparent"></div>
          </div>

          <!-- Error -->
          <div v-else-if="error" class="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-16 h-16 text-red-400 mb-4" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('actualites.calls.errorTitle') }}</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
            <button
              @click="fetchCalls"
              class="px-4 py-2 bg-brand-blue-600 text-white rounded-lg hover:bg-brand-blue-700 transition-colors"
            >
              {{ t('actualites.calls.retry') }}
            </button>
          </div>

          <template v-else>
            <!-- Results count -->
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {{ totalCalls }} {{ totalCalls === 1 ? 'résultat' : 'résultats' }}
            </p>

            <!-- Calls list -->
            <div v-if="calls.length > 0" class="space-y-6">
              <NuxtLink
                v-for="call in calls"
                :key="call.id"
                :to="localePath(`/actualites/appels/${call.slug}`)"
                class="group rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border block"
                :class="call.status === 'closed'
                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 opacity-80 hover:opacity-100'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'"
              >
                <div class="flex flex-col md:flex-row">
                  <!-- Image -->
                  <div class="md:w-1/3 overflow-hidden relative">
                    <img
                      v-if="getCallImage(call)"
                      :src="getCallImage(call)!"
                      :alt="call.title"
                      class="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      :class="call.status === 'closed' ? 'grayscale group-hover:grayscale-0' : ''"
                      loading="lazy"
                    >
                    <div v-else class="w-full h-48 md:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <!-- Closed overlay -->
                    <div
                      v-if="call.status === 'closed'"
                      class="absolute inset-0 bg-gray-900/20 dark:bg-gray-900/40 flex items-center justify-center"
                    >
                      <span class="px-3 py-1.5 bg-gray-700 dark:bg-gray-600 text-white text-sm font-semibold rounded-full">
                        {{ t('actualites.calls.closed') }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="md:w-2/3 p-6">
                    <div class="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        class="inline-block px-2 py-0.5 text-xs font-medium rounded"
                        :class="call.status === 'closed'
                          ? 'text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700'
                          : 'text-brand-blue-700 dark:text-brand-blue-400 bg-brand-blue-100 dark:bg-brand-blue-900/30'"
                      >
                        {{ getTypeLabel(call.type) }}
                      </span>
                      <span
                        v-if="call.status === 'ongoing' && call.deadline && daysUntilDeadline(call.deadline) <= 7 && daysUntilDeadline(call.deadline) > 0"
                        class="inline-block px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded animate-pulse"
                      >
                        {{ daysUntilDeadline(call.deadline) }} jours restants
                      </span>
                      <span
                        v-else-if="call.status === 'ongoing'"
                        class="inline-block px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded"
                      >
                        {{ t('actualites.calls.status.open') }}
                      </span>
                      <span
                        v-else-if="call.status === 'upcoming'"
                        class="inline-block px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 rounded"
                      >
                        {{ t('actualites.calls.status.upcoming') || 'À venir' }}
                      </span>
                    </div>

                    <h3
                      class="text-xl font-bold leading-tight transition-colors"
                      :class="call.status === 'closed'
                        ? 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                        : 'text-gray-900 dark:text-white group-hover:text-brand-blue-600 dark:group-hover:text-brand-blue-400'"
                    >
                      {{ call.title }}
                    </h3>

                    <p
                      v-if="call.description"
                      class="mt-3 line-clamp-3"
                      :class="call.status === 'closed' ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'"
                    >
                      {{ extractPlainText(call.description) }}
                    </p>

                    <div class="flex items-center justify-between mt-6 pt-4 border-t" :class="call.status === 'closed' ? 'border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'">
                      <div v-if="call.deadline" class="text-sm">
                        <span class="text-gray-500 dark:text-gray-400">{{ t('actualites.calls.deadline') }}:</span>
                        <span
                          class="ml-1 font-semibold"
                          :class="call.status === 'closed' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-red-600 dark:text-red-400'"
                        >
                          {{ formatDate(call.deadline) }}
                        </span>
                      </div>

                      <span
                        class="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg"
                        :class="call.status === 'closed'
                          ? 'bg-gray-500 text-white'
                          : 'bg-brand-blue-600 text-white'"
                      >
                        {{ call.status === 'closed' ? t('actualites.calls.viewArchive') : t('actualites.readMore') }}
                        <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('actualites.calls.noResults') }}</h3>
              <p class="text-gray-500 dark:text-gray-400">
                {{ t('actualites.empty.description') }}
              </p>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
              <button
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-4 h-4" />
              </button>
              <span class="text-sm text-gray-600 dark:text-gray-300">
                Page {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-4 h-4" />
              </button>
            </div>
          </template>
        </div>

        <!-- Sidebar -->
        <div class="lg:w-1/3">
          <ActualitesSidebar :show-calls="false" />
        </div>
      </div>
    </div>
  </div>
</template>
