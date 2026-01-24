<script setup lang="ts">
import type { Country, CountryFilters } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const {
  getAllCountriesRef,
  getActiveCountriesRef,
  getCountryByIdRef,
  getCountryByIsoCodeRef,
  isIsoCodeTaken,
  isIsoCode3Taken,
  getCountryStats,
  getCountryFlagEmoji,
  formatPhoneCodeDisplay,
  validatePhoneCodeFormat,
  validateIsoCode,
  validateIsoCode3,
  generateCountryId
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const searchQuery = ref('')
const activeFilter = ref<'all' | 'active' | 'inactive'>('all')
const sortBy = ref<CountryFilters['sort_by']>('name_fr')
const sortOrder = ref<CountryFilters['sort_order']>('asc')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Modals
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const selectedCountry = ref<Country | null>(null)
const countryToDelete = ref<Country | null>(null)

// Formulaire
const formData = ref({
  iso_code: '',
  iso_code3: '',
  name_fr: '',
  name_en: '',
  name_ar: '',
  phone_code: '',
  active: true
})
const formErrors = ref<Record<string, string>>({})

// === COMPUTED ===

// Statistiques globales
const stats = computed(() => getCountryStats())

// Filtres appliqués
const filters = computed<CountryFilters>(() => ({
  search: searchQuery.value || undefined,
  active: activeFilter.value === 'all' ? undefined : activeFilter.value === 'active',
  sort_by: sortBy.value,
  sort_order: sortOrder.value
}))

// Liste filtrée
const filteredCountries = computed(() => getAllCountriesRef(filters.value))

// Pagination
const totalPages = computed(() => Math.ceil(filteredCountries.value.length / itemsPerPage.value))
const paginatedCountries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCountries.value.slice(start, end)
})

// === METHODS ===

// Initialisation
onMounted(() => {
  isLoading.value = false
})

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  activeFilter.value = 'all'
  currentPage.value = 1
}

// Trier par colonne
const toggleSort = (column: CountryFilters['sort_by']) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Réinitialiser le formulaire
const resetForm = () => {
  formData.value = {
    iso_code: '',
    iso_code3: '',
    name_fr: '',
    name_en: '',
    name_ar: '',
    phone_code: '',
    active: true
  }
  formErrors.value = {}
}

// Valider le formulaire
const validateForm = (isEdit = false): boolean => {
  formErrors.value = {}

  // Code ISO 2
  if (!formData.value.iso_code.trim()) {
    formErrors.value.iso_code = 'Le code ISO 2 est requis'
  } else if (!validateIsoCode(formData.value.iso_code)) {
    formErrors.value.iso_code = 'Le code ISO doit contenir exactement 2 lettres majuscules'
  } else if (!isEdit && isIsoCodeTaken(formData.value.iso_code)) {
    formErrors.value.iso_code = 'Ce code ISO est déjà utilisé'
  }

  // Code ISO 3 (optionnel mais si fourni, doit être valide)
  if (formData.value.iso_code3.trim()) {
    if (!validateIsoCode3(formData.value.iso_code3)) {
      formErrors.value.iso_code3 = 'Le code ISO 3 doit contenir exactement 3 lettres majuscules'
    } else if (isIsoCode3Taken(formData.value.iso_code3, selectedCountry.value?.id)) {
      formErrors.value.iso_code3 = 'Ce code ISO 3 est déjà utilisé'
    }
  }

  // Nom français
  if (!formData.value.name_fr.trim()) {
    formErrors.value.name_fr = 'Le nom français est requis'
  } else if (formData.value.name_fr.length < 2) {
    formErrors.value.name_fr = 'Le nom doit contenir au moins 2 caractères'
  }

  // Indicatif téléphonique (optionnel)
  if (formData.value.phone_code.trim()) {
    if (!validatePhoneCodeFormat(formData.value.phone_code)) {
      formErrors.value.phone_code = 'Format invalide (ex: +33 ou 33)'
    }
  }

  return Object.keys(formErrors.value).length === 0
}

