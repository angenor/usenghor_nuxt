<script setup lang="ts">
import type { EventRead } from '~/types/api'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const eventId = computed(() => route.params.id as string)

const {
  getEventById,
  deleteEvent,
  eventTypeLabels,
  eventStatusLabels,
} = useEventsApi()

const { getMediaUrlById } = useMediaApi()

// État
const event = ref<EventRead | null>(null)
const coverImageUrl = ref<string | null>(null)
const isLoading = ref(true)
const notFound = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)

// Charger l'événement
onMounted(async () => {
  try {
    event.value = await getEventById(eventId.value)

    // Charger l'image de couverture si elle existe
    if (event.value.cover_image_external_id) {
      coverImageUrl.value = await getMediaUrlById(event.value.cover_image_external_id)
    }
  } catch (e) {
    console.error('Error loading event:', e)
    notFound.value = true
  } finally {
    isLoading.value = false
  }
})

// Navigation
const goBack = () => {
  router.push('/admin/contenus/evenements')
}

const goToEdit = () => {
  router.push(`/admin/contenus/evenements/${eventId.value}/edit`)
}

// Suppression
const confirmDelete = async () => {
  if (!event.value) return

  isDeleting.value = true
  try {
    await deleteEvent(eventId.value)
    router.push('/admin/contenus/evenements')
  } catch (e) {
    console.error('Error deleting event:', e)
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
  }
}

// Formatage
const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatShortDate = (date: string | null | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Statut badge
const statusBadgeClass = computed(() => {
  if (!event.value) return ''
  switch (event.value.status) {
    case 'published':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'archived':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <font-awesome-icon icon="fa-solid fa-spinner" class="h-8 w-8 animate-spin text-blue-600" />
    </div>

    <!-- Not Found -->
    <div v-else-if="notFound" class="flex flex-col items-center justify-center py-12">
      <div class="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
        <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Événement introuvable</h2>
      <p class="mb-4 text-gray-500 dark:text-gray-400">L'événement demandé n'existe pas ou a été supprimé.</p>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        @click="goBack"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 w-4" />
        Retour à la liste
      </button>
    </div>

    <!-- Contenu -->
    <template v-else-if="event">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-4">
          <button
            class="mt-1 rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="goBack"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 w-4" />
          </button>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ event.title }}
              </h1>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="statusBadgeClass"
              >
                {{ eventStatusLabels[event.status] }}
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ eventTypeLabels[event.type] }}
              <span v-if="event.type === 'other' && event.type_other"> - {{ event.type_other }}</span>
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="goToEdit"
          >
            <font-awesome-icon icon="fa-solid fa-pen" class="h-4 w-4" />
            Modifier
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            @click="showDeleteModal = true"
          >
            <font-awesome-icon icon="fa-solid fa-trash" class="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </div>

      <!-- Image de couverture -->
      <div v-if="coverImageUrl" class="overflow-hidden rounded-lg">
        <img
          :src="coverImageUrl"
          :alt="event.title"
          class="h-64 w-full object-cover"
        />
      </div>

      <!-- Grille d'informations -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Colonne principale -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Description -->
          <div v-if="event.description" class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-align-left" class="h-5 w-5 text-gray-400" />
              Description
            </h2>
            <p class="whitespace-pre-wrap text-gray-600 dark:text-gray-300">{{ event.description }}</p>
          </div>

          <!-- Dates et horaires -->
          <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-calendar" class="h-5 w-5 text-blue-500" />
              Dates et horaires
            </h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Début</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(event.start_date) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Fin</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(event.end_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Lieu -->
          <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-map-marker-alt" class="h-5 w-5 text-red-500" />
              Lieu
            </h2>

            <div v-if="event.is_online" class="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <font-awesome-icon icon="fa-solid fa-video" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span class="font-medium text-blue-800 dark:text-blue-300">Événement en ligne</span>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div v-if="event.venue">
                <p class="text-sm text-gray-500 dark:text-gray-400">Lieu / Salle</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ event.venue }}</p>
              </div>
              <div v-if="event.address">
                <p class="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ event.address }}</p>
              </div>
              <div v-if="event.city">
                <p class="text-sm text-gray-500 dark:text-gray-400">Ville</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ event.city }}</p>
              </div>
              <div v-if="event.video_conference_link">
                <p class="text-sm text-gray-500 dark:text-gray-400">Lien visioconférence</p>
                <a
                  :href="event.video_conference_link"
                  target="_blank"
                  class="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Rejoindre
                  <font-awesome-icon icon="fa-solid fa-external-link-alt" class="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>

            <div v-if="!event.venue && !event.address && !event.city && !event.is_online" class="text-gray-500 dark:text-gray-400">
              Aucun lieu spécifié
            </div>
          </div>
        </div>

        <!-- Colonne latérale -->
        <div class="space-y-6">
          <!-- Inscriptions -->
          <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-user-plus" class="h-5 w-5 text-green-500" />
              Inscriptions
            </h2>

            <div v-if="event.registration_required" class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600 dark:text-gray-400">Inscrits</span>
                <span class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ event.registrations_count || 0 }}
                  <span v-if="event.max_attendees" class="text-sm font-normal text-gray-500">/ {{ event.max_attendees }}</span>
                </span>
              </div>

              <div v-if="event.max_attendees" class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="(event.registrations_count || 0) >= event.max_attendees ? 'bg-red-500' : 'bg-green-500'"
                  :style="{ width: `${Math.min(100, ((event.registrations_count || 0) / event.max_attendees) * 100)}%` }"
                ></div>
              </div>

              <NuxtLink
                :to="`/admin/contenus/inscriptions?event_id=${event.id}`"
                class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <font-awesome-icon icon="fa-solid fa-list" class="h-4 w-4" />
                Voir les inscriptions
              </NuxtLink>
            </div>

            <div v-else class="text-center text-gray-500 dark:text-gray-400">
              <font-awesome-icon icon="fa-solid fa-times-circle" class="mb-2 h-8 w-8" />
              <p>Inscription non requise</p>
            </div>
          </div>

          <!-- Métadonnées -->
          <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <font-awesome-icon icon="fa-solid fa-info-circle" class="h-5 w-5 text-gray-400" />
              Informations
            </h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Slug</span>
                <span class="font-mono text-gray-900 dark:text-white">{{ event.slug }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Créé le</span>
                <span class="text-gray-900 dark:text-white">{{ formatShortDate(event.created_at) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Modifié le</span>
                <span class="text-gray-900 dark:text-white">{{ formatShortDate(event.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de confirmation de suppression -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showDeleteModal = false"
      >
        <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Supprimer l'événement</h3>
          </div>

          <p class="mb-6 text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer <strong>{{ event?.title }}</strong> ?
            Cette action est irréversible.
          </p>

          <div class="flex justify-end gap-3">
            <button
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              :disabled="isDeleting"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="isDeleting"
              @click="confirmDelete"
            >
              <font-awesome-icon v-if="isDeleting" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
              <font-awesome-icon v-else icon="fa-solid fa-trash" class="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
