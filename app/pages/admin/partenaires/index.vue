<script setup lang="ts">
import type { PartnerAdmin, PartnerFilters, PartnerAssociations, PartnerTypeSql, CountryOption } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllPartnersAdmin,
  getPartnerByIdAdmin,
  getFilteredPartnersAdmin,
  getPartnerStatsAdmin,
  getPartnerAssociations,
  getCountriesForSelect,
  getPartnerTypesForSelect,
  partnerTypeLabels,
  partnerTypeColors,
  generatePartnerId
} = useMockData()

// === STATE ===
const searchQuery = ref('')
const filterType = ref<PartnerTypeSql | ''>('')
const filterCountry = ref('')
const filterActive = ref<boolean | undefined>(undefined)
const sortBy = ref<'name' | 'display_order' | 'type' | 'country'>('display_order')
const sortOrder = ref<'asc' | 'desc'>('asc')
const viewMode = ref<'table' | 'cards'>('table')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAssociationsModal = ref(false)
const editingPartner = ref<PartnerAdmin | null>(null)
const deletingPartner = ref<PartnerAdmin | null>(null)
const viewingPartner = ref<PartnerAdmin | null>(null)
const partnerAssociations = ref<PartnerAssociations | null>(null)

// Form state
const newPartner = ref({
  name: '',
  description: '',
  type: 'campus_partner' as PartnerTypeSql,
  logo_url: '',
  country_external_id: '',
  website: '',
  email: '',
  phone: '',
  display_order: 0,
  active: true
})

// === COMPUTED ===
const allPartners = computed(() => getAllPartnersAdmin())

const stats = computed(() => getPartnerStatsAdmin())

const countries = computed(() => getCountriesForSelect())

const partnerTypes = computed(() => getPartnerTypesForSelect())

// Partenaires filtrés
const filteredPartners = computed(() => {
  const filters: PartnerFilters = {
    search: searchQuery.value || undefined,
    type: filterType.value || undefined,
    country_id: filterCountry.value || undefined,
    active: filterActive.value,
    sort_by: sortBy.value,
    sort_order: sortOrder.value
  }
  return getFilteredPartnersAdmin(filters)
})

// === METHODS ===
const toggleSort = (field: 'name' | 'display_order' | 'type' | 'country') => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (field: 'name' | 'display_order' | 'type' | 'country') => {
  if (sortBy.value !== field) return 'sort'
  return sortOrder.value === 'asc' ? 'sort-up' : 'sort-down'
}

const getTypeBadgeClass = (type: PartnerTypeSql) => {
  return partnerTypeColors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
}

// Modals
const openAddModal = () => {
  const maxOrder = Math.max(0, ...allPartners.value.map(p => p.display_order))
  newPartner.value = {
    name: '',
    description: '',
    type: 'campus_partner',
    logo_url: '',
    country_external_id: '',
    website: '',
    email: '',
    phone: '',
    display_order: maxOrder + 1,
    active: true
  }
  showAddModal.value = true
}

const openEditModal = (partner: PartnerAdmin) => {
  editingPartner.value = partner
  newPartner.value = {
    name: partner.name,
    description: partner.description || '',
    type: partner.type,
    logo_url: partner.logo_url || '',
    country_external_id: partner.country_external_id || '',
    website: partner.website || '',
    email: partner.email || '',
    phone: partner.phone || '',
    display_order: partner.display_order,
    active: partner.active
  }
  showEditModal.value = true
}

const openDeleteModal = async (partner: PartnerAdmin) => {
  deletingPartner.value = partner
  partnerAssociations.value = getPartnerAssociations(partner.id)
  showDeleteModal.value = true
}

const openAssociationsModal = (partner: PartnerAdmin) => {
  viewingPartner.value = partner
  partnerAssociations.value = getPartnerAssociations(partner.id)
  showAssociationsModal.value = true
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  showAssociationsModal.value = false
  editingPartner.value = null
  deletingPartner.value = null
  viewingPartner.value = null
  partnerAssociations.value = null
}

const handleAddPartner = () => {
  console.log('Création partenaire:', { id: generatePartnerId(), ...newPartner.value })
  closeModals()
}

const handleEditPartner = () => {
  console.log('Modification partenaire:', { id: editingPartner.value?.id, ...newPartner.value })
  closeModals()
}

const handleDeletePartner = () => {
  console.log('Suppression partenaire:', deletingPartner.value?.id)
  closeModals()
}

const handleToggleActive = (partner: PartnerAdmin) => {
  console.log('Toggle actif:', partner.id, !partner.active)
}

const clearFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterCountry.value = ''
  filterActive.value = undefined
}

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterType.value || filterCountry.value || filterActive.value !== undefined
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Partenaires
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gestion des partenaires institutionnels, académiques et de projets
        </p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un partenaire
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'handshake']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Actifs</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'scroll']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.byType.find(t => t.type === 'charter_operator')?.count || 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Charte</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'building-columns']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.byType.find(t => t.type === 'campus_partner')?.count || 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Campus</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'graduation-cap']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.byType.find(t => t.type === 'program_partner')?.count || 0 }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Académiques</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <font-awesome-icon :icon="['fas', 'link']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalAssociations }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Associations</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un partenaire..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Type filter -->
        <div class="w-full lg:w-48">
          <select
            v-model="filterType"
            class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les types</option>
            <option v-for="pt in partnerTypes" :key="pt.value" :value="pt.value">
              {{ pt.label }}
            </option>
          </select>
        </div>

        <!-- Country filter -->
        <div class="w-full lg:w-48">
          <select
            v-model="filterCountry"
            class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les pays</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.flag }} {{ country.name }}
            </option>
          </select>
        </div>

        <!-- Status filter -->
        <div class="w-full lg:w-40">
          <select
            v-model="filterActive"
            class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option :value="undefined">Tous</option>
            <option :value="true">Actifs</option>
            <option :value="false">Inactifs</option>
          </select>
        </div>

        <!-- View mode toggle -->
        <div class="flex items-center gap-2 border-l border-gray-200 dark:border-gray-600 pl-4">
          <button
            @click="viewMode = 'table'"
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'table'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            ]"
            title="Vue tableau"
          >
            <font-awesome-icon :icon="['fas', 'table-list']" class="h-5 w-5" />
          </button>
          <button
            @click="viewMode = 'cards'"
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'cards'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            ]"
            title="Vue cartes"
          >
            <font-awesome-icon :icon="['fas', 'grip']" class="h-5 w-5" />
          </button>
        </div>

        <!-- Clear filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
          Effacer
        </button>
      </div>
    </div>

    <!-- Results count -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ filteredPartners.length }} partenaire{{ filteredPartners.length > 1 ? 's' : '' }} trouvé{{ filteredPartners.length > 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Table View -->
    <div v-if="viewMode === 'table'" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Logo
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-2">
                  Nom
                  <font-awesome-icon :icon="['fas', getSortIcon('name')]" class="h-3 w-3" />
                </div>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                @click="toggleSort('type')"
              >
                <div class="flex items-center gap-2">
                  Type
                  <font-awesome-icon :icon="['fas', getSortIcon('type')]" class="h-3 w-3" />
                </div>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-100"
                @click="toggleSort('country')"
              >
                <div class="flex items-center gap-2">
                  Pays
                  <font-awesome-icon :icon="['fas', getSortIcon('country')]" class="h-3 w-3" />
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Associations
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="partner in filteredPartners" :key="partner.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex-shrink-0 h-12 w-12">
                  <img
                    v-if="partner.logo_url"
                    :src="partner.logo_url"
                    :alt="partner.name"
                    class="h-12 w-12 rounded-lg object-contain bg-gray-100 dark:bg-gray-700 p-1"
                  />
                  <div
                    v-else
                    class="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'building']" class="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ partner.name }}
                  </span>
                  <a
                    v-if="partner.website"
                    :href="partner.website"
                    target="_blank"
                    class="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 truncate max-w-[200px]"
                  >
                    {{ partner.website }}
                  </a>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getTypeBadgeClass(partner.type)
                  ]"
                >
                  {{ partnerTypeLabels[partner.type] }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="partner.country" class="text-sm text-gray-900 dark:text-white">
                  {{ partner.country.flag }} {{ partner.country.name }}
                </span>
                <span v-else class="text-sm text-gray-400 dark:text-gray-500">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <span
                    v-if="partner.campuses_count > 0"
                    class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                    title="Campus"
                  >
                    <font-awesome-icon :icon="['fas', 'building-columns']" class="h-3 w-3" />
                    {{ partner.campuses_count }}
                  </span>
                  <span
                    v-if="partner.projects_count > 0"
                    class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                    title="Projets"
                  >
                    <font-awesome-icon :icon="['fas', 'diagram-project']" class="h-3 w-3" />
                    {{ partner.projects_count }}
                  </span>
                  <span
                    v-if="partner.events_count > 0"
                    class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                    title="Événements"
                  >
                    <font-awesome-icon :icon="['fas', 'calendar']" class="h-3 w-3" />
                    {{ partner.events_count }}
                  </span>
                  <button
                    v-if="partner.campuses_count + partner.projects_count + partner.events_count > 0"
                    @click="openAssociationsModal(partner)"
                    class="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Voir
                  </button>
                  <span
                    v-if="partner.campuses_count + partner.projects_count + partner.events_count === 0"
                    class="text-xs text-gray-400 dark:text-gray-500"
                  >
                    Aucune
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="handleToggleActive(partner)"
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                    partner.active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                  ]"
                >
                  <font-awesome-icon :icon="['fas', partner.active ? 'check-circle' : 'times-circle']" class="h-3 w-3" />
                  {{ partner.active ? 'Actif' : 'Inactif' }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(partner)"
                    class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Modifier"
                  >
                    <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
                  </button>
                  <button
                    @click="openDeleteModal(partner)"
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
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
      <div v-if="filteredPartners.length === 0" class="text-center py-12">
        <font-awesome-icon :icon="['fas', 'handshake']" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Aucun partenaire trouvé</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos filtres ou ajoutez un nouveau partenaire.
        </p>
      </div>
    </div>

    <!-- Cards View -->
    <div v-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="partner in filteredPartners"
        :key="partner.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Card Header with Logo -->
        <div class="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-4">
          <img
            v-if="partner.logo_url"
            :src="partner.logo_url"
            :alt="partner.name"
            class="max-h-full max-w-full object-contain"
          />
          <font-awesome-icon
            v-else
            :icon="['fas', 'building']"
            class="h-16 w-16 text-gray-300 dark:text-gray-600"
          />
        </div>

        <!-- Card Body -->
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
              {{ partner.name }}
            </h3>
            <button
              @click="handleToggleActive(partner)"
              :class="[
                'flex-shrink-0 w-3 h-3 rounded-full',
                partner.active ? 'bg-green-500' : 'bg-gray-400'
              ]"
              :title="partner.active ? 'Actif' : 'Inactif'"
            />
          </div>

          <span
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-2',
              getTypeBadgeClass(partner.type)
            ]"
          >
            {{ partnerTypeLabels[partner.type] }}
          </span>

          <div class="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <p v-if="partner.country" class="flex items-center gap-1">
              <span>{{ partner.country.flag }}</span>
              {{ partner.country.name }}
            </p>
            <a
              v-if="partner.website"
              :href="partner.website"
              target="_blank"
              class="flex items-center gap-1 text-primary-600 hover:text-primary-500 dark:text-primary-400 truncate"
            >
              <font-awesome-icon :icon="['fas', 'globe']" class="h-3 w-3" />
              Site web
            </a>
          </div>

          <!-- Associations -->
          <div v-if="partner.campuses_count + partner.projects_count + partner.events_count > 0" class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span v-if="partner.campuses_count > 0" class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'building-columns']" class="h-3 w-3" />
                {{ partner.campuses_count }}
              </span>
              <span v-if="partner.projects_count > 0" class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'diagram-project']" class="h-3 w-3" />
                {{ partner.projects_count }}
              </span>
              <span v-if="partner.events_count > 0" class="flex items-center gap-1">
                <font-awesome-icon :icon="['fas', 'calendar']" class="h-3 w-3" />
                {{ partner.events_count }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end gap-2">
          <button
            @click="openEditModal(partner)"
            class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Modifier"
          >
            <font-awesome-icon :icon="['fas', 'pen']" class="h-4 w-4" />
          </button>
          <button
            @click="openDeleteModal(partner)"
            class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Supprimer"
          >
            <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredPartners.length === 0" class="col-span-full text-center py-12">
        <font-awesome-icon :icon="['fas', 'handshake']" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Aucun partenaire trouvé</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Essayez de modifier vos filtres ou ajoutez un nouveau partenaire.
        </p>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showAddModal || showEditModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModals"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="closeModals" />

          <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ showEditModal ? 'Modifier le partenaire' : 'Ajouter un partenaire' }}
              </h3>
              <button
                @click="closeModals"
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="showEditModal ? handleEditPartner() : handleAddPartner()" class="p-6 space-y-4">
              <!-- Nom -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom *
                </label>
                <input
                  v-model="newPartner.name"
                  type="text"
                  required
                  class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Nom du partenaire"
                />
              </div>

              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  v-model="newPartner.type"
                  required
                  class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option v-for="pt in partnerTypes" :key="pt.value" :value="pt.value">
                    {{ pt.label }}
                  </option>
                </select>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  v-model="newPartner.description"
                  rows="3"
                  class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Description du partenaire"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- Logo URL -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL du logo
                  </label>
                  <input
                    v-model="newPartner.logo_url"
                    type="url"
                    class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="https://..."
                  />
                </div>

                <!-- Pays -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pays
                  </label>
                  <select
                    v-model="newPartner.country_external_id"
                    class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option v-for="country in countries" :key="country.id" :value="country.id">
                      {{ country.flag }} {{ country.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Site web -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site web
                </label>
                <input
                  v-model="newPartner.website"
                  type="url"
                  class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="https://..."
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    v-model="newPartner.email"
                    type="email"
                    class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="contact@partenaire.org"
                  />
                </div>

                <!-- Téléphone -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    v-model="newPartner.phone"
                    type="tel"
                    class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <!-- Ordre d'affichage -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ordre d'affichage
                  </label>
                  <input
                    v-model.number="newPartner.display_order"
                    type="number"
                    min="0"
                    class="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <!-- Actif -->
                <div class="flex items-center pt-6">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="newPartner.active"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actif
                    </span>
                  </label>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  @click="closeModals"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                >
                  {{ showEditModal ? 'Enregistrer' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingPartner"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModals"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="closeModals" />

          <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div class="p-6">
              <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
                <font-awesome-icon :icon="['fas', 'trash']" class="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>

              <h3 class="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                Supprimer le partenaire
              </h3>

              <p class="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                Êtes-vous sûr de vouloir supprimer
                <span class="font-medium text-gray-900 dark:text-white">{{ deletingPartner.name }}</span> ?
              </p>

              <!-- Warning if has associations -->
              <div
                v-if="partnerAssociations && !partnerAssociations.can_delete"
                class="mb-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
              >
                <div class="flex items-start gap-3">
                  <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Ce partenaire est utilisé
                    </p>
                    <p class="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      {{ partnerAssociations.total }} association(s) trouvée(s) :
                    </p>
                    <ul class="mt-2 text-xs text-amber-600 dark:text-amber-400 space-y-1">
                      <li v-if="partnerAssociations.campuses.length > 0">
                        {{ partnerAssociations.campuses.length }} campus
                      </li>
                      <li v-if="partnerAssociations.projects.length > 0">
                        {{ partnerAssociations.projects.length }} projet(s)
                      </li>
                      <li v-if="partnerAssociations.events.length > 0">
                        {{ partnerAssociations.events.length }} événement(s)
                      </li>
                    </ul>
                    <p class="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Désactivez plutôt ce partenaire pour le masquer.
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-center gap-3">
                <button
                  @click="closeModals"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  @click="handleDeletePartner"
                  :disabled="partnerAssociations && !partnerAssociations.can_delete"
                  :class="[
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    partnerAssociations && !partnerAssociations.can_delete
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      : 'text-white bg-red-600 hover:bg-red-500'
                  ]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Associations Modal -->
    <Teleport to="body">
      <div
        v-if="showAssociationsModal && viewingPartner && partnerAssociations"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeModals"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" @click="closeModals" />

          <div class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Associations
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ viewingPartner.name }}
                </p>
              </div>
              <button
                @click="closeModals"
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
              </button>
            </div>

            <div class="p-6 space-y-4 max-h-96 overflow-y-auto">
              <!-- Campus -->
              <div v-if="partnerAssociations.campuses.length > 0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'building-columns']" class="h-4 w-4 text-blue-500" />
                  Campus ({{ partnerAssociations.campuses.length }})
                </h4>
                <ul class="space-y-1">
                  <li v-for="campus in partnerAssociations.campuses" :key="campus.id" class="text-sm text-gray-600 dark:text-gray-400 pl-6">
                    {{ campus.name }}
                  </li>
                </ul>
              </div>

              <!-- Projets -->
              <div v-if="partnerAssociations.projects.length > 0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'diagram-project']" class="h-4 w-4 text-orange-500" />
                  Projets ({{ partnerAssociations.projects.length }})
                </h4>
                <ul class="space-y-1">
                  <li v-for="project in partnerAssociations.projects" :key="project.id" class="text-sm text-gray-600 dark:text-gray-400 pl-6">
                    {{ project.title }}
                  </li>
                </ul>
              </div>

              <!-- Événements -->
              <div v-if="partnerAssociations.events.length > 0">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'calendar']" class="h-4 w-4 text-green-500" />
                  Événements ({{ partnerAssociations.events.length }})
                </h4>
                <ul class="space-y-1">
                  <li v-for="event in partnerAssociations.events" :key="event.id" class="text-sm text-gray-600 dark:text-gray-400 pl-6">
                    {{ event.title }}
                  </li>
                </ul>
              </div>

              <!-- Empty state -->
              <div v-if="partnerAssociations.total === 0" class="text-center py-4">
                <font-awesome-icon :icon="['fas', 'link-slash']" class="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Aucune association trouvée
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="closeModals"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
