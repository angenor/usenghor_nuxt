<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const { createSubscriber } = useSubscribersApi()

// === STATE ===
const isSaving = ref(false)
const emailError = ref('')

// Form state
const form = ref({
  email: '',
  first_name: '',
  last_name: '',
  active: true
})

// === COMPUTED ===

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validation du formulaire
const isFormValid = computed(() => {
  return form.value.email.trim() &&
    emailRegex.test(form.value.email) &&
    !emailError.value
})

// === METHODS ===

// Valider l'email
const checkEmail = () => {
  emailError.value = ''
  const email = form.value.email.trim()

  if (!email) {
    return
  }

  if (!emailRegex.test(email)) {
    emailError.value = 'Format d\'email invalide'
    return
  }
}

// Sauvegarder
const saveForm = async () => {
  if (!isFormValid.value) return

  isSaving.value = true
  try {
    await createSubscriber({
      email: form.value.email.trim().toLowerCase(),
      first_name: form.value.first_name.trim() || undefined,
      last_name: form.value.last_name.trim() || undefined,
      source: 'manual',
    })
    router.push('/admin/newsletter/abonnes')
  } catch (error) {
    const fetchError = error as { status?: number }
    if (fetchError.status === 409 || fetchError.status === 400) {
      emailError.value = 'Cet email est déjà inscrit'
    } else {
      emailError.value = 'Erreur lors de la création'
    }
  } finally {
    isSaving.value = false
  }
}

// Annuler
const goBack = () => {
  router.back()
}

// Watch email pour validation
watch(() => form.value.email, () => {
  if (emailError.value) {
    checkEmail()
  }
})
</script>

<template>
  <div class="mx-auto max-w-2xl p-6">
    <!-- Header -->
    <div class="mb-6">
      <button
        class="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        @click="goBack"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
        Retour à la liste
      </button>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Ajouter un abonné
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Ajoutez manuellement un abonné à la newsletter
      </p>
    </div>

    <!-- Formulaire -->
    <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div class="space-y-6">
        <!-- Email -->
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Adresse email *
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="exemple@email.com"
            class="w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:bg-gray-700 dark:text-white"
            :class="emailError
              ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20'
              : 'border-gray-300 bg-white dark:border-gray-600'"
            required
            @blur="checkEmail"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ emailError }}
          </p>
        </div>

        <!-- Nom et prénom -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Prénom
            </label>
            <input
              v-model="form.first_name"
              type="text"
              placeholder="Jean"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom
            </label>
            <input
              v-model="form.last_name"
              type="text"
              placeholder="Dupont"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Actif -->
        <div class="flex items-center gap-3">
          <input
            id="active"
            v-model="form.active"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 bg-white text-brand-red-600 focus:ring-brand-red-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label for="active" class="text-sm text-gray-700 dark:text-gray-300">
            Abonné actif (recevra les newsletters)
          </label>
        </div>

        <!-- Info source -->
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <div class="flex items-start gap-2">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p class="text-sm text-blue-700 dark:text-blue-300">
              La source sera automatiquement définie comme "Ajout manuel" pour cet abonné.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        :disabled="isSaving"
        @click="goBack"
      >
        Annuler
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!isFormValid || isSaving"
        @click="saveForm"
      >
        <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="h-4 w-4 animate-spin" />
        <font-awesome-icon v-else :icon="['fas', 'plus']" class="h-4 w-4" />
        Ajouter l'abonné
      </button>
    </div>
  </div>
</template>
