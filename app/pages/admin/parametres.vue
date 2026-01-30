<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

// === STORES & COMPOSABLES ===
const authStore = useAuthStore()
const { isDark, set: setDarkMode } = useDarkMode()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const activeSection = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Form states
const profileForm = ref({
  first_name: '',
  last_name: '',
  salutation: null as string | null,
  phone: '',
  phone_whatsapp: '',
  linkedin: '',
  city: '',
  address: '',
})

const preferencesForm = ref({
  theme: 'system' as 'light' | 'dark' | 'system',
})

const notificationsForm = ref({
  email_news: true,
  email_events: true,
  email_newsletter: false,
})

const securityForm = ref({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

// Salutation options
const salutationOptions = [
  { value: null, label: 'Non spécifié' },
  { value: 'M.', label: 'M.' },
  { value: 'Mme', label: 'Mme' },
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Pr.', label: 'Pr.' },
]

// === COMPUTED ===
const userEmail = computed(() => authStore.user?.email || 'admin@usenghor.org')

const userInitials = computed(() => {
  const first = profileForm.value.first_name?.charAt(0) || ''
  const last = profileForm.value.last_name?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
})

const isProfileValid = computed(() => {
  return profileForm.value.first_name.trim() && profileForm.value.last_name.trim()
})

const isSecurityValid = computed(() => {
  const { current_password, new_password, confirm_password } = securityForm.value
  if (!current_password || !new_password || !confirm_password) return false
  if (new_password !== confirm_password) return false
  if (new_password.length < 8) return false
  return true
})

const passwordErrors = computed(() => {
  const errors: string[] = []
  const { new_password, confirm_password } = securityForm.value
  if (new_password && new_password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères')
  }
  if (new_password && confirm_password && new_password !== confirm_password) {
    errors.push('Les mots de passe ne correspondent pas')
  }
  return errors
})

// === LIFECYCLE ===
onMounted(async () => {
  await loadUserData()
  loadPreferences()
})

// === METHODS ===
async function loadUserData() {
  isLoading.value = true
  errorMessage.value = null
  try {
    // Récupérer les données depuis l'API (avec fallback cache cookie dans le store)
    if (authStore.token) {
      await authStore.fetchCurrentUser()
    }

    // Le store aura soit les données fraîches de l'API, soit celles du cache cookie
    const user = authStore.user
    if (user) {
      profileForm.value = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        salutation: user.salutation || null,
        phone: user.phone || '',
        phone_whatsapp: user.phone_whatsapp || '',
        linkedin: user.linkedin || '',
        city: user.city || '',
        address: user.address || '',
      }
    }
    else if (!authStore.token) {
      // Pas de token = pas connecté
      errorMessage.value = 'Vous devez être connecté pour accéder à cette page.'
    }
    else {
      // Token présent mais pas de données (backend indisponible et pas de cache)
      errorMessage.value = 'Impossible de charger les données. Connectez-vous à nouveau ou vérifiez que le backend est lancé.'
    }
  }
  catch {
    // Même en cas d'erreur, essayer d'utiliser les données en cache du store
    const user = authStore.user
    if (user) {
      profileForm.value = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        salutation: user.salutation || null,
        phone: user.phone || '',
        phone_whatsapp: user.phone_whatsapp || '',
        linkedin: user.linkedin || '',
        city: user.city || '',
        address: user.address || '',
      }
    }
    else {
      errorMessage.value = 'Erreur lors du chargement des données du profil'
    }
  }
  finally {
    isLoading.value = false
  }
}

function loadPreferences() {
  // Charger depuis localStorage (uniquement côté client)
  if (!import.meta.client) return

  const savedTheme = localStorage.getItem('usenghor-theme-preference')
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    preferencesForm.value.theme = savedTheme
  }

  const savedNotifs = localStorage.getItem('usenghor-notifications')
  if (savedNotifs) {
    try {
      const parsed = JSON.parse(savedNotifs)
      notificationsForm.value = { ...notificationsForm.value, ...parsed }
    }
    catch {
      // Ignore parsing errors
    }
  }
}

function toggleSection(section: string) {
  activeSection.value = activeSection.value === section ? null : section
  clearMessages()
}

function clearMessages() {
  successMessage.value = null
  errorMessage.value = null
}

function showSuccess(message: string) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

