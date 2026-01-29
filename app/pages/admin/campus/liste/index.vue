<script setup lang="ts">
import type { CampusRead } from '~/composables/useCampusApi'
import type { CountryRead } from '~/composables/useCountriesApi'

definePageMeta({
  layout: 'admin'
})

const {
  getAllCampuses,
  toggleCampusActive,
  deleteCampus: apiDeleteCampus,
} = useCampusApi()

const {
  getAllCountriesPublic,
  getFlagEmoji,
} = useCountriesApi()

const { getMediaUrl } = useMediaApi()

// === ÉTAT ===
const loading = ref(false)
const error = ref<string | null>(null)
const campusList = ref<CampusRead[]>([])
const countries = ref<CountryRead[]>([])

// === FILTRES ===
const searchQuery = ref('')
const filterCountry = ref<string | 'all'>('all')
const filterActive = ref<'all' | 'active' | 'inactive'>('all')

// === VUE ===
const viewMode = ref<'cards' | 'table'>('cards')

// === PAGINATION ===
const currentPage = ref(1)
const itemsPerPage = ref(12)

// === CHARGEMENT DES DONNÉES ===
onMounted(async () => {
  await Promise.all([
    loadCampuses(),
    loadCountries()
  ])
})

async function loadCampuses() {
  loading.value = true
  error.value = null
  try {
    const response = await getAllCampuses({ limit: 100 })
    campusList.value = response.items || []
  } catch (e) {
    error.value = 'Erreur lors du chargement des campus'
    console.error('Erreur chargement campus:', e)
  } finally {
    loading.value = false
  }
}

async function loadCountries() {
  try {
    countries.value = await getAllCountriesPublic()
  } catch (e) {
    console.error('Erreur chargement pays:', e)
  }
}

// === HELPERS ===
const getCountryInfo = (countryId: string | null) => {
  if (!countryId) return null
  return countries.value.find(c => c.id === countryId)
}

// === STATS ===
const stats = computed(() => ({
  total: campusList.value.length,
  active: campusList.value.filter(c => c.active).length,
  inactive: campusList.value.filter(c => !c.active).length,
  // Ces compteurs ne sont pas disponibles sans enrichissement
  totalPrograms: 0,
  totalTeamMembers: 0,
  totalPartners: 0,
}))

// === FILTRAGE ===
const filteredCampus = computed(() => {
  let result = [...campusList.value]

  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.city?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query)
    )
  }

  // Filtre par pays
  if (filterCountry.value !== 'all') {
    result = result.filter(c => c.country_external_id === filterCountry.value)
  }

  // Filtre par statut
  if (filterActive.value !== 'all') {
    const isActive = filterActive.value === 'active'
    result = result.filter(c => c.active === isActive)
  }

  // Trier : siège en premier, puis par nom
  return result.sort((a, b) => {
    if (a.is_headquarters) return -1
    if (b.is_headquarters) return 1
    return a.name.localeCompare(b.name)
  })
})

// === PAGINATION ===
const totalPages = computed(() => Math.ceil(filteredCampus.value.length / itemsPerPage.value))

const paginatedCampus = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCampus.value.slice(start, start + itemsPerPage.value)
})

// Reset page quand les filtres changent
watch([searchQuery, filterCountry, filterActive], () => {
  currentPage.value = 1
})

// === ACTIONS ===
const resetFilters = () => {
  searchQuery.value = ''
  filterCountry.value = 'all'
  filterActive.value = 'all'
}

const toggleActive = async (campus: CampusRead) => {
  try {
    await toggleCampusActive(campus.id)
    await loadCampuses()
  } catch (e) {
    console.error('Erreur toggle active:', e)
  }
}

