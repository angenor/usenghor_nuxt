<script setup lang="ts">
import type { CountryRead } from '~/composables/useCountriesApi'

const props = defineProps<{
  projectId: string
}>()

const {
  listProjectCountries,
  addProjectCountry,
  removeProjectCountry,
} = useProjectsApi()

const {
  getAllCountries,
  getFlagEmoji,
} = useCountriesApi()

// État
const projectCountryIds = ref<string[]>([])
const allCountries = ref<CountryRead[]>([])
const isLoading = ref(true)
const showSelectModal = ref(false)
const searchQuery = ref('')

// Chargement
onMounted(async () => {
  await Promise.all([loadProjectCountries(), loadAllCountries()])
  isLoading.value = false
})

async function loadProjectCountries() {
  try {
    const data = await listProjectCountries(props.projectId)
    projectCountryIds.value = data.map(c => c.country_external_id)
  }
  catch (err) {
    console.error('Erreur chargement pays du projet:', err)
  }
}

async function loadAllCountries() {
  try {
    allCountries.value = await getAllCountries({ active: true })
  }
  catch (err) {
    console.error('Erreur chargement liste pays:', err)
  }
}

// Pays enrichis (avec infos complètes)
const enrichedCountries = computed(() => {
  return projectCountryIds.value
    .map(id => allCountries.value.find(c => c.id === id))
    .filter((c): c is CountryRead => !!c)
})

// Pays filtrés pour la recherche
const filteredCountries = computed(() => {
  if (!searchQuery.value) return allCountries.value
  const q = searchQuery.value.toLowerCase()
  return allCountries.value.filter(c =>
    c.name_fr.toLowerCase().includes(q)
    || c.iso_code.toLowerCase().includes(q)
    || c.iso_code3?.toLowerCase().includes(q),
  )
})

// Actions
async function handleToggleCountry(countryId: string) {
  try {
    if (projectCountryIds.value.includes(countryId)) {
      await removeProjectCountry(props.projectId, countryId)
      projectCountryIds.value = projectCountryIds.value.filter(id => id !== countryId)
    }
    else {
      await addProjectCountry(props.projectId, countryId)
      projectCountryIds.value.push(countryId)
    }
  }
  catch (err) {
    console.error('Erreur toggle pays:', err)
    alert('Erreur lors de la modification')
  }
}

async function handleRemoveCountry(countryId: string) {
  try {
    await removeProjectCountry(props.projectId, countryId)
    projectCountryIds.value = projectCountryIds.value.filter(id => id !== countryId)
  }
  catch (err) {
    console.error('Erreur suppression pays:', err)
  }
}

function closeModal() {
  showSelectModal.value = false
  searchQuery.value = ''
}
</script>

<template>
  <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <font-awesome-icon :icon="['fas', 'globe-africa']" class="h-5 w-5 text-green-500" />
        Pays concernés
      </h2>
      <button
        class="text-sm text-blue-600 hover:underline dark:text-blue-400"
        @click="showSelectModal = true"
      >
        Gérer
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="isLoading" class="flex items-center justify-center py-4">
      <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-xl text-gray-400" />
    </div>

    <!-- Affichage des pays avec drapeaux -->
    <div v-else-if="enrichedCountries.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="country in enrichedCountries"
        :key="country.id"
        class="group inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2 pr-1 text-sm dark:bg-gray-700"
      >
        <span class="text-base">{{ getFlagEmoji(country.iso_code) }}</span>
        <span class="text-gray-700 dark:text-gray-300">{{ country.name_fr }}</span>
        <button
          class="ml-1 rounded-full p-0.5 text-gray-400 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30"
          title="Retirer"
          @click="handleRemoveCountry(country.id)"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3" />
        </button>
      </span>
    </div>

    <!-- État vide -->
    <div v-else class="text-gray-400">
      Aucun pays sélectionné
    </div>

    <!-- Modal sélection pays -->
    <Teleport to="body">
      <div v-if="showSelectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div class="border-b border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Sélectionner les pays
              </h3>
              <button
                class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                @click="closeModal"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
              </button>
            </div>

            <!-- Recherche -->
            <div class="relative mt-4">
              <font-awesome-icon
                :icon="['fas', 'search']"
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un pays..."
                class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Liste des pays -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="grid gap-2 sm:grid-cols-2">
              <label
                v-for="country in filteredCountries"
                :key="country.id"
                class="flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors"
                :class="projectCountryIds.includes(country.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50'"
              >
                <input
                  type="checkbox"
                  :checked="projectCountryIds.includes(country.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @change="handleToggleCountry(country.id)"
                />
                <span class="text-lg">{{ getFlagEmoji(country.iso_code) }}</span>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ country.name_fr }}</span>
              </label>
            </div>

            <div v-if="filteredCountries.length === 0" class="py-8 text-center text-gray-400">
              Aucun pays trouvé
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">
                {{ projectCountryIds.length }} pays sélectionné(s)
              </span>
              <button
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                @click="closeModal"
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
