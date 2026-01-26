<script setup lang="ts">
import type { EventType, EventUpdatePayload, PublicationStatus } from '~/types/api'
import type { OutputData } from '@editorjs/editorjs'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()

const eventId = computed(() => route.params.id as string)

const {
  getEventById,
  updateEvent,
  slugifyEvent,
  toDatetimeLocal,
  eventTypeLabels,
  eventStatusLabels,
} = useEventsApi()

const {
  campusExternalises,
  departments,
  getAllProjects,
} = useMockData()

// Contenu EditorJS (séparé du formulaire pour éviter les problèmes de réactivité)
const content = ref<OutputData | undefined>(undefined)
const contentEn = ref<OutputData | undefined>(undefined)
const contentAr = ref<OutputData | undefined>(undefined)

// Onglet actif
const activeTab = ref<'general' | 'datetime' | 'location' | 'registration' | 'associations' | 'options'>('general')

// État du formulaire - aligné sur le schéma backend
const form = ref({
  id: '',
  title: '',
  slug: '',
  type: 'conference' as EventType,
  type_other: '',
  description: '',
  cover_image_external_id: '',
  start_date: '',
  end_date: '',
  is_online: false,
  video_conference_link: '',
  venue: '',
  address: '',
  city: '',
  country_external_id: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  registration_required: false,
  registration_link: '',
  max_attendees: undefined as number | undefined,
  registrations_count: 0,
  campus_external_id: '',
  department_external_id: '',
  project_external_id: '',
  organizer_external_id: '',
  album_external_id: '',
  status: 'draft' as PublicationStatus,
  created_at: '',
  updated_at: ''
})

const isLoading = ref(true)
const notFound = ref(false)
const error = ref<string | null>(null)
const formInitialized = ref(false)

// Charger l'événement
onMounted(async () => {
  try {
    const event = await getEventById(eventId.value)

    // Mapper les données backend vers le formulaire
    form.value = {
      id: event.id,
      title: event.title,
      slug: event.slug,
      type: event.type,
      type_other: event.type_other || '',
      description: event.description || '',
      cover_image_external_id: event.cover_image_external_id || '',
      start_date: toDatetimeLocal(event.start_date),
      end_date: toDatetimeLocal(event.end_date),
      is_online: event.is_online,
      video_conference_link: event.video_conference_link || '',
      venue: event.venue || '',
      address: event.address || '',
      city: event.city || '',
      country_external_id: event.country_external_id || '',
      latitude: event.latitude ?? undefined,
      longitude: event.longitude ?? undefined,
      registration_required: event.registration_required,
      registration_link: event.registration_link || '',
      max_attendees: event.max_attendees ?? undefined,
      registrations_count: event.registrations_count || 0,
      campus_external_id: event.campus_external_id || '',
      department_external_id: event.department_external_id || '',
      project_external_id: event.project_external_id || '',
      organizer_external_id: event.organizer_external_id || '',
      album_external_id: event.album_external_id || '',
      status: event.status,
      created_at: event.created_at,
      updated_at: event.updated_at
    }

    // Parser le contenu EditorJS depuis JSON string
    if (event.content) {
      try {
        content.value = JSON.parse(event.content)
      } catch {
        content.value = undefined
      }
    }

    // Marquer le formulaire comme initialisé (après chargement des données)
    formInitialized.value = true
  } catch (e) {
    console.error('Error loading event:', e)
    notFound.value = true
  } finally {
    isLoading.value = false
  }
})

// Auto-génération du slug (seulement après initialisation et si non modifié manuellement)
const slugManuallyEdited = ref(false)
watch(() => form.value.title, (newTitle) => {
  // Ne pas auto-générer pendant le chargement initial
  if (!formInitialized.value) return
  // Auto-générer uniquement si non modifié manuellement
  if (newTitle && !slugManuallyEdited.value) {
    form.value.slug = slugifyEvent(newTitle)
  }
})

// Navigation
const goBack = () => {
  router.push('/admin/contenus/evenements')
}

// === LISTES DE RÉFÉRENCE ===
const campusList = computed(() => [
  { id: 'siege', name: 'Siège - Alexandrie' },
  ...campusExternalises.value.map(c => ({ id: c.id, name: c.name_fr }))
])

