<script setup lang="ts">
import type { PeiDashboardStats } from '~/types/api/entrepreneurship'

definePageMeta({
  layout: 'admin',
})

const { getDashboard, translateMissing } = useEntrepreneurshipApi()
const { hasPermission } = usePermissions()

const stats = ref<PeiDashboardStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Nombre maximal d'appels successifs (chaque appel dure au plus ~50 s côté serveur)
const MAX_TRANSLATE_ROUNDS = 10

const translating = ref(false)
const translateMessage = ref<string | null>(null)
const translateError = ref<string | null>(null)

const canEdit = computed(() => hasPermission('entrepreneurship.edit'))

async function loadDashboard() {
  loading.value = true
  error.value = null
  try {
    stats.value = await getDashboard()
  }
  catch (e) {
    console.error('Erreur lors du chargement du tableau de bord PEI :', e)
    error.value = 'Impossible de charger le tableau de bord du pôle PEI.'
  }
  finally {
    loading.value = false
  }
}

onMounted(loadDashboard)

const ddeServiceId = computed(() => stats.value?.dde_service.id ?? null)

// Accord singulier / pluriel (0 et 1 au singulier, usage français)
function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count > 1 ? pluralForm : singular}`
}

async function handleTranslateMissing() {
  if (translating.value) return
  translating.value = true
  translateMessage.value = null
  translateError.value = null
  try {
    // Le serveur borne chaque appel dans le temps : on relance tant que le
    // parcours n'est pas complet, en cumulant les compteurs.
    const total = { programs: 0, cohorts: 0, resources: 0, laureates: 0 }
    let complete = false
    for (let round = 1; round <= MAX_TRANSLATE_ROUNDS && !complete; round++) {
      const result = await translateMissing()
      total.programs += result.programs
      total.cohorts += result.cohorts
      total.resources += result.resources
      total.laureates += result.laureates ?? 0
      complete = result.complete
      // Passe incomplète sans aucun élément complété : traducteur indisponible
      // (quota, réseau) — inutile d'insister.
      if (!complete && result.programs + result.cohorts + result.resources + (result.laureates ?? 0) === 0) {
        break
      }
      if (!complete) {
        translateMessage.value = `Traduction en cours (passe ${round})…`
      }
    }
    const parts = [
      plural(total.programs, 'dispositif', 'dispositifs'),
      plural(total.cohorts, 'cohorte', 'cohortes'),
      plural(total.resources, 'ressource', 'ressources'),
      plural(total.laureates, 'lauréat', 'lauréats'),
    ]
    translateMessage.value = complete
      ? `Traductions complétées : ${parts.join(', ')}.`
      : `Traduction partielle (${parts.join(', ')}) : le service de traduction est lent ou indisponible, relancez l'action plus tard.`
    await loadDashboard()
  }
  catch (e) {
    console.error('Erreur lors de la traduction des champs manquants :', e)
    translateError.value = 'La traduction des champs manquants a échoué. Veuillez réessayer.'
  }
  finally {
    translating.value = false
  }
}

interface Shortcut {
  id: string
  label: string
  icon: string
  to: string
  convention: string
}

