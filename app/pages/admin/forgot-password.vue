<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    submitted.value = true
  }
  catch (e: unknown) {
    const fetchError = e as { data?: { detail?: string } }
    error.value = fetchError?.data?.detail || 'Une erreur est survenue. Veuillez réessayer.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-brand-blue-950">
    <!-- Image de fond floutée -->
    <img
      src="/images/bg/background_login_admin.jpg"
      alt=""
      class="pointer-events-none absolute inset-0 h-full w-full object-cover blur-[2px] scale-[1.01]"
    >
    <div class="pointer-events-none absolute inset-0 bg-brand-blue-900/60" />

    <!-- Conteneur principal -->
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4 lg:p-8">
      <div class="w-full max-w-md">
        <div class="overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl dark:bg-gray-900/95">
          <div class="p-8 lg:p-10">
            <!-- Titre -->
            <div class="mb-8 text-center">
              <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-100 dark:bg-brand-blue-900/30">
                <font-awesome-icon :icon="['fas', 'envelope']" class="h-6 w-6 text-brand-blue-600 dark:text-brand-blue-400" />
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Mot de passe oublié
              </h2>
              <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Saisissez votre adresse email pour recevoir un lien de réinitialisation
              </p>
            </div>

            <!-- Message de succès -->
            <div v-if="submitted" class="space-y-4">
              <div class="rounded-xl bg-green-50/80 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <font-awesome-icon :icon="['fas', 'check-circle']" class="mr-2" />
                Si un compte existe avec cette adresse email, un lien de réinitialisation a été envoyé.
                Vérifiez votre boîte de réception.
              </div>
              <p class="text-center text-sm text-gray-500 dark:text-gray-400">
                Vous n'avez pas reçu l'email ?
                <button
                  class="font-medium text-brand-blue-600 hover:text-brand-blue-500 dark:text-brand-blue-400"
                  @click="submitted = false"
                >
                  Réessayer
                </button>
              </p>
              <NuxtLink
                to="/admin/login"
                class="block text-center text-sm font-medium text-brand-blue-600 hover:text-brand-blue-500 dark:text-brand-blue-400"
              >
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-1.5 h-3 w-3" />
                Retour à la connexion
              </NuxtLink>
            </div>

            <!-- Formulaire -->
            <form v-else class="space-y-5" @submit.prevent="handleSubmit">
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

              <!-- Bouton -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full rounded-xl bg-brand-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition-all hover:bg-brand-blue-600 hover:shadow-xl hover:shadow-brand-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span v-if="loading" class="inline-flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </span>
                <span v-else>
                  Envoyer le lien de réinitialisation
                </span>
              </button>

              <!-- Retour connexion -->
              <NuxtLink
                to="/admin/login"
                class="block text-center text-sm font-medium text-brand-blue-600 hover:text-brand-blue-500 dark:text-brand-blue-400"
              >
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-1.5 h-3 w-3" />
                Retour à la connexion
              </NuxtLink>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
