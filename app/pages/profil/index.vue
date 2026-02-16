<script setup>
import { useAuthStore } from '~/stores/auth'
import { roleColors } from '~/composables/useUsersApi'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

// === COMPOSABLES ===
const authStore = useAuthStore()
const router = useRouter()
const { apiFetch } = useApi()
const { getUserProfile } = usePublicUserApi()
const { getCountriesForSelect, getFlagEmoji } = useCountriesApi()
const { uploadMediaVariants, getMediaUrl } = useMediaApi()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const enrichedProfile = ref(null)
const countriesList = ref([])

const editingSection = ref(null)

// === FORMULAIRES ===
const personalForm = ref({
  salutation: null,
  last_name: '',
  first_name: '',
  birth_date: '',
  nationality_external_id: null,
})

const contactForm = ref({
  phone: '',
  phone_whatsapp: '',
  city: '',
  address: '',
  linkedin: '',
  facebook: '',
})

const biographyData = ref({ time: Date.now(), blocks: [], version: '2.28.0' })
const showBiographyModal = ref(false)

const securityForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

// Photo
const pendingPhotoFile = ref(null)
const showPhotoEditor = ref(false)
const isUploadingPhoto = ref(false)

// Options civilité
const salutationOptions = [
  { value: null, label: 'Non spécifié' },
  { value: 'M.', label: 'M.' },
  { value: 'Mme', label: 'Mme' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Pr.', label: 'Pr.' },
]

// === COMPUTED ===
const user = computed(() => authStore.user)

const userInitials = computed(() => {
  const first = user.value?.first_name?.charAt(0) || ''
  const last = user.value?.last_name?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
})

const photoUrl = computed(() => {
  if (enrichedProfile.value?.photo_url) {
    return enrichedProfile.value.photo_url
  }
  if (user.value?.photo_external_id) {
    return getMediaUrl(user.value.photo_external_id)
  }
  return null
})

const fullName = computed(() => {
  if (!user.value) return 'Utilisateur'
  const parts = []
  if (user.value.salutation) parts.push(user.value.salutation)
  parts.push(user.value.first_name || '')
  parts.push(user.value.last_name || '')
  return parts.join(' ').trim() || 'Utilisateur'
})

const isSecurityValid = computed(() => {
  const { current_password, new_password, confirm_password } = securityForm.value
  if (!current_password || !new_password || !confirm_password) return false
  if (new_password !== confirm_password) return false
  if (new_password.length < 8) return false
  return true
})

const passwordErrors = computed(() => {
  const errors = []
  const { new_password, confirm_password } = securityForm.value
  if (new_password && new_password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  if (new_password && confirm_password && new_password !== confirm_password) {
    errors.push('Les mots de passe ne correspondent pas')
  }
  return errors
})

const isPersonalValid = computed(() => {
  return personalForm.value.first_name.trim() && personalForm.value.last_name.trim()
})

const nationalityName = computed(() => {
  return enrichedProfile.value?.nationality_country_name_fr || null
})

const nationalityIsoCode = computed(() => {
  return enrichedProfile.value?.nationality_country_iso_code || null
})

// === CHARGEMENT ===
async function loadAllData() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.fetchCurrentUser()

    if (!user.value) {
      errorMessage.value = 'Impossible de charger les données du profil'
      return
    }

    const [profileData, countries] = await Promise.all([
      getUserProfile(user.value.id).catch(() => null),
      getCountriesForSelect().catch(() => []),
    ])

    enrichedProfile.value = profileData
    countriesList.value = countries
  }
  catch {
    errorMessage.value = 'Erreur lors du chargement des données'
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadAllData()
})

// === MESSAGES ===
function showSuccess(message) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

