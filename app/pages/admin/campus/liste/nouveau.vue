<script setup lang="ts">
import type { CountryRead } from '~/composables/useCountriesApi'
import type { OutputData } from '@editorjs/editorjs'
import type { ImageVariants } from '~/types/api'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()

// APIs
const { createCampus } = useCampusApi()
const { getAllCountriesPublic, getFlagEmoji } = useCountriesApi()
const { apiFetch } = useApi()
const { uploadMediaVariants } = useMediaApi()

// Données de référence
const countries = ref<CountryRead[]>([])
const isLoadingData = ref(true)
const usersLoadError = ref<string | null>(null)

// Candidats responsables (utilisateurs) - même pattern que departements
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

// Charger les données au montage
onMounted(async () => {
  await Promise.all([
    getAllCountriesPublic().then(data => countries.value = data).catch(console.error),
    loadHeadCandidates(),
  ])
  isLoadingData.value = false
})

// État du formulaire
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const activeTab = ref<'general' | 'location' | 'contact' | 'settings'>('general')

// Données du formulaire (alignées sur le schéma backend)
const form = reactive({
  code: '',
  name: '',
  description: undefined as OutputData | undefined,
  cover_image: '', // URL d'aperçu local
  cover_image_external_id: null as string | null,
  country_external_id: '',
  city: '',
  address: '',
  postal_code: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  email: '',
  phone: '',
  head_external_id: '',
  is_headquarters: false,
  active: true,
})

// État pour l'éditeur d'image de couverture
const showCoverEditor = ref(false)
const pendingCoverFile = ref<File | null>(null)
const isUploadingCover = ref(false)

function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    // Stocker le fichier et ouvrir l'éditeur
    pendingCoverFile.value = input.files[0]
    showCoverEditor.value = true
    input.value = ''
  }
}

function cancelCoverEditor() {
  showCoverEditor.value = false
  pendingCoverFile.value = null
}

async function saveEditedCover(variants: ImageVariants) {
  showCoverEditor.value = false
  isUploadingCover.value = true

  try {
    // Extraire le nom de base du fichier original
    const originalName = pendingCoverFile.value?.name || 'cover.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    // Upload les 3 versions (low, medium, original)
    const response = await uploadMediaVariants(variants, baseName, { folder: 'campuses/covers' })

    // Stocker l'ID de l'original (les autres URLs sont déduites par convention)
    form.cover_image_external_id = response.original.id
    // Créer un aperçu local temporaire avec la version medium
    form.cover_image = URL.createObjectURL(variants.medium)
  }
  catch (err) {
    console.error('Erreur upload image de couverture:', err)
  }
  finally {
    isUploadingCover.value = false
    pendingCoverFile.value = null
  }
}

function removeCoverImage() {
  form.cover_image = ''
  form.cover_image_external_id = null
}

