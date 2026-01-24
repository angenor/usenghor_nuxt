<script setup lang="ts">
import type { CampusAdmin } from '~/composables/useMockData'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const {
  getCampusByIdAdmin,
  getCampusPartnersById,
  getCampusUsage,
  getFlagEmoji
} = useMockData()

// Données
const campusId = computed(() => route.params.id as string)
const campus = computed(() => getCampusByIdAdmin(campusId.value))
const partners = computed(() => getCampusPartnersById(campusId.value))
const usage = computed(() => getCampusUsage(campusId.value))

// Navigation
const goBack = () => router.push('/admin/campus/liste')
const goToEdit = () => router.push(`/admin/campus/liste/${campusId.value}/edit`)

// Formatage
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Actions
const deleteCampus = async () => {
  if (!campus.value) return
  if (campus.value.is_headquarters) {
    alert('Impossible de supprimer le siège principal.')
    return
  }
  if (confirm(`Êtes-vous sûr de vouloir supprimer le campus "${campus.value.name}" ?`)) {
    console.log('Deleting campus:', campus.value.id)
    router.push('/admin/campus/liste')
  }
}

const toggleActive = async () => {
  if (!campus.value) return
  console.log('Toggle active:', campus.value.id, !campus.value.is_active)
}
</script>

<template>
  <div v-if="campus" class="space-y-6">
    <!-- En-tête -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-4">
        <button
          class="mt-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
          @click="goBack"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
        </button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ campus.name }}
            </h1>
            <span
              v-if="campus.is_headquarters"
              class="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            >
              <font-awesome-icon :icon="['fas', 'star']" class="h-3 w-3" />
              Siège
            </span>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <code class="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-700">{{ campus.code }}</code>
            <span
              :class="[
                'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                campus.is_active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              ]"
            >
              {{ campus.is_active ? 'Actif' : 'Inactif' }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="toggleActive"
        >
          <font-awesome-icon :icon="['fas', campus.is_active ? 'toggle-off' : 'toggle-on']" />
          {{ campus.is_active ? 'Désactiver' : 'Activer' }}
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          @click="goToEdit"
        >
          <font-awesome-icon :icon="['fas', 'edit']" />
          Modifier
        </button>
        <button
          v-if="!campus.is_headquarters"
          class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          @click="deleteCampus"
        >
          <font-awesome-icon :icon="['fas', 'trash']" />
          Supprimer
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Colonne principale -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Image de couverture -->
        <div v-if="campus.cover_image" class="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <img
            :src="campus.cover_image"
            :alt="campus.cover_image_alt || campus.name"
            class="h-64 w-full object-cover"
          />
        </div>

        <!-- Description -->
        <div v-if="campus.description" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'align-left']" class="h-5 w-5 text-gray-400" />
            Description
          </h2>
          <p class="whitespace-pre-line text-gray-600 dark:text-gray-300">{{ campus.description }}</p>
        </div>

        <!-- Carte de localisation -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="h-5 w-5 text-red-500" />
            Localisation
          </h2>
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span class="text-2xl">{{ getFlagEmoji(campus.country_code) }}</span>
              <span>{{ campus.city }}, {{ campus.country_name }}</span>
            </div>
            <div v-if="campus.address" class="text-gray-600 dark:text-gray-300">
              <font-awesome-icon :icon="['fas', 'map']" class="mr-2 text-gray-400" />
              {{ campus.address }}
              <span v-if="campus.postal_code">, {{ campus.postal_code }}</span>
            </div>
            <div v-if="campus.latitude && campus.longitude" class="text-sm text-gray-500">
              <font-awesome-icon :icon="['fas', 'globe']" class="mr-2" />
              Coordonnées: {{ campus.latitude.toFixed(4) }}, {{ campus.longitude.toFixed(4) }}
            </div>
            <!-- Placeholder pour la carte -->
            <div class="mt-4 flex h-48 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <div class="text-center text-gray-400">
                <font-awesome-icon :icon="['fas', 'map']" class="mb-2 text-4xl" />
                <p class="text-sm">Carte (intégration Google Maps/Leaflet)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Partenaires -->
        <div v-if="partners.length > 0" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'handshake']" class="h-5 w-5 text-purple-500" />
            Partenaires ({{ partners.length }})
          </h2>
          <div class="space-y-4">
            <div
              v-for="partner in partners"
              :key="partner.id"
              class="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <img
                v-if="partner.partner_logo"
                :src="partner.partner_logo"
                :alt="partner.partner_name"
                class="h-12 w-12 rounded object-contain"
              />
              <div v-else class="flex h-12 w-12 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                <font-awesome-icon :icon="['fas', 'building']" class="text-gray-400" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">{{ partner.partner_name }}</div>
                <div class="text-sm text-gray-500">
                  {{ partner.partner_type }}
                  <span v-if="partner.start_date"> - Depuis {{ formatDate(partner.start_date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Statistiques rapides -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'chart-bar']" class="h-5 w-5 text-blue-500" />
            Statistiques
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', 'graduation-cap']" class="h-4 w-4 text-purple-500" />
                Formations
              </span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ campus.programs_count }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', 'users']" class="h-4 w-4 text-blue-500" />
                Membres d'équipe
              </span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ campus.team_members_count }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', 'handshake']" class="h-4 w-4 text-orange-500" />
                Partenaires
              </span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ campus.partners_count }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <font-awesome-icon :icon="['fas', 'calendar-alt']" class="h-4 w-4 text-green-500" />
                Événements
              </span>
              <span class="font-semibold text-gray-900 dark:text-white">{{ usage.events }}</span>
            </div>
          </div>
        </div>

        <!-- Responsable -->
        <div v-if="campus.head_name" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'user-tie']" class="h-5 w-5 text-indigo-500" />
            Responsable
          </h2>
          <div class="flex items-center gap-4">
            <img
              v-if="campus.head_photo"
              :src="campus.head_photo"
              :alt="campus.head_name"
              class="h-16 w-16 rounded-full object-cover"
            />
            <div v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <font-awesome-icon :icon="['fas', 'user']" class="text-2xl text-gray-400" />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ campus.head_name }}</div>
              <div class="text-sm text-gray-500">Directeur / Responsable</div>
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'address-card']" class="h-5 w-5 text-teal-500" />
            Contact
          </h2>
          <dl class="space-y-3">
            <div v-if="campus.email">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd class="mt-1">
                <a :href="`mailto:${campus.email}`" class="text-blue-600 hover:underline">
                  {{ campus.email }}
                </a>
              </dd>
            </div>
            <div v-if="campus.phone">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</dt>
              <dd class="mt-1">
                <a :href="`tel:${campus.phone}`" class="text-blue-600 hover:underline">
                  {{ campus.phone }}
                </a>
              </dd>
            </div>
            <div v-if="!campus.email && !campus.phone" class="text-sm text-gray-400">
              Aucune information de contact
            </div>
          </dl>
        </div>

        <!-- Métadonnées -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'clock']" class="h-5 w-5 text-gray-400" />
            Métadonnées
          </h2>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="font-medium text-gray-500 dark:text-gray-400">Créé le</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ formatDateTime(campus.created_at) }}</dd>
            </div>
            <div>
              <dt class="font-medium text-gray-500 dark:text-gray-400">Modifié le</dt>
              <dd class="mt-1 text-gray-900 dark:text-white">{{ formatDateTime(campus.updated_at) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Liens rapides -->
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <font-awesome-icon :icon="['fas', 'link']" class="h-5 w-5 text-gray-400" />
            Accès rapides
          </h2>
          <div class="space-y-2">
            <NuxtLink
              :to="`/admin/campus/equipes?campus=${campus.id}`"
              class="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <font-awesome-icon :icon="['fas', 'users']" class="text-blue-500" />
              <span class="text-gray-700 dark:text-gray-300">Gérer l'équipe</span>
            </NuxtLink>
            <NuxtLink
              :to="`/admin/formations?campus=${campus.id}`"
              class="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-purple-500" />
              <span class="text-gray-700 dark:text-gray-300">Voir les formations</span>
            </NuxtLink>
            <NuxtLink
              :to="`/admin/contenus/evenements?campus=${campus.id}`"
              class="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-green-500" />
              <span class="text-gray-700 dark:text-gray-300">Voir les événements</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 404 - Campus non trouvé -->
  <div v-else class="flex flex-col items-center justify-center py-16">
    <font-awesome-icon :icon="['fas', 'university']" class="h-16 w-16 text-gray-300 dark:text-gray-600" />
    <h1 class="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Campus non trouvé</h1>
    <p class="mt-2 text-gray-500 dark:text-gray-400">
      Le campus demandé n'existe pas ou a été supprimé.
    </p>
    <NuxtLink
      to="/admin/campus/liste"
      class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-4 w-4" />
      Retour à la liste
    </NuxtLink>
  </div>
</template>
