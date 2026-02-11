<script setup lang="ts">
import type { SubscriberRead, SubscriberSource } from '~/composables/useSubscribersApi'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  listSubscribers,
  deleteSubscriber,
  unsubscribeSubscriber,
  updateSubscriber,
  getNewsletterStats,
  sourceLabels,
  sourceColors,
  formatDate,
  getFullName,
  exportSubscribersToCSV
} = useSubscribersApi()

// === STATE ===
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'true' | 'false'>('all')
const sourceFilter = ref<SubscriberSource | 'all'>('all')
const sortBy = ref<'email' | 'last_name' | 'subscribed_at' | 'source'>('subscribed_at')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Pagination (serveur)
const currentPage = ref(1)
const itemsPerPage = 20
const totalCount = ref(0)
const totalPages = ref(0)

// Données
const subscribers = ref<SubscriberRead[]>([])

// Statistiques
const stats = ref({
  total: 0,
  active: 0,
  unsubscribed: 0,
})

// Sélection pour actions en masse
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modal de suppression
const showDeleteModal = ref(false)
const subscriberToDelete = ref<SubscriberRead | null>(null)
const isBulkDelete = ref(false)

// Sources disponibles
const availableSources: SubscriberSource[] = ['website_form', 'manual', 'import', 'registration', 'event']

// === CHARGEMENT ===

async function loadSubscribers() {
  isLoading.value = true
  try {
    const response = await listSubscribers({
      page: currentPage.value,
      limit: itemsPerPage,
      search: searchQuery.value || undefined,
      active: statusFilter.value === 'all' ? undefined : statusFilter.value === 'true',
      source: sourceFilter.value === 'all' ? undefined : sourceFilter.value,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    })
    subscribers.value = response.items
    totalCount.value = response.total
    totalPages.value = response.pages
  } catch (error) {
    console.error('Erreur chargement abonnés:', error)
  } finally {
    isLoading.value = false
  }
}

async function loadStats() {
  try {
    const response = await getNewsletterStats()
    stats.value = {
      total: response.total_subscribers,
      active: response.active_subscribers,
      unsubscribed: response.total_subscribers - response.active_subscribers,
    }
  } catch {
    // Fallback: calculer depuis les données chargées
  }
}

onMounted(() => {
  loadSubscribers()
  loadStats()
})

// === METHODS ===

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  sourceFilter.value = 'all'
  currentPage.value = 1
}

const toggleSort = (column: typeof sortBy.value) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

// Sélection
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = subscribers.value.map(s => s.id)
  } else {
    selectedIds.value = []
  }
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
  selectAll.value = selectedIds.value.length === subscribers.value.length
}

