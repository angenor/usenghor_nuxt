<script setup lang="ts">
import World from '@svg-maps/world'
import type { MapViewBox } from '~/composables/useMapSettings'
import { DEFAULT_VIEWBOX, DEFAULT_EXCLUDED_COUNTRIES } from '~/composables/useMapSettings'
import type { CampusPublic } from '~/composables/usePublicCampusApi'

definePageMeta({
  layout: 'admin',
})

const { loadMapSettings, saveMapSettings, viewBoxToString } = useMapSettings()
const { getAllCampuses } = usePublicCampusApi()

// ============================================================================
// STATE
// ============================================================================

const loading = ref(true)
const saving = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const viewBox = ref<MapViewBox>({ ...DEFAULT_VIEWBOX })
const excludedCountries = ref<string[]>([...DEFAULT_EXCLUDED_COUNTRIES])
const campuses = ref<CampusPublic[]>([])

// Recherche pays
const countrySearch = ref('')

// Map SVG data
const map = World

// ============================================================================
// CHARGEMENT
// ============================================================================

onMounted(async () => {
  try {
    const [settings, campusList] = await Promise.all([
      loadMapSettings(),
      getAllCampuses(),
    ])
    viewBox.value = settings.viewBox
    excludedCountries.value = settings.excludedCountries
    campuses.value = campusList
  }
  catch (e) {
    console.error('Erreur chargement config carte:', e)
    errorMessage.value = 'Erreur lors du chargement de la configuration'
  }
  finally {
    loading.value = false
  }
})

// ============================================================================
// ACTIONS
// ============================================================================

async function save() {
  saving.value = true
  errorMessage.value = null
  successMessage.value = null
  try {
    await saveMapSettings({
      viewBox: viewBox.value,
      excludedCountries: excludedCountries.value,
    })
    successMessage.value = 'Configuration de la carte enregistrée avec succès'
    setTimeout(() => { successMessage.value = null }, 4000)
  }
  catch (e) {
    console.error('Erreur sauvegarde:', e)
    errorMessage.value = 'Erreur lors de la sauvegarde'
  }
  finally {
    saving.value = false
  }
}

function resetDefaults() {
  viewBox.value = { ...DEFAULT_VIEWBOX }
  excludedCountries.value = [...DEFAULT_EXCLUDED_COUNTRIES]
}

// ============================================================================
// LISTE DES PAYS (pour le panneau latéral)
// ============================================================================

