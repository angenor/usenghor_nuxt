<script setup lang="ts">
import type { CampusWithTeam } from '~/composables/useCampusApi'
import type { CountryRead } from '~/composables/useCountriesApi'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getCampusById,
  updateCampus: apiUpdateCampus,
} = useCampusApi()

const { getAllCountries, getFlagEmoji } = useCountriesApi()
const { apiFetch } = useApi()
const { getMediaUrl } = useMediaApi()

// Données de référence
const countries = ref<CountryRead[]>([])
const isLoadingData = ref(true)
const usersLoadError = ref<string | null>(null)

// Candidats responsables (utilisateurs)
interface HeadCandidate {
  id: string
  name: string
  email: string
}
const headCandidates = ref<HeadCandidate[]>([])

async function loadHeadCandidates() {
  try {
    const response = await apiFetch<{
      items: Array<{
        id: string
        email: string
        first_name: string
        last_name: string
        salutation: string | null
      }>
    }>('/api/admin/users', {
      query: { limit: 100, active: true },
    })
    headCandidates.value = response.items.map(user => ({
      id: user.id,
      email: user.email,
      name: user.salutation
        ? `${user.salutation} ${user.first_name} ${user.last_name}`
        : `${user.first_name} ${user.last_name}`,
    }))
  }
  catch (err) {
    console.error('Erreur chargement des candidats responsables:', err)
    usersLoadError.value = 'Erreur lors du chargement des utilisateurs'
  }
}

// Campus à éditer
const campusId = computed(() => route.params.id as string)
const originalCampus = ref<CampusWithTeam | null>(null)
const loading = ref(true)

// État du formulaire
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const activeTab = ref<'general' | 'location' | 'contact' | 'settings'>('general')

// Données du formulaire (alignées sur le schéma backend)
const form = reactive({
  code: '',
  name: '',
  description: '',
  cover_image_external_id: '' as string | null,
  country_external_id: '' as string | null,
  city: '',
  address: '',
  postal_code: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  email: '',
  phone: '',
  head_external_id: '' as string | null,
  is_headquarters: false,
  active: true
})

// Charger les données du campus
const loadCampusData = () => {
  if (originalCampus.value) {
    form.code = originalCampus.value.code
    form.name = originalCampus.value.name
    form.description = originalCampus.value.description || ''
    form.cover_image_external_id = originalCampus.value.cover_image_external_id || ''
    form.country_external_id = originalCampus.value.country_external_id || ''
    form.city = originalCampus.value.city || ''
    form.address = originalCampus.value.address || ''
    form.postal_code = originalCampus.value.postal_code || ''
    form.latitude = originalCampus.value.latitude ?? undefined
    form.longitude = originalCampus.value.longitude ?? undefined
    form.email = originalCampus.value.email || ''
    form.phone = originalCampus.value.phone || ''
    form.head_external_id = originalCampus.value.head_external_id || ''
    form.is_headquarters = originalCampus.value.is_headquarters
    form.active = originalCampus.value.active
  }
}

// Charger les données au montage
onMounted(async () => {
  await Promise.all([
    loadCampus(),
    getAllCountries().then(data => countries.value = data).catch(console.error),
    loadHeadCandidates(),
  ])
  isLoadingData.value = false
})

async function loadCampus() {
  loading.value = true
  try {
    originalCampus.value = await getCampusById(campusId.value)
    loadCampusData()
  } catch (e) {
    console.error('Erreur chargement campus:', e)
    originalCampus.value = null
  } finally {
    loading.value = false
  }
}

// Recharger si l'ID change
watch(campusId, async () => {
  await loadCampus()
})

// Validation
const errors = reactive({
  code: '',
  name: '',
  country_external_id: '',
  city: ''
})

const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.code = ''
  errors.name = ''
  errors.country_external_id = ''
  errors.city = ''

  if (!form.code.trim()) {
    errors.code = 'Le code est requis'
    isValid = false
  } else if (form.code.length > 20) {
    errors.code = 'Le code ne doit pas dépasser 20 caractères'
    isValid = false
  }

  if (!form.name.trim()) {
    errors.name = 'Le nom est requis'
    isValid = false
  }

  if (!form.country_external_id) {
    errors.country_external_id = 'Le pays est requis'
    isValid = false
  }

  if (!form.city.trim()) {
    errors.city = 'La ville est requise'
    isValid = false
  }

  return isValid
}

