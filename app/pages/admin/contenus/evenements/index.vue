<script setup lang="ts">
import type { EventRead, EventType, PublicationStatus } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  listEvents,
  deleteEvent: deleteEventApi,
  publishEvent: publishEventApi,
  cancelEvent: cancelEventApi,
  duplicateEvent: duplicateEventApi,
  eventTypeLabels,
  eventTypeColors,
  eventStatusLabels,
  eventStatusColors,
  isEventPast,
  isEventSoon,
  slugifyEvent,
} = useEventsApi()

const { campusExternalises } = useMockData()

// === STATE ===
// Données
const events = ref<EventRead[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Pagination serveur
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  pages: 1
})

// Filtres
const searchQuery = ref('')
const filterType = ref<EventType | 'all'>('all')
const filterStatus = ref<PublicationStatus | 'all'>('all')
const filterPeriod = ref<'upcoming' | 'past' | 'all'>('all')
const filterCampus = ref<string | 'all'>('all')

// Tri
const sortBy = ref<string>('start_date')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Sélection
const selectedIds = ref<string[]>([])
const selectAll = ref(false)

// Modals
const showDeleteModal = ref(false)
const deletingEvent = ref<EventRead | null>(null)
const isDeleting = ref(false)

// === COMPUTED ===
// Stats calculés à partir des données chargées
const stats = computed(() => {
  const now = new Date()
  return {
    total: pagination.value.total,
    published: events.value.filter(e => e.status === 'published').length,
    draft: events.value.filter(e => e.status === 'draft').length,
    archived: events.value.filter(e => e.status === 'archived').length,
    upcoming: events.value.filter(e => new Date(e.start_date) > now).length,
    past: events.value.filter(e => new Date(e.start_date) <= now).length,
    online: events.value.filter(e => e.is_online).length,
    registrations_total: 0 // Sera calculé quand on aura les stats serveur
  }
})

// Liste des campus
const campusList = computed(() => [
  { id: 'siege', name: 'Siège - Alexandrie' },
  ...campusExternalises.value.map(c => ({ id: c.id, name: c.name_fr }))
])

// Pagination
const currentPage = computed({
  get: () => pagination.value.page,
  set: (val) => {
    pagination.value.page = val
    fetchEvents()
  }
})

const totalPages = computed(() => pagination.value.pages)

// === METHODS ===
// Chargement des données
async function fetchEvents() {
  isLoading.value = true
  error.value = null

  try {
    // Calculer les dates selon le filtre de période
    let fromDate: string | undefined
    let toDate: string | undefined
    const now = new Date()

    if (filterPeriod.value === 'upcoming') {
      fromDate = now.toISOString()
    } else if (filterPeriod.value === 'past') {
      toDate = now.toISOString()
    }

    const response = await listEvents({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value || undefined,
      status: filterStatus.value !== 'all' ? filterStatus.value : undefined,
      event_type: filterType.value !== 'all' ? filterType.value : undefined,
      from_date: fromDate,
      to_date: toDate,
      campus_id: filterCampus.value !== 'all' ? filterCampus.value : undefined,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    })

    events.value = response.items
    pagination.value = {
      total: response.total,
      page: response.page,
      limit: response.limit,
      pages: response.pages
    }
  } catch (e) {
    console.error('Error fetching events:', e)
    error.value = 'Erreur lors du chargement des événements'
  } finally {
    isLoading.value = false
  }
}

// Gestion de la sélection
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = events.value.map(e => e.id)
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
}

const isSelected = (id: string) => selectedIds.value.includes(id)

// Tri
const toggleSort = (column: string) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  fetchEvents()
}

// Reset filtres
const resetFilters = () => {
  searchQuery.value = ''
  filterType.value = 'all'
  filterStatus.value = 'all'
  filterPeriod.value = 'all'
  filterCampus.value = 'all'
  pagination.value.page = 1
  fetchEvents()
}

// Navigation
const viewEvent = (event: EventRead) => {
  router.push(`/admin/contenus/evenements/${event.id}`)
}

const editEvent = (event: EventRead) => {
  router.push(`/admin/contenus/evenements/${event.id}/edit`)
}

const createEvent = () => {
  router.push('/admin/contenus/evenements/nouveau')
}

// Modals
const openDeleteModal = (event: EventRead) => {
  deletingEvent.value = event
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingEvent.value = null
}

// Actions CRUD
const deleteEvent = async () => {
  if (!deletingEvent.value) return

  isDeleting.value = true
  try {
    await deleteEventApi(deletingEvent.value.id)
    closeDeleteModal()
    await fetchEvents()
  } catch (e) {
    console.error('Error deleting event:', e)
    error.value = 'Erreur lors de la suppression'
  } finally {
    isDeleting.value = false
  }
}

