<script setup lang="ts">
import type { NewsletterSubscriber } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const route = useRoute()

const {
  getSubscriberById,
  sourceLabels,
  sourceColors
} = useMockData()

// === STATE ===
const isLoading = ref(true)
const isSaving = ref(false)
const notFound = ref(false)
const subscriber = ref<NewsletterSubscriber | null>(null)

// Form state
const form = ref({
  first_name: '',
  last_name: '',
  active: true
})

// Charger les données
onMounted(() => {
  const subscriberId = route.params.id as string
  const foundSubscriber = getSubscriberById(subscriberId)

  if (foundSubscriber) {
    subscriber.value = foundSubscriber
    form.value = {
      first_name: foundSubscriber.first_name || '',
      last_name: foundSubscriber.last_name || '',
      active: foundSubscriber.active
    }
  } else {
    notFound.value = true
  }

  isLoading.value = false
})

// === COMPUTED ===

// Nom complet
const fullName = computed(() => {
  if (!subscriber.value) return ''
  if (subscriber.value.first_name && subscriber.value.last_name) {
    return `${subscriber.value.first_name} ${subscriber.value.last_name}`
  }
  return subscriber.value.first_name || subscriber.value.last_name || subscriber.value.email
})

// Validation (email non modifiable, donc toujours valide si le subscriber existe)
const isFormValid = computed(() => {
  return subscriber.value !== null
})

// === METHODS ===

// Sauvegarder
const saveForm = async () => {
  if (!isFormValid.value || !subscriber.value) return

  isSaving.value = true
  try {
    const updatedSubscriber = {
      ...subscriber.value,
      first_name: form.value.first_name.trim() || null,
      last_name: form.value.last_name.trim() || null,
      active: form.value.active,
      unsubscribed_at: !form.value.active && subscriber.value.active
        ? new Date().toISOString()
        : subscriber.value.unsubscribed_at
    }

    console.log('Mise à jour de l\'abonné:', updatedSubscriber)
    // En production: PUT /api/admin/newsletter/subscribers/{id}

    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/admin/newsletter/abonnes')
  } finally {
    isSaving.value = false
  }
}

// Annuler
const goBack = () => {
  router.back()
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="mx-auto max-w-2xl p-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="py-12 text-center">
      <font-awesome-icon :icon="['fas', 'user-slash']" class="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <h2 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Abonné non trouvé</h2>
      <p class="mb-4 text-gray-500 dark:text-gray-400">Cet abonné n'existe pas ou a été supprimé.</p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-red-700"
        @click="router.push('/admin/newsletter/abonnes')"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
        Retour à la liste
      </button>
    </div>

    <!-- Formulaire -->
    <template v-else-if="subscriber">
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
          Modifier l'abonné
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Modification des informations de {{ fullName }}
        </p>
      </div>

      <!-- Info abonné (non modifiable) -->
      <div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Informations de l'abonné
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500 dark:text-gray-400">Email</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ subscriber.email }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500 dark:text-gray-400">Source</span>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="sourceColors[subscriber.source]"
            >
              {{ sourceLabels[subscriber.source] }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500 dark:text-gray-400">Inscrit le</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(subscriber.subscribed_at) }}</span>
          </div>
          <div v-if="subscriber.unsubscribed_at" class="flex items-center justify-between">
            <span class="text-sm text-gray-500 dark:text-gray-400">Désabonné le</span>
            <span class="text-sm text-gray-900 dark:text-white">{{ formatDate(subscriber.unsubscribed_at) }}</span>
          </div>
          <div v-if="subscriber.user_external_id" class="flex items-center justify-between">
            <span class="text-sm text-gray-500 dark:text-gray-400">Utilisateur lié</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <font-awesome-icon :icon="['fas', 'link']" class="h-3 w-3" />
              {{ subscriber.user_external_id }}
            </span>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div class="space-y-6">
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

          <!-- Avertissement si désabonnement -->
          <div
            v-if="!form.active && subscriber.active"
            class="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20"
          >
            <div class="flex items-start gap-2">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="mt-0.5 h-4 w-4 text-orange-600 dark:text-orange-400" />
              <p class="text-sm text-orange-700 dark:text-orange-300">
                En désactivant cet abonné, il ne recevra plus les newsletters. La date de désabonnement sera enregistrée.
              </p>
            </div>
          </div>

          <!-- Avertissement si réabonnement -->
          <div
            v-if="form.active && !subscriber.active"
            class="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
          >
            <div class="flex items-start gap-2">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
              <p class="text-sm text-green-700 dark:text-green-300">
                Cet abonné sera réactivé et recevra à nouveau les newsletters.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Métadonnées -->
      <div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500 dark:text-gray-400">ID:</span>
            <code class="ml-2 rounded bg-gray-200 px-1 text-xs dark:bg-gray-700">{{ subscriber.id }}</code>
          </div>
          <div>
            <span class="text-gray-500 dark:text-gray-400">Token:</span>
            <code class="ml-2 rounded bg-gray-200 px-1 text-xs dark:bg-gray-700">{{ subscriber.unsubscribe_token.substring(0, 20) }}...</code>
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
          <font-awesome-icon v-else :icon="['fas', 'save']" class="h-4 w-4" />
          Enregistrer
        </button>
      </div>
    </template>
  </div>
</template>
