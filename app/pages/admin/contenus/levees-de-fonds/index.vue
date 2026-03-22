<script setup lang="ts">
import type { FundraiserRead, FundraiserStatistics, FundraiserStatus } from '~/types/fundraising'
import { fundraiserStatusLabels, fundraiserStatusColors } from '~/types/fundraising'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { t } = useI18n()

const {
  listFundraisers,
  getFundraiserStats,
  deleteFundraiser: apiDeleteFundraiser,
  formatCurrency,
} = useAdminFundraisingApi()

// === STATE ===
const searchQuery = ref('')
const filterStatus = ref<FundraiserStatus | 'all'>('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const isLoading = ref(false)
const isLoadingStats = ref(false)
const error = ref<string | null>(null)

const fundraisers = ref<FundraiserRead[]>([])
const totalItems = ref(0)
const totalPages = ref(0)

const stats = ref<FundraiserStatistics | null>(null)

// Delete modal
const showDeleteModal = ref(false)
const deletingFundraiser = ref<FundraiserRead | null>(null)
const isDeleting = ref(false)

// === DATA FETCHING ===

async function fetchFundraisers() {
  isLoading.value = true
  error.value = null
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      limit: itemsPerPage.value,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterStatus.value !== 'all') params.status = filterStatus.value

    const result = await listFundraisers(params)
    fundraisers.value = result.items
    totalItems.value = result.total
    totalPages.value = result.pages
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors du chargement des campagnes'
  } finally {
    isLoading.value = false
  }
}

async function fetchStats() {
  isLoadingStats.value = true
  try {
    stats.value = await getFundraiserStats()
  } catch {
    // Silently fail stats
  } finally {
    isLoadingStats.value = false
  }
}

// === ACTIONS ===

function confirmDelete(fundraiser: FundraiserRead) {
  deletingFundraiser.value = fundraiser
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!deletingFundraiser.value) return
  isDeleting.value = true
  try {
    await apiDeleteFundraiser(deletingFundraiser.value.id)
    showDeleteModal.value = false
    deletingFundraiser.value = null
    await Promise.all([fetchFundraisers(), fetchStats()])
  } catch (e: any) {
    error.value = e?.data?.detail || 'Erreur lors de la suppression'
  } finally {
    isDeleting.value = false
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// === WATCHERS ===

watch([searchQuery, filterStatus], () => {
  currentPage.value = 1
  fetchFundraisers()
})

watch(currentPage, () => {
  fetchFundraisers()
})

// === INIT ===

onMounted(async () => {
  await Promise.all([fetchFundraisers(), fetchStats()])
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Levées de fonds
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des campagnes de levée de fonds
        </p>
      </div>
      <NuxtLink
        to="/admin/contenus/levees-de-fonds/nouveau"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-blue-700 transition-colors"
      >
        <i class="fa-solid fa-plus" />
        Nouvelle campagne
      </NuxtLink>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
            <i class="fa-solid fa-hand-holding-dollar text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total campagnes</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.total_campaigns }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
            <i class="fa-solid fa-circle-check text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Actives</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.active_campaigns }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
            <i class="fa-solid fa-flag-checkered text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Clôturées</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.completed_campaigns }}</p>
          </div>
        </div>
      </div>
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
            <i class="fa-solid fa-euro-sign text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total levé</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(stats.total_raised) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une campagne..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          >
        </div>
      </div>
      <select
        v-model="filterStatus"
        class="rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-gray-900 focus:border-brand-blue-500 focus:ring-1 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="all">Tous les statuts</option>
        <option value="draft">Brouillon</option>
        <option value="active">Active</option>
        <option value="completed">Clôturée</option>
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
    <div v-else-if="fundraisers.length" class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Titre</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Statut</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Objectif</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in fundraisers" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <td class="whitespace-nowrap px-6 py-4">
                <NuxtLink
                  :to="`/admin/contenus/levees-de-fonds/${item.id}/edit`"
                  class="group block"
                >
                  <p class="font-medium text-gray-900 group-hover:text-brand-blue-600 dark:text-white dark:group-hover:text-brand-blue-400">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.slug }}</p>
                </NuxtLink>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="fundraiserStatusColors[item.status]"
                >
                  {{ fundraiserStatusLabels[item.status] }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                {{ formatCurrency(item.goal_amount) }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                {{ new Date(item.created_at).toLocaleDateString('fr-FR') }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/contenus/levees-de-fonds/${item.id}/edit`"
                    class="inline-flex items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-brand-blue-400 transition-colors"
                    title="Modifier"
                  >
                    <i class="fa-solid fa-pen-to-square" />
                  </NuxtLink>
                  <button
                    type="button"
                    class="inline-flex items-center rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                    @click="confirmDelete(item)"
                  >
                    <i class="fa-solid fa-trash" />
                  </button>
                </div>
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
      <i class="fa-solid fa-hand-holding-dollar text-4xl text-gray-300 dark:text-gray-600 mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Aucune campagne trouvée</p>
      <NuxtLink
        to="/admin/contenus/levees-de-fonds/nouveau"
        class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400"
      >
        <i class="fa-solid fa-plus" />
        Créer une première campagne
      </NuxtLink>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showDeleteModal = false" />
        <div class="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmer la suppression
          </h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer la campagne
            <strong class="text-gray-900 dark:text-white">{{ deletingFundraiser?.title }}</strong> ?
            Cette action est irréversible.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              :disabled="isDeleting"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              @click="executeDelete"
            >
              <i v-if="isDeleting" class="fa-solid fa-spinner fa-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
