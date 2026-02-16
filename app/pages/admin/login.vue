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
const error = ref('')
const showPassword = ref(false)

// Rôles avec accès au panneau d'administration
const adminRoleCodes = ['super_admin', 'admin', 'campus_admin', 'editor', 'moderator']

function isAdminUser() {
  const roles = authStore.user?.roles || []
  return roles.some(r => adminRoleCodes.includes(r.code))
}

function getRedirectPath() {
  return isAdminUser() ? '/admin/candidatures/appels' : '/profil'
}

// Si déjà connecté, rediriger
if (authStore.isAuthenticated) {
  router.replace(getRedirectPath())
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await router.push(getRedirectPath())
  }
  catch (e) {
    // @ts-expect-error fetch error shape
    error.value = e?.data?.detail || 'Email ou mot de passe incorrect'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-blue-900 via-brand-blue-800 to-brand-blue-950">
    <!-- Éléments décoratifs d'arrière-plan -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-brand-blue-500/20 blur-3xl" />
      <div class="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-red-500/10 blur-3xl" />
      <div class="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-blue-400/10 blur-3xl" />
    </div>

    <!-- Conteneur principal -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4 lg:p-8">
      <div class="w-full max-w-4xl">
        <div class="overflow-hidden rounded-3xl border border-white/20 shadow-2xl lg:grid lg:grid-cols-12">
          <!-- Panneau gauche : Image + branding (desktop) -->
          <div class="relative hidden lg:col-span-5 lg:block">
            <img
              src="https://picsum.photos/seed/senghor-login/800/1200"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
            >
            <div class="absolute inset-0 bg-gradient-to-b from-brand-blue-900/85 via-brand-blue-800/75 to-brand-blue-900/90 backdrop-blur-[2px]" />
            <div class="relative flex h-full flex-col justify-between p-8">
              <!-- Branding -->
              <div>
                <h1 class="text-2xl font-bold text-white">
                  Université Senghor
                </h1>
                <p class="mt-1 text-sm text-white/60">
                  Espace personnel
                </p>
                <div class="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70 backdrop-blur-sm">
                  <font-awesome-icon :icon="['fas', 'shield-halved']" class="mr-1.5" />
                  Réservé au personnel de l'Université
                </div>
              </div>

              <!-- Message de bienvenue -->
              <div class="space-y-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="h-5 w-5 text-white" />
                </div>
                <h2 class="text-xl font-semibold text-white">
                  Bon retour parmi nous
                </h2>
                <p class="text-sm leading-relaxed text-white/70">
                  Connectez-vous pour accéder à votre espace d'administration.
                </p>
              </div>

              <!-- Lien inscription -->
              <p class="text-sm text-white/50">
                Pas encore de compte ?
                <NuxtLink to="/admin/register" class="text-white/80 underline transition hover:text-white">
                  S'inscrire
                </NuxtLink>
              </p>
            </div>
          </div>

          <!-- Panneau droit : Formulaire -->
          <div class="bg-white/95 dark:bg-gray-900/95 lg:col-span-7">
            <!-- En-tête mobile -->
            <div class="bg-gradient-to-r from-brand-blue-700 to-brand-blue-900 p-6 lg:hidden">
              <div class="mb-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">
                <font-awesome-icon :icon="['fas', 'shield-halved']" class="mr-1.5" />
                Réservé au personnel de l'Université Senghor
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-lg font-bold text-white">
                    Se connecter
                  </h1>
                  <p class="text-sm text-white/70">
                    Espace personnel
                  </p>
                </div>
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <!-- Formulaire -->
            <div class="p-8 lg:flex lg:min-h-full lg:flex-col lg:justify-center lg:p-12">
              <!-- Titre desktop -->
              <div class="mb-8 hidden lg:block">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Connexion
                </h2>
                <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  Accédez à votre espace d'administration
                </p>
              </div>

              <form class="space-y-5" @submit.prevent="handleLogin">
                <!-- Erreur -->
                <div v-if="error" class="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
                  {{ error }}
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    required
                    autocomplete="email"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                    placeholder="jean.dupont@usenghor.org"
                  >
                </div>

                <!-- Mot de passe -->
                <div>
                  <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe
                  </label>
                  <div class="relative">
                    <input
                      id="password"
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      autocomplete="current-password"
                      class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                      placeholder="Mot de passe"
                    >
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                      @click="showPassword = !showPassword"
                    >
                      <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <!-- Bouton connexion -->
                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full rounded-xl bg-brand-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition-all hover:bg-brand-blue-600 hover:shadow-xl hover:shadow-brand-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span v-if="loading" class="inline-flex items-center gap-2">
                    <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </span>
                  <span v-else class="inline-flex items-center gap-2">
                    Se connecter
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-3.5 w-3.5" />
                  </span>
                </button>

                <!-- Lien inscription (mobile) -->
                <p class="text-center text-sm text-gray-500 lg:hidden dark:text-gray-400">
                  Pas encore de compte ?
                  <NuxtLink to="/admin/register" class="font-medium text-brand-blue-600 hover:text-brand-blue-500 dark:text-brand-blue-400">
                    S'inscrire
                  </NuxtLink>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
