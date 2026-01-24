<script setup lang="ts">
import type { CampusTeamUser } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const route = useRoute()

const {
  campusExternalises,
  searchUsersForTeam,
  availableUsers,
  commonPositions,
  generateCampusTeamId,
  countCampusTeamMembers
} = useMockData()

// === STATE ===
const isSaving = ref(false)
const userSearchQuery = ref('')
const showUserDropdown = ref(false)
const showPositionDropdown = ref(false)

// Form state
const form = ref({
  campus_id: '',
  user_external_id: '',
  position: '',
  display_order: 1,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  active: true
})

// Selected user
const selectedUser = ref<CampusTeamUser | null>(null)

// Initialiser le campus depuis l'URL
onMounted(() => {
  if (route.query.campus) {
    form.value.campus_id = route.query.campus as string
    updateDisplayOrder()
  }
})

// === COMPUTED ===

// Liste des campus avec le siège
const allCampuses = computed(() => {
  const siege = {
    id: 'siege',
    name_fr: 'Siège - Alexandrie',
    country_fr: 'Égypte',
    country: 'EG'
  }
  return [siege, ...campusExternalises.value]
})

// Résultats de recherche utilisateur
const userSearchResults = computed(() => {
  if (!userSearchQuery.value || userSearchQuery.value.length < 2) {
    return []
  }
  return searchUsersForTeam(userSearchQuery.value)
})

// Filtrer les positions suggestions
const filteredPositions = computed(() => {
  if (!form.value.position) return commonPositions
  const query = form.value.position.toLowerCase()
  return commonPositions.filter(p => p.toLowerCase().includes(query))
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.campus_id &&
    form.value.user_external_id &&
    form.value.position.trim() &&
    form.value.start_date
})

// === METHODS ===

// Mise à jour de l'ordre d'affichage
const updateDisplayOrder = () => {
  if (form.value.campus_id) {
    const count = countCampusTeamMembers(form.value.campus_id, false)
    form.value.display_order = count + 1
  }
}

// Watch campus changes
watch(() => form.value.campus_id, () => {
  updateDisplayOrder()
})

// Sélectionner un utilisateur
const selectUser = (user: CampusTeamUser) => {
  selectedUser.value = user
  form.value.user_external_id = user.id
  userSearchQuery.value = `${user.first_name} ${user.last_name}`
  showUserDropdown.value = false
}

// Effacer la sélection utilisateur
const clearUserSelection = () => {
  selectedUser.value = null
  form.value.user_external_id = ''
  userSearchQuery.value = ''
}

// Sélectionner une position
const selectPosition = (position: string) => {
  form.value.position = position
  showPositionDropdown.value = false
}

// Sauvegarder
const saveForm = async () => {
  if (!isFormValid.value) return

  isSaving.value = true
  try {
    const newMember = {
      id: generateCampusTeamId(),
      ...form.value,
      end_date: form.value.end_date || null,
      created_at: new Date().toISOString()
    }

    console.log('Création du membre:', newMember)
    // En production: POST /api/admin/campuses/{campus_id}/team

    await new Promise(resolve => setTimeout(resolve, 500))
    router.push({ path: '/admin/campus/equipes', query: { campus: form.value.campus_id } })
  } finally {
    isSaving.value = false
  }
}

// Annuler
const goBack = () => {
  router.back()
}

// Flag emoji helper
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Fermer les dropdowns quand on clique ailleurs
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-search-container')) {
    showUserDropdown.value = false
  }
  if (!target.closest('.position-container')) {
    showPositionDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-6">
    <!-- Header -->
    <div class="mb-6">
      <button
        class="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        @click="goBack"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
        Retour à la liste
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Ajouter un membre à l'équipe
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Ajoutez un utilisateur existant à l'équipe d'un campus
      </p>
    </div>

    <!-- Formulaire -->
    <div class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <!-- Campus -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Campus *
        </label>
        <select
          v-model="form.campus_id"
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          required
        >
          <option value="" disabled>Sélectionner un campus</option>
          <option v-for="campus in allCampuses" :key="campus.id" :value="campus.id">
            {{ getFlagEmoji(campus.country) }} {{ campus.name_fr }}
          </option>
        </select>
      </div>

      <!-- Utilisateur (autocomplete) -->
      <div class="user-search-container relative">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Utilisateur *
        </label>

        <!-- Utilisateur sélectionné -->
        <div v-if="selectedUser" class="flex items-center gap-3 rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
          <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
            <img
              v-if="selectedUser.photo_url"
              :src="selectedUser.photo_url"
              :alt="`${selectedUser.first_name} ${selectedUser.last_name}`"
              class="h-full w-full object-cover"
            />
            <font-awesome-icon v-else :icon="['fas', 'user']" class="h-5 w-5 text-gray-400" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900 dark:text-white">
              {{ selectedUser.first_name }} {{ selectedUser.last_name }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedUser.email }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
            @click="clearUserSelection"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
          </button>
        </div>

        <!-- Champ de recherche -->
        <div v-else class="relative">
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="userSearchQuery"
            type="text"
            placeholder="Rechercher un utilisateur (nom, prénom, email)..."
            class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            @focus="showUserDropdown = true"
          />

          <!-- Dropdown résultats -->
          <div
            v-if="showUserDropdown && userSearchQuery.length >= 2"
            class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <button
              v-for="user in userSearchResults"
              :key="user.id"
              type="button"
              class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              @click="selectUser(user)"
            >
              <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                <img
                  v-if="user.photo_url"
                  :src="user.photo_url"
                  :alt="`${user.first_name} ${user.last_name}`"
                  class="h-full w-full object-cover"
                />
                <font-awesome-icon v-else :icon="['fas', 'user']" class="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ user.first_name }} {{ user.last_name }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ user.email }}
                </p>
              </div>
            </button>

            <div
              v-if="userSearchResults.length === 0"
              class="p-4 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              Aucun utilisateur trouvé
            </div>
          </div>
        </div>

        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Tapez au moins 2 caractères pour rechercher
        </p>
      </div>

      <!-- Poste -->
      <div class="position-container relative">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Poste / Fonction *
        </label>
        <input
          v-model="form.position"
          type="text"
          placeholder="Ex: Directeur du campus, Responsable administratif..."
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          required
          @focus="showPositionDropdown = true"
        />

        <!-- Suggestions de postes -->
        <div
          v-if="showPositionDropdown && filteredPositions.length > 0"
          class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <button
            v-for="position in filteredPositions"
            :key="position"
            type="button"
            class="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            :class="form.position === position ? 'bg-gray-100 dark:bg-gray-700' : ''"
            @click="selectPosition(position)"
          >
            {{ position }}
          </button>
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date de début *
          </label>
          <input
            v-model="form.start_date"
            type="date"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date de fin
          </label>
          <input
            v-model="form.end_date"
            type="date"
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optionnel - pour les départs prévus
          </p>
        </div>
      </div>

      <!-- Ordre d'affichage -->
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ordre d'affichage
        </label>
        <input
          v-model.number="form.display_order"
          type="number"
          min="1"
          class="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Détermine l'ordre d'affichage sur le site public
        </p>
      </div>

      <!-- Actif -->
      <div class="flex items-center gap-3">
        <input
          id="active"
          v-model="form.active"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 bg-white text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label for="active" class="text-sm text-gray-700 dark:text-gray-300">
          Membre actif (visible sur le site public)
        </label>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        :disabled="isSaving"
        @click="goBack"
      >
        Annuler
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!isFormValid || isSaving"
        @click="saveForm"
      >
        <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
        <font-awesome-icon v-else :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter à l'équipe
      </button>
    </div>
  </div>
</template>