// Ouvrir modal d'ajout
const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

// Ouvrir modal d'édition
const openEditModal = (country: Country) => {
  selectedCountry.value = country
  formData.value = {
    iso_code: country.iso_code,
    iso_code3: country.iso_code3 || '',
    name_fr: country.name_fr,
    name_en: country.name_en || '',
    name_ar: country.name_ar || '',
    phone_code: country.phone_code || '',
    active: country.active
  }
  formErrors.value = {}
  showEditModal.value = true
}

// Ouvrir modal de suppression
const openDeleteModal = (country: Country) => {
  countryToDelete.value = country
  showDeleteModal.value = true
}

// Enregistrer (ajout)
const handleAdd = () => {
  if (!validateForm()) return

  // Simulation de l'ajout
  const newCountry: Country = {
    id: generateCountryId(),
    iso_code: formData.value.iso_code.toUpperCase(),
    iso_code3: formData.value.iso_code3.toUpperCase() || null,
    name_fr: formData.value.name_fr,
    name_en: formData.value.name_en || null,
    name_ar: formData.value.name_ar || null,
    phone_code: formData.value.phone_code ? (formData.value.phone_code.startsWith('+') ? formData.value.phone_code : `+${formData.value.phone_code}`) : null,
    active: formData.value.active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  console.log('Ajout du pays:', newCountry)

  showAddModal.value = false
  resetForm()
}

// Enregistrer (modification)
const handleEdit = () => {
  if (!validateForm(true) || !selectedCountry.value) return

  // Simulation de la modification
  console.log('Modification du pays:', {
    id: selectedCountry.value.id,
    iso_code: selectedCountry.value.iso_code, // Non modifiable
    iso_code3: formData.value.iso_code3.toUpperCase() || null,
    name_fr: formData.value.name_fr,
    name_en: formData.value.name_en || null,
    name_ar: formData.value.name_ar || null,
    phone_code: formData.value.phone_code ? (formData.value.phone_code.startsWith('+') ? formData.value.phone_code : `+${formData.value.phone_code}`) : null,
    active: formData.value.active,
    updated_at: new Date().toISOString()
  })

  showEditModal.value = false
  selectedCountry.value = null
  resetForm()
}

// Supprimer
const handleDelete = () => {
  if (!countryToDelete.value) return

  // Simulation de la suppression
  console.log('Suppression du pays:', countryToDelete.value.id)

  showDeleteModal.value = false
  countryToDelete.value = null
}

// Toggle actif/inactif
const toggleActive = (country: Country) => {
  console.log('Toggle actif/inactif:', country.id, !country.active)
}

// Fermer les modales
const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedCountry.value = null
  countryToDelete.value = null
  resetForm()
}