const duplicateEvent = async (event: EventRead) => {
  try {
    const newSlug = `${event.slug}-copie-${Date.now()}`
    const response = await duplicateEventApi(event.id, newSlug)
    router.push(`/admin/contenus/evenements/${response.id}/edit`)
  } catch (e) {
    console.error('Error duplicating event:', e)
    error.value = 'Erreur lors de la duplication'
  }
}

// Actions en masse
const bulkPublish = async () => {
  try {
    await Promise.all(selectedIds.value.map(id => publishEventApi(id)))
    selectedIds.value = []
    selectAll.value = false
    await fetchEvents()
  } catch (e) {
    console.error('Error publishing events:', e)
    error.value = 'Erreur lors de la publication'
  }
}

const bulkUnpublish = async () => {
  try {
    await Promise.all(selectedIds.value.map(id => cancelEventApi(id)))
    selectedIds.value = []
    selectAll.value = false
    await fetchEvents()
  } catch (e) {
    console.error('Error unpublishing events:', e)
    error.value = 'Erreur lors de la dépublication'
  }
}

const bulkDelete = async () => {
  try {
    await Promise.all(selectedIds.value.map(id => deleteEventApi(id)))
    selectedIds.value = []
    selectAll.value = false
    await fetchEvents()
  } catch (e) {
    console.error('Error deleting events:', e)
    error.value = 'Erreur lors de la suppression'
  }
}

// Formatage
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getRegistrationProgress = (event: EventRead) => {
  if (!event.max_attendees) return 0
  // Note: registrations_count n'est pas dans EventRead basique, sera ajouté plus tard
  return 0
}

// Watch pour filtres avec debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1
    fetchEvents()
  }, 300)
})

watch([filterType, filterStatus, filterPeriod, filterCampus], () => {
  pagination.value.page = 1
  fetchEvents()
})

