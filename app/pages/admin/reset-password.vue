<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()

const token = computed(() => route.query.token as string || '')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

// État de la vérification du token
const tokenStatus = ref<'loading' | 'valid' | 'expired' | 'used' | 'invalid'>('loading')
const userFirstName = ref('')

// Validation locale
const passwordsMatch = computed(() => newPassword.value === confirmPassword.value)
const passwordValid = computed(() => newPassword.value.length >= 8)

// Vérifier le token au chargement
onMounted(async () => {
  if (!token.value) {
    tokenStatus.value = 'invalid'
    return
  }

  try {
    const data = await $fetch<{ valid: boolean, user_first_name?: string, reason?: string }>('/api/auth/verify-reset-token', {
      params: { token: token.value },
    })
    if (data.valid) {
      tokenStatus.value = 'valid'
      userFirstName.value = data.user_first_name || ''
    }
    else {
      tokenStatus.value = (data.reason as 'expired' | 'used' | 'invalid') || 'invalid'
    }
  }
  catch {
    tokenStatus.value = 'invalid'
  }
})

async function handleSubmit() {
  if (!passwordValid.value || !passwordsMatch.value)
    return

  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        new_password: newPassword.value,
      },
    })
    success.value = true
    // Rediriger vers login après 3 secondes
    setTimeout(() => {
      router.push('/admin/login')
    }, 3000)
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
            <!-- Chargement -->
            <div v-if="tokenStatus === 'loading'" class="text-center">
              <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-brand-blue-500" />
              <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Vérification du lien...
              </p>
            </div>

            <!-- Token invalide -->
            <div v-else-if="tokenStatus === 'invalid'" class="space-y-4 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                <font-awesome-icon :icon="['fas', 'xmark']" class="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Lien invalide
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Ce lien de réinitialisation n'est pas valide. Il est possible qu'il ait été mal copié.
              </p>
              <NuxtLink
                to="/admin/forgot-password"
                class="inline-block rounded-xl bg-brand-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-blue-600"
              >
                Demander un nouveau lien
              </NuxtLink>
            </div>

            <!-- Token expiré -->
            <div v-else-if="tokenStatus === 'expired'" class="space-y-4 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <font-awesome-icon :icon="['fas', 'clock']" class="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Lien expiré
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Ce lien de réinitialisation a expiré. Les liens sont valables pendant 1 heure.
              </p>
              <NuxtLink
                to="/admin/forgot-password"
                class="inline-block rounded-xl bg-brand-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-blue-600"
              >
                Demander un nouveau lien
              </NuxtLink>
            </div>

            <!-- Token déjà utilisé -->
            <div v-else-if="tokenStatus === 'used'" class="space-y-4 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <font-awesome-icon :icon="['fas', 'check-double']" class="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Lien déjà utilisé
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Ce lien de réinitialisation a déjà été utilisé. Chaque lien ne peut être utilisé qu'une seule fois.
              </p>
              <NuxtLink
                to="/admin/forgot-password"
                class="inline-block rounded-xl bg-brand-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-blue-600"
              >
                Demander un nouveau lien
              </NuxtLink>
            </div>

            <!-- Succès -->
            <div v-else-if="success" class="space-y-4 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
                <font-awesome-icon :icon="['fas', 'check']" class="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                Mot de passe réinitialisé
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion...
              </p>
              <NuxtLink
                to="/admin/login"
                class="inline-block text-sm font-medium text-brand-blue-600 hover:text-brand-blue-500 dark:text-brand-blue-400"
              >
                Se connecter maintenant
              </NuxtLink>
            </div>

            <!-- Formulaire nouveau mot de passe -->
            <div v-else-if="tokenStatus === 'valid'">
              <div class="mb-8 text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-100 dark:bg-brand-blue-900/30">
                  <font-awesome-icon :icon="['fas', 'lock']" class="h-6 w-6 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Nouveau mot de passe
                </h2>
                <p v-if="userFirstName" class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  Bonjour {{ userFirstName }}, choisissez votre nouveau mot de passe
                </p>
              </div>

              <form class="space-y-5" @submit.prevent="handleSubmit">
                <!-- Erreur -->
                <div v-if="error" class="rounded-xl bg-red-50/80 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
                  {{ error }}
                </div>

                <!-- Nouveau mot de passe -->
                <div>
                  <label for="new-password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nouveau mot de passe
                  </label>
                  <div class="relative">
                    <input
                      id="new-password"
                      v-model="newPassword"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      minlength="8"
                      autocomplete="new-password"
                      class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                      placeholder="Minimum 8 caractères"
                    >
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
                      @click="showPassword = !showPassword"
                    >
                      <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" class="h-4 w-4" />
                    </button>
                  </div>
                  <p v-if="newPassword && !passwordValid" class="mt-1 text-xs text-red-500">
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                </div>

                <!-- Confirmation -->
                <div>
                  <label for="confirm-password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm-password"
                    v-model="confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    minlength="8"
                    autocomplete="new-password"
                    class="w-full rounded-xl border border-gray-200/80 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none backdrop-blur-sm transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-white"
                    placeholder="Confirmez votre mot de passe"
                  >
                  <p v-if="confirmPassword && !passwordsMatch" class="mt-1 text-xs text-red-500">
                    Les mots de passe ne correspondent pas
                  </p>
                </div>

                <!-- Bouton -->
                <button
                  type="submit"
                  :disabled="loading || !passwordValid || !passwordsMatch"
                  class="w-full rounded-xl bg-brand-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition-all hover:bg-brand-blue-600 hover:shadow-xl hover:shadow-brand-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span v-if="loading" class="inline-flex items-center gap-2">
                    <font-awesome-icon :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
                    Réinitialisation en cours...
                  </span>
                  <span v-else>
                    Réinitialiser le mot de passe
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