// Watcher pour reset de la page lors des filtres
watch([searchQuery, activeFilter], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Pays
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez la liste des pays pour les formulaires et sélecteurs
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un pays
      </button>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <font-awesome-icon :icon="['fas', 'globe']" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.total }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pays au total
            </p>
          </div>
        </div>
      </div>

      <!-- Actifs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.active }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pays actifs
            </p>
          </div>
        </div>
      </div>

      <!-- Inactifs -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <font-awesome-icon :icon="['fas', 'pause-circle']" class="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.inactive }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pays inactifs
            </p>
          </div>
        </div>
      </div>

      <!-- Avec indicatif -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <font-awesome-icon :icon="['fas', 'phone']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.with_phone_code }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Avec indicatif
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-4">
        <!-- Recherche -->
        <div class="relative flex-1">
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher par nom ou code ISO..."
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
        </div>

        <!-- Filtre statut -->
        <div class="w-full lg:w-48">
          <select
            v-model="activeFilter"
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Inactifs uniquement</option>
          </select>
        </div>

        <!-- Reset -->
        <button
          v-if="searchQuery || activeFilter !== 'all'"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          @click="resetFilters"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Liste des pays -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-primary-600" />
    </div>

    <div v-else-if="filteredCountries.length === 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <font-awesome-icon :icon="['fas', 'globe']" class="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Aucun pays trouvé
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        {{ searchQuery || activeFilter !== 'all' ? 'Aucun résultat ne correspond à vos critères.' : 'Commencez par ajouter votre premier pays.' }}
      </p>
      <button
        v-if="!searchQuery && activeFilter === 'all'"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        @click="openAddModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter un pays
      </button>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Tableau -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Drapeau
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                @click="toggleSort('iso_code')"
              >
                <div class="flex items-center gap-2">
                  Code ISO
                  <font-awesome-icon
                    v-if="sortBy === 'iso_code'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                @click="toggleSort('name_fr')"
              >
                <div class="flex items-center gap-2">
                  Nom (FR)
                  <font-awesome-icon
                    v-if="sortBy === 'name_fr'"
                    :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    class="h-3 w-3"
                  />
                </div>
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nom (EN)
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nom (AR)
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Indicatif
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="country in paginatedCountries"
              :key="country.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <!-- Drapeau -->
              <td class="px-4 py-3">
                <span class="text-2xl">{{ getCountryFlagEmoji(country.iso_code) }}</span>
              </td>

              <!-- Code ISO -->
              <td class="px-4 py-3">
                <div class="flex flex-col">
                  <code class="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {{ country.iso_code }}
                  </code>
                  <span v-if="country.iso_code3" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ country.iso_code3 }}
                  </span>
                </div>
              </td>

              <!-- Nom FR -->
              <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                {{ country.name_fr }}
              </td>

              <!-- Nom EN -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ country.name_en || '-' }}
              </td>

              <!-- Nom AR -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" dir="rtl">
                {{ country.name_ar || '-' }}
              </td>

              <!-- Indicatif -->
              <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {{ formatPhoneCodeDisplay(country.phone_code) }}
              </td>

              <!-- Statut -->
              <td class="px-4 py-3">
                <button
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                  :class="country.active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'"
                  :title="country.active ? 'Cliquer pour désactiver' : 'Cliquer pour activer'"
                  @click="toggleActive(country)"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="country.active ? 'bg-green-500' : 'bg-gray-400'" />
                  {{ country.active ? 'Actif' : 'Inactif' }}
                </button>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-2">
                  <!-- Modifier -->
                  <button
                    class="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Modifier"
                    @click="openEditModal(country)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="h-4 w-4" />
                  </button>

                  <!-- Supprimer -->
                  <button
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Supprimer"
                    @click="openDeleteModal(country)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer avec pagination -->
      <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredCountries.length }} pays
          <span v-if="filteredCountries.length !== stats.total">(sur {{ stats.total }})</span>
        </p>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center gap-2">
          <button
            class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" class="h-4 w-4" />
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-300">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>
          <button
            class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Ajouter -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter un pays
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="handleAdd">
            <!-- Codes ISO -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code ISO 2 *
                </label>
                <input
                  v-model="formData.iso_code"
                  type="text"
                  maxlength="2"
                  placeholder="FR"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  :class="{ 'border-red-500': formErrors.iso_code }"
                >
                <p v-if="formErrors.iso_code" class="mt-1 text-sm text-red-500">{{ formErrors.iso_code }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code ISO 3
                </label>
                <input
                  v-model="formData.iso_code3"
                  type="text"
                  maxlength="3"
                  placeholder="FRA"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  :class="{ 'border-red-500': formErrors.iso_code3 }"
                >
                <p v-if="formErrors.iso_code3" class="mt-1 text-sm text-red-500">{{ formErrors.iso_code3 }}</p>
              </div>
            </div>

            <!-- Nom français -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom français *
              </label>
              <input
                v-model="formData.name_fr"
                type="text"
                placeholder="France"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.name_fr }"
              >
              <p v-if="formErrors.name_fr" class="mt-1 text-sm text-red-500">{{ formErrors.name_fr }}</p>
            </div>

            <!-- Nom anglais -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom anglais
              </label>
              <input
                v-model="formData.name_en"
                type="text"
                placeholder="France"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
            </div>

            <!-- Nom arabe -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom arabe
              </label>
              <input
                v-model="formData.name_ar"
                type="text"
                dir="rtl"
                placeholder="فرنسا"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
            </div>

            <!-- Indicatif téléphonique -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Indicatif téléphonique
              </label>
              <input
                v-model="formData.phone_code"
                type="text"
                placeholder="+33"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.phone_code }"
              >
              <p v-if="formErrors.phone_code" class="mt-1 text-sm text-red-500">{{ formErrors.phone_code }}</p>
            </div>

            <!-- Actif -->
            <div class="flex items-center gap-3">
              <input
                id="active-add"
                v-model="formData.active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
              <label for="active-add" class="text-sm text-gray-700 dark:text-gray-300">
                Pays actif (visible dans les sélecteurs)
              </label>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Modifier -->
    <Teleport to="body">
      <div
        v-if="showEditModal && selectedCountry"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ getCountryFlagEmoji(selectedCountry.iso_code) }}</span>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Modifier {{ selectedCountry.name_fr }}
              </h3>
            </div>
            <button
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              @click="closeModals"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>

          <form class="p-6 space-y-4" @submit.prevent="handleEdit">
            <!-- Codes ISO -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code ISO 2
                </label>
                <input
                  :value="formData.iso_code"
                  type="text"
                  disabled
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 py-2 px-3 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed uppercase"
                >
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Le code ISO 2 ne peut pas être modifié</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code ISO 3
                </label>
                <input
                  v-model="formData.iso_code3"
                  type="text"
                  maxlength="3"
                  placeholder="FRA"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 uppercase focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  :class="{ 'border-red-500': formErrors.iso_code3 }"
                >
                <p v-if="formErrors.iso_code3" class="mt-1 text-sm text-red-500">{{ formErrors.iso_code3 }}</p>
              </div>
            </div>

            <!-- Nom français -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom français *
              </label>
              <input
                v-model="formData.name_fr"
                type="text"
                placeholder="France"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.name_fr }"
              >
              <p v-if="formErrors.name_fr" class="mt-1 text-sm text-red-500">{{ formErrors.name_fr }}</p>
            </div>

            <!-- Nom anglais -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom anglais
              </label>
              <input
                v-model="formData.name_en"
                type="text"
                placeholder="France"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
            </div>

            <!-- Nom arabe -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom arabe
              </label>
              <input
                v-model="formData.name_ar"
                type="text"
                dir="rtl"
                placeholder="فرنسا"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
            </div>

            <!-- Indicatif téléphonique -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Indicatif téléphonique
              </label>
              <input
                v-model="formData.phone_code"
                type="text"
                placeholder="+33"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                :class="{ 'border-red-500': formErrors.phone_code }"
              >
              <p v-if="formErrors.phone_code" class="mt-1 text-sm text-red-500">{{ formErrors.phone_code }}</p>
            </div>

            <!-- Actif -->
            <div class="flex items-center gap-3">
              <input
                id="active-edit"
                v-model="formData.active"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              >
              <label for="active-edit" class="text-sm text-gray-700 dark:text-gray-300">
                Pays actif (visible dans les sélecteurs)
              </label>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
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
        v-if="showDeleteModal && countryToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModals"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 text-center">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer ce pays ?
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Vous êtes sur le point de supprimer
              <span class="font-medium text-gray-900 dark:text-white">
                {{ getCountryFlagEmoji(countryToDelete.iso_code) }} {{ countryToDelete.name_fr }}
              </span>.
              Cette action est irréversible.
            </p>
            <div class="flex justify-center gap-3">
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="closeModals"
              >
                Annuler
              </button>
              <button
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                @click="handleDelete"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
