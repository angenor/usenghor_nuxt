<script setup lang="ts">
import type { AuditLog, AuditLogDetail, AuditAction, AuditLogFilters } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStatistics,
  getAuditDistinctTablesList,
  getAuditDistinctUsersList,
  auditActionLabels,
  auditActionColors,
  auditActionIcons,
  auditTableLabels,
  formatIpAddress,
  formatUserAgent,
  getTableLabel
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const logs = ref<AuditLog[]>([])
const selectedLog = ref<AuditLogDetail | null>(null)
const showDetailModal = ref(false)
const showFilters = ref(false)
const showStatistics = ref(false)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Filters
const filters = ref<AuditLogFilters>({
  user_id: undefined,
  action: undefined,
  table_name: undefined,
  date_from: undefined,
  date_to: undefined,
  ip_address: undefined,
  search: undefined
})

// Filter options
const tableOptions = computed(() => getAuditDistinctTablesList())
const userOptions = computed(() => getAuditDistinctUsersList())

const actionOptions: AuditAction[] = ['create', 'update', 'delete', 'login', 'logout']

// === COMPUTED ===
const filteredLogs = computed(() => {
  const cleanFilters: AuditLogFilters = {}
  if (filters.value.user_id) cleanFilters.user_id = filters.value.user_id
  if (filters.value.action) cleanFilters.action = filters.value.action
  if (filters.value.table_name) cleanFilters.table_name = filters.value.table_name
  if (filters.value.date_from) cleanFilters.date_from = filters.value.date_from
  if (filters.value.date_to) cleanFilters.date_to = filters.value.date_to
  if (filters.value.ip_address) cleanFilters.ip_address = filters.value.ip_address
  if (filters.value.search) cleanFilters.search = filters.value.search

  return getAllAuditLogs(Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined)
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLogs.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage.value))

const statistics = computed(() => {
  return getAuditStatistics(filters.value.date_from, filters.value.date_to)
})

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.user_id ||
    filters.value.action ||
    filters.value.table_name ||
    filters.value.date_from ||
    filters.value.date_to ||
    filters.value.ip_address ||
    filters.value.search
  )
})

// === METHODS ===
const loadData = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    logs.value = getAllAuditLogs()
  } finally {
    isLoading.value = false
  }
}

const viewLogDetail = (log: AuditLog) => {
  const detail = getAuditLogById(log.id)
  if (detail) {
    selectedLog.value = detail
    showDetailModal.value = true
  }
}