// Chargement initial
onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Événements
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les conférences, ateliers, cérémonies et autres événements
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="createEvent"
      >
        <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
        Nouvel événement
      </button>
    </div>

    <!-- Message d'erreur -->
    <div
      v-if="error"
      class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    >
      <div class="flex items-center gap-2">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-4 w-4" />
        {{ error }}
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Publiés</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.published }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Brouillons</p>
        <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.draft }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Archivés</p>
        <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ stats.archived }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">À venir</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.upcoming }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Passés</p>
        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.past }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">En ligne</p>
        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ stats.online }}</p>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400">Inscriptions</p>
        <p class="text-2xl font-bold text-teal-600 dark:text-teal-400">{{ stats.registrations_total }}</p>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <!-- Recherche -->
        <div class="relative flex-1 lg:max-w-md">
          <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un événement..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-2">
          <select
            v-model="filterType"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les types</option>
            <option value="conference">Conférence</option>
            <option value="workshop">Atelier</option>
            <option value="ceremony">Cérémonie</option>
            <option value="seminar">Séminaire</option>
            <option value="symposium">Colloque</option>
            <option value="other">Autre</option>
          </select>

          <select
            v-model="filterStatus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="archived">Archivé</option>
          </select>

          <select
            v-model="filterPeriod"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Toutes les périodes</option>
            <option value="upcoming">À venir</option>
            <option value="past">Passés</option>
          </select>

          <select
            v-model="filterCampus"
            class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les campus</option>
            <option v-for="campus in campusList" :key="campus.id" :value="campus.id">
              {{ campus.name }}
            </option>
          </select>

          <button
            v-if="searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterPeriod !== 'all' || filterCampus !== 'all'"
            class="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="resetFilters"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-3 w-3" />
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Actions en masse -->
      <div
        v-if="selectedIds.length > 0"
        class="mt-4 flex items-center gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20"
      >
        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
          {{ selectedIds.length }} événement(s) sélectionné(s)
        </span>
        <div class="flex gap-2">
          <button
            class="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
            @click="bulkPublish"
          >
            Publier
          </button>
          <button
            class="rounded bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
            @click="bulkUnpublish"
          >
            Dépublier
          </button>
          <button
            class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
            @click="bulkDelete"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <font-awesome-icon icon="fa-solid fa-spinner" class="h-5 w-5 animate-spin" />
        Chargement des événements...
      </div>
    </div>

    <!-- Tableau -->
    <div v-else class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="w-10 px-4 py-3">
                <input
                  v-model="selectAll"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="w-16 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Image
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('title')"
              >
                <span class="flex items-center gap-1">
                  Événement
                  <font-awesome-icon v-if="sortBy === 'title'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('type')"
              >
                <span class="flex items-center gap-1">
                  Type
                  <font-awesome-icon v-if="sortBy === 'type'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th
                class="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                @click="toggleSort('start_date')"
              >
                <span class="flex items-center gap-1">
                  Date
                  <font-awesome-icon v-if="sortBy === 'start_date'" :icon="sortOrder === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down'" class="h-3 w-3 text-blue-600" />
                </span>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Lieu
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Inscrits
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Statut
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="event in events"
              :key="event.id"
              class="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              :class="{ 'bg-blue-50 dark:bg-blue-900/30': isSelected(event.id) }"
              @click="viewEvent(event)"
            >
              <td class="px-4 py-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="isSelected(event.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelect(event.id)"
                />
              </td>
              <td class="px-4 py-3">
                <div class="h-10 w-16 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div class="flex h-full w-full items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-calendar-days" class="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="min-w-0">
                  <p class="truncate font-medium text-gray-900 dark:text-white">
                    {{ event.title }}
                  </p>
                  <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                    {{ event.slug }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                  :class="eventTypeColors[event.type]"
                >
                  {{ eventTypeLabels[event.type] }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm">
                  <span
                    :class="{
                      'text-gray-400 dark:text-gray-500': isEventPast(event.start_date),
                      'text-orange-600 dark:text-orange-400': isEventSoon(event.start_date) && !isEventPast(event.start_date),
                      'text-gray-700 dark:text-gray-300': !isEventPast(event.start_date) && !isEventSoon(event.start_date)
                    }"
                  >
                    {{ formatDate(event.start_date) }}
                  </span>
                  <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <font-awesome-icon v-if="event.is_online" icon="fa-solid fa-video" class="h-3 w-3 text-indigo-500" title="En ligne" />
                    <span v-if="isEventPast(event.start_date)" class="text-gray-400">Passé</span>
                    <span v-else-if="isEventSoon(event.start_date)" class="text-orange-500">Bientôt</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="max-w-[150px] truncate text-sm text-gray-600 dark:text-gray-300">
                  <span v-if="event.venue">{{ event.venue }}</span>
                  <span v-else-if="event.is_online" class="italic text-indigo-500">En ligne</span>
                  <span v-else class="text-gray-400">-</span>
                </div>
                <div v-if="event.city" class="truncate text-xs text-gray-500 dark:text-gray-400">
                  {{ event.city }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div v-if="event.registration_required" class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    -<span v-if="event.max_attendees" class="text-gray-400">/{{ event.max_attendees }}</span>
                  </span>
                </div>
                <span v-else class="text-xs text-gray-400">Libre</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                  :class="eventStatusColors[event.status]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="{
                      'bg-green-500': event.status === 'published',
                      'bg-yellow-500': event.status === 'draft',
                      'bg-gray-500': event.status === 'archived'
                    }"
                  ></span>
                  {{ eventStatusLabels[event.status] }}
                </span>
              </td>
              <td class="px-4 py-3 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    title="Voir les détails"
                    @click="viewEvent(event)"
                  >
                    <font-awesome-icon icon="fa-solid fa-eye" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="editEvent(event)"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                    title="Dupliquer"
                    @click="duplicateEvent(event)"
                  >
                    <font-awesome-icon icon="fa-solid fa-copy" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(event)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ (currentPage - 1) * pagination.limit + 1 }} - {{ Math.min(currentPage * pagination.limit, pagination.total) }} sur {{ pagination.total }} événements
        </div>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="currentPage--"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="h-3 w-3" />
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-300">
            Page {{ currentPage }} / {{ totalPages || 1 }}
          </span>
          <button
            :disabled="currentPage === totalPages || totalPages === 0"
            class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="currentPage++"
          >
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="h-3 w-3" />
          </button>
        </div>
      </div>

      <!-- État vide -->
      <div
        v-if="events.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center py-12"
      >
        <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
          <font-awesome-icon icon="fa-solid fa-calendar-days" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
          Aucun événement trouvé
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos filtres ou créez un nouvel événement.
        </p>
      </div>
    </div>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingEvent"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'événement
            </h3>
          </div>

          <p class="mb-2 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer cet événement ?
          </p>
          <p class="mb-6 rounded-lg bg-gray-100 p-3 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-white">
            {{ deletingEvent.title }}
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isDeleting"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isDeleting"
              @click="deleteEvent"
            >
              <font-awesome-icon v-if="isDeleting" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