// === SECTION ÉDITION ===
function startEditing(section) {
  clearMessages()
  editingSection.value = section

  if (section === 'personal') {
    personalForm.value = {
      salutation: user.value?.salutation || null,
      last_name: user.value?.last_name || '',
      first_name: user.value?.first_name || '',
      birth_date: user.value?.birth_date || '',
      nationality_external_id: user.value?.nationality_external_id || null,
    }
  }
  else if (section === 'contact') {
    contactForm.value = {
      phone: user.value?.phone || '',
      phone_whatsapp: user.value?.phone_whatsapp || '',
      city: user.value?.city || '',
      address: user.value?.address || '',
      linkedin: user.value?.linkedin || '',
      facebook: user.value?.facebook || '',
    }
  }
  else if (section === 'biography') {
    const bio = user.value?.biography
    if (bio) {
      try {
        const parsed = JSON.parse(bio)
        if (parsed && Array.isArray(parsed.blocks)) {
          biographyData.value = parsed
        }
        else {
          biographyData.value = { time: Date.now(), blocks: [], version: '2.28.0' }
        }
      }
      catch {
        biographyData.value = {
          time: Date.now(),
          blocks: bio.trim() ? [{ id: '1', type: 'paragraph', data: { text: bio } }] : [],
          version: '2.28.0',
        }
      }
    }
    else {
      biographyData.value = { time: Date.now(), blocks: [], version: '2.28.0' }
    }
    showBiographyModal.value = true
  }
  else if (section === 'security') {
    securityForm.value = { current_password: '', new_password: '', confirm_password: '' }
  }
}

function cancelEditing() {
  editingSection.value = null
  showBiographyModal.value = false
  clearMessages()
}

// === SAUVEGARDE PROFIL ===
async function savePersonal() {
  if (!isPersonalValid.value) return
  isSaving.value = true
  clearMessages()
  try {
    await apiFetch('/api/auth/me', {
      method: 'PUT',
      body: {
        salutation: personalForm.value.salutation,
        last_name: personalForm.value.last_name,
        first_name: personalForm.value.first_name,
        birth_date: personalForm.value.birth_date || null,
        nationality_external_id: personalForm.value.nationality_external_id,
      },
    })
    await refreshData()
    editingSection.value = null
    showSuccess('Informations personnelles mises à jour')
  }
  catch (e) {
    // @ts-expect-error fetch error shape
    errorMessage.value = e?.data?.detail || 'Erreur lors de la mise à jour'
  }
  finally {
    isSaving.value = false
  }
}

async function saveContact() {
  isSaving.value = true
  clearMessages()
  try {
    await apiFetch('/api/auth/me', {
      method: 'PUT',
      body: {
        phone: contactForm.value.phone || null,
        phone_whatsapp: contactForm.value.phone_whatsapp || null,
        city: contactForm.value.city || null,
        address: contactForm.value.address || null,
        linkedin: contactForm.value.linkedin || null,
        facebook: contactForm.value.facebook || null,
      },
    })
    await refreshData()
    editingSection.value = null
    showSuccess('Coordonnées mises à jour')
  }
  catch (e) {
    // @ts-expect-error fetch error shape
    errorMessage.value = e?.data?.detail || 'Erreur lors de la mise à jour'
  }
  finally {
    isSaving.value = false
  }
}

async function saveBiography() {
  isSaving.value = true
  clearMessages()
  try {
    await apiFetch('/api/auth/me', {
      method: 'PUT',
      body: {
        biography: JSON.stringify(biographyData.value),
      },
    })
    await refreshData()
    editingSection.value = null
    showBiographyModal.value = false
    showSuccess('Biographie mise à jour')
  }
  catch (e) {
    // @ts-expect-error fetch error shape
    errorMessage.value = e?.data?.detail || 'Erreur lors de la mise à jour'
  }
  finally {
    isSaving.value = false
  }
}

async function savePassword() {
  if (!isSecurityValid.value) return
  isSaving.value = true
  clearMessages()
  try {
    await apiFetch('/api/auth/me/password', {
      method: 'PUT',
      body: {
        current_password: securityForm.value.current_password,
        new_password: securityForm.value.new_password,
      },
    })
    securityForm.value = { current_password: '', new_password: '', confirm_password: '' }
    editingSection.value = null
    showSuccess('Mot de passe modifié avec succès')
  }
  catch (e) {
    // @ts-expect-error fetch error shape
    errorMessage.value = e?.data?.detail || 'Erreur lors du changement de mot de passe'
  }
  finally {
    isSaving.value = false
  }
}

// === PHOTO ===
function handlePhotoUpload(event) {
  const input = event.target
  const file = input.files?.[0]
  if (!file) return
  pendingPhotoFile.value = file
  showPhotoEditor.value = true
  input.value = ''
}