const allCountries = computed(() => {
  return map.locations
    .map(loc => ({ id: loc.id.toLowerCase(), name: loc.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const filteredCountryList = computed(() => {
  if (!countrySearch.value.trim()) return allCountries.value
  const q = countrySearch.value.toLowerCase()
  return allCountries.value.filter(c =>
    c.name.toLowerCase().includes(q) || c.id.includes(q),
  )
})

function toggleCountryExcluded(countryId: string) {
  const idx = excludedCountries.value.indexOf(countryId)
  if (idx >= 0) {
    excludedCountries.value.splice(idx, 1)
  }
  else {
    excludedCountries.value.push(countryId)
  }
}

// Aperçu : filtrer les pays exclus pour le SVG
const previewLocations = computed(() => {
  const excluded = new Set(excludedCountries.value)
  return map.locations.filter(loc => !excluded.has(loc.id.toLowerCase()))
})

// Couleur d'un pays dans l'aperçu
function getPreviewColor(id: string): string {
  const idLower = id.toLowerCase()
  const campus = campuses.value.find(c => c.country_iso_code?.toLowerCase() === idLower)
  if (campus) {
    return campus.is_headquarters ? '#2b4bbf' : '#f32525'
  }
  return '#e5e7eb'
}

// Clamp pour les inputs numériques
function clampViewBox() {
  viewBox.value.x = Math.max(0, Math.min(viewBox.value.x, 1010 - viewBox.value.width))
  viewBox.value.y = Math.max(0, Math.min(viewBox.value.y, 666 - viewBox.value.height))
  viewBox.value.width = Math.max(80, Math.min(viewBox.value.width, 1010 - viewBox.value.x))
  viewBox.value.height = Math.max(80, Math.min(viewBox.value.height, 666 - viewBox.value.y))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          <font-awesome-icon icon="fa-solid fa-globe-africa" class="w-6 h-6 mr-2 text-brand-blue-500" />
          Carte du monde
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ajustez la zone visible et les pays affichés sur la carte publique des campus
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          @click="resetDefaults"
        >
          <font-awesome-icon icon="fa-solid fa-undo" class="w-3.5 h-3.5 mr-1.5" />
          Réinitialiser
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-brand-blue-500 rounded-lg hover:bg-brand-blue-600 transition-colors disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          <font-awesome-icon v-if="saving" icon="fa-solid fa-spinner" class="w-3.5 h-3.5 mr-1.5 animate-spin" />
          <font-awesome-icon v-else icon="fa-solid fa-save" class="w-3.5 h-3.5 mr-1.5" />
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Messages -->
    <Transition name="fade">
      <div v-if="successMessage" class="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
        <font-awesome-icon icon="fa-solid fa-check-circle" class="w-4 h-4" />
        {{ successMessage }}
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="errorMessage" class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="w-4 h-4" />
        {{ errorMessage }}
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600"></div>
    </div>

    <!-- Contenu principal -->
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne gauche (2/3) : Éditeur + Inputs numériques -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Éditeur visuel -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <font-awesome-icon icon="fa-solid fa-crop-alt" class="w-3.5 h-3.5 mr-1.5" />
              Zone visible — glissez pour déplacer, utilisez les poignées pour redimensionner
            </h3>
            <AdminMapViewboxEditor
              :view-box="viewBox"
              :excluded-countries="excludedCountries"
              :campuses="campuses"
              @update:view-box="viewBox = $event"
              @update:excluded-countries="excludedCountries = $event"
            />
          </div>

          <!-- Inputs numériques -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <font-awesome-icon icon="fa-solid fa-sliders-h" class="w-3.5 h-3.5 mr-1.5" />
              Ajustement fin
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">X (décalage horizontal)</label>
                <input
                  v-model.number="viewBox.x"
                  type="number"
                  min="0"
                  max="930"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  @change="clampViewBox"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y (décalage vertical)</label>
                <input
                  v-model.number="viewBox.y"
                  type="number"
                  min="0"
                  max="586"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  @change="clampViewBox"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Largeur</label>
                <input
                  v-model.number="viewBox.width"
                  type="number"
                  min="80"
                  max="1010"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  @change="clampViewBox"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hauteur</label>
                <input
                  v-model.number="viewBox.height"
                  type="number"
                  min="80"
                  max="666"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent"
                  @change="clampViewBox"
                />
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">
              viewBox SVG : <code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{{ viewBoxToString(viewBox) }}</code>
            </p>
          </div>
        </div>

        <!-- Colonne droite (1/3) : Aperçu + Pays exclus -->
        <div class="space-y-4">
          <!-- Aperçu en direct -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <font-awesome-icon icon="fa-solid fa-eye" class="w-3.5 h-3.5 mr-1.5" />
              Aperçu en direct
            </h3>
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
              <svg
                :viewBox="viewBoxToString(viewBox)"
                class="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  v-for="location in previewLocations"
                  :key="location.id"
                  :d="location.path"
                  :fill="getPreviewColor(location.id)"
                  stroke="#fff"
                  stroke-width="0.5"
                />
              </svg>
            </div>
            <p class="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
              Rendu tel qu'il apparaîtra sur la page publique
            </p>
          </div>

          <!-- Pays exclus -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <font-awesome-icon icon="fa-solid fa-eye-slash" class="w-3.5 h-3.5 mr-1.5" />
              Pays exclus ({{ excludedCountries.length }})
            </h3>

            <!-- Recherche -->
            <input
              v-model="countrySearch"
              type="text"
              placeholder="Rechercher un pays..."
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue-500 focus:border-transparent mb-3"
            />

            <!-- Liste scrollable -->
            <div class="max-h-80 overflow-y-auto space-y-0.5">
              <label
                v-for="country in filteredCountryList"
                :key="country.id"
                class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  :checked="excludedCountries.includes(country.id)"
                  class="rounded border-gray-300 dark:border-gray-600 text-brand-blue-500 focus:ring-brand-blue-500"
                  @change="toggleCountryExcluded(country.id)"
                />
                <span class="text-gray-700 dark:text-gray-300">
                  {{ country.name }}
                </span>
                <span class="text-xs text-gray-400 uppercase">{{ country.id }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