const clearFilters = () => {
  filters.value = {
    user_id: undefined,
    action: undefined,
    table_name: undefined,
    date_from: undefined,
    date_to: undefined,
    ip_address: undefined,
    search: undefined
  }
  currentPage.value = 1
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watch filters to reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Load data on mount
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Journal d'audit</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Historique des actions effectuées dans le système
        </p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showStatistics = !showStatistics"
        >
          <font-awesome-icon :icon="['fas', 'chart-bar']" class="h-4 w-4" />
          Statistiques
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="showFilters = !showFilters"
        >
          <font-awesome-icon :icon="['fas', 'filter']" class="h-4 w-4" />
          Filtres
          <span
            v-if="hasActiveFilters"
            class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white"
          >
            !
          </span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Statistics Panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showStatistics" class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Statistiques</h3>

          <!-- Stats Cards -->
          <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ statistics.total_events }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ statistics.by_action.create }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Créations</p>
            </div>
            <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ statistics.by_action.update }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Modifications</p>
            </div>
            <div class="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
              <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ statistics.by_action.delete }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Suppressions</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ statistics.by_action.login }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Connexions</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ statistics.by_action.logout }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Déconnexions</p>
            </div>
          </div>

          <!-- Top Tables and Users -->
          <div class="grid gap-6 lg:grid-cols-2">
            <!-- Top Tables -->
            <div>
              <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Tables les plus actives</h4>
              <div class="space-y-2">
                <div
                  v-for="item in statistics.by_table.slice(0, 5)"
                  :key="item.table"
                  class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
                >
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ getTableLabel(item.table) }}</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.count }}</span>
                </div>
                <p v-if="statistics.by_table.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
                  Aucune donnée
                </p>
              </div>
            </div>

            <!-- Top Users -->
            <div>
              <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Utilisateurs les plus actifs</h4>
              <div class="space-y-2">
                <div
                  v-for="item in statistics.by_user.slice(0, 5)"
                  :key="item.user_id"
                  class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
                >
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.user_name }}</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.count }}</span>
                </div>
                <p v-if="statistics.by_user.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
                  Aucune donnée
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Filters Panel -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showFilters" class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h3>
            <button
              v-if="hasActiveFilters"
              type="button"
              class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              @click="clearFilters"
            >
              Réinitialiser
            </button>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Search -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Recherche</label>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Rechercher..."
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Action -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Action</label>
              <select
                v-model="filters.action"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option :value="undefined">Toutes les actions</option>
                <option v-for="action in actionOptions" :key="action" :value="action">
                  {{ auditActionLabels[action] }}
                </option>
              </select>
            </div>

            <!-- Table -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Table</label>
              <select
                v-model="filters.table_name"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option :value="undefined">Toutes les tables</option>
                <option v-for="table in tableOptions" :key="table" :value="table">
                  {{ getTableLabel(table) }}
                </option>
              </select>
            </div>

            <!-- User -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Utilisateur</label>
              <select
                v-model="filters.user_id"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option :value="undefined">Tous les utilisateurs</option>
                <option v-for="user in userOptions" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>

            <!-- Date From -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date début</label>
              <input
                v-model="filters.date_from"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- Date To -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date fin</label>
              <input
                v-model="filters.date_to"
                type="date"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <!-- IP Address -->
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse IP</label>
              <input
                v-model="filters.ip_address"
                type="text"
                placeholder="Ex: 192.168.1"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Results count -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredLogs.length }} événement{{ filteredLogs.length > 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Logs Table -->
      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Date / Heure
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Utilisateur
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Action
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Table
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Résumé
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  IP
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="log in paginatedLogs"
                :key="log.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {{ formatDateTime(log.created_at) }}
                </td>
                <td class="px-4 py-3">
                  <div v-if="log.user" class="text-sm">
                    <p class="font-medium text-gray-900 dark:text-white">{{ log.user.name }}</p>
                    <p class="text-gray-500 dark:text-gray-400">{{ log.user.email }}</p>
                  </div>
                  <span v-else class="text-sm text-gray-500 dark:text-gray-400">Système</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="auditActionColors[log.action]"
                  >
                    <font-awesome-icon :icon="['fas', auditActionIcons[log.action]]" class="h-3 w-3" />
                    {{ auditActionLabels[log.action] }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {{ getTableLabel(log.table_name) }}
                </td>
                <td class="max-w-xs truncate px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ log.summary || '-' }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {{ formatIpAddress(log.ip_address) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Voir le détail"
                    @click="viewLogDetail(log)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" class="h-4 w-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedLogs.length === 0">
                <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <font-awesome-icon :icon="['fas', 'inbox']" class="mb-2 h-8 w-8" />
                  <p>Aucun événement trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Page {{ currentPage }} sur {{ totalPages }}
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="goToPage(1)"
            >
              <font-awesome-icon :icon="['fas', 'angles-left']" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <font-awesome-icon :icon="['fas', 'angle-left']" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <font-awesome-icon :icon="['fas', 'angle-right']" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="goToPage(totalPages)"
            >
              <font-awesome-icon :icon="['fas', 'angles-right']" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedLog"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        @click.self="showDetailModal = false"
      >
        <div class="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg"
                :class="auditActionColors[selectedLog.action]"
              >
                <font-awesome-icon :icon="['fas', auditActionIcons[selectedLog.action]]" class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Détail de l'événement
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDateTime(selectedLog.created_at) }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              @click="showDetailModal = false"
            >
              <font-awesome-icon :icon="['fas', 'xmark']" class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="max-h-[60vh] overflow-y-auto p-4">
            <!-- Info Grid -->
            <div class="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Utilisateur</p>
                <p class="text-gray-900 dark:text-white">
                  {{ selectedLog.user?.name || 'Système' }}
                </p>
                <p v-if="selectedLog.user" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ selectedLog.user.email }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Action</p>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="auditActionColors[selectedLog.action]"
                >
                  {{ auditActionLabels[selectedLog.action] }}
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Table</p>
                <p class="text-gray-900 dark:text-white">
                  {{ getTableLabel(selectedLog.table_name) }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">ID Enregistrement</p>
                <p class="font-mono text-sm text-gray-900 dark:text-white">
                  {{ selectedLog.record_id || '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse IP</p>
                <p class="font-mono text-sm text-gray-900 dark:text-white">
                  {{ formatIpAddress(selectedLog.ip_address) }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Navigateur</p>
                <p class="text-gray-900 dark:text-white">
                  {{ formatUserAgent(selectedLog.user_agent).browser }} / {{ formatUserAgent(selectedLog.user_agent).os }}
                </p>
              </div>
            </div>

            <!-- Summary -->
            <div v-if="selectedLog.summary" class="mb-6">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Résumé</p>
              <p class="mt-1 text-gray-900 dark:text-white">{{ selectedLog.summary }}</p>
            </div>

            <!-- Changes -->
            <div v-if="selectedLog.changes && selectedLog.changes.length > 0">
              <p class="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Modifications</p>
              <div class="space-y-3">
                <div
                  v-for="(change, index) in selectedLog.changes"
                  :key="index"
                  class="rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div class="border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-700/50">
                    <span class="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ change.field }}
                    </span>
                  </div>
                  <div class="grid gap-2 p-3 sm:grid-cols-2">
                    <div>
                      <p class="mb-1 text-xs font-medium text-red-600 dark:text-red-400">Avant</p>
                      <div class="rounded bg-red-50 p-2 dark:bg-red-900/20">
                        <pre class="whitespace-pre-wrap font-mono text-xs text-gray-800 dark:text-gray-200">{{ formatValue(change.old) }}</pre>
                      </div>
                    </div>
                    <div>
                      <p class="mb-1 text-xs font-medium text-green-600 dark:text-green-400">Après</p>
                      <div class="rounded bg-green-50 p-2 dark:bg-green-900/20">
                        <pre class="whitespace-pre-wrap font-mono text-xs text-gray-800 dark:text-gray-200">{{ formatValue(change.new) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- No changes message for login/logout -->
            <div
              v-else-if="selectedLog.action === 'login' || selectedLog.action === 'logout'"
              class="text-center text-gray-500 dark:text-gray-400"
            >
              <font-awesome-icon :icon="['fas', 'info-circle']" class="mb-2 h-8 w-8" />
              <p>Événement de {{ selectedLog.action === 'login' ? 'connexion' : 'déconnexion' }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end border-t border-gray-200 p-4 dark:border-gray-700">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="showDetailModal = false"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