// Validation
const errors = reactive({
  code: '',
  name: '',
  country_external_id: '',
  city: '',
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
  }
  else if (form.code.length > 20) {
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

// Auto-générer le code à partir du nom
const autoGenerateCode = () => {
  if (!form.code && form.name) {
    // Prendre les 3 premières lettres significatives
    const words = form.name.replace(/Campus (de |d')?/i, '').trim().split(/\s+/)
    if (words.length > 0) {
      form.code = words[0].substring(0, 3).toUpperCase()
    }
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
    }
    else if (errors.country_external_id || errors.city) {
      activeTab.value = 'location'
    }
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    // Convertir les OutputData en JSON string pour l'API
    const descriptionJson = form.description && form.description.blocks?.length
      ? JSON.stringify(form.description)
      : undefined

    const campusData = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: descriptionJson,
      cover_image_external_id: form.cover_image_external_id || undefined,
      country_external_id: form.country_external_id || undefined,
      head_external_id: form.head_external_id || undefined,
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      postal_code: form.postal_code.trim() || undefined,
      latitude: form.latitude,
      longitude: form.longitude,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      is_headquarters: form.is_headquarters,
      active: form.active,
    }

    await createCampus(campusData)
    router.push('/admin/campus/liste')
  }
  catch (error: unknown) {
    console.error('Error creating campus:', error)
    submitError.value = error instanceof Error ? error.message : 'Erreur lors de la création du campus'
  }
  finally {
    isSubmitting.value = false
  }
}

// Tabs
const tabs = [
  { id: 'general', label: 'Informations générales', icon: 'info-circle' },
  { id: 'location', label: 'Localisation', icon: 'map-marker-alt' },
  { id: 'contact', label: 'Contact', icon: 'address-card' },
  { id: 'settings', label: 'Paramètres', icon: 'cog' },
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

    <!-- Message d'erreur -->
    <div v-if="submitError" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
        <span>{{ submitError }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoadingData" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <template v-else>
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
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
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
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700',
                ]"
              />
              <p v-if="errors.code" class="mt-1 text-sm text-red-500">
                {{ errors.code }}
              </p>
              <p class="mt-1 text-xs text-gray-500">
                Code unique pour identifier le campus (max 20 caractères)
              </p>
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
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700',
                ]"
                @blur="autoGenerateCode"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-500">
                {{ errors.name }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <ClientOnly>
              <EditorJS
                v-model="form.description"
                placeholder="Description du campus..."
                :min-height="150"
              />
            </ClientOnly>
          </div>

          <!-- Image de couverture -->
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image de couverture
            </label>
            <!-- Loading state -->
            <div
              v-if="isUploadingCover"
              class="mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
            >
              <div class="text-center">
                <font-awesome-icon :icon="['fas', 'spinner']" class="mb-2 h-8 w-8 animate-spin text-blue-500" />
                <p class="text-sm text-gray-500 dark:text-gray-400">Téléversement en cours...</p>
              </div>
            </div>
            <!-- Image preview -->
            <div
              v-else-if="form.cover_image"
              class="relative mb-4"
            >
              <img
                :src="form.cover_image"
                alt="Image de couverture"
                class="h-48 w-full rounded-lg object-cover"
              />
              <button
                type="button"
                class="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white transition-colors hover:bg-red-700"
                @click="removeCoverImage"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" class="h-4 w-4" />
              </button>
            </div>
            <div class="flex items-center gap-4">
              <label
                class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                :class="{ 'pointer-events-none opacity-50': isUploadingCover }"
              >
                <font-awesome-icon :icon="['fas', 'upload']" class="h-4 w-4" />
                Télécharger une image
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  :disabled="isUploadingCover"
                  @change="handleCoverImageUpload"
                />
              </label>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Image principale affichée sur la page du campus
              </span>
            </div>
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
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700',
                ]"
              >
                <option value="">
                  Sélectionner un pays
                </option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ getFlagEmoji(country.iso_code) }} {{ country.name_fr }}
                </option>
              </select>
              <p v-if="errors.country_external_id" class="mt-1 text-sm text-red-500">
                {{ errors.country_external_id }}
              </p>
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
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700',
                ]"
              />
              <p v-if="errors.city" class="mt-1 text-sm text-red-500">
                {{ errors.city }}
              </p>
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
              <option value="">
                Aucun responsable assigné
              </option>
              <option v-for="candidate in headCandidates" :key="candidate.id" :value="candidate.id">
                {{ candidate.name }} ({{ candidate.email }})
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Le responsable sera affiché sur la page du campus.
            </p>
            <p v-if="usersLoadError" class="mt-2 text-xs text-red-600 dark:text-red-400">
              <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-1" />
              Erreur : {{ usersLoadError }}
            </p>
            <p v-else-if="headCandidates.length === 0 && !isLoadingData" class="mt-2 text-xs text-amber-600 dark:text-amber-400">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mr-1" />
              Aucun utilisateur actif trouvé. Créez d'abord des utilisateurs.
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
    </template>

    <!-- Image Editor Modal for Cover Image -->
    <Teleport to="body">
      <div
        v-if="showCoverEditor && pendingCoverFile"
        class="fixed inset-0 z-50 overflow-y-auto"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/70 transition-opacity" />
          <div class="relative w-full max-w-4xl transform transition-all">
            <MediaImageEditor
              :image-file="pendingCoverFile"
              :aspect-ratio="16/9"
              @save="saveEditedCover"
              @cancel="cancelCoverEditor"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
