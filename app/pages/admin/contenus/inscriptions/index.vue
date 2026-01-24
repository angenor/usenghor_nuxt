<script setup lang="ts">
import type { EventRegistration, RegistrationStatus, RegistrationFilters } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllRegistrations,
  getRegistrationById,
  getRegistrationsByEventId,
  getRegistrationStats,
  getEventRegistrationStatsById,
  getAdminFilteredRegistrations,
  getEventsForRegistrationFilter,
  getAdminEventById,
  registrationStatusLabels,
  registrationStatusColors,
  generateRegistrationId
} = useMockData()

// === STATE ===
const searchQuery = ref('')
const selectedEventId = ref('')
const selectedStatus = ref<RegistrationStatus | ''>('')
const dateFrom = ref('')
const dateTo = ref('')
const selectedRegistrations = ref<string[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAttendanceModal = ref(false)
const editingRegistration = ref<EventRegistration | null>(null)
const deletingRegistration = ref<EventRegistration | null>(null)

// Form state for new registration
const newRegistration = ref({
  event_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  organization: '',
  status: 'registered' as RegistrationStatus
})

// === COMPUTED ===
const eventsForFilter = computed(() => getEventsForRegistrationFilter())
const globalStats = computed(() => getRegistrationStats())

// Selected event info
const selectedEvent = computed(() => {
  if (!selectedEventId.value) return null
  return getAdminEventById(selectedEventId.value)
})

// Stats for selected event
const selectedEventStats = computed(() => {
  if (!selectedEventId.value) return null
  const event = selectedEvent.value
  return getEventRegistrationStatsById(selectedEventId.value, event?.max_attendees)
})

// Filters
const filters = computed<RegistrationFilters>(() => ({
  event_id: selectedEventId.value || undefined,
  status: selectedStatus.value || undefined,
  date_from: dateFrom.value || undefined,
  date_to: dateTo.value || undefined,
  search: searchQuery.value || undefined
}))

// Filtered registrations
const filteredRegistrations = computed(() => getAdminFilteredRegistrations(filters.value))

// Pagination
const currentPage = ref(1)
const itemsPerPage = 15
const totalPages = computed(() => Math.ceil(filteredRegistrations.value.length / itemsPerPage))
const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRegistrations.value.slice(start, start + itemsPerPage)
})

// Check if all visible registrations are selected
const allSelected = computed(() =>
  paginatedRegistrations.value.length > 0 &&
  paginatedRegistrations.value.every(r => selectedRegistrations.value.includes(r.id))
)

// === METHODS ===
const resetFilters = () => {
  searchQuery.value = ''
  selectedEventId.value = ''
  selectedStatus.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedRegistrations.value = []
  } else {
    selectedRegistrations.value = paginatedRegistrations.value.map(r => r.id)
  }
}

