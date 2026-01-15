<script setup lang="ts">
import type { CampusCall } from '~/composables/useMockData'

const { t, locale } = useI18n()
const { getAllCalls } = useMockData()

// SEO
useSeoMeta({
  title: () => `${t('actualites.calls.title')} | ${t('actualites.seo.title')}`,
  description: () => t('actualites.calls.subtitle')
})

// Filters
const selectedType = ref<'all' | CampusCall['type']>('all')
const selectedStatus = ref<'all' | 'open' | 'closed'>('all')

// All calls
const allCalls = computed(() => getAllCalls())

// Filtered calls
const filteredCalls = computed(() => {
  let calls = allCalls.value

  // Filter by type
  if (selectedType.value !== 'all') {
    calls = calls.filter(c => c.type === selectedType.value)
  }

  // Filter by status
  if (selectedStatus.value !== 'all') {
    calls = calls.filter(c => c.status === selectedStatus.value)
  }

  return calls
})

// Filter options
const typeFilters = [
  { value: 'all', label: 'actualites.calls.filters.all' },
  { value: 'candidature', label: 'actualites.calls.filters.candidature' },
  { value: 'bourse', label: 'actualites.calls.filters.bourse' },
  { value: 'projet', label: 'actualites.calls.filters.projet' },
  { value: 'recrutement', label: 'actualites.calls.filters.recrutement' }
]

const statusFilters = [
  { value: 'all', label: 'actualites.calls.status.all' },
  { value: 'open', label: 'actualites.calls.status.open' },
  { value: 'closed', label: 'actualites.calls.status.closed' }
]

// Localization helpers
const getLocalizedTitle = (item: { title_fr: string; title_en?: string; title_ar?: string }) => {
  if (locale.value === 'en' && item.title_en) return item.title_en
  if (locale.value === 'ar' && item.title_ar) return item.title_ar
  return item.title_fr
}

const getLocalizedDescription = (item: { description_fr: string; description_en?: string }) => {
  if (locale.value === 'en' && item.description_en) return item.description_en
  return item.description_fr
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : locale.value === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )
}

// Check if deadline has passed
const isDeadlinePassed = (deadlineStr: string) => {
  return new Date(deadlineStr) < new Date()
}

// Days until deadline
const daysUntilDeadline = (deadlineStr: string) => {
  const deadline = new Date(deadlineStr)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
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
              @click="selectedType = filter.value as any"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              :class="selectedType === filter.value
                ? 'bg-amber-600 text-white shadow-md'
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
              @click="selectedStatus = filter.value as any"
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
          <!-- Results count -->
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {{ filteredCalls.length }} {{ filteredCalls.length === 1 ? 'résultat' : 'résultats' }}
          </p>

          <!-- Calls list -->
          <div v-if="filteredCalls.length > 0" class="space-y-6">
            <article
              v-for="call in filteredCalls"
              :key="call.id"
              class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div class="flex flex-col md:flex-row">
                <!-- Image -->
                <div class="md:w-1/3 overflow-hidden">
                  <img
                    :src="call.image || 'https://picsum.photos/seed/default-call/800/400'"
                    :alt="getLocalizedTitle(call)"
                    class="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                </div>

                <!-- Content -->
                <div class="md:w-2/3 p-6">
                  <div class="flex flex-wrap items-center gap-2 mb-3">
                    <span class="inline-block px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded">
                      {{ t(`actualites.calls.filters.${call.type}`) }}
                    </span>
                    <span
                      v-if="call.status === 'closed'"
                      class="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      {{ t('actualites.calls.closed') }}
                    </span>
                    <span
                      v-else-if="daysUntilDeadline(call.deadline) <= 7 && daysUntilDeadline(call.deadline) > 0"
                      class="inline-block px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded animate-pulse"
                    >
                      {{ daysUntilDeadline(call.deadline) }} jours restants
                    </span>
                  </div>

                  <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {{ getLocalizedTitle(call) }}
                  </h3>

                  <p class="mt-3 text-gray-600 dark:text-gray-400 line-clamp-3">
                    {{ getLocalizedDescription(call) }}
                  </p>

                  <!-- Partner logos -->
                  <div v-if="call.partner_logos && call.partner_logos.length > 0" class="flex items-center gap-3 mt-4">
                    <img
                      v-for="(logo, index) in call.partner_logos.slice(0, 3)"
                      :key="index"
                      :src="logo"
                      alt="Partner logo"
                      class="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                    >
                  </div>

                  <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div class="text-sm">
                      <span class="text-gray-500 dark:text-gray-400">{{ t('actualites.calls.deadline') }}:</span>
                      <span
                        class="ml-1 font-semibold"
                        :class="isDeadlinePassed(call.deadline) ? 'text-gray-400 dark:text-gray-500' : 'text-red-600 dark:text-red-400'"
                      >
                        {{ formatDate(call.deadline) }}
                      </span>
                    </div>

                    <a
                      v-if="call.url && call.status === 'open'"
                      :href="call.url"
                      target="_blank"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {{ t('actualites.calls.apply') }}
                      <font-awesome-icon icon="fa-solid fa-external-link" class="w-4 h-4" />
                    </a>
                    <span
                      v-else-if="call.status === 'closed'"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-lg cursor-not-allowed"
                    >
                      {{ t('actualites.calls.closed') }}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <font-awesome-icon icon="fa-solid fa-bullhorn" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ t('actualites.calls.noResults') }}</h3>
            <p class="text-gray-500 dark:text-gray-400">
              {{ t('actualites.empty.description') }}
            </p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:w-1/3">
          <ActualitesSidebar :show-calls="false" />
        </div>
      </div>
    </div>
  </div>
</template>