// Navigation
const goBack = () => router.push(`/admin/campus/liste/${campusId.value}`)

// Soumission
const submitForm = async () => {
  if (!validateForm()) {
    // Aller à l'onglet avec erreurs
    if (errors.code || errors.name) {
      activeTab.value = 'general'
    } else if (errors.country_external_id || errors.city) {
      activeTab.value = 'location'
    }
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    const campusData = {
      code: form.code,
      name: form.name,
      description: form.description || null,
      cover_image_external_id: form.cover_image_external_id || null,
      country_external_id: form.country_external_id || null,
      city: form.city || null,
      address: form.address || null,
      postal_code: form.postal_code || null,
      latitude: form.latitude ?? null,
      longitude: form.longitude ?? null,
      email: form.email || null,
      phone: form.phone || null,
      head_external_id: form.head_external_id || null,
      is_headquarters: form.is_headquarters,
      active: form.active
    }

    await apiUpdateCampus(campusId.value, campusData)
    router.push(`/admin/campus/liste/${campusId.value}`)
  } catch (error: unknown) {
    console.error('Error updating campus:', error)
    submitError.value = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du campus'
  } finally {
    isSubmitting.value = false
  }
}

// Formatage
const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Tabs
const tabs = [
  { id: 'general', label: 'Informations générales', icon: 'info-circle' },
  { id: 'location', label: 'Localisation', icon: 'map-marker-alt' },
  { id: 'contact', label: 'Contact', icon: 'address-card' },
  { id: 'settings', label: 'Paramètres', icon: 'cog' }
]

// Gestion de l'upload d'image
const handleImageUpload = (mediaId: string) => {
  form.cover_image_external_id = mediaId
}

