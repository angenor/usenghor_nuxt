<script setup lang="ts">
import type { FundraiserRead, FundraiserStatistics, FundraiserStatus } from '~/types/fundraising'
import { fundraiserStatusLabels, fundraiserStatusColors } from '~/types/fundraising'

definePageMeta({ layout: 'admin' })

const { listFundraisers, deleteFundraiser, getFundraiserStats, formatCurrency } = useAdminFundraisingApi()
const router = useRouter()

const fundraisers = ref<FundraiserRead[]>([])
const stats = ref<FundraiserStatistics | null>(null)
const loading = ref(true)
const search = ref('')
const statusFilter = ref<FundraiserStatus | ''>('')
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const showDeleteModal = ref(false)
const deleteTarget = ref<FundraiserRead | null>(null)

const statusBadgeClass = (status: FundraiserStatus) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  }
  return colors[status] || colors.draft
}

async function loadData() {
  loading.value = true
  try {
    const [response, statsData] = await Promise.all([
      listFundraisers({
        page: currentPage.value,
        limit: 20,
        search: search.value || undefined,
        status: statusFilter.value || undefined,
      }),
      getFundraiserStats(),
    ])
    fundraisers.value = response.items
    totalPages.value = response.pages
    total.value = response.total
    stats.value = statsData
  }
  catch (e) {
    console.error('Erreur chargement:', e)
  }
  finally {
    loading.value = false
  }
}

function confirmDelete(fundraiser: FundraiserRead) {
  deleteTarget.value = fundraiser
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!deleteTarget.value) return
  try {
    await deleteFundraiser(deleteTarget.value.id)
    showDeleteModal.value = false
    deleteTarget.value = null
    await loadData()
  }
  catch (e) {
    console.error('Erreur suppression:', e)
  }
}

watch([search, statusFilter], () => {
  currentPage.value = 1
  loadData()
})

onMounted(loadData)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Levées de fonds</h1>
      <NuxtLink
        to="/admin/contenus/levees-de-fonds/nouveau"
        class="bg-brand-blue-600 text-white px-4 py-2 rounded-lg hover:bg-brand-blue-700 transition-colors"
      >
        + Nouvelle levée de fonds
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500">Brouillons</p>
        <p class="text-2xl font-bold text-gray-500">{{ stats.draft }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500">En cours</p>
        <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500">Terminées</p>
        <p class="text-2xl font-bold text-blue-600">{{ stats.completed }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500">Objectif total</p>
        <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatCurrency(stats.total_goal) }}</p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <p class="text-sm text-gray-500">Total levé</p>
        <p class="text-lg font-bold text-brand-blue-600">{{ formatCurrency(stats.total_raised) }}</p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex gap-4 mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher par titre..."
        class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      <select
        v-model="statusFilter"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">Tous les statuts</option>
        <option value="draft">Brouillon</option>
        <option value="active">En cours</option>
        <option value="completed">Terminée</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500">Chargement...</div>
      <div v-else-if="fundraisers.length === 0" class="p-8 text-center text-gray-500">
        Aucune levée de fonds trouvée.
      </div>
      <table v-else class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Titre</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Objectif</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Levé</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Progression</th>
            <th class="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
            <th class="px-4 py-3 text-end text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="fundraiser in fundraisers"
            :key="fundraiser.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-750"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900 dark:text-white">{{ fundraiser.title }}</p>
              <p class="text-sm text-gray-500">{{ fundraiser.slug }}</p>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              {{ formatCurrency(fundraiser.goal_amount) }}
            </td>
            <td class="px-4 py-3 text-sm font-medium text-brand-blue-600">
              {{ formatCurrency(fundraiser.total_raised) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="bg-brand-blue-600 h-2 rounded-full" :style="{ width: `${Math.min(fundraiser.progress_percentage, 100)}%` }" />
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ Math.round(fundraiser.progress_percentage) }}%</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span :class="statusBadgeClass(fundraiser.status)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ fundraiserStatusLabels[fundraiser.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-end">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink
                  :to="`/admin/contenus/levees-de-fonds/${fundraiser.id}/edit`"
                  class="text-brand-blue-600 hover:text-brand-blue-800 text-sm"
                >
                  Modifier
                </NuxtLink>
                <button
                  class="text-red-600 hover:text-red-800 text-sm"
                  @click="confirmDelete(fundraiser)"
                >
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-4 flex justify-center gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="[
          'px-3 py-1 rounded text-sm',
          page === currentPage ? 'bg-brand-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        ]"
        @click="currentPage = page; loadData()"
      >
        {{ page }}
      </button>
    </div>

    <!-- Modal de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir supprimer « {{ deleteTarget?.title }} » ? Cette action est irréversible.
        </p>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" @click="showDeleteModal = false">
            Annuler
          </button>
          <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" @click="executeDelete">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