const departmentList = computed(() =>
  departments.value.map(d => ({ id: d.id, name: d.name_fr }))
)

const projectList = computed(() =>
  getAllProjects().map(p => ({ id: p.id, name: p.title_fr }))
)

// === SAUVEGARDE ===
const isSaving = ref(false)

// Vérifie si une chaîne est un UUID valide
const isValidUuid = (value: string | null | undefined): boolean => {
  if (!value) return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

// Retourne la valeur si c'est un UUID valide, sinon null
const toUuidOrNull = (value: string | null | undefined): string | null => {
  return isValidUuid(value) ? value! : null
}

const saveForm = async () => {
  isSaving.value = true
  error.value = null

  try {
    // Préparer les données pour l'API
    // Note: Les champs *_external_id doivent être des UUIDs valides ou null
    const eventData: EventUpdatePayload = {
      title: form.value.title,
      slug: form.value.slug,
      description: form.value.description || null,
      content: content.value ? JSON.stringify(content.value) : null,
      type: form.value.type,
      type_other: form.value.type === 'other' ? form.value.type_other : null,
      start_date: form.value.start_date ? new Date(form.value.start_date).toISOString() : undefined,
      end_date: form.value.end_date ? new Date(form.value.end_date).toISOString() : null,
      is_online: form.value.is_online,
      video_conference_link: form.value.video_conference_link || null,
      venue: form.value.venue || null,
      address: form.value.address || null,
      city: form.value.city || null,
      latitude: form.value.latitude ?? null,
      longitude: form.value.longitude ?? null,
      registration_required: form.value.registration_required,
      registration_link: form.value.registration_link || null,
      max_attendees: form.value.max_attendees ?? null,
      // Les champs external_id doivent être des UUIDs valides ou null
      cover_image_external_id: toUuidOrNull(form.value.cover_image_external_id),
      country_external_id: toUuidOrNull(form.value.country_external_id),
      campus_external_id: toUuidOrNull(form.value.campus_external_id),
      department_external_id: toUuidOrNull(form.value.department_external_id),
      project_external_id: toUuidOrNull(form.value.project_external_id),
      organizer_external_id: toUuidOrNull(form.value.organizer_external_id),
      album_external_id: toUuidOrNull(form.value.album_external_id),
      status: form.value.status,
    }

    await updateEvent(eventId.value, eventData)
    router.push('/admin/contenus/evenements')
  } catch (e) {
    console.error('Error updating event:', e)
    error.value = 'Erreur lors de la mise à jour de l\'événement'
  } finally {
    isSaving.value = false
  }
}

const saveDraft = async () => {
  form.value.status = 'draft'
  await saveForm()
}

const saveAndPublish = async () => {
  form.value.status = 'published'
  await saveForm()
}

// Onglets
const tabs = [
  { id: 'general', label: 'Informations', icon: 'fa-solid fa-info-circle' },
  { id: 'datetime', label: 'Dates', icon: 'fa-solid fa-calendar' },
  { id: 'location', label: 'Lieu', icon: 'fa-solid fa-map-marker-alt' },
  { id: 'registration', label: 'Inscriptions', icon: 'fa-solid fa-user-plus' },
  { id: 'associations', label: 'Associations', icon: 'fa-solid fa-link' },
  { id: 'options', label: 'Options', icon: 'fa-solid fa-cog' }
] as const
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

    <!-- Formulaire -->
    <template v-else>
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <button
            class="rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            @click="goBack"
          >
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="h-4 w-4" />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Modifier l'événement
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ form.title }}
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="isSaving"
            @click="saveDraft"
          >
            <font-awesome-icon icon="fa-solid fa-save" class="h-4 w-4" />
            Enregistrer
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            :disabled="isSaving"
            @click="saveAndPublish"
          >
            <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
            <font-awesome-icon v-else icon="fa-solid fa-globe" class="h-4 w-4" />
            Publier
          </button>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div
        v-if="error"
        class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      >
        <div class="flex items-center gap-2">
          <font-awesome-icon icon="fa-solid fa-circle-exclamation" class="h-4 w-4" />
          {{ error }}
        </div>
      </div>

      <!-- Info inscriptions -->
      <div v-if="form.registrations_count && form.registrations_count > 0" class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div class="flex items-center gap-3">
          <font-awesome-icon icon="fa-solid fa-users" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p class="font-medium text-blue-800 dark:text-blue-300">
              {{ form.registrations_count }} inscription(s) enregistrée(s)
            </p>
            <p class="text-sm text-blue-600 dark:text-blue-400">
              <NuxtLink to="/admin/contenus/inscriptions" class="hover:underline">
                Gérer les inscriptions
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="admin-scrollbar -mb-px flex gap-4 overflow-x-auto" data-lenis-prevent>
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors"
            :class="activeTab === tab.id
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
            @click="activeTab = tab.id"
          >
            <font-awesome-icon :icon="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Contenu des onglets -->
      <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <!-- Onglet: Informations générales -->
        <div v-show="activeTab === 'general'" class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Titre *
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="Ex: Conférence sur le développement durable"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug *
              </label>
              <input
                v-model="form.slug"
                type="text"
                required
                placeholder="conference-developpement-durable-2026"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @input="slugManuallyEdited = true"
              />
              <p class="mt-1 text-xs text-gray-500">Attention : modifier le slug peut casser les liens existants</p>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type *
              </label>
              <select
                v-model="form.type"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="conference">Conférence</option>
                <option value="workshop">Atelier</option>
                <option value="ceremony">Cérémonie</option>
                <option value="seminar">Séminaire</option>
                <option value="symposium">Colloque</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div v-if="form.type === 'other'">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type personnalisé
              </label>
              <input
                v-model="form.type_other"
                type="text"
                placeholder="Ex: Forum, Hackathon..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description courte
              </label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Brève description de l'événement..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image de couverture (ID)
              </label>
              <input
                v-model="form.cover_image_external_id"
                type="text"
                placeholder="ID de l'image dans la médiathèque"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500">En production: sélection via la médiathèque</p>
            </div>
          </div>
        </div>

        <!-- Onglet: Dates -->
        <div v-show="activeTab === 'datetime'" class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date et heure de début *
              </label>
              <input
                v-model="form.start_date"
                type="datetime-local"
                required
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date et heure de fin
              </label>
              <input
                v-model="form.end_date"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Onglet: Lieu -->
        <div v-show="activeTab === 'location'" class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="flex items-center gap-3">
                <input
                  v-model="form.is_online"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Événement en ligne</span>
                  <p class="text-sm text-gray-500 dark:text-gray-400">L'événement se déroule en visioconférence</p>
                </div>
              </label>
            </div>

            <div v-if="form.is_online" class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lien de visioconférence
              </label>
              <input
                v-model="form.video_conference_link"
                type="url"
                placeholder="https://zoom.us/j/... ou https://meet.google.com/..."
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lieu / Salle
              </label>
              <input
                v-model="form.venue"
                type="text"
                placeholder="Ex: Amphithéâtre Léopold Sédar Senghor"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse
              </label>
              <input
                v-model="form.address"
                type="text"
                placeholder="Ex: 1 Place Ahmed Orabi"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ville
              </label>
              <input
                v-model="form.city"
                type="text"
                placeholder="Ex: Alexandrie"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pays (ID)
              </label>
              <input
                v-model="form.country_external_id"
                type="text"
                placeholder="ID du pays"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Latitude
              </label>
              <input
                v-model.number="form.latitude"
                type="number"
                step="0.0001"
                placeholder="Ex: 31.2001"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Longitude
              </label>
              <input
                v-model.number="form.longitude"
                type="number"
                step="0.0001"
                placeholder="Ex: 29.9187"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Onglet: Inscriptions -->
        <div v-show="activeTab === 'registration'" class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="flex items-center gap-3">
                <input
                  v-model="form.registration_required"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span class="font-medium text-gray-700 dark:text-gray-300">Inscription requise</span>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Les participants doivent s'inscrire pour participer</p>
                </div>
              </label>
            </div>

            <div v-if="form.registration_required">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre maximum de participants
              </label>
              <input
                v-model.number="form.max_attendees"
                type="number"
                min="1"
                placeholder="Ex: 200"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div v-if="form.registration_required">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lien d'inscription externe
              </label>
              <input
                v-model="form.registration_link"
                type="url"
                placeholder="https://... (laisser vide pour inscription interne)"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500">Laisser vide pour utiliser le système d'inscription interne</p>
            </div>

            <!-- Statistiques inscriptions -->
            <div v-if="form.registration_required && form.registrations_count" class="sm:col-span-2">
              <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h4 class="mb-2 font-medium text-gray-900 dark:text-white">Statistiques d'inscription</h4>
                <div class="flex items-center gap-4">
                  <div>
                    <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ form.registrations_count }}</span>
                    <span v-if="form.max_attendees" class="text-gray-500"> / {{ form.max_attendees }}</span>
                  </div>
                  <div v-if="form.max_attendees" class="flex-1">
                    <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                      <div
                        class="h-2 rounded-full bg-blue-600"
                        :style="{ width: `${Math.min(100, (form.registrations_count / form.max_attendees) * 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglet: Associations -->
        <div v-show="activeTab === 'associations'" class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Campus
              </label>
              <select
                v-model="form.campus_external_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucun campus</option>
                <option v-for="campus in campusList" :key="campus.id" :value="campus.id">
                  {{ campus.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Département
              </label>
              <select
                v-model="form.department_external_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucun département</option>
                <option v-for="dept in departmentList" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Projet lié
              </label>
              <select
                v-model="form.project_external_id"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Aucun projet</option>
                <option v-for="project in projectList" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organisateur (ID)
              </label>
              <input
                v-model="form.organizer_external_id"
                type="text"
                placeholder="ID de l'organisateur"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500">En production: sélecteur d'utilisateur</p>
            </div>
          </div>
        </div>

        <!-- Onglet: Options -->
        <div v-show="activeTab === 'options'" class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut de publication
              </label>
              <select
                v-model="form.status"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Album photos (ID)
              </label>
              <input
                v-model="form.album_external_id"
                type="text"
                placeholder="ID de l'album"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p class="mt-1 text-xs text-gray-500">En production: sélecteur d'album</p>
            </div>

            <!-- Métadonnées -->
            <div class="sm:col-span-2">
              <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h4 class="mb-2 font-medium text-gray-900 dark:text-white">Métadonnées</h4>
                <div class="grid gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                  <div>
                    <span class="text-gray-500">ID:</span> {{ form.id }}
                  </div>
                  <div v-if="form.created_at">
                    <span class="text-gray-500">Créé le:</span> {{ new Date(form.created_at).toLocaleString('fr-FR') }}
                  </div>
                  <div v-if="form.updated_at">
                    <span class="text-gray-500">Modifié le:</span> {{ new Date(form.updated_at).toLocaleString('fr-FR') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu détaillé -->
      <AdminRichTextEditor
        v-model="content"
        v-model:model-value-en="contentEn"
        v-model:model-value-ar="contentAr"
        title="Contenu détaillé"
        description="Rédigez le contenu complet de l'événement : programme, intervenants, informations pratiques..."
        icon="fa-solid fa-file-lines"
        icon-color="text-indigo-500"
        placeholder="Décrivez en détail l'événement..."
        placeholder-en="Describe the event in detail..."
        placeholder-ar="صف الحدث بالتفصيل..."
        :min-height="400"
      />

      <!-- Footer actions -->
      <div class="sticky bottom-0 -mx-4 -mb-4 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900 sm:-mx-6 sm:px-6">
        <div class="flex justify-end gap-3">
          <button
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            @click="goBack"
          >
            Annuler
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            :disabled="isSaving"
            @click="saveDraft"
          >
            <font-awesome-icon icon="fa-solid fa-save" class="h-4 w-4" />
            Enregistrer
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            :disabled="isSaving"
            @click="saveAndPublish"
          >
            <font-awesome-icon v-if="isSaving" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
            <font-awesome-icon v-else icon="fa-solid fa-globe" class="h-4 w-4" />
            Publier
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
