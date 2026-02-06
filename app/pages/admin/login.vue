<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

// Si déjà connecté, rediriger
if (authStore.isAuthenticated) {
  router.replace('/admin/candidatures/appels')
}

async function handleLogin() {
  error.value = null
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await router.push('/admin/candidatures/appels')
  } catch (e: unknown) {
    const fetchError = e as { data?: { detail?: string } }
    error.value = fetchError.data?.detail || 'Email ou mot de passe incorrect'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-md">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Administration
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Université Senghor
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
            {{ error }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              placeholder="admin@usenghor.org"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              placeholder="Mot de passe"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>

          <p class="text-center text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?
            <NuxtLink to="/admin/register" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              S'inscrire
            </NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>