// Section-specific save functions
async function saveProfile() {
  isSaving.value = true
  clearMessages()
  try {
    // Appeler l'API backend PUT /api/auth/me
    await $fetch('/api/auth/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        first_name: profileForm.value.first_name,
        last_name: profileForm.value.last_name,
        salutation: profileForm.value.salutation,
        phone: profileForm.value.phone || null,
        phone_whatsapp: profileForm.value.phone_whatsapp || null,
        linkedin: profileForm.value.linkedin || null,
        city: profileForm.value.city || null,
        address: profileForm.value.address || null,
      },
    })

    // Recharger les données utilisateur depuis l'API
    await authStore.fetchCurrentUser()

    showSuccess('Profil mis à jour avec succès')
    activeSection.value = null
  }
  catch (e: unknown) {
    const fetchError = e as { data?: { detail?: string } }
    errorMessage.value = fetchError.data?.detail || 'Erreur lors de la mise à jour du profil'
  }
  finally {
    isSaving.value = false
  }
}

async function savePreferences() {
  isSaving.value = true
  clearMessages()
  try {
    const theme = preferencesForm.value.theme
    localStorage.setItem('usenghor-theme-preference', theme)

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    }
    else {
      setDarkMode(theme === 'dark')
    }

    showSuccess('Préférences enregistrées')
    activeSection.value = null
  }
  catch {
    errorMessage.value = 'Erreur lors de la sauvegarde des préférences'
  }
  finally {
    isSaving.value = false
  }
}

async function saveNotifications() {
  isSaving.value = true
  clearMessages()
  try {
    localStorage.setItem('usenghor-notifications', JSON.stringify(notificationsForm.value))
    showSuccess('Préférences de notifications enregistrées')
    activeSection.value = null
  }
  catch {
    errorMessage.value = 'Erreur lors de la sauvegarde'
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
    // Appeler l'API backend PUT /api/auth/me/password
    await $fetch('/api/auth/me/password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        current_password: securityForm.value.current_password,
        new_password: securityForm.value.new_password,
      },
    })

    showSuccess('Mot de passe modifié avec succès')
    securityForm.value = { current_password: '', new_password: '', confirm_password: '' }
    activeSection.value = null
  }
  catch (e: unknown) {
    const fetchError = e as { data?: { detail?: string } }
    errorMessage.value = fetchError.data?.detail || 'Erreur lors du changement de mot de passe'
  }
  finally {
    isSaving.value = false
  }
}

