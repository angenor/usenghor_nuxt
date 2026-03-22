<script setup lang="ts">
import type { InterestExpressionRead, InterestExpressionStatus, FundraiserRead } from '~/types/fundraising'
import { interestExpressionStatusLabels, interestExpressionStatusColors } from '~/types/fundraising'

definePageMeta({
  layout: 'admin'
})

const { t } = useI18n()

const {
  listInterestExpressions,
  updateInterestStatus,
  exportInterestCSV,
  listFundraisers,
} = useAdminFundraisingApi()

// === STATE ===
const searchQuery = ref('')
const filterStatus = ref<InterestExpressionStatus | 'all'>('all')
const filterFundraiserId = ref<string>('')
const currentPage = ref(1)
const itemsPerPage = ref(20)

const isLoading = ref(false)
const isExporting = ref(false)
const error = ref<string | null>(null)

const expressions = ref<InterestExpressionRead[]>([])
const totalItems = ref(0)
const totalPages = ref(0)

const fundraiserOptions = ref<{ id: string; title: string }[]>([])

// === DATA FETCHING ===

async function fetchExpressions() {
  isLoading.value = true
  error.value = null
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      limit: itemsPerPage.value,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterStatus.value !== 'all') params.status = filterStatus.value
    if (filterFundraiserId.value) params.fundraiser_id = filterFundraiserId.value

    const result = await listInterestExpressions(params)
    expressions.value = result.items
    totalItems.value = result.total
    totalPages.value = result.pages
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors du chargement des manifestations d\'intérêt'
  } finally {
    isLoading.value = false
  }
}

async function fetchFundraiserOptions() {
  try {
    const result = await listFundraisers({ limit: 100 })
    fundraiserOptions.value = result.items.map(f => ({ id: f.id, title: f.title }))
  } catch {
    // Silently fail
  }
}

// === ACTIONS ===

async function toggleStatus(expression: InterestExpressionRead) {
  const newStatus: InterestExpressionStatus = expression.status === 'new' ? 'contacted' : 'new'
  try {
    const updated = await updateInterestStatus(expression.id, newStatus)
    const index = expressions.value.findIndex(e => e.id === expression.id)
    if (index !== -1) {
      expressions.value[index] = updated
    }
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la mise à jour du statut'
  }
}

async function handleExportCSV() {
  isExporting.value = true
  try {
    const params: Record<string, any> = {}
    if (filterFundraiserId.value) params.fundraiser_id = filterFundraiserId.value
    if (filterStatus.value !== 'all') params.status = filterStatus.value

    const blob = await exportInterestCSV(params)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interets-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de l\'export CSV'
  } finally {
    isExporting.value = false
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function truncateText(text: string | null, maxLength: number = 60): string {
  if (!text) return '-'
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// === WATCHERS ===

watch([searchQuery, filterStatus, filterFundraiserId], () => {
  currentPage.value = 1
  fetchExpressions()
})

watch(currentPage, () => {
  fetchExpressions()
})

// === INIT ===

onMounted(async () => {
  await Promise.all([fetchExpressions(), fetchFundraiserOptions()])
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Manifestations d'intérêt
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Suivi des personnes intéressées par les campagnes de levée de fonds
        </p>
      </div>
      <button
        type="button"
        :disabled="isExporting"
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
        @click="handleExportCSV"
      >
        <i v-if="isExporting" class="fa-solid fa-spinner fa-spin" />
        <i v-else class="fa-solid fa-file-csv" />
        Exporter CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom ou email..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          >
        </div>
      </div>
      <select
        v-model="filterFundraiserId"
        class="rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">Toutes les campagnes</option>
        <option v-for="f in fundraiserOptions" :key="f.id" :value="f.id">{{ f.title }}</option>
      </select>
      <select
        v-model="filterStatus"
        class="rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="all">Tous les statuts</option>
        <option value="new">Nouveau</option>
        <option value="contacted">Contacté</option>
      </select>
    </div>

    <!-- Error -->
    <div v-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
      <i class="fa-solid fa-circle-exclamation mr-2" />
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-brand-blue-500" />
    </div>

    <!-- Table -->
    <div v-else-if="expressions.length" class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Message</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Campagne</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in expressions" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                {{ item.full_name }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                <a :href="`mailto:${item.email}`" class="text-brand-blue-600 hover:underline dark:text-brand-blue-400">
                  {{ item.email }}
                </a>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400" :title="item.message || ''">
                {{ truncateText(item.message) }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                {{ item.fundraiser_title || '-' }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="interestExpressionStatusColors[item.status]"
                >
                  {{ interestExpressionStatusLabels[item.status] }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ new Date(item.created_at).toLocaleDateString('fr-FR') }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                  :class="item.status === 'new'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:hover:bg-yellow-900/60'"
                  @click="toggleStatus(item)"
                >
                  <i :class="item.status === 'new' ? 'fa-solid fa-check' : 'fa-solid fa-rotate-left'" />
                  {{ item.status === 'new' ? 'Marquer contacté' : 'Marquer nouveau' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ totalItems }} résultat{{ totalItems > 1 ? 's' : '' }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="currentPage <= 1"
            class="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="goToPage(currentPage - 1)"
          >
            <i class="fa-solid fa-chevron-left" />
          </button>
          <template v-for="page in totalPages" :key="page">
            <button
              v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
              :class="page === currentPage
                ? 'bg-brand-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'"
              class="rounded-lg px-3 py-1.5 text-sm"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span
              v-else-if="page === currentPage - 2 || page === currentPage + 2"
              class="px-1 text-gray-400"
            >...</span>
          </template>
          <button
            :disabled="currentPage >= totalPages"
            class="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="goToPage(currentPage + 1)"
          >
            <i class="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
      <i class="fa-solid fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Aucune manifestation d'intérêt trouvée</p>
    </div>
  </div>
</template>