// Exporter la liste
const exportList = () => {
  const subscribersToExport = selectedIds.value.length > 0
    ? subscribers.value.filter(s => selectedIds.value.includes(s.id))
    : subscribers.value

  const csv = exportSubscribersToCSV(subscribersToExport)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `abonnes-newsletter-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Suppression
const confirmDelete = (subscriber: SubscriberRead) => {
  subscriberToDelete.value = subscriber
  isBulkDelete.value = false
  showDeleteModal.value = true
}

const confirmBulkDelete = () => {
  if (selectedIds.value.length === 0) return
  isBulkDelete.value = true
  showDeleteModal.value = true
}

const executeDelete = async () => {
  try {
    if (isBulkDelete.value) {
      for (const id of selectedIds.value) {
        await deleteSubscriber(id)
      }
      selectedIds.value = []
    } else if (subscriberToDelete.value) {
      await deleteSubscriber(subscriberToDelete.value.id)
    }
    await loadSubscribers()
    await loadStats()
  } catch (error) {
    console.error('Erreur suppression:', error)
  }
  showDeleteModal.value = false
  subscriberToDelete.value = null
}

// Désabonner
const unsubscribe = async (subscriber: SubscriberRead) => {
  try {
    await unsubscribeSubscriber(subscriber.id)
    await loadSubscribers()
    await loadStats()
  } catch (error) {
    console.error('Erreur désabonnement:', error)
  }
}

const bulkUnsubscribe = async () => {
  if (selectedIds.value.length === 0) return
  try {
    for (const id of selectedIds.value) {
      await unsubscribeSubscriber(id)
    }
    selectedIds.value = []
    await loadSubscribers()
    await loadStats()
  } catch (error) {
    console.error('Erreur désabonnement en masse:', error)
  }
}

// Réabonner
const resubscribe = async (subscriber: SubscriberRead) => {
  try {
    await updateSubscriber(subscriber.id, { active: true })
    await loadSubscribers()
    await loadStats()
  } catch (error) {
    console.error('Erreur réabonnement:', error)
  }
}

// Watch pour recharger lors de changement de filtres
watch([searchQuery, statusFilter, sourceFilter], () => {
  currentPage.value = 1
  selectedIds.value = []
  selectAll.value = false
  loadSubscribers()
})

watch([sortBy, sortOrder, currentPage], () => {
  selectedIds.value = []
  selectAll.value = false
  loadSubscribers()
})
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Abonnés newsletter
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des abonnés à la newsletter de l'université
        </p>
      </div>
      <div class="flex gap-3">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="router.push('/admin/newsletter/abonnes/import')"
        >
          <font-awesome-icon :icon="['fas', 'file-import']" class="h-4 w-4" />
          Importer
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
          @click="router.push('/admin/newsletter/abonnes/nouveau')"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
          Ajouter
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'users']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total abonnés</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Actifs</p>
          </div>
        </div>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <font-awesome-icon :icon="['fas', 'user-slash']" class="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.unsubscribed }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Désabonnés</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Recherche -->
        <div class="min-w-[200px] flex-1">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recherche
          </label>
          <div class="relative">
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Email, nom, prénom..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Statut -->
        <div class="w-40">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut
          </label>
          <select
            v-model="statusFilter"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Désabonnés</option>
          </select>
        </div>

        <!-- Source -->
        <div class="w-48">
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Source
          </label>
          <select
            v-model="sourceFilter"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Toutes sources</option>
            <option v-for="source in availableSources" :key="source" :value="source">
              {{ sourceLabels[source] }}
            </option>
          </select>
        </div>

        <!-- Reset -->
        <button
          class="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          @click="resetFilters"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Actions en masse -->
    <div
      v-if="selectedIds.length > 0"
      class="mb-4 flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
    >
      <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
        {{ selectedIds.length }} sélectionné(s)
      </span>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800"
          @click="exportList"
        >
          <font-awesome-icon :icon="['fas', 'download']" class="h-3 w-3" />
          Exporter
        </button>
        <button
          class="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-orange-700 transition-colors hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-800"
          @click="bulkUnsubscribe"
        >
          <font-awesome-icon :icon="['fas', 'user-minus']" class="h-3 w-3" />
          Désabonner
        </button>
        <button
          class="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800"
          @click="confirmBulkDelete"
        >
          <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
          Supprimer
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Table -->
    <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th class="w-12 px-4 py-3">
                <input
                  v-model="selectAll"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelectAll"
                >
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                @click="toggleSort('email')"
              >
                <div class="flex items-center gap-1">
                  Email
                  <font-awesome-icon
                    v-if="sortBy === 'email'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                @click="toggleSort('last_name')"
              >
                <div class="flex items-center gap-1">
                  Nom
                  <font-awesome-icon
                    v-if="sortBy === 'last_name'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                @click="toggleSort('source')"
              >
                <div class="flex items-center gap-1">
                  Source
                  <font-awesome-icon
                    v-if="sortBy === 'source'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Statut
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                @click="toggleSort('subscribed_at')"
              >
                <div class="flex items-center gap-1">
                  Inscription
                  <font-awesome-icon
                    v-if="sortBy === 'subscribed_at'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="subscriber in subscribers"
              :key="subscriber.id"
              class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(subscriber.id)"
                  class="h-4 w-4 rounded border-gray-300 text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelect(subscriber.id)"
                >
              </td>
              <td class="px-4 py-3">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ subscriber.email }}
                </span>
                <span
                  v-if="subscriber.user_external_id"
                  class="ml-2 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  <font-awesome-icon :icon="['fas', 'link']" class="mr-1 h-2.5 w-2.5" />
                  Lié
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {{ getFullName(subscriber) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  :class="sourceColors[subscriber.source] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                >
                  {{ sourceLabels[subscriber.source] || subscriber.source }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  v-if="subscriber.active"
                  class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Actif
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  Désabonné
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(subscriber.subscribed_at) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="subscriber.active"
                    class="rounded p-1.5 text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    title="Désabonner"
                    @click="unsubscribe(subscriber)"
                  >
                    <font-awesome-icon :icon="['fas', 'user-minus']" class="h-4 w-4" />
                  </button>
                  <button
                    v-else
                    class="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                    title="Réabonner"
                    @click="resubscribe(subscriber)"
                  >
                    <font-awesome-icon :icon="['fas', 'user-plus']" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    title="Modifier"
                    @click="router.push(`/admin/newsletter/abonnes/${subscriber.id}/edit`)"
                  >
                    <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="Supprimer"
                    @click="confirmDelete(subscriber)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div
        v-if="subscribers.length === 0"
        class="py-12 text-center"
      >
        <font-awesome-icon :icon="['fas', 'envelope']" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          Aucun abonné trouvé
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          Modifiez vos filtres ou ajoutez un nouvel abonné.
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ (currentPage - 1) * itemsPerPage + 1 }} -
          {{ Math.min(currentPage * itemsPerPage, totalCount) }}
          sur {{ totalCount }} abonnés
        </p>
        <div class="flex gap-2">
          <button
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Précédent
          </button>
          <button
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Export button (si aucune sélection) -->
    <div v-if="selectedIds.length === 0 && subscribers.length > 0" class="mt-4 flex justify-end">
      <button
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="exportList"
      >
        <font-awesome-icon :icon="['fas', 'download']" class="h-4 w-4" />
        Exporter la page ({{ subscribers.length }})
      </button>
    </div>

    <!-- Modal de suppression -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showDeleteModal = false"
    >
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmer la suppression
          </h3>
        </div>

        <p class="mb-6 text-gray-600 dark:text-gray-400">
          <template v-if="isBulkDelete">
            Voulez-vous vraiment supprimer <strong>{{ selectedIds.length }}</strong> abonné(s) ?
            Cette action est irréversible (RGPD).
          </template>
          <template v-else-if="subscriberToDelete">
            Voulez-vous vraiment supprimer <strong>{{ subscriberToDelete.email }}</strong> ?
            Cette action est irréversible (RGPD).
          </template>
        </p>

        <div class="flex justify-end gap-3">
          <button
            class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="showDeleteModal = false"
          >
            Annuler
          </button>
          <button
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            @click="executeDelete"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
