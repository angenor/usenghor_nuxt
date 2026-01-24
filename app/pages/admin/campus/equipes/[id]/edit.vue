<script setup lang="ts">
import type { CampusTeamMember } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const route = useRoute()

const {
  campusExternalises,
  getCampusTeamMemberById,
  commonPositions
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const notFound = ref(false)
const member = ref<CampusTeamMember | null>(null)
const showPositionDropdown = ref(false)

// Form state
const form = ref({
  campus_id: '',
  position: '',
  display_order: 1,
  start_date: '',
  end_date: '',
  active: true
})

// Charger les données
onMounted(() => {
  const memberId = route.params.id as string
  const foundMember = getCampusTeamMemberById(memberId)

  if (foundMember) {
    member.value = foundMember
    form.value = {
      campus_id: foundMember.campus_id,
      position: foundMember.position,
      display_order: foundMember.display_order,
      start_date: foundMember.start_date || '',
      end_date: foundMember.end_date || '',
      active: foundMember.active
    }
  } else {
    notFound.value = true
  }

  isLoading.value = false
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

// Filtrer les positions suggestions
const filteredPositions = computed(() => {
  if (!form.value.position) return commonPositions
  const query = form.value.position.toLowerCase()
  return commonPositions.filter(p => p.toLowerCase().includes(query))
})

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.campus_id &&
    form.value.position.trim() &&
    form.value.start_date
})

// Nom complet du membre
const fullName = computed(() => {
  if (!member.value) return ''
  return `${member.value.user.first_name} ${member.value.user.last_name}`
})

// Campus actuel
const currentCampusName = computed(() => {
  if (!member.value) return ''
  if (member.value.campus_id === 'siege') return 'Siège - Alexandrie'
  const campus = campusExternalises.value.find(c => c.id === member.value?.campus_id)
  return campus?.name_fr || ''
})

// === METHODS ===

// Sélectionner une position
const selectPosition = (position: string) => {
  form.value.position = position
  showPositionDropdown.value = false
}

// Sauvegarder
const saveForm = async () => {
  if (!isFormValid.value || !member.value) return

  isSaving.value = true
  try {
    const updatedMember = {
      ...member.value,
      ...form.value,
      end_date: form.value.end_date || null
    }

    console.log('Mise à jour du membre:', updatedMember)
    // En production: PUT /api/admin/campus-team/{id}

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

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Fermer les dropdowns quand on clique ailleurs
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
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
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="py-12 text-center">
      <font-awesome-icon :icon="['fas', 'user-slash']" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <h2 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Membre non trouvé</h2>
      <p class="mb-4 text-gray-500 dark:text-gray-400">Ce membre d'équipe n'existe pas ou a été supprimé.</p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
        @click="router.push('/admin/campus/equipes')"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
        Retour à la liste
      </button>
    </div>

    <!-- Formulaire -->
    <template v-else-if="member">
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
          Modifier le membre
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Modification des informations de {{ fullName }}
        </p>
      </div>

      <!-- Info membre (non modifiable) -->
      <div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Informations du membre
        </h3>
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
            <img
              v-if="member.user.photo_url"
              :src="member.user.photo_url"
              :alt="fullName"
              class="h-full w-full object-cover"
            />
            <font-awesome-icon v-else :icon="['fas', 'user']" class="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <p class="text-lg font-medium text-gray-900 dark:text-white">
              {{ fullName }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ member.user.email }}
            </p>
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Membre depuis le {{ formatDate(member.created_at) }}
            </p>
          </div>
        </div>
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
          <p v-if="form.campus_id !== member.campus_id" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Attention : vous allez transférer ce membre vers un autre campus
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

        <!-- Avertissement si inactif -->
        <div
          v-if="!form.active"
          class="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
        >
          <div class="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
            <font-awesome-icon :icon="['fas', 'eye-slash']" class="h-4 w-4" />
            <span>Ce membre ne sera pas visible sur le site public</span>
          </div>
        </div>
      </div>

      <!-- Métadonnées -->
      <div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">ID:</span>
            <code class="ml-2 rounded bg-gray-200 px-1 text-xs dark:bg-gray-700">{{ member.id }}</code>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Créé le:</span>
            <span class="ml-2 text-gray-900 dark:text-white">{{ formatDate(member.created_at) }}</span>
          </div>
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
          <font-awesome-icon v-else :icon="['fas', 'save']" class="h-4 w-4" />
          Enregistrer
        </button>
      </div>
    </template>
  </div>
</template>