async function saveEditedPhoto(variants) {
  isUploadingPhoto.value = true
  clearMessages()
  try {
    const originalName = pendingPhotoFile.value?.name || 'avatar.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '')

    const response = await uploadMediaVariants(variants, baseName, {
      folder: 'users/avatars',
    })

    await apiFetch('/api/auth/me', {
      method: 'PUT',
      body: {
        photo_external_id: response.original.id,
      },
    })

    showPhotoEditor.value = false
    pendingPhotoFile.value = null
    await refreshData()
    showSuccess('Photo de profil mise à jour')
  }
  catch {
    errorMessage.value = 'Erreur lors de l\'upload de la photo'
  }
  finally {
    isUploadingPhoto.value = false
  }
}

function cancelPhotoEditor() {
  showPhotoEditor.value = false
  pendingPhotoFile.value = null
}

async function removePhoto() {
  isUploadingPhoto.value = true
  clearMessages()
  try {
    await apiFetch('/api/auth/me', {
      method: 'PUT',
      body: {
        photo_external_id: null,
      },
    })
    await refreshData()
    showSuccess('Photo de profil supprimée')
  }
  catch {
    errorMessage.value = 'Erreur lors de la suppression de la photo'
  }
  finally {
    isUploadingPhoto.value = false
  }
}

// === RAFRAÎCHISSEMENT ===
async function refreshData() {
  await authStore.fetchCurrentUser()
  if (user.value) {
    enrichedProfile.value = await getUserProfile(user.value.id).catch(() => null)
  }
}

// === DÉCONNEXION ===
function handleLogout() {
  authStore.logout()
  router.push('/admin/login')
}

// === HELPERS ===
function parseBiography(bio) {
  if (!bio) return null
  try {
    const parsed = JSON.parse(bio)
    if (parsed && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
      return parsed
    }
  }
  catch {
    if (bio.trim()) {
      return {
        time: Date.now(),
        blocks: [{ id: '1', type: 'paragraph', data: { text: bio } }],
        version: '2.28.0',
      }
    }
  }
  return null
}

const parsedBiography = computed(() => parseBiography(user.value?.biography))

function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  catch {
    return dateStr
  }
}

function getRoleColor(code) {
  return roleColors[code] || roleColors.viewer
}

const campusColors = {
  ALX: 'bg-brand-red-500',
  ABJ: 'bg-orange-500',
  DKR: 'bg-emerald-500',
  YAO: 'bg-blue-500',
  LBV: 'bg-purple-500',
  TNR: 'bg-pink-500',
  RBA: 'bg-cyan-500',
}

function getCampusBadgeColor(code) {
  return campusColors[code] || 'bg-gray-500'
}
</script>