const shortcuts = computed<Shortcut[]>(() => [
  {
    id: 'news',
    label: 'Actualités de la DDE',
    icon: 'fa-solid fa-newspaper',
    to: '/admin/contenus/actualites',
    convention: 'Rattacher l\'actualité au service DDE',
  },
  {
    id: 'events',
    label: 'Événements de la DDE',
    icon: 'fa-solid fa-calendar-days',
    to: '/admin/contenus/evenements',
    convention: 'Renseigner le service DDE sur l\'événement',
  },
  {
    id: 'albums',
    label: 'Albums de la DDE',
    icon: 'fa-solid fa-images',
    to: ddeServiceId.value
      ? `/admin/organisation/services?service_id=${ddeServiceId.value}`
      : '/admin/organisation/services',
    convention: 'Lier les albums depuis la fenêtre de modification du service DDE',
  },
  {
    id: 'partners',
    label: 'Partenaires (fiches)',
    icon: 'fa-solid fa-handshake',
    to: '/admin/partenaires',
    convention: 'Créer ou modifier un partenaire ici, puis le rattacher dans « Partenaires du pôle »',
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: 'fa-solid fa-circle-question',
    to: '/admin/faq',
    convention: 'Catégorie « see » pour les questions du statut',
  },
  {
    id: 'calls',
    label: 'Appels à candidatures',
    icon: 'fa-solid fa-bullhorn',
    to: '/admin/candidatures/appels',
    convention: 'Appel de type Formation ; slug à reporter dans la page Entrepreneuriat',
  },
  {
    id: 'editorial',
    label: 'Page éditoriale « Entrepreneuriat »',
    icon: 'fa-solid fa-pen-to-square',
    to: '/admin/editorial/valeurs',
    convention: 'Textes, chiffres clés, images du slider, e-mail de contact, service DDE',
  },
])
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Pôle Entrepreneuriat et Innovation (PEI)
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Direction du Développement et de l'Entrepreneuriat — secteur Rectorat
      </p>
    </div>

    <!-- Erreur de chargement -->
    <div
      v-if="error"
      class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-5 w-5 text-red-600 dark:text-red-400" />
      <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
      <button
        type="button"
        class="ms-auto text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
        @click="loadDashboard"
      >
        Réessayer
      </button>
    </div>

    <!-- Service DDE -->
    <template v-if="stats">
      <div
        v-if="!stats.dde_service.id"
        class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
      >
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
        <p class="text-sm text-amber-800 dark:text-amber-300">
          Le service DDE n'est pas identifié : renseignez la clé « Service DDE » dans la page Entrepreneuriat
          (<NuxtLink to="/admin/editorial/valeurs" class="font-medium underline hover:no-underline">Valeurs</NuxtLink>).
        </p>
      </div>
      <p v-else class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <font-awesome-icon icon="fa-solid fa-building" class="h-4 w-4 text-gray-400" />
        Service DDE : <span class="font-medium text-gray-900 dark:text-white">{{ stats.dde_service.name }}</span>
      </p>
    </template>

    <!-- Compteurs -->
    <EntrepreneurshipAdminDashboardCards :stats="stats" :loading="loading" />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Géré ailleurs -->
      <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
        <div class="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Géré ailleurs</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ces contenus du pôle sont administrés dans leurs modules respectifs, en suivant la convention indiquée.
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-900/40">
              <tr>
                <th class="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Raccourci
                </th>
                <th class="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Rappel de convention
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="shortcut in shortcuts" :key="shortcut.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td class="whitespace-nowrap px-6 py-3">
                  <NuxtLink
                    :to="shortcut.to"
                    class="inline-flex items-center gap-2 text-sm font-medium text-brand-blue-600 hover:text-brand-blue-700 dark:text-brand-blue-400 dark:hover:text-brand-blue-300"
                  >
                    <font-awesome-icon :icon="shortcut.icon" class="h-4 w-4" />
                    {{ shortcut.label }}
                  </NuxtLink>
                </td>
                <td class="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {{ shortcut.convention }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Traductions -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
            <font-awesome-icon icon="fa-solid fa-language" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Traductions</h2>
        </div>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Complète automatiquement les champs anglais et arabe vides des dispositifs, cohortes, ressources et portraits à partir du français. Les traductions existantes ne sont pas modifiées.
        </p>

        <button
          v-if="canEdit"
          type="button"
          :disabled="translating"
          class="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          @click="handleTranslateMissing"
        >
          <font-awesome-icon
            :icon="translating ? 'fa-solid fa-spinner' : 'fa-solid fa-language'"
            :class="['h-4 w-4', { 'animate-spin': translating }]"
          />
          {{ translating ? 'Traduction en cours…' : 'Traduire les champs manquants' }}
        </button>
        <p v-else class="mt-4 text-sm italic text-gray-400 dark:text-gray-500">
          La permission « entrepreneurship.edit » est requise pour lancer la traduction.
        </p>

        <p
          v-if="translateMessage"
          class="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300"
        >
          <font-awesome-icon icon="fa-solid fa-circle-check" class="mt-0.5 h-4 w-4" />
          {{ translateMessage }}
        </p>
        <p
          v-if="translateError"
          class="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"
        >
          <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="mt-0.5 h-4 w-4" />
          {{ translateError }}
        </p>
      </div>
    </div>
  </div>
</template>
