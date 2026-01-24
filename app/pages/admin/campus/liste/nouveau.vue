<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const {
  getCampusCountries,
  getCampusHeadCandidates,
  generateCampusId,
  generateCampusCode,
  getFlagEmoji
} = useMockData()

// Données de référence
const countries = computed(() => getCampusCountries())
const headCandidates = computed(() => getCampusHeadCandidates())

// État du formulaire
const isSubmitting = ref(false)
const activeTab = ref<'general' | 'location' | 'contact' | 'settings'>('general')

// Données du formulaire
const form = reactive({
  code: '',
  name: '',
  description: '',
  cover_image: '',
  cover_image_alt: '',
  country_id: '',
  city: '',
  address: '',
  postal_code: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  email: '',
  phone: '',
  head_id: '',
  is_headquarters: false,
  is_active: true
})

// Validation
const errors = reactive({
  code: '',
  name: '',
  country_id: '',
  city: ''
})

const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.code = ''
  errors.name = ''
  errors.country_id = ''
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

  if (!form.country_id) {
    errors.country_id = 'Le pays est requis'
    isValid = false
  }

  if (!form.city.trim()) {
    errors.city = 'La ville est requise'
    isValid = false
  }

  return isValid
}

// Auto-générer le code à partir du nom
const autoGenerateCode = () => {
  if (!form.code && form.name) {
    form.code = generateCampusCode(form.name)
  }
}

// Navigation
const goBack = () => router.push('/admin/campus/liste')

// Soumission
const submitForm = async () => {
  if (!validateForm()) {
    // Aller à l'onglet avec erreurs
    if (errors.code || errors.name) {
      activeTab.value = 'general'
    } else if (errors.country_id || errors.city) {
      activeTab.value = 'location'
    }
    return
  }

  isSubmitting.value = true

  try {
    const campusData = {
      id: generateCampusId(),
      ...form,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Creating campus:', campusData)
    // En production: POST /api/admin/campuses

    router.push('/admin/campus/liste')
  } catch (error) {
    console.error('Error creating campus:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Tabs
const tabs = [
  { id: 'general', label: 'Informations générales', icon: 'info-circle' },
  { id: 'location', label: 'Localisation', icon: 'map-marker-alt' },
  { id: 'contact', label: 'Contact', icon: 'address-card' },
  { id: 'settings', label: 'Paramètres', icon: 'cog' }
]
</script>

<template>
  <div class="space-y-6">
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
            Nouveau campus
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créer un nouveau campus
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
          Créer le campus
        </button>
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
              @blur="autoGenerateCode"
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
        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture (URL)
            </label>
            <input
              v-model="form.cover_image"
              type="url"
              placeholder="https://..."
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Texte alternatif de l'image
            </label>
            <input
              v-model="form.cover_image_alt"
              type="text"
              placeholder="Description de l'image"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>

        <!-- Aperçu de l'image -->
        <div v-if="form.cover_image" class="mt-4">
          <p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Aperçu</p>
          <img
            :src="form.cover_image"
            :alt="form.cover_image_alt || 'Aperçu'"
            class="h-48 w-full rounded-lg object-cover"
            @error="form.cover_image = ''"
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
              v-model="form.country_id"
              :class="[
                'w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-1',
                errors.country_id
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700'
              ]"
            >
              <option value="">Sélectionner un pays</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ getFlagEmoji(country.code) }} {{ country.name }}
              </option>
            </select>
            <p v-if="errors.country_id" class="mt-1 text-sm text-red-500">{{ errors.country_id }}</p>
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
            v-model="form.head_id"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="">Aucun responsable assigné</option>
            <option v-for="candidate in headCandidates" :key="candidate.id" :value="candidate.id">
              {{ candidate.name }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500">Le responsable sera affiché sur la page du campus.</p>
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
            id="is_active"
            v-model="form.is_active"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label for="is_active" class="block font-medium text-gray-700 dark:text-gray-300">
              Campus actif
            </label>
            <p class="text-sm text-gray-500">
              Les campus inactifs ne sont pas affichés sur le site public.
            </p>
          </div>
        </div>
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
        Créer le campus
      </button>
    </div>
  </div>
</template>