const toggleSelection = (id: string) => {
  const index = selectedRegistrations.value.indexOf(id)
  if (index === -1) {
    selectedRegistrations.value.push(id)
  } else {
    selectedRegistrations.value.splice(index, 1)
  }
}

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Modals
const openAddModal = () => {
  newRegistration.value = {
    event_id: selectedEventId.value || '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    organization: '',
    status: 'registered'
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const openEditModal = (registration: EventRegistration) => {
  editingRegistration.value = { ...registration }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingRegistration.value = null
}

const openDeleteModal = (registration: EventRegistration) => {
  deletingRegistration.value = registration
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingRegistration.value = null
}

const openAttendanceModal = () => {
  showAttendanceModal.value = true
}

const closeAttendanceModal = () => {
  showAttendanceModal.value = false
}

// Actions (mock - en prod, appeler l'API)
const addRegistration = () => {
  if (!newRegistration.value.event_id || !newRegistration.value.email) return

  console.log('Adding registration:', {
    id: generateRegistrationId(),
    ...newRegistration.value,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  closeAddModal()
}

const updateRegistration = () => {
  if (!editingRegistration.value) return

  console.log('Updating registration:', editingRegistration.value)

  closeEditModal()
}

const deleteRegistration = () => {
  if (!deletingRegistration.value) return

  console.log('Deleting registration:', deletingRegistration.value.id)

  closeDeleteModal()
}

// Bulk actions
const bulkChangeStatus = (status: RegistrationStatus) => {
  if (selectedRegistrations.value.length === 0) return

  console.log('Bulk status change:', {
    ids: selectedRegistrations.value,
    status
  })

  selectedRegistrations.value = []
}

const bulkMarkAttendance = (attended: boolean) => {
  if (selectedRegistrations.value.length === 0) return

  console.log('Bulk attendance:', {
    ids: selectedRegistrations.value,
    attended
  })

  selectedRegistrations.value = []
}

// Export
const exportRegistrations = (format: 'csv' | 'xlsx') => {
  console.log('Exporting registrations:', {
    format,
    event_id: selectedEventId.value || 'all',
    count: filteredRegistrations.value.length
  })
}

// Can mark attendance (event date has passed or is today)
const canMarkAttendance = (registration: EventRegistration) => {
  const eventDate = new Date(registration.event_start_date)
  const now = new Date()
  return eventDate <= now
}

// Get fill percentage for capacity gauge
const getFillPercentage = computed(() => {
  if (!selectedEventStats.value?.capacity) return 0
  const active = selectedEventStats.value.total - selectedEventStats.value.cancelled
  return Math.min(100, (active / selectedEventStats.value.capacity) * 100)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Inscriptions aux événements
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les inscriptions et le suivi de présence
        </p>
      </div>

      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          @click="exportRegistrations('csv')"
        >
          <font-awesome-icon icon="fa-solid fa-download" />
          Exporter
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="openAddModal"
        >
          <font-awesome-icon icon="fa-solid fa-plus" />
          Nouvelle inscription
        </button>
      </div>
    </div>

    <!-- Global Stats (when no event selected) -->
    <div v-if="!selectedEventId" class="grid gap-4 sm:grid-cols-4">
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon icon="fa-solid fa-users" class="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total inscriptions</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ globalStats.total }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Confirmés</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ globalStats.confirmed }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon icon="fa-solid fa-user-check" class="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Présents</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ globalStats.attended }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <font-awesome-icon icon="fa-solid fa-ban" class="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Annulés</p>
            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ globalStats.cancelled }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Stats (when event selected) -->
    <div v-if="selectedEvent && selectedEventStats" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div class="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ selectedEvent.title }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            <font-awesome-icon icon="fa-solid fa-calendar" class="mr-1" />
            {{ formatDateTime(selectedEvent.start_date) }}
            <span v-if="selectedEvent.venue" class="ml-3">
              <font-awesome-icon icon="fa-solid fa-location-dot" class="mr-1" />
              {{ selectedEvent.venue }}, {{ selectedEvent.city }}
            </span>
          </p>
        </div>

        <!-- Capacity gauge -->
        <div v-if="selectedEventStats.capacity" class="w-full lg:w-64">
          <div class="mb-1 flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Remplissage</span>
            <span class="font-medium text-gray-900 dark:text-white">
              {{ selectedEventStats.total - selectedEventStats.cancelled }} / {{ selectedEventStats.capacity }}
            </span>
          </div>
          <div class="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-full rounded-full transition-all"
              :class="getFillPercentage >= 90 ? 'bg-red-500' : getFillPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'"
              :style="{ width: `${getFillPercentage}%` }"
            />
          </div>
          <p v-if="selectedEventStats.available_spots !== undefined" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {{ selectedEventStats.available_spots }} place{{ selectedEventStats.available_spots > 1 ? 's' : '' }} disponible{{ selectedEventStats.available_spots > 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Event stats -->
      <div class="grid gap-4 sm:grid-cols-4">
        <div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p class="text-sm text-blue-600 dark:text-blue-400">Inscrits</p>
          <p class="text-2xl font-bold text-blue-800 dark:text-blue-300">{{ selectedEventStats.registered }}</p>
        </div>
        <div class="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <p class="text-sm text-green-600 dark:text-green-400">Confirmés</p>
          <p class="text-2xl font-bold text-green-800 dark:text-green-300">{{ selectedEventStats.confirmed }}</p>
        </div>
        <div class="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
          <p class="text-sm text-purple-600 dark:text-purple-400">Présents</p>
          <p class="text-2xl font-bold text-purple-800 dark:text-purple-300">{{ selectedEventStats.attended }}</p>
        </div>
        <div class="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p class="text-sm text-red-600 dark:text-red-400">Annulés</p>
          <p class="text-2xl font-bold text-red-800 dark:text-red-300">{{ selectedEventStats.cancelled }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <!-- Event select -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Événement
          </label>
          <select
            v-model="selectedEventId"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les événements</option>
            <option v-for="event in eventsForFilter" :key="event.id" :value="event.id">
              {{ event.title }}
            </option>
          </select>
        </div>

        <!-- Status select -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut
          </label>
          <select
            v-model="selectedStatus"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="registered">Inscrit</option>
            <option value="confirmed">Confirmé</option>
            <option value="cancelled">Annulé</option>
            <option value="attended">Présent</option>
          </select>
        </div>

        <!-- Date from -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date début
          </label>
          <input
            v-model="dateFrom"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Date to -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date fin
          </label>
          <input
            v-model="dateTo"
            type="date"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Search -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recherche
          </label>
          <div class="relative">
            <font-awesome-icon icon="fa-solid fa-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Nom, email, organisation..."
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <!-- Reset filters -->
      <div class="mt-4 flex items-center justify-between">
        <button
          class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          @click="resetFilters"
        >
          <font-awesome-icon icon="fa-solid fa-rotate-left" class="mr-1" />
          Réinitialiser les filtres
        </button>

        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredRegistrations.length }} inscription{{ filteredRegistrations.length > 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- Bulk actions -->
    <div v-if="selectedRegistrations.length > 0" class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
      <div class="flex flex-wrap items-center gap-4">
        <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
          {{ selectedRegistrations.length }} sélectionné{{ selectedRegistrations.length > 1 ? 's' : '' }}
        </span>

        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            @click="bulkChangeStatus('confirmed')"
          >
            <font-awesome-icon icon="fa-solid fa-check" />
            Confirmer
          </button>
          <button
            class="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
            @click="bulkMarkAttendance(true)"
          >
            <font-awesome-icon icon="fa-solid fa-user-check" />
            Marquer présent
          </button>
          <button
            class="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            @click="bulkChangeStatus('cancelled')"
          >
            <font-awesome-icon icon="fa-solid fa-ban" />
            Annuler
          </button>
        </div>

        <button
          class="ml-auto text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          @click="selectedRegistrations = []"
        >
          Désélectionner tout
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="admin-scrollbar overflow-x-auto" data-lenis-prevent>
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Participant
              </th>
              <th v-if="!selectedEventId" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Événement
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Organisation
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Date inscription
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            <tr
              v-for="registration in paginatedRegistrations"
              :key="registration.id"
              class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  :checked="selectedRegistrations.includes(registration.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  @change="toggleSelection(registration.id)"
                />
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ registration.first_name }} {{ registration.last_name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ registration.email }}
                  </p>
                  <p v-if="registration.phone" class="text-xs text-gray-400 dark:text-gray-500">
                    {{ registration.phone }}
                  </p>
                </div>
              </td>
              <td v-if="!selectedEventId" class="px-6 py-4">
                <p class="max-w-xs truncate text-sm text-gray-900 dark:text-white" :title="registration.event_title">
                  {{ registration.event_title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(registration.event_start_date) }}
                </p>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ registration.organization || '-' }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                  :class="registrationStatusColors[registration.status]"
                >
                  {{ registrationStatusLabels[registration.status] }}
                </span>
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(registration.created_at) }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="canMarkAttendance(registration) && registration.status !== 'attended' && registration.status !== 'cancelled'"
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-400"
                    title="Marquer présent"
                    @click="bulkMarkAttendance(true); selectedRegistrations = [registration.id]"
                  >
                    <font-awesome-icon icon="fa-solid fa-user-check" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                    title="Modifier"
                    @click="openEditModal(registration)"
                  >
                    <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
                  </button>
                  <button
                    class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400"
                    title="Supprimer"
                    @click="openDeleteModal(registration)"
                  >
                    <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty state -->
            <tr v-if="paginatedRegistrations.length === 0">
              <td :colspan="selectedEventId ? 6 : 7" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center">
                  <div class="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                    <font-awesome-icon icon="fa-solid fa-users" class="text-3xl text-gray-400" />
                  </div>
                  <h3 class="mb-2 font-medium text-gray-900 dark:text-white">
                    Aucune inscription trouvée
                  </h3>
                  <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {{ searchQuery || selectedStatus || selectedEventId ? 'Essayez avec d\'autres filtres' : 'Ajoutez une première inscription' }}
                  </p>
                  <button
                    v-if="!searchQuery && !selectedStatus"
                    class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    @click="openAddModal"
                  >
                    <font-awesome-icon icon="fa-solid fa-plus" />
                    Nouvelle inscription
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Page {{ currentPage }} sur {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
            @click="currentPage--"
          >
            Précédent
          </button>
          <button
            :disabled="currentPage === totalPages"
            class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
            @click="currentPage++"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeAddModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Nouvelle inscription
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeAddModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="addRegistration">
            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Événement *
              </label>
              <select
                v-model="newRegistration.event_id"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionner un événement</option>
                <option v-for="event in eventsForFilter" :key="event.id" :value="event.id">
                  {{ event.title }}
                </option>
              </select>
            </div>

            <div class="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prénom *
                </label>
                <input
                  v-model="newRegistration.first_name"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom *
                </label>
                <input
                  v-model="newRegistration.last_name"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email *
              </label>
              <input
                v-model="newRegistration.email"
                type="email"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Téléphone
                </label>
                <input
                  v-model="newRegistration.phone"
                  type="tel"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Organisation
                </label>
                <input
                  v-model="newRegistration.organization"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut initial
              </label>
              <select
                v-model="newRegistration.status"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="registered">Inscrit</option>
                <option value="confirmed">Confirmé</option>
              </select>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeAddModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Inscrire
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && editingRegistration"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeEditModal"
      >
        <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier l'inscription
            </h3>
            <button
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              @click="closeEditModal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <form @submit.prevent="updateRegistration">
            <div class="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prénom
                </label>
                <input
                  v-model="editingRegistration.first_name"
                  type="text"
                  :disabled="!!editingRegistration.user_external_id"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-600"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom
                </label>
                <input
                  v-model="editingRegistration.last_name"
                  type="text"
                  :disabled="!!editingRegistration.user_external_id"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-600"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                v-model="editingRegistration.email"
                type="email"
                :disabled="!!editingRegistration.user_external_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-600"
              />
            </div>

            <div v-if="editingRegistration.user_external_id" class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-900/20">
              <div class="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                <font-awesome-icon icon="fa-solid fa-info-circle" />
                <span>Utilisateur inscrit via son compte - les informations personnelles ne sont pas modifiables</span>
              </div>
            </div>

            <div class="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Téléphone
                </label>
                <input
                  v-model="editingRegistration.phone"
                  type="tel"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Organisation
                </label>
                <input
                  v-model="editingRegistration.organization"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div class="mb-6">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut
              </label>
              <select
                v-model="editingRegistration.status"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="registered">Inscrit</option>
                <option value="confirmed">Confirmé</option>
                <option value="cancelled">Annulé</option>
                <option v-if="canMarkAttendance(editingRegistration)" value="attended">Présent</option>
              </select>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeEditModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Supprimer -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingRegistration"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Supprimer l'inscription
            </h3>
          </div>

          <p class="mb-4 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer l'inscription de <strong>{{ deletingRegistration.first_name }} {{ deletingRegistration.last_name }}</strong> ?
          </p>

          <div class="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              <strong>Événement :</strong> {{ deletingRegistration.event_title }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              <strong>Email :</strong> {{ deletingRegistration.email }}
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              @click="deleteRegistration"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