<template>
  <div>
    <!-- Hero gradient header -->
    <div class="relative overflow-hidden bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-950 pb-32 pt-28">
      <!-- Éléments décoratifs -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-brand-blue-500/20 blur-3xl" />
        <div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-red-500/10 blur-3xl" />
        <div class="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-blue-400/10 blur-3xl" />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="relative z-10 flex items-center justify-center py-16">
        <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-white/60" />
      </div>

      <!-- Contenu hero -->
      <div v-else-if="user" class="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <div class="flex flex-col items-center text-center">
          <!-- Avatar -->
          <div class="relative mb-4">
            <div
              v-if="photoUrl"
              class="h-28 w-28 overflow-hidden rounded-2xl ring-4 ring-white/20 sm:h-32 sm:w-32"
            >
              <img :src="photoUrl" :alt="fullName" class="h-full w-full object-cover">
            </div>
            <div
              v-else
              class="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/20 ring-4 ring-white/10 sm:h-32 sm:w-32"
            >
              <span class="text-4xl font-bold text-white">{{ userInitials }}</span>
            </div>

            <!-- Bouton supprimer photo -->
            <button
              v-if="photoUrl && !isUploadingPhoto"
              type="button"
              class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
              title="Supprimer la photo"
              @click="removePhoto"
            >
              <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
            </button>
          </div>

          <!-- Nom et email -->
          <h1 class="text-2xl font-bold text-white sm:text-3xl">
            {{ fullName }}
          </h1>
          <p class="mt-1 text-sm text-white/70">
            {{ user.email }}
          </p>

          <!-- Badges rôles -->
          <div v-if="user.roles && user.roles.length" class="mt-3 flex flex-wrap justify-center gap-2">
            <span
              v-for="role in user.roles"
              :key="role.id"
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="getRoleColor(role.code)"
            >
              {{ role.name_fr }}
            </span>
          </div>

          <!-- Actions photo + déconnexion -->
          <div class="mt-4 flex items-center gap-3">
            <label
              class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/25"
              :class="{ 'pointer-events-none opacity-50': isUploadingPhoto }"
            >
              <font-awesome-icon
                :icon="isUploadingPhoto ? ['fas', 'spinner'] : ['fas', 'camera']"
                :class="['h-4 w-4', { 'animate-spin': isUploadingPhoto }]"
              />
              {{ isUploadingPhoto ? 'Téléversement...' : 'Modifier la photo' }}
              <input
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="isUploadingPhoto"
                @change="handlePhotoUpload"
              >
            </label>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
              @click="handleLogout"
            >
              <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal (cards qui chevauchent le hero) -->
    <div class="relative z-20 mx-auto -mt-20 max-w-4xl px-4 pb-16 sm:px-6">
      <!-- Messages flottants -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="successMessage"
          class="mb-6 flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-800 shadow-lg dark:bg-green-900/30 dark:text-green-300"
        >
          <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5" />
          {{ successMessage }}
        </div>
      </Transition>

      <div
        v-if="errorMessage"
        class="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-800 shadow-lg dark:bg-red-900/30 dark:text-red-300"
      >
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="h-5 w-5" />
        {{ errorMessage }}
      </div>

      <template v-if="!isLoading && user">
        <div class="space-y-6">
          <!-- ===== INFORMATIONS PERSONNELLES ===== -->
          <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700/50 dark:bg-gray-900/95">
            <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue-50 dark:bg-brand-blue-900/30">
                  <font-awesome-icon :icon="['fas', 'user']" class="h-4 w-4 text-brand-blue-500" />
                </div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                  Informations personnelles
                </h2>
              </div>
              <button
                v-if="editingSection !== 'personal'"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand-blue-600 transition hover:bg-brand-blue-50 dark:text-brand-blue-400 dark:hover:bg-brand-blue-900/20"
                @click="startEditing('personal')"
              >
                <font-awesome-icon :icon="['fas', 'pen']" class="h-3 w-3" />
                Modifier
              </button>
            </div>

            <!-- Mode lecture -->
            <div v-if="editingSection !== 'personal'" class="p-6">
              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Civilité</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ user.salutation || '-' }}</p>
                </div>
                <div />
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Prénom</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ user.first_name }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Nom</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ user.last_name }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Date de naissance</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ formatDate(user.birth_date) }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Nationalité</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">
                    <template v-if="nationalityName">
                      {{ getFlagEmoji(nationalityIsoCode || '') }} {{ nationalityName }}
                    </template>
                    <template v-else>-</template>
                  </p>
                </div>
              </div>
            </div>

            <!-- Mode édition -->
            <form v-else class="p-6" @submit.prevent="savePersonal">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Civilité</label>
                  <select
                    v-model="personalForm.salutation"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                    <option v-for="opt in salutationOptions" :key="String(opt.value)" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <div />
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prénom <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="personalForm.first_name"
                    type="text"
                    required
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="personalForm.last_name"
                    type="text"
                    required
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
                  <input
                    v-model="personalForm.birth_date"
                    type="date"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Nationalité</label>
                  <select
                    v-model="personalForm.nationality_external_id"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                    <option :value="null">Non spécifié</option>
                    <option v-for="country in countriesList" :key="country.id" :value="country.id">
                      {{ getFlagEmoji(country.iso_code) }} {{ country.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  :disabled="isSaving"
                  @click="cancelEditing"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-xl bg-brand-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:bg-brand-blue-600 disabled:opacity-50"
                  :disabled="!isPersonalValid || isSaving"
                >
                  <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>

          <!-- ===== COORDONNÉES ===== -->
          <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700/50 dark:bg-gray-900/95">
            <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                  <font-awesome-icon :icon="['fas', 'address-book']" class="h-4 w-4 text-emerald-500" />
                </div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                  Coordonnées
                </h2>
              </div>
              <button
                v-if="editingSection !== 'contact'"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand-blue-600 transition hover:bg-brand-blue-50 dark:text-brand-blue-400 dark:hover:bg-brand-blue-900/20"
                @click="startEditing('contact')"
              >
                <font-awesome-icon :icon="['fas', 'pen']" class="h-3 w-3" />
                Modifier
              </button>
            </div>

            <!-- Mode lecture -->
            <div v-if="editingSection !== 'contact'" class="p-6">
              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Téléphone</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ user.phone || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">WhatsApp</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ user.phone_whatsapp || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Ville</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ user.city || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Adresse</p>
                  <p class="mt-0.5 text-sm text-gray-900 dark:text-white">{{ user.address || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">LinkedIn</p>
                  <p class="mt-0.5 text-sm">
                    <a
                      v-if="user.linkedin"
                      :href="user.linkedin"
                      target="_blank"
                      class="text-brand-blue-600 hover:underline dark:text-brand-blue-400"
                    >
                      <font-awesome-icon :icon="['fab', 'linkedin']" class="mr-1 h-3.5 w-3.5" />
                      Profil LinkedIn
                    </a>
                    <span v-else class="text-gray-900 dark:text-white">-</span>
                  </p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 dark:text-gray-500">Facebook</p>
                  <p class="mt-0.5 text-sm">
                    <a
                      v-if="user.facebook"
                      :href="user.facebook"
                      target="_blank"
                      class="text-brand-blue-600 hover:underline dark:text-brand-blue-400"
                    >
                      <font-awesome-icon :icon="['fab', 'facebook']" class="mr-1 h-3.5 w-3.5" />
                      Profil Facebook
                    </a>
                    <span v-else class="text-gray-900 dark:text-white">-</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Mode édition -->
            <form v-else class="p-6" @submit.prevent="saveContact">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <input
                    v-model="contactForm.phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
                  <input
                    v-model="contactForm.phone_whatsapp"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
                  <input
                    v-model="contactForm.city"
                    type="text"
                    placeholder="Alexandrie"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
                  <input
                    v-model="contactForm.address"
                    type="text"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <font-awesome-icon :icon="['fab', 'linkedin']" class="mr-1 text-[#0A66C2]" />
                    LinkedIn
                  </label>
                  <input
                    v-model="contactForm.linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <font-awesome-icon :icon="['fab', 'facebook']" class="mr-1 text-[#1877F2]" />
                    Facebook
                  </label>
                  <input
                    v-model="contactForm.facebook"
                    type="url"
                    placeholder="https://facebook.com/..."
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
              </div>
              <div class="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  :disabled="isSaving"
                  @click="cancelEditing"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-xl bg-brand-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:bg-brand-blue-600 disabled:opacity-50"
                  :disabled="isSaving"
                >
                  <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>

          <!-- ===== BIOGRAPHIE ===== -->
          <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700/50 dark:bg-gray-900/95">
            <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                  <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4 text-indigo-500" />
                </div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                  Biographie
                </h2>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand-blue-600 transition hover:bg-brand-blue-50 dark:text-brand-blue-400 dark:hover:bg-brand-blue-900/20"
                @click="startEditing('biography')"
              >
                <font-awesome-icon :icon="['fas', 'pen']" class="h-3 w-3" />
                Modifier
              </button>
            </div>

            <div class="p-6">
              <ClientOnly>
                <EditorJSRenderer v-if="parsedBiography" :data="parsedBiography" />
                <template #fallback>
                  <div class="h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </template>
              </ClientOnly>
              <p v-if="!parsedBiography" class="text-sm italic text-gray-400 dark:text-gray-500">
                Aucune biographie renseignée. Cliquez sur Modifier pour en ajouter une.
              </p>
            </div>
          </div>

          <!-- ===== SÉCURITÉ ===== -->
          <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700/50 dark:bg-gray-900/95">
            <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
                  <font-awesome-icon :icon="['fas', 'lock']" class="h-4 w-4 text-amber-500" />
                </div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                  Sécurité
                </h2>
              </div>
              <button
                v-if="editingSection !== 'security'"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-brand-blue-600 transition hover:bg-brand-blue-50 dark:text-brand-blue-400 dark:hover:bg-brand-blue-900/20"
                @click="startEditing('security')"
              >
                <font-awesome-icon :icon="['fas', 'key']" class="h-3 w-3" />
                Changer le mot de passe
              </button>
            </div>

            <!-- Mode lecture -->
            <div v-if="editingSection !== 'security'" class="p-6">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                <font-awesome-icon :icon="['fas', 'shield-halved']" class="mr-2 h-4 w-4" />
                Mot de passe défini. Cliquez sur « Changer le mot de passe » pour le modifier.
              </p>
            </div>

            <!-- Mode édition -->
            <form v-else class="p-6" @submit.prevent="savePassword">
              <div class="max-w-md space-y-4">
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe actuel <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="securityForm.current_password"
                    type="password"
                    autocomplete="current-password"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nouveau mot de passe <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="securityForm.new_password"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                  <p class="mt-1 text-xs text-gray-400">Minimum 8 caractères</p>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmer le mot de passe <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="securityForm.confirm_password"
                    type="password"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                  >
                </div>

                <!-- Erreurs mot de passe -->
                <div v-if="passwordErrors.length > 0" class="space-y-1">
                  <p
                    v-for="err in passwordErrors"
                    :key="err"
                    class="text-sm text-red-600 dark:text-red-400"
                  >
                    <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-1 h-3 w-3" />
                    {{ err }}
                  </p>
                </div>
              </div>

              <div class="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  class="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  :disabled="isSaving"
                  @click="cancelEditing"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-2 rounded-xl bg-brand-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:bg-brand-blue-600 disabled:opacity-50"
                  :disabled="!isSecurityValid || isSaving"
                >
                  <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                  Modifier le mot de passe
                </button>
              </div>
            </form>
          </div>

          <!-- ===== AFFILIATIONS (lecture seule) ===== -->
          <div
            v-if="enrichedProfile && (enrichedProfile.campus_affiliations.length > 0 || enrichedProfile.service_affiliations.length > 0)"
            class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700/50 dark:bg-gray-900/95"
          >
            <div class="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
                  <font-awesome-icon :icon="['fas', 'building']" class="h-4 w-4 text-purple-500" />
                </div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                  Affiliations
                </h2>
              </div>
            </div>
            <div class="space-y-5 p-6">
              <!-- Campus -->
              <div v-if="enrichedProfile.campus_affiliations.length > 0">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Campus
                </p>
                <div class="space-y-2">
                  <div
                    v-for="aff in enrichedProfile.campus_affiliations"
                    :key="aff.campus_id"
                    class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50"
                  >
                    <span
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      :class="getCampusBadgeColor(aff.campus_code)"
                    >
                      {{ aff.campus_code }}
                    </span>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ aff.campus_name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ aff.position }}</p>
                    </div>
                    <span
                      v-if="aff.active"
                      class="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Actif
                    </span>
                  </div>
                </div>
              </div>

              <!-- Services -->
              <div v-if="enrichedProfile.service_affiliations.length > 0">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Services
                </p>
                <div class="space-y-2">
                  <div
                    v-for="aff in enrichedProfile.service_affiliations"
                    :key="aff.service_id"
                    class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50"
                  >
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30">
                      <font-awesome-icon :icon="['fas', 'building']" class="h-3.5 w-3.5 text-brand-blue-600 dark:text-brand-blue-400" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ aff.service_name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ aff.position }}</p>
                    </div>
                    <span
                      v-if="aff.active"
                      class="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Actif
                    </span>
                  </div>
                </div>
              </div>

              <p class="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-1" />
                Les affiliations sont gérées par les administrateurs. Contactez votre administrateur pour toute modification.
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modale biographie -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showBiographyModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          @click.self="cancelEditing"
        >
          <div class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
            <!-- En-tête -->
            <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                <font-awesome-icon :icon="['fas', 'pen-to-square']" class="mr-2 h-4 w-4 text-brand-blue-500" />
                Biographie
              </h3>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                @click="cancelEditing"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
              </button>
            </div>
            <!-- Éditeur -->
            <div class="flex-1 overflow-y-auto p-6">
              <ClientOnly>
                <AdminRichTextEditor
                  v-model="biographyData"
                  :show-card="false"
                  placeholder="Quelques mots sur vous..."
                  :min-height="300"
                />
                <template #fallback>
                  <div
                    class="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    style="min-height: 300px"
                  >
                    <font-awesome-icon :icon="['fas', 'spinner']" class="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                </template>
              </ClientOnly>
            </div>
            <!-- Pied de modal -->
            <div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                class="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                :disabled="isSaving"
                @click="cancelEditing"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-brand-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:bg-brand-blue-600 disabled:opacity-50"
                :disabled="isSaving"
                @click="saveBiography"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                <font-awesome-icon v-else :icon="['fas', 'check']" class="h-3.5 w-3.5" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modale éditeur photo -->
    <Teleport to="body">
      <div
        v-if="showPhotoEditor && pendingPhotoFile"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div class="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
          <MediaImageEditor
            :image-file="pendingPhotoFile"
            :aspect-ratio="1"
            :default-low-width="150"
            :default-medium-width="400"
            @save="saveEditedPhoto"
            @cancel="cancelPhotoEditor"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