const handleImageRemove = () => {
  form.cover_image_external_id = null
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex items-center justify-center py-16">
    <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-blue-600" />
  </div>

  <div v-else-if="originalCampus" class="space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Modifier le campus
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ originalCampus.name }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="goBack"
        >
          Annuler
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          @click="submitForm"
        >
          <font-awesome-icon v-if="isSubmitting" :icon="['fas', 'spinner']" class="animate-spin" />
          <font-awesome-icon v-else :icon="['fas', 'save']" />
          Enregistrer
        </button>
      </div>
    </div>

    <!-- Métadonnées -->
    <div class="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:bg-gray-800/50 dark:text-gray-400">
      <div class="flex flex-wrap gap-6">
        <span>
          <font-awesome-icon :icon="['fas', 'calendar-plus']" class="mr-2" />
          Créé le {{ formatDateTime(originalCampus.created_at) }}
        </span>
        <span>
          <font-awesome-icon :icon="['fas', 'calendar-check']" class="mr-2" />
          Modifié le {{ formatDateTime(originalCampus.updated_at) }}
        </span>
      </div>
    </div>

    <!-- Onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex gap-4">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
          @click="activeTab = tab.id as typeof activeTab"
        >
          <font-awesome-icon :icon="['fas', tab.icon]" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <!-- Tab: Informations générales -->
      <div v-show="activeTab === 'general'" class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Code -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.code"
              type="text"
              maxlength="20"
              placeholder="ex: ALX, DKR"
              :class="[
                'w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-1',
                errors.code
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
              ]"
            />
            <p v-if="errors.code" class="mt-1 text-sm text-red-500">{{ errors.code }}</p>
            <p class="mt-1 text-xs text-gray-500">Code unique pour identifier le campus (max 20 caractères)</p>
          </div>

          <!-- Nom -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Campus de..."
              :class="[
                'w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-1',
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
              ]"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Description du campus..."
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        <!-- Image de couverture -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Image de couverture
          </label>
          <FormsImageUpload
            :model-value="form.cover_image_external_id || undefined"
            label="Image de couverture"
            :preview-url="form.cover_image_external_id ? getMediaUrl(form.cover_image_external_id) ?? undefined : undefined"
            @update:model-value="handleImageUpload"
            @remove="handleImageRemove"
          />
        </div>
      </div>

      <!-- Tab: Localisation -->
      <div v-show="activeTab === 'location'" class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Pays -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pays <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.country_external_id"
              :class="[
                'w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-1',
                errors.country_external_id
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
              ]"
            >
              <option value="">Sélectionner un pays</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ getFlagEmoji(country.iso_code) }} {{ country.name_fr }}
              </option>
            </select>
            <p v-if="errors.country_external_id" class="mt-1 text-sm text-red-500">{{ errors.country_external_id }}</p>
          </div>

          <!-- Ville -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ville <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.city"
              type="text"
              placeholder="Nom de la ville"
              :class="[
                'w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-1',
                errors.city
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
              ]"
            />
            <p v-if="errors.city" class="mt-1 text-sm text-red-500">{{ errors.city }}</p>
          </div>
        </div>

        <!-- Adresse -->
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse
            </label>
            <input
              v-model="form.address"
              type="text"
              placeholder="Adresse complète"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Code postal
            </label>
            <input
              v-model="form.postal_code"
              type="text"
              placeholder="Code postal"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        <!-- Coordonnées GPS -->
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Latitude
            </label>
            <input
              v-model.number="form.latitude"
              type="number"
              step="0.0001"
              placeholder="ex: 31.0183"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Longitude
            </label>
            <input
              v-model.number="form.longitude"
              type="number"
              step="0.0001"
              placeholder="ex: 29.7614"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        <p class="text-sm text-gray-500">
          Les coordonnées GPS permettent d'afficher le campus sur une carte.
        </p>
      </div>

      <!-- Tab: Contact -->
      <div v-show="activeTab === 'contact'" class="space-y-6">
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Email -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              placeholder="campus@usenghor.org"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <!-- Téléphone -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Téléphone
            </label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="+XX X XXX XXXX"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        <!-- Responsable -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Responsable / Directeur
          </label>
          <select
            v-model="form.head_external_id"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="">Aucun responsable assigné</option>
            <option v-for="candidate in headCandidates" :key="candidate.id" :value="candidate.id">
              {{ candidate.name }} ({{ candidate.email }})
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500">Le responsable sera affiché sur la page du campus.</p>
          <p v-if="usersLoadError" class="mt-2 text-xs text-red-600 dark:text-red-400">
            <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-1" />
            Erreur : {{ usersLoadError }}
          </p>
          <p v-else-if="headCandidates.length === 0 && !isLoadingData" class="mt-2 text-xs text-amber-600 dark:text-amber-400">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-1" />
            Aucun utilisateur actif trouvé.
          </p>
        </div>
      </div>

      <!-- Tab: Paramètres -->
      <div v-show="activeTab === 'settings'" class="space-y-6">
        <!-- Siège -->
        <div class="flex items-start gap-4">
          <input
            id="is_headquarters"
            v-model="form.is_headquarters"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label for="is_headquarters" class="block font-medium text-gray-700 dark:text-gray-300">
              Campus siège
            </label>
            <p class="text-sm text-gray-500">
              Cochez si ce campus est le siège principal de l'université. Un seul campus peut être marqué comme siège.
            </p>
          </div>
        </div>

        <!-- Actif -->
        <div class="flex items-start gap-4">
          <input
            id="active"
            v-model="form.active"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label for="active" class="block font-medium text-gray-700 dark:text-gray-300">
              Campus actif
            </label>
            <p class="text-sm text-gray-500">
              Les campus inactifs ne sont pas affichés sur le site public.
            </p>
          </div>
        </div>
      </div>

      <!-- Erreur de soumission -->
      <div v-if="submitError" class="mt-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
        {{ submitError }}
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-2">
      <button
        type="button"
        class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="goBack"
      >
        Annuler
      </button>
      <button
        type="button"
        :disabled="isSubmitting"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        @click="submitForm"
      >
        <font-awesome-icon v-if="isSubmitting" :icon="['fas', 'spinner']" class="animate-spin" />
        <font-awesome-icon v-else :icon="['fas', 'save']" />
        Enregistrer
      </button>
    </div>
  </div>

  <!-- 404 - Campus non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-16">
    <font-awesome-icon :icon="['fas', 'university']" class="h-16 w-16 text-gray-300 dark:text-gray-600" />
    <h1 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Campus non trouvé</h1>
    <p class="mt-2 text-gray-500 dark:text-gray-400">
      Le campus demandé n'existe pas ou a été supprimé.
    </p>
    <NuxtLink
      to="/admin/campus/liste"
      class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
      Retour à la liste
    </NuxtLink>
  </div>
</template>
