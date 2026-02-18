<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

// === STORES & COMPOSABLES ===
const { isDark, set: setDarkMode } = useDarkMode()

// === STATE ===
const isLoading = ref(false)
const isSaving = ref(false)
const activeSection = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const preferencesForm = ref({
  theme: 'system' as 'light' | 'dark' | 'system',
})

const notificationsForm = ref({
  email_news: true,
  email_events: true,
  email_newsletter: false,
})

// === LIFECYCLE ===
onMounted(() => {
  loadPreferences()
})

// === METHODS ===
function loadPreferences() {
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

function cancelEdit() {
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
        Gérez vos préférences d'interface et notifications
      </p>
    </div>

    <!-- Lien vers le profil -->
    <NuxtLink
      to="/profil"
      class="mb-6 flex items-center gap-3 rounded-xl border border-brand-blue-200 bg-brand-blue-50 p-4 transition-colors hover:bg-brand-blue-100 dark:border-brand-blue-800 dark:bg-brand-blue-900/20 dark:hover:bg-brand-blue-900/30"
    >
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-100 dark:bg-brand-blue-900/30">
        <font-awesome-icon :icon="['fas', 'user']" class="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-400" />
      </div>
      <div class="flex-1">
        <p class="font-medium text-brand-blue-900 dark:text-brand-blue-100">Mon profil</p>
        <p class="text-sm text-brand-blue-600 dark:text-brand-blue-400">Modifier mes informations personnelles, photo, biographie et mot de passe</p>
      </div>
      <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-4 w-4 text-brand-blue-400" />
    </NuxtLink>

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
      <div class="space-y-4">
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
                    />
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
                    />
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
                    />
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
                />
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
                />
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
                />
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
      </div>
    </template>
  </div>
</template>