async function cancelEdit() {
  await loadUserData()
  loadPreferences()
  activeSection.value = null
  clearMessages()
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Paramètres
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Gérez votre profil et vos préférences
      </p>
    </div>

    <!-- Success message -->
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
        class="mb-6 flex items-center gap-3 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      >
        <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5" />
        {{ successMessage }}
      </div>
    </Transition>

    <!-- Error message -->
    <div
      v-if="errorMessage"
      class="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    >
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="h-5 w-5" />
      {{ errorMessage }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Sections -->
      <div class="space-y-4">
        <!-- Profile Section -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('profile')"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30">
                <span class="text-lg font-semibold text-brand-blue-700 dark:text-brand-blue-300">
                  {{ userInitials }}
                </span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Profil
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ profileForm.first_name || 'Prénom' }} {{ profileForm.last_name || 'Nom' }}
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'profile' }"
            />
          </button>

          <div v-if="activeSection === 'profile'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Civilité
                </label>
                <select
                  v-model="profileForm.salutation"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option v-for="option in salutationOptions" :key="String(option.value)" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div />
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prénom *
                </label>
                <input
                  v-model="profileForm.first_name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom *
                </label>
                <input
                  v-model="profileForm.last_name"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div class="md:col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  :value="userEmail"
                  type="email"
                  disabled
                  class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                <p class="mt-1 text-xs text-gray-400">
                  L'email ne peut pas être modifié
                </p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Téléphone
                </label>
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  WhatsApp
                </label>
                <input
                  v-model="profileForm.phone_whatsapp"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  LinkedIn
                </label>
                <input
                  v-model="profileForm.linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ville
                </label>
                <input
                  v-model="profileForm.city"
                  type="text"
                  placeholder="Alexandrie"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div class="md:col-span-2">
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse
                </label>
                <input
                  v-model="profileForm.address"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelEdit"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
                :disabled="!isProfileValid || isSaving"
                @click="saveProfile"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Preferences Section -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('preferences')"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <font-awesome-icon :icon="['fas', 'palette']" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Préférences d'interface
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Thème : {{ preferencesForm.theme === 'system' ? 'Système' : preferencesForm.theme === 'dark' ? 'Sombre' : 'Clair' }}
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'preferences' }"
            />
          </button>

          <div v-if="activeSection === 'preferences'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="space-y-4">
              <div>
                <label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Thème de l'interface
                </label>
                <div class="flex flex-wrap gap-3">
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
                    :class="preferencesForm.theme === 'light'
                      ? 'border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'"
                  >
                    <input
                      v-model="preferencesForm.theme"
                      type="radio"
                      value="light"
                      class="h-4 w-4 text-brand-blue-600"
                    >
                    <font-awesome-icon :icon="['fas', 'sun']" class="h-5 w-5 text-yellow-500" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Clair</span>
                  </label>
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
                    :class="preferencesForm.theme === 'dark'
                      ? 'border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'"
                  >
                    <input
                      v-model="preferencesForm.theme"
                      type="radio"
                      value="dark"
                      class="h-4 w-4 text-brand-blue-600"
                    >
                    <font-awesome-icon :icon="['fas', 'moon']" class="h-5 w-5 text-indigo-500" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Sombre</span>
                  </label>
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
                    :class="preferencesForm.theme === 'system'
                      ? 'border-brand-blue-500 bg-brand-blue-50 dark:bg-brand-blue-900/20'
                      : 'border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'"
                  >
                    <input
                      v-model="preferencesForm.theme"
                      type="radio"
                      value="system"
                      class="h-4 w-4 text-brand-blue-600"
                    >
                    <font-awesome-icon :icon="['fas', 'laptop']" class="h-5 w-5 text-gray-500" />
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Système</span>
                  </label>
                </div>
                <p class="mt-2 text-xs text-gray-400">
                  Le mode Système s'adapte automatiquement aux préférences de votre appareil
                </p>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelEdit"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
                :disabled="isSaving"
                @click="savePreferences"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications Section -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('notifications')"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <font-awesome-icon :icon="['fas', 'bell']" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Gérez vos préférences de notifications par email
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'notifications' }"
            />
          </button>

          <div v-if="activeSection === 'notifications'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="space-y-4">
              <label class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Actualités importantes</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Recevez les annonces et actualités de l'université</p>
                </div>
                <input
                  v-model="notificationsForm.email_news"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500"
                >
              </label>

              <label class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Rappels d'événements</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Recevez des rappels avant les événements auxquels vous êtes inscrit</p>
                </div>
                <input
                  v-model="notificationsForm.email_events"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500"
                >
              </label>

              <label class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700/50">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">Newsletter</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Recevez la newsletter mensuelle de l'université</p>
                </div>
                <input
                  v-model="notificationsForm.email_newsletter"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500"
                >
              </label>

              <p class="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-1" />
                Ces préférences seront appliquées quand le système de notifications sera actif.
              </p>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelEdit"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
                :disabled="isSaving"
                @click="saveNotifications"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            class="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
            @click="toggleSection('security')"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <font-awesome-icon :icon="['fas', 'shield-alt']" class="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">
                  Sécurité
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Modifiez votre mot de passe
                </p>
              </div>
            </div>
            <font-awesome-icon
              :icon="['fas', 'chevron-down']"
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': activeSection === 'security' }"
            />
          </button>

          <div v-if="activeSection === 'security'" class="border-t border-gray-200 p-4 dark:border-gray-700">
            <div class="max-w-md space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe actuel *
                </label>
                <input
                  v-model="securityForm.current_password"
                  type="password"
                  autocomplete="current-password"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nouveau mot de passe *
                </label>
                <input
                  v-model="securityForm.new_password"
                  type="password"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                <p class="mt-1 text-xs text-gray-400">
                  Minimum 8 caractères
                </p>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmer le mot de passe *
                </label>
                <input
                  v-model="securityForm.confirm_password"
                  type="password"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
              </div>

              <!-- Password errors -->
              <div v-if="passwordErrors.length > 0" class="space-y-1">
                <p
                  v-for="error in passwordErrors"
                  :key="error"
                  class="text-sm text-red-600 dark:text-red-400"
                >
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-1 h-3 w-3" />
                  {{ error }}
                </p>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="cancelEdit"
              >
                Annuler
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-700 disabled:opacity-50"
                :disabled="!isSecurityValid || isSaving"
                @click="savePassword"
              >
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                Modifier le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