const deleteCampus = async (campus: CampusRead) => {
  if (campus.is_headquarters) {
    alert('Impossible de supprimer le siège principal.')
    return
  }
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le campus "${campus.name}" ?`)) {
    return
  }
  try {
    await apiDeleteCampus(campus.id)
    await loadCampuses()
  } catch (e) {
    console.error('Erreur suppression:', e)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Campus
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez les campus de l'université (siège et externalisés)
        </p>
      </div>
      <NuxtLink
        to="/admin/campus/liste/nouveau"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        Nouveau campus
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      {{ error }}
      <button class="ml-4 text-sm underline" @click="loadCampuses">
        Réessayer
      </button>
    </div>

    <template v-else>
      <!-- Statistiques -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Total campus</div>
        </div>
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="text-2xl font-bold text-green-600">{{ stats.active }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Actifs</div>
        </div>
        <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div class="text-2xl font-bold text-red-600">{{ stats.inactive }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">Inactifs</div>
        </div>
      </div>

      <!-- Filtres -->
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Recherche -->
          <div class="flex-1">
            <div class="relative">
              <font-awesome-icon
                :icon="['fas', 'search']"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un campus..."
                class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Pays -->
          <select
            v-model="filterCountry"
            class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les pays</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ getFlagEmoji(country.iso_code) }} {{ country.name_fr }}
            </option>
          </select>

          <!-- Statut -->
          <select
            v-model="filterActive"
            class="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          <!-- Vue -->
          <div class="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              :class="[
                'px-3 py-2 text-sm',
                viewMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              ]"
              @click="viewMode = 'cards'"
            >
              <font-awesome-icon :icon="['fas', 'th-large']" />
            </button>
            <button
              :class="[
                'px-3 py-2 text-sm',
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              ]"
              @click="viewMode = 'table'"
            >
              <font-awesome-icon :icon="['fas', 'list']" />
            </button>
          </div>

          <!-- Reset -->
          <button
            class="rounded-lg border border-gray-300 px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="resetFilters"
          >
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
      </div>

      <!-- Vue Cartes -->
      <div v-if="viewMode === 'cards'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="campus in paginatedCampus"
          :key="campus.id"
          class="group overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
        >
          <!-- Image -->
          <div class="relative h-48">
            <img
              v-if="campus.cover_image_external_id"
              :src="getMediaUrl(campus.cover_image_external_id) ?? undefined"
              :alt="campus.name"
              class="h-full w-full object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <div
              v-if="!campus.cover_image_external_id"
              class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700"
            >
              <font-awesome-icon :icon="['fas', 'university']" class="text-5xl text-gray-400" />
            </div>
            <!-- Badges -->
            <div class="absolute left-3 top-3 flex flex-col gap-2">
              <span
                v-if="campus.is_headquarters"
                class="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white"
              >
                <font-awesome-icon :icon="['fas', 'star']" class="h-3 w-3" />
                Siège
              </span>
              <span
                :class="[
                  'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                  campus.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                ]"
              >
                {{ campus.active ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <!-- Code -->
            <div class="absolute right-3 top-3">
              <span class="rounded bg-black/50 px-2 py-1 text-xs font-mono font-bold text-white">
                {{ campus.code }}
              </span>
            </div>
          </div>

          <!-- Contenu -->
          <div class="p-4">
            <div class="mb-2 flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ campus.name }}
                </h3>
                <p class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>{{ getFlagEmoji(getCountryInfo(campus.country_external_id)?.iso_code) }}</span>
                  {{ campus.city }}<template v-if="getCountryInfo(campus.country_external_id)">, {{ getCountryInfo(campus.country_external_id)?.name_fr }}</template>
                </p>
              </div>
            </div>

            <!-- Contact -->
            <div v-if="campus.email || campus.phone" class="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
              <p v-if="campus.email" class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'envelope']" class="h-3 w-3" />
                {{ campus.email }}
              </p>
              <p v-if="campus.phone" class="flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'phone']" class="h-3 w-3" />
                {{ campus.phone }}
              </p>
            </div>

            <!-- Actions -->
            <div class="mt-4 flex items-center justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <NuxtLink
                :to="`/admin/campus/liste/${campus.id}`"
                class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700"
                title="Voir"
              >
                <font-awesome-icon :icon="['fas', 'eye']" />
              </NuxtLink>
              <NuxtLink
                :to="`/admin/campus/liste/${campus.id}/edit`"
                class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                title="Modifier"
              >
                <font-awesome-icon :icon="['fas', 'edit']" />
              </NuxtLink>
              <button
                class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-600 dark:hover:bg-gray-700"
                :title="campus.active ? 'Désactiver' : 'Activer'"
                @click="toggleActive(campus)"
              >
                <font-awesome-icon :icon="['fas', campus.active ? 'toggle-on' : 'toggle-off']" />
              </button>
              <button
                v-if="!campus.is_headquarters"
                class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                title="Supprimer"
                @click="deleteCampus(campus)"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Tableau -->
      <div v-else class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Campus
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Code
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Localisation
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Contact
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
                v-for="campus in paginatedCampus"
                :key="campus.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="campus.cover_image_external_id"
                      :src="getMediaUrl(campus.cover_image_external_id) ?? undefined"
                      :alt="campus.name"
                      class="h-10 w-16 rounded object-cover"
                      @error="($event.target as HTMLImageElement).style.display = 'none'"
                    />
                    <div
                      v-else
                      class="flex h-10 w-16 items-center justify-center rounded bg-gray-200 dark:bg-gray-700"
                    >
                      <font-awesome-icon :icon="['fas', 'university']" class="text-gray-400" />
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <NuxtLink
                          :to="`/admin/campus/liste/${campus.id}`"
                          class="font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                        >
                          {{ campus.name }}
                        </NuxtLink>
                        <span
                          v-if="campus.is_headquarters"
                          class="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        >
                          <font-awesome-icon :icon="['fas', 'star']" class="h-2.5 w-2.5" />
                          Siège
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <code class="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">
                    {{ campus.code }}
                  </code>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                    <span>{{ getFlagEmoji(getCountryInfo(campus.country_external_id)?.iso_code) }}</span>
                    {{ campus.city }}<template v-if="getCountryInfo(campus.country_external_id)">, {{ getCountryInfo(campus.country_external_id)?.name_fr }}</template>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div v-if="campus.email" class="text-sm text-gray-600 dark:text-gray-300">
                    {{ campus.email }}
                  </div>
                  <span v-else class="text-sm text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    :class="[
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      campus.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    ]"
                  >
                    {{ campus.active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <NuxtLink
                      :to="`/admin/campus/liste/${campus.id}`"
                      class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-700"
                      title="Voir"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" />
                    </NuxtLink>
                    <NuxtLink
                      :to="`/admin/campus/liste/${campus.id}/edit`"
                      class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                      title="Modifier"
                    >
                      <font-awesome-icon :icon="['fas', 'edit']" />
                    </NuxtLink>
                    <button
                      class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-yellow-600 dark:hover:bg-gray-700"
                      :title="campus.active ? 'Désactiver' : 'Activer'"
                      @click="toggleActive(campus)"
                    >
                      <font-awesome-icon :icon="['fas', campus.active ? 'toggle-on' : 'toggle-off']" />
                    </button>
                    <button
                      v-if="!campus.is_headquarters"
                      class="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                      title="Supprimer"
                      @click="deleteCampus(campus)"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- État vide -->
        <div
          v-if="paginatedCampus.length === 0"
          class="py-12 text-center"
        >
          <font-awesome-icon :icon="['fas', 'university']" class="mb-4 text-5xl text-gray-300" />
          <p class="text-gray-500 dark:text-gray-400">Aucun campus trouvé</p>
          <button
            v-if="searchQuery || filterCountry !== 'all' || filterActive !== 'all'"
            class="mt-2 text-sm text-blue-600 hover:underline"
            @click="resetFilters"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow dark:bg-gray-800"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ filteredCampus.length }} campus - Page {{ currentPage }} sur {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 1"
            class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="currentPage--"
          >
            Précédent
          </button>
          <button
            :disabled="currentPage === totalPages"
            class="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
            @click="currentPage++"
          >
            Suivant
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
